import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type NotificationRow = {
  id: string;
  user_id: string;
  title: string;
  body: string | null;
  href: string | null;
  read_at: string | null;
  created_at: string;
};

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.max(1, Math.floor(diff / 1000));
  if (s < 60) return `${s}d lalu`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}j lalu`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}h lalu`;
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

async function fetchNotifications(): Promise<NotificationRow[]> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) return [];
  const { data, error } = await supabase
    .from("notifications" as never)
    .select("*")
    .eq("user_id", u.user.id)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data ?? []) as NotificationRow[];
}

export function NotificationsBell() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });

  const unread = notifications.filter((n) => !n.read_at);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  // Realtime subscription per-user
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  // Click-outside + Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function markOneRead(id: string) {
    const { error } = await supabase
      .from("notifications" as never)
      .update({ read_at: new Date().toISOString() } as never)
      .eq("id", id);
    if (error) {
      toast.error("Gagal menandai notifikasi");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }

  async function markAllRead() {
    if (!userId || unread.length === 0) return;
    const { error } = await supabase
      .from("notifications" as never)
      .update({ read_at: new Date().toISOString() } as never)
      .eq("user_id", userId)
      .is("read_at", null);
    if (error) {
      toast.error("Gagal menandai semua");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
    toast.success("Semua notifikasi ditandai dibaca");
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifikasi"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
      >
        <Bell className="h-4 w-4" />
        {unread.length > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-electric px-1 text-[10px] font-bold leading-none text-electric-foreground">
            {unread.length > 9 ? "9+" : unread.length}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifikasi"
          className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-surface shadow-elevated sm:w-96"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Notifikasi</p>
            <button
              type="button"
              onClick={markAllRead}
              disabled={unread.length === 0}
              className="text-xs font-medium text-electric hover:underline disabled:text-muted-foreground disabled:no-underline"
            >
              Tandai semua dibaca
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">
                Belum ada notifikasi
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {notifications.map((n) => {
                  const isUnread = !n.read_at;
                  const content = (
                    <div className="flex gap-3">
                      <span
                        aria-hidden
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          isUnread ? "bg-electric" : "bg-transparent"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {n.title}
                        </p>
                        {n.body && (
                          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                            {n.body}
                          </p>
                        )}
                        <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground/70">
                          {formatRelative(n.created_at)}
                        </p>
                      </div>
                    </div>
                  );

                  const commonCls =
                    "block w-full px-4 py-3 text-left transition-colors hover:bg-surface-elevated";

                  if (n.href) {
                    return (
                      <li key={n.id}>
                        <Link
                          to={n.href}
                          onClick={() => {
                            if (isUnread) markOneRead(n.id);
                            setOpen(false);
                          }}
                          className={commonCls}
                        >
                          {content}
                        </Link>
                      </li>
                    );
                  }
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => isUnread && markOneRead(n.id)}
                        className={commonCls}
                      >
                        {content}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

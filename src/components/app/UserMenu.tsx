import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, Sparkles, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { profileQuery } from "@/lib/scripts";

export function UserMenu() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [email, setEmail] = useState<string>("");
  const rootRef = useRef<HTMLDivElement | null>(null);

  const { data: profile } = useQuery(profileQuery());

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled && data.user?.email) setEmail(data.user.email);
    });
    return () => {
      cancelled = true;
    };
  }, []);

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

  const name = profile?.name ?? "";
  const initial = (name || email || "?").slice(0, 1).toUpperCase();

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await queryClient.cancelQueries();
      queryClient.clear();
      await supabase.auth.signOut();
      toast.success("Sampai jumpa lagi 👋");
      navigate({ to: "/login", replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal sign out");
      setSigningOut(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu akun"
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-electric/15 text-sm font-semibold text-electric ring-1 ring-transparent transition-colors hover:ring-electric/40"
      >
        {initial}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-border bg-surface shadow-elevated"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-semibold text-foreground">
              {name || "Unnamed creator"}
            </p>
            <p className="truncate text-xs text-muted-foreground">{email || "—"}</p>
            <p className="mt-1 inline-flex rounded-full bg-electric/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-electric">
              {profile?.plan ?? "free"}
            </p>
          </div>
          <div className="py-1">
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              role="menuitem"
              className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-surface-elevated"
            >
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              Profil
            </Link>
            <Link
              to="/upgrade"
              onClick={() => setOpen(false)}
              role="menuitem"
              className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-surface-elevated"
            >
              <Sparkles className="h-4 w-4 text-electric" />
              Upgrade Premium
            </Link>
          </div>
          <div className="border-t border-border py-1">
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              role="menuitem"
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-surface-elevated disabled:opacity-60"
            >
              <LogOut className="h-4 w-4 text-muted-foreground" />
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

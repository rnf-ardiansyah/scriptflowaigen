import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Sparkles,
  LayoutDashboard,
  Library,
  FolderClosed,
  MonitorPlay,
  Plus,
  LogOut,
  Crown,
  User,
} from "lucide-react";
import { Logo } from "@/components/landing/Logo";
import { cn } from "@/lib/utils";
import { listFoldersFn, foldersQuery } from "@/lib/folders.functions";
import { getQuotaSummaryFn, quotaQuery } from "@/lib/quota.functions";

// Consolidated: All Scripts / Favorites / Folders / Recent used to be 4
// separate nav items that all pointed to the same "/library" route with no
// filter applied — functionally identical, just confusing. Library page
// already has search + niche filter + Favorit toggle + folder tabs built
// in, so one nav entry is enough. Teleprompter now has its own picker page
// instead of aliasing to Library.
const primary = [
  { to: "/generator", label: "AI Generator", icon: Sparkles },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/library", label: "Library", icon: Library },
  { to: "/teleprompter", label: "Teleprompter", icon: MonitorPlay },
] as const;

const secondary = [
  { to: "/profile", label: "Profile", icon: User },
  { to: "/upgrade", label: "Upgrade", icon: Crown },
] as const;

// Max folder shortcuts shown before falling back to "See all in Library".
const MAX_FOLDER_SHORTCUTS = 6;

export function SidebarContent({
  onNavigate,
  onSignOut,
  signingOut,
}: {
  onNavigate?: () => void;
  onSignOut: () => void;
  signingOut: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const getFolders = useServerFn(listFoldersFn);
  const getQuota = useServerFn(getQuotaSummaryFn);
  const { data: folders } = useQuery(foldersQuery(() => getFolders()));
  const { data: quota } = useQuery(quotaQuery(() => getQuota()));

  const plan = quota?.plan ?? "free";
  const generationsToday = quota?.generationsToday ?? 0;
  const generationLimit = quota?.generationLimit ?? 5;
  const usagePct =
    generationLimit > 0
      ? Math.min(100, Math.round((generationsToday / generationLimit) * 100))
      : 0;

  const folderShortcuts = folders ?? [];
  const visibleFolders = folderShortcuts.slice(0, MAX_FOLDER_SHORTCUTS);
  const hiddenFolderCount = folderShortcuts.length - visibleFolders.length;

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-4">
        <Link to="/dashboard" onClick={onNavigate} className="min-w-0">
          <Logo />
        </Link>
      </div>

      <div className="px-3 pb-3">
        <Link
          to="/generator"
          onClick={onNavigate}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-electric px-3 py-2.5 text-sm font-semibold text-electric-foreground shadow-glow transition-transform hover:scale-[1.01]"
        >
          <Plus className="h-4 w-4" /> New Script
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-4">
        <ul className="flex flex-col gap-0.5">
          {primary.map((n) => {
            const active = pathname === n.to;
            return (
              <li key={n.label}>
                <Link
                  to={n.to}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-surface-elevated text-foreground"
                      : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground",
                  )}
                >
                  <n.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{n.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-5 px-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/80">
            Folders
          </p>
          {!folders ? (
            <div className="flex flex-col gap-1.5 px-1">
              <div className="h-7 animate-pulse rounded-lg bg-surface-elevated/70" />
              <div className="h-7 animate-pulse rounded-lg bg-surface-elevated/50" />
            </div>
          ) : folderShortcuts.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border/70 px-3 py-2 text-xs text-muted-foreground">
              No folders yet
            </p>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {visibleFolders.map((f) => (
                <li key={f.id}>
                  <Link
                    to="/library"
                    search={{ folder: f.id }}
                    onClick={onNavigate}
                    className="flex items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <FolderClosed className="h-4 w-4 shrink-0" />
                      <span className="truncate">{f.name}</span>
                    </span>
                    <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground/70">
                      {f.script_count}
                    </span>
                  </Link>
                </li>
              ))}
              {hiddenFolderCount > 0 && (
                <li>
                  <Link
                    to="/library"
                    onClick={onNavigate}
                    className="block rounded-lg px-3 py-1.5 text-xs font-medium text-electric hover:underline"
                  >
                    +{hiddenFolderCount} folder{hiddenFolderCount > 1 ? "s" : ""} lagi
                  </Link>
                </li>
              )}
            </ul>
          )}
        </div>

        <ul className="mt-5 flex flex-col gap-0.5">
          {secondary.map((n) => {
            const active = pathname.startsWith(n.to);
            return (
              <li key={n.to}>
                <Link
                  to={n.to}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-surface-elevated text-foreground"
                      : "text-muted-foreground hover:bg-surface-elevated hover:text-foreground",
                  )}
                >
                  <n.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{n.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-3">
        <div className="rounded-xl border border-border bg-surface p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Plan</span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                plan === "premium"
                  ? "border-amber-400/40 bg-amber-400/10 text-amber-400"
                  : "border-border bg-surface-elevated text-foreground",
              )}
            >
              {plan === "premium" ? "Premium" : "Free"}
            </span>
          </div>
          <div className="mt-2.5">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>AI today</span>
              <span className="tabular-nums text-foreground">
                {generationsToday} / {generationLimit}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-elevated">
              <div
                className="h-full rounded-full bg-electric transition-[width]"
                style={{ width: `${usagePct}%` }}
              />
            </div>
          </div>
          {plan === "premium" ? (
            <div className="animate-gold-glow relative mt-3 flex items-center justify-center gap-1.5 overflow-hidden rounded-lg border border-amber-400/30 bg-gradient-to-r from-amber-400/10 via-amber-300/5 to-amber-400/10 px-2 py-1.5 text-[11px] font-semibold">
              <span className="animate-shine-sweep pointer-events-none absolute inset-0" />
              <Crown className="relative h-3.5 w-3.5 text-amber-400" />
              <span className="text-shimmer-gold relative">Premium aktif</span>
            </div>
          ) : (
            <Link
              to="/upgrade"
              onClick={onNavigate}
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-amber-400/40 px-2 py-1.5 text-[11px] font-semibold text-amber-400 hover:bg-amber-400/10"
            >
              <Crown className="animate-crown-pulse h-3.5 w-3.5" /> Upgrade
            </Link>
          )}
        </div>
        <button
          type="button"
          onClick={onSignOut}
          disabled={signingOut}
          className="mt-2 inline-flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );
}
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Sparkles,
  LayoutDashboard,
  Library,
  Star,
  FolderClosed,
  Clock,
  MonitorPlay,
  Plus,
  LogOut,
  Crown,
  User,
} from "lucide-react";
import { Logo } from "@/components/landing/Logo";
import { cn } from "@/lib/utils";

const primary = [
  { to: "/generator", label: "AI Generator", icon: Sparkles },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/library", label: "All Scripts", icon: Library },
  { to: "/library", search: { filter: "favorites" }, label: "Favorites", icon: Star },
  { to: "/library", search: { view: "folders" }, label: "Folders", icon: FolderClosed },
  { to: "/library", search: { sort: "recent" }, label: "Recent", icon: Clock },
  { to: "/library", label: "Teleprompter", icon: MonitorPlay },
] as const;

const secondary = [
  { to: "/profile", label: "Profile", icon: User },
  { to: "/upgrade", label: "Upgrade", icon: Crown },
] as const;

// Placeholder folder shortcuts — real data wired in a later step.
const folderShortcuts: string[] = [];

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
                  search={"search" in n ? (n.search as never) : undefined}
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
          {folderShortcuts.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border/70 px-3 py-2 text-xs text-muted-foreground">
              No folders yet
            </p>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {folderShortcuts.map((f) => (
                <li key={f}>
                  <Link
                    to="/library"
                    onClick={onNavigate}
                    className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
                  >
                    <FolderClosed className="h-4 w-4" />
                    <span className="truncate">{f}</span>
                  </Link>
                </li>
              ))}
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
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-elevated px-2 py-0.5 text-[11px] font-semibold text-foreground">
              Free
            </span>
          </div>
          <div className="mt-2.5">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>AI today</span>
              <span className="tabular-nums text-foreground">62 / 100</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-elevated">
              <div
                className="h-full rounded-full bg-electric"
                style={{ width: "62%" }}
              />
            </div>
          </div>
          <Link
            to="/upgrade"
            onClick={onNavigate}
            className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-electric/40 px-2 py-1.5 text-[11px] font-semibold text-electric hover:bg-electric/10"
          >
            <Crown className="h-3.5 w-3.5" /> Upgrade
          </Link>
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

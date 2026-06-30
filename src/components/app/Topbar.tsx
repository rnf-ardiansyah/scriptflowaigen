import { useRouterState } from "@tanstack/react-router";
import { Bell, Menu } from "lucide-react";

function titleFromPath(pathname: string) {
  const seg = pathname.split("/").filter(Boolean)[0] ?? "workspace";
  return seg.replace(/-/g, " ");
}

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const crumb = titleFromPath(pathname);
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Buka menu"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-foreground hover:bg-surface-elevated lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>
        <nav aria-label="Breadcrumb" className="min-w-0">
          <ol className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            <li className="hidden sm:inline">scriptflow.app</li>
            <li className="hidden sm:inline text-muted-foreground/50">/</li>
            <li className="truncate capitalize text-foreground">{crumb}</li>
          </ol>
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Notifikasi"
          className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
        >
          <Bell className="h-4 w-4" />
        </button>
        <div
          aria-hidden
          className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-electric/15 text-sm font-semibold text-electric"
        >
          U
        </div>
      </div>
    </header>
  );
}

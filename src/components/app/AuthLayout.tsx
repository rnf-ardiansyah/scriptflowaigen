import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/landing/Logo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
      <div className="hero-glow absolute inset-0 -z-10" />
      <div className="grid-bg absolute inset-0 -z-10" />

      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
        <Link to="/"><Logo /></Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            to="/"
            aria-label="Kembali ke beranda"
            title="Kembali ke beranda"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gradient">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="glass-panel mt-8 rounded-2xl p-6 shadow-elevated">{children}</div>
          {footer && (
            <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
          )}
        </div>
      </main>
    </div>
  );
}

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SectionShell({
  children,
  className,
  glow = false,
  grid = false,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  grid?: boolean;
}) {
  return (
    <section className={cn("relative", className)}>
      {glow && <div className="hero-glow absolute inset-0 -z-10" />}
      {grid && <div className="grid-bg absolute inset-0 -z-10" />}
      <div className="mx-auto w-full max-w-7xl px-6">{children}</div>
    </section>
  );
}

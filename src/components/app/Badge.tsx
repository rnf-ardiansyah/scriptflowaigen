import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "electric" | "muted" | "outline" | "success";

const variants: Record<BadgeVariant, string> = {
  electric: "bg-electric text-electric-foreground shadow-glow",
  muted: "border border-border bg-surface/60 text-muted-foreground backdrop-blur",
  outline: "border border-electric/40 text-electric",
  success: "bg-[oklch(0.7_0.16_150)]/15 text-[oklch(0.8_0.16_150)] border border-[oklch(0.7_0.16_150)]/30",
};

export function Badge({
  className,
  variant = "muted",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

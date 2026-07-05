import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/50 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-electric text-electric-foreground shadow-glow hover:scale-[1.02] active:scale-[0.99]",
        secondary:
          "border border-border bg-surface/60 text-foreground backdrop-blur hover:bg-surface-elevated",
        ghost: "text-muted-foreground hover:text-foreground hover:bg-surface-elevated",
        outline:
          "border border-electric/40 text-electric hover:bg-electric/10",
        destructive:
          "bg-destructive text-destructive-foreground hover:opacity-90",
        gold:
          "bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 shadow-[0_0_20px_-6px_rgba(251,191,36,0.7)] hover:scale-[1.02] active:scale-[0.99]",
      },
      size: {
        sm: "h-9 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-5 text-sm",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };

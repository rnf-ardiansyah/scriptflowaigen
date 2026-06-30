import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";


export function FinalCTA() {
  return (
    <section className="relative px-4 py-20 sm:px-6 sm:py-24 md:py-32 lg:px-8">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-electric/30 bg-gradient-to-br from-surface-elevated via-surface to-background p-6 shadow-elevated sm:p-10 md:p-16">
        <div className="absolute inset-0 -z-10 hero-glow" />
        <div className="absolute -right-20 -top-20 -z-10 h-72 w-72 rounded-full bg-electric/30 blur-3xl" />

        <div className="grid items-center gap-10 md:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <Sparkles className="h-3 w-3 text-electric" /> Start free in seconds
            </div>
            <h2 className="mt-5 text-balance text-3xl font-bold leading-tight tracking-tight text-gradient sm:text-4xl md:text-5xl">
              Ready to create better videos?
            </h2>
            <p className="mt-4 max-w-lg text-sm text-muted-foreground sm:text-base md:text-lg">
              Generate your first script in less than a minute. No card. No fluff.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                to="/register"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-electric px-5 py-3 text-sm font-medium text-electric-foreground shadow-glow transition-transform hover:scale-[1.02] sm:w-auto"
              >
                Start Free Today
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface/60 px-5 py-3 text-sm font-medium text-foreground backdrop-blur hover:bg-surface-elevated sm:w-auto"
              >
                Book a Demo
              </a>
            </div>
          </div>

          <div className="glass-panel relative hidden rounded-2xl p-4 md:block">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-electric" /> New Script
              </span>
              <span className="text-electric">●</span>
            </div>
            <div className="mt-3 space-y-2">
              <div className="h-2 w-10/12 rounded bg-foreground/70" />
              <div className="h-2 w-11/12 rounded bg-surface-elevated" />
              <div className="h-2 w-9/12 rounded bg-surface-elevated" />
              <div className="h-2 w-10/12 rounded bg-surface-elevated" />
            </div>
            <div className="mt-4 flex items-center justify-between text-[10px] text-muted-foreground">
              <span>Generated in 1.4s</span>
              <span>48s read</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

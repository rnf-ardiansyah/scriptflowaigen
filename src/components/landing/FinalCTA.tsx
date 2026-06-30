import { ArrowRight, Sparkles } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="relative px-6 py-24 md:py-32">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-electric/30 bg-gradient-to-br from-[oklch(0.22_0.06_260)] via-[oklch(0.18_0.04_260)] to-[oklch(0.16_0.03_260)] p-12 shadow-elevated md:p-16">
        <div className="absolute inset-0 -z-10 hero-glow" />
        <div className="absolute -right-20 -top-20 -z-10 h-72 w-72 rounded-full bg-electric/30 blur-3xl" />

        <div className="grid items-center gap-10 md:grid-cols-[1.4fr_1fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <Sparkles className="h-3 w-3 text-electric" /> Start free in seconds
            </div>
            <h2 className="mt-5 text-balance text-4xl font-bold leading-tight tracking-tight text-gradient md:text-5xl">
              Ready to create better videos?
            </h2>
            <p className="mt-4 max-w-lg text-base text-muted-foreground md:text-lg">
              Generate your first script in less than a minute. No card. No fluff.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#"
                className="group inline-flex items-center gap-2 rounded-xl bg-electric px-5 py-3 text-sm font-medium text-electric-foreground shadow-glow transition-transform hover:scale-[1.02]"
              >
                Start Free Today
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface/60 px-5 py-3 text-sm font-medium text-foreground backdrop-blur hover:bg-surface-elevated"
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

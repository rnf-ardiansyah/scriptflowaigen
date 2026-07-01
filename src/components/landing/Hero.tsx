import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { DashboardMock } from "./DashboardMock";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="hero-glow absolute inset-0 -z-10" />
      <div className="grid-bg absolute inset-0 -z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
          <div className="animate-fade-up">
            <a
              href="#features"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted-foreground backdrop-blur"
            >
              <Sparkles className="h-3 w-3 text-electric" />
              New · Built-in Teleprompter & AI Rewrite
              <ArrowRight className="h-3 w-3" />
            </a>

            <h1 className="mt-6 text-balance text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl lg:text-[68px]">
              <span className="text-gradient">Write Better Short Video Scripts</span>{" "}
              <span className="text-gradient-accent">in Minutes</span>
              <br />
              <span className="text-gradient">with AI</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              ScriptFlow is the AI workspace for short-video creators. Turn an idea into a script,
              organize your library, and rehearse with a built-in teleprompter — all in one place.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                to="/register"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-electric px-5 py-3 text-sm font-medium text-electric-foreground shadow-glow transition-transform hover:scale-[1.02] sm:w-auto"
              >
                Start Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#showcase"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-surface/60 px-5 py-3 text-sm font-medium text-foreground backdrop-blur transition-colors hover:bg-surface-elevated sm:w-auto"
              >
                <Play className="h-4 w-4 text-electric" />
                Watch Demo
              </a>
            </div>

          </div>

          {/* Dashboard with floating cards */}
          <div className="relative w-full min-w-0 animate-fade-up [animation-delay:120ms]">
            <div className="absolute -inset-6 -z-10 rounded-3xl bg-electric/10 blur-3xl" />
            <div className="w-full max-w-full overflow-hidden">
              <DashboardMock />
            </div>


            {/* floating: teleprompter */}
            <div className="glass-panel absolute -left-6 bottom-10 hidden w-56 rounded-2xl p-3 shadow-elevated animate-float lg:block">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Teleprompter</span>
                <span className="text-electric">● LIVE</span>
              </div>
              <div className="mt-2 space-y-1.5">
                <div className="h-1.5 w-full rounded bg-surface-elevated" />
                <div className="h-2.5 w-11/12 rounded bg-foreground/80" />
                <div className="h-1.5 w-10/12 rounded bg-surface-elevated" />
                <div className="h-1.5 w-9/12 rounded bg-surface-elevated" />
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>0:24 / 1:00</span>
                <span>x1.0</span>
              </div>
            </div>

            {/* floating: AI assistant */}
            <div
              className="glass-panel absolute -right-4 -top-6 hidden w-52 rounded-2xl p-3 shadow-elevated animate-float [animation-delay:-2s] lg:block"
            >
              <div className="flex items-center gap-2 text-[11px] font-medium">
                <Sparkles className="h-3 w-3 text-electric" /> AI Suggestion
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                Try a stronger hook: <span className="text-foreground">"You're losing followers because of this…"</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

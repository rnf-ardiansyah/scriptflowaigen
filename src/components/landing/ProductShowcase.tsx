import { SectionHeader } from "./SectionHeader";
import { DashboardMock } from "./DashboardMock";
import { Mic, History, Sparkles } from "lucide-react";

export function ProductShowcase() {
  return (
    <section id="showcase" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Product"
          title="A real workspace, not a chat box."
          description="Everything you need to ship a short video lives next to your script — generate, edit, save, rehearse."
        />

        <div className="relative mt-16">
          <div className="absolute -inset-x-10 -top-10 -bottom-10 -z-10 rounded-[40px] bg-gradient-to-b from-electric/15 via-transparent to-transparent blur-3xl" />
          <div className="relative mx-auto max-w-5xl">
            <DashboardMock />

            <div className="glass-panel absolute -left-6 top-12 hidden w-60 rotate-[-4deg] rounded-2xl p-3 shadow-elevated lg:block">
              <div className="flex items-center gap-2 text-[11px] font-medium">
                <Mic className="h-3 w-3 text-electric" /> Teleprompter
              </div>
              <div className="mt-2 space-y-1.5">
                <div className="h-1.5 w-10/12 rounded bg-surface-elevated" />
                <div className="h-2.5 w-11/12 rounded bg-foreground/80" />
                <div className="h-1.5 w-9/12 rounded bg-surface-elevated" />
                <div className="h-1.5 w-8/12 rounded bg-surface-elevated" />
              </div>
            </div>

            <div className="glass-panel absolute -right-6 -top-6 hidden w-56 rotate-[3deg] rounded-2xl p-3 shadow-elevated lg:block">
              <div className="flex items-center gap-2 text-[11px] font-medium">
                <History className="h-3 w-3 text-electric" /> History
              </div>
              <ul className="mt-2 space-y-1 text-[11px] text-muted-foreground">
                <li>· TikTok Hook v3</li>
                <li>· Product Launch promo</li>
                <li>· Tutorial intro</li>
              </ul>
            </div>

            <div className="glass-panel absolute -right-10 bottom-10 hidden w-52 rotate-[-2deg] rounded-2xl p-3 shadow-elevated lg:block">
              <div className="flex items-center gap-2 text-[11px] font-medium">
                <Sparkles className="h-3 w-3 text-electric" /> AI Rewrite
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                Stronger hook ready in <span className="text-foreground">1.2s</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

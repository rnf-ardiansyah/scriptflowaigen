import {
  Sparkles,
  Library,
  Mic,
  LayoutTemplate,
  Clock,
  Star,
  FolderTree,
  Save,
  Search,
  Copy,
  Moon,
} from "lucide-react";
import { SectionHeader } from "./SectionHeader";

export function FeaturesBento() {
  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Core features"
          title="Everything you need. Nothing you don't."
          description="A focused toolkit for creators who want to ship more short-form video without the chaos."
        />

        <div className="mt-14 grid auto-rows-[220px] grid-cols-1 gap-4 md:grid-cols-6">
          {/* AI Generator — large */}
          <Cell className="md:col-span-4 md:row-span-2">
            <CellHeader icon={Sparkles} title="AI Script Generator" />
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Turn an idea into a full short-video script in seconds — hooks, beats, and CTA
              included.
            </p>
            <div className="mt-5 rounded-xl border border-border bg-background/60 p-3">
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <Sparkles className="h-3 w-3 text-electric" /> Idea
              </div>
              <p className="mt-1.5 text-[13px]">3 tips to grow on TikTok in 2026</p>
            </div>
            <div className="mt-2.5 rounded-xl border border-electric/30 bg-electric/5 p-3">
              <div className="flex items-center gap-2 text-[11px] text-electric">
                <span className="h-1.5 w-1.5 rounded-full bg-electric animate-pulse" /> Generating
              </div>
              <div className="mt-2 space-y-1.5">
                <div className="h-2 w-11/12 rounded bg-surface-elevated" />
                <div className="h-2 w-9/12 rounded bg-surface-elevated" />
                <div className="h-2 w-10/12 rounded bg-surface-elevated" />
              </div>
            </div>
          </Cell>

          {/* Library */}
          <Cell className="md:col-span-2">
            <CellHeader icon={Library} title="Script Library" />
            <div className="mt-3 space-y-1.5">
              {["Hook · TikTok", "Tutorial · Reels", "Promo · Shorts"].map((t) => (
                <div
                  key={t}
                  className="flex items-center justify-between rounded-lg border border-border bg-background/60 px-2.5 py-2 text-[11px]"
                >
                  <span className="truncate">{t}</span>
                  <Star className="h-3 w-3 text-electric" />
                </div>
              ))}
            </div>
          </Cell>

          {/* Teleprompter */}
          <Cell className="md:col-span-2">
            <CellHeader icon={Mic} title="Built-in Teleprompter" />
            <div className="mt-3 rounded-xl border border-border bg-background/70 p-3">
              <div className="space-y-1.5">
                <div className="h-1.5 w-10/12 rounded bg-surface-elevated" />
                <div className="h-2.5 w-11/12 rounded bg-foreground/80" />
                <div className="h-1.5 w-9/12 rounded bg-surface-elevated" />
              </div>
              <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
                <span>0:18 / 1:00</span>
                <span className="text-electric">● LIVE</span>
              </div>
            </div>
          </Cell>

          {/* Templates */}
          <Cell className="md:col-span-2">
            <CellHeader icon={LayoutTemplate} title="AI Templates" />
            <div className="mt-3 flex flex-wrap gap-1.5">
              {["Hook", "Story", "Tutorial", "Promo", "POV", "Listicle"].map((t) => (
                <span
                  key={t}
                  className="rounded-md border border-border bg-background/60 px-2 py-1 text-[11px] text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          </Cell>

          {/* Reading Time */}
          <Cell className="md:col-span-2">
            <CellHeader icon={Clock} title="Reading Time" />
            <div className="mt-3 flex items-end gap-3">
              <span className="text-4xl font-bold text-gradient-accent">48s</span>
              <span className="mb-1 text-xs text-muted-foreground">at 1.0× speed</span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Know your runtime before you record.
            </p>
          </Cell>

          {/* Workspace */}
          <Cell className="md:col-span-2">
            <CellHeader icon={FolderTree} title="Workspace Organization" />
            <div className="mt-3 space-y-1.5 text-[11px]">
              {["TikTok Hooks · 12", "Product Launch · 8", "Tutorials · 23"].map((t) => (
                <div
                  key={t}
                  className="flex items-center gap-2 rounded-lg border border-border bg-background/60 px-2.5 py-1.5"
                >
                  <FolderTree className="h-3 w-3 text-electric" />
                  <span className="truncate">{t}</span>
                </div>
              ))}
            </div>
          </Cell>

          {/* More */}
          <Cell className="md:col-span-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <CellHeader icon={Sparkles} title="And every detail in between" />
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Quality-of-life features creators actually use, every day.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { icon: Save, label: "Auto Save" },
                  { icon: Search, label: "Search" },
                  { icon: Copy, label: "Duplicate" },
                  { icon: Star, label: "Favorites" },
                  { icon: Moon, label: "Dark Mode" },
                ].map((f) => (
                  <span
                    key={f.label}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background/60 px-2.5 py-1.5 text-xs text-muted-foreground"
                  >
                    <f.icon className="h-3.5 w-3.5 text-electric" /> {f.label}
                  </span>
                ))}
              </div>
            </div>
          </Cell>
        </div>
      </div>
    </section>
  );
}

function Cell({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-border bg-surface p-5 transition-all hover:border-electric/40 hover:shadow-soft ${className}`}
    >
      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-electric/10 opacity-0 blur-3xl transition-opacity group-hover:opacity-100" />
      {children}
    </div>
  );
}

function CellHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="grid h-8 w-8 place-items-center rounded-lg bg-background text-electric ring-1 ring-border">
        <Icon className="h-4 w-4" />
      </div>
      <h3 className="text-[15px] font-semibold">{title}</h3>
    </div>
  );
}

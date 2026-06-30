import { Check } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

const points = [
  "Think, write, edit, organize and rehearse in one place",
  "Designed around how creators actually work",
  "Built for short-form: TikTok, Reels, Shorts",
];

export function SolutionSection() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="The solution"
          title="One workspace. One workflow. Everything connected."
          description="ScriptFlow replaces the patchwork of tools creators use today with a single, focused workspace built for short-form video."
        />

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-2">
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-3xl bg-electric/10 blur-3xl" />
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-elevated">
              <div className="grid grid-cols-3 gap-3">
                {["Idea", "Generate", "Edit"].map((s) => (
                  <Tile key={s} title={s} />
                ))}
                {["Save", "Practice", "Record"].map((s) => (
                  <Tile key={s} title={s} muted />
                ))}
              </div>
              <div className="mt-5 rounded-xl border border-electric/30 bg-electric/5 p-4">
                <p className="text-sm text-foreground">
                  <span className="text-electric">●</span> Live · Your last 3 scripts are auto-synced
                  and ready in your library.
                </p>
              </div>
            </div>
          </div>

          <div>
            <ul className="space-y-4">
              {points.map((p) => (
                <li key={p} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-6 w-6 place-items-center rounded-full bg-electric/15 text-electric">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-base text-foreground">{p}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-muted-foreground">
              Built for beginner creators, freelancers, UMKM owners, and personal brands who want
              to ship more — without the burnout.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Tile({ title, muted = false }: { title: string; muted?: boolean }) {
  return (
    <div
      className={`rounded-xl border px-3 py-4 text-center text-sm font-medium ${
        muted
          ? "border-border bg-background text-muted-foreground"
          : "border-electric/30 bg-electric/5 text-foreground"
      }`}
    >
      {title}
    </div>
  );
}

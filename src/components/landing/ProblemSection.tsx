import { VideoOff, Zap, LayoutGrid, FileX, ArrowDown, ArrowRight } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

const pains = [
  { icon: VideoOff, title: "Blank when recording", desc: "You hit record and forget every line you planned." },
  { icon: Zap, title: "Weak opening hooks", desc: "Your first 3 seconds lose viewers before they even start." },
  { icon: LayoutGrid, title: "Too many apps", desc: "ChatGPT, Notes, Docs, Teleprompter — chaos every time." },
  { icon: FileX, title: "Lost scripts", desc: "No system. Scripts disappear into folders you can't find." },
];

const chaos = ["ChatGPT", "Notes", "Edit", "Teleprompter", "Record", "Repeat"];
const flow = ["Idea", "Generate", "Edit", "Save", "Practice", "Record"];

export function ProblemSection() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="The problem"
          title="Creating content shouldn't feel like this."
          description="Most creators waste hours juggling tools instead of shipping videos. ScriptFlow ends that."
        />

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {pains.map((p) => (
            <div
              key={p.title}
              className="group rounded-2xl border border-border bg-surface p-6 transition-all hover:-translate-y-0.5 hover:border-electric/40 hover:shadow-soft"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-background text-electric ring-1 ring-border">
                <p.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-base font-semibold">{p.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Workflow comparison */}
        <div className="mt-16 grid gap-6 md:grid-cols-2">
          <WorkflowColumn
            label="Old workflow"
            tone="muted"
            steps={chaos}
            note="6 tools. Constant switching. Nothing saved."
          />
          <WorkflowColumn
            label="ScriptFlow"
            tone="electric"
            steps={flow}
            note="1 workspace. End-to-end. Everything saved."
          />
        </div>
      </div>
    </section>
  );
}

function WorkflowColumn({
  label,
  steps,
  note,
  tone,
}: {
  label: string;
  steps: string[];
  note: string;
  tone: "electric" | "muted";
}) {
  const accent = tone === "electric";
  return (
    <div
      className={`rounded-2xl border p-6 ${
        accent
          ? "border-electric/30 bg-gradient-to-b from-electric/5 to-transparent shadow-glow"
          : "border-border bg-surface"
      }`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-medium uppercase tracking-wider ${
            accent ? "text-electric" : "text-muted-foreground"
          }`}
        >
          {label}
        </span>
        <ArrowRight className={`h-4 w-4 ${accent ? "text-electric" : "text-muted-foreground"}`} />
      </div>
      <div className="mt-5 flex flex-col items-stretch gap-2">
        {steps.map((s, i) => (
          <div key={s + i}>
            <div
              className={`rounded-xl border px-4 py-2.5 text-center text-sm ${
                accent
                  ? "border-electric/30 bg-surface text-foreground"
                  : "border-border bg-background text-muted-foreground"
              }`}
            >
              {s}
            </div>
            {i < steps.length - 1 && (
              <div className="flex justify-center py-1">
                <ArrowDown
                  className={`h-3 w-3 ${accent ? "text-electric/70" : "text-muted-foreground/60"}`}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm text-muted-foreground">{note}</p>
    </div>
  );
}

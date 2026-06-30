import { Lightbulb, Sparkles, Pencil, Mic, Video } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

const steps = [
  { icon: Lightbulb, title: "Enter an idea", desc: "One sentence is enough." },
  { icon: Sparkles, title: "AI writes the script", desc: "Hooks, beats, CTA — done." },
  { icon: Pencil, title: "Customize", desc: "Tweak tone, length, voice." },
  { icon: Mic, title: "Practice", desc: "Built-in teleprompter." },
  { icon: Video, title: "Record", desc: "Confident. On-script. Done." },
];

export function HowItWorks() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="How it works"
          title="From idea to recording in 5 steps."
        />
        <div className="relative mt-16">
          <div className="pointer-events-none absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-electric/40 to-transparent md:block" />
          <ol className="grid gap-6 md:grid-cols-5">
            {steps.map((s, i) => (
              <li key={s.title} className="text-center">
                <div className="relative mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-border bg-surface text-electric shadow-soft">
                  <s.icon className="h-6 w-6" />
                  <span className="absolute -bottom-2 -right-2 grid h-5 w-5 place-items-center rounded-full bg-electric text-[10px] font-bold text-electric-foreground">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-base font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

import { Lightbulb, Sparkles, Pencil, Mic, Video } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

const steps = [
  { icon: Lightbulb, title: "Masukin ide", desc: "Cukup satu kalimat." },
  { icon: Sparkles, title: "AI nulis skripnya", desc: "Hook, beat, CTA — beres." },
  { icon: Pencil, title: "Sesuaikan", desc: "Atur tone, panjang, gaya bicara." },
  { icon: Mic, title: "Latihan", desc: "Teleprompter built-in." },
  { icon: Video, title: "Rekam", desc: "Pede. Sesuai skrip. Selesai." },
];

export function HowItWorks() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Cara Kerjanya"
          title="Dari ide ke rekaman cuma 5 langkah."
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

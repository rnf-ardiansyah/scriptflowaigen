import { useEffect, useRef, useState } from "react";
import { Clock, Sparkles, ShieldCheck, TrendingUp, Layers, Rocket, Check } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

const creator = [
  { icon: Clock, title: "Save hours every week", desc: "Skip the blank-page paralysis." },
  { icon: Sparkles, title: "Better hooks", desc: "Templates engineered for retention." },
  { icon: ShieldCheck, title: "Record with confidence", desc: "Teleprompter keeps you on-script." },
  { icon: TrendingUp, title: "Stay consistent", desc: "A library that grows with you." },
];

const business = [
  { icon: Rocket, title: "Ship content faster", desc: "More posts, less overhead." },
  { icon: Layers, title: "Promote products", desc: "On-brand scripts for launches." },
  { icon: Sparkles, title: "Organize campaigns", desc: "Folders, favorites, search." },
  { icon: TrendingUp, title: "Scale output", desc: "Repeatable creative pipeline." },
];

const stats = [
  { value: 10, suffix: "×", label: "Faster script writing" },
  { value: 50, suffix: "k+", label: "Scripts created weekly" },
  { value: 2, suffix: " min", label: "Average idea-to-script" },
];

export function Benefits() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Benefits"
          title="Built for creators. Loved by businesses."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Column title="For creators" items={creator} />
          <Column title="For businesses" items={business} />
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {stats.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Column({
  title,
  items,
}: {
  title: string;
  items: { icon: React.ElementType; title: string; desc: string }[];
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <h3 className="text-sm font-medium uppercase tracking-wider text-electric">{title}</h3>
      <ul className="mt-6 space-y-5">
        {items.map((b) => (
          <li key={b.title} className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-background text-electric ring-1 ring-border">
              <b.icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{b.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{b.desc}</p>
            </div>
            <Check className="ml-auto mt-1 h-4 w-4 shrink-0 text-electric/70" />
          </li>
        ))}
      </ul>
    </div>
  );
}

function StatCard({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const start = performance.now();
          const dur = 1100;
          const tick = (t: number) => {
            const p = Math.min(1, (t - start) / dur);
            setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [value]);
  return (
    <div
      ref={ref}
      className="rounded-2xl border border-border bg-surface p-6 text-center shadow-soft"
    >
      <p className="text-5xl font-bold tracking-tight text-gradient-accent">
        {n}
        {suffix}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { Clock, Sparkles, ShieldCheck, TrendingUp, Layers, Rocket, Check } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

const creator = [
  { icon: Clock, title: "Hemat berjam-jam tiap minggu", desc: "Nggak lagi mentok di halaman kosong." },
  { icon: Sparkles, title: "Hook lebih kuat", desc: "Template dirancang buat retensi." },
  { icon: ShieldCheck, title: "Rekam dengan pede", desc: "Teleprompter jaga kamu tetap on-script." },
  { icon: TrendingUp, title: "Konsisten setiap hari", desc: "Library yang tumbuh bareng kamu." },
];

const business = [
  { icon: Rocket, title: "Ship konten lebih cepat", desc: "Lebih banyak posting, lebih sedikit overhead." },
  { icon: Layers, title: "Promosi produk", desc: "Skrip on-brand buat launching." },
  { icon: Sparkles, title: "Rapikan campaign", desc: "Folder, favorit, pencarian." },
  { icon: TrendingUp, title: "Skala produksi", desc: "Alur kreatif yang bisa diulang." },
];

const stats = [
  { value: 10, suffix: "×", label: "Nulis skrip lebih cepat" },
  { value: 50, suffix: "rb+", label: "Skrip dibuat tiap minggu" },
  { value: 2, suffix: " menit", label: "Rata-rata ide ke skrip" },
];

export function Benefits() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Manfaat"
          title="Dibangun buat kreator. Disukai brand & bisnis."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Column title="Untuk kreator" items={creator} />
          <Column title="Untuk bisnis" items={business} />
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
      <p className="text-4xl font-bold tracking-tight text-gradient-accent sm:text-5xl">
        {n}
        {suffix}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

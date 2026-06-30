import { Check, Sparkles, X } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SectionHeader } from "./SectionHeader";

type PricingRoute = "/register" | "/upgrade";

type Feature = { label: string; ok: boolean };

const free: Feature[] = [
  { label: "5 AI generate per hari", ok: true },
  { label: "Script Library maksimal 20 script", ok: true },
  { label: "Akses Teleprompter", ok: true },
  { label: "Basic niche template", ok: true },
  { label: "AI Rewrite & Hook Generator", ok: false },
  { label: "Priority generation speed", ok: false },
];

const premium: Feature[] = [
  { label: "100 AI generate per hari", ok: true },
  { label: "Unlimited Script Library", ok: true },
  { label: "Akses Teleprompter", ok: true },
  { label: "Semua niche template", ok: true },
  { label: "Favorite, AI Rewrite, AI Hook Generator", ok: true },
  { label: "Priority generation speed", ok: true },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Pricing"
          title="Simple pricing. Mulai gratis."
          description="Pakai ScriptFlow gratis selamanya. Upgrade kapan pun kamu butuh lebih banyak script dan kecepatan AI."
        />

        <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
          <PlanCard
            name="Free"
            price="Rp0"
            period="/ bulan"
            description="Cocok buat eksplorasi awal."
            cta="Mulai Gratis"
            ctaTo="/register"
            features={free}
          />
          <PlanCard
            name="Premium"
            price="Rp29.000"
            period="/ bulan"
            description="Buat kreator yang nge-publish tiap minggu."
            cta="Upgrade ke Premium"
            ctaTo="/upgrade"
            features={premium}
            highlight
          />
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Bisa cancel kapan saja. Nggak perlu kartu kredit buat mulai.
        </p>
      </div>
    </section>
  );
}

function PlanCard({
  name,
  price,
  period,
  description,
  cta,
  ctaTo,
  features,
  highlight,
}: {
  name: string;
  price: string;
  period: string;
  description: string;
  cta: string;
  ctaTo: PricingRoute;
  features: Feature[];
  highlight?: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl border p-7 ${
        highlight
          ? "border-electric/40 bg-gradient-to-b from-electric/10 to-surface shadow-glow"
          : "border-border bg-surface"
      }`}
    >
      {highlight && (
        <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-electric px-3 py-1 text-[11px] font-semibold text-electric-foreground shadow-glow">
          <Sparkles className="h-3 w-3" /> Recommended
        </span>
      )}
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-5 flex items-end gap-1">
        <span className="text-5xl font-bold tracking-tight text-foreground">{price}</span>
        <span className="mb-1.5 text-sm text-muted-foreground">{period}</span>
      </div>
      <Link
        to={ctaTo}
        className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-medium transition-all ${
          highlight
            ? "bg-electric text-electric-foreground shadow-glow hover:scale-[1.01]"
            : "border border-border bg-background text-foreground hover:bg-surface-elevated"
        }`}
      >
        {cta}
      </Link>
      <ul className="mt-7 space-y-3">
        {features.map((f) => (
          <li key={f.label} className="flex items-start gap-2.5 text-sm">
            {f.ok ? (
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-electric" />
            ) : (
              <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <span
              className={
                f.ok ? "text-foreground/90" : "text-muted-foreground line-through"
              }
            >
              {f.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

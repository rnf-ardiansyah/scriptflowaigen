import { Check, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { SectionHeader } from "./SectionHeader";

type PricingRoute = "/register" | "/upgrade";

const free = [
  "5 AI generations / day",
  "20 saved scripts",
  "Basic templates",
  "Built-in teleprompter",
  "Dark mode",
];

const premium = [
  "Unlimited script library",
  "100 AI generations / day",
  "Premium templates",
  "AI Rewrite & tone control",
  "Priority AI speed",
  "Auto-save & search",
  "Folders & favorites",
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6">
        <SectionHeader
          eyebrow="Pricing"
          title="Simple pricing. Start free."
          description="Use ScriptFlow free forever. Upgrade when you're ready to scale your content."
        />

        <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
          <PlanCard
            name="Free"
            price="$0"
            period="forever"
            description="Everything you need to test your first ideas."
            cta="Start Free"
            ctaTo="/register"
            features={free}
          />
          <PlanCard
            name="Premium"
            price="$12"
            period="/ month"
            description="For creators shipping content every week."
            cta="Get Premium"
            ctaTo="/upgrade"
            features={premium}
            highlight
          />
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Cancel anytime. No credit card to start.
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
  features: string[];
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
          <li key={f} className="flex items-start gap-2.5 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-electric" />
            <span className="text-foreground/90">{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

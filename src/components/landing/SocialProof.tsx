import { Users, FileText, Star } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "500+",
    label: "Kreator aktif",
  },
  {
    icon: FileText,
    value: "10.000+",
    label: "Skrip dibuat",
  },
  {
    icon: Star,
    value: "4,8/5",
    label: "Rating kepuasan",
  },
];

export function SocialProof() {
  return (
    <section aria-label="Social proof" className="relative py-12 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="glass-panel flex items-center gap-4 rounded-2xl border border-border/60 p-5"
            >
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-electric/15 text-electric">
                <s.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold tracking-tight text-foreground">
                  {s.value}
                </p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/app/AppLayout";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/app/Card";
import { Button } from "@/components/app/Button";
import { Badge } from "@/components/app/Badge";
import { Check, Sparkles, ArrowLeft, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/upgrade")({
  head: () => ({
    meta: [
      { title: "Upgrade — ScriptFlow Premium" },
      {
        name: "description",
        content:
          "Bandingkan plan Free dan Premium ScriptFlow. Upgrade untuk unlimited script & 100 AI generate/hari.",
      },
    ],
  }),
  component: UpgradePage,
});

const FREE_FEATURES = [
  { label: "5 AI generate per hari", ok: true },
  { label: "Script Library maksimal 20 script", ok: true },
  { label: "Akses Teleprompter", ok: true },
  { label: "Basic niche template", ok: true },
  { label: "AI Rewrite & Hook Generator", ok: false },
  { label: "Priority generation speed", ok: false },
];

const PREMIUM_FEATURES = [
  { label: "100 AI generate per hari", ok: true },
  { label: "Unlimited Script Library", ok: true },
  { label: "Akses Teleprompter", ok: true },
  { label: "Semua niche template", ok: true },
  { label: "Fitur Favorite, AI Rewrite, AI Hook Generator", ok: true },
  { label: "Priority generation speed", ok: true },
];

function UpgradePage() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <Button asChild variant="ghost" size="sm">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" /> Kembali ke dashboard
          </Link>
        </Button>

        <div className="mt-4 text-center">
          <Badge variant="outline">Upgrade</Badge>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gradient md:text-5xl">
            Pilih plan yang pas buat kamu
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
            Mulai gratis, upgrade kapan pun kamu butuh lebih banyak script dan
            kecepatan AI.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {/* FREE */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl">Free</CardTitle>
              <CardDescription>Cocok buat eksplorasi awal.</CardDescription>
            </CardHeader>
            <div className="flex items-end gap-1">
              <span className="text-5xl font-bold tracking-tight">Rp0</span>
              <span className="mb-1.5 text-sm text-muted-foreground">/ bulan</span>
            </div>
            <ul className="mt-6 space-y-3">
              {FREE_FEATURES.map((f) => (
                <FeatureRow key={f.label} {...f} />
              ))}
            </ul>
            <Button variant="secondary" disabled className="mt-7 w-full" size="lg">
              Kamu sedang di plan ini
            </Button>
          </Card>

          {/* PREMIUM */}
          <Card className="flex flex-col" variant="glow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Premium</CardTitle>
                <Badge variant="electric">
                  <Sparkles className="h-3 w-3" /> Recommended
                </Badge>
              </div>
              <CardDescription>
                Buat kreator yang nge-publish tiap minggu.
              </CardDescription>
            </CardHeader>
            <div className="flex items-end gap-1">
              <span className="text-5xl font-bold tracking-tight">Rp29.000</span>
              <span className="mb-1.5 text-sm text-muted-foreground">/ bulan</span>
            </div>
            <ul className="mt-6 space-y-3">
              {PREMIUM_FEATURES.map((f) => (
                <FeatureRow key={f.label} {...f} />
              ))}
            </ul>
            <Button
              className="mt-7 w-full"
              size="lg"
              onClick={() =>
                alert(
                  "Pembayaran belum aktif di versi ini. Payment gateway akan menyusul ✨",
                )
              }
            >
              <Sparkles className="h-4 w-4" /> Upgrade ke Premium
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Bisa cancel kapan saja.
            </p>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

function FeatureRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <li className="flex items-start gap-2 text-sm">
      {ok ? (
        <Check className="mt-0.5 h-4 w-4 shrink-0 text-electric" />
      ) : (
        <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      )}
      <span className={ok ? "" : "text-muted-foreground line-through"}>{label}</span>
    </li>
  );
}

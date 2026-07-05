import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/app/AppLayout";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/app/Card";
import { Button } from "@/components/app/Button";
import { Badge } from "@/components/app/Badge";
import { Input } from "@/components/app/Input";
import { Check, Sparkles, ArrowLeft, X, CalendarCheck } from "lucide-react";
import { createUpgradeInvoice } from "@/lib/payment.functions";
import { getQuotaSummaryFn, quotaQuery } from "@/lib/quota.functions";
import { toast } from "sonner";

function formatExpiryDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

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
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const upgrade = useServerFn(createUpgradeInvoice);

  const getQuota = useServerFn(getQuotaSummaryFn);
  const { data: quota } = useQuery(quotaQuery(() => getQuota()));
  const isPremium = quota?.plan === "premium";
  const expiryLabel = formatExpiryDate(quota?.planExpiresAt ?? null);

  const queryClient = useQueryClient();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("status") !== "success") return;

    toast.success("Pembayaran berhasil! Selamat datang di ScriptFlow Premium 🎉");
    // Webhook Mayar biasanya sudah selesai proses sebelum redirect ini
    // sampai ke browser user, jadi refetch quota supaya UI langsung
    // menampilkan status Premium tanpa perlu manual reload.
    queryClient.invalidateQueries({ queryKey: ["quota", "summary"] });

    // Bersihkan query param dari URL, supaya toast tidak muncul lagi
    // kalau user refresh halaman ini nanti.
    params.delete("status");
    const cleanUrl = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
    window.history.replaceState({}, "", cleanUrl);
  }, [queryClient]);

  async function handleUpgrade() {
    if (!mobile.trim()) {
      toast.error("Isi nomor HP kamu dulu ya.");
      return;
    }
    setLoading(true);
    try {
      const res = await upgrade({ data: { mobile: mobile.trim() } });
      window.location.href = res.paymentUrl;
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Gagal memulai pembayaran.",
      );
      setLoading(false);
    }
  }

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
              {isPremium ? "Downgrade otomatis kalau premium habis" : "Kamu sedang di plan ini"}
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
              <span className="text-5xl font-bold tracking-tight">Rp20.000</span>
              <span className="mb-1.5 text-sm text-muted-foreground">/ bulan</span>
            </div>
            <ul className="mt-6 space-y-3">
              {PREMIUM_FEATURES.map((f) => (
                <FeatureRow key={f.label} {...f} />
              ))}
            </ul>

            {isPremium ? (
              <div className="mt-7 space-y-3">
                <div className="flex items-center gap-2 rounded-lg border border-electric/30 bg-electric/10 px-3 py-2.5 text-sm text-electric">
                  <CalendarCheck className="h-4 w-4 shrink-0" />
                  <span>
                    {expiryLabel
                      ? `Aktif sampai ${expiryLabel}`
                      : "Plan premium kamu sedang aktif"}
                  </span>
                </div>
                <Button variant="secondary" disabled className="w-full" size="lg">
                  Plan aktif kamu
                </Button>
              </div>
            ) : (
              <>
                <div className="mt-7 space-y-2">
                  <label htmlFor="mobile" className="text-xs font-medium text-muted-foreground">
                    Nomor HP (buat konfirmasi pembayaran)
                  </label>
                  <Input
                    id="mobile"
                    type="tel"
                    inputMode="numeric"
                    placeholder="08123456789"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <Button
                  className="mt-3 w-full"
                  size="lg"
                  onClick={handleUpgrade}
                  disabled={loading}
                >
                  <Sparkles className="h-4 w-4" />
                  {loading ? "Memproses..." : "Upgrade ke Premium"}
                </Button>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Bisa cancel kapan saja.
                </p>
              </>
            )}
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
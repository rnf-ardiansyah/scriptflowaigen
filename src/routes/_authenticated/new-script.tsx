import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Sparkles, Loader2, AlertCircle, Zap } from "lucide-react";
import { AppLayout } from "@/components/app/AppLayout";
import { Card } from "@/components/app/Card";
import { Button } from "@/components/app/Button";
import { Badge } from "@/components/app/Badge";
import { NICHES } from "@/lib/niches";
import { profileQuery } from "@/lib/scripts";
import { generateScript } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/new-script")({
  head: () => ({
    meta: [
      { title: "Buat Script Baru — ScriptFlow" },
      { name: "description", content: "Generate script video pendek dengan AI." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(profileQuery()),
  component: NewScriptPage,
});

const TONES = ["Santai", "Formal", "Persuasif", "Edukatif", "Storytelling"] as const;

type ErrState =
  | null
  | { kind: "rate_limited"; plan?: string; limit?: number; message: string }
  | { kind: "script_limit"; message: string }
  | { kind: "parse_failed"; message: string }
  | { kind: "generic"; message: string };

function NewScriptPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: profile } = useSuspenseQuery(profileQuery());
  const generate = useServerFn(generateScript);

  const [idea, setIdea] = useState("");
  const [niche, setNiche] = useState<string>(profile?.preferred_niche ?? NICHES[0]);
  const [tone, setTone] = useState<string>(TONES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrState>(null);

  async function handleGenerate() {
    if (idea.trim().length < 3) {
      toast.error("Tulis ide kontennya dulu (minimal 3 karakter).");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await generate({ data: { idea: idea.trim(), niche, tone } });
      qc.invalidateQueries({ queryKey: ["scripts"] });
      if (result.cached) {
        toast.success("Pakai hasil sebelumnya yang persis sama — kuota tidak terpotong.");
      } else {
        toast.success("Script berhasil dibuat ✨");
      }
      navigate({ to: "/editor/$scriptId", params: { scriptId: result.scriptId } });
    } catch (e: unknown) {
      const lovable = (e as { lovable?: { code: string; message: string; plan?: string; limit?: number } })?.lovable;
      const message = (e as Error)?.message ?? "Terjadi kesalahan tak terduga.";
      if (lovable?.code === "rate_limited") {
        setError({
          kind: "rate_limited",
          plan: lovable.plan,
          limit: lovable.limit,
          message: lovable.message,
        });
      } else if (lovable?.code === "script_limit_reached") {
        setError({ kind: "script_limit", message: lovable.message });
      } else if (lovable?.code === "parse_failed") {
        setError({ kind: "parse_failed", message: lovable.message });
      } else {
        setError({ kind: "generic", message });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" size="sm">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4" /> Kembali
            </Link>
          </Button>
          <Badge variant="muted">
            <Sparkles className="h-3 w-3" /> AI Generator
          </Badge>
        </div>

        <div className="mt-4">
          <h1 className="text-3xl font-bold tracking-tight text-gradient md:text-4xl">
            Buat Script Baru
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Kasih AI ide, niche, dan tone-nya. Hook, retain, reward, dan CTA akan dibuat
            otomatis dalam beberapa detik.
          </p>
        </div>

        {loading ? (
          <Card className="mt-8 flex flex-col items-center gap-4 py-16 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-electric" />
            <div>
              <h2 className="text-lg font-semibold">Menyusun script kamu…</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Biasanya butuh 5–15 detik. Jangan refresh ya.
              </p>
            </div>
          </Card>
        ) : error ? (
          <ErrorCard error={error} onRetry={() => setError(null)} />
        ) : (
          <Card className="mt-8 space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="idea">
                Ide konten
              </label>
              <textarea
                id="idea"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                rows={5}
                maxLength={2000}
                placeholder="Contoh: kenapa kebanyakan orang gagal pakai retinol di bulan pertama"
                className="w-full resize-none rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/40"
              />
              <p className="text-right text-xs text-muted-foreground">
                {idea.length}/2000
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="niche">
                  Niche
                </label>
                <select
                  id="niche"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-background/60 px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/40"
                >
                  {NICHES.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="tone">
                  Tone
                </label>
                <select
                  id="tone"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-background/60 px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/40"
                >
                  {TONES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button size="lg" className="w-full" onClick={handleGenerate}>
              <Sparkles className="h-4 w-4" /> Generate dengan AI
            </Button>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

function ErrorCard({
  error,
  onRetry,
}: {
  error: NonNullable<ErrState>;
  onRetry: () => void;
}) {
  if (error.kind === "rate_limited" || error.kind === "script_limit") {
    const isLimit = error.kind === "script_limit";
    return (
      <Card className="mt-8 flex flex-col items-center gap-4 py-12 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-electric/10 text-electric">
          <Zap className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">
            {isLimit ? "Script Library penuh" : "Kuota harian habis"}
          </h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            {error.message}
            {!isLimit &&
              " Upgrade ke Premium untuk dapat 100 generate per hari, atau coba lagi besok."}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
            <Link to="/upgrade">
              <Sparkles className="h-4 w-4" /> Upgrade ke Premium
            </Link>
          </Button>
          <Button variant="ghost" onClick={onRetry}>
            Kembali ke form
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mt-8 flex flex-col items-center gap-4 py-12 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertCircle className="h-6 w-6" />
      </div>
      <div>
        <h2 className="text-lg font-semibold">Gagal generate script</h2>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">{error.message}</p>
      </div>
      <Button onClick={onRetry}>Coba Lagi</Button>
    </Card>
  );
}

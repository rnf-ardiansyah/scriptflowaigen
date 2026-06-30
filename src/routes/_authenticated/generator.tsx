import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  Play,
  RotateCcw,
  Pencil,
  AlertTriangle,
  Crown,
} from "lucide-react";
import { AppLayout } from "@/components/app/AppLayout";
import { Card } from "@/components/app/Card";
import { Button } from "@/components/app/Button";
import { Badge } from "@/components/app/Badge";
import { NICHES } from "@/lib/niches";
import { profileQuery, computeReadingTime } from "@/lib/scripts";
import { generateScript } from "@/lib/ai.functions";

export const Route = createFileRoute("/_authenticated/generator")({
  head: () => ({
    meta: [
      { title: "AI Generator — ScriptFlow" },
      { name: "description", content: "Generate script video pendek dengan AI." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(profileQuery()),
  component: GeneratorPage,
});

const DURATIONS = [30, 60, 90] as const;
type Duration = (typeof DURATIONS)[number];
const STYLES = ["Hook style", "Story style", "Listicle"] as const;
type Style = (typeof STYLES)[number];

type Sections = { hook: string; retain: string; reward: string; cta: string };
type Phase = "idle" | "generating" | "done" | "limit_reached" | "error";

function classifyError(err: unknown): {
  kind: "rate_limited" | "script_limit_reached" | "other";
  message: string;
} {
  const raw = err instanceof Error ? err.message : String(err ?? "");
  const code = (err as { lovable?: { code?: string } } | null)?.lovable?.code;
  if (code === "rate_limited" || /kuota harian/i.test(raw)) {
    return { kind: "rate_limited", message: raw };
  }
  if (code === "script_limit_reached" || /batas 20 script/i.test(raw)) {
    return { kind: "script_limit_reached", message: raw };
  }
  return { kind: "other", message: raw || "Terjadi kesalahan tak terduga." };
}

function GeneratorPage() {
  const qc = useQueryClient();
  const { data: profile } = useSuspenseQuery(profileQuery());

  const [idea, setIdea] = useState("");
  const [niche, setNiche] = useState<string>(profile?.preferred_niche ?? NICHES[0]);
  const [duration, setDuration] = useState<Duration>(60);
  const [style, setStyle] = useState<Style>("Hook style");

  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<Sections | null>(null);
  const [filled, setFilled] = useState<Set<keyof Sections>>(new Set());
  const [elapsed, setElapsed] = useState(0);
  const [scriptId, setScriptId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const timerRef = useRef<number | null>(null);
  const generate = useServerFn(generateScript);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  function stopTimer() {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function reset() {
    stopTimer();
    setPhase("idle");
    setResult(null);
    setFilled(new Set());
    setElapsed(0);
    setScriptId(null);
    setErrorMessage("");
  }

  async function handleGenerate() {
    const trimmedIdea = idea.trim();
    if (trimmedIdea.length < 3) {
      toast.error("Tulis ide kontennya dulu (minimal 3 karakter).");
      return;
    }

    // reset previous run
    stopTimer();
    setScriptId(null);
    setResult(null);
    setFilled(new Set());
    setElapsed(0);
    setErrorMessage("");
    setPhase("generating");

    const start = performance.now();
    timerRef.current = window.setInterval(() => {
      setElapsed((performance.now() - start) / 1000);
    }, 100);

    try {
      const res = await generate({
        data: { idea: trimmedIdea, niche, tone: style },
      });
      stopTimer();
      setResult({
        hook: res.hook,
        retain: res.retain,
        reward: res.reward,
        cta: res.cta,
      });
      setFilled(new Set(["hook", "retain", "reward", "cta"]));
      setScriptId(res.scriptId);
      setPhase("done");
      qc.invalidateQueries({ queryKey: ["scripts"] });
      qc.invalidateQueries({ queryKey: ["quota"] });
      qc.invalidateQueries({ queryKey: ["generations"] });
      if (res.cached) {
        toast.success("Pakai hasil tersimpan (cache) — kuota tidak terpotong.");
      } else {
        toast.success("Script berhasil dibuat ✨");
      }
    } catch (err) {
      stopTimer();
      const classified = classifyError(err);
      if (
        classified.kind === "rate_limited" ||
        classified.kind === "script_limit_reached"
      ) {
        setPhase("limit_reached");
        setErrorMessage(classified.message);
      } else {
        setPhase("error");
        setErrorMessage(classified.message);
      }
    }
  }

  const totalReadSec = result ? computeReadingTime(result) : 0;


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
            <Sparkles className="h-3 w-3" /> {duration}s · {style}
          </Badge>
        </div>

        <div className="mt-4">
          <h1 className="text-3xl font-bold tracking-tight text-gradient md:text-4xl">
            AI Generator
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ketik idemu, pilih durasi dan gaya — AI bantu susun hook, retain, reward,
            dan CTA dalam hitungan detik.
          </p>
        </div>

        {/* Settings + Input */}
        <Card className="mt-8 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="duration">
                Durasi target
              </label>
              <select
                id="duration"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value) as Duration)}
                disabled={phase === "generating"}
                className="h-11 w-full rounded-xl border border-border bg-background/60 px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/40 disabled:opacity-50"
              >
                {DURATIONS.map((d) => (
                  <option key={d} value={d}>
                    {d} detik
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="style">
                Gaya
              </label>
              <select
                id="style"
                value={style}
                onChange={(e) => setStyle(e.target.value as Style)}
                disabled={phase === "generating"}
                className="h-11 w-full rounded-xl border border-border bg-background/60 px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/40 disabled:opacity-50"
              >
                {STYLES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="niche">
              Niche
            </label>
            <select
              id="niche"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              disabled={phase === "generating"}
              className="h-11 w-full rounded-xl border border-border bg-background/60 px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/40 disabled:opacity-50"
            >
              {NICHES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="idea">
              Idea
            </label>
            <textarea
              id="idea"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              rows={4}
              maxLength={2000}
              disabled={phase === "generating"}
              placeholder="5 kesalahan pemula bikin konten TikTok"
              className="w-full resize-none rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/40 disabled:opacity-50"
            />
            <p className="text-right text-xs text-muted-foreground">
              {idea.length}/2000
            </p>
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={handleGenerate}
            disabled={phase === "generating"}
          >
            {phase === "generating" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Generating…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Generate
              </>
            )}
          </Button>
        </Card>

        {/* Result / Skeleton */}
        {(phase === "generating" || phase === "done") && (
          <Card className="mt-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {phase === "generating" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-electric" />
                    <span className="text-sm font-semibold">Generating…</span>
                    <span className="text-xs text-muted-foreground">
                      {elapsed.toFixed(1)}s
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-electric" />
                    <span className="text-sm font-semibold">Hasil</span>
                    <Badge variant="muted">~{totalReadSec}s read</Badge>
                  </>
                )}
              </div>
              {phase === "done" && (
                <Button variant="ghost" size="sm" onClick={reset}>
                  <RotateCcw className="h-3.5 w-3.5" /> Generate ulang
                </Button>
              )}
            </div>

            <SectionBlock
              label="Hook"
              text={result?.hook ?? ""}
              ready={filled.has("hook")}
              lines={2}
            />
            <SectionBlock
              label="Retain"
              text={result?.retain ?? ""}
              ready={filled.has("retain")}
              lines={4}
            />
            <SectionBlock
              label="Reward"
              text={result?.reward ?? ""}
              ready={filled.has("reward")}
              lines={3}
            />
            <SectionBlock
              label="CTA"
              text={result?.cta ?? ""}
              ready={filled.has("cta")}
              lines={2}
            />

            {phase === "done" && scriptId && (
              <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  Estimasi durasi:{" "}
                  <span className="font-medium text-foreground">~{totalReadSec} detik</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="secondary">
                    <Link to="/editor/$scriptId" params={{ scriptId }}>
                      <Pencil className="h-4 w-4" /> Buka di Editor
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link to="/teleprompter/$scriptId" params={{ scriptId }}>
                      <Play className="h-4 w-4" /> Open Teleprompter
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {phase === "limit_reached" && (
          <Card className="mt-6 space-y-4 border-amber-500/30 bg-amber-500/5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-500">
                <Crown className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold">Limit harian tercapai</h3>
                <p className="text-sm text-muted-foreground">
                  {errorMessage ||
                    "Kamu sudah mencapai batas generate hari ini."}{" "}
                  Upgrade ke Premium untuk lanjut bikin script tanpa batas harian
                  yang ketat.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link to="/upgrade">
                  <Crown className="h-4 w-4" /> Upgrade ke Premium
                </Link>
              </Button>
              <Button variant="ghost" onClick={reset}>
                Tutup
              </Button>
            </div>
          </Card>
        )}

        {phase === "error" && (
          <Card className="mt-6 space-y-4 border-destructive/30 bg-destructive/5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold">Gagal membuat script</h3>
                <p className="text-sm text-muted-foreground">
                  {errorMessage ||
                    "Terjadi kesalahan saat menghubungi AI. Coba lagi sebentar."}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleGenerate}>
                <RotateCcw className="h-4 w-4" /> Coba Lagi
              </Button>
              <Button variant="ghost" onClick={reset}>
                Tutup
              </Button>
            </div>
          </Card>
        )}

      </div>
    </AppLayout>
  );
}

function SectionBlock({
  label,
  text,
  ready,
  lines,
}: {
  label: string;
  text: string;
  ready: boolean;
  lines: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-electric">
        {label}
      </p>
      {ready ? (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
          {text}
        </p>
      ) : (
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className="h-3 animate-pulse rounded bg-border"
              style={{ width: `${70 + ((i * 13) % 30)}%` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

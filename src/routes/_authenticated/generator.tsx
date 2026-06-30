import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  Play,
  Save,
  RotateCcw,
  Pencil,
} from "lucide-react";
import { AppLayout } from "@/components/app/AppLayout";
import { Card } from "@/components/app/Card";
import { Button } from "@/components/app/Button";
import { Badge } from "@/components/app/Badge";
import { NICHES } from "@/lib/niches";
import {
  profileQuery,
  createScript,
  computeReadingTime,
  buildFullScript,
} from "@/lib/scripts";

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
type Phase = "idle" | "generating" | "done";

// ---------- Dummy generator ----------
function buildDummyScript({
  idea,
  niche,
  duration,
  style,
}: {
  idea: string;
  niche: string;
  duration: Duration;
  style: Style;
}): Sections {
  const i = idea.trim().replace(/[.?!]+$/, "");
  const longer = duration >= 60;
  const longest = duration >= 90;

  if (style === "Listicle") {
    return {
      hook: `Stop scroll! Ini ${longest ? "5" : longer ? "4" : "3"} hal tentang "${i}" yang jarang dibahas creator ${niche.toLowerCase()}.`,
      retain: [
        `Pertama, kebanyakan orang langsung loncat ke teknis, padahal hal paling penting soal "${i}" justru ada di mindset awal.`,
        longer
          ? `Kedua, ada pola yang berulang — dan kalau kamu sadar polanya, kamu bisa hindari kesalahan yang bikin progress kamu stuck berbulan-bulan.`
          : "",
        longest
          ? `Ketiga, ada satu trik kecil yang sering diabaikan tapi efeknya gede banget — aku jelasin di bagian akhir.`
          : "",
      ]
        .filter(Boolean)
        .join(" "),
      reward: `Intinya: kalau kamu konsisten apply tiga hal ini ke "${i}", hasilnya bakal kelihatan dalam 2–3 minggu. Banyak yang udah buktiin di niche ${niche.toLowerCase()}.`,
      cta: `Save video ini biar nggak lupa, dan follow buat tips ${niche.toLowerCase()} tiap minggu. Mana yang paling kamu butuhin? Tulis di komen.`,
    };
  }

  if (style === "Story style") {
    return {
      hook: `Dulu aku juga mikir "${i}" itu ribet — sampai akhirnya satu kejadian ngubah cara pandang aku 180 derajat.`,
      retain: [
        `Waktu itu aku coba semua tutorial random di internet. Hasilnya? Nol. Sampai aku nemu satu pendekatan sederhana yang ternyata dipakai banyak creator ${niche.toLowerCase()} sukses.`,
        longer
          ? `Yang bikin beda bukan tool-nya, bukan budget-nya — tapi cara mereka mikirin audiens dari detik pertama video.`
          : "",
        longest
          ? `Aku tes pendekatan ini selama sebulan, dan reach video aku naik konsisten tanpa harus posting tiap hari.`
          : "",
      ]
        .filter(Boolean)
        .join(" "),
      reward: `Jadi pelajarannya: "${i}" bukan soal seberapa keras kamu kerja, tapi seberapa tepat kamu eksekusi prinsip dasarnya.`,
      cta: `Kalau kamu pernah ngalamin hal yang sama, share di komen. Follow buat cerita ${niche.toLowerCase()} lainnya setiap Selasa & Jumat.`,
    };
  }

  // Hook style (default)
  return {
    hook: `Stop scroll dulu — kalau kamu pernah mikirin "${i}", video ini wajib kamu tonton sampai habis.`,
    retain: [
      `Karena 90% orang yang ngebahas "${i}" cuma nyentuh permukaannya doang. Aku bakal kasih kamu kerangka berpikir yang langsung bisa kamu pakai hari ini di konten ${niche.toLowerCase()} kamu.`,
      longer
        ? `Dan ini bukan teori — ini hal yang udah aku tes berkali-kali di akun aku sendiri dan akun temen-temen creator.`
        : "",
      longest
        ? `Aku juga bakal kasih tau satu kesalahan paling umum yang bikin video kamu gagal nge-hook, biar kamu nggak ulangin lagi.`
        : "",
    ]
      .filter(Boolean)
      .join(" "),
    reward: `Kuncinya simpel: fokus di 3 detik pertama, kasih alasan kuat buat stay, lalu kasih payoff yang bikin penonton mau share. Itu rumus dasar yang works buat "${i}".`,
    cta: `Like kalau ini membantu, dan follow buat breakdown ${niche.toLowerCase()} lainnya. Komen "next" biar aku tau topik mana yang mau kamu bahas berikutnya.`,
  };
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
  const [saving, setSaving] = useState(false);

  const timerRef = useRef<number | null>(null);
  const fillTimeouts = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      fillTimeouts.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  function reset() {
    if (timerRef.current) window.clearInterval(timerRef.current);
    fillTimeouts.current.forEach((t) => window.clearTimeout(t));
    fillTimeouts.current = [];
    setPhase("idle");
    setResult(null);
    setFilled(new Set());
    setElapsed(0);
    setScriptId(null);
  }

  function handleGenerate() {
    if (idea.trim().length < 3) {
      toast.error("Tulis ide kontennya dulu (minimal 3 karakter).");
      return;
    }
    // reset previous run
    fillTimeouts.current.forEach((t) => window.clearTimeout(t));
    fillTimeouts.current = [];
    setScriptId(null);
    setFilled(new Set());
    setElapsed(0);
    setPhase("generating");

    const final = buildDummyScript({ idea: idea.trim(), niche, duration, style });
    setResult(final);

    const start = performance.now();
    timerRef.current = window.setInterval(() => {
      setElapsed((performance.now() - start) / 1000);
    }, 100);

    const order: (keyof Sections)[] = ["hook", "retain", "reward", "cta"];
    order.forEach((key, idx) => {
      const t = window.setTimeout(
        () => {
          setFilled((prev) => {
            const next = new Set(prev);
            next.add(key);
            return next;
          });
          if (idx === order.length - 1) {
            if (timerRef.current) {
              window.clearInterval(timerRef.current);
              timerRef.current = null;
            }
            setPhase("done");
          }
        },
        700 + idx * 750,
      );
      fillTimeouts.current.push(t);
    });
  }

  async function handleSave() {
    if (!result) return;
    setSaving(true);
    try {
      const trimmedIdea = idea.trim();
      const title =
        trimmedIdea.length > 60 ? `${trimmedIdea.slice(0, 60)}…` : trimmedIdea;
      const full_script = buildFullScript(result);
      const reading_time = computeReadingTime(result);
      const created = await createScript({
        title,
        idea: trimmedIdea,
        niche,
        tone: style,
        hook: result.hook,
        retain: result.retain,
        reward: result.reward,
        cta: result.cta,
        full_script,
        reading_time,
      });
      setScriptId(created.id);
      qc.invalidateQueries({ queryKey: ["scripts"] });
      toast.success("Script disimpan ke Library ✨");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Gagal menyimpan";
      if (msg.includes("free_plan_script_limit_reached")) {
        toast.error("Library penuh — upgrade ke Premium untuk menyimpan lebih banyak.");
      } else {
        toast.error(msg);
      }
    } finally {
      setSaving(false);
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
        {phase !== "idle" && result && (
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
              text={result.hook}
              ready={filled.has("hook")}
              lines={2}
            />
            <SectionBlock
              label="Retain"
              text={result.retain}
              ready={filled.has("retain")}
              lines={4}
            />
            <SectionBlock
              label="Reward"
              text={result.reward}
              ready={filled.has("reward")}
              lines={3}
            />
            <SectionBlock
              label="CTA"
              text={result.cta}
              ready={filled.has("cta")}
              lines={2}
            />

            {phase === "done" && (
              <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  Estimasi durasi:{" "}
                  <span className="font-medium text-foreground">~{totalReadSec} detik</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {scriptId ? (
                    <Button asChild variant="secondary">
                      <Link to="/editor/$scriptId" params={{ scriptId }}>
                        <Pencil className="h-4 w-4" /> Buka di Editor
                      </Link>
                    </Button>
                  ) : (
                    <Button onClick={handleSave} disabled={saving}>
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      Save to Library
                    </Button>
                  )}
                  {scriptId ? (
                    <Button asChild>
                      <Link to="/teleprompter/$scriptId" params={{ scriptId }}>
                        <Play className="h-4 w-4" /> Open Teleprompter
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      disabled
                      title="Simpan dulu untuk membuka Teleprompter"
                      className="cursor-not-allowed opacity-50"
                    >
                      <Play className="h-4 w-4" /> Open Teleprompter
                    </Button>
                  )}
                </div>
              </div>
            )}
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

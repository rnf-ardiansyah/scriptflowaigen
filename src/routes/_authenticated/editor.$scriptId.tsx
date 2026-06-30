import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate, useRouter, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/app/AppLayout";
import { Button } from "@/components/app/Button";
import { Badge } from "@/components/app/Badge";
import { Card } from "@/components/app/Card";
import { Input, Label, Textarea } from "@/components/app/Input";
import { ArrowLeft, Mic, Check, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";
import {
  buildFullScript,
  computeReadingTime,
  createScript,
  scriptDetailQuery,
  updateScript,
} from "@/lib/scripts";
import { NICHES } from "@/lib/niches";
import { AIActions, HookRegenButton } from "@/components/app/AIActions";

export const Route = createFileRoute("/_authenticated/editor/$scriptId")({
  head: ({ params }) => ({
    meta: [
      { title: `Editor — ScriptFlow` },
      { name: "description", content: `Edit script ${params.scriptId}.` },
    ],
  }),
  loader: async ({ context, params }) => {
    if (params.scriptId === "new") return;
    const data = await context.queryClient.ensureQueryData(scriptDetailQuery(params.scriptId));
    if (!data) throw notFound();
  },
  notFoundComponent: () => (
    <AppLayout>
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-2xl font-semibold">Script tidak ditemukan</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Mungkin sudah dihapus atau bukan milikmu.
        </p>
        <Button asChild className="mt-6" variant="secondary">
          <Link to="/library">← Kembali ke Library</Link>
        </Button>
      </div>
    </AppLayout>
  ),
  component: EditorPage,
});

type FormState = {
  title: string;
  niche: string;
  idea: string;
  hook: string;
  retain: string;
  reward: string;
  cta: string;
};

const empty: FormState = {
  title: "",
  niche: "",
  idea: "",
  hook: "",
  retain: "",
  reward: "",
  cta: "",
};

function EditorPage() {
  const { scriptId } = Route.useParams();
  const navigate = useNavigate();
  const router = useRouter();
  const qc = useQueryClient();
  const [creating, setCreating] = useState(scriptId === "new");

  // Bootstrap "new" → real id
  useEffect(() => {
    if (scriptId !== "new") return;
    let cancelled = false;
    (async () => {
      try {
        const s = await createScript();
        qc.invalidateQueries({ queryKey: ["scripts"] });
        if (!cancelled) {
          navigate({
            to: "/editor/$scriptId",
            params: { scriptId: s.id },
            replace: true,
          });
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Gagal membuat script");
      } finally {
        if (!cancelled) setCreating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [scriptId, navigate, qc]);

  if (scriptId === "new" || creating) {
    return (
      <AppLayout>
        <div className="mx-auto max-w-3xl px-6 text-center text-sm text-muted-foreground">
          <Loader2 className="mx-auto h-5 w-5 animate-spin" />
          <p className="mt-2">Menyiapkan script baru…</p>
        </div>
      </AppLayout>
    );
  }

  return <EditorLoaded scriptId={scriptId} />;
}

type SaveStatus = "idle" | "typing" | "saving" | "saved" | "error";

function EditorLoaded({ scriptId }: { scriptId: string }) {
  const { data: script } = useSuspenseQuery(scriptDetailQuery(scriptId));
  const qc = useQueryClient();
  const router = useRouter();

  const [form, setForm] = useState<FormState>(() => ({
    title: script?.title ?? "",
    niche: script?.niche ?? "",
    idea: script?.idea ?? "",
    hook: script?.hook ?? "",
    retain: script?.retain ?? "",
    reward: script?.reward ?? "",
    cta: script?.cta ?? "",
  }));
  const [status, setStatus] = useState<SaveStatus>("idle");
  const dirtyRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const readingTime = useMemo(
    () =>
      computeReadingTime({
        hook: form.hook,
        retain: form.retain,
        reward: form.reward,
        cta: form.cta,
      }),
    [form.hook, form.retain, form.reward, form.cta],
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    dirtyRef.current = true;
    setForm((prev) => ({ ...prev, [key]: value }));
    setStatus("typing");
  }

  // Debounced auto-save
  useEffect(() => {
    if (!dirtyRef.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setStatus("saving");
      try {
        const full_script = buildFullScript(form);
        await updateScript(scriptId, {
          title: form.title,
          niche: form.niche || null,
          idea: form.idea,
          hook: form.hook,
          retain: form.retain,
          reward: form.reward,
          cta: form.cta,
          full_script,
          reading_time: readingTime,
        });
        dirtyRef.current = false;
        setStatus("saved");
        qc.invalidateQueries({ queryKey: ["scripts"] });
      } catch (e) {
        setStatus("error");
        toast.error(e instanceof Error ? e.message : "Auto-save gagal");
      }
    }, 2000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [form, readingTime, scriptId, qc]);

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/library">
              <ArrowLeft className="h-4 w-4" /> Kembali ke Library
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <SaveIndicator status={status} />
            <AIActions
              scriptId={scriptId}
              current={{
                hook: form.hook,
                retain: form.retain,
                reward: form.reward,
                cta: form.cta,
              }}
              onApplyFull={(p) => {
                dirtyRef.current = true;
                setForm((prev) => ({ ...prev, ...p }));
                setStatus("typing");
              }}
              onApplyHook={(h) => update("hook", h)}
            />
            <Button
              variant="secondary"
              onClick={() =>
                router.navigate({
                  to: "/teleprompter/$scriptId",
                  params: { scriptId },
                })
              }
            >
              <Mic className="h-4 w-4" /> Buka di Teleprompter
            </Button>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Badge variant="muted">Editor</Badge>
            <h1 className="mt-3 truncate text-2xl font-bold tracking-tight md:text-3xl">
              {form.title || "Untitled script"}
            </h1>
          </div>
          <p className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-3 py-2 text-sm text-foreground">
            <Clock className="h-4 w-4 text-electric" />
            Estimasi durasi: <span className="font-semibold">{readingTime} detik</span>
          </p>
        </div>

        <Card className="mt-6 space-y-5">
          <div className="grid gap-4 md:grid-cols-[1fr_220px]">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="e.g. 3 hook TikTok untuk launching produk"
              />
            </div>
            <div>
              <Label htmlFor="niche">Niche</Label>
              <select
                id="niche"
                value={form.niche}
                onChange={(e) => update("niche", e.target.value)}
                className="flex h-10 w-full rounded-xl border border-border bg-background/60 px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/40"
              >
                <option value="">Pilih niche…</option>
                {NICHES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label htmlFor="idea">Idea</Label>
            <Textarea
              id="idea"
              value={form.idea}
              onChange={(e) => update("idea", e.target.value)}
              placeholder="Tulis ide singkat untuk video ini…"
              className="min-h-[100px]"
            />
          </div>
        </Card>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <ScriptPart
            label="Hook"
            hint="3 detik pertama — bikin orang berhenti scroll."
            value={form.hook}
            onChange={(v) => update("hook", v)}
            accessory={
              <HookRegenButton scriptId={scriptId} onPick={(h) => update("hook", h)} />
            }
          />
          <ScriptPart
            label="Retain"
            hint="Jaga perhatian — beri konteks atau twist."
            value={form.retain}
            onChange={(v) => update("retain", v)}
          />
          <ScriptPart
            label="Reward"
            hint="Berikan value: tips, jawaban, atau payoff."
            value={form.reward}
            onChange={(v) => update("reward", v)}
          />
          <ScriptPart
            label="CTA"
            hint="Ajak action: follow, save, atau klik link."
            value={form.cta}
            onChange={(v) => update("cta", v)}
          />
        </div>
      </div>
    </AppLayout>
  );
}

function ScriptPart({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Card>
      <Label htmlFor={label}>{label}</Label>
      <p className="-mt-1 mb-2 text-[11px] text-muted-foreground">{hint}</p>
      <Textarea
        id={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[140px]"
        placeholder={`Tulis ${label.toLowerCase()}…`}
      />
    </Card>
  );
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  if (status === "idle") return null;
  if (status === "typing")
    return <span className="text-xs text-muted-foreground">Mengetik…</span>;
  if (status === "saving")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" /> Menyimpan…
      </span>
    );
  if (status === "saved")
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-[oklch(0.8_0.16_150)]">
        <Check className="h-3 w-3" /> Tersimpan
      </span>
    );
  return <span className="text-xs text-destructive">Gagal menyimpan</span>;
}

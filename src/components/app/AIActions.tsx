import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Sparkles, Wand2, Scissors, RefreshCw, Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/app/Button";
import { Card } from "@/components/app/Card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/app/Dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@tanstack/react-router";
import {
  regenerateHook,
  rewriteScript,
  shortenScript,
  type FourPartResult,
} from "@/lib/ai-edits.functions";

type LovableError = { code: string; message: string; plan?: string; limit?: number };

function extractLovable(err: unknown): LovableError | null {
  return (err as { lovable?: LovableError })?.lovable ?? null;
}

function handleError(err: unknown, fallback: string) {
  const lov = extractLovable(err);
  if (lov?.code === "rate_limited") {
    toast.error(lov.message, {
      action: { label: "Upgrade", onClick: () => (window.location.href = "/upgrade") },
    });
    return;
  }
  toast.error(lov?.message ?? (err instanceof Error ? err.message : fallback));
}

type Patch = { hook: string; retain: string; reward: string; cta: string };

export function AIActions({
  scriptId,
  current,
  onApplyFull,
  onApplyHook,
}: {
  scriptId: string;
  current: Patch;
  onApplyFull: (p: Patch) => void;
  onApplyHook: (hook: string) => void;
}) {
  const [preview, setPreview] = useState<
    | { kind: "rewrite"; style: string; data: FourPartResult }
    | { kind: "shorten"; seconds: number; data: FourPartResult }
    | null
  >(null);
  const [hookVariants, setHookVariants] = useState<string[] | null>(null);

  const rewriteMut = useMutation({
    mutationFn: (style: "santai" | "formal" | "lucu") =>
      rewriteScript({ data: { scriptId, style } }),
    onSuccess: (data, style) => {
      setPreview({ kind: "rewrite", style, data });
    },
    onError: (e) => handleError(e, "Gagal rewrite script"),
  });

  const shortenMut = useMutation({
    mutationFn: (targetSeconds: 15 | 30) =>
      shortenScript({ data: { scriptId, targetSeconds } }),
    onSuccess: (data, seconds) => {
      setPreview({ kind: "shorten", seconds, data });
    },
    onError: (e) => handleError(e, "Gagal mempersingkat script"),
  });

  const isLoading = rewriteMut.isPending || shortenMut.isPending;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="sm" disabled={isLoading}>
              {rewriteMut.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="h-4 w-4" />
              )}
              Rewrite
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px]">
            <DropdownMenuLabel>Pilih gaya</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => rewriteMut.mutate("santai")}>
              Lebih Santai
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => rewriteMut.mutate("formal")}>
              Lebih Formal
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => rewriteMut.mutate("lucu")}>
              Lebih Lucu
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="sm" disabled={isLoading}>
              {shortenMut.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Scissors className="h-4 w-4" />
              )}
              Persingkat
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px]">
            <DropdownMenuLabel>Target durasi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => shortenMut.mutate(30)}>
              ~30 detik
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => shortenMut.mutate(15)}>
              ~15 detik
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <PreviewDialog
        open={preview !== null}
        onClose={() => setPreview(null)}
        title={
          preview?.kind === "rewrite"
            ? `Rewrite — gaya ${preview.style}`
            : preview?.kind === "shorten"
              ? `Versi ringkas — ~${preview.seconds} detik`
              : ""
        }
        original={current}
        proposed={preview?.data ?? null}
        onAccept={() => {
          if (!preview) return;
          const p = preview.data;
          onApplyFull({ hook: p.hook, retain: p.retain, reward: p.reward, cta: p.cta });
          toast.success("Script diperbarui");
          setPreview(null);
        }}
      />

      <HookVariantsDialog
        variants={hookVariants}
        onClose={() => setHookVariants(null)}
        onPick={(v) => {
          onApplyHook(v);
          setHookVariants(null);
          toast.success("Hook diperbarui");
        }}
      />

      {/* Hook regenerate is rendered separately via HookRegenButton */}
      <span data-ai-actions-root hidden />
      <HookRegenSetup
        scriptId={scriptId}
        onVariants={setHookVariants}
      />
    </>
  );
}

// --- Hook regenerator standalone button (exported separately) ---

export function HookRegenButton({
  scriptId,
  onPick,
}: {
  scriptId: string;
  onPick: (hook: string) => void;
}) {
  const [variants, setVariants] = useState<string[] | null>(null);
  const mut = useMutation({
    mutationFn: () => regenerateHook({ data: { scriptId } }),
    onSuccess: (r) => setVariants(r.variants),
    onError: (e) => handleError(e, "Gagal regenerate hook"),
  });

  return (
    <>
      <button
        type="button"
        onClick={() => mut.mutate()}
        disabled={mut.isPending}
        className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2 py-1 text-[11px] text-muted-foreground transition-colors hover:border-electric/40 hover:text-foreground disabled:opacity-60"
        title="Generate variasi hook baru"
      >
        {mut.isPending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Sparkles className="h-3 w-3 text-electric" />
        )}
        AI hooks
      </button>
      <HookVariantsDialog
        variants={variants}
        onClose={() => setVariants(null)}
        onPick={(v) => {
          onPick(v);
          setVariants(null);
          toast.success("Hook diperbarui");
        }}
      />
    </>
  );
}

// Internal no-op (kept so existing flow without separate button still compiles)
function HookRegenSetup(_: { scriptId: string; onVariants: (v: string[]) => void }) {
  return null;
}

function PreviewDialog({
  open,
  onClose,
  title,
  original,
  proposed,
  onAccept,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  original: Patch;
  proposed: FourPartResult | null;
  onAccept: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Bandingkan dulu sebelum mengganti script. Estimasi durasi baru:{" "}
            <span className="font-semibold text-foreground">
              {proposed?.readingTime ?? "—"} detik
            </span>
            .
          </DialogDescription>
        </DialogHeader>
        {proposed && (
          <div className="grid max-h-[60vh] gap-3 overflow-y-auto pr-1">
            {(["hook", "retain", "reward", "cta"] as const).map((k) => (
              <Card key={k} className="space-y-2 p-4">
                <div className="text-xs font-semibold uppercase tracking-wider text-electric">
                  {k}
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  <div>
                    <div className="mb-1 text-[10px] uppercase text-muted-foreground">
                      Sebelum
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                      {original[k] || "(kosong)"}
                    </p>
                  </div>
                  <div>
                    <div className="mb-1 text-[10px] uppercase text-electric/80">
                      Sesudah
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-foreground">
                      {proposed[k]}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
        <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" /> Tolak
          </Button>
          <Button onClick={onAccept}>
            <Check className="h-4 w-4" /> Terima & ganti
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function HookVariantsDialog({
  variants,
  onClose,
  onPick,
}: {
  variants: string[] | null;
  onClose: () => void;
  onPick: (v: string) => void;
}) {
  return (
    <Dialog open={variants !== null} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Pilih hook baru</DialogTitle>
          <DialogDescription>
            Klik salah satu variasi untuk menggantikan hook saat ini.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          {variants?.map((v, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onPick(v)}
              className="group rounded-2xl border border-border bg-surface p-4 text-left transition-all hover:border-electric/50 hover:bg-electric/5"
            >
              <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                Variasi {i + 1}
              </div>
              <p className="text-sm text-foreground">{v}</p>
              <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-electric opacity-0 transition-opacity group-hover:opacity-100">
                <RefreshCw className="h-3 w-3" /> Gunakan
              </span>
            </button>
          ))}
        </div>
        <div className="flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Batal
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Habis kuota?{" "}
          <Link to="/upgrade" className="text-electric hover:underline">
            Upgrade plan
          </Link>
          .
        </p>
      </DialogContent>
    </Dialog>
  );
}

import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/app/AppLayout";
import { Card } from "@/components/app/Card";
import { Button } from "@/components/app/Button";
import { Input } from "@/components/app/Input";
import { Badge } from "@/components/app/Badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/app/Dialog";
import {
  FilePlus,
  Search,
  Star,
  Clock,
  Copy,
  Trash2,
  Pencil,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  createScript,
  deleteScript,
  duplicateScript,
  scriptsListQuery,
  toggleFavorite,
  profileQuery,
  type ScriptRow,
} from "@/lib/scripts";
import { NICHES } from "@/lib/niches";

export const Route = createFileRoute("/_authenticated/library")({
  head: () => ({
    meta: [
      { title: "Library — ScriptFlow" },
      { name: "description", content: "All your saved short-video scripts." },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(scriptsListQuery()),
      context.queryClient.ensureQueryData(profileQuery()),
    ]);
  },
  component: LibraryPage,
});

function LibraryPage() {
  const { data: scripts } = useSuspenseQuery(scriptsListQuery());
  const { data: profile } = useSuspenseQuery(profileQuery());
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [nicheFilter, setNicheFilter] = useState<string>("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ScriptRow | null>(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["scripts"] });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return scripts.filter((s) => {
      if (favoritesOnly && !s.is_favorite) return false;
      if (nicheFilter !== "all" && (s.niche ?? "") !== nicheFilter) return false;
      if (q) {
        const inTitle = (s.title ?? "").toLowerCase().includes(q);
        const inIdea = (s.idea ?? "").toLowerCase().includes(q);
        if (!inTitle && !inIdea) return false;
      }
      return true;
    });
  }, [scripts, search, nicheFilter, favoritesOnly]);

  async function handleCreate() {
    try {
      const s = await createScript({ niche: profile?.preferred_niche ?? null });
      invalidate();
      navigate({ to: "/editor/$scriptId", params: { scriptId: s.id } });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal membuat script");
    }
  }

  async function handleDuplicate(s: ScriptRow) {
    try {
      await duplicateScript(s.id);
      invalidate();
      toast.success("Script di-duplicate");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal duplicate");
    }
  }

  async function handleToggleFavorite(s: ScriptRow) {
    try {
      await toggleFavorite(s.id, !s.is_favorite);
      invalidate();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal update favorit");
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    try {
      await deleteScript(pendingDelete.id);
      invalidate();
      toast.success("Script dihapus");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menghapus");
    } finally {
      setPendingDelete(null);
    }
  }

  const hasAnyScript = scripts.length > 0;
  const hasFilters = search.trim() || nicheFilter !== "all" || favoritesOnly;

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Badge variant="muted">Library</Badge>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-gradient md:text-4xl">
              Script kamu
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Cari, atur, dan buka ulang script yang sudah kamu buat.
            </p>
          </div>
          <Button size="lg" onClick={handleCreate}>
            <FilePlus className="h-4 w-4" /> Buat Script Baru
          </Button>
        </div>

        {hasAnyScript && (
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Cari berdasarkan title atau idea…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              value={nicheFilter}
              onChange={(e) => setNicheFilter(e.target.value)}
              className="h-10 rounded-xl border border-border bg-background/60 px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/40"
            >
              <option value="all">Semua niche</option>
              {NICHES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <Button
              variant={favoritesOnly ? "primary" : "secondary"}
              onClick={() => setFavoritesOnly((v) => !v)}
            >
              <Star className={"h-4 w-4 " + (favoritesOnly ? "fill-current" : "")} />
              Favorit
            </Button>
            {hasFilters && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearch("");
                  setNicheFilter("all");
                  setFavoritesOnly(false);
                }}
              >
                <X className="h-4 w-4" /> Reset
              </Button>
            )}
          </div>
        )}

        {!hasAnyScript ? (
          <Card className="mt-10 flex flex-col items-center gap-3 py-16 text-center" variant="muted">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-electric/10 text-electric">
              <FilePlus className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold">Belum ada script</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              Yuk mulai script pertamamu. Kamu bisa isi manual dulu — nanti tinggal pakai AI generate.
            </p>
            <Button className="mt-2" onClick={handleCreate}>
              <FilePlus className="h-4 w-4" /> Buat Script Pertama
            </Button>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="mt-10 flex flex-col items-center gap-3 py-12 text-center" variant="muted">
            <h3 className="text-base font-semibold">Tidak ada hasil</h3>
            <p className="max-w-sm text-sm text-muted-foreground">
              Coba ganti kata kunci atau reset filter.
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                setSearch("");
                setNicheFilter("all");
                setFavoritesOnly(false);
              }}
            >
              Reset filter
            </Button>
          </Card>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s) => (
              <Card key={s.id} className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{s.niche ?? "Tanpa niche"}</Badge>
                  <button
                    aria-label="Toggle favorite"
                    onClick={() => handleToggleFavorite(s)}
                    className="text-muted-foreground hover:text-electric"
                  >
                    <Star
                      className={
                        "h-4 w-4 " +
                        (s.is_favorite ? "fill-electric text-electric" : "")
                      }
                    />
                  </button>
                </div>
                <div>
                  <h3 className="line-clamp-2 text-base font-semibold">
                    {s.title || "Untitled script"}
                  </h3>
                  {s.idea && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {s.idea}
                    </p>
                  )}
                </div>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {s.reading_time ?? 0} detik
                </p>
                <div className="mt-auto flex items-center gap-2">
                  <Button asChild size="sm" variant="secondary" className="flex-1">
                    <Link to="/editor/$scriptId" params={{ scriptId: s.id }}>
                      <Pencil className="h-3.5 w-3.5" /> Edit
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDuplicate(s)}
                    aria-label="Duplicate"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setPendingDelete(s)}
                    aria-label="Delete"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus script ini?</DialogTitle>
            <DialogDescription>
              "{pendingDelete?.title || "Untitled script"}" akan dihapus permanen. Aksi ini tidak bisa di-undo.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setPendingDelete(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              <Trash2 className="h-4 w-4" /> Hapus
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

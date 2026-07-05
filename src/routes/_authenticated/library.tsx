import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/app/Select";
import { useMemo, useState } from "react";
import { createFileRoute, Link, } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
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
  Folder,
  FolderPlus,
  Inbox,
  FolderInput,
  MoreHorizontal,
  MonitorPlay,
} from "lucide-react";
import { toast } from "sonner";
import {
  deleteScript,
  duplicateScript,
  scriptsListQuery,
  toggleFavorite,
  profileQuery,
  type ScriptRow,
} from "@/lib/scripts";
import { NICHES } from "@/lib/niches";
import {
  listFoldersFn,
  createFolderFn,
  deleteFolderFn,
  assignScriptToFolderFn,
  foldersQuery,
  type FolderSummary,
} from "@/lib/folders.functions";

export const Route = createFileRoute("/_authenticated/library")({
  head: () => ({
    meta: [
      { title: "Library — ScriptFlow" },
      { name: "description", content: "All your saved short-video scripts." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { folder?: string } => ({
    folder: typeof search.folder === "string" ? search.folder : undefined,
  }),
  loader: async ({ context }) => {
    const getFolders = () => listFoldersFn();
    await Promise.all([
      context.queryClient.ensureQueryData(scriptsListQuery()),
      context.queryClient.ensureQueryData(profileQuery()),
      context.queryClient.ensureQueryData(foldersQuery(getFolders)),
    ]);
  },
  component: LibraryPage,
});

type FolderFilter = "all" | "uncategorized" | string;

function LibraryPage() {
  const qc = useQueryClient();
  const navigate = Route.useNavigate();
  const { folder } = Route.useSearch();
  const listFolders = useServerFn(listFoldersFn);
  const createFolder = useServerFn(createFolderFn);
  const deleteFolder = useServerFn(deleteFolderFn);
  const assignFolder = useServerFn(assignScriptToFolderFn);

  const { data: scripts } = useSuspenseQuery(scriptsListQuery());
  const { data: folders } = useSuspenseQuery(foldersQuery(() => listFolders()));

  const [search, setSearch] = useState("");
  const [nicheFilter, setNicheFilter] = useState<string>("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  // Folder filter lives in the URL (?folder=) so Sidebar links can deep-link
  // straight into a filtered view, and back/forward + refresh keep working.
  const folderFilter: FolderFilter = folder ?? "all";
  function setFolderFilter(next: FolderFilter) {
    navigate({
      search: (prev) => ({
        ...prev,
        folder: next === "all" ? undefined : next,
      }),
      replace: true,
    });
  }
  const [pendingDelete, setPendingDelete] = useState<ScriptRow | null>(null);
  const [pendingFolderDelete, setPendingFolderDelete] =
    useState<FolderSummary | null>(null);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [moveTarget, setMoveTarget] = useState<ScriptRow | null>(null);

  const invalidateScripts = () =>
    qc.invalidateQueries({ queryKey: ["scripts"] });
  const invalidateFolders = () =>
    qc.invalidateQueries({ queryKey: ["folders"] });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return scripts.filter((s) => {
      if (folderFilter === "uncategorized" && s.folder_id) return false;
      if (
        folderFilter !== "all" &&
        folderFilter !== "uncategorized" &&
        s.folder_id !== folderFilter
      )
        return false;
      if (favoritesOnly && !s.is_favorite) return false;
      if (nicheFilter !== "all" && (s.niche ?? "") !== nicheFilter) return false;
      if (q) {
        const inTitle = (s.title ?? "").toLowerCase().includes(q);
        const inIdea = (s.idea ?? "").toLowerCase().includes(q);
        if (!inTitle && !inIdea) return false;
      }
      return true;
    });
  }, [scripts, search, nicheFilter, favoritesOnly, folderFilter]);

  async function handleDuplicate(s: ScriptRow) {
    try {
      await duplicateScript(s.id);
      invalidateScripts();
      toast.success("Script di-duplicate");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Gagal duplicate";
      if (msg.includes("free_plan_script_limit_reached")) {
        toast.error("Library penuh — upgrade ke Premium untuk menyimpan lebih banyak.");
      } else {
        toast.error(msg);
      }
    }
  }

  async function handleToggleFavorite(s: ScriptRow) {
    try {
      await toggleFavorite(s.id, !s.is_favorite);
      invalidateScripts();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal update favorit");
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    try {
      await deleteScript(pendingDelete.id);
      invalidateScripts();
      toast.success("Script dihapus");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menghapus");
    } finally {
      setPendingDelete(null);
    }
  }

  async function handleCreateFolder() {
    const name = newFolderName.trim();
    if (!name) return;
    try {
      await createFolder({ data: { name } });
      invalidateFolders();
      setNewFolderName("");
      setNewFolderOpen(false);
      toast.success(`Folder "${name}" dibuat`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal membuat folder");
    }
  }

  async function handleDeleteFolder() {
    if (!pendingFolderDelete) return;
    try {
      await deleteFolder({ data: { id: pendingFolderDelete.id } });
      invalidateFolders();
      invalidateScripts();
      if (folderFilter === pendingFolderDelete.id) setFolderFilter("all");
      toast.success("Folder dihapus. Script di dalamnya tetap aman.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal menghapus folder");
    } finally {
      setPendingFolderDelete(null);
    }
  }

  async function handleMove(folderId: string | null) {
    if (!moveTarget) return;
    try {
      await assignFolder({ data: { scriptId: moveTarget.id, folderId } });
      invalidateScripts();
      invalidateFolders();
      toast.success(folderId ? "Script dipindahkan" : "Script dikeluarkan dari folder");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal memindahkan");
    } finally {
      setMoveTarget(null);
    }
  }

  const hasAnyScript = scripts.length > 0;
  const hasFilters =
    search.trim() ||
    nicheFilter !== "all" ||
    favoritesOnly ||
    folderFilter !== "all";

  const uncategorizedCount = scripts.filter((s) => !s.folder_id).length;

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 sm:flex sm:flex-wrap sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <Badge variant="muted">Library</Badge>
            <h1 className="mt-3 truncate text-2xl font-bold tracking-tight text-gradient sm:text-3xl md:text-4xl">
              Script kamu
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Cari, atur, dan buka ulang script yang sudah kamu buat.
            </p>
          </div>
          <Button asChild size="lg" className="shrink-0">
            <Link to="/generator">
              <FilePlus className="h-4 w-4" />
              <span className="hidden sm:inline">Buat Script Baru</span>
              <span className="sm:hidden">Baru</span>
            </Link>
          </Button>
        </div>

        <div className="mt-6 md:mt-8 md:grid md:gap-6 md:grid-cols-[240px_1fr]">
          {/* SIDEBAR / mobile chip strip */}
          <aside className="md:space-y-1">
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Folder
              </p>
              <button
                onClick={() => setNewFolderOpen(true)}
                className="rounded-md p-1 text-muted-foreground hover:text-electric"
                aria-label="Buat folder baru"
              >
                <FolderPlus className="h-4 w-4" />
              </button>
            </div>

            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-col md:gap-1 md:overflow-visible md:px-0 md:pb-0">
              <FolderTab
                active={folderFilter === "all"}
                onClick={() => setFolderFilter("all")}
                icon={Inbox}
                label="Semua"
                count={scripts.length}
              />
              <FolderTab
                active={folderFilter === "uncategorized"}
                onClick={() => setFolderFilter("uncategorized")}
                icon={Inbox}
                label="Tanpa folder"
                count={uncategorizedCount}
              />
              {folders.length === 0 ? (
                <p className="hidden px-2 py-3 text-xs text-muted-foreground md:block">
                  Belum ada folder. Klik <FolderPlus className="inline h-3 w-3" />{" "}
                  untuk membuat.
                </p>
              ) : (
                folders.map((f) => (
                  <FolderTab
                    key={f.id}
                    active={folderFilter === f.id}
                    onClick={() => setFolderFilter(f.id)}
                    icon={Folder}
                    label={f.name}
                    count={f.script_count}
                    onDelete={() => setPendingFolderDelete(f)}
                  />
                ))
              )}
            </div>
          </aside>


          {/* MAIN */}
          <div>
            {hasAnyScript && (
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[240px] flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Cari berdasarkan title atau idea…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Select value={nicheFilter} onValueChange={setNicheFilter}>
                  <SelectTrigger className="h-10 w-auto min-w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua niche</SelectItem>
                    {NICHES.map((n) => (
                      <SelectItem key={n} value={n}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                      setFolderFilter("all");
                    }}
                  >
                    <X className="h-4 w-4" /> Reset
                  </Button>
                )}
              </div>
            )}

            {!hasAnyScript ? (
              <Card
                className="mt-10 flex flex-col items-center gap-3 py-16 text-center"
                variant="muted"
              >
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-electric/10 text-electric">
                  <FilePlus className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold">Belum ada script</h3>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Yuk mulai script pertamamu. Kamu bisa isi manual dulu — nanti
                  tinggal pakai AI generate.
                </p>
                <Button asChild className="mt-2">
                  <Link to="/generator">
                    <FilePlus className="h-4 w-4" /> Buat Script Pertama
                  </Link>
                </Button>
              </Card>
            ) : filtered.length === 0 ? (
              <Card
                className="mt-8 flex flex-col items-center gap-3 py-12 text-center"
                variant="muted"
              >
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
                    setFolderFilter("all");
                  }}
                >
                  Reset filter
                </Button>
              </Card>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((s) => {
                  const folder = folders.find((f) => f.id === s.folder_id);
                  return (
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
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {s.reading_time ?? 0} detik
                        </span>
                        {folder && (
                          <span className="flex items-center gap-1.5 text-electric">
                            <Folder className="h-3.5 w-3.5" />
                            {folder.name}
                          </span>
                        )}
                      </div>
                      <div className="mt-auto flex items-center gap-2">
                        <Button
                          asChild
                          size="sm"
                          variant="secondary"
                          className="flex-1"
                        >
                          <Link
                            to="/editor/$scriptId"
                            params={{ scriptId: s.id }}
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </Link>
                        </Button>
                        <Button asChild size="sm" variant="ghost" aria-label="Buka di Teleprompter" title="Buka di Teleprompter">
                          <Link to="/teleprompter/$scriptId" params={{ scriptId: s.id }}>
                            <MonitorPlay className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setMoveTarget(s)}
                          aria-label="Pindah folder"
                          title="Pindah ke folder"
                        >
                          <FolderInput className="h-3.5 w-3.5" />
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
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete script */}
      <Dialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus script ini?</DialogTitle>
            <DialogDescription>
              "{pendingDelete?.title || "Untitled script"}" akan dihapus permanen.
              Aksi ini tidak bisa di-undo.
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

      {/* Delete folder */}
      <Dialog
        open={pendingFolderDelete !== null}
        onOpenChange={(open) => !open && setPendingFolderDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus folder ini?</DialogTitle>
            <DialogDescription>
              Folder "{pendingFolderDelete?.name}" akan dihapus. Script di dalamnya{" "}
              <strong>tidak ikut terhapus</strong> — folder-nya saja yang dilepas.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => setPendingFolderDelete(null)}
            >
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteFolder}>
              <Trash2 className="h-4 w-4" /> Hapus folder
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create folder */}
      <Dialog open={newFolderOpen} onOpenChange={setNewFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buat folder baru</DialogTitle>
            <DialogDescription>
              Folder bantu kamu mengelompokkan script berdasarkan campaign atau klien.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-3 space-y-3">
            <Input
              autoFocus
              placeholder="Misal: Brand Skincare Q1"
              maxLength={60}
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateFolder();
              }}
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setNewFolderOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
                <FolderPlus className="h-4 w-4" /> Buat folder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Move to folder */}
      <Dialog
        open={moveTarget !== null}
        onOpenChange={(open) => !open && setMoveTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pindahkan script</DialogTitle>
            <DialogDescription>
              Pilih folder tujuan untuk "{moveTarget?.title || "Untitled script"}".
            </DialogDescription>
          </DialogHeader>
          <div className="mt-3 max-h-72 space-y-1 overflow-auto">
            <MoveOption
              icon={Inbox}
              label="Tanpa folder"
              active={!moveTarget?.folder_id}
              onClick={() => handleMove(null)}
            />
            {folders.map((f) => (
              <MoveOption
                key={f.id}
                icon={Folder}
                label={f.name}
                active={moveTarget?.folder_id === f.id}
                onClick={() => handleMove(f.id)}
              />
            ))}
            {folders.length === 0 && (
              <p className="px-2 py-4 text-center text-xs text-muted-foreground">
                Belum ada folder. Tutup dialog ini dan klik{" "}
                <FolderPlus className="inline h-3 w-3" /> di sidebar untuk membuat.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

function FolderTab({
  active,
  onClick,
  icon: Icon,
  label,
  count,
  onDelete,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  count: number;
  onDelete?: () => void;
}) {
  return (
    <div
      className={
        "group flex shrink-0 items-center gap-1 rounded-xl border transition-colors md:shrink " +
        (active
          ? "border-electric/40 bg-electric/10"
          : "border-border/40 bg-surface/40 hover:bg-surface md:border-transparent md:bg-transparent")
      }
    >
      <button
        onClick={onClick}
        className="flex flex-1 items-center gap-2 px-3 py-2 text-left text-sm"
      >
        <Icon
          className={
            "h-4 w-4 shrink-0 " +
            (active ? "text-electric" : "text-muted-foreground")
          }
        />
        <span className="flex-1 truncate">{label}</span>
        <span className="text-xs text-muted-foreground">{count}</span>
      </button>
      {onDelete && (
        <button
          onClick={onDelete}
          aria-label={`Hapus folder ${label}`}
          className="mr-1 rounded-md p-1 text-muted-foreground opacity-70 hover:bg-background hover:text-destructive md:opacity-0 md:group-hover:opacity-100"
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function MoveOption({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-colors " +
        (active
          ? "border-electric/40 bg-electric/10 text-electric"
          : "border-border hover:bg-surface")
      }
    >
      <Icon className="h-4 w-4" />
      <span className="flex-1 truncate">{label}</span>
      {active && <span className="text-xs text-electric">Saat ini</span>}
    </button>
  );
}
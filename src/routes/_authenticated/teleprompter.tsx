import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/app/AppLayout";
import { Card } from "@/components/app/Card";
import { Input } from "@/components/app/Input";
import { Badge } from "@/components/app/Badge";
import { Search, Clock, MonitorPlay, FilePlus } from "lucide-react";
import { Button } from "@/components/app/Button";
import { scriptsListQuery } from "@/lib/scripts";

export const Route = createFileRoute("/_authenticated/teleprompter")({
    head: () => ({
        meta: [
            { title: "Teleprompter — ScriptFlow" },
            {
                name: "description",
                content: "Pilih script untuk mulai latihan baca di Teleprompter.",
            },
        ],
    }),
    loader: async ({ context }) => {
        await context.queryClient.ensureQueryData(scriptsListQuery());
    },
    component: TeleprompterPickerPage,
});

function TeleprompterPickerPage() {
    const { data: scripts } = useSuspenseQuery(scriptsListQuery());
    const [search, setSearch] = useState("");

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return scripts;
        return scripts.filter((s) => (s.title ?? "").toLowerCase().includes(q));
    }, [scripts, search]);

    return (
        <AppLayout>
            <div className="mx-auto max-w-5xl px-4 sm:px-6">
                <Badge variant="muted">Teleprompter</Badge>
                <h1 className="mt-3 text-2xl font-bold tracking-tight text-gradient sm:text-3xl">
                    Pilih script untuk dibaca
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Klik salah satu script untuk langsung masuk mode Teleprompter — tidak perlu lewat Editor.
                </p>

                {scripts.length > 0 && (
                    <div className="relative mt-6 max-w-sm">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            className="pl-9"
                            placeholder="Cari script…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                )}

                {scripts.length === 0 ? (
                    <Card className="mt-8 flex flex-col items-center gap-3 py-16 text-center" variant="muted">
                        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-electric/10 text-electric">
                            <MonitorPlay className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-semibold">Belum ada script</h3>
                        <p className="max-w-sm text-sm text-muted-foreground">
                            Buat script dulu, baru bisa dipakai latihan di Teleprompter.
                        </p>
                        <Button asChild className="mt-2">
                            <Link to="/generator">
                                <FilePlus className="h-4 w-4" /> Buat Script Pertama
                            </Link>
                        </Button>
                    </Card>
                ) : filtered.length === 0 ? (
                    <p className="mt-8 text-sm text-muted-foreground">Tidak ada script yang cocok.</p>
                ) : (
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {filtered.map((s) => (
                            <Link
                                key={s.id}
                                to="/teleprompter/$scriptId"
                                params={{ scriptId: s.id }}
                                className="group flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 text-left shadow-soft transition-transform hover:-translate-y-0.5"
                            >
                                <div className="flex items-center justify-between">
                                    <Badge variant="outline">{s.niche ?? "Tanpa niche"}</Badge>
                                    <MonitorPlay className="h-4 w-4 text-muted-foreground group-hover:text-electric" />
                                </div>
                                <h3 className="line-clamp-2 text-base font-semibold">
                                    {s.title || "Untitled script"}
                                </h3>
                                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Clock className="h-3.5 w-3.5" />
                                    {s.reading_time ?? 0} detik
                                </p>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { AppLayout } from "@/components/app/AppLayout";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/app/Card";
import { Button } from "@/components/app/Button";
import { Badge } from "@/components/app/Badge";
import { FilePlus, Library, Star, Clock, ArrowRight, Zap, Database, Sparkles } from "lucide-react";
import {
  profileQuery,
  scriptsCountsQuery,
  scriptsRecentQuery,
} from "@/lib/scripts";
import { getQuotaSummaryFn, type QuotaSummary } from "@/lib/quota.functions";

const quotaQuery = (fn: () => Promise<QuotaSummary>) =>
  queryOptions({ queryKey: ["quota", "summary"], queryFn: fn });

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — ScriptFlow" },
      { name: "description", content: "Your ScriptFlow workspace overview." },
    ],
  }),
  loader: async ({ context }) => {
    const getQuota = () => getQuotaSummaryFn();
    await Promise.all([
      context.queryClient.ensureQueryData(profileQuery()),
      context.queryClient.ensureQueryData(scriptsCountsQuery()),
      context.queryClient.ensureQueryData(scriptsRecentQuery(5)),
      context.queryClient.ensureQueryData(quotaQuery(getQuota)),
    ]);
  },
  component: DashboardPage,
});

function DashboardPage() {
  const getQuota = useServerFn(getQuotaSummaryFn);
  const { data: profile } = useSuspenseQuery(profileQuery());
  const { data: counts } = useSuspenseQuery(scriptsCountsQuery());
  const { data: recent } = useSuspenseQuery(scriptsRecentQuery(5));
  const { data: quota } = useSuspenseQuery(quotaQuery(() => getQuota()));

  const displayName = profile?.name?.trim() || "Creator";

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Badge variant="muted">Workspace</Badge>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-gradient md:text-4xl">
              Halo, {displayName} 👋
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Niche: <span className="text-foreground">{profile?.preferred_niche ?? "—"}</span>
            </p>
          </div>
          <Button asChild size="lg">
            <Link to="/generator">
              <FilePlus className="h-4 w-4" /> Buat Script Baru
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <StatCard icon={Library} label="Total scripts" value={counts.total} />
          <StatCard icon={Star} label="Favorit" value={counts.favorites} />
        </div>

        <QuotaPanel quota={quota} />

        <div className="mt-10 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Script terbaru</h2>
            <p className="text-sm text-muted-foreground">5 script terakhir kamu sentuh.</p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/library">
              Lihat semua <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {recent.length === 0 ? (
          <Card className="mt-4" variant="muted">
            <CardHeader>
              <CardTitle>Belum ada script</CardTitle>
              <CardDescription>
                Mulai dengan membuat script pertamamu — isi manual atau lanjutkan lewat AI nanti.
              </CardDescription>
            </CardHeader>
            <Button asChild>
              <Link to="/generator">
                <FilePlus className="h-4 w-4" /> Buat Script Pertama
              </Link>
            </Button>
          </Card>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recent.map((s) => (
              <Link
                key={s.id}
                to="/editor/$scriptId"
                params={{ scriptId: s.id }}
                className="group rounded-2xl border border-border bg-surface p-5 text-left shadow-soft transition-transform hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{s.niche ?? "Tanpa niche"}</Badge>
                  <Star
                    className={
                      "h-4 w-4 " +
                      (s.is_favorite
                        ? "fill-electric text-electric"
                        : "text-muted-foreground")
                    }
                  />
                </div>
                <h3 className="mt-3 line-clamp-2 text-base font-semibold">
                  {s.title || "Untitled script"}
                </h3>
                <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
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

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
}) {
  return (
    <Card className="flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold text-gradient-accent">{value}</p>
      </div>
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-background text-electric ring-1 ring-border">
        <Icon className="h-5 w-5" />
      </div>
    </Card>
  );
}

function QuotaPanel({ quota }: { quota: QuotaSummary }) {
  const genPct = Math.min(
    100,
    Math.round((quota.generationsToday / quota.generationLimit) * 100),
  );
  const scriptPct =
    quota.scriptLimit == null
      ? null
      : Math.min(100, Math.round((quota.scriptsUsed / quota.scriptLimit) * 100));
  const genFull = quota.generationsToday >= quota.generationLimit;
  const scriptFull =
    quota.scriptLimit != null && quota.scriptsUsed >= quota.scriptLimit;

  return (
    <Card className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Kuota
          </p>
          <p className="mt-1 text-sm">
            Plan saat ini:{" "}
            <span className="font-semibold text-electric capitalize">
              {quota.plan}
            </span>
          </p>
        </div>
        {quota.plan === "free" && (
          <Button asChild size="sm" variant="secondary">
            <Link to="/upgrade">
              <Sparkles className="h-3.5 w-3.5" /> Upgrade
            </Link>
          </Button>
        )}
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <QuotaBar
          icon={Zap}
          label="Generate hari ini"
          value={`${quota.generationsToday} dari ${quota.generationLimit} generate hari ini`}
          pct={genPct}
          warn={genFull}
        />
        {quota.scriptLimit == null ? (
          <QuotaBar
            icon={Database}
            label="Script tersimpan"
            value={`${quota.scriptsUsed} script tersimpan (tanpa batas)`}
            pct={0}
            unlimited
          />
        ) : (
          <QuotaBar
            icon={Database}
            label="Script tersimpan"
            value={`${quota.scriptsUsed} dari ${quota.scriptLimit} script tersimpan`}
            pct={scriptPct ?? 0}
            warn={scriptFull}
          />
        )}
      </div>

      {scriptFull && (
        <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          Library penuh — hapus script lama atau{" "}
          <Link to="/upgrade" className="underline">
            upgrade ke Premium
          </Link>{" "}
          untuk menyimpan lebih banyak.
        </p>
      )}
    </Card>
  );
}

function QuotaBar({
  icon: Icon,
  label,
  value,
  pct,
  warn,
  unlimited,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  pct: number;
  warn?: boolean;
  unlimited?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-4">
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-electric/10 text-electric">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          <p
            className={
              "mt-0.5 truncate text-sm font-medium " +
              (warn ? "text-destructive" : "")
            }
          >
            {value}
          </p>
        </div>
      </div>
      {!unlimited && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
          <div
            className={
              "h-full rounded-full transition-all " +
              (warn ? "bg-destructive" : "bg-electric")
            }
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

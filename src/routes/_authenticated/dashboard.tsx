import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/app/AppLayout";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/app/Card";
import { Button } from "@/components/app/Button";
import { Badge } from "@/components/app/Badge";
import { Sparkles, FilePlus, Library, Clock, Mic } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — ScriptFlow" },
      { name: "description", content: "Your ScriptFlow workspace overview." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Badge variant="muted">Workspace</Badge>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-gradient md:text-4xl">
              Welcome back 👋
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick up where you left off, or start a new script.
            </p>
          </div>
          <Button asChild size="lg">
            <Link to="/editor/$scriptId" params={{ scriptId: "new" }}>
              <FilePlus className="h-4 w-4" /> New Script
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <StatCard icon={Sparkles} label="AI generations today" value="0 / 5" />
          <StatCard icon={Library} label="Scripts saved" value="0" />
          <StatCard icon={Clock} label="Time saved" value="0 min" />
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Card variant="glow">
            <CardHeader>
              <CardTitle>Generate your first script</CardTitle>
              <CardDescription>
                Type an idea, pick a style, and let ScriptFlow draft a short-video script in seconds.
              </CardDescription>
            </CardHeader>
            <Button asChild>
              <Link to="/editor/$scriptId" params={{ scriptId: "new" }}>
                <Sparkles className="h-4 w-4" /> Start with AI
              </Link>
            </Button>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Practice mode</CardTitle>
              <CardDescription>
                Open any script in the built-in teleprompter and rehearse before recording.
              </CardDescription>
            </CardHeader>
            <Button asChild variant="secondary">
              <Link to="/teleprompter/$scriptId" params={{ scriptId: "demo" }}>
                <Mic className="h-4 w-4" /> Try Teleprompter
              </Link>
            </Button>
          </Card>
        </div>

        <Card className="mt-10" variant="muted">
          <CardHeader>
            <CardTitle>Recent scripts</CardTitle>
            <CardDescription>You haven't created any scripts yet.</CardDescription>
          </CardHeader>
          <div className="rounded-xl border border-dashed border-border bg-background/40 p-10 text-center text-sm text-muted-foreground">
            Your scripts will show up here.
          </div>
        </Card>
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
  value: string;
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

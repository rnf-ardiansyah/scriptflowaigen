import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/app/AppLayout";
import { Button } from "@/components/app/Button";
import { Badge } from "@/components/app/Badge";
import { Play, Pause, Settings2 } from "lucide-react";

export const Route = createFileRoute("/teleprompter/$scriptId")({
  head: ({ params }) => ({
    meta: [
      { title: `Teleprompter — ${params.scriptId} · ScriptFlow` },
      { name: "description", content: "Rehearse your script in the built-in teleprompter." },
    ],
  }),
  component: TeleprompterPage,
});

function TeleprompterPage() {
  const { scriptId } = Route.useParams();
  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl px-6">
        <div className="flex items-center justify-between">
          <div>
            <Badge variant="outline">● LIVE</Badge>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-gradient md:text-3xl">
              Teleprompter · {scriptId}
            </h1>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link to="/editor/$scriptId" params={{ scriptId }}>Back to editor</Link>
          </Button>
        </div>

        <div className="glass-panel mt-8 rounded-2xl p-10 shadow-elevated">
          <p className="mx-auto max-w-2xl text-center text-2xl leading-relaxed text-foreground md:text-3xl">
            Hook: Most creators waste 2 hours staring at a blank screen.
            <br />
            <span className="text-muted-foreground">
              Here's a 60-second script that fixes that — instantly.
            </span>
          </p>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Button variant="secondary" size="lg">
            <Pause className="h-4 w-4" /> Pause
          </Button>
          <Button size="lg">
            <Play className="h-4 w-4" /> Start
          </Button>
          <Button variant="ghost" size="lg">
            <Settings2 className="h-4 w-4" /> Speed
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}

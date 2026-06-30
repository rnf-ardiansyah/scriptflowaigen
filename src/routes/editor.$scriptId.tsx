import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/app/AppLayout";
import { Button } from "@/components/app/Button";
import { Badge } from "@/components/app/Badge";
import { Card } from "@/components/app/Card";
import { Input, Label, Textarea } from "@/components/app/Input";
import { Sparkles, Mic, Save } from "lucide-react";

export const Route = createFileRoute("/editor/$scriptId")({
  head: ({ params }) => ({
    meta: [
      { title: `Editor — ${params.scriptId} · ScriptFlow` },
      { name: "description", content: "Edit and refine your short-video script." },
    ],
  }),
  component: EditorPage,
});

function EditorPage() {
  const { scriptId } = Route.useParams();
  const isNew = scriptId === "new";

  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <Badge variant="muted">Script · {scriptId}</Badge>
            <h1 className="mt-3 truncate text-3xl font-bold tracking-tight text-gradient md:text-4xl">
              {isNew ? "Untitled script" : "Edit script"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Generate with AI, then refine the script line-by-line.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" size="md">
              <Save className="h-4 w-4" /> Save
            </Button>
            <Button asChild size="md">
              <Link to="/teleprompter/$scriptId" params={{ scriptId }}>
                <Mic className="h-4 w-4" /> Practice
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <Card>
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="e.g. 3 TikTok hooks for product launches" defaultValue={isNew ? "" : "Sample script"} />
            <div className="mt-5">
              <Label htmlFor="script">Script</Label>
              <Textarea
                id="script"
                className="min-h-[360px]"
                placeholder="Start typing, or generate with AI →"
                defaultValue={
                  isNew
                    ? ""
                    : "Hook: Most creators waste 2 hours staring at a blank screen.\n\nHere's a 60-second script that fixes that — instantly.\n\nStep 1: Open ScriptFlow and type your idea…"
                }
              />
            </div>
          </Card>

          <Card variant="glow">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-electric" />
              <h3 className="text-sm font-semibold">AI Assistant</h3>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Generate a draft, rewrite a line, or suggest a stronger hook.
            </p>
            <div className="mt-4 space-y-2">
              <Button className="w-full" size="md">
                <Sparkles className="h-4 w-4" /> Generate draft
              </Button>
              <Button variant="secondary" className="w-full" size="md">
                Rewrite hook
              </Button>
              <Button variant="ghost" className="w-full" size="md">
                Shorten to 30s
              </Button>
            </div>
            <div className="mt-6 rounded-xl border border-border bg-background/60 p-3 text-xs text-muted-foreground">
              Tip: Strong hooks start with a contrast or surprise within the first 3 seconds.
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

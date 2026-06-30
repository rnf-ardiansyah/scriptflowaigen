import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/app/AppLayout";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/app/Card";
import { Button } from "@/components/app/Button";
import { Input } from "@/components/app/Input";
import { Badge } from "@/components/app/Badge";
import { FilePlus, Search, Star } from "lucide-react";

export const Route = createFileRoute("/_authenticated/library")({
  head: () => ({
    meta: [
      { title: "Library — ScriptFlow" },
      { name: "description", content: "All your saved short-video scripts in one place." },
    ],
  }),
  component: LibraryPage,
});

const placeholders = [
  { id: "demo-hook", title: "TikTok Hook · 3 mistakes", tag: "Hook", time: "48s" },
  { id: "demo-tutorial", title: "Tutorial · How to start a brand", tag: "Tutorial", time: "1:12" },
  { id: "demo-promo", title: "Promo · New product launch", tag: "Promo", time: "0:54" },
  { id: "demo-pov", title: "POV · A day as a creator", tag: "POV", time: "1:05" },
];

function LibraryPage() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Badge variant="muted">Library</Badge>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-gradient md:text-4xl">
              Your scripts
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Search, organize, and reopen anything you've written.
            </p>
          </div>
          <Button asChild size="lg">
            <Link to="/editor/$scriptId" params={{ scriptId: "new" }}>
              <FilePlus className="h-4 w-4" /> New Script
            </Link>
          </Button>
        </div>

        <div className="mt-8 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search scripts, folders, tags…" />
          </div>
          <Button variant="secondary">All folders</Button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {placeholders.map((p) => (
            <Card key={p.id} className="group transition-transform hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <Badge variant="outline">{p.tag}</Badge>
                <Star className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-electric" />
              </div>
              <CardHeader className="mt-4 mb-2">
                <CardTitle className="text-base">{p.title}</CardTitle>
                <CardDescription>~ {p.time} read · Draft</CardDescription>
              </CardHeader>
              <div className="space-y-1.5">
                <div className="h-1.5 w-11/12 rounded bg-surface-elevated" />
                <div className="h-1.5 w-9/12 rounded bg-surface-elevated" />
                <div className="h-1.5 w-10/12 rounded bg-surface-elevated" />
              </div>
              <div className="mt-5 flex items-center gap-2">
                <Button asChild size="sm" variant="secondary" className="flex-1">
                  <Link to="/editor/$scriptId" params={{ scriptId: p.id }}>Open</Link>
                </Button>
                <Button asChild size="sm" variant="ghost">
                  <Link to="/teleprompter/$scriptId" params={{ scriptId: p.id }}>Practice</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

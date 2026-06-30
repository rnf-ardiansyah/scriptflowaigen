import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/app/AppLayout";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/app/Card";
import { Button } from "@/components/app/Button";
import { Badge } from "@/components/app/Badge";
import { Check, Sparkles } from "lucide-react";

export const Route = createFileRoute("/_authenticated/upgrade")({
  head: () => ({
    meta: [
      { title: "Upgrade — ScriptFlow Premium" },
      { name: "description", content: "Unlock unlimited scripts, premium templates, and priority AI." },
    ],
  }),
  component: UpgradePage,
});

const features = [
  "Unlimited script library",
  "100 AI generations / day",
  "Premium templates",
  "AI Rewrite & tone control",
  "Priority AI speed",
  "Folders, favorites & search",
];

function UpgradePage() {
  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl px-6 text-center">
        <Badge variant="outline">Premium</Badge>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-gradient md:text-5xl">
          Ship more videos with Premium
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
          Unlock unlimited scripts, premium templates, and the fastest AI in ScriptFlow.
        </p>

        <Card className="mt-10 text-left" variant="glow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Premium</CardTitle>
              <Badge variant="electric">
                <Sparkles className="h-3 w-3" /> Recommended
              </Badge>
            </div>
            <CardDescription>For creators shipping content every week.</CardDescription>
          </CardHeader>
          <div className="flex items-end gap-1">
            <span className="text-5xl font-bold tracking-tight">$12</span>
            <span className="mb-1.5 text-sm text-muted-foreground">/ month</span>
          </div>
          <ul className="mt-6 space-y-3">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-electric" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <Button className="mt-7 w-full" size="lg">
            Upgrade to Premium
          </Button>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Cancel anytime.
          </p>
        </Card>
      </div>
    </AppLayout>
  );
}

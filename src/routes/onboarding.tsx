import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthLayout } from "@/components/app/AuthLayout";
import { Button } from "@/components/app/Button";
import { Badge } from "@/components/app/Badge";
import { Check } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Welcome to ScriptFlow" },
      { name: "description", content: "Set up your creator workspace in 3 quick steps." },
    ],
  }),
  component: OnboardingPage,
});

const steps = [
  { title: "Pick your niche", desc: "TikTok, Reels, Shorts, or all three." },
  { title: "Choose your tone", desc: "Friendly, bold, educational, or casual." },
  { title: "Create your first script", desc: "Generate, edit, and save it to your library." },
];

function OnboardingPage() {
  return (
    <AuthLayout
      title="Let's set up your workspace"
      subtitle="3 quick steps. About 60 seconds."
    >
      <ol className="space-y-3">
        {steps.map((s, i) => (
          <li
            key={s.title}
            className="flex items-start gap-3 rounded-xl border border-border bg-background/60 p-4"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-electric/15 text-sm font-semibold text-electric">
              {i === 0 ? <Check className="h-4 w-4" /> : i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">{s.title}</p>
                {i === 0 && <Badge variant="success">Done</Badge>}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{s.desc}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button asChild variant="ghost" size="md">
          <Link to="/dashboard">Skip for now</Link>
        </Button>
        <Button asChild size="md">
          <Link to="/dashboard">Continue</Link>
        </Button>
      </div>
    </AuthLayout>
  );
}

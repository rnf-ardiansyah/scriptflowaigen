import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AuthLayout } from "@/components/app/AuthLayout";
import { Button } from "@/components/app/Button";
import { Input, Label } from "@/components/app/Input";
import { supabase } from "@/integrations/supabase/client";
import { fetchCurrentProfile, isProfileComplete } from "@/lib/profile-helpers";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({
    meta: [
      { title: "Welcome to ScriptFlow" },
      { name: "description", content: "Set up your creator workspace." },
    ],
  }),
  component: OnboardingPage,
});

const NICHES = [
  "Skincare",
  "Fashion",
  "F&B",
  "Edukasi",
  "Finansial",
  "Gaming",
  "Lifestyle",
  "Property",
  "Beauty",
  "Tech",
] as const;

const LEVELS = ["Pemula", "Menengah", "Berpengalaman"] as const;

function OnboardingPage() {
  const navigate = useNavigate();
  const [niche, setNiche] = useState<string>("");
  const [level, setLevel] = useState<string>("");
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If profile is already complete, skip onboarding.
  useEffect(() => {
    let cancelled = false;
    fetchCurrentProfile().then((p) => {
      if (cancelled) return;
      if (isProfileComplete(p)) {
        navigate({ to: "/dashboard", replace: true });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!niche || !level || !goal.trim()) {
      setError("Please answer all three questions.");
      return;
    }
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) {
      setError("Not signed in.");
      setLoading(false);
      return;
    }
    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert(
        {
          user_id: user.id,
          preferred_niche: niche,
          experience_level: level,
          goal: goal.trim(),
        },
        { onConflict: "user_id" },
      );
    if (upsertError) {
      setError(upsertError.message);
      setLoading(false);
      return;
    }
    navigate({ to: "/dashboard", replace: true });
  }

  return (
    <AuthLayout
      title="Let's set up your workspace"
      subtitle="3 quick questions so we can tailor ScriptFlow to you."
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="niche">Pick your niche</Label>
          <select
            id="niche"
            value={niche}
            onChange={(e) => setNiche(e.target.value)}
            className="mt-1.5 flex h-10 w-full rounded-xl border border-border bg-background/60 px-3 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric/50"
          >
            <option value="" disabled>
              Select one…
            </option>
            {NICHES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label>Experience level</Label>
          <div className="mt-1.5 grid grid-cols-3 gap-2">
            {LEVELS.map((l) => {
              const active = level === l;
              return (
                <label
                  key={l}
                  className={
                    "flex cursor-pointer items-center justify-center rounded-xl border px-3 py-2.5 text-sm transition-colors " +
                    (active
                      ? "border-electric bg-electric/10 text-foreground"
                      : "border-border bg-background/60 text-muted-foreground hover:text-foreground")
                  }
                >
                  <input
                    type="radio"
                    name="level"
                    value={l}
                    checked={active}
                    onChange={() => setLevel(l)}
                    className="sr-only"
                  />
                  {l}
                </label>
              );
            })}
          </div>
        </div>

        <div>
          <Label htmlFor="goal">What's your goal with ScriptFlow?</Label>
          <Input
            id="goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g. Konsisten posting 3 video per minggu"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Saving…" : "Continue"}
        </Button>
      </form>
    </AuthLayout>
  );
}

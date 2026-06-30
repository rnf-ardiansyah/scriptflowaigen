import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type QuotaSummary = {
  plan: "free" | "premium";
  generationsToday: number;
  generationLimit: number;
  scriptsUsed: number;
  scriptLimit: number | null;
};

function startOfTodayIso(): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

export const getQuotaSummaryFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<QuotaSummary> => {
    const { supabase, userId } = context;

    const [profileRes, genRes, scriptRes] = await Promise.all([
      supabase.from("profiles").select("plan").eq("user_id", userId).maybeSingle(),
      supabase
        .from("generations")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "success")
        .gte("created_at", startOfTodayIso()),
      supabase
        .from("scripts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
    ]);

    const plan: "free" | "premium" =
      profileRes.data?.plan === "premium" ? "premium" : "free";
    const generationLimit = plan === "premium" ? 100 : 5;
    const scriptLimit = plan === "premium" ? null : 20;

    return {
      plan,
      generationsToday: genRes.count ?? 0,
      generationLimit,
      scriptsUsed: scriptRes.count ?? 0,
      scriptLimit,
    };
  });

import { generateText } from "ai";
import { createGeminiProvider } from "./ai-gateway.server";

export type GenerationErrorCode =
  | "rate_limited"
  | "parse_failed"
  | "ai_unavailable"
  | "empty_script";

export type GenerationError = {
  code: GenerationErrorCode;
  message: string;
  limit?: number;
  plan?: string;
};

export function makeAiError(err: GenerationError): Error {
  const e = new Error(err.message) as Error & { appError?: GenerationError };
  e.appError = err;
  return e;
}

export function startOfTodayIso(): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

/** Strip code fences and locate a top-level JSON object. */
export function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenceMatch ? fenceMatch[1] : trimmed;
  try {
    return JSON.parse(candidate);
  } catch {
    const first = candidate.indexOf("{");
    const last = candidate.lastIndexOf("}");
    if (first !== -1 && last > first) {
      try {
        return JSON.parse(candidate.slice(first, last + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

export function buildFullScript(p: {
  hook: string;
  retain: string;
  reward: string;
  cta: string;
}): string {
  return [p.hook, p.retain, p.reward, p.cta]
    .map((s) => s.trim())
    .filter(Boolean)
    .join("\n\n");
}

export function computeReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 2.5));
}

/**
 * Call Gemini and return raw text. Retries are caller's job.
 */
export async function callGemini(prompt: string): Promise<{
  text: string;
  tokens: number | null;
}> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw makeAiError({
      code: "ai_unavailable",
      message: "AI gateway belum dikonfigurasi.",
    });
  }
  const gateway = createGeminiProvider(apiKey);
  const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
  const result = await generateText({
    model: gateway(modelName),
    prompt,
    temperature: 0.8,
  });
  return { text: result.text, tokens: result.usage?.totalTokens ?? null };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseLike = any;

/**
 * Ensure caller has remaining daily quota. Throws rate_limited on exhaustion.
 * Returns the user's plan ('free' | 'premium') and the resolved limit.
 */
export async function ensureDailyQuota(
  supabase: SupabaseLike,
  userId: string,
): Promise<{ plan: "free" | "premium"; limit: number }> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan")
    .eq("user_id", userId)
    .maybeSingle();
  const plan: "free" | "premium" = profile?.plan === "premium" ? "premium" : "free";
  const limit = plan === "premium" ? 100 : 5;

  const { count } = await supabase
    .from("generations")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "success")
    .gte("created_at", startOfTodayIso());

  if ((count ?? 0) >= limit) {
    throw makeAiError({
      code: "rate_limited",
      plan,
      limit,
      message: `Kuota harian (${limit}/${plan}) sudah tercapai.`,
    });
  }
  return { plan, limit };
}

export async function logGeneration(
  supabase: SupabaseLike,
  userId: string,
  status: "success" | "failed",
  tokens: number | null,
): Promise<void> {
  await supabase.from("generations").insert({
    user_id: userId,
    model: "gemini-flash",
    status,
    tokens,
  });
}

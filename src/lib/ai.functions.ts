import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { generateText } from "ai";
import { createGoogleProvider } from "./ai-gateway.server";

const InputSchema = z.object({
  idea: z.string().trim().min(3).max(2000),
  niche: z.string().trim().min(1).max(60),
  tone: z.string().trim().min(1).max(40),
});

const OutputSchema = z.object({
  hook: z.string().min(1),
  retain: z.string().min(1),
  reward: z.string().min(1),
  cta: z.string().min(1),
});

export type GenerateScriptResult = {
  scriptId: string;
  cached: boolean;
  hook: string;
  retain: string;
  reward: string;
  cta: string;
};

export type GenerateScriptError = {
  code: "rate_limited" | "parse_failed" | "ai_unavailable" | "script_limit_reached";
  message: string;
  limit?: number;
  plan?: string;
};

function buildFullScript(p: { hook: string; retain: string; reward: string; cta: string }) {
  return [p.hook, p.retain, p.reward, p.cta].map((s) => s.trim()).filter(Boolean).join("\n\n");
}
function computeReadingTime(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 2.5));
}
function startOfTodayIso() {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}
function makeError(err: GenerateScriptError): Error {
  const e = new Error(err.message) as Error & { lovable?: GenerateScriptError };
  e.lovable = err;
  return e;
}

const MILESTONES = [5, 10, 20, 50, 100] as const;

// Best-effort: kalau insert notifikasi gagal, jangan sampai bikin generateScript
// ikut gagal. "notifications" belum ada di generated Supabase types (dibuat
// manual di luar migration), makanya pakai cast "as never" — pola yang sama
// dipakai di NotificationsBell.tsx.
async function notify(
  supabase: typeof createGoogleProvider extends never ? never : any,
  userId: string,
  title: string,
  body?: string,
  href?: string,
) {
  try {
    await supabase.from("notifications" as never).insert({
      user_id: userId,
      title,
      body: body ?? null,
      href: href ?? null,
    } as never);
  } catch (err) {
    console.error("notify insert failed", err);
  }
}

function buildPrompt(idea: string, niche: string, tone: string, strict: boolean) {
  const base = `Kamu adalah script writer profesional untuk video pendek (TikTok/Reels/Shorts) berbahasa Indonesia.

Tulis script untuk niche "${niche}" dengan tone ${tone}, berdasarkan ide:
"""
${idea}
"""

Aturan WAJIB:
- Gunakan gaya bahasa, istilah, dan referensi yang relevan untuk niche ${niche}.
- Hook adalah 3 detik pertama: harus memancing rasa penasaran, kontroversial, atau menjanjikan benefit. DILARANG memakai sapaan generik seperti "Halo teman-teman", "Hai gais", "Assalamualaikum", "Apa kabar semuanya".
- Retain: bagian isi yang membuat penonton tetap menonton sampai akhir (build-up, story, atau argumen).
- Reward: poin nilai/insight utama yang penonton dapat.
- CTA: ajakan penutup yang sesuai niche (follow, simpan, komen, dll).
- Tulis dalam bahasa Indonesia natural, hindari kalimat kaku.

Format jawaban: HANYA JSON valid dengan struktur:
{"hook": "...", "retain": "...", "reward": "...", "cta": "..."}`;
  if (!strict) return base;
  return (
    base +
    `\n\nPENTING (RETRY): Respons sebelumnya gagal parse. Kirim ULANG HANYA objek JSON murni — tanpa code fence \`\`\`, tanpa kata pengantar, tanpa penjelasan, tanpa newline di luar string. Semua 4 field (hook, retain, reward, cta) wajib terisi non-kosong.`
  );
}

async function callModel(
  apiKey: string,
  idea: string,
  niche: string,
  tone: string,
  strict: boolean,
) {
  const google = createGoogleProvider(apiKey);
  const result = await generateText({
    model: google("gemini-3.1-flash-lite"),
    prompt: buildPrompt(idea, niche, tone, strict),
    temperature: 0.8,
  });
  return result;
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  // Strip code fences if present
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenceMatch ? fenceMatch[1] : trimmed;
  try {
    return JSON.parse(candidate);
  } catch {
    // Find first { ... last }
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

export const generateScript = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const idea = data.idea.trim();
    const niche = data.niche.trim();
    const tone = data.tone.trim();

    // 1. Cache check
    const { data: cached } = await supabase
      .from("scripts")
      .select("*")
      .eq("user_id", userId)
      .eq("idea", idea)
      .eq("niche", niche)
      .eq("tone", tone)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cached && cached.hook && cached.retain && cached.reward && cached.cta) {
      return {
        scriptId: cached.id,
        cached: true,
        hook: cached.hook,
        retain: cached.retain,
        reward: cached.reward,
        cta: cached.cta,
      } satisfies GenerateScriptResult;
    }

    // 2. Plan
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("user_id", userId)
      .maybeSingle();
    const plan = profile?.plan === "premium" ? "premium" : "free";
    const limit = plan === "premium" ? 100 : 5;

    // 2b. Script library cap for free users (defense in depth — DB trigger also enforces).
    if (plan === "free") {
      const { count: scriptCount } = await supabase
        .from("scripts")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);
      if ((scriptCount ?? 0) >= 20) {
        throw makeError({
          code: "script_limit_reached",
          plan,
          limit: 20,
          message:
            "Script Library kamu sudah mencapai batas 20 script untuk plan Free. Upgrade ke Premium untuk menyimpan lebih banyak.",
        });
      }
    }

    // 3. Rate-limit
    const { count } = await supabase
      .from("generations")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "success")
      .gte("created_at", startOfTodayIso());

    if ((count ?? 0) >= limit) {
      throw makeError({
        code: "rate_limited",
        plan,
        limit,
        message: `Kuota harian (${limit}/${plan}) sudah tercapai.`,
      });
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      throw makeError({ code: "ai_unavailable", message: "AI gateway belum dikonfigurasi." });
    }

    // 4-6. Call + retry
    let parsed: z.infer<typeof OutputSchema> | null = null;
    let tokens: number | null = null;
    let lastError: unknown = null;

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const result = await callModel(apiKey, idea, niche, tone, attempt === 1);
        tokens = result.usage?.totalTokens ?? null;
        const out = extractJson(result.text);
        const check = OutputSchema.safeParse(out);
        if (check.success && check.data.hook.trim() && check.data.retain.trim() && check.data.reward.trim() && check.data.cta.trim()) {
          parsed = check.data;
          break;
        }
        lastError = check.success ? new Error("empty fields") : check.error;
      } catch (err) {
        lastError = err;
      }
    }

    if (!parsed) {
      await supabase.from("generations").insert({
        user_id: userId,
        model: "gemini-flash",
        status: "failed",
        tokens,
      });
      console.error("generateScript parse_failed", lastError);
      throw makeError({
        code: "parse_failed",
        message: "AI gagal menghasilkan script yang valid. Silakan coba lagi.",
      });
    }

    // 7. Log success
    await supabase.from("generations").insert({
      user_id: userId,
      model: "gemini-flash",
      status: "success",
      tokens,
    });

    const remaining = limit - ((count ?? 0) + 1);
    if (remaining === 1) {
      await notify(
        supabase,
        userId,
        "Tinggal 1 generate lagi hari ini",
        `Kuota harian kamu (${plan}) hampir habis — ${limit - 1}/${limit} sudah dipakai.`,
        "/dashboard",
      );
    }

    // 8-9. Persist script
    const full_script = buildFullScript(parsed);
    const reading_time = computeReadingTime(full_script);
    const title = idea.length > 80 ? idea.slice(0, 77) + "…" : idea;

    const { data: inserted, error: insertError } = await supabase
      .from("scripts")
      .insert({
        user_id: userId,
        title,
        idea,
        niche,
        tone,
        hook: parsed.hook,
        retain: parsed.retain,
        reward: parsed.reward,
        cta: parsed.cta,
        full_script,
        reading_time,
        is_favorite: false,
      })
      .select("id")
      .single();

    if (insertError || !inserted) {
      const msg = insertError?.message ?? "";
      if (msg.includes("free_plan_script_limit_reached")) {
        throw makeError({
          code: "script_limit_reached",
          plan,
          limit: 20,
          message:
            "Script Library kamu sudah mencapai batas 20 script untuk plan Free. Upgrade ke Premium untuk menyimpan lebih banyak.",
        });
      }
      throw makeError({
        code: "ai_unavailable",
        message: "Gagal menyimpan script: " + (msg || "unknown"),
      });
    }

    const { count: totalScripts } = await supabase
      .from("scripts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (totalScripts != null && (MILESTONES as readonly number[]).includes(totalScripts)) {
      await notify(
        supabase,
        userId,
        `Selamat! Kamu sudah bikin ${totalScripts} script 🎉`,
        "Terus konsisten bikin konten, progresmu makin keliatan.",
        "/library",
      );
    }

    return {
      scriptId: inserted.id,
      cached: false,
      ...parsed,
    } satisfies GenerateScriptResult;
  });

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import {
  callGemini,
  computeReadingTime,
  ensureDailyQuota,
  extractJson,
  logGeneration,
  makeAiError,
} from "./ai-shared.server";

const StyleEnum = z.enum(["santai", "formal", "lucu"]);
const TargetSecondsEnum = z.union([z.literal(15), z.literal(30)]);

const RewriteInput = z.object({
  scriptId: z.string().uuid(),
  style: StyleEnum,
});
const ShortenInput = z.object({
  scriptId: z.string().uuid(),
  targetSeconds: TargetSecondsEnum,
});
const HookInput = z.object({
  scriptId: z.string().uuid(),
});

const FourPartSchema = z.object({
  hook: z.string().min(1),
  retain: z.string().min(1),
  reward: z.string().min(1),
  cta: z.string().min(1),
});
const HookVariantsSchema = z.object({
  variants: z.array(z.string().min(1)).min(3),
});

export type FourPartResult = {
  hook: string;
  retain: string;
  reward: string;
  cta: string;
  readingTime: number;
};

export type HookVariantsResult = {
  variants: string[];
};

type ScriptRow = {
  id: string;
  user_id: string;
  idea: string | null;
  niche: string | null;
  hook: string | null;
  retain: string | null;
  reward: string | null;
  cta: string | null;
  full_script: string | null;
};

async function loadScriptOrThrow(
  supabase: {
    from: (t: string) => {
      select: (cols: string) => {
        eq: (
          c: string,
          v: unknown,
        ) => {
          eq: (c: string, v: unknown) => { maybeSingle: () => Promise<{ data: ScriptRow | null }> };
        };
      };
    };
  },
  scriptId: string,
  userId: string,
): Promise<ScriptRow> {
  const { data } = await supabase
    .from("scripts")
    .select("id,user_id,idea,niche,hook,retain,reward,cta,full_script")
    .eq("id", scriptId)
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) {
    throw makeAiError({
      code: "ai_unavailable",
      message: "Script tidak ditemukan atau bukan milikmu.",
    });
  }
  return data;
}

function assertNonEmpty(script: ScriptRow) {
  const combined = [script.hook, script.retain, script.reward, script.cta]
    .map((s) => (s ?? "").trim())
    .join("");
  if (!combined && !(script.full_script ?? "").trim()) {
    throw makeAiError({
      code: "empty_script",
      message: "Isi dulu script-nya sebelum pakai AI rewrite/shorten/regen.",
    });
  }
}

function fullScriptFrom(script: ScriptRow): string {
  if ((script.full_script ?? "").trim()) return (script.full_script ?? "").trim();
  return [script.hook, script.retain, script.reward, script.cta]
    .map((s) => (s ?? "").trim())
    .filter(Boolean)
    .join("\n\n");
}

const STYLE_LABEL: Record<z.infer<typeof StyleEnum>, string> = {
  santai: "lebih santai, akrab, ngobrol — pakai bahasa sehari-hari",
  formal: "lebih formal, sopan, profesional — hindari slang",
  lucu: "lebih lucu, humoris, playful — boleh pakai punchline ringan",
};

function buildRewritePrompt(
  script: ScriptRow,
  style: z.infer<typeof StyleEnum>,
  strict: boolean,
): string {
  const niche = script.niche ?? "umum";
  const idea = script.idea ?? "";
  const base = `Kamu adalah script writer profesional untuk video pendek (TikTok/Reels/Shorts) berbahasa Indonesia.

Tulis ULANG script berikut agar terdengar ${STYLE_LABEL[style]}, untuk niche "${niche}".
PERTAHANKAN struktur 4 bagian (hook/retain/reward/cta), inti pesan, dan call-to-action yang sama. Hanya gaya bahasa dan pilihan kata yang berubah.

Ide asli: ${idea}

Script asli per bagian:
- Hook: ${script.hook ?? ""}
- Retain: ${script.retain ?? ""}
- Reward: ${script.reward ?? ""}
- CTA: ${script.cta ?? ""}

Aturan:
- Hook tetap memancing rasa penasaran dalam 3 detik. JANGAN pakai sapaan generik ("Halo teman-teman", "Hai gais", dll).
- Bahasa Indonesia natural, jangan kaku.
- Panjang per bagian boleh sedikit berbeda, tapi keseluruhan tetap proporsional.

Format jawaban: HANYA JSON valid:
{"hook":"...","retain":"...","reward":"...","cta":"..."}`;
  if (!strict) return base;
  return (
    base +
    `\n\nPENTING (RETRY): Respons sebelumnya gagal parse. Kirim ULANG HANYA objek JSON murni — tanpa code fence, tanpa kata pengantar. Semua 4 field wajib terisi.`
  );
}

function buildShortenPrompt(
  script: ScriptRow,
  targetSeconds: 15 | 30,
  strict: boolean,
): string {
  const niche = script.niche ?? "umum";
  const targetWords = Math.floor(targetSeconds * 2.5);
  const base = `Kamu adalah editor script untuk video pendek (TikTok/Reels/Shorts) berbahasa Indonesia.

PADATKAN script berikut menjadi versi ${targetSeconds} detik untuk niche "${niche}".
Target jumlah kata TOTAL (gabungan hook+retain+reward+cta): MAKSIMAL ${targetWords} kata. Jangan melebihi.
PERTAHANKAN struktur 4 bagian (hook/retain/reward/cta) dan inti pesan utama. Buang detail yang tidak penting.

Script asli per bagian:
- Hook: ${script.hook ?? ""}
- Retain: ${script.retain ?? ""}
- Reward: ${script.reward ?? ""}
- CTA: ${script.cta ?? ""}

Aturan:
- Hook tetap kuat dan tidak generik.
- Bahasa Indonesia natural.
- Setiap bagian wajib ada isinya — tidak boleh kosong.
- Total kata ≤ ${targetWords}.

Format jawaban: HANYA JSON valid:
{"hook":"...","retain":"...","reward":"...","cta":"..."}`;
  if (!strict) return base;
  return (
    base +
    `\n\nPENTING (RETRY): Respons sebelumnya gagal parse / melebihi batas kata. Kirim ULANG HANYA objek JSON murni, total kata ≤ ${targetWords}.`
  );
}

function buildHookPrompt(script: ScriptRow, strict: boolean): string {
  const niche = script.niche ?? "umum";
  const idea = script.idea ?? "";
  const base = `Kamu adalah hook writer untuk video pendek (TikTok/Reels/Shorts) berbahasa Indonesia, niche "${niche}".

Buat 3 VARIASI HOOK BERBEDA (3 detik pembuka) untuk ide berikut.

Ide: ${idea}
Hook saat ini (untuk referensi gaya, JANGAN ditiru): ${script.hook ?? "(kosong)"}

Aturan:
- Setiap variasi harus benar-benar berbeda secara sudut pandang / angle (mis. pertanyaan provokatif, klaim mengejutkan, story opener, kontra-opini).
- DILARANG sapaan generik ("Halo teman-teman", "Hai gais", "Assalamualaikum", "Apa kabar semuanya").
- Maksimal 1–2 kalimat per variasi.
- Bahasa Indonesia natural.

Format jawaban: HANYA JSON valid:
{"variants":["hook 1","hook 2","hook 3"]}`;
  if (!strict) return base;
  return (
    base +
    `\n\nPENTING (RETRY): Respons sebelumnya gagal parse. Kirim ULANG HANYA objek JSON murni dengan field "variants" berisi minimal 3 string.`
  );
}

async function runWithRetry<T extends z.ZodTypeAny>(
  buildPrompt: (strict: boolean) => string,
  schema: T,
): Promise<{ data: z.infer<T>; tokens: number | null }> {
  let lastError: unknown = null;
  let tokens: number | null = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await callGemini(buildPrompt(attempt === 1));
      tokens = res.tokens;
      const parsed = extractJson(res.text);
      const check = schema.safeParse(parsed);
      if (check.success) return { data: check.data, tokens };
      lastError = check.error;
    } catch (err) {
      lastError = err;
    }
  }
  console.error("AI edit parse_failed", lastError);
  throw makeAiError({
    code: "parse_failed",
    message: "AI gagal menghasilkan respons yang valid. Silakan coba lagi.",
  });
}

export const rewriteScript = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => RewriteInput.parse(d))
  .handler(async ({ data, context }): Promise<FourPartResult> => {
    const { supabase, userId } = context;
    const script = await loadScriptOrThrow(supabase, data.scriptId, userId);
    assertNonEmpty(script);
    await ensureDailyQuota(supabase, userId);

    try {
      const { data: parsed, tokens } = await runWithRetry(
        (strict) => buildRewritePrompt(script, data.style, strict),
        FourPartSchema,
      );
      await logGeneration(supabase, userId, "success", tokens);
      const full = [parsed.hook, parsed.retain, parsed.reward, parsed.cta].join("\n\n");
      return { ...parsed, readingTime: computeReadingTime(full) };
    } catch (err) {
      await logGeneration(supabase, userId, "failed", null);
      throw err;
    }
  });

export const shortenScript = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ShortenInput.parse(d))
  .handler(async ({ data, context }): Promise<FourPartResult> => {
    const { supabase, userId } = context;
    const script = await loadScriptOrThrow(supabase, data.scriptId, userId);
    assertNonEmpty(script);
    await ensureDailyQuota(supabase, userId);

    try {
      const { data: parsed, tokens } = await runWithRetry(
        (strict) => buildShortenPrompt(script, data.targetSeconds, strict),
        FourPartSchema,
      );
      await logGeneration(supabase, userId, "success", tokens);
      const full = [parsed.hook, parsed.retain, parsed.reward, parsed.cta].join("\n\n");
      return { ...parsed, readingTime: computeReadingTime(full) };
    } catch (err) {
      await logGeneration(supabase, userId, "failed", null);
      throw err;
    }
  });

export const regenerateHook = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => HookInput.parse(d))
  .handler(async ({ data, context }): Promise<HookVariantsResult> => {
    const { supabase, userId } = context;
    const script = await loadScriptOrThrow(supabase, data.scriptId, userId);
    if (!(script.idea ?? "").trim() && !(script.hook ?? "").trim()) {
      throw makeAiError({
        code: "empty_script",
        message: "Isi dulu idea atau hook awal sebelum regenerate hook.",
      });
    }
    await ensureDailyQuota(supabase, userId);

    try {
      const { data: parsed, tokens } = await runWithRetry(
        (strict) => buildHookPrompt(script, strict),
        HookVariantsSchema,
      );
      await logGeneration(supabase, userId, "success", tokens);
      return { variants: parsed.variants.slice(0, 3) };
    } catch (err) {
      await logGeneration(supabase, userId, "failed", null);
      throw err;
    }
  });

// src/lib/plan.ts
export type PlanLike = {
    plan: string | null;
    plan_expires_at?: string | null;
};

/**
 * Sumber kebenaran plan efektif user. Kolom `plan` di profiles bisa saja
 * masih "premium" walau `plan_expires_at` sudah lewat (kita gak selalu
 * langsung reset kolomnya real-time) — jadi effective plan HARUS selalu
 * dihitung lewat fungsi ini, bukan baca `profile.plan` mentah-mentah.
 */
export function resolveEffectivePlan(profile: PlanLike | null | undefined): "free" | "premium" {
    if (!profile || profile.plan !== "premium") return "free";
    if (profile.plan_expires_at && new Date(profile.plan_expires_at).getTime() < Date.now()) {
        return "free";
    }
    return "premium";
}
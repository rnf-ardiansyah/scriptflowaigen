import { supabase } from "@/integrations/supabase/client";
import { queryOptions } from "@tanstack/react-query";

export type ScriptRow = {
  id: string;
  user_id: string;
  title: string | null;
  idea: string | null;
  niche: string | null;
  hook: string | null;
  retain: string | null;
  reward: string | null;
  cta: string | null;
  full_script: string | null;
  reading_time: number | null;
  is_favorite: boolean;
  tone: string | null;
  created_at: string;
  updated_at: string;
};

async function currentUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Not signed in");
  return data.user.id;
}

function wordCount(s: string): number {
  const t = s.trim();
  if (!t) return 0;
  return t.split(/\s+/).length;
}

export function buildFullScript(parts: {
  hook?: string | null;
  retain?: string | null;
  reward?: string | null;
  cta?: string | null;
}): string {
  return [parts.hook, parts.retain, parts.reward, parts.cta]
    .filter((x) => x && x.trim())
    .join("\n\n");
}

export function computeReadingTime(parts: {
  hook?: string | null;
  retain?: string | null;
  reward?: string | null;
  cta?: string | null;
}): number {
  const full = buildFullScript(parts);
  const words = wordCount(full);
  if (words === 0) return 0;
  return Math.ceil(words / 2.5);
}

export async function listScripts(): Promise<ScriptRow[]> {
  const { data, error } = await supabase
    .from("scripts")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ScriptRow[];
}

export async function listRecentScripts(limit = 5): Promise<ScriptRow[]> {
  const { data, error } = await supabase
    .from("scripts")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as ScriptRow[];
}

export async function countScripts(): Promise<{ total: number; favorites: number }> {
  const [{ count: total, error: e1 }, { count: favorites, error: e2 }] = await Promise.all([
    supabase.from("scripts").select("*", { count: "exact", head: true }),
    supabase.from("scripts").select("*", { count: "exact", head: true }).eq("is_favorite", true),
  ]);
  if (e1) throw e1;
  if (e2) throw e2;
  return { total: total ?? 0, favorites: favorites ?? 0 };
}

export async function getScript(id: string): Promise<ScriptRow | null> {
  const { data, error } = await supabase
    .from("scripts")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as ScriptRow | null) ?? null;
}

export async function createScript(
  partial: Partial<Omit<ScriptRow, "id" | "user_id" | "created_at" | "updated_at">> = {},
): Promise<ScriptRow> {
  const user_id = await currentUserId();
  const payload = {
    user_id,
    title: partial.title ?? "Untitled script",
    idea: partial.idea ?? "",
    niche: partial.niche ?? null,
    hook: partial.hook ?? "",
    retain: partial.retain ?? "",
    reward: partial.reward ?? "",
    cta: partial.cta ?? "",
    full_script: partial.full_script ?? "",
    reading_time: partial.reading_time ?? 0,
    is_favorite: partial.is_favorite ?? false,
  };
  const { data, error } = await supabase
    .from("scripts")
    .insert(payload)
    .select("*")
    .single();
  if (error) throw error;
  return data as ScriptRow;
}

export async function updateScript(
  id: string,
  patch: Partial<Omit<ScriptRow, "id" | "user_id" | "created_at">>,
): Promise<ScriptRow> {
  const { data, error } = await supabase
    .from("scripts")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as ScriptRow;
}

export async function deleteScript(id: string): Promise<void> {
  const { error } = await supabase.from("scripts").delete().eq("id", id);
  if (error) throw error;
}

export async function duplicateScript(id: string): Promise<ScriptRow> {
  const src = await getScript(id);
  if (!src) throw new Error("Script not found");
  return createScript({
    title: `(Copy) ${src.title ?? "Untitled"}`,
    idea: src.idea ?? "",
    niche: src.niche,
    hook: src.hook ?? "",
    retain: src.retain ?? "",
    reward: src.reward ?? "",
    cta: src.cta ?? "",
    full_script: src.full_script ?? "",
    reading_time: src.reading_time ?? 0,
    is_favorite: false,
  });
}

export async function toggleFavorite(id: string, value: boolean): Promise<void> {
  const { error } = await supabase
    .from("scripts")
    .update({ is_favorite: value })
    .eq("id", id);
  if (error) throw error;
}

// React Query options
export const scriptsListQuery = () =>
  queryOptions({ queryKey: ["scripts", "list"], queryFn: listScripts });

export const scriptsRecentQuery = (limit = 5) =>
  queryOptions({
    queryKey: ["scripts", "recent", limit],
    queryFn: () => listRecentScripts(limit),
  });

export const scriptsCountsQuery = () =>
  queryOptions({ queryKey: ["scripts", "counts"], queryFn: countScripts });

export const scriptDetailQuery = (id: string) =>
  queryOptions({
    queryKey: ["scripts", "detail", id],
    queryFn: () => getScript(id),
  });

export const profileQuery = () =>
  queryOptions({
    queryKey: ["profile", "me"],
    queryFn: async () => {
      const { fetchCurrentProfile } = await import("./profile-helpers");
      return fetchCurrentProfile();
    },
  });

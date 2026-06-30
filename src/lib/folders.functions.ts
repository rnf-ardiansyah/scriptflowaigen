import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export type FolderSummary = {
  id: string;
  name: string;
  created_at: string;
  script_count: number;
};

const NameSchema = z.string().trim().min(1).max(60);

export const listFoldersFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<FolderSummary[]> => {
    const { supabase, userId } = context;
    const [foldersRes, scriptsRes] = await Promise.all([
      supabase
        .from("folders")
        .select("id, name, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: true }),
      supabase
        .from("scripts")
        .select("folder_id")
        .eq("user_id", userId)
        .not("folder_id", "is", null),
    ]);
    if (foldersRes.error) throw foldersRes.error;
    if (scriptsRes.error) throw scriptsRes.error;

    const counts = new Map<string, number>();
    for (const s of scriptsRes.data ?? []) {
      if (!s.folder_id) continue;
      counts.set(s.folder_id, (counts.get(s.folder_id) ?? 0) + 1);
    }
    return (foldersRes.data ?? []).map((f) => ({
      id: f.id,
      name: f.name,
      created_at: f.created_at,
      script_count: counts.get(f.id) ?? 0,
    }));
  });

export const createFolderFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ name: NameSchema }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("folders")
      .insert({ user_id: userId, name: data.name })
      .select("id, name, created_at")
      .single();
    if (error) throw error;
    return row;
  });

export const renameFolderFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), name: NameSchema }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("folders")
      .update({ name: data.name })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const deleteFolderFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    // ON DELETE SET NULL on scripts.folder_id keeps scripts intact.
    const { error } = await context.supabase
      .from("folders")
      .delete()
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const assignScriptToFolderFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        scriptId: z.string().uuid(),
        folderId: z.string().uuid().nullable(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("scripts")
      .update({ folder_id: data.folderId })
      .eq("id", data.scriptId);
    if (error) throw error;
    return { ok: true };
  });

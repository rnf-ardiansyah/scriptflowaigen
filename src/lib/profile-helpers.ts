import { supabase } from "@/integrations/supabase/client";

export type ProfileRow = {
  user_id: string;
  name: string | null;
  preferred_niche: string | null;
  experience_level: string | null;
  goal: string | null;
  plan: string;
  created_at: string;
};

export function isProfileComplete(p: Pick<ProfileRow, "preferred_niche" | "experience_level" | "goal"> | null | undefined) {
  if (!p) return false;
  return Boolean(p.preferred_niche && p.experience_level && p.goal);
}

export async function fetchCurrentProfile(): Promise<ProfileRow | null> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) {
    console.error("[profile] fetch error", error);
    return null;
  }
  return data as ProfileRow | null;
}

export async function routeAfterAuth(): Promise<"/onboarding" | "/dashboard"> {
  const profile = await fetchCurrentProfile();
  return isProfileComplete(profile) ? "/dashboard" : "/onboarding";
}

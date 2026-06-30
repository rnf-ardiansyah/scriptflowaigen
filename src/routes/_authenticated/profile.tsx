import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/app/AppLayout";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/app/Card";
import { Button } from "@/components/app/Button";
import { Input, Label } from "@/components/app/Input";
import { Badge } from "@/components/app/Badge";
import { supabase } from "@/integrations/supabase/client";
import { fetchCurrentProfile, type ProfileRow } from "@/lib/profile-helpers";
import { LogOut } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile — ScriptFlow" },
      { name: "description", content: "Manage your ScriptFlow profile and preferences." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      setEmail(u.user?.email ?? "");
      const p = await fetchCurrentProfile();
      setProfile(p);
      setName(p?.name ?? "");
    })();
  }, []);

  async function handleSave() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    setSaving(true);
    await supabase
      .from("profiles")
      .update({ name })
      .eq("user_id", u.user.id);
    setSaving(false);
  }

  async function handleSignOut() {
    setSigningOut(true);
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  const initial = (name || email || "?").slice(0, 1).toUpperCase();

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl px-6">
        <Badge variant="muted">Account</Badge>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-gradient md:text-4xl">
          Your profile
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Personalize your workspace and manage account preferences.
        </p>

        <Card className="mt-8">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-electric/20 text-lg font-semibold text-electric">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="text-base font-semibold text-foreground">
                {name || "Unnamed creator"}
              </p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>
            <Badge variant="electric" className="ml-auto capitalize">
              {profile?.plan ?? "free"}
            </Badge>
          </div>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Profile details</CardTitle>
            <CardDescription>How you appear in your workspace.</CardDescription>
          </CardHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="niche">Niche</Label>
              <Input id="niche" value={profile?.preferred_niche ?? ""} disabled />
            </div>
            <div>
              <Label htmlFor="level">Experience</Label>
              <Input id="level" value={profile?.experience_level ?? ""} disabled />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} disabled />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </Card>

        <Card className="mt-6" variant="glow">
          <CardHeader>
            <CardTitle>Unlock Premium</CardTitle>
            <CardDescription>Unlimited library, 100 AI generations a day, and more.</CardDescription>
          </CardHeader>
          <Button asChild>
            <Link to="/upgrade">See Premium</Link>
          </Button>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Sign out</CardTitle>
            <CardDescription>End this session on this device.</CardDescription>
          </CardHeader>
          <Button variant="secondary" onClick={handleSignOut} disabled={signingOut}>
            <LogOut className="h-4 w-4" />
            {signingOut ? "Signing out…" : "Sign out"}
          </Button>
        </Card>
      </div>
    </AppLayout>
  );
}

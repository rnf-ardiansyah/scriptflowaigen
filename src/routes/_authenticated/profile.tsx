import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/app/AppLayout";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/app/Card";
import { Button } from "@/components/app/Button";
import { Input, Label } from "@/components/app/Input";
import { Badge } from "@/components/app/Badge";
import { supabase } from "@/integrations/supabase/client";
import { profileQuery } from "@/lib/scripts";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Script Flow" },
      {
        name: "description",
        content: "Manage your Script Flow profile and preferences.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(profileQuery()),
  component: ProfilePage,
});

function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile } = useSuspenseQuery(profileQuery());

  const [name, setName] = useState(profile?.name ?? "");
  const [signingOut, setSigningOut] = useState(false);

  const [authEmail, setAuthEmail] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled && data.user?.email) setAuthEmail(data.user.email);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const saveMut = useMutation({
    mutationFn: async (newName: string) => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Sesi habis. Silakan login ulang.");
      const { error } = await supabase
        .from("profiles")
        .update({ name: newName })
        .eq("user_id", u.user.id);
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profil tersimpan");
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : "Gagal menyimpan profil");
    },
  });

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await queryClient.cancelQueries();
      queryClient.clear();
      await supabase.auth.signOut();
      toast.success("Sampai jumpa lagi 👋");
      navigate({ to: "/login", replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal sign out");
      setSigningOut(false);
    }
  }

  const initial = (name || authEmail || "?").slice(0, 1).toUpperCase();

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Badge variant="muted">Account</Badge>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-gradient md:text-4xl">
          Profil kamu
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Personalisasi workspace dan kelola akun kamu.
        </p>

        <Card className="mt-8">
          <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-electric/20 text-lg font-semibold text-electric">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-foreground">
                {name || "Unnamed creator"}
              </p>
              <p className="truncate text-xs text-muted-foreground">{authEmail || "—"}</p>
            </div>
            <Badge variant="electric" className="capitalize">
              {profile?.plan ?? "free"}
            </Badge>
          </div>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Detail profil</CardTitle>
            <CardDescription>Cara kamu tampil di workspace.</CardDescription>
          </CardHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="name">Nama</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
              />
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
              <Input id="email" type="email" value={authEmail} disabled />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => saveMut.mutate(name.trim())}
              disabled={saveMut.isPending || !name.trim() || name.trim() === (profile?.name ?? "")}
            >
              {saveMut.isPending ? "Menyimpan…" : "Simpan perubahan"}
            </Button>
          </div>
        </Card>

        <Card className="mt-6" variant="glow">
          <CardHeader>
            <CardTitle>Unlock Premium</CardTitle>
            <CardDescription>
              Unlimited library, 100 AI generate per hari, dan lainnya.
            </CardDescription>
          </CardHeader>
          <Button asChild>
            <Link to="/upgrade">Lihat Premium</Link>
          </Button>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Sign out</CardTitle>
            <CardDescription>Akhiri sesi di perangkat ini.</CardDescription>
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

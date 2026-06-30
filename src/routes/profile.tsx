import { createFileRoute, Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/app/AppLayout";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/app/Card";
import { Button } from "@/components/app/Button";
import { Input, Label } from "@/components/app/Input";
import { Badge } from "@/components/app/Badge";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — ScriptFlow" },
      { name: "description", content: "Manage your ScriptFlow profile and preferences." },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
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
              A
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">Alex Creator</p>
              <p className="text-xs text-muted-foreground">alex@creator.studio</p>
            </div>
            <Badge variant="electric" className="ml-auto">Free</Badge>
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
              <Input id="name" defaultValue="Alex Creator" />
            </div>
            <div>
              <Label htmlFor="handle">Creator handle</Label>
              <Input id="handle" placeholder="@yourhandle" />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="alex@creator.studio" />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost">Cancel</Button>
            <Button>Save changes</Button>
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
      </div>
    </AppLayout>
  );
}

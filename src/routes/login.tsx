import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthLayout } from "@/components/app/AuthLayout";
import { Button } from "@/components/app/Button";
import { Input, Label } from "@/components/app/Input";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — ScriptFlow" },
      { name: "description", content: "Log in to your ScriptFlow workspace." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to your ScriptFlow workspace."
      footer={
        <>
          New here?{" "}
          <Link to="/register" className="text-electric hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => e.preventDefault()}
      >
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@creator.studio" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="••••••••" />
        </div>
        <Button type="submit" className="w-full" size="lg">
          Log in
        </Button>
        <Button type="button" variant="secondary" className="w-full" size="lg">
          Continue with Google
        </Button>
      </form>
    </AuthLayout>
  );
}

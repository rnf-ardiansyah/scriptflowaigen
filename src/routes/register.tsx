import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthLayout } from "@/components/app/AuthLayout";
import { Button } from "@/components/app/Button";
import { Input, Label } from "@/components/app/Input";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your ScriptFlow account" },
      {
        name: "description",
        content: "Start free. Generate your first short-video script in under a minute.",
      },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start free. Generate your first script in under a minute."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="text-electric hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="Your name" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@creator.studio" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="At least 8 characters" />
        </div>
        <Button asChild type="submit" className="w-full" size="lg">
          <Link to="/onboarding">Start Free</Link>
        </Button>
        <Button type="button" variant="secondary" className="w-full" size="lg">
          Continue with Google
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          By signing up, you agree to our Terms and Privacy.
        </p>
      </form>
    </AuthLayout>
  );
}

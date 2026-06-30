import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthLayout } from "@/components/app/AuthLayout";
import { Button } from "@/components/app/Button";
import { Input, Label } from "@/components/app/Input";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { routeAfterAuth } from "@/lib/profile-helpers";
import { mapAuthError } from "@/lib/auth-errors";

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
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { name },
      },
    });
    if (signUpError) {
      setError(mapAuthError(signUpError.message));
      setLoading(false);
      return;
    }
    // If email confirmation is disabled, session is returned immediately.
    if (data.session) {
      const dest = await routeAfterAuth();
      navigate({ to: dest, replace: true });
    } else {
      // Cloud projects default to no-confirm; if confirmation is on, prompt user.
      setError("Check your email to confirm your account, then log in.");
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setGoogleLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError(mapAuthError(result.error.message ?? "Google sign-in failed"));
      setGoogleLoading(false);
      return;
    }
    if (result.redirected) return;
    const dest = await routeAfterAuth();
    navigate({ to: dest, replace: true });
  }

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
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@creator.studio"
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
          />
        </div>
        {error && (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Creating account…" : "Start Free"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          size="lg"
          onClick={handleGoogle}
          disabled={googleLoading}
        >
          {googleLoading ? "Opening Google…" : "Continue with Google"}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          By signing up, you agree to our Terms and Privacy.
        </p>
      </form>
    </AuthLayout>
  );
}

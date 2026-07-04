import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthLayout } from "@/components/app/AuthLayout";
import { Button } from "@/components/app/Button";
import { Input, Label } from "@/components/app/Input";
import { GoogleIcon } from "@/components/app/GoogleIcon";
import { supabase } from "@/integrations/supabase/client";
import { routeAfterAuth } from "@/lib/profile-helpers";
import { mapAuthError } from "@/lib/auth-errors";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Log in — Script Flow" },
      { name: "description", content: "Log in to your Script Flow workspace." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(mapAuthError(signInError.message));
      setLoading(false);
      return;
    }
    const dest = await routeAfterAuth();
    navigate({ to: dest, replace: true });
  }

  async function handleGoogle() {
    setError(null);
    setGoogleLoading(true);
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (oauthError) {
      setError(mapAuthError(oauthError.message ?? "Google sign-in failed"));
      setGoogleLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to your Script Flow workspace."
      footer={
        <>
          New here?{" "}
          <Link to="/register" className="text-electric hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              to="/forgot-password"
              className="text-xs text-electric hover:underline"
            >
              Lupa password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        {error && (
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Signing in…" : "Log in"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          size="lg"
          onClick={handleGoogle}
          disabled={googleLoading}
        >
          <GoogleIcon />
          {googleLoading ? "Opening Google…" : "Continue with Google"}
        </Button>
      </form>
    </AuthLayout>
  );
}

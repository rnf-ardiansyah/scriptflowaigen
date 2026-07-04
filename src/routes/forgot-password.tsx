import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AuthLayout } from "@/components/app/AuthLayout";
import { Button } from "@/components/app/Button";
import { Input, Label } from "@/components/app/Input";
import { supabase } from "@/integrations/supabase/client";
import { mapAuthError } from "@/lib/auth-errors";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Lupa password — Script Flow" },
      { name: "description", content: "Reset password akun Script Flow kamu." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (err) {
      setError(mapAuthError(err.message));
      return;
    }
    setSent(true);
  }

  return (
    <AuthLayout
      title="Lupa password?"
      subtitle="Masukkan email kamu — kami akan kirim link reset."
      footer={
        <>
          Ingat password kamu?{" "}
          <Link to="/login" className="text-electric hover:underline">
            Kembali ke login
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="space-y-4 text-center">
          <p className="rounded-lg border border-electric/40 bg-electric/10 px-3 py-3 text-sm text-foreground">
            Link reset password sudah dikirim ke <strong>{email}</strong>. Cek inbox
            (atau folder spam) kamu.
          </p>
          <Button asChild variant="secondary" className="w-full">
            <Link to="/login">Kembali ke login</Link>
          </Button>
        </div>
      ) : (
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
          {error && (
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Mengirim…" : "Kirim link reset"}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}

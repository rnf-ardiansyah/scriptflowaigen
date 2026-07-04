import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AuthLayout } from "@/components/app/AuthLayout";
import { Button } from "@/components/app/Button";
import { Input, Label } from "@/components/app/Input";
import { supabase } from "@/integrations/supabase/client";
import { mapAuthError } from "@/lib/auth-errors";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — ScriptFlow" },
      { name: "description", content: "Atur password baru untuk akun ScriptFlow." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  useEffect(() => {
    // Supabase's redirect includes tokens in the URL hash; the client picks
    // them up automatically. Confirm we have a recovery session.
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError("Password minimal 6 karakter.");
      return;
    }
    if (password !== confirm) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      setError(mapAuthError(err.message));
      return;
    }
    toast.success("Password berhasil diperbarui");
    navigate({ to: "/login", replace: true });
  }

  return (
    <AuthLayout
      title="Atur password baru"
      subtitle="Buat password baru untuk akun kamu."
      footer={
        <>
          <Link to="/login" className="text-electric hover:underline">
            Kembali ke login
          </Link>
        </>
      }
    >
      {hasSession === false ? (
        <div className="space-y-4 text-center">
          <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-3 text-sm text-destructive">
            Link reset tidak valid atau sudah kadaluarsa. Silakan minta link baru.
          </p>
          <Button asChild className="w-full">
            <Link to="/forgot-password">Minta link baru</Link>
          </Button>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="password">Password baru</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 6 karakter"
            />
          </div>
          <div>
            <Label htmlFor="confirm">Konfirmasi password</Label>
            <Input
              id="confirm"
              type="password"
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Ulangi password baru"
            />
          </div>
          {error && (
            <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading || hasSession === null}
          >
            {loading ? "Menyimpan…" : "Perbarui password"}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}

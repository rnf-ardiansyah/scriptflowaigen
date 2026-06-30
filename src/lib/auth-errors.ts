/**
 * Map raw Supabase / network auth error messages to user-friendly Indonesian text.
 * Keep this client-only — no PII, no stack traces.
 */
export function mapAuthError(raw: string | undefined | null): string {
  if (!raw) return "Terjadi kesalahan. Coba lagi sebentar.";
  const msg = String(raw).toLowerCase();

  if (msg.includes("invalid login") || msg.includes("invalid credentials"))
    return "Email atau password salah.";
  if (msg.includes("email not confirmed"))
    return "Email kamu belum dikonfirmasi. Cek inbox dulu ya.";
  if (msg.includes("user already registered") || msg.includes("already been registered"))
    return "Email ini sudah terdaftar. Silakan login.";
  if (msg.includes("password should be at least"))
    return "Password minimal 6 karakter.";
  if (msg.includes("rate limit") || msg.includes("too many"))
    return "Terlalu banyak percobaan. Coba lagi beberapa menit lagi.";
  if (msg.includes("network") || msg.includes("failed to fetch"))
    return "Koneksi internet bermasalah. Cek koneksi lalu coba lagi.";
  if (msg.includes("invalid email"))
    return "Format email tidak valid.";
  if (msg.includes("unsupported provider") || msg.includes("provider not enabled"))
    return "Login Google belum aktif. Coba pakai email & password.";
  if (msg.includes("popup") && msg.includes("closed"))
    return "Jendela login Google ditutup sebelum selesai.";

  // Return cleaned raw message as fallback (strip technical prefixes).
  return raw.replace(/^(AuthApiError|AuthError):\s*/i, "").trim();
}

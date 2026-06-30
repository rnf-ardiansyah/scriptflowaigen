
# Polish & Deploy-Prep Plan

Tujuan: stabilkan semua yang sudah dibangun. Tidak ada fitur baru, tidak ada perubahan skema DB.

## 1. Responsiveness (mobile-first)

**Masalah utama yang ditemukan:**
- `AppLayout` hanya punya nav `hidden md:flex` — user mobile **tidak bisa berpindah** antar Dashboard/Library/Upgrade/Profile setelah login. Ini blocker untuk target user yang mayoritas dari HP.
- Library sidebar folder fixed `md:grid-cols-[240px_1fr]` → di mobile sidebar memakan layar penuh sebelum grid script.
- Editor toolbar (back, save indicator, AI actions, teleprompter) padat di lebar HP.
- Beberapa header pakai `flex flex-wrap` tanpa `min-w-0` / `truncate` (Dashboard greeting, Profile).
- Teleprompter floating controls perlu cek di lebar ≤360px.

**Yang akan dilakukan:**
- Tambahkan **bottom tab bar mobile** di `AppLayout` (Dashboard / Library / Upgrade / Profile) yang muncul hanya di `<md`, dengan ikon + label kecil. Sign-out tetap di header (icon-only di mobile).
- Library: di mobile, ganti sidebar jadi **horizontal scrollable chip strip** untuk folder; tetap pakai sidebar vertikal di `md+`.
- Editor: bungkus toolbar dengan grid 2-baris di mobile (back di atas, action group di bawah, full-width AIActions).
- Audit setiap halaman dengan pola `grid-cols-[minmax(0,1fr)_auto] + min-w-0 + shrink-0 + truncate` sesuai standar responsive proyek.
- Verifikasi visual via Playwright pada viewport 375 (mobile), 768 (tablet), 1280 (desktop) untuk: Landing, Login, Register, Onboarding, Dashboard, Library, Editor, Teleprompter, Profile, Upgrade, New-Script.

## 2. Loading & Empty States

**Masalah:**
- `_authenticated/route.tsx` tidak punya `pendingComponent`. Saat `useSuspenseQuery` belum terisi (mis. invalidate), user lihat blank.
- `profile.tsx` masih pakai `useEffect + useState` manual (bukan React Query), tanpa skeleton, tanpa toast.
- Onboarding tidak punya skeleton saat profile awal di-fetch.

**Yang akan dilakukan:**
- Buat `<AppLoadingState />` skeleton (header + 2 card placeholder) dan pasang sebagai `pendingComponent` di `_authenticated/route.tsx` dan `pendingMs: 200`.
- Refactor `profile.tsx` jadi pakai `profileQuery()` (sudah ada di `lib/scripts.ts`) + mutation, jadi konsisten dengan dashboard & dapat skeleton dari pending state.
- Pastikan semua empty state sudah ada (Library, Dashboard sudah OK — verifikasi saja).

## 3. Error Handling & Toast Feedback

**Masalah:**
- `login.tsx` / `register.tsx` menampilkan pesan Supabase mentah (mis. "Invalid login credentials" OK, tapi "AuthApiError: …" jelek).
- `profile.tsx` save tidak punya feedback sukses/gagal.
- Editor auto-save toast hanya muncul saat gagal — sudah OK, tapi error pesan masih mentah.
- AI errors di hook regen / rewrite belum semua dipetakan ke pesan ramah.

**Yang akan dilakukan:**
- Buat util kecil `mapAuthError(message)` untuk login/register (invalid creds, email exists, weak password, network).
- Profile save: bungkus dengan try/catch + `toast.success` / `toast.error`, invalidate `["profile","me"]`.
- Audit `AIActions.tsx` dan `HookRegenButton`: tangkap `lovable.code === "rate_limited" | "parse_failed"` dan map ke pesan ramah + arahkan ke /upgrade jika rate_limited.
- Pastikan semua mutasi (toggle favorite, duplicate, delete, create/delete folder, move folder) sudah pakai toast — sudah OK; tambahkan yang belum.

## 4. UI Consistency Audit

- Pastikan semua tombol pakai `Button` primitive (no raw `<button>` untuk action utama). Ada beberapa raw `<button>` (favorite toggle, folder add) yang sengaja icon-only — biarkan, tapi standarkan ukuran 36px, focus ring `ring-electric/40`.
- Audit warna: tidak ada hardcoded `text-white` / `bg-black` / hex literal di komponen aplikasi (gunakan token `text-foreground`, `bg-background`, `text-electric`).
- Spacing: padding card konsisten (sudah `Card` primitive), pastikan section utama pakai `mx-auto max-w-7xl px-6` (Editor: `max-w-5xl`, Auth: lebih sempit — biarkan).
- Tipografi: heading utama `text-3xl md:text-4xl font-bold tracking-tight text-gradient`, subheading `text-xl font-semibold tracking-tight`.

## 5. Performance Check

**Temuan:**
- Editor auto-save memanggil `qc.invalidateQueries({ queryKey: ["scripts"] })` setiap simpan → refetch list, recent, counts, **dan detail saat ini** (yang baru saja disimpan, jadi mubazir dan bisa bikin flicker).
- `useRouter` di `EditorPage` di-import tapi tidak dipakai.
- AppLayout scroll listener sudah pakai `requestAnimationFrame` — OK.
- Dashboard quota query: 3 round-trip (profile, generations count, scripts count) — fine, satu request paralel.

**Yang akan dilakukan:**
- Setelah `updateScript` berhasil di Editor: panggil `qc.setQueryData(["scripts","detail",id], updated)` dan invalidate hanya `["scripts","list"]`, `["scripts","recent"]`, `["scripts","counts"]` — bukan seluruh `["scripts"]` tree.
- Hapus unused import `useRouter` di `EditorPage` (ambient `router` masih dipakai di `EditorLoaded`).
- Pastikan `defaultPreloadStaleTime: 0` di router config tidak menyebabkan double-fetch saat hover Link — sudah default TanStack, biarkan.

## 6. Full Flow QA (Playwright)

Jalankan satu skrip Playwright end-to-end menggunakan session injection yang sudah disiapkan sandbox (`LOVABLE_BROWSER_AUTH_STATUS`):

```text
1. /register → email+password → /onboarding (jika status=signed_out, skip auto-test & laporkan ke user)
2. Onboarding 3 step → /dashboard
3. Dashboard → "Buat Script Baru" → /new-script → submit ide → /editor/:id
4. Edit field manual → tunggu indicator "Tersimpan"
5. Klik AI Rewrite (Santai) → preview dialog → Accept
6. Klik "Buka di Teleprompter" → Start/Pause/Speed/Fullscreen
7. Kembali ke /library → favorite, duplicate, create folder, move to folder, search
8. Cek panel kuota di /dashboard (counter naik 1)
9. Logout → cek redirect ke /login
```

Google OAuth tidak bisa diuji otomatis (popup eksternal). Akan diverifikasi manual oleh user; akan dipastikan flow `routeAfterAuth()` tetap jalan setelah session muncul.

Setiap kegagalan akan dilaporkan dengan screenshot & langkah reproduksi sebelum dianggap selesai.

## 7. Deploy Prep

**Catatan penting tentang target deploy:**
Project ini berjalan di TanStack Start dengan target Cloudflare Worker (default Lovable). Lovable sudah punya hosting sendiri (preview & published URL aktif di `scriptflowaigen.lovable.app`). Deploy ke **Vercel** memerlukan self-hosting setup tambahan (mengubah Vite SSR adapter ke `@tanstack/start-server-adapter-vercel` & konfigurasi env vars di Vercel dashboard).

Sebelum mulai, akan **mengkonfirmasi** ke user:
> "Mau tetap pakai hosting Lovable (siap pakai, tinggal Publish), atau wajib pindah ke Vercel? Pindah Vercel = perubahan build target + setup manual env vars di Vercel."

**Apapun targetnya, akan diverifikasi:**
- Env vars yang client-safe: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` (publishable, aman).
- Env vars server-only (TIDAK ter-expose ke client): `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `LOVABLE_API_KEY`. Sudah di-access via `process.env.*` di dalam `.handler()` server functions — tidak akan terbundle ke client.
- Audit cepat: `rg "LOVABLE_API_KEY|SERVICE_ROLE" src --glob '!*.functions.ts' --glob '!*.server.ts'` harus 0 hit di client code.
- Production build (`bun run build`) bersih dari error & critical warning.
- `security--run_security_scan` → 0 critical findings sebelum publish.

## Pelaporan

Setelah eksekusi, akan kirim ringkasan:
- ✅ Lulus: daftar yang OK
- ⚠️ Catatan: hal kecil yang masih bisa di-polish nanti
- ❌ Blocker: kalau ada flow yang gagal — disertai langkah reproduksi & screenshot

Hanya akan minta tombol Publish ditekan kalau semua di atas hijau.

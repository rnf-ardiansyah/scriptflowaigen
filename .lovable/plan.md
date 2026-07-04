## Audit — apa yang kurang di ScriptFlow

### A. Legal & kepercayaan (missing)
- Tidak ada halaman **Privacy Policy** (`/privacy`).
- Tidak ada halaman **Terms of Service** (`/terms`).
- Footer landing kemungkinan link ke halaman ini tapi rute belum ada → link mati.

### B. Auth flow tidak lengkap
- Tidak ada **Forgot Password** (`/forgot-password`).
- Tidak ada **Reset Password** (`/reset-password`) — WAJIB kalau tombol "lupa password" mau berfungsi.
- Di `/login` belum ada link "Lupa password?".

### C. Aset publik & SEO teknis (missing)
- Folder `public/` kosong → tidak ada `robots.txt`, `sitemap.xml`, `favicon.ico`, `site.webmanifest`.
- Belum ada favicon custom untuk ScriptFlow.

### D. Profil user (thin)
- Tidak bisa **ganti password** dari halaman Profile.
- Tidak bisa **hapus akun**.
- Belum ada indikator "Member since" / tanggal bergabung.

### E. Landing — social proof tipis
- Tidak ada testimonial / logo-strip / angka statistik singkat ("500+ kreator", "10.000 skrip dibuat"). Cukup 1 blok kecil.

### F. Editor / Library — quality of life
- Library sudah ada search (OK).
- Editor belum punya tombol **Copy full script** dan **Download `.txt`** — sering dibutuhkan kreator.

---

## Rencana penambahan (SIMPEL, tidak ribet)

Hanya hal yang benar-benar berguna dan cepat dikerjakan. Tidak menambah dependency baru.

### 1. Auth: Forgot & Reset Password
- Route baru `src/routes/forgot-password.tsx`: form email → `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-password' })`.
- Route baru `src/routes/reset-password.tsx` (public): form password baru → `supabase.auth.updateUser({ password })`, cek hash `type=recovery`.
- Tambah link "Lupa password?" di `src/routes/login.tsx`.

### 2. Halaman Legal (statik, ringkas, Bahasa Indonesia)
- `src/routes/privacy.tsx` — Kebijakan Privasi ringkas (data yang dikumpulkan, cookie, kontak).
- `src/routes/terms.tsx` — Ketentuan Layanan ringkas (akun, konten user, pembayaran, penghentian).
- Pakai layout landing (Navbar + Footer) supaya konsisten.
- Update link Footer landing agar mengarah ke route ini.

### 3. Aset publik & SEO teknis
- Buat `public/robots.txt` (`User-agent: *` + `Sitemap:` ke published URL).
- Buat `public/sitemap.xml` sederhana (list rute publik: /, /login, /register, /privacy, /terms).
- Generate 1 favicon PNG ScriptFlow (imagegen) + `public/favicon.ico` + `<link rel="icon">` di `__root.tsx`.

### 4. Profile page — akun kontrol
File: `src/routes/_authenticated/profile.tsx`
- Card "Ganti password": input password baru + confirm → `supabase.auth.updateUser({ password })`.
- Card "Hapus akun": tombol dengan konfirmasi 2-langkah → sign out + toast "Hubungi support untuk penghapusan permanen" (versi ringkas; hard delete butuh service role, skip).
- Tampilkan `Member since` dari `profile.created_at`.

### 5. Landing — mini social proof strip
File: baru `src/components/landing/SocialProof.tsx`, dipasang di `src/routes/index.tsx` setelah `Hero`.
- 3 angka statis: "500+ kreator", "10K+ skrip dibuat", "4.8/5 rating".
- Tidak ada foto/testimonial palsu — hanya angka + label singkat + subtle glow. Bisa diganti nanti kalau ada data real.

### 6. Editor — tombol Copy & Download
File: `src/routes/_authenticated/editor.$scriptId.tsx`
- Tambah 2 tombol kecil di header editor:
  - **Copy** → `navigator.clipboard.writeText(fullScript)` + toast.
  - **Download .txt** → buat Blob, trigger download `<script-title>.txt`.

---

## Yang SENGAJA dilewati (biar tidak ribet)
- Testimonial + foto asli, integrasi analitik, cookie banner GDPR, ubah bahasa, PWA install prompt, delete-account hard delete, billing history, keyboard shortcuts panel, changelog page, blog.

Kalau approve, aku kerjakan 6 poin di atas berurutan dalam 1 turn.

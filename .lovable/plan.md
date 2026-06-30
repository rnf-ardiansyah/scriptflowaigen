## Tahap Akhir: QA & Pre-Publish Verification (No Feature Work)

Sesuai instruksi: tidak menambah fitur baru, fokus audit kualitas. Mayoritas item polish (mobile nav, skeleton, error mapping Indonesia, optimistic autosave, theme toggle, IDR pricing) sudah dikerjakan di iterasi sebelumnya. Tahap ini = verifikasi + perbaikan spot kalau ditemukan masalah.

### 1. Production build check (wajib, blocking)
- Jalankan `bun run build` dan `bunx tsgo --noEmit`.
- Tangkap warning kritis (unused exports tidak masuk, fokus: type errors, missing routes, server-only leak ke client bundle).
- Verifikasi tidak ada file `*.server.ts` ter-import langsung dari komponen/route.
- Konfirmasi `LOVABLE_API_KEY` & `SUPABASE_SERVICE_ROLE_KEY` **tidak** muncul di chunk `dist/client/**` (grep).

### 2. Audit kode statis (paralel grep)
- **Performance**: cari pola anti-pattern — `useQuery` tanpa key stabil, `useEffect` fetch loop, autosave timeout tanpa cleanup, list query yang tidak invalidate-only-when-needed. Target: konfirmasi autosave Editor (2 s debounce, optimistic via `qc.setQueryData`) tidak refetch detail-nya sendiri.
- **Konsistensi UI**: grep hardcoded color (`text-white`, `bg-black`, `bg-[#…]`, hex literal) di luar token semantik; konfirmasi semua tombol pakai `<Button>` dari `@/components/app/Button`, card pakai `<Card>`, input pakai `<Input>`.
- **Error handling**: konfirmasi setiap `await ... .functions/...` di komponen dibungkus `try/catch` + toast Indonesia (lewat `auth-errors.ts` / `classifyAiError`) — tidak ada raw `error.message` dari Supabase/AI yang bocor ke user.
- **Empty states**: tiap list (Dashboard recent, Library grid, Folder list, Generations) punya copy kosong yang informatif (bukan layar putih).

### 3. Responsive audit di 3 viewport
Pakai Playwright ke `localhost:8080`, screenshot setiap halaman di 375×812 (mobile), 768×1024 (tablet), 1280×900 (desktop):
- Public: `/`, `/login`, `/register`
- Authenticated (perlu sesi diinjeksi): `/onboarding`, `/dashboard`, `/library`, `/editor/<id>`, `/teleprompter/<id>`, `/profile`, `/upgrade`, `/generator`

Cek per screenshot: tidak ada horizontal scroll, header tidak collapse/clipping (grid + min-w-0 pattern), tombol cukup besar untuk thumb-tap (≥40 px), bottom nav mobile tidak menutupi konten.

### 4. Full-flow E2E (butuh sesi)
Setelah kamu sign-in di preview, jalankan Playwright:
1. `/dashboard` muncul greeting + kuota — screenshot
2. `/generator` → isi idea → Generate (real Gemini) → screenshot hasil — verifikasi 4 bagian terisi, reading time muncul, tombol "Buka di Editor" aktif
3. Klik Editor → ubah field → tunggu autosave "Tersimpan" — screenshot
4. AI Rewrite "Lebih Santai" → preview dialog → Terima — verifikasi field ter-update
5. Buka Teleprompter → klik Start → cek auto-scroll bergerak (snapshot scrollY setelah 2 s) → Pause → Speed 2× → Font besar — screenshot
6. Library → klik favorite → buat folder baru "Test" → assign script → filter folder "Test" → search keyword → screenshot
7. `/profile` → cek data niche/experience tampil
8. `/upgrade` → cek perbandingan plan & tombol placeholder
9. Sign out → verifikasi redirect ke `/login`

Untuk Google OAuth saya cuma verifikasi handler di Login/Register page memanggil `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })` dengan benar (consent flow wajib diuji manual oleh kamu).

### 5. Cek limit harian (skenario edge)
Karena akun kamu mungkin sudah hampir mencapai limit, saya cek tabel `generations` via `psql` (read-only) untuk hitung count hari ini. Kalau plan=free dan count≥5, halaman Generator harus tampil card "Limit harian tercapai" + tombol `/upgrade` — bukan crash atau infinite loading.

### 6. Laporan akhir
Saya berikan satu ringkasan: ✅ apa yang lulus, ⚠️ apa yang perlu fix (dengan severity), 🔴 apa yang blocking publish. **Tidak menekan tombol Publish** — kamu yang final-approve setelah baca laporan.

### Hal yang TIDAK saya kerjakan di tahap ini
- Tidak menambah fitur baru.
- Tidak refactor besar tanpa alasan (cuma fix targeted kalau audit menemukan bug).
- Tidak memindahkan platform ke Vercel kecuali kamu konfirmasi mau migrasi (di luar scope tahap polish).
- Tidak menjalankan Google OAuth headless (impossible).

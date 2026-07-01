# Terjemahkan Landing Page ke Bahasa Indonesia

Semua copywriting berbahasa Inggris di landing page diganti menjadi Bahasa Indonesia yang friendly, casual, dan creator-first — sesuai brand personality ScriptFlow. Struktur, layout, warna, komponen, dan logic **tidak diubah**. Hanya string teks yang diganti.

## Cakupan

Hanya file di `src/components/landing/` + metadata SEO di route root/index. Halaman app (dashboard, editor, dll) sudah campuran Indonesia — tidak disentuh di tahap ini kecuali diminta.

## File yang diubah

1. **`src/components/landing/Hero.tsx`**
   - Headline "Write Better Short Video Scripts in Minutes with AI" → "Tulis Skrip Video Pendek Lebih Baik dalam Hitungan Menit dengan AI"
   - Subheadline, badge, tombol CTA ("Start Free", "See how it works"), social proof — semua ke Indonesia.

2. **`src/components/landing/Navbar.tsx`**
   - Link nav (Features, Pricing, FAQ dsb.), tombol "Sign in" / "Get started" → "Masuk" / "Mulai Gratis".

3. **`src/components/landing/ProblemSection.tsx`**
   - Eyebrow "The problem", judul, deskripsi, 4 pain point (Blank when recording, Weak hooks, Too many apps, Lost scripts), workflow "Old workflow" vs "ScriptFlow" + catatan.

4. **`src/components/landing/SolutionSection.tsx`**
   - Eyebrow, judul, deskripsi, 3 bullet points, kalimat penutup "Built for beginner creators…", label tile (Idea/Generate/Edit/Save/Practice/Record) → (Ide/Generate/Edit/Simpan/Latihan/Rekam), banner "Live · Your last 3 scripts…".

5. **`src/components/landing/FeaturesBento.tsx`**
   - Judul section + semua kartu fitur (title + description).

6. **`src/components/landing/ProductShowcase.tsx`**
   - Eyebrow "Product", judul, deskripsi, label kartu mengambang (Teleprompter/History/AI Rewrite) + isi.

7. **`src/components/landing/HowItWorks.tsx`**
   - Eyebrow, judul, 5 langkah (Enter an idea → Record) diterjemahkan.

8. **`src/components/landing/Benefits.tsx`**
   - Semua benefit copy.

9. **`src/components/landing/Pricing.tsx`**
   - Sudah sebagian besar Indonesia. Sisanya: nama plan tetap "Free"/"Premium" (istilah umum), deskripsi & CTA sudah Indonesia — cek konsistensi, ganti period `/ bulan` sudah OK. Tambah terjemahan untuk teks yang masih English kalau ada.

10. **`src/components/landing/FAQ.tsx`**
    - Eyebrow "FAQ" (tetap), judul "Questions, answered." → "Pertanyaan yang sering ditanyakan.", 7 Q&A diterjemahkan.

11. **`src/components/landing/FinalCTA.tsx`**
    - Badge, judul "Ready to create better videos?" → "Siap bikin video yang lebih baik?", subteks, tombol "Start Free Today" / "Book a Demo" → "Mulai Gratis Sekarang" / "Jadwalkan Demo", mock panel labels.

12. **`src/components/landing/Footer.tsx`**
    - Semua label kolom, link, tagline, copyright.

13. **`src/components/landing/SectionHeader.tsx`**
    - Tidak ada string statis — skip.

14. **`src/components/landing/DashboardMock.tsx`**
    - Placeholder teks di mock (jika ada label English) → Indonesia. Nama tombol/label UI dashboard yang tampil di mock disesuaikan.

15. **SEO metadata** di `src/routes/__root.tsx` dan `src/routes/index.tsx`
    - `title`, `description`, `og:title`, `og:description`, `twitter:*`, JSON-LD `description` → Indonesia. `og:image` tidak diubah.

## Prinsip terjemahan

- Tone: casual, friendly, creator-first ("kamu", bukan "Anda").
- Istilah teknis umum tetap English bila lebih natural: script, hook, teleprompter, library, AI, template, TikTok/Reels/Shorts, dashboard, workspace.
- Angka & satuan Indonesia (Rp, per hari, per bulan) — sudah konsisten di Pricing.
- Panjang kalimat dijaga supaya layout hero/CTA tidak pecah di mobile.

## Yang TIDAK diubah

- Halaman app di `src/routes/_authenticated/*` (sudah Indonesia).
- Auth pages `/login`, `/register`, `/onboarding` (sudah Indonesia).
- Logic, komponen UI primitif, warna, layout, ikon, gambar.
- `src/lib/auth-errors.ts` (sudah Indonesia).

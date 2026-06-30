## Tujuan

Sambungkan halaman `/generator` ke server function `generateScript` yang sudah ada (real Gemini via Lovable AI Gateway), ganti `buildDummyScript` + setTimeout palsu — **tanpa mengubah tampilan/layout/animasi**. Backend sudah memenuhi semua spec.

## Status setiap requirement

Spec backend (sudah ada di `src/lib/ai.functions.ts`, tidak perlu diubah):
- ✅ Auth wajib via `requireSupabaseAuth` middleware
- ✅ Prompt Gemini lengkap: peran script writer ID, niche-aware, larangan sapaan generik, 4 bagian, JSON-only
- ✅ Parse JSON + strip code fence; retry 1× dengan instruksi lebih tegas; error jelas kalau gagal
- ✅ Log ke `generations` (user_id, model `gemini-flash`, status success/failed, tokens jika ada)
- ✅ Rate limit harian: free=5, premium=100 (hitung row `generations` status=success hari ini per user)
- ✅ Cache: cek `scripts` row dengan idea+niche+tone sama → reuse, tidak panggil Gemini, tidak kurangi kuota
- ✅ Auto-save ke `scripts` dengan reading_time terhitung
- ⚠️ Spec minta model `gemini-flash` → backend pakai `google/gemini-3-flash-preview` (Lovable Gateway). Tetap pertahankan (default chat model resmi); label status di tabel `generations` tetap "gemini-flash" agar konsisten.

Spec frontend:
- ✅ Sidebar `QuotaPanel` sudah baca dari tabel `generations` (real)
- ❌ Halaman `/generator` masih pakai dummy → **perlu diganti**

## Yang akan diubah

File tunggal: `src/routes/_authenticated/generator.tsx`

1. **Hapus** `buildDummyScript` (function + import yang tidak terpakai). Pertahankan helper `buildFullScript`, `computeReadingTime`, dan semua state/UI/animasi.
2. **`handleGenerate`** dirombak logic-nya saja:
   - Set `phase = "generating"`, mulai timer elapsed (efek skeleton + counter tetap jalan apa adanya).
   - Panggil `useServerFn(generateScript)({ data: { idea, niche, tone: style } })`.
   - Saat resolve: isi `result` dari response (hook/retain/reward/cta), reveal 4 section sekaligus (semua `filled`), set `scriptId` dari response (cache & save dilakukan di server), `phase = "done"`, invalidate `["scripts"]` & `["quota"]`.
   - Saat reject: baca `error.lovable.code` jika ada:
     - `rate_limited` → `phase = "limit_reached"`, render card ramah dengan tombol "Upgrade ke Premium" → `/upgrade`.
     - `script_limit_reached` → tampilkan card serupa dengan CTA ke `/upgrade` (library penuh).
     - lainnya (`parse_failed`, `ai_unavailable`, network) → `phase = "error"`, render card error dengan tombol "Coba Lagi" yang re-trigger `handleGenerate`.
3. **`handleSave`** disederhanakan: server sudah otomatis create `scripts` row dan return `scriptId`, jadi tombol "Save to Library" cukup jadi tombol navigasi cepat "Buka di Editor" (atau tetap "Save to Library" yang langsung route ke editor karena sudah tersimpan). Aku akan ubah tombol jadi langsung **"Buka di Editor"** + tombol kedua **"Buka Teleprompter"** — keduanya pakai `scriptId` yang sudah dikembalikan server. Tidak ada double-save.
4. **State baru**: `phase` diperluas dengan `"limit_reached" | "error"` + `errorMessage`. Card hasil di-render kondisional di posisi yang sama:
   - `generating` → skeleton + elapsed (existing).
   - `done` → hasil + tombol (existing, tombol simpan diganti seperti #3).
   - `limit_reached` → card khusus limit + CTA upgrade.
   - `error` → card error + tombol "Coba Lagi".

Animasi/layout/badge/setting bar tidak disentuh.

## Tes end-to-end (Playwright)

Setelah implementasi:
1. Login user existing → buka `/generator`, isi idea baru, klik Generate.
2. Verifikasi: timer jalan, skeleton muncul, lalu 4 section terisi dari Gemini sungguhan (bukan kalimat dummy).
3. Verifikasi DB: row baru di `scripts` + row `generations` status=success.
4. Klik "Buka di Editor" → halaman editor tampil dengan reading_time terisi.
5. Generate dengan idea+niche+tone yang **sama** → harus instan (cache hit), tidak ada row `generations` baru.
6. Spot-check QuotaPanel di sidebar menampilkan angka real.

## Catatan teknis (untuk reviewer)

- `generateScript` mengembalikan `{ scriptId, cached, hook, retain, reward, cta }`. Frontend tinggal pasang state.
- Error berbentuk `Error` dengan property `lovable: { code, message, ... }` — useServerFn melempar `Error` biasa, kita baca `error.message` dan, jika ada, hint `code` dari struktur error. Untuk membedakan rate-limit, server sudah memformat message dengan prefix yang konsisten (`limit harian tercapai`) — kalau perlu, tambahkan parsing message sebagai fallback.
- Tidak ada perubahan schema DB, tidak ada migration, tidak ada secret baru. `LOVABLE_API_KEY` sudah ada.

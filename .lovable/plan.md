## Goal
Tambahkan 3 fitur AI tambahan di Script Editor (`/editor/:scriptId`) yang memanfaatkan Gemini via Lovable AI Gateway, mengikuti pola loading + error handling yang sama dengan AI Script Generator, dan tetap menghormati rate-limit harian (free 5 / premium 100) serta logging ke tabel `generations`.

## Fitur

### 1. AI Rewrite
- Tombol **"Rewrite"** di header editor → dropdown 3 gaya: *Lebih Santai*, *Lebih Formal*, *Lebih Lucu*.
- Kirim `full_script` (gabungan hook/retain/reward/cta saat ini) + niche + idea + gaya ke Gemini.
- Prompt menginstruksikan Gemini menulis ulang **dengan tetap mempertahankan struktur 4 bagian** dan inti pesan. Respons WAJIB JSON `{hook, retain, reward, cta}`. Retry 1× kalau parse gagal (mirroring `generateScript`).
- Hasil tidak langsung menimpa: muncul **Diff Preview Dialog** (side-by-side / stacked: "Sebelum" vs "Sesudah" per bagian) dengan tombol **Terima** (replace form + trigger auto-save) atau **Tolak** (tutup dialog, form tidak berubah).

### 2. AI Shorten
- Tombol **"Persingkat Script"** → dropdown target durasi: **30 detik** / **15 detik**.
- Hitung `target_words = target_detik × 2.5` dan kirim ke Gemini sebagai constraint keras ("jumlah kata total ≤ N, jangan melebihi"). Tetap minta output JSON 4 bagian, intinya tetap utuh.
- Preview dialog yang sama (re-use) dengan badge tambahan "Estimasi durasi baru: XX detik". Terima/Tolak persis seperti Rewrite.

### 3. AI Hook Regenerator
- Tombol ikon kecil (✨) di samping label field **Hook**.
- Kirim `idea` + `niche` + hook saat ini sebagai konteks; minta **3 variasi hook berbeda** dalam JSON `{variants: [string, string, string]}`. Retry 1× jika gagal.
- Dialog menampilkan ketiga kandidat sebagai cards yang bisa diklik. Klik salah satu → set field hook + tutup dialog (auto-save jalan otomatis lewat mekanisme debounce existing). Sisanya dibuang. Ada tombol "Batal".

## Backend (server functions)

Buat file baru `src/lib/ai-edits.functions.ts` agar `ai.functions.ts` (generator dari nol) tidak makin besar. Tiga server function, masing-masing pakai `requireSupabaseAuth` middleware:

- `rewriteScript({ scriptId, style })` → style: `"santai" | "formal" | "lucu"`.
- `shortenScript({ scriptId, targetSeconds })` → 15 atau 30.
- `regenerateHook({ scriptId })` → returns `{ variants: string[] }`.

Semua tiga melakukan urutan ini (sama dengan `generateScript`, di-extract ke helper):
1. Load script milik user (verify `user_id`); kalau `full_script` kosong → return error `empty_script` dengan pesan "Isi dulu script-nya sebelum pakai AI rewrite/shorten/regen."
2. Cek plan + rate-limit harian (`generations` `status='success'`, hari ini, ≥ limit → error `rate_limited`). **Tidak ada cache** untuk fitur-fitur ini (rewrite/shorten/regen by-design menghasilkan varian baru tiap kali).
3. Panggil Gemini (`google/gemini-3-flash-preview`) via `createLovableAiGatewayProvider`, dengan retry 1× pada parse failure. Pakai helper `extractJson` yang sudah ada (export-kan dari `ai.functions.ts` atau pindahkan ke `src/lib/ai-shared.server.ts`).
4. Log ke `generations` (`model: "gemini-flash"`, status success/failed, tokens).
5. **Tidak menulis ke tabel `scripts`** — server fn hanya mengembalikan hasil. Penulisan terjadi di client setelah user menekan "Terima" (Rewrite/Shorten) atau pilih variant (Hook). Penulisan memakai mekanisme `update()` + debounce auto-save yang sudah ada di editor — TIDAK butuh perubahan logika save.

Error shape konsisten dengan `generateScript`: `Error & { lovable: { code: "rate_limited" | "parse_failed" | "ai_unavailable" | "empty_script", message, plan?, limit? } }`.

## Frontend (editor)

`src/routes/_authenticated/editor.$scriptId.tsx`:
- Tambahkan header action group di sebelah "Buka di Teleprompter":
  - `RewriteMenu` (DropdownMenu shadcn — sudah ada di `src/components/ui/dropdown-menu.tsx`? cek; jika tidak, pakai `<details>`/popover sederhana berbasis komponen yang sudah ada agar konsisten).
  - `ShortenMenu` dengan 2 opsi durasi.
- Pada label Hook tambah tombol icon ✨ kecil yang membuka `HookVariantsDialog`.
- Komponen baru `src/components/app/PreviewDiffDialog.tsx`: dialog membandingkan 4 bagian (kiri "Sebelum" abu-abu, kanan "Sesudah" highlight electric), tombol Terima/Tolak. Reusable untuk Rewrite & Shorten.
- Komponen baru `src/components/app/HookVariantsDialog.tsx`: list 3 card, klik untuk pilih.
- Loading state: tombol berubah jadi `<Loader2 spin/>` + label "Memproses…" + disabled. Setelah selesai, buka dialog.
- Error handling konsisten (pola yang sama dengan `/new-script`):
  - `rate_limited` → `toast` ramah + tombol "Upgrade" yang link ke `/upgrade`.
  - `parse_failed` / generic → `toast.error` dengan pesan + tombol implicit "coba lagi" (user klik tombol lagi).
  - `empty_script` → toast info.
- Saat user "Terima":
  - Rewrite/Shorten: panggil `update("hook"|"retain"|"reward"|"cta", …)` untuk keempat field → mekanisme debounce 2s yang sudah ada menyimpan otomatis ke DB; SaveIndicator existing menampilkan progress.
  - Hook regen: panggil `update("hook", chosen)`.
- Invalidate `["scripts"]` setelah save selesai (sudah ditangani auto-save existing).

## Rate-limit & logging
- Tiga server fn baru ikut akumulasi `generations` yang sama → otomatis terhitung ke kuota harian user bersama generator dari nol. Tidak butuh kolom baru.

## Files
- **New**: `src/lib/ai-edits.functions.ts`, `src/lib/ai-shared.server.ts` (extract helper `buildLimitCheck`, `callGemini`, `extractJson`), `src/components/app/PreviewDiffDialog.tsx`, `src/components/app/HookVariantsDialog.tsx`.
- **Modified**: `src/lib/ai.functions.ts` (re-export helpers dari `ai-shared.server.ts` agar tetap satu sumber), `src/routes/_authenticated/editor.$scriptId.tsx` (tombol + dialogs + mutation calls).
- **No DB migration needed.**

## Out of scope
- Tidak menyentuh teleprompter, generator dari nol, atau struktur tabel.
- Tidak menambah caching untuk rewrite/shorten/regen (sengaja, variasi adalah fitur).
- Tidak membuat versi history / undo permanen — hanya konfirmasi Terima/Tolak sebelum overwrite.

## Goal
Ganti logo ScriptFlow di Navbar (landing + AppLayout) pakai 2 gambar yang diupload, dengan background dihapus jadi transparan.

## Steps

1. **Proses background removal** untuk kedua gambar pakai `imagegen--edit_image` dengan `transparent_background: true`:
   - `ChatGPT_Image_Jun_30_2026_08_53_10_PM.png` (ikon SF) → `src/assets/logo-icon.png`
   - `ChatGPT_Image_Jun_30_2026_08_51_45_PM.png` (wordmark ScriptFlow) → `src/assets/logo-wordmark.png`

2. **Upload ke Lovable Assets CDN** via `lovable-assets create` → simpan pointer `.asset.json` di `src/assets/`, lalu hapus PNG mentahnya.

3. **Update `src/components/landing/Logo.tsx`**:
   - Hapus SVG ikon & teks "ScriptFlow" hardcoded.
   - Render `<img>` ikon SF (h-8 w-8) + `<img>` wordmark ScriptFlow (h-6 auto width).
   - Tetap pakai props `className` agar bisa override sizing.
   - Tambahkan `alt="ScriptFlow"` untuk aksesibilitas.

4. **Verifikasi** Logo dipakai di `Navbar.tsx` (landing), `AppLayout.tsx` (header dashboard), `AuthLayout.tsx` (kalau ada) — semua otomatis ikut update karena pakai komponen `Logo` yang sama. Tidak perlu ubah file lain.

## Catatan
- Karena wordmark adalah gambar gradient biru-ungu, tampilan akan sama di dark & light mode (kontras tetap oke di kedua mode karena warna logo cukup vivid). Tidak diperlukan variant per-tema.
- Tinggi ikon ~32px dan wordmark ~24px supaya pas dengan navbar h-16.

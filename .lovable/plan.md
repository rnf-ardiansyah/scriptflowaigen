## Status: Sudah Selesai (No-op)

Semua requirement freemium + folder sudah terpenuhi dari iterasi sebelumnya.

### Yang sudah ada

**Freemium limits**
- DB trigger `enforce_free_script_limit` (sudah aktif di `supabase-info`) menolak insert ke `scripts` saat free user mencapai 20 — limit ditegakkan di level database, tidak bisa dilewati frontend.
- Server function `generateScript` juga mengecek count + plan sebelum memanggil Gemini (defense in depth) dan melempar `script_limit_reached` yang sudah ditangani di UI Generator (card "Limit tercapai" + tombol `/upgrade`).
- Rate-limit harian: free=5, premium=100, dishare via `ai-shared.server.ts` untuk Generator + Rewrite + Shorten + Hook Regen.
- `src/lib/quota.functions.ts` + `QuotaPanel` di Dashboard menampilkan "X/5 generate hari ini" dan "X/20 script tersimpan" (premium: "X/100" + total tanpa cap).
- Halaman `/upgrade` di `src/routes/_authenticated/upgrade.tsx` menampilkan perbandingan Free vs Premium (Rp29.000/bulan) dengan tombol placeholder.

**Folders**
- Tabel `folders` (id, user_id, name, created_at) + kolom `folder_id` nullable di `scripts` dengan FK `ON DELETE SET NULL` — script tidak ikut terhapus saat folder dihapus.
- RLS: `folders_all_own` scoped ke `auth.uid()`.
- Server fns di `src/lib/folders.functions.ts`: `listFolders`, `createFolder`, `deleteFolder`, `assignFolder`, `getFolders` (summary dengan count).
- UI di `/library`: sidebar folder dengan "Semua Script" (default), "Tanpa folder", dan list folder + count. Tombol create folder, filter on click, dialog konfirmasi delete, dan menu "Pindah ke folder" per script row.

### Rencana eksekusi

Tidak ada. Konfirmasi no-op dan tawarkan lanjut ke tahap berikutnya.

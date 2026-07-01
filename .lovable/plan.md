## Masalah
`AuthLayout` (dipakai `/login` & `/register`) tidak menampilkan tombol `ThemeToggle`, jadi user tidak punya cara berpindah ke mode terang di halaman auth. Landing page punya toggle di `Navbar`. Tema sendiri sebetulnya sudah global (via `ThemeProvider` di root), jadi kalau user sudah set light di landing, halaman auth *seharusnya* ikut light — kecuali sesuatu memaksa dark.

## Perubahan
1. `src/components/app/AuthLayout.tsx`
   - Import `ThemeToggle`.
   - Tambahkan `<ThemeToggle />` di header kanan, sejajar dengan link "← Back to home" (urutan: toggle, lalu link).
   - Tidak mengubah struktur/warna lain.

2. Verifikasi cepat bahwa halaman auth tidak dipaksa dark:
   - `AuthLayout` root div tidak punya class `dark` hard-coded → OK.
   - Kalau ditemukan `dark` hard-coded di `AuthLayout` atau route `/login` `/register`, hapus supaya mengikuti `ThemeProvider`.

Tidak menyentuh `AppLayout` (workspace memang sengaja selalu dark sesuai desain sebelumnya) — hanya halaman auth publik yang disamakan dengan landing.

## Hasil
Di `/login` dan `/register` muncul tombol matahari/bulan di header; klik untuk beralih light/dark, preferensi tersimpan di `localStorage` (`scriptflow-theme`) dan konsisten dengan landing page.

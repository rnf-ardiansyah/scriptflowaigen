## Tujuan
Bersihkan `Topbar` dari elemen yang tidak berfungsi: tombol notifikasi (bell) dan avatar bulat "U" di kanannya.

## Perubahan
File: `src/components/app/Topbar.tsx`

1. Hapus tombol `<button aria-label="Notifikasi">` beserta icon `Bell`.
2. Hapus `<div>` avatar berisi huruf "U".
3. Hapus import `Bell` dari `lucide-react` (sisakan `Menu`).
4. Pertahankan `ThemeToggle` di sisi kanan.

## Hasil akhir
Sisi kanan Topbar hanya berisi `ThemeToggle`. Tidak ada UI palsu / pajangan. Jika nanti fitur notifikasi benar-benar dibutuhkan, kita akan bangun ulang dengan state, data, dan panel yang berfungsi (bukan tombol kosong).

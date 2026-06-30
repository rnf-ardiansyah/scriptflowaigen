## 1. Hapus social proof bar di Hero
File: `src/components/landing/Hero.tsx` — hapus blok `<div className="mt-10 flex flex-wrap...">` (baris 52–68) yang berisi avatar AKMTJ + teks "10,000+ creators · 1.2M scripts generated".

## 2. Perbaiki Light Mode

Penyebab utama tulisan tidak terbaca di light mode: beberapa utility CSS di `src/styles.css` memakai warna hardcoded yang dibuat untuk dark mode (teks putih, grid putih, glass border putih). Saat background berubah jadi putih, elemen-elemen ini jadi tak terlihat / kontras buruk.

### Perubahan di `src/styles.css`

- **`text-gradient`** (saat ini gradient putih→abu-abu, hilang di light): ubah jadi memakai token `--foreground` / `--muted-foreground` agar otomatis adaptif antar tema.
- **`text-gradient-accent`**: turunkan lightness saat light mode (gradient biru lebih gelap) supaya headline besar tetap kontras di background putih. Pakai variant via `.light` override.
- **`glass-panel`**: border `white 8%` tidak terlihat di light mode → ganti pakai `var(--border)` dan background pakai `color-mix(var(--surface)...)`.
- **`grid-bg`**: garis grid putih hilang di background putih → pakai `var(--foreground)` dengan opacity rendah agar terlihat di kedua mode.
- **`hero-glow`**: pertahankan tapi turunkan intensitas di light mode (opsional via `.light .hero-glow`).
- **`::selection`**: sudah pakai token, OK.

### Perubahan token di `.light` (tuning kontras)
- Naikkan kontras `--muted-foreground` (saat ini 0.45 → turunkan ke ~0.38) supaya teks sekunder lebih jelas di atas putih.
- Pastikan `--surface` sedikit berbeda dari `--background` untuk batas card terlihat.

### Spot-check komponen
Setelah token diperbaiki, cek cepat komponen yang sering bermasalah di light mode dan pastikan mereka pakai token semantic (bukan `text-white`, `bg-black`, atau warna hardcoded):
- `Navbar`, `Hero`, `Pricing`, `FAQ`, `FinalCTA`, `FeaturesBento`, `ProblemSection`, `DashboardMock`.
Jika ditemukan class hardcoded (`text-white`, `bg-slate-900`, dll.) pada elemen yang masih harus terbaca di light mode, ganti ke token (`text-foreground`, `bg-surface`, dst.). Tidak mengubah layout/struktur — hanya class warna.

## Verifikasi
- Buka `/` di light mode → headline, subheadline, badge "Built for…", tombol sekunder, grid background, dan glass panel harus terbaca jelas.
- Toggle ke dark mode → tampilan tetap sama seperti sebelumnya (tidak ada regresi).
- Hero tidak lagi menampilkan baris avatar + "10,000+ creators".

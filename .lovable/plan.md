## Masalah
`FinalCTA` memakai gradient hardcoded `oklch(0.22 0.06 260) → oklch(0.16 0.03 260)` di line 8, jadi tetap gelap di light mode. Heading `text-gradient` juga jadi gelap di background gelap = nyaris invisible (terlihat di screenshot).

## Perbaikan (`src/components/landing/FinalCTA.tsx`)
- Ganti gradient hardcoded menjadi token-based: `bg-gradient-to-br from-surface-elevated via-surface to-background` agar otomatis adaptif tema.
- Border: pertahankan `border-electric/30` (sudah token).
- Glow blob: `bg-electric/30` sudah token, OK.
- Tidak perlu ubah `text-gradient` — sudah dibuat adaptif di styles.css.

Tidak ada perubahan layout/struktur, hanya class warna.

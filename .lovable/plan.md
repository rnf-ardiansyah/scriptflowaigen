## Status: sudah selesai sebelumnya

Halaman `/teleprompter/:scriptId` (`src/routes/_authenticated/teleprompter.$scriptId.tsx`) sudah memenuhi semua requirement di prompt ini:

| # | Requirement | Status |
|---|---|---|
| 1 | Fullscreen view, teks besar, kontras tinggi (hitam/putih) | ✅ overlay `fixed inset-0`, font 32/48/64px, bold |
| 2 | Start/Pause | ✅ tombol di bottom bar + state `isPlaying` |
| 3 | Slider speed 0.5×–3×, default 1× | ✅ `min=0.5 max=3 step=0.1` |
| 4 | 3 tingkatan font (S/M/L) | ✅ `FONT_SIZES` |
| 5 | Dark mode toggle independen, default ON | ✅ state `isDark` default `true` |
| 6 | Smooth auto-scroll via `requestAnimationFrame` | ✅ loop rAF + delta-time |
| 7 | Fullscreen API browser | ✅ `requestFullscreen` / `exitFullscreen` |
| 8 | Spacebar pause/resume | ✅ keydown listener (ignore input/textarea) |
| 9 | Tap layar = pause/resume di mobile | ✅ `onClick={handleSurfaceTap}` |
| 10 | Tombol Kembali ke editor, auto-hide saat fullscreen | ✅ top-left bar fade out 3s |
| 11 | Empty state kalau script kosong | ✅ pesan + CTA "Buka editor" |

## Rencana

Tidak ada perubahan kode. Saya akan:

1. Konfirmasi ke kamu bahwa fitur sudah ada (built di tahap teleprompter sebelumnya, sebelum integrasi AI).
2. Opsional: jalankan Playwright smoke test buka `/teleprompter/<scriptId>` dari script yang ada di library untuk memastikan auto-scroll, Space, dan tombol speed/font/dark masih bekerja setelah perubahan-perubahan terbaru (light mode, mobile nav, dll).

Mau aku jalankan smoke test verifikasi saja, atau skip dan lanjut ke tahap berikutnya?

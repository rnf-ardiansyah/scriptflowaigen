
## 1. Samakan Pricing di Landing dengan halaman /upgrade (Rupiah)

Edit `src/components/landing/Pricing.tsx` supaya konsisten dengan `/upgrade`:

- **Free**: harga `Rp0` / bulan, fitur disamakan:
  - 5 AI generate per hari
  - Script Library maksimal 20 script
  - Akses Teleprompter
  - Basic niche template
- **Premium**: harga `Rp29.000` / bulan, label "Recommended", fitur:
  - 100 AI generate per hari
  - Unlimited Script Library
  - Akses Teleprompter
  - Semua niche template
  - Favorite, AI Rewrite, AI Hook Generator
  - Priority generation speed
- Copy section & tombol diterjemahkan ke Bahasa Indonesia singkat ("Mulai Gratis" → `/register`, "Upgrade ke Premium" → `/upgrade`). Catatan "Cancel anytime" → "Bisa cancel kapan saja."
- Tidak mengubah struktur/komponen lain di landing.

## 2. Tambah Light Mode (toggle Dark/Light)

Saat ini app dipaksa dark (class `dark` di root). Kita tambahkan tema terang dengan toggle yang persisten.

### a. Token warna light di `src/styles.css`
Tambahkan blok `.light { … }` berisi varian token (background putih lembut, surface, border, foreground gelap, electric tetap biru tapi disesuaikan kontrasnya). Token `--electric` tetap, hanya `--electric-foreground` dan surface/foreground/border yang diganti. `@custom-variant dark` sudah ada — tidak diubah. Hero-glow & grid-bg dibiarkan; di light mode tampak lebih halus karena warna dasarnya terang.

### b. Theme provider ringan
Buat `src/components/theme/ThemeProvider.tsx`:
- Simpan tema (`"dark" | "light"`) di `localStorage` (`scriptflow-theme`), default `dark`.
- Saat mount, set class `dark` atau `light` di `document.documentElement` (hapus yang lain).
- Expose `useTheme()` hook (`theme`, `toggleTheme`, `setTheme`).
- SSR-safe: tidak akses `window` saat render awal; sinkron via `useEffect`.

### c. Pasang provider
- `src/routes/__root.tsx`: bungkus konten dengan `<ThemeProvider>`. Inline script kecil di `<head>` untuk set class lebih awal supaya tidak ada flash:
  ```html
  <script>
    try { const t = localStorage.getItem('scriptflow-theme') || 'dark';
      document.documentElement.classList.add(t); } catch {}
  </script>
  ```
  Hapus pemaksaan `className="dark"` lama.

### d. Tombol toggle
Buat `src/components/theme/ThemeToggle.tsx`: tombol ikon `Sun`/`Moon` (lucide) memakai `Button variant="ghost" size="sm"`, aria-label dinamis.

Pasang toggle di:
- `src/components/landing/Navbar.tsx` — sebelah CTA login/register.
- `src/components/app/AppLayout.tsx` — di header desktop, kiri tombol Sign out.

### e. Audit cepat warna hardcoded
Sapu `text-white`, `bg-black`, `bg-white`, hex literal di komponen landing & app. Ganti ke token (`text-foreground`, `bg-background`, `bg-surface`, dll.) hanya kalau memang merusak di light mode. Tidak refactor besar — hanya fix yang tampak rusak.

## Out of scope
- Tidak mengubah halaman `/upgrade` (sudah Rupiah).
- Tidak menambah toggle per-halaman teleprompter (sudah punya dark mode independennya sendiri).
- Tidak mengubah skema DB atau auth.

## File yang akan diedit/dibuat
- edit: `src/components/landing/Pricing.tsx`
- edit: `src/styles.css` (tambah token `.light`)
- new: `src/components/theme/ThemeProvider.tsx`
- new: `src/components/theme/ThemeToggle.tsx`
- edit: `src/routes/__root.tsx` (provider + anti-flash script, hapus paksa dark)
- edit: `src/components/landing/Navbar.tsx` (toggle)
- edit: `src/components/app/AppLayout.tsx` (toggle)

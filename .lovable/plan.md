## Masalah
1. Setelah login, seluruh workspace dipaksa dark karena `AppLayout` menaruh class `dark` di root wrapper (`workspace-scope dark`) dan `Topbar` tidak punya tombol theme toggle — jadi user tidak bisa switch ke light mode di halaman authenticated.
2. Link "← Back to home" di `AuthLayout` masih pakai teks + panah karakter, bukan icon.

## Perubahan

### 1. `src/components/app/AppLayout.tsx`
- Hapus class `dark` yang dihardcode di wrapper root. Ganti `className="workspace-scope dark relative min-h-screen ..."` → `className="workspace-scope relative min-h-screen ..."` supaya theme mengikuti `ThemeProvider` global (sama seperti landing page).

### 2. `src/components/app/Topbar.tsx`
- Import `ThemeToggle` dari `@/components/theme/ThemeToggle`.
- Sisipkan `<ThemeToggle />` di kanan Topbar, di sebelah kiri tombol Notifikasi, supaya user bisa switch light/dark di semua halaman authenticated (Dashboard, Library, Editor, Generator, Profile, Upgrade).

### 3. `src/components/app/AuthLayout.tsx`
- Ganti link "← Back to home":
  - Import `ArrowLeft` dari `lucide-react`.
  - Render tombol icon-only berbentuk lingkaran/rounded (konsisten dengan tombol icon di Topbar: `h-9 w-9 rounded-lg border border-border bg-surface`), berisi `<ArrowLeft className="h-4 w-4" />` dengan `aria-label="Kembali ke beranda"` dan `title` yang sama untuk aksesibilitas.

## Catatan
- Tidak mengubah logic auth, tidak mengubah landing page, tidak mengubah `ThemeProvider`.
- Verifikasi cepat setelah build: buka `/login` dan `/dashboard`, klik ThemeToggle, pastikan warna berubah dan tetap konsisten saat navigasi.

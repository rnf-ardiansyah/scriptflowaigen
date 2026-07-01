## Plan

1. **Hapus pemaksa dark mode di workspace**
   - `AppLayout` saat ini memakai class `workspace-scope`.
   - Class ini di `src/styles.css` memang memaksa seluruh area setelah login selalu dark, sehingga toggle tidak bisa mengubah halaman authenticated menjadi light.

2. **Biarkan App Shell mengikuti theme global**
   - Ganti root wrapper workspace agar hanya memakai token global `bg-background text-foreground`.
   - Theme toggle di `Topbar` tetap digunakan dan akan mengubah class `.light`/`.dark` global seperti landing page.

3. **Rapikan CSS yang sudah tidak dipakai**
   - Hapus blok `.workspace-scope` dari `src/styles.css` supaya tidak ada override dark mode tersembunyi lagi.

4. **Verifikasi cepat**
   - Cek halaman setelah login: dashboard/library/editor shell harus berubah warna saat toggle mode terang/gelap.
   - Pastikan landing, login, dan register tetap mengikuti theme yang sama.
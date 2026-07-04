Tambahkan icon Google berwarna (multi-color) ke tombol "Continue with Google" pada halaman `/login` dan `/register`.

Detail penerapan:
1. Di `src/routes/login.tsx`: sisipkan SVG icon Google (G berwarna) di sebelah kiri teks tombol Google.
2. Di `src/routes/register.tsx`: lakukan hal yang sama.
3. Gunakan inline SVG agar tidak perlu menambah dependency baru.
4. Pastikan icon dan teks tetap sejajar rapi (flex, gap-2) dan responsif.

Tidak ada perubahan pada logic auth, layout, atau komponen lain.
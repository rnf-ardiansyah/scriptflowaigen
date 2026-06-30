
## Tujuan tahap ini

Bangun ulang **AI Generator** sesuai alur baru (preview hasil di tempat, skeleton loading, dummy output, lalu save/teleprompter), sambil memastikan Dashboard, Library, dan Editor sudah cocok dengan spec. Tahap ini **tidak** menyentuh integrasi Gemini sungguhan — kode `generateScript` server fn dibiarkan utuh agar bisa dihidupkan kembali di prompt berikutnya, tapi tombol Generate di UI memakai jalur dummy lokal.

## Status saat ini vs spec

| Area | Status | Aksi |
|---|---|---|
| Dashboard (greeting + niche, total/favorit, 5 recent) | ✅ sudah ada | tidak diubah |
| Library (grid, search, filter niche & favorit, edit/duplicate/favorite/delete + konfirmasi, reading_time, empty state ke /generator) | ✅ sudah ada | tidak diubah |
| Editor (title/niche/idea + 4 textarea hook/retain/reward/cta, auto-save 2s, indikator "Tersimpan", reading_time real-time ⌈kata/2.5⌉, tombol Teleprompter & kembali ke Library) | ✅ sudah ada | tidak diubah |
| App Shell sidebar konsisten + indikator kuota | ✅ sudah ada (`Sidebar.tsx` + `QuotaPanel`) | biarkan dummy untuk halaman generator |
| AI Generator alur baru (durasi+gaya, preview in-place, skeleton, struktur hook/retain/reward/cta, reading time, Save+Teleprompter) | ❌ masih versi lama (langsung redirect ke editor) | **rebuild** |

## Perubahan AI Generator (`src/routes/_authenticated/generator.tsx`)

1. **Header**: judul "AI Generator" + badge kanan menampilkan setting aktif, contoh `60s · Hook style`.
2. **Card setting** kecil di atas form: dropdown `Durasi target` (30s / 60s / 90s) dan dropdown `Gaya` (Hook style / Story style / Listicle). State lokal, default 60s + Hook style.
3. **Card Idea**: label "Idea", textarea (placeholder: *"5 kesalahan pemula bikin konten TikTok"*), tombol **Generate** (memanggil simulasi, bukan server fn).
4. **Status Generating**: saat tombol ditekan, render card hasil dengan:
   - Header "Generating…" + timer kecil (elapsed detik, update tiap 100ms).
   - 4 blok skeleton (hook/retain/reward/cta), tiap blok berisi 2-4 baris `<div>` abu animasi `animate-pulse`. Baris diisi (skeleton diganti teks final) bertahap pakai `setTimeout` per section (≈ 600-900ms antar section, total ±3 detik).
5. **Hasil dummy**: helper lokal `buildDummyScript({idea, niche, duration, style})` menghasilkan teks template terstruktur yang menyisipkan `idea` user. Contoh hook: *"Stop scroll dulu — kalau kamu pernah {idea}, video ini wajib kamu tonton."* Variasi sesuai `style` (Hook/Story/Listicle) dan panjang sesuai `duration`.
6. **Setelah selesai**: tampilkan 4 section terpisah (Hook, Retain, Reward, CTA) dalam card berbeda + label. Di bawah: badge `~XXs read` dihitung `Math.ceil(totalWords / 2.5)`.
7. **Aksi**: dua tombol di bawah hasil.
   - **Save to Library** → insert ke tabel `scripts` lewat helper baru `createDummyScript()` di `src/lib/scripts.ts` (insert `title` = 60 char pertama idea, `idea`, `niche`, `tone` (= style), `hook/retain/reward/cta`, `full_script`, `reading_time`). Setelah sukses simpan `scriptId` ke state, toast sukses, invalidasi query `["scripts"]`, **tetap di halaman** agar tombol Teleprompter aktif. Tombol berubah jadi "Buka di Editor" → `/editor/$scriptId`.
   - **Open Teleprompter** → disabled (`opacity-50 cursor-not-allowed`) sampai `scriptId` ada; aktif setelah save, link ke `/teleprompter/$scriptId`.
8. Tombol "Generate Ulang" kecil di atas hasil untuk reset state (hapus hasil + scriptId, kembali ke form).
9. Hilangkan import `generateScript` dari `ai.functions` di file ini (file tersebut tetap ada untuk prompt selanjutnya). Hilangkan `ErrorCard` rate-limit (tidak relevan untuk dummy); cukup toast error generik kalau idea < 3 karakter.

## Helper baru di `src/lib/scripts.ts`

Tambahkan fungsi client-side `createDummyScript(input)` (pakai `supabase` browser client) yang `insert` row baru ke `scripts` dengan kolom-kolom dummy + `user_id = auth.uid()`, lalu return `id`. Tangani error `free_plan_script_limit_reached` dengan pesan ramah ("Library penuh, upgrade ke Premium.").

## Verifikasi (build mode, setelah persetujuan)

Jalankan Playwright headless di sandbox dengan session ter-inject:
1. Buka `/generator`, ketik idea, ganti durasi ke 90s + Listicle.
2. Klik Generate → screenshot skeleton + timer berjalan.
3. Tunggu selesai → cek 4 section + `~..s read` muncul.
4. Klik Save → cek toast, tombol Teleprompter aktif, `scriptId` tersimpan.
5. Buka `/library` → script baru muncul; favorit + duplicate + delete + search bekerja.
6. Buka editor script tersebut → auto-save indikator "Tersimpan" muncul, reading_time live update.
7. Klik Teleprompter → halaman teleprompter render tanpa error.

## Catatan teknis (untuk reviewer)

- `src/lib/ai.functions.ts` & `ai-shared.server.ts` **tidak dihapus**; akan dipakai lagi saat Gemini disambungkan.
- Tidak ada perubahan skema database — kolom `scripts` sudah lengkap (`hook/retain/reward/cta/full_script/reading_time/tone/niche`).
- Tidak ada perubahan pada Sidebar / QuotaPanel; quota saat ini sudah berbasis data nyata, jadi tetap akurat walau generate-nya dummy (dummy insert tetap kena trigger limit 20).

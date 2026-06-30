## Goal
Recolor logo ikon + wordmark agar selaras dengan palet brand ScriptFlow (electric blue/navy), bukan gradient biru→ungu seperti versi asli.

## Approach
Pakai `imagegen--edit_image` untuk re-color kedua aset, menjaga bentuk persis sama, hanya ganti palet warnanya ke gradient **electric blue → deep navy blue** (mengikuti token `--electric` di `src/styles.css`, sekitar `#3B82F6` → `#1E40AF`). Tidak ada ungu/violet lagi.

## Steps
1. Edit `/tmp/logo-icon.png` (versi transparan yang sudah ada) dengan prompt recolor: pertahankan bentuk SF persis, ganti gradient jadi electric blue (#3B82F6) ke deep blue (#1E40AF), background transparan.
2. Sama untuk `/tmp/logo-wordmark.png`: recolor wordmark "ScriptFlow" ke gradient electric blue → deep blue.
3. Crop ke bounding box, upload ulang ke Lovable Assets CDN, dan **timpa** pointer `src/assets/logo-icon.png.asset.json` & `src/assets/logo-wordmark.png.asset.json` (URL berubah karena asset ID baru).
4. Hapus pointer lama dulu via `lovable-assets delete` agar tidak meninggalkan asset yatim.
5. Tidak perlu sentuh `Logo.tsx` — pointer di-import dengan path yang sama.

## Catatan
- Gradient electric blue cocok di dark mode (background navy) dan tetap kontras cukup di light mode.
- Kalau hasil recolor kurang pas (mis. bentuk berubah), saya iterasi sekali lagi sebelum upload.

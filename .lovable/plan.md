## Goal
Audit & rapikan responsiveness landing page + sisa app pages supaya nyaman di semua breakpoint: small phone (360px), large phone (414px), tablet (768px), iPad (1024px), laptop (1280px+), dan ultra-wide.

## Findings dari audit cepat
- Landing pakai `px-6` di mana-mana → terlalu rapat di phone <380px. Standarkan ke `px-4 sm:px-6 lg:px-8`.
- `Hero.tsx` headline `text-5xl md:text-6xl lg:text-[68px]` → 48px masih besar untuk 360px screen. Turunkan jadi `text-4xl sm:text-5xl md:text-6xl lg:text-[68px]`.
- `Hero` CTA buttons: pastikan tombol "Start Free" + secondary stack vertikal full-width di mobile.
- `FinalCTA.tsx` padding `p-12 md:p-16` → terlalu jumbo di phone. Jadikan `p-6 sm:p-10 md:p-16`. Heading `text-4xl md:text-5xl` → `text-3xl sm:text-4xl md:text-5xl`.
- `Pricing.tsx` harga `text-5xl` → `text-4xl sm:text-5xl`. Grid sudah `md:grid-cols-2` (OK).
- `Benefits.tsx` angka stat `text-5xl` → `text-4xl sm:text-5xl`.
- `FeaturesBento.tsx` `auto-rows-[220px]` di mobile bisa terlalu pendek untuk konten panjang. Pakai `auto-rows-auto` di mobile, `md:auto-rows-[220px]`.
- `SectionHeader.tsx` heading `text-3xl md:text-5xl` → OK, biarkan.
- `Footer.tsx` grid `md:grid-cols-[1.4fr_repeat(3,1fr)]` OK. Tambah `gap-y-8` agar rapi saat stack.
- `Navbar.tsx` (landing) hide link "Login" sudah `sm:inline-flex`. Padding `px-6` → `px-4 sm:px-6`.
- `DashboardMock.tsx` (di hero) review: kalau ada lebar fixed, tambahkan `overflow-hidden` + `max-w-full` ke wrapper supaya tidak overflow di phone.
- `ProductShowcase.tsx`, `ProblemSection.tsx`, `SolutionSection.tsx`, `HowItWorks.tsx`, `FAQ.tsx`: hanya update padding container ke `px-4 sm:px-6`.
- App pages (`dashboard`, `library`, `editor`, `profile`, `upgrade`, `new-script`, `teleprompter`): sudah pakai `px-4 sm:px-6` dari polish sebelumnya — spot-check saja, perbaiki kalau ada heading/grid yang terlalu besar di mobile.

## Steps
1. **Landing containers**: cari-replace `mx-auto max-w-7xl px-6` → `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8` di semua section landing (Hero, Problem, Solution, Bento, Showcase, HowItWorks, Benefits, Pricing, FAQ, FinalCTA, Footer, Navbar).
2. **Hero**: turunkan ukuran heading + buat CTA row `flex flex-col sm:flex-row` dengan tombol `w-full sm:w-auto`. Wrap `DashboardMock` dengan `overflow-hidden` + horizontal scroll fallback.
3. **FinalCTA**: padding & heading scale down. Pastikan tombol stack vertikal di phone.
4. **Pricing & Benefits**: scale down angka besar (`text-5xl` → `text-4xl sm:text-5xl`).
5. **FeaturesBento**: `auto-rows-auto md:auto-rows-[220px]` agar card tidak terpotong/over-tall di phone.
6. **App pages spot-fix**: scan `text-[3-5]xl` di app routes, turunkan 1 step untuk mobile. Pastikan tabel/grid yang punya banyak kolom punya `overflow-x-auto`.
7. **QA via Playwright** di 3 viewport (375×812, 768×1024, 1440×900) — screenshot landing top + dashboard, verifikasi tidak ada overflow horizontal.

## Catatan
- Tidak mengubah desain visual, hanya scaling & layout-fluidity.
- Tidak menambah dependency.
- Dark/light theme tidak terpengaruh.

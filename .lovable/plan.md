## AI Script Generator — Plan

Pakai **Lovable AI Gateway** (model default `google/gemini-3-flash-preview`). Tidak perlu API key Gemini dari user — `LOVABLE_API_KEY` sudah tersedia di server. Stack-nya TanStack Start, jadi panggil model lewat `createServerFn` (bukan Supabase Edge Function), tapi semua spesifikasi bisnis (prompt, retry, rate-limit, caching, logging) dijalankan persis seperti brief.

### 1. AI gateway helper
- `src/lib/ai-gateway.server.ts` — helper standar `createLovableAiGatewayProvider(LOVABLE_API_KEY)` mengikuti pola `ai-sdk-lovable-gateway`. File `.server.ts` jadi import-protected dari client.

### 2. Server function `generateScript`
File: `src/lib/ai.functions.ts` (client-safe path, dipanggil via `useServerFn`).

`generateScript = createServerFn({ method: 'POST' }).middleware([requireSupabaseAuth]).inputValidator(zod({ idea, niche, tone })).handler(...)`

Alur di dalam handler:
1. **Cache check** — query `scripts` milik `context.userId` dengan `idea`, `niche`, dan `metadata->tone` yang sama persis (lihat catatan schema di bawah). Kalau ada hit terbaru, return `{ scriptId, hook, retain, reward, cta, cached: true }` tanpa panggil model dan tanpa nambah `generations`.
2. **Profile lookup** — ambil `profiles.plan` (`free` atau `premium`). Default `free`.
3. **Rate-limit** — hitung `generations` user dengan `status='success'` dan `created_at >= start of today (UTC)`. Limit: free 5, premium 100. Kalau lewat → throw error terstruktur `{ code: 'rate_limited', limit, plan }` yang frontend tangani.
4. **Build prompt** — system prompt: "script writer profesional untuk short-form video Indonesia", hormati `niche` (gaya bahasa & referensi sesuai niche), tone sesuai input. Larangan eksplisit: jangan kalimat generik "Halo teman-teman" di hook. Wajib output JSON `{hook, retain, reward, cta}` saja.
5. **Call model** dengan `generateText({ model: gateway('google/gemini-3-flash-preview'), output: Output.object({ schema: z.object({hook, retain, reward, cta}) }) })`.
6. **Retry parsing** — kalau hasilnya invalid (Output throw / field kosong), retry 1× dengan instruksi tambahan yang lebih tegas ("HANYA JSON, tanpa markdown, tanpa code fence"). Kalau masih gagal → insert `generations` `status='failed'` lalu throw `{ code: 'parse_failed' }`.
7. **Log success ke `generations`** — `model='gemini-flash'`, `status='success'`, `tokens = result.usage?.totalTokens ?? null`.
8. **Compute reading time & full_script** pakai `buildFullScript` + `computeReadingTime` yang sudah ada.
9. **Insert script baru** ke `scripts` (title default dari idea, niche, hook, retain, reward, cta, full_script, reading_time, tone disimpan supaya cache match — lihat schema note).
10. **Return** `{ scriptId, cached: false, ...sections }`.

### 3. Database — perlu kolom `tone` di `scripts`
Schema saat ini belum punya `tone`. Brief minta cache "idea + niche + tone persis sama" — butuh kolom dedicated supaya bisa indexed. Migration: tambah `scripts.tone text` (nullable, untuk script lama). Tidak nyentuh tabel/policy lain. RLS sudah scope ke user.

(`generations` sudah punya `tokens`, `model`, `status`, `user_id`, `created_at` — cukup.)

### 4. Frontend — flow "Buat Script Baru"
**Route baru:** `src/routes/_authenticated/new-script.tsx` (`/new-script`).
- Form: textarea `idea`, select `niche` (dari `src/lib/niches.ts`), select `tone` (`Santai`, `Formal`, `Persuasif`, `Edukatif`, `Storytelling`).
- Tombol "Generate dengan AI" → memanggil `useServerFn(generateScript)`.
- Loading state: panel besar dengan spinner + teks "Menyusun script kamu…" + sub-teks "Biasanya butuh 5–15 detik."
- Sukses → `navigate({ to: '/editor/$scriptId', params: { scriptId } })`. Cache hit ditandai toast "Pakai hasil sebelumnya yang persis sama".
- Error handling:
  - `rate_limited` → card ramah: "Kuota harian (5/free, 100/premium) sudah habis", tombol "Upgrade ke Premium" (`Link to="/upgrade"`) + "Coba besok".
  - `parse_failed` / network → card error + tombol "Coba Lagi" (re-run mutation, state form tetap utuh).
- Tombol "Kembali" ke `/dashboard`.

**Update CTA yang sudah ada:**
- `dashboard.tsx`: dua tombol "Buat Script Baru" / "Buat Script Pertama" → `Link to="/new-script"`.
- `library.tsx`: tombol yang sama → `Link to="/new-script"`.
- Hapus alur lama "buka editor dengan id 'new'" hanya jika ada referensi — biarkan editor.$scriptId tetap support id eksisting (sudah berfungsi).

### 5. Editor tidak berubah
Karena server function langsung create row dengan section terisi, lalu redirect ke `/editor/:id`, auto-save & reading_time existing langsung jalan untuk review/edit manual.

### 6. Test
Setelah build:
1. Hit `generateScript` lewat preview: idea baru → script masuk editor, reading_time auto, ada di library.
2. Generate idea identik → toast cache hit, `generations` tidak bertambah.
3. Simulasi limit dengan insert manual ke `generations` (5 row hari ini) → cek pesan rate-limit + tombol upgrade.
4. Cek `ai_gateway_logs--list_ai_gateway_requests` untuk verifikasi panggilan model.

### Files
- New: `src/lib/ai-gateway.server.ts`, `src/lib/ai.functions.ts`, `src/routes/_authenticated/new-script.tsx`
- Migration: tambah `scripts.tone`
- Edit: `src/routes/_authenticated/dashboard.tsx`, `src/routes/_authenticated/library.tsx`, `src/lib/scripts.ts` (extend `ScriptRow` + `createScript` agar terima `tone`)

Tidak ada Edge Function yang dibuat. `LOVABLE_API_KEY` sudah ada — tidak perlu secret tambahan.

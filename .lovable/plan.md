## Goal
Build manual CRUD for scripts: Dashboard, Library, and Editor — no AI yet. Verify full flow works end-to-end.

## Data layer (`src/lib/scripts.ts`)
Thin Supabase wrappers (browser client, RLS scopes to `auth.uid()`):
- `listScripts()` — all user scripts, ordered by `updated_at desc`.
- `listRecentScripts(limit=5)` — for dashboard.
- `getScript(id)`, `createScript(partial)`, `updateScript(id, patch)`, `deleteScript(id)`, `duplicateScript(id)`, `toggleFavorite(id, value)`.
- `countScripts()` returns `{ total, favorites }`.
- Helper `computeReadingTime(hook, retain, reward, cta)` → `Math.ceil(wordCount / 2.5)` seconds, and `buildFullScript(...)` joining the 4 sections.

React Query keys: `['scripts','list']`, `['scripts','recent']`, `['scripts','counts']`, `['scripts','detail', id]`. Mutations invalidate the right keys.

Shared `NICHES` constant (reuse the onboarding list) exported from `src/lib/niches.ts` so dropdowns stay in sync.

## `/dashboard` (rewrite `src/routes/_authenticated/dashboard.tsx`)
- Loader primes profile + counts + recent scripts via `ensureQueryData`.
- Greeting: `Halo, {profile.name} 👋` + sub-line `Niche: {preferred_niche}`.
- Stat cards: Total scripts, Favorit. (Drop the fake "AI generations / time saved" placeholders.)
- Big primary CTA "Buat Script Baru" → creates a blank script via `createScript`, then `navigate({ to: '/editor/$scriptId', params: { scriptId: newId }})`. Falls back to `/editor/new` only if creation fails.
- "Lihat semua" link → `/library`.
- Recent scripts list (max 5): card with title, niche badge, `reading_time` as `X detik`, star icon filled if favorite. Click → editor. Empty state with CTA.

## `/library` (rewrite `src/routes/_authenticated/library.tsx`)
- Loader: `ensureQueryData(listScripts)`.
- Local state: `search`, `nicheFilter`, `favoritesOnly`. Real-time filter in-memory over title + idea (case-insensitive).
- Toolbar: search input, niche `<select>` (All + niches), favorites toggle button, "Buat Script Baru" button.
- Grid of cards: title, niche badge, `reading_time` as `X detik`, favorite star, updated date.
  - Actions row: Edit, Duplicate, Favorite (toggle), Delete (opens Dialog confirmation).
- Empty state when zero scripts: illustration + "Belum ada script" + CTA to create.
- Filtered-empty state when filters yield zero: "Tidak ada hasil" + clear filters button.
- Mutations use React Query with optimistic invalidation; toast (sonner) on success/error.

## `/editor/$scriptId` (rewrite `src/routes/_authenticated/editor.$scriptId.tsx`)
- Handle two modes:
  - `scriptId === 'new'`: on mount, create a blank script then `router.navigate` to its real id (replace history) so auto-save has a target.
  - Otherwise: `ensureQueryData(getScript(id))`. If not found → `notFoundComponent`.
- Form fields: `title` (Input), `niche` (select from `NICHES`), `idea` (Textarea), and 4 Textareas: `hook`, `retain`, `reward`, `cta`.
- Local form state mirrors loaded script. A `useEffect` with 2-second debounce on any change calls `updateScript(id, patch)` including recomputed `full_script` and `reading_time`.
- Save indicator: small text top-right cycling `Mengetik…` → `Menyimpan…` → `Tersimpan ✓` (with timestamp).
- Live "Estimasi durasi: XX detik" computed from current form values.
- Header buttons: "← Kembali ke Library" (link to `/library`), "Buka di Teleprompter" (link to `/teleprompter/$scriptId`).
- Remove the placeholder AI-assistant sidebar (or keep it as a "Coming soon" panel without functional buttons — leaning remove to keep scope tight).

## Toaster
Wire sonner `<Toaster />` once in `__root.tsx` if not already present, so library/editor mutations can show feedback.

## Verification
After build, drive Playwright with the injected Supabase session:
1. Sign in flow already covered — restore session, hit `/dashboard`.
2. Click "Buat Script Baru" → land in editor with a real id.
3. Type into fields, wait 2.5s, see "Tersimpan", reload, values persist.
4. `reading_time` updates as words change.
5. Library: appears, search filters, favorite toggle, duplicate creates "(Copy) …", delete confirms and removes.
6. Empty state shown after deleting all.

## Out of scope (next prompt)
AI generation, teleprompter logic, generations table writes.

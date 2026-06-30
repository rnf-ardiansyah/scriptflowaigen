# Plan — Mobile Navbar + Workspace App Shell (Dark) + Routing

Landing page visuals stay untouched. Only Navbar gains a mobile hamburger drawer. Workspace gets a real persistent left sidebar with a forced dark theme. Adds `/generator` route.

## 1. Landing Navbar — mobile hamburger drawer

File: `src/components/landing/Navbar.tsx`
- Keep desktop layout exactly as-is (links inline on `md:` and up).
- On `<md` (mobile/tablet), hide the inline links + "Login" + "Start Free" and show a hamburger icon button (Lucide `Menu`).
- Tapping it opens a slide-down drawer (or sheet) containing: Features, Showcase, Pricing, FAQ, Login, Start Free, plus the existing ThemeToggle.
- Drawer closes on link tap, on outside click, and on `Esc`. Body scroll locked while open.
- Implementation: lightweight local state + a fixed full-width panel under the navbar styled with `glass-panel`. No new dependency.

## 2. Workspace App Shell — persistent left sidebar (dark, forced)

Replace the top-nav AppLayout with a sidebar layout. Workspace pages always render dark, independent of the landing theme toggle.

### Forced dark theme inside workspace
- The global `ThemeProvider` continues to control the landing page.
- `AppLayout` adds `class="dark"` to its root wrapper and sets local CSS so workspace tokens always resolve to the dark palette, regardless of `<html>` class. Landing remains user-controlled.
- Remove the `ThemeToggle` from the workspace header (keep it on landing).

### Dark palette (workspace-only overrides applied via a `.workspace` scope in `src/styles.css`)
- `--background`: `#0b0f17`
- `--surface`: `#121826`
- `--surface-elevated`: `#1a2233`
- `--border`: `#1f2937`
- `--foreground`: near-white
- `--muted-foreground`: dim gray
- `--electric`: keep existing brand accent (unchanged) so brand stays consistent

### Layout structure (`src/components/app/AppLayout.tsx`, rewritten)
```text
┌─────────────┬─────────────────────────────────────┐
│             │  Topbar: breadcrumb · 🔔 · avatar   │
│  Sidebar    ├─────────────────────────────────────┤
│  (fixed)    │                                     │
│             │           <Outlet />                │
│             │                                     │
└─────────────┴─────────────────────────────────────┘
```

### Sidebar contents (new `src/components/app/Sidebar.tsx`)
- Top: Logo (compact, links to `/dashboard`)
- Primary CTA: `+ New Script` (electric, links to `/generator`)
- Nav items (Lucide icons + label, active state via `useRouterState`):
  - AI Generator → `/generator`
  - Dashboard → `/dashboard`
  - All Scripts → `/library`
  - Favorites → `/library?filter=favorites`
  - Folders → `/library?view=folders`
  - Recent → `/library?sort=recent`
  - Teleprompter → `/library` (info-only entry until a script is picked)
- Section "Folders": placeholder list (3 dummy items, muted text "No folders yet" subtitle)
- Footer block: plan badge ("Free" dummy) + AI quota bar ("62/100 AI today" dummy) + Sign out button

### Topbar (new `src/components/app/Topbar.tsx`)
- Left: breadcrumb (e.g. `scriptflow.app / workspace`) derived from route.
- Right: notification bell icon (no-op), avatar circle with user initial.

### Responsive behavior
- `≥lg` (1024px): sidebar fixed `w-64`, content offset with `lg:pl-64`.
- `<lg`: sidebar hidden by default; hamburger button in topbar opens it as a left drawer (overlay + slide). Keep the existing bottom-tab nav for thumb access on phones, scoped to `<md` (Dashboard / Generator / Library / Profile).

## 3. Routing additions

- Create `src/routes/_authenticated/generator.tsx` as the new AI Generator page. Move the current `/new-script` UI into it (keep `/new-script` as a thin redirect to `/generator` so any existing links keep working).
- Confirmed already present and reused as-is: `/login`, `/register`, `/onboarding`, `/dashboard`, `/library`, `/editor/$scriptId`, `/teleprompter/$scriptId`, `/profile`, `/upgrade`.
- Teleprompter route already opts out of `AppLayout` (fullscreen) — no change.
- Auth pages already opt out of `AppLayout` — no change.

## 4. Landing CTA → `/register`

Already wired in Navbar, Hero, Pricing, FinalCTA. Quick audit pass to confirm no remaining `#` or stale links; fix any stragglers only.

## 5. Out of scope (untouched)

- No backend, auth, or DB changes.
- No edits to `src/routes/index.tsx` or any `src/components/landing/*` except `Navbar.tsx` (mobile menu only — desktop unchanged).
- No edits to auto-generated files.

## Technical notes

- Sidebar uses plain Tailwind + Lucide; no shadcn sidebar dependency added (keeps bundle lean and matches existing primitive style).
- Workspace dark scoping: wrap `AppLayout` root in `<div className="dark workspace-scope">` and add a `.workspace-scope { ... dark tokens ... }` block in `src/styles.css` that hard-sets the listed CSS variables so it wins over the user's light-mode toggle on `<html>`.
- Bottom mobile nav stays for `<md` only; sidebar drawer covers `md`–`lg` tablet range.
- Active link detection: `useRouterState({ select: s => s.location.pathname })` with `startsWith` match.

## Verification checklist after build

- Landing `/` visually identical on desktop; on mobile, hamburger opens drawer with all links + CTAs.
- `/dashboard`, `/generator`, `/library`, `/editor/:id`, `/profile`, `/upgrade` render inside the dark sidebar shell; `/teleprompter/:id`, `/login`, `/register`, `/onboarding` do not.
- Toggling theme on landing does not affect workspace appearance.
- No 404s, no console errors on any placeholder route.

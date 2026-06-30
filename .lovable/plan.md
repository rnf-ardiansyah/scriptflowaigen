## Goal

Extract the visual language already shipped on `/` (Landing Page) into a reusable design system, then scaffold placeholder routes for the rest of the app — without touching the Landing Page itself.

## 1. Design system extraction (no visual change to `/`)

Source of truth: tokens already defined in `src/styles.css` plus patterns used across `src/components/landing/*`.

**Already in place — keep as-is, just document:**
- Color tokens (oklch) in `:root`: `--background`, `--foreground`, `--surface`, `--surface-elevated`, `--card`, `--primary`, `--secondary`, `--muted`, `--muted-foreground`, `--electric` (accent), `--electric-foreground`, `--border`, `--input`, `--ring`, `--destructive`.
- Font: Inter loaded via `<link>` in `__root.tsx`, exposed as `--font-sans` in `@theme`.
- Radius scale (`--radius: 0.75rem`) with sm/md/lg/xl/2xl/3xl derivatives.
- Shadows: `--shadow-glow`, `--shadow-elevated`, `--shadow-soft`.
- Utilities: `glass-panel`, `text-gradient`, `text-gradient-accent`, `hero-glow`, `grid-bg`, plus `animate-fade-up / float / caret`.

**New shared primitives** (so future pages don't re-implement landing patterns):
- `src/components/app/Button.tsx` — variants `primary` (electric, shadow-glow, rounded-xl), `secondary` (surface + border), `ghost` (transparent → hover surface-elevated), sizes sm/md/lg. Mirrors the CTA styling used in Hero/Navbar/Pricing.
- `src/components/app/Card.tsx` — `rounded-2xl border border-border bg-surface` with optional `glow` and `glass` variants; matches Bento + Pricing cards.
- `src/components/app/Input.tsx` — `rounded-xl border border-border bg-background/60 px-3 py-2 text-sm placeholder:text-muted-foreground focus:ring-2 ring-electric/40`.
- `src/components/app/Badge.tsx` — pill style used by "Recommended" / "New" chips (electric + muted variants).
- `src/components/app/Dialog.tsx` — thin wrapper around existing `components/ui/dialog.tsx` re-styled with `glass-panel`, rounded-2xl, shadow-elevated to match landing visuals.
- `src/components/app/SectionShell.tsx` — page chrome (max-w-7xl, px-6, dark bg + optional `hero-glow` backdrop) so internal pages feel like the landing.

**Layout used by all non-landing routes:**
- `src/components/app/AppLayout.tsx` — sticky blurred top bar (reuses landing `Logo`, same scroll-blur treatment as `Navbar`) + main area. No sidebar yet (kept minimal; routes are placeholders).
- `src/components/app/AuthLayout.tsx` — centered card variant for `/login`, `/register`, `/onboarding`, with `hero-glow` + `grid-bg` backdrop matching Hero.

**Docs file:** `src/components/app/README.md` — short table of tokens + which primitive to use where. Pure documentation, no runtime impact.

## 2. Routes (file-based, TanStack Start)

All under `src/routes/` so the router plugin regenerates `routeTree.gen.ts` automatically. Each route declares its own `head()` with a unique title + description.

```
src/routes/
  login.tsx                 -> /login           (AuthLayout, placeholder form)
  register.tsx              -> /register        (AuthLayout, placeholder form)
  onboarding.tsx            -> /onboarding      (AuthLayout, 3-step stub)
  dashboard.tsx             -> /dashboard       (AppLayout, empty-state card)
  library.tsx               -> /library         (AppLayout, grid stub of script cards)
  editor.$scriptId.tsx      -> /editor/$scriptId   (AppLayout, two-pane stub)
  teleprompter.$scriptId.tsx -> /teleprompter/$scriptId (AppLayout, prompter preview stub)
  profile.tsx               -> /profile         (AppLayout, profile card stub)
  upgrade.tsx               -> /upgrade         (AppLayout, pricing recap)
```

Each placeholder page:
- Uses the new design-system primitives (Button, Card, Badge).
- Has a clear heading + "Coming soon" / placeholder body — no business logic, no fetch, no forms wired up.
- Includes `errorComponent` / `notFoundComponent` only if it has a loader (none do at this stage, so not required).

Dynamic routes (`editor.$scriptId`, `teleprompter.$scriptId`) read `Route.useParams()` to display the id and prove the route resolves.

## 3. Landing CTAs → `/register`

Update CTA `href="#pricing"` / `href="#"` to TanStack `<Link to="/register">` in:
- `Navbar.tsx` — "Start Free" button (the "Login" link → `/login`).
- `Hero.tsx` — primary "Start Free" CTA. ("Watch Demo" stays as `#showcase` anchor.)
- `Pricing.tsx` — Free plan "Start Free" → `/register`, Premium "Get Premium" → `/upgrade`.
- `FinalCTA.tsx` — "Start Free Today" → `/register`, "Book a Demo" stays `#`.

No structural / visual changes to Landing sections — only `href`/component swap from `<a>` to `<Link>` where the destination is now an internal route. All other anchor links (`#features`, `#pricing`, etc.) remain as smooth-scroll anchors so the Landing Page renders exactly as it does today.

## Out of scope (this stage)

- No backend, no Lovable Cloud, no auth, no DB.
- No real forms validation, no state persistence.
- No restyling of any Landing section's content or layout.

## Verification

- Visit `/` → identical to current screenshot (only difference: CTAs now navigate via client router to `/register` / `/login`).
- Visit each new route directly → renders placeholder page with consistent dark theme, no 404, no console error.
- `routeTree.gen.ts` regenerates with the new routes (do not hand-edit).

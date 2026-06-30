# Plan — Verify Auth & DB (no rebuild required)

Everything in your spec is already implemented from earlier turns. Plan: verify state, fix only true gaps, and run an end-to-end smoke test. **No destructive changes** to the existing AI/teleprompter features — those stay as-is per "jangan hapus" rule, but no new AI work is added here.

## What's already in place (confirmed by reading files)

### Database (Lovable Cloud / Supabase, RLS active)
- `profiles`: `user_id`, `name`, `preferred_niche`, `experience_level`, `goal`, `plan` (default `'free'`), `created_at` — RLS `auth.uid() = user_id`.
- `scripts`: `id`, `user_id`, `title`, `idea`, `niche`, `hook`, `retain`, `reward`, `cta`, `full_script`, `reading_time`, `is_favorite`, `created_at`, `updated_at` — RLS `auth.uid() = user_id`.
- `generations`: `id`, `user_id`, `tokens`, `model`, `status`, `created_at` — RLS `auth.uid() = user_id`.
- Trigger `handle_new_user` auto-creates a profile row on signup.

### Authentication
- Email/password register (`src/routes/register.tsx`) and login (`src/routes/login.tsx`).
- Google OAuth via `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })` on both pages.
- Protected routes: `src/routes/_authenticated/route.tsx` redirects to `/login` if no user (covers `/dashboard`, `/library`, `/editor/$scriptId`, `/teleprompter/$scriptId`, `/profile`, `/upgrade`, `/onboarding`, `/generator`).
- Sign-out button in workspace sidebar (`AppLayout` → `SidebarContent`) clears cache + signs out + navigates to `/login`.
- Root `onAuthStateChange` listener invalidates router/queries and bounces to `routeAfterAuth()` (= `/onboarding` if profile incomplete, else `/dashboard`).

### Onboarding (`/onboarding`)
- 3 questions matching spec exactly:
  - Niche dropdown: Skincare, Fashion, F&B, Edukasi, Finansial, Gaming, Lifestyle, Property, Beauty, Tech.
  - Experience level radios: Pemula, Menengah, Berpengalaman.
  - Goal text input.
- Upserts into `profiles` then navigates to `/dashboard`. If profile already complete, auto-skips on mount.

## Tiny fix to land

One small redirect target mismatch — protected route guard sends to `/login` (correct per spec), but I should double-check the `_authenticated/route.tsx` target matches `/login` (not `/auth`). If it already does, no change. (Reading shows it redirects to `/login` ✅.)

So: **no code changes required**. Plan reduces to verification.

## End-to-end smoke test (Playwright in shell, headless)

1. Open `/register`, create a fresh `e2e+<timestamp>@example.com` account with password `Passw0rd!` and name "E2E".
2. Expect redirect to `/onboarding`.
3. Fill niche=`Skincare`, level=`Pemula`, goal=`Konsisten posting 3 video / minggu`, submit.
4. Expect redirect to `/dashboard`. Capture screenshot.
5. Click "Sign out" in the sidebar (open mobile drawer if viewport <lg). Expect redirect to `/login`.
6. Log back in with same credentials. Expect direct redirect to `/dashboard` (no onboarding loop). Capture screenshot.
7. Open browser console log dump → assert zero errors.
8. Read `profiles` table via `supabase--read_query` and confirm exactly one row exists for the new user with the values from step 3.

If any assertion fails, drill into the failing step (network log + DOM snapshot) and patch only the offending code.

## Out of scope (untouched)

- AI generator, rewrite, hook regen, teleprompter — kept as they are; no new AI logic.
- Landing page, design system, sidebar layout — unchanged.
- No schema migrations, no new tables, no new RLS policies.

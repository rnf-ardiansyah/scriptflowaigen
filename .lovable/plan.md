## Goal
Aktifkan Lovable Cloud, buat skema database (profiles, scripts, generations) dengan RLS, dan implementasikan auth Email/Password + Google OAuth dengan flow onboarding → dashboard.

## 1. Aktifkan Lovable Cloud
- Panggil `supabase--enable` untuk provisioning backend.
- Konfigurasi Google sebagai social provider via `supabase--configure_social_auth`.

## 2. Database Schema (migration)
Buat 3 tabel di schema `public` dengan RLS + GRANT lengkap:

**profiles**
- `user_id uuid PK references auth.users(id) on delete cascade`
- `name text`, `preferred_niche text`, `experience_level text`, `goal text`
- `plan text default 'free' check (plan in ('free','premium'))`
- `created_at timestamptz default now()`

**scripts**
- `id uuid PK default gen_random_uuid()`
- `user_id uuid references auth.users(id) on delete cascade not null`
- `title, idea, niche, hook, retain, reward, cta, full_script text`
- `reading_time int`, `is_favorite bool default false`
- `created_at, updated_at timestamptz default now()`
- Trigger update_updated_at

**generations**
- `id uuid PK default gen_random_uuid()`
- `user_id uuid references auth.users(id) on delete cascade not null`
- `tokens int`, `model text`, `status text check (status in ('success','failed'))`
- `created_at timestamptz default now()`

**RLS Policies** — semua tabel: user hanya bisa SELECT/INSERT/UPDATE/DELETE baris dimana `auth.uid() = user_id`.

**GRANTs** — `authenticated`: SELECT/INSERT/UPDATE/DELETE; `service_role`: ALL. Tidak ada akses anon.

**Trigger auto-profile**: `handle_new_user()` security definer pada `auth.users` AFTER INSERT — buat row di `profiles` dengan `user_id` + `name` (dari `raw_user_meta_data.name` atau email).

## 3. Auth Implementation

**Halaman publik** (top-level routes): `/login`, `/register` sudah ada — wire ke Supabase Auth:
- Email/password signUp & signInWithPassword
- Tombol "Continue with Google" → `lovable.auth.signInWithOAuth('google', { redirect_uri: window.location.origin + '/auth/callback' })`
- Buat route publik `/auth/callback` yang menunggu session, lalu cek profile completeness → redirect `/onboarding` atau `/dashboard`

**Logic redirect setelah login**:
- Query `profiles` untuk user saat ini
- Jika `preferred_niche`, `experience_level`, `goal` semua terisi → `/dashboard`
- Jika belum → `/onboarding`

## 4. Protected Routes
Pindahkan `/dashboard`, `/library`, `/editor/$scriptId`, `/teleprompter/$scriptId`, `/profile`, `/upgrade`, `/onboarding` ke bawah `src/routes/_authenticated/`.

Buat layout managed `src/routes/_authenticated/route.tsx` (`ssr: false`, gate `supabase.auth.getUser()` → redirect `/login`).

Update `src/start.ts` untuk append bearer middleware (`attachSupabaseAuth`).

## 5. Onboarding Page
`/onboarding` form (3 field):
- Niche dropdown: Skincare, Fashion, F&B, Edukasi, Finansial, Gaming, Lifestyle, Property, Beauty, Tech
- Experience level radio: Pemula, Menengah, Berpengalaman
- Goal text input
- Submit → UPDATE `profiles` set 3 kolom → navigate `/dashboard`

Jika user buka `/onboarding` padahal profile sudah lengkap → redirect `/dashboard`.

## 6. Logout
Tombol logout di `AppLayout` nav + `/profile` page:
- `queryClient.cancelQueries()` → `queryClient.clear()` → `supabase.auth.signOut()` → `navigate('/login', { replace: true })`

## 7. Auth State Listener
Di `__root.tsx` wire single `onAuthStateChange` (filter SIGNED_IN/SIGNED_OUT/USER_UPDATED) → `router.invalidate()` + `queryClient.invalidateQueries()` (kecuali SIGNED_OUT).

## 8. Verifikasi
Setelah build sukses, jalankan Playwright headless test:
1. Register email baru → cek redirect ke `/onboarding`
2. Isi onboarding → cek redirect ke `/dashboard`
3. Logout → cek redirect ke `/login`
4. Login ulang → cek langsung ke `/dashboard` (skip onboarding)
5. Cek tidak ada error di console

## Catatan Teknis
- Landing page (`src/routes/index.tsx`) dan semua section landing TIDAK diubah.
- AI generate & teleprompter logic tidak diimplementasi di tahap ini (placeholder tetap).
- Semua query auth-scoped via browser `supabase` client (RLS handle scoping).

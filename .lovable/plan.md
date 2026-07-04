## Tujuan
Kembalikan tombol **Notifikasi (bell)** dan **Avatar user** di `Topbar` dengan implementasi yang benar-benar berfungsi — bukan pajangan.

## 1. Avatar User (menu akun)
File baru: `src/components/app/UserMenu.tsx`
- Ambil user dari `supabase.auth.getUser()` + subscribe `onAuthStateChange` untuk sinkronisasi.
- Tampilkan inisial dari `profile.name` atau email; fallback "?".
- Klik avatar → dropdown (pakai state lokal + click-outside) berisi:
  - Header: nama + email.
  - Link `Profile` → `/profile`.
  - Link `Upgrade` → `/upgrade`.
  - Tombol `Sign out` → `supabase.auth.signOut()` + `router.navigate({ to: "/login" })` + `queryClient.clear()`.
- Aksesibel: `aria-haspopup`, `aria-expanded`, tutup dengan Esc.

## 2. Notifikasi (bell)
Sumber data: tabel Supabase baru `notifications` (per-user, real).

### Migration
```sql
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index on public.notifications (user_id, created_at desc);

grant select, insert, update, delete on public.notifications to authenticated;
grant all on public.notifications to service_role;

alter table public.notifications enable row level security;

create policy "own_select" on public.notifications for select
  to authenticated using (auth.uid() = user_id);
create policy "own_update" on public.notifications for update
  to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own_delete" on public.notifications for delete
  to authenticated using (auth.uid() = user_id);
create policy "own_insert" on public.notifications for insert
  to authenticated with check (auth.uid() = user_id);
```

Seed: sisipkan 1 notifikasi welcome saat onboarding selesai (dari server function yang sudah ada, atau trigger sederhana `on insert profile`). Detail seeding masuk di step implementasi trigger.

### Komponen
File baru: `src/components/app/NotificationsBell.tsx`
- `useQuery(["notifications"])` → ambil 20 notifikasi terbaru.
- Tampilkan badge angka unread (`read_at is null`) di pojok bell.
- Klik bell → panel dropdown:
  - List item: title, body, waktu relatif, indikator dot unread.
  - Item yang punya `href` → `<Link>` ke route tsb; klik menandai `read_at = now()`.
  - Tombol "Tandai semua sudah dibaca" → update semua unread milik user.
  - Empty state: "Belum ada notifikasi".
- Realtime: subscribe channel `notifications:user_id=eq.<uid>` → invalidate query saat ada `INSERT`/`UPDATE`.
- Semua aksi via `supabase` client (RLS aktif).

## 3. Integrasi Topbar
File: `src/components/app/Topbar.tsx`
- Tambah kembali di sisi kanan: `<ThemeToggle />`, `<NotificationsBell />`, `<UserMenu />`.
- Hapus lagi elemen palsu jika muncul.

## Catatan teknis
- Semua data client-side pakai `supabase` browser client + RLS — tidak perlu server function baru.
- Waktu relatif pakai util kecil `formatRelative` lokal (tanpa dependency baru).
- Tidak mengubah komponen `landing/Navbar.tsx`.

## Hasil
Bell menampilkan notifikasi asli per-user dengan unread badge, mark-as-read, realtime. Avatar membuka menu akun dengan navigasi profil/upgrade dan sign out yang berfungsi.

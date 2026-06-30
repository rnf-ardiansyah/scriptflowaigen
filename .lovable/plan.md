## 1. Database migration

**New table `folders`** (with grants + RLS scoped to `auth.uid()`):
- `id uuid pk`, `user_id uuid not null`, `name text not null`, `created_at timestamptz default now()`.
- Policies: owner-only ALL.
- Index on `(user_id, created_at desc)`.

**Add `folder_id uuid` to `scripts`** with `references public.folders(id) on delete set null` — so deleting a folder leaves its scripts intact with `folder_id = null` (no data loss, matches spec).

**Server-side free-plan script cap (hard enforcement)** via a `BEFORE INSERT` trigger on `scripts`:
- Reads caller's plan from `profiles`.
- If `plan = 'free'` and `count(*) where user_id = NEW.user_id >= 20`, `RAISE EXCEPTION` with a recognizable message like `free_plan_script_limit_reached`.
- `SECURITY DEFINER`, `search_path = public`.

This guarantees the 20-script cap holds even if a client bypasses the UI/server function — Supabase REST inserts hit the trigger too.

## 2. Server function quota changes

**`src/lib/ai.functions.ts` — `generateScript`:**
- Before the existing AI rate-limit check, count user's scripts. If `plan = 'free'` and `count >= 20`, throw `makeError({ code: "script_limit_reached", limit: 20, message: "..." })`. Cache hits still allowed (no new row).
- Catch the trigger's exception on the final insert and re-throw as the same `script_limit_reached` lovable error (defense in depth).

**`src/lib/ai-shared.server.ts`:** extend `GenerationErrorCode` with `"script_limit_reached"`.

**New `src/lib/folders.functions.ts`** (auth-gated `createServerFn`s):
- `listFolders()` → `{ id, name, created_at, script_count }[]`.
- `createFolder({ name })`.
- `renameFolder({ id, name })`.
- `deleteFolder({ id })` — relies on `on delete set null` to detach scripts.
- `assignScriptToFolder({ scriptId, folderId | null })`.

These wrap `context.supabase` so RLS still applies; no admin client needed.

**New quota-summary server function** `src/lib/quota.functions.ts → getQuotaSummary()` returning `{ plan, generationsToday, generationLimit, scriptsUsed, scriptLimit | null }`. Dashboard reads this via TanStack Query.

## 3. Frontend changes

**`/upgrade` (`src/routes/_authenticated/upgrade.tsx`)** — rewrite as a side-by-side Free vs Premium comparison per spec:
- Free: 5 AI/hari, max 20 script, Teleprompter, basic niche template.
- Premium **Rp 29.000/bulan**: unlimited library, 100 AI/hari, semua niche, Favorite, AI Rewrite, AI Hook Generator, priority speed.
- "Upgrade ke Premium" button → `toast.info("Pembayaran segera hadir")` placeholder (no payment gateway).

**Dashboard (`src/routes/_authenticated/dashboard.tsx`)** — add a Quota card row using `getQuotaSummary`:
- "X dari 5 generate hari ini" (free) / "X dari 100 generate hari ini" (premium).
- "X dari 20 script tersimpan" (free) / "X script tersimpan" (premium, no cap).
- Subtle progress bar; when free quota at limit, show inline "Upgrade" link to `/upgrade`.

**`/new-script` error handling** — already routes `lovable.code` errors to friendly UI; add a `"script_limit_reached"` branch with copy + CTA to `/upgrade`.

**Library (`src/routes/_authenticated/library.tsx`)** — add folder UI:
- Left sidebar (collapses into top tab strip on mobile) listing `Semua Script` (default) + each folder with script counts, plus a "+ Folder baru" inline form.
- Selecting a folder filters the grid (`folder_id = selected` or `IS NULL` for "Tanpa folder"). Search/niche/favorite filters compose with folder filter.
- Per-card "Move to…" action via existing dropdown menu — lists folders + "Tanpa folder" option, calls `assignScriptToFolder`.
- Per-folder kebab → Rename / Delete (confirm dialog: "Script di folder ini tidak akan terhapus, hanya dipindah keluar folder").
- "Buat Script Baru" CTA: still navigates to `/new-script`. If quota summary shows free user already at 20 scripts, show a banner above the grid with upgrade link (still allow click — generate flow surfaces the hard error).

**Types** — extend `ScriptRow` in `src/lib/scripts.ts` with `folder_id: string | null`; add it to select projections.

## 4. Out of scope (per user instructions)

- Real payments / Stripe wiring.
- Premium-only gating of AI Rewrite / Hook Generator features (spec only lists them as premium *marketing* differentiators; current build keeps them quota-gated). Mention this trade-off after build so user can decide whether to enforce later.

## Technical details

- Trigger SQL (single migration with table + grants + RLS + trigger):

```sql
create table public.folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.folders to authenticated;
grant all on public.folders to service_role;
alter table public.folders enable row level security;
create policy folders_all_own on public.folders for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index folders_user_idx on public.folders (user_id, created_at desc);

alter table public.scripts
  add column folder_id uuid references public.folders(id) on delete set null;
create index scripts_folder_idx on public.scripts (folder_id);

create or replace function public.enforce_free_script_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_plan text; v_count int;
begin
  select plan into v_plan from public.profiles where user_id = new.user_id;
  if coalesce(v_plan,'free') = 'free' then
    select count(*) into v_count from public.scripts where user_id = new.user_id;
    if v_count >= 20 then
      raise exception 'free_plan_script_limit_reached' using errcode = 'P0001';
    end if;
  end if;
  return new;
end $$;
create trigger scripts_free_limit
  before insert on public.scripts
  for each row execute function public.enforce_free_script_limit();
```

- Server function maps Postgres error message `free_plan_script_limit_reached` → lovable `{ code: "script_limit_reached", limit: 20 }`.
- Folders sidebar uses existing `Card`/`Button`/dropdown primitives — no new shadcn components needed.
- All folder mutations invalidate `["folders"]` and `["scripts"]` query keys for instant UI refresh.

## Verification

- After migration: `tsgo --noEmit`.
- Manual: log in as free user (set `profiles.plan='free'`), insert 20 scripts, confirm 21st insert errors and `/new-script` shows upgrade CTA.
- Folder create/assign/filter/delete round-trip in `/library`; deleted folder leaves scripts visible under "Tanpa folder".

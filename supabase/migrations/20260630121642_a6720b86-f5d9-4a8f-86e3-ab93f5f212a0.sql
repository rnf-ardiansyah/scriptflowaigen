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
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan text;
  v_count int;
begin
  select plan into v_plan from public.profiles where user_id = new.user_id;
  if coalesce(v_plan, 'free') = 'free' then
    select count(*) into v_count from public.scripts where user_id = new.user_id;
    if v_count >= 20 then
      raise exception 'free_plan_script_limit_reached' using errcode = 'P0001';
    end if;
  end if;
  return new;
end
$$;

create trigger scripts_free_limit
  before insert on public.scripts
  for each row execute function public.enforce_free_script_limit();
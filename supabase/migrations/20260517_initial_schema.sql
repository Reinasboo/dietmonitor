create extension if not exists pgcrypto;

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  logged_at timestamptz not null
);

create index if not exists entries_user_id_logged_at_idx
  on public.entries (user_id, logged_at desc);

alter table public.entries enable row level security;

drop policy if exists "entries_select_own" on public.entries;
create policy "entries_select_own"
  on public.entries
  for select
  using (auth.uid() = user_id);

drop policy if exists "entries_insert_own" on public.entries;
create policy "entries_insert_own"
  on public.entries
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "entries_update_own" on public.entries;
create policy "entries_update_own"
  on public.entries
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "entries_delete_own" on public.entries;
create policy "entries_delete_own"
  on public.entries
  for delete
  using (auth.uid() = user_id);

create table if not exists public.insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  insight_type text not null,
  data jsonb not null,
  week_start date not null,
  created_at timestamptz not null default now()
);

create index if not exists insights_user_id_week_start_idx
  on public.insights (user_id, week_start desc);

alter table public.insights enable row level security;

drop policy if exists "insights_select_own" on public.insights;
create policy "insights_select_own"
  on public.insights
  for select
  using (auth.uid() = user_id);

drop policy if exists "insights_insert_own" on public.insights;
create policy "insights_insert_own"
  on public.insights
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "insights_update_own" on public.insights;
create policy "insights_update_own"
  on public.insights
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "insights_delete_own" on public.insights;
create policy "insights_delete_own"
  on public.insights
  for delete
  using (auth.uid() = user_id);

create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists user_preferences_user_id_key
  on public.user_preferences (user_id);

alter table public.user_preferences enable row level security;

drop policy if exists "user_preferences_select_own" on public.user_preferences;
create policy "user_preferences_select_own"
  on public.user_preferences
  for select
  using (auth.uid() = user_id);

drop policy if exists "user_preferences_insert_own" on public.user_preferences;
create policy "user_preferences_insert_own"
  on public.user_preferences
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "user_preferences_update_own" on public.user_preferences;
create policy "user_preferences_update_own"
  on public.user_preferences
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "user_preferences_delete_own" on public.user_preferences;
create policy "user_preferences_delete_own"
  on public.user_preferences
  for delete
  using (auth.uid() = user_id);
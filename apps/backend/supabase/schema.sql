-- =============================================
-- Wedgite — Supabase Database Schema
-- Run this in the Supabase SQL Editor
-- =============================================

-- 1. Websites table — user's saved URLs
create table if not exists websites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  url text not null,
  created_at timestamptz not null default now()
);

alter table websites enable row level security;

create policy "Users can read own websites"
  on websites for select
  using (auth.uid() = user_id);

create policy "Users can insert own websites"
  on websites for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own websites"
  on websites for delete
  using (auth.uid() = user_id);

-- 2. Widget configs table — per-widget settings
create table if not exists widget_configs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  website_id uuid not null references websites(id) on delete cascade,
  refresh_interval_minutes integer not null default 15,
  created_at timestamptz not null default now()
);

alter table widget_configs enable row level security;

create policy "Users can read own widget configs"
  on widget_configs for select
  using (auth.uid() = user_id);

create policy "Users can insert own widget configs"
  on widget_configs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own widget configs"
  on widget_configs for update
  using (auth.uid() = user_id);

create policy "Users can delete own widget configs"
  on widget_configs for delete
  using (auth.uid() = user_id);

-- 3. Screenshot cache — tracks captured images (no RLS, accessed via service role)
create table if not exists screenshot_cache (
  url_hash text primary key,
  storage_path text not null,
  captured_at timestamptz not null default now()
);

-- 4. Create the screenshots storage bucket (public, so widgets can fetch images directly)
insert into storage.buckets (id, name, public)
values ('screenshots', 'screenshots', true)
on conflict (id) do nothing;

-- Storage policy: allow service role uploads (default), public reads
create policy "Public screenshot read access"
  on storage.objects for select
  using (bucket_id = 'screenshots');

-- meisi: 電子名刺アプリ データベーススキーマ
-- Supabase の SQL Editor でこのファイルをそのまま実行してください。

-- 拡張機能(UUID生成)
create extension if not exists "pgcrypto";

-- ============================================
-- profiles: 名刺そのもの (1ユーザー = 1枚の名刺)
-- ============================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  full_name text not null default '',
  company text not null default '',
  job_title text not null default '',
  email text not null default '',
  phone text not null default '',
  website text not null default '',
  bio text not null default '',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint username_format check (username ~ '^[a-zA-Z0-9_-]{3,20}$')
);

comment on table public.profiles is '名刺(公開プロフィール)。id は auth.users.id と1対1。';

-- updated_at を自動更新するトリガー
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- 新規サインアップ時に空の名刺を自動作成
create or replace function public.handle_new_user()
returns trigger as $$
declare
  base_username text;
  final_username text;
  suffix int := 0;
begin
  base_username := lower(regexp_replace(split_part(new.email, '@', 1), '[^a-zA-Z0-9_-]', '', 'g'));
  if base_username is null or length(base_username) < 3 then
    base_username := 'user' || substr(new.id::text, 1, 8);
  end if;
  final_username := base_username;

  while exists (select 1 from public.profiles where username = final_username) loop
    suffix := suffix + 1;
    final_username := base_username || suffix::text;
  end loop;

  insert into public.profiles (id, username, full_name, email)
  values (new.id, final_username, coalesce(new.raw_user_meta_data ->> 'full_name', ''), coalesce(new.email, ''));

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Row Level Security
alter table public.profiles enable row level security;

-- 名刺は誰でも閲覧可能(公開URLで共有するため)
drop policy if exists "profiles are publicly readable" on public.profiles;
create policy "profiles are publicly readable"
  on public.profiles for select
  using (true);

-- 自分の名刺のみ編集可能
drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "users can insert own profile" on public.profiles;
create policy "users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ============================================
-- connections: 名刺交換の記録
-- 交換が成立すると双方向に1行ずつ作成される
-- ============================================
create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  connected_user_id uuid not null references auth.users (id) on delete cascade,
  exchanged_via text not null default 'link' check (exchanged_via in ('qr', 'link', 'search')),
  created_at timestamptz not null default now(),
  unique (user_id, connected_user_id),
  constraint no_self_connection check (user_id <> connected_user_id)
);

comment on table public.connections is '名刺交換の記録。user_id 視点で connected_user_id の名刺を保有していることを表す。';

alter table public.connections enable row level security;

drop policy if exists "users can read own connections" on public.connections;
create policy "users can read own connections"
  on public.connections for select
  using (auth.uid() = user_id);

drop policy if exists "users can create own connections" on public.connections;
create policy "users can create own connections"
  on public.connections for insert
  with check (auth.uid() = user_id);

drop policy if exists "users can delete own connections" on public.connections;
create policy "users can delete own connections"
  on public.connections for delete
  using (auth.uid() = user_id);

-- 双方向に名刺交換レコードを作成するRPC
-- (相手側の profiles insert 権限を経由せず安全に両方向へ書き込むため security definer)
create or replace function public.exchange_cards(other_user_id uuid, via text default 'link')
returns void as $$
begin
  if other_user_id = auth.uid() then
    raise exception 'cannot exchange card with yourself';
  end if;

  insert into public.connections (user_id, connected_user_id, exchanged_via)
  values (auth.uid(), other_user_id, via)
  on conflict (user_id, connected_user_id) do nothing;

  insert into public.connections (user_id, connected_user_id, exchanged_via)
  values (other_user_id, auth.uid(), via)
  on conflict (user_id, connected_user_id) do nothing;
end;
$$ language plpgsql security definer set search_path = public;

-- avatar画像用ストレージバケット
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatar images are publicly accessible" on storage.objects;
create policy "avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "users can upload own avatar" on storage.objects;
create policy "users can upload own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "users can update own avatar" on storage.objects;
create policy "users can update own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- Test fixtures only. Never run this script against a shared or production database.
create or replace function auth.uid() returns uuid
language sql stable as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;
create type public.streaming_platform as enum ('spotify', 'youtube');
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid references auth.users(id),
  username text not null unique
);
create table public.songs (
  id uuid primary key,
  user_id uuid references public.profiles(id),
  title text not null
);
create table public.song_links (
  id uuid primary key,
  song_id uuid not null references public.songs(id),
  platform public.streaming_platform not null,
  url text not null
);
create table public.ad_clicks (
  id bigint generated always as identity primary key,
  song_id uuid,
  platform_click public.streaming_platform,
  created_at timestamptz not null default now()
);
create function public.get_ad_clicks_summary(
  p_from timestamptz default null, p_to timestamptz default null,
  p_song_id text default null, p_platform text default null
) returns table (song_id text, platform_click public.streaming_platform, click_count bigint)
language sql stable as $$
  select c.song_id::text, c.platform_click, count(*)
  from public.ad_clicks c
  where (p_from is null or c.created_at >= p_from)
    and (p_to is null or c.created_at < p_to)
    and (p_song_id is null or c.song_id::text = p_song_id)
    and (p_platform is null or c.platform_click::text = p_platform)
  group by c.song_id, c.platform_click;
$$;
create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
create function storage.foldername(text) returns text[]
language sql immutable as $$ select (string_to_array($1, '/'))[1:array_length(string_to_array($1, '/'), 1)-1] $$;
create function storage.filename(text) returns text
language sql immutable as $$ select (string_to_array($1, '/'))[array_length(string_to_array($1, '/'), 1)] $$;
alter table storage.objects enable row level security;
create policy "Authenticated users can upload cover Art" on storage.objects
  for insert to authenticated with check (bucket_id = 'CoverArt');
create policy "Public read access for cover" on storage.objects
  for select to public using (bucket_id = 'CoverArt');
grant usage on schema public, auth, storage to anon, authenticated;
grant select, insert, update, delete on public.profiles, public.songs,
  public.song_links, public.ad_clicks to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;
grant select, insert, update, delete on storage.objects to anon, authenticated;
insert into auth.users (id) values
  ('00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0000-000000000002');
insert into public.profiles (id, auth_id, username) values
  ('10000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','one'),
  ('10000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000002','two');
insert into public.songs (id, user_id, title) values
  ('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001','one'),
  ('20000000-0000-0000-0000-000000000002','10000000-0000-0000-0000-000000000002','two');
insert into public.song_links (id, song_id, platform, url) values
  ('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','spotify','https://example.com'),
  ('30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002','youtube','https://example.com');
insert into public.ad_clicks (song_id, platform_click) values
  ('20000000-0000-0000-0000-000000000001','spotify'),
  ('20000000-0000-0000-0000-000000000002','youtube');

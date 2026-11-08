-- REVIEW ONLY: apply only with the corresponding application changes.
-- Existing profile and landing-page reads remain public.

begin;

do $$
begin
  if exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename in ('profiles', 'songs', 'song_links', 'ad_clicks')
  ) then
    raise exception 'Existing policies require review before applying this migration';
  end if;
  if exists (
    select 1 from public.profiles
    where auth_id is not null
    group by auth_id having count(*) > 1
  ) then
    raise exception 'Duplicate profile auth IDs require manual resolution';
  end if;
  if exists (
    select 1 from public.profiles
    group by lower(username) having count(*) > 1
  ) then
    raise exception 'Duplicate usernames require manual resolution';
  end if;
  if exists (select 1 from public.songs where user_id is null) then
    raise exception 'Songs without owners require manual resolution';
  end if;
end;
$$;

create unique index profiles_auth_id_unique
  on public.profiles (auth_id) where auth_id is not null;
create unique index profiles_username_lower_unique
  on public.profiles (lower(username));

alter table public.ad_clicks
  add constraint ad_clicks_song_id_fkey foreign key (song_id)
  references public.songs(id) not valid;
alter table public.ad_clicks alter column created_at set default now();
create index ad_clicks_song_created_at_idx
  on public.ad_clicks (song_id, created_at);

alter table public.profiles enable row level security;
alter table public.songs enable row level security;
alter table public.song_links enable row level security;
alter table public.ad_clicks enable row level security;

create policy profiles_public_read on public.profiles
  for select to anon, authenticated using (true);
create policy profiles_owner_insert on public.profiles
  for insert to authenticated with check (auth_id = (select auth.uid()));
create policy profiles_owner_update on public.profiles
  for update to authenticated
  using (auth_id = (select auth.uid()))
  with check (auth_id = (select auth.uid()));

create policy songs_public_read on public.songs
  for select to anon, authenticated using (true);
create policy songs_owner_insert on public.songs
  for insert to authenticated with check (
    exists (select 1 from public.profiles p
            where p.id = songs.user_id and p.auth_id = (select auth.uid()))
  );
create policy songs_owner_update on public.songs
  for update to authenticated using (
    exists (select 1 from public.profiles p
            where p.id = songs.user_id and p.auth_id = (select auth.uid()))
  ) with check (
    exists (select 1 from public.profiles p
            where p.id = songs.user_id and p.auth_id = (select auth.uid()))
  );
create policy songs_owner_delete on public.songs
  for delete to authenticated using (
    exists (select 1 from public.profiles p
            where p.id = songs.user_id and p.auth_id = (select auth.uid()))
  );

create policy song_links_public_read on public.song_links
  for select to anon, authenticated using (true);
create policy song_links_owner_insert on public.song_links
  for insert to authenticated with check (
    exists (select 1 from public.songs s join public.profiles p on p.id = s.user_id
            where s.id = song_links.song_id and p.auth_id = (select auth.uid()))
  );
create policy song_links_owner_update on public.song_links
  for update to authenticated using (
    exists (select 1 from public.songs s join public.profiles p on p.id = s.user_id
            where s.id = song_links.song_id and p.auth_id = (select auth.uid()))
  ) with check (
    exists (select 1 from public.songs s join public.profiles p on p.id = s.user_id
            where s.id = song_links.song_id and p.auth_id = (select auth.uid()))
  );
create policy song_links_owner_delete on public.song_links
  for delete to authenticated using (
    exists (select 1 from public.songs s join public.profiles p on p.id = s.user_id
            where s.id = song_links.song_id and p.auth_id = (select auth.uid()))
  );

create policy ad_clicks_owner_read on public.ad_clicks
  for select to authenticated using (
    exists (select 1 from public.songs s join public.profiles p on p.id = s.user_id
            where s.id = ad_clicks.song_id and p.auth_id = (select auth.uid()))
  );
create policy ad_clicks_public_insert on public.ad_clicks
  for insert to anon, authenticated with check (
    exists (select 1 from public.song_links l
            where l.song_id = ad_clicks.song_id
              and l.platform = ad_clicks.platform_click)
  );

revoke insert, update, delete on public.profiles, public.songs,
  public.song_links from anon;
revoke select, update, delete on public.ad_clicks from anon;
revoke update, delete on public.ad_clicks from authenticated;
revoke insert on public.ad_clicks from public, anon, authenticated;
-- Keep created_at writable until older clients have been replaced.
grant insert (song_id, platform_click, created_at) on public.ad_clicks to anon, authenticated;

create or replace function public.get_ad_clicks_summary(
  p_from timestamptz default null,
  p_to timestamptz default null,
  p_song_id text default null,
  p_platform text default null
)
returns table (song_id text, platform_click public.streaming_platform, click_count bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select ac.song_id::text, ac.platform_click, count(*)
  from public.ad_clicks ac
  join public.songs s on s.id = ac.song_id
  join public.profiles p on p.id = s.user_id
  where p.auth_id = (select auth.uid())
    and (p_from is null or ac.created_at >= p_from)
    and (p_to is null or ac.created_at < p_to)
    and (p_song_id is null or ac.song_id = p_song_id::uuid)
    and (p_platform is null or ac.platform_click::text = p_platform)
  group by ac.song_id, ac.platform_click
  order by ac.song_id, ac.platform_click;
$$;
revoke execute on function public.get_ad_clicks_summary(
  timestamptz, timestamptz, text, text
) from public, anon;
grant execute on function public.get_ad_clicks_summary(
  timestamptz, timestamptz, text, text
) to authenticated;

create function public.create_profile_from_signup()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_username text := lower(trim(new.raw_user_meta_data ->> 'username'));
begin
  if requested_username is null then
    return new;
  end if;
  if requested_username !~ '^[a-z0-9_]{3,}$' then
    raise exception 'Invalid username';
  end if;
  insert into public.profiles (auth_id, username)
  values (new.id, requested_username);
  return new;
end;
$$;
revoke all on function public.create_profile_from_signup() from public, anon, authenticated;
create trigger create_profile_on_signup
  after insert on auth.users
  for each row execute function public.create_profile_from_signup();

drop policy "Authenticated users can upload cover Art" on storage.objects;
create policy cover_art_owner_insert on storage.objects
  for insert to authenticated with check (
    bucket_id = 'CoverArt'
    and (storage.foldername(name))[1] = 'songs'
    and exists (
      select 1 from public.songs s join public.profiles p on p.id = s.user_id
      where p.auth_id = (select auth.uid())
        and (storage.foldername(name))[2] = p.username
        and left(storage.filename(name), length(s.id::text) + 1) = s.id::text || '.'
    )
  );
create policy cover_art_owner_update on storage.objects
  for update to authenticated using (
    bucket_id = 'CoverArt'
    and (storage.foldername(name))[1] = 'songs'
    and exists (
      select 1 from public.songs s join public.profiles p on p.id = s.user_id
      where p.auth_id = (select auth.uid())
        and (storage.foldername(name))[2] = p.username
        and left(storage.filename(name), length(s.id::text) + 1) = s.id::text || '.'
    )
  ) with check (
    bucket_id = 'CoverArt'
    and (storage.foldername(name))[1] = 'songs'
    and exists (
      select 1 from public.songs s join public.profiles p on p.id = s.user_id
      where p.auth_id = (select auth.uid())
        and (storage.foldername(name))[2] = p.username
        and left(storage.filename(name), length(s.id::text) + 1) = s.id::text || '.'
    )
  );

commit;

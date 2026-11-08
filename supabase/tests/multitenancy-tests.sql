-- Test fixtures only. Never run this script against a shared or production database.
-- Abort on the first failed assertion.
\set ON_ERROR_STOP on

set role anon;
do $$
begin
  if (select count(*) from public.songs) <> 2 then
    raise exception 'Anonymous public landing reads failed';
  end if;
  if has_table_privilege('anon', 'public.ad_clicks', 'select') then
    raise exception 'Anonymous users can read analytics';
  end if;
  if has_function_privilege('anon', 'public.get_ad_clicks_summary(timestamptz,timestamptz,text,text)', 'execute') then
    raise exception 'Anonymous users can execute analytics RPC';
  end if;
end $$;
insert into public.ad_clicks (song_id, platform_click)
values ('20000000-0000-0000-0000-000000000001', 'spotify');
do $$
begin
  begin
    insert into public.ad_clicks (song_id, platform_click)
    values ('20000000-0000-0000-0000-000000000001', 'youtube');
    raise exception 'Invalid click unexpectedly accepted';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;

set role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', false);
do $$
declare affected integer;
begin
  if (select count(*) from public.ad_clicks) <> 2 then
    raise exception 'Owner analytics does not match expected clicks';
  end if;
  if (select count(*) from public.get_ad_clicks_summary()) <> 1 then
    raise exception 'RPC exposed another owner or hid own data';
  end if;
  update public.songs set title = 'forbidden' where id = '20000000-0000-0000-0000-000000000002';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Cross-owner song update allowed'; end if;
  update public.song_links set url = 'https://forbidden.example'
    where id = '30000000-0000-0000-0000-000000000002';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Cross-owner link update allowed'; end if;
  update public.profiles set username = 'forbidden' where id = '10000000-0000-0000-0000-000000000002';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Cross-owner profile update allowed'; end if;
  update public.songs set title = 'permitted' where id = '20000000-0000-0000-0000-000000000001';
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'Owner song update denied'; end if;
  begin
    insert into public.songs (id, user_id, title)
    values ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'forbidden');
    raise exception 'Cross-owner song insertion allowed';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.song_links (id, song_id, platform, url)
    values ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 'spotify', 'https://example.com');
    raise exception 'Cross-owner link insertion allowed';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.profiles (auth_id, username)
    values ('00000000-0000-0000-0000-000000000002', 'forbidden');
    raise exception 'Cross-owner profile insertion allowed';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into storage.objects (bucket_id, name) values
      ('CoverArt', 'songs/two/20000000-0000-0000-0000-000000000002.jpg');
    raise exception 'Cross-owner storage upload allowed';
  exception when insufficient_privilege then null;
  end;
end $$;
insert into storage.objects (bucket_id, name) values
  ('CoverArt', 'songs/one/20000000-0000-0000-0000-000000000001.jpg');
update storage.objects set name = 'songs/one/20000000-0000-0000-0000-000000000001.png'
where name = 'songs/one/20000000-0000-0000-0000-000000000001.jpg';
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', false);
do $$
declare affected integer;
begin
  if (select count(*) from public.ad_clicks) <> 1 then
    raise exception 'Second owner analytics does not match expected clicks';
  end if;
  if (select count(*) from public.get_ad_clicks_summary()) <> 1 then
    raise exception 'Second owner RPC returned incorrect data';
  end if;
  update storage.objects set name = 'songs/two/20000000-0000-0000-0000-000000000002.png'
  where name = 'songs/one/20000000-0000-0000-0000-000000000001.png';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Cross-owner storage update allowed'; end if;
end $$;
reset role;

insert into auth.users (id, raw_user_meta_data)
values ('00000000-0000-0000-0000-000000000003', '{"username":"Third_User"}');
do $$
begin
  if not exists (
    select 1 from public.profiles
    where auth_id = '00000000-0000-0000-0000-000000000003' and username = 'third_user'
  ) then raise exception 'Signup profile was not created'; end if;
end $$;

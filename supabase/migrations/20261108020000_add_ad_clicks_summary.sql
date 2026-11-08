create index if not exists ad_clicks_created_at_idx
  on public.ad_clicks (created_at);

create index if not exists ad_clicks_song_id_idx
  on public.ad_clicks (song_id);

create index if not exists ad_clicks_platform_click_idx
  on public.ad_clicks (platform_click);

create or replace function public.get_ad_clicks_summary(
  p_from timestamptz default null,
  p_to timestamptz default null,
  p_song_id text default null,
  p_platform text default null
)
returns table (
  song_id text,
  platform_click public.streaming_platform,
  click_count bigint
)
language sql
stable
set search_path = public
as $$
  select
    ac.song_id::text,
    ac.platform_click,
    count(*)::bigint as click_count
  from public.ad_clicks as ac
  where (p_from is null or ac.created_at >= p_from)
    and (p_to is null or ac.created_at < p_to)
    and (p_song_id is null or ac.song_id::text = p_song_id)
    and (p_platform is null or ac.platform_click::text = p_platform)
  group by ac.song_id, ac.platform_click;
$$;

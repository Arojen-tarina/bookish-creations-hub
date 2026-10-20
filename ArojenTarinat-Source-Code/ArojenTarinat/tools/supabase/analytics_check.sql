-- Arojen Tarinat: analytics checks. Paste into the Supabase SQL editor and run.
-- Queries 1 and 2 only read. Query 3 deletes and is commented out on purpose.

-- 1. Which apps have sent events, and when (last 120 days).
--    platform 'web'     = GitHub Pages build
--    platform 'android' = the old Play Store app (WebView, app_version '0.1.0')
--                         or the new native app (app_version '2.0.0...')
--    platform 'unknown' = rows written before the platform column existed (2026-10-14 migration)
--    If the old Play Store app ('android' + '0.1.0') is missing or tiny next to 'web',
--    its players never got past the old consent banner, or its inserts failed
--    before the platform column was added on the server (first_seen tells which).
select platform,
       app_version,
       count(*)                  as events,
       count(distinct client_id) as players,
       min(created_at)           as first_seen,
       max(created_at)           as last_seen
from public.analytics_events
where created_at > now() - interval '120 days'
group by platform, app_version
order by last_seen desc;

-- 2. The new native app's events (our test rows from 2026-10-19 have app_version '2.0.0-dev').
select created_at, event_name, app_version, payload
from public.analytics_events
where platform = 'android' and app_version like '2.0.0%'
order by created_at desc
limit 50;

-- 3. Optional: remove only our test rows from the debug build. Uncomment to run.
-- delete from public.analytics_events
-- where platform = 'android' and app_version = '2.0.0-dev';

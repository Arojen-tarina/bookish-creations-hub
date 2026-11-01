-- Arojen Tarinat 2.0: proof that the native Android app's analytics arrive (read-only).
-- Run after playing a few minutes with "Allow analytics" in a 2.0 build.
-- app_version '2.0.0'         = the Play Store release
-- app_version '2.0.0-preview' = the release-speed test APK
-- app_version '2.0.0-dev'     = debug builds

-- 1) Every event type the 2.0 app has sent, per build, in the last 2 days.
select app_version,
       platform,
       event_name,
       count(*)                  as events,
       count(distinct client_id) as players,
       min(created_at)           as first_seen,
       max(created_at)           as last_seen
from public.analytics_events
where app_version like '2.0.0%'
  and created_at > now() - interval '2 days'
group by app_version, platform, event_name
order by app_version, events desc;

-- 2) Health of the 2.0 rows: platform must be 'android', no future timestamps,
--    and every session that started should also have ended.
select app_version,
       count(*) filter (where platform <> 'android')              as wrong_platform,
       count(*) filter (where created_at > now() + interval '5 minutes') as future_rows,
       count(*) filter (where event_name = 'session_start')       as sessions_started,
       count(*) filter (where event_name = 'session_end')         as sessions_ended,
       count(distinct session_id)                                 as sessions
from public.analytics_events
where app_version like '2.0.0%'
group by app_version;

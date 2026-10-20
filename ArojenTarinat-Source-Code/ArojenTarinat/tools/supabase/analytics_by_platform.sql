-- Arojen Tarinat: which apps have sent analytics events, and when (read-only).
-- platform 'web'     = GitHub Pages build
-- platform 'android' = old Play Store app (app_version '0.1.0') or the new native app ('2.0.0...')
-- platform 'unknown' = rows written before the platform column existed (2026-10-14 migration)
select platform,
       app_version,
       count(*)                  as events,
       count(distinct client_id) as players,
       min(created_at)           as first_seen,
       max(created_at)           as last_seen
from public.analytics_events
group by platform, app_version
order by last_seen desc;

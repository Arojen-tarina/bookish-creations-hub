-- Arojen Tarinat 2.0: did the release-speed test build (app_version '2.0.0-preview') send its
-- analytics? Read-only. Run in the Supabase SQL editor.
-- Test session on the Pixel 7a: 2026-10-20, about 17:17 to 17:20 Pakistan time (12:17 to 12:20 UTC).

select event_name,
       count(*)                   as events,
       count(distinct session_id) as sessions,
       min(created_at)            as first_at,
       max(created_at)            as last_at
from public.analytics_events
where app_version = '2.0.0-preview'
  and platform = 'android'
  and created_at > now() - interval '3 hours'
group by event_name
order by first_at;

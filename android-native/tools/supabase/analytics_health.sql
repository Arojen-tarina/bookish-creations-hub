-- Arojen Tarinat: data quality of the analytics table, per platform (read-only).
-- Run, then export the result as CSV.
--   sessions_started / sessions_ended: the old WebView app ended sessions on the browser's
--     'pagehide', which an Android WebView often never fires, so 'android' should show far
--     fewer ends than starts (session lengths in the dashboard then come from too few rows).
--   future_rows: rows dated after now(); the old app sent the phone's clock, so a phone with
--     a wrong date writes into the future and skews the daily and retention views.
select platform,
       app_version,
       count(*) filter (where event_name = 'session_start') as sessions_started,
       count(*) filter (where event_name = 'session_end')   as sessions_ended,
       count(*) filter (where created_at > now())            as future_rows,
       count(*)                                              as all_rows
from public.analytics_events
group by platform, app_version
order by all_rows desc;

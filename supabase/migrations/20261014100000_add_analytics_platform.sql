-- Track whether analytics events came from the web build or a native app.
-- Existing rows and older clients are kept as 'unknown' rather than guessed.
alter table public.analytics_events
  add column if not exists platform text not null default 'unknown';

alter table public.analytics_events
  drop constraint if exists analytics_events_platform_check;

alter table public.analytics_events
  add constraint analytics_events_platform_check
  check (platform in ('web', 'android', 'ios', 'other', 'unknown'));

create index if not exists analytics_events_platform_created_at_idx
  on public.analytics_events (platform, created_at);

create or replace view public.analytics_daily_active_users_by_platform
with (security_invoker = true) as
select
  date_trunc('day', created_at)::date as day,
  platform,
  count(distinct client_id) as dau
from public.analytics_events
where event_name = 'session_start'
group by 1, 2
order by 1, 2;

create or replace view public.analytics_session_lengths_by_platform
with (security_invoker = true) as
select
  date_trunc('day', created_at)::date as day,
  platform,
  count(*) as sessions,
  avg((payload->>'durationMs')::numeric) as avg_duration_ms,
  avg((payload->>'turnsThisSession')::numeric) as avg_turns_per_session
from public.analytics_events
where event_name = 'session_end'
group by 1, 2
order by 1, 2;

revoke all on public.analytics_daily_active_users_by_platform from anon, authenticated;
revoke all on public.analytics_session_lengths_by_platform from anon, authenticated;

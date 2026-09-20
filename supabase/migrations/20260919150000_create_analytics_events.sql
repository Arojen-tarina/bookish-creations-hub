-- Creates the analytics_events table backing src/lib/analytics/core.ts.
-- Security model (OWASP A01/A02/A05 — see .github/copilot-instructions.md):
--   * Anonymous clients (the app's public anon key) may ONLY insert rows for
--     themselves. There is no SELECT/UPDATE/DELETE policy for anon/authenticated
--     at all, so the default-deny behaviour of RLS blocks reads/writes/deletes
--     of other players' events entirely (the anon key can never be used to
--     exfiltrate or tamper with analytics data, only append to it).
--   * A CHECK constraint whitelists event_name against the exact union in
--     src/lib/analytics/types.ts (AnalyticsEventName) so the table can't be
--     used to store arbitrary junk/garbage rows. Keep this list in sync if
--     new event types are added there.
--   * Loose size/shape bounds (string lengths, jsonb payload byte size) guard
--     against a misbehaving or malicious client flooding storage with huge
--     rows. This is NOT a rate limiter (no per-IP/per-client throttling is
--     possible from a SQL migration) — see ANALYTICS-STRATEGY.md for the
--     documented tradeoff (acceptable for a solo-dev, no paid analytics
--     infra project; upgrade path is a rate-limited edge function if abuse
--     is ever observed).
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_name text not null,
  payload jsonb not null default '{}'::jsonb,
  client_id text not null,
  session_id text not null,
  app_version text not null,
  created_at timestamptz not null default now(),
  constraint analytics_events_event_name_check check (event_name in (
    'session_start', 'session_end',
    'onboarding_step',
    'game_start', 'game_over', 'campaign_restart', 'game_saved', 'game_loaded',
    'progression_snapshot',
    'battle_outcome',
    'building_constructed', 'army_recruited',
    'card_played',
    'treaty_proposed', 'treaty_broken', 'war_declared',
    'achievement_unlocked',
    'menu_interaction', 'settings_changed',
    'experiment_assigned'
  )),
  constraint analytics_events_client_id_length check (char_length(client_id) between 1 and 100),
  constraint analytics_events_session_id_length check (char_length(session_id) between 1 and 100),
  constraint analytics_events_app_version_length check (char_length(app_version) <= 20),
  constraint analytics_events_payload_size check (pg_column_size(payload) < 8192)
);

create index if not exists analytics_events_event_name_idx on public.analytics_events (event_name);
create index if not exists analytics_events_client_id_idx on public.analytics_events (client_id);
create index if not exists analytics_events_created_at_idx on public.analytics_events (created_at);

alter table public.analytics_events enable row level security;

drop policy if exists "Anyone can insert their own analytics events" on public.analytics_events;
create policy "Anyone can insert their own analytics events"
on public.analytics_events
for insert
to anon, authenticated
with check (true);

-- No SELECT/UPDATE/DELETE policy is defined on purpose: RLS defaults to deny,
-- so anon/authenticated can append events but never read, edit or remove any
-- row (their own or anyone else's). Only service_role (bypasses RLS) or the
-- project owner via Supabase Studio's SQL editor can read this table/views.

-- ---------------------------------------------------------------------------
-- Read-only aggregate dashboard views for a solo dev (queried from the
-- Supabase Studio SQL editor / table editor — no separate admin frontend).
-- `security_invoker = true` makes each view enforce RLS as the QUERYING role
-- (not the view owner), so — combined with there being no SELECT policy above
-- — anon/authenticated get zero rows from these views too, exactly like the
-- base table. Only an elevated role (service_role, postgres) can see them.
create or replace view public.analytics_daily_active_users
with (security_invoker = true) as
select date_trunc('day', created_at)::date as day, count(distinct client_id) as dau
from public.analytics_events
where event_name = 'session_start'
group by 1
order by 1;

create or replace view public.analytics_session_lengths
with (security_invoker = true) as
select
  date_trunc('day', created_at)::date as day,
  count(*) as sessions,
  avg((payload->>'durationMs')::numeric) as avg_duration_ms,
  avg((payload->>'turnsThisSession')::numeric) as avg_turns_per_session
from public.analytics_events
where event_name = 'session_end'
group by 1
order by 1;

-- Rough D1/D7/D30 retention cohorts, grouped by each client's first-seen day.
create or replace view public.analytics_retention_cohorts
with (security_invoker = true) as
with first_seen as (
  select client_id, min(date_trunc('day', created_at))::date as first_day
  from public.analytics_events
  where event_name = 'session_start'
  group by client_id
),
active_days as (
  select distinct client_id, date_trunc('day', created_at)::date as active_day
  from public.analytics_events
  where event_name = 'session_start'
)
select
  fs.first_day,
  count(distinct fs.client_id) as cohort_size,
  count(distinct case when ad.active_day = fs.first_day + 1 then fs.client_id end) as d1_returned,
  count(distinct case when ad.active_day = fs.first_day + 7 then fs.client_id end) as d7_returned,
  count(distinct case when ad.active_day = fs.first_day + 30 then fs.client_id end) as d30_returned
from first_seen fs
left join active_days ad on ad.client_id = fs.client_id
group by fs.first_day
order by fs.first_day;

create or replace view public.analytics_achievement_unlock_rates
with (security_invoker = true) as
select
  payload->>'id' as achievement_id,
  payload->>'category' as category,
  count(*) as unlock_count,
  count(distinct client_id) as unique_players,
  avg((payload->>'points')::numeric) as points
from public.analytics_events
where event_name = 'achievement_unlocked'
group by 1, 2
order by unlock_count desc;

create or replace view public.analytics_campaign_outcomes
with (security_invoker = true) as
select
  payload->>'faction' as faction,
  payload->>'winCondition' as win_condition,
  (payload->>'won')::boolean as won,
  count(*) as games,
  avg((payload->>'turn')::numeric) as avg_turn
from public.analytics_events
where event_name = 'game_over'
group by 1, 2, 3
order by games desc;

create or replace view public.analytics_battle_balance
with (security_invoker = true) as
select
  (payload->>'isAttacker')::boolean as is_attacker,
  (payload->>'won')::boolean as won,
  count(*) as battles,
  avg((payload->>'unitsLost')::numeric) as avg_units_lost
from public.analytics_events
where event_name = 'battle_outcome'
group by 1, 2
order by battles desc;

create or replace view public.analytics_feature_usage
with (security_invoker = true) as
select event_name, count(*) as occurrences, count(distinct client_id) as unique_players
from public.analytics_events
where event_name in (
  'treaty_proposed', 'treaty_broken', 'war_declared', 'card_played',
  'building_constructed', 'army_recruited'
)
group by event_name
order by occurrences desc;

-- Economy health: per-session, per-turn treasury delta derived from
-- progression_snapshot via a window function (see types.ts docstring — there
-- is deliberately no separate "resource collected" event per tick). A large
-- negative average delta flags overspending/inflation; a large positive one
-- flags an under-used gold sink (economy bottleneck).
create or replace view public.analytics_economy_health
with (security_invoker = true) as
with snapshots as (
  select
    session_id,
    (payload->>'turn')::int as turn,
    (payload->>'treasury')::numeric as treasury,
    payload->>'faction' as faction,
    payload->>'difficulty' as difficulty
  from public.analytics_events
  where event_name = 'progression_snapshot'
), deltas as (
  select
    session_id,
    faction,
    difficulty,
    turn,
    treasury,
    treasury - lag(treasury) over (partition by session_id order by turn) as treasury_delta
  from snapshots
)
select
  faction,
  difficulty,
  turn,
  avg(treasury) as avg_treasury,
  avg(treasury_delta) as avg_treasury_delta
from deltas
group by faction, difficulty, turn
order by faction, difficulty, turn;

-- Defense in depth: explicitly strip any grant anon/authenticated might have
-- picked up from schema-level default privileges, even though
-- security_invoker + the base table's RLS already deny them all rows.
revoke all on public.analytics_daily_active_users from anon, authenticated;
revoke all on public.analytics_session_lengths from anon, authenticated;
revoke all on public.analytics_retention_cohorts from anon, authenticated;
revoke all on public.analytics_achievement_unlock_rates from anon, authenticated;
revoke all on public.analytics_campaign_outcomes from anon, authenticated;
revoke all on public.analytics_battle_balance from anon, authenticated;
revoke all on public.analytics_feature_usage from anon, authenticated;
revoke all on public.analytics_economy_health from anon, authenticated;


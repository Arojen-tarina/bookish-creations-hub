-- Arojen Tarinat: Premium subscription records, written only by the Edge Functions
-- verify-premium (called by the app after a purchase) and play-notifications
-- (Google Play real-time developer notifications). Safe to run more than once.

create table if not exists public.premium_subscriptions (
  purchase_token      text primary key,
  package_name        text not null,
  product_id          text not null,
  base_plan_id        text,
  -- Google's subscriptionState without the prefix: ACTIVE, CANCELED, IN_GRACE_PERIOD,
  -- ON_HOLD, PAUSED, EXPIRED, PENDING, PENDING_PURCHASE_CANCELED.
  state               text not null,
  active              boolean not null,
  expiry_time         timestamptz,
  auto_renewing       boolean,
  latest_order_id     text,
  linked_token        text,
  region_code         text,
  test_purchase       boolean not null default false,
  acknowledged        boolean not null default false,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists premium_subscriptions_active_idx
  on public.premium_subscriptions (active, expiry_time);

-- Only the service role (inside the Edge Functions) reads or writes. No policies means
-- the anon and authenticated keys see nothing.
alter table public.premium_subscriptions enable row level security;

-- Dashboard view for the owner: subscribers right now and over time.
create or replace view public.premium_summary
with (security_invoker = true) as
select
  count(*) filter (where active and not test_purchase)            as active_subscribers,
  count(*) filter (where active and test_purchase)                as active_test_subscribers,
  count(*) filter (where not active and not test_purchase)        as ended_subscriptions,
  count(*) filter (where state = 'IN_GRACE_PERIOD')               as in_grace_period,
  count(*) filter (where state = 'ON_HOLD')                       as on_hold,
  min(created_at)                                                 as first_purchase,
  max(updated_at)                                                 as last_update
from public.premium_subscriptions;

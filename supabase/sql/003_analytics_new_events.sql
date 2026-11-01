-- Arojen Tarinat 2.0: two new analytics events (daily challenge results, Premium purchases).
-- Run BEFORE releasing the new app version: the app sends these names, and the old
-- constraint would make the database refuse whole batches that contain them.
alter table public.analytics_events drop constraint if exists analytics_events_event_name_check;
alter table public.analytics_events add constraint analytics_events_event_name_check check (event_name = any (array[
  'session_start', 'session_end', 'onboarding_step', 'game_start', 'game_over', 'campaign_restart',
  'game_saved', 'game_loaded', 'progression_snapshot', 'battle_outcome', 'building_constructed',
  'army_recruited', 'card_played', 'treaty_proposed', 'treaty_broken', 'war_declared',
  'achievement_unlocked', 'menu_interaction', 'settings_changed', 'experiment_assigned',
  'daily_challenge', 'premium_purchased'
]));

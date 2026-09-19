/**
 * types.ts — Analytiikkatapahtumien taksonomia
 *
 * Yksi paikka joka listaa KAIKKI tapahtumat joita peli voi lähettää, ja
 * niiden tarkat payload-tyypit. Uusi tapahtuma = uusi rivi tähän unioniin +
 * vastaava kenttä `AnalyticsEventPayloadMap`:iin — `track()` on täysin
 * tyypitetty, väärä payload-muoto on TS-käännösvirhe eikä runtime-bugi.
 *
 * Miksi nämä tapahtumat: jokainen vastaa yhtä tai useampaa liiketoiminta-
 * kysymystä (ks. ANALYTICS-STRATEGY.md):
 *  - session_*        → session length, D1/D7/D30, engagement
 *  - game_start/over   → campaign completion rate, progression, churn
 *  - progression_snapshot → difficulty spikes, drop-off points, balance
 *  - battle_outcome    → combat balance, frustrating mechanics
 *  - building_constructed / army_recruited / progression_snapshot → economy
 *    (treasury is sampled every turn in progression_snapshot; per-turn income/
 *    spend deltas are derived server-side with SQL window functions instead
 *    of a dedicated event per tick — see ANALYTICS-STRATEGY.md)
 *  - treaty_* / card_played → which systems (diplomacy/tech) are used or ignored
 *  - achievement_unlocked → unlock rate, time-to-unlock, rarity
 *  - onboarding_step    → tutorial/first-session funnel (no formal tutorial exists;
 *                         this models the de-facto onboarding funnel instead)
 *  - menu_interaction / settings_changed → UI/UX friction, feature discovery
 *  - experiment_assigned / experiment_exposed → A/B testing
 */

export type Difficulty = 'easy' | 'normal' | 'hard';

export interface AnalyticsEventPayloadMap {
  // ---- Session & retention ----
  session_start: { clientId: string; sessionId: string; daysSinceFirstOpen: number; isNewPlayer: boolean };
  session_end: { sessionId: string; durationMs: number; turnsThisSession: number };

  // ---- Onboarding / funnel (proxy for "tutorial completion") ----
  onboarding_step: { step: 'faction_select_viewed' | 'faction_chosen' | 'turn_1_completed' | 'turn_5_completed' | 'first_battle' | 'first_building' };

  // ---- Campaign lifecycle ----
  game_start: { faction: string; difficulty: Difficulty; isContinue: boolean };
  game_over: { faction: string; won: boolean; winCondition: string | null; turn: number; year: number; sessionTurns: number };
  campaign_restart: { faction: string | null; turnAtRestart: number; midGame: boolean };
  game_saved: { slot: number | 'auto' };
  game_loaded: { slot: number | 'auto' };

  // ---- Progression / difficulty signal (sampled once per turn, cheap) ----
  progression_snapshot: {
    turn: number; faction: string; difficulty: Difficulty;
    provincesOwned: number; treasury: number; armiesOwned: number; buildingsOwned: number;
  };

  // ---- Combat ----
  battle_outcome: {
    faction: string; won: boolean; isAttacker: boolean; turn: number;
    attackerPower: number; defenderPower: number; unitsLost: number;
  };

  // ---- Economy / nation-building ----
  building_constructed: { type: string; turn: number; goldCost: number };
  army_recruited: { type: string; turn: number };

  // ---- Technology / cards (player choices) ----
  card_played: { cardId: string; cardType: string; rarity: string; turn: number };

  // ---- Diplomacy ----
  treaty_proposed: { targetFaction: string; treatyType: string; turn: number };
  treaty_broken: { targetFaction: string; treatyType: string; turn: number };
  war_declared: { targetFaction: string; turn: number };

  // ---- Achievements ----
  achievement_unlocked: { id: string; category: string; difficulty: string; points: number; sessionsSinceFirstOpen: number };

  // ---- UI / menu interactions ----
  menu_interaction: { target: string };
  settings_changed: { setting: string; value: string };

  // ---- A/B testing ----
  experiment_assigned: { experimentKey: string; variant: string };
}

export type AnalyticsEventName = keyof AnalyticsEventPayloadMap;

export interface StoredAnalyticsEvent<K extends AnalyticsEventName = AnalyticsEventName> {
  name: K;
  payload: AnalyticsEventPayloadMap[K];
  clientId: string;
  sessionId: string;
  at: number; // epoch ms
  appVersion: string;
}

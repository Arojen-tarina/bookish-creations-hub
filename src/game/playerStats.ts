/**
 * playerStats.ts — Pysyvät, koko elinkaaren pelaajatilastot
 *
 * Toisin kuin yhden pelin gameState, nämä tilastot elävät localStoragessa
 * pelisessioiden yli ja syöttävät saavutusten kynnysarvoja
 * (achievementDefinitions.ts) sekä analytiikkavalmiita mittareita
 * (AchievementsPanel.tsx). Ei natiivia Capacitor-riippuvuutta —
 * localStorage toimii myös Android-WebViewissä.
 *
 * Tallennus kulkee secureStorage.ts:n läpi (checksum + versio): jos tallenne
 * on väärennetty tai vioittunut, se hylätään ja nollataan turvallisiin
 * oletuksiin sen sijaan että väärennettyyn dataan luotettaisiin — saavutukset
 * ja pisteet ovat pelaajan luotettavuussignaali, joten niistä ei tingitä.
 */
import { createDefaultPlayerStats, type PlayerStats } from './achievementTypes.ts';
import { readSecure, writeSecure } from '@/lib/secureStorage.ts';
import { logSecurityEvent } from '@/lib/securityLog.ts';

const STORAGE_KEY = 'arojen_tarinat_player_stats_v1';
const STATS_VERSION = 1;

/** Fired whenever stats change, so open UI (AchievementsPanel) can refresh. */
export const PLAYER_STATS_UPDATED_EVENT = 'player-stats:updated';

// Counters that are legitimately allowed to decrease (in-progress streaks that reset to 0).
const RESETTABLE_NUMERIC_KEYS = new Set<keyof PlayerStats>(['currentWinStreakBattles', 'currentGameWinStreak']);

const isPlayerStatsShape = (value: unknown): value is PlayerStats => {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.gamesPlayed === 'number' && typeof v.battlesWon === 'number' &&
    Array.isArray(v.buildingTypesBuilt) && Array.isArray(v.uniqueCardIdsPlayed) &&
    typeof v.victoriesByFaction === 'object' && v.victoriesByFaction !== null;
};

/**
 * Rejects a proposed update where a monotonic (should-only-grow) numeric
 * stat would decrease — this doesn't stop a determined localStorage editor
 * (checksums are recomputable client-side, see secureStorage.ts), but it
 * catches corruption/bugs and raises the bar above naive edits.
 */
const guardMonotonic = (current: PlayerStats, next: PlayerStats): PlayerStats => {
  const guarded = { ...next };
  for (const key of Object.keys(current) as (keyof PlayerStats)[]) {
    if (RESETTABLE_NUMERIC_KEYS.has(key)) continue;
    const before = current[key];
    const after = guarded[key];
    if (typeof before === 'number' && typeof after === 'number' && after < before) {
      logSecurityEvent('stat_anomaly', { key, before, after });
      (guarded as Record<string, unknown>)[key] = before;
    }
  }
  return guarded;
};

const read = (): PlayerStats => {
  const result = readSecure(STORAGE_KEY, isPlayerStatsShape);
  if (result.status === 'ok') return { ...createDefaultPlayerStats(), ...result.data };
  if (result.status !== 'missing') {
    // Tampered/corrupt/invalid — never trust it. Reset to safe defaults.
    writeSecure(STORAGE_KEY, STATS_VERSION, createDefaultPlayerStats());
  }
  return createDefaultPlayerStats();
};

const write = (stats: PlayerStats) => {
  writeSecure(STORAGE_KEY, STATS_VERSION, stats);
  window.dispatchEvent(new Event(PLAYER_STATS_UPDATED_EVENT));
};

export const getPlayerStats = (): PlayerStats => read();

/** Applies a partial update (merge) and persists it. Returns the new stats. */
export const updatePlayerStats = (patch: Partial<PlayerStats> | ((current: PlayerStats) => Partial<PlayerStats>)): PlayerStats => {
  const current = read();
  const delta = typeof patch === 'function' ? patch(current) : patch;
  const next = guardMonotonic(current, { ...current, ...delta });
  write(next);
  return next;
};

/** Adds a unique string into an array-valued stat (e.g. building types built, cards played) without duplicates. */
export const addUniqueToStat = (stats: PlayerStats, key: 'buildingTypesBuilt' | 'uniqueCardIdsPlayed', value: string): string[] => {
  const list = stats[key];
  return list.includes(value) ? list : [...list, value];
};

/** Resets all lifetime stats. Used only by an explicit player-facing "reset progress" action. */
export const resetPlayerStats = (): PlayerStats => {
  const fresh = createDefaultPlayerStats();
  write(fresh);
  return fresh;
};

/**
 * playerStats.ts — Pysyvät, koko elinkaaren pelaajatilastot
 *
 * Toisin kuin yhden pelin gameState, nämä tilastot elävät localStoragessa
 * pelisessioiden yli ja syöttävät saavutusten kynnysarvoja
 * (achievementDefinitions.ts) sekä analytiikkavalmiita mittareita
 * (AchievementsPanel.tsx). Ei natiivia Capacitor-riippuvuutta —
 * localStorage toimii myös Android-WebViewissä.
 */
import { createDefaultPlayerStats, type PlayerStats } from './achievementTypes.ts';

const STORAGE_KEY = 'arojen_tarinat_player_stats_v1';

/** Fired whenever stats change, so open UI (AchievementsPanel) can refresh. */
export const PLAYER_STATS_UPDATED_EVENT = 'player-stats:updated';

const read = (): PlayerStats => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultPlayerStats();
    return { ...createDefaultPlayerStats(), ...JSON.parse(raw) };
  } catch {
    return createDefaultPlayerStats();
  }
};

const write = (stats: PlayerStats) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Storage unavailable (private mode/quota) — stats just won't persist.
  }
  window.dispatchEvent(new Event(PLAYER_STATS_UPDATED_EVENT));
};

export const getPlayerStats = (): PlayerStats => read();

/** Applies a partial update (merge) and persists it. Returns the new stats. */
export const updatePlayerStats = (patch: Partial<PlayerStats> | ((current: PlayerStats) => Partial<PlayerStats>)): PlayerStats => {
  const current = read();
  const delta = typeof patch === 'function' ? patch(current) : patch;
  const next = { ...current, ...delta };
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

import { ACHIEVEMENTS } from '../game/achievements/achievementCatalog';
import type { AchievementDef, PlayerStats } from '../game/achievements/achievementModel';
import { newPlayerStats } from '../game/achievements/achievementModel';
import { StatsTracker } from '../game/achievements/statsTracker';
import { createStore, type Store } from '../lib/store';
import { logSecurityEvent } from '../lib/securityLog';
import { readSecure, writeSecure } from '../lib/secureStorage';

const STATS_KEY = 'arojen_player_stats';
const UNLOCKS_KEY = 'arojen_achievement_unlocks';
const EMPTY_STATS = newPlayerStats();
const NUMBER_FIELDS: (keyof PlayerStats)[] = ['gamesPlayed','gamesWon','totalTurnsPlayed','distinctPlayDays','loginStreak','battlesWon','battlesLost','perfectBattlesWon','currentWinStreakBattles','longestWinStreakBattles','provincesCaptured','provincesLost','capitalsCaptured','maxProvincesOwnedInRun','regionsControlledPeak','goldEarnedTotal','peakTreasury','silkRoadHubsPeak','buildingsBuilt','wondersBuilt','cardsPlayedTotal','techCardsPlayedTotal','legendaryCardsPlayed','alliancesFormed','warsDeclared','treatiesSigned','unitsRecruited','militaryVictories','economicVictories','technologyVictories','diplomaticVictories','culturalVictories','hardDifficultyWins','currentGameWinStreak','longestGameWinStreak'];
const isStats = (value: unknown): value is PlayerStats => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  if (!NUMBER_FIELDS.every(key => Number.isSafeInteger(record[key]) && (record[key] as number) >= 0)) return false;
  if (!(record.fastestVictoryTurn === null || (Number.isSafeInteger(record.fastestVictoryTurn) && (record.fastestVictoryTurn as number) >= 1))) return false;
  if (!(record.lastPlayedDate === null || (typeof record.lastPlayedDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(record.lastPlayedDate)))) return false;
  if (!Array.isArray(record.buildingTypesBuilt) || record.buildingTypesBuilt.length > 100 || !record.buildingTypesBuilt.every(x => typeof x === 'string')) return false;
  if (!Array.isArray(record.uniqueCardIdsPlayed) || record.uniqueCardIdsPlayed.length > 1000 || !record.uniqueCardIdsPlayed.every(x => typeof x === 'string')) return false;
  if (!record.victoriesByFaction || typeof record.victoriesByFaction !== 'object' || Array.isArray(record.victoriesByFaction)) return false;
  return Object.entries(record.victoriesByFaction).every(([id, count]) => ['mongol','jin','song','xixia','khwarezm','rus','kipchak'].includes(id) && Number.isSafeInteger(count) && (count as number) >= 0);
};
const isUnlocks = (value: unknown): value is Record<string, number> => !!value && typeof value === 'object' && !Array.isArray(value) && Object.entries(value).every(([id, at]) => typeof id === 'string' && Number.isSafeInteger(at) && at > 0 && at <= Date.now());
const serialiseStats = (stats: PlayerStats): Record<string, unknown> => ({ ...stats, buildingTypesBuilt: [...stats.buildingTypesBuilt], uniqueCardIdsPlayed: [...stats.uniqueCardIdsPlayed] });
const restoreStats = (value: PlayerStats): PlayerStats => ({ ...value, buildingTypesBuilt: new Set(value.buildingTypesBuilt), uniqueCardIdsPlayed: new Set(value.uniqueCardIdsPlayed) });

export type NewlyUnlocked = { definition: AchievementDef; stats: PlayerStats };
/** Secure local persistence for earned achievement ids and lifetime statistics. */
export class AchievementRepository {
  readonly unlocked: Store<Record<string, number>> = createStore({});
  readonly stats: Store<PlayerStats> = createStore(EMPTY_STATS);
  readonly unannounced: Store<AchievementDef[]> = createStore<AchievementDef[]>([]);
  readonly newlyUnlocked: Store<NewlyUnlocked[]> = createStore<NewlyUnlocked[]>([]);
  private readonly known = new Set(ACHIEVEMENTS.map(def => def.id));

  load(): void {
    const unlocked = readSecure(UNLOCKS_KEY, isUnlocks, {});
    const statsValue = readSecure<PlayerStats | null>(STATS_KEY, (value): value is PlayerStats | null => value === null || isStats(value), null);
    this.unlocked.set(Object.fromEntries(Object.entries(unlocked).filter(([id, at]) => this.known.has(id) && at <= Date.now())));
    this.stats.set(statsValue ? restoreStats(statsValue) : EMPTY_STATS);
  }

  update(change: (stats: PlayerStats) => PlayerStats): void {
    const next = change(this.stats.get());
    if (!isStats(serialiseStats(next))) {
      logSecurityEvent('data_invalid', 'achievement_stats');
      return;
    }
    if (JSON.stringify(serialiseStats(next)) !== JSON.stringify(serialiseStats(this.stats.get()))) {
      this.stats.set(next);
      writeSecure(STATS_KEY, serialiseStats(next));
    }
    const unlocked = this.unlocked.get();
    const earned = StatsTracker.newlyMet(next, new Set(Object.keys(unlocked)));
    if (!earned.length) return;
    const at = Date.now();
    const merged = { ...unlocked };
    for (const def of earned) if (this.known.has(def.id) && !merged[def.id]) merged[def.id] = at;
    this.unlocked.set(merged);
    writeSecure(UNLOCKS_KEY, merged);
    this.unannounced.set([...this.unannounced.get(), ...earned]);
    this.newlyUnlocked.set([...this.newlyUnlocked.get(), ...earned.map(definition => ({ definition, stats: next }))]);
  }

  record(change: (stats: PlayerStats) => PlayerStats): void { this.update(change); }
  markAnnounced(definition: AchievementDef): void { this.unannounced.set(this.unannounced.get().filter(item => item.id !== definition.id)); }
  takeNewlyUnlocked(): NewlyUnlocked[] { const entries = this.newlyUnlocked.get(); this.newlyUnlocked.set([]); return entries; }

  importLegacy(stats: PlayerStats | null, imported: Record<string, number>): void {
    if (stats && JSON.stringify(serialiseStats(this.stats.get())) === JSON.stringify(serialiseStats(EMPTY_STATS))) {
      this.stats.set(restoreStats(stats));
      writeSecure(STATS_KEY, serialiseStats(stats));
    }
    const now = Date.now();
    const next = { ...this.unlocked.get() };
    for (const [id, at] of Object.entries(imported)) {
      if (this.known.has(id) && Number.isSafeInteger(at) && at > 0 && at <= now) next[id] = Math.min(next[id] ?? at, at);
    }
    this.unlocked.set(next);
    writeSecure(UNLOCKS_KEY, next);
  }
}

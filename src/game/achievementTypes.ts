/**
 * achievementTypes.ts — Saavutus- ja palkintojärjestelmän tyypit
 *
 * Yhteiset tyypit achievementDefinitions.ts:lle, achievements.ts:lle ja
 * UI:lle. Pitää järjestelmän datavetoisena: uusi saavutus = uusi rivi
 * ACHIEVEMENT_DEFINITIONS-taulukossa, ei uutta moottorikoodia.
 */
import type { Language } from '@/lib/i18n.tsx';
import type { FactionId } from '@/types/province.ts';

export type AchievementCategory =
  | 'tutorial'
  | 'early_game'
  | 'mid_game'
  | 'end_game'
  | 'hidden'
  | 'skill'
  | 'exploration'
  | 'collection'
  | 'challenge'
  | 'historical'
  | 'campaign'
  | 'daily_weekly'
  | 'lifetime';

export type AchievementDifficulty = 'trivial' | 'easy' | 'medium' | 'hard' | 'legendary';

export type RewardKind = 'badge' | 'title' | 'banner' | 'portrait' | 'unit_skin' | 'decoration';

/** A cosmetic/status reward granted on unlock, on top of achievement points. */
export interface AchievementReward {
  kind: RewardKind;
  /** Emoji or short icon token shown in the UI. */
  icon: string;
  name: Record<Language, string>;
}

/**
 * Lifetime, cross-playthrough player statistics. Persisted locally (see
 * playerStats.ts) and never reset by starting a new game — only by an
 * explicit "reset progress" action. This is the single source of truth
 * that every stat-threshold achievement checks against.
 */
export interface PlayerStats {
  // Lifetime meta
  gamesPlayed: number;
  gamesWon: number;
  totalTurnsPlayed: number;
  distinctPlayDays: number;
  loginStreak: number;
  lastPlayedDate: string | null; // YYYY-MM-DD

  // Combat
  battlesWon: number;
  battlesLost: number;
  perfectBattlesWon: number; // won without losing a single unit
  currentWinStreakBattles: number;
  longestWinStreakBattles: number;

  // Territory
  provincesCaptured: number;
  provincesLost: number;
  capitalsCaptured: number;
  maxProvincesOwnedInRun: number;
  regionsControlledPeak: number;

  // Economy
  goldEarnedTotal: number;
  peakTreasury: number;
  silkRoadHubsPeak: number;
  buildingsBuilt: number;
  buildingTypesBuilt: string[];
  wondersBuilt: number;

  // Cards / technology
  cardsPlayedTotal: number;
  techCardsPlayedTotal: number;
  uniqueCardIdsPlayed: string[];
  legendaryCardsPlayed: number;

  // Diplomacy
  alliancesFormed: number;
  warsDeclared: number;
  treatiesSigned: number;

  // Units
  unitsRecruited: number;

  // Victories
  militaryVictories: number;
  economicVictories: number;
  technologyVictories: number;
  diplomaticVictories: number;
  culturalVictories: number;
  victoriesByFaction: Partial<Record<FactionId, number>>;
  fastestVictoryTurn: number | null;
  hardDifficultyWins: number;
  currentGameWinStreak: number;
  longestGameWinStreak: number;
}

export const createDefaultPlayerStats = (): PlayerStats => ({
  gamesPlayed: 0,
  gamesWon: 0,
  totalTurnsPlayed: 0,
  distinctPlayDays: 0,
  loginStreak: 0,
  lastPlayedDate: null,

  battlesWon: 0,
  battlesLost: 0,
  perfectBattlesWon: 0,
  currentWinStreakBattles: 0,
  longestWinStreakBattles: 0,

  provincesCaptured: 0,
  provincesLost: 0,
  capitalsCaptured: 0,
  maxProvincesOwnedInRun: 0,
  regionsControlledPeak: 0,

  goldEarnedTotal: 0,
  peakTreasury: 0,
  silkRoadHubsPeak: 0,
  buildingsBuilt: 0,
  buildingTypesBuilt: [],
  wondersBuilt: 0,

  cardsPlayedTotal: 0,
  techCardsPlayedTotal: 0,
  uniqueCardIdsPlayed: [],
  legendaryCardsPlayed: 0,

  alliancesFormed: 0,
  warsDeclared: 0,
  treatiesSigned: 0,

  unitsRecruited: 0,

  militaryVictories: 0,
  economicVictories: 0,
  technologyVictories: 0,
  diplomaticVictories: 0,
  culturalVictories: 0,
  victoriesByFaction: {},
  fastestVictoryTurn: null,
  hardDifficultyWins: 0,
  currentGameWinStreak: 0,
  longestGameWinStreak: 0,
});

export interface AchievementProgress {
  current: number;
  target: number;
}

export interface AchievementDefinition {
  id: string;
  category: AchievementCategory;
  name: Record<Language, string>;
  description: Record<Language, string>;
  /** Shown instead of name/description while locked (category === 'hidden' or hidden: true). */
  hidden?: boolean;
  /** Small % of players expected to reach this — surfaced in the UI as a rarity cue. */
  legendary?: boolean;
  difficulty: AchievementDifficulty;
  /** Rough design-time estimate of the share of players who will unlock this (0-1). Analytics reference point, not a guarantee. */
  estimatedUnlockRate: number;
  points: number;
  reward?: AchievementReward;
  check: (stats: PlayerStats) => boolean;
  /** Optional numeric progress for the UI progress bar (threshold-style achievements). */
  progress?: (stats: PlayerStats) => AchievementProgress;
}

export interface Achievement extends AchievementDefinition {
  unlocked: boolean;
  unlockedAt: number | null;
}

/** Helper for the common "stat reaches at least N" shape — covers most achievements. */
export const atLeast = (
  key: keyof PlayerStats,
  target: number,
): Pick<AchievementDefinition, 'check' | 'progress'> => ({
  check: (s) => (s[key] as number) >= target,
  progress: (s) => ({ current: Math.min(s[key] as number, target), target }),
});

/** Helper for "stat is at most N" (e.g. fastest victory turn — lower is better). */
export const atMost = (
  key: keyof PlayerStats,
  target: number,
): Pick<AchievementDefinition, 'check'> => ({
  check: (s) => {
    const value = s[key] as number | null;
    return value !== null && value <= target;
  },
});

/** Helper for "has built/played/won at least N distinct items" (array-valued stats). */
export const atLeastUnique = (
  key: keyof PlayerStats,
  target: number,
): Pick<AchievementDefinition, 'check' | 'progress'> => ({
  check: (s) => (s[key] as string[]).length >= target,
  progress: (s) => ({ current: Math.min((s[key] as string[]).length, target), target }),
});

export const RANK_TITLES: { level: number; title: Record<Language, string> }[] = [
  { level: 1, title: { fi: 'Heimon poika', en: 'Tribesman' } },
  { level: 3, title: { fi: 'Ratsumies', en: 'Rider' } },
  { level: 5, title: { fi: 'Sotapäällikkö', en: 'Warlord' } },
  { level: 8, title: { fi: 'Nooni', en: 'Noyan' } },
  { level: 12, title: { fi: 'Käskynhaltija', en: 'Governor' } },
  { level: 16, title: { fi: 'Suurkhaanin neuvonantaja', en: "Advisor to the Great Khan" } },
  { level: 20, title: { fi: 'Valtakunnan rakentaja', en: 'Empire Builder' } },
  { level: 25, title: { fi: 'Suurkhaani', en: 'Great Khan' } },
  { level: 30, title: { fi: 'Legenda', en: 'Legend' } },
];

/** Points needed to reach a given level; deliberately gentle early, steeper later (avoids reward inflation). */
export const pointsForLevel = (level: number): number => 50 * level * (level - 1);

export const getPlayerLevel = (totalPoints: number): number => {
  let level = 1;
  while (totalPoints >= pointsForLevel(level + 1)) level++;
  return level;
};

export const getRankTitle = (level: number): Record<Language, string> => {
  let title = RANK_TITLES[0].title;
  for (const rank of RANK_TITLES) {
    if (level >= rank.level) title = rank.title;
  }
  return title;
};

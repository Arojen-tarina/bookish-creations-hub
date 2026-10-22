import type { FactionId } from '../model/enums';
import type { Faction } from '../model/models';

export const ACTIVE_FACTIONS: FactionId[] = ['mongol', 'song', 'rus', 'khwarezm'];
export const VictoryTargets = { PROVINCES: 130, GOLD: 2000, TECH: 5, TREASURY_STREAK: 5, DIPLOMATIC_MIN_ALLIES: 2, INFLUENCE: 100, PRESTIGE: 60 } as const;
export const Rules = { WONDER_MAX: 3, FORT_MAX_DURABILITY: 100, FORT_MAX_LEVEL: 3, START_YEAR: 1206, STARTING_HAND: 5, STARTING_FOOD: 10, STARTING_ARTISANS: 3, ARMY_MOVEMENT: 3, REPAIR_FORT_GOLD: 10, REPAIR_FORT_ARTISANS: 1, INFANTRY_GOLD: 10, INFANTRY_FOOD: 5, CAVALRY_GOLD: 20, CAVALRY_HORSES: 5, CAVALRY_FOOD: 10 } as const;
export const FACTION_DATA_1206: Record<FactionId, Faction> = {
  'mongol': { id: 'mongol', capitalId: 'karakorum', personality: 'aggressive', treasury: 50, manpower: 80, horses: 100, cavalryBonus: 0.3, taxBonus: 0.0, siegeBonus: 0.2, isPlayer: false },
  'jin': { id: 'jin', capitalId: 'zhongdu', personality: 'defensive', treasury: 150, manpower: 200, horses: 30, cavalryBonus: 0.0, taxBonus: 0.2, siegeBonus: 0.0, isPlayer: false },
  'song': { id: 'song', capitalId: 'hangzhou', personality: 'trader', treasury: 200, manpower: 150, horses: 20, cavalryBonus: -0.1, taxBonus: 0.3, siegeBonus: -0.1, isPlayer: false },
  'xixia': { id: 'xixia', capitalId: 'xingqing', personality: 'cautious', treasury: 60, manpower: 60, horses: 40, cavalryBonus: 0.1, taxBonus: 0.1, siegeBonus: 0.0, isPlayer: false },
  'khwarezm': { id: 'khwarezm', capitalId: 'samarkand', personality: 'expansionist', treasury: 120, manpower: 100, horses: 50, cavalryBonus: 0.1, taxBonus: 0.2, siegeBonus: 0.1, isPlayer: false },
  'rus': { id: 'rus', capitalId: 'novgorod', personality: 'defensive', treasury: 80, manpower: 80, horses: 25, cavalryBonus: 0.0, taxBonus: 0.1, siegeBonus: 0.1, isPlayer: false },
  'kipchak': { id: 'kipchak', capitalId: 'sarkel', personality: 'aggressive', treasury: 30, manpower: 50, horses: 70, cavalryBonus: 0.2, taxBonus: -0.1, siegeBonus: -0.1, isPlayer: false }
};

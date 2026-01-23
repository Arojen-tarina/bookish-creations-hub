// Game Types for Mongolien Valtakunta Digital Game

export type FactionId = 'mongol' | 'china' | 'persia' | 'russia';

export type TerrainType = 'steppe' | 'mountain' | 'forest' | 'desert' | 'river' | 'city';

export type ResourceType = 'horses' | 'gold' | 'food' | 'artisans' | 'cattle';

export type UnitType = 'cavalry' | 'infantry' | 'leader';

export type GamePhase = 'planning' | 'action' | 'management' | 'event';

export type ActionType = 'move' | 'attack' | 'build' | 'trade';

export interface Faction {
  id: FactionId;
  name: string;
  color: string;
  bonus: string;
  bonusDescription: string;
}

export interface Unit {
  id: string;
  type: UnitType;
  factionId: FactionId;
  hexId: string;
  health: number;
  maxHealth: number;
  movementLeft: number;
  maxMovement: number;
  attackPower: number;
}

export interface HexTile {
  id: string;
  q: number; // axial coordinate
  r: number; // axial coordinate
  terrain: TerrainType;
  regionName: string;
  ownerId: FactionId | null;
  units: string[]; // unit IDs
  hasCity: boolean;
  hasFortress: boolean;
  hasTradeRoute: boolean;
  resourceProduction: Partial<Record<ResourceType, number>>;
}

export interface Resources {
  horses: number;
  gold: number;
  food: number;
  artisans: number;
  cattle: number;
}

export interface Player {
  id: string;
  factionId: FactionId;
  resources: Resources;
  victoryPoints: number;
  territoriesControlled: number;
  citiesControlled: number;
  tradeRoutes: number;
  technologies: string[];
  isAI: boolean;
}

export interface GameState {
  players: Player[];
  currentPlayerId: string;
  currentPhase: GamePhase;
  turn: number;
  hexes: HexTile[];
  units: Unit[];
  selectedUnitId: string | null;
  selectedHexId: string | null;
  availableMoves: string[]; // hex IDs that can be moved to
  combatLog: CombatLogEntry[];
  gameOver: boolean;
  winnerId: string | null;
  winCondition: string | null;
}

export interface CombatLogEntry {
  id: string;
  turn: number;
  attackerId: FactionId;
  defenderId: FactionId;
  attackerUnits: number;
  defenderUnits: number;
  attackerRolls: number[];
  defenderRolls: number[];
  attackerLosses: number;
  defenderLosses: number;
  hexId: string;
  result: 'attacker_wins' | 'defender_wins' | 'draw';
}

export const FACTIONS: Record<FactionId, Faction> = {
  mongol: {
    id: 'mongol',
    name: 'Mongoli-heimo',
    color: '#f59e0b', // amber-500
    bonus: 'Ratsuväen bonus',
    bonusDescription: 'Ratsuväki liikkuu +1 ylimääräisen alueen ja saa +1 hyökkäysbonuksen stepillä',
  },
  china: {
    id: 'china',
    name: 'Kiinan dynastia',
    color: '#ef4444', // red-500
    bonus: 'Linnoitusbonus',
    bonusDescription: 'Linnoitukset maksavat -2 kultaa ja antavat +2 puolustusta',
  },
  persia: {
    id: 'persia',
    name: 'Persialainen valtakunta',
    color: '#3b82f6', // blue-500
    bonus: 'Kauppabonus',
    bonusDescription: 'Kauppareitit tuottavat +2 kultaa ja +1 käsityöläisiä',
  },
  russia: {
    id: 'russia',
    name: 'Venäläiset ruhtinaskunnat',
    color: '#22c55e', // green-500
    bonus: 'Talvisotataktiikat',
    bonusDescription: 'Metsässä +2 puolustus ja jalkaväki liikkuu +1 metsässä',
  },
};

export const TERRAIN_INFO: Record<TerrainType, { name: string; emoji: string; movementCost: number; defenseBonus: number }> = {
  steppe: { name: 'Steppi', emoji: '🌾', movementCost: 1, defenseBonus: 0 },
  mountain: { name: 'Vuoristo', emoji: '⛰️', movementCost: 3, defenseBonus: 2 },
  forest: { name: 'Metsä', emoji: '🌲', movementCost: 2, defenseBonus: 1 },
  desert: { name: 'Autiomaa', emoji: '🏜️', movementCost: 2, defenseBonus: 0 },
  river: { name: 'Jokilaakso', emoji: '🏞️', movementCost: 1, defenseBonus: 0 },
  city: { name: 'Kaupunki', emoji: '🏰', movementCost: 1, defenseBonus: 3 },
};

export const UNIT_INFO: Record<UnitType, { name: string; emoji: string; basePower: number; baseMovement: number; cost: Resources }> = {
  cavalry: { 
    name: 'Ratsuväki', 
    emoji: '🐎', 
    basePower: 3, 
    baseMovement: 3, 
    cost: { horses: 2, gold: 1, food: 1, artisans: 0, cattle: 0 } 
  },
  infantry: { 
    name: 'Jalkaväki', 
    emoji: '⚔️', 
    basePower: 2, 
    baseMovement: 2, 
    cost: { horses: 0, gold: 1, food: 2, artisans: 0, cattle: 0 } 
  },
  leader: { 
    name: 'Heimopäällikkö', 
    emoji: '👑', 
    basePower: 4, 
    baseMovement: 2, 
    cost: { horses: 0, gold: 0, food: 0, artisans: 0, cattle: 0 } 
  },
};

export const RESOURCE_INFO: Record<ResourceType, { name: string; emoji: string }> = {
  horses: { name: 'Hevoset', emoji: '🐎' },
  gold: { name: 'Kulta', emoji: '🪙' },
  food: { name: 'Ruoka', emoji: '🌾' },
  artisans: { name: 'Käsityöläiset', emoji: '🛠️' },
  cattle: { name: 'Karja', emoji: '🐄' },
};

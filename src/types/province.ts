/**
 * province.ts — Provinssipohjaisen pelin tyypit ja vakiot
 *
 * Sisältää: Province, Faction, Army, DiplomaticRelation, ProvinceGameState,
 * FACTION_DATA_1206, PROVINCE_TERRAIN_INFO, TRADE_GOODS_INFO jne.
 * Käytetään ProvinceGame-versiossa (vuosi 1206 -aloitus).
 */
// Province-based map types for Mongolian Empire 1206 start

export interface Province {
  id: string;
  name: string;
  nameLocal?: string; // Native name
  region: RegionId;
  ownerId: FactionId | null;
  
  // Geography
  terrain: ProvinceTerrain;
  isCoastal: boolean;
  isCapital: boolean;
  neighbors: string[]; // Adjacent province IDs
  
  // Resources & Economy
  baseTax: number;
  baseManpower: number;
  supply: number;
  tradeGood?: TradeGood;
  hasSilkRoad: boolean;
  
  // State
  unrest: number; // 0-100
  fortLevel: number; // 0-3
  developmentLevel: number; // 1-5
  buildings: ProvinceBuilding[];
  
  // Military
  garrison: number;
  occupiedBy?: FactionId;
  siegeProgress?: number;
  
  // Visual
  color?: string; // For map rendering
  center: { x: number; y: number }; // Center point for labels
}

export type ProvinceTerrain = 
  | 'steppe'
  | 'grassland' 
  | 'forest'
  | 'mountain'
  | 'desert'
  | 'taiga'
  | 'tundra'
  | 'farmland'
  | 'hills'
  | 'marsh';

export type TradeGood = 
  | 'horses'
  | 'silk'
  | 'spices'
  | 'gold'
  | 'iron'
  | 'fur'
  | 'grain'
  | 'salt'
  | 'livestock'
  | 'gems';

export type RegionId = 
  | 'mongolia'
  | 'manchuria'
  | 'jin_china'
  | 'song_china'
  | 'xixia'
  | 'tibet'
  | 'khwarezm'
  | 'persia'
  | 'khorasan'
  | 'transoxiana'
  | 'kipchak'
  | 'rus'
  | 'caucasus'
  | 'siberia'
  | 'korea'
  | 'central_asia';

export type FactionId = 'mongol' | 'jin' | 'song' | 'xixia' | 'khwarezm' | 'rus' | 'kipchak';

export interface ProvinceBuilding {
  type: ProvinceBuildingType;
  level: number;
}

export type ProvinceBuildingType = 
  | 'fortress'
  | 'market'
  | 'stable'
  | 'temple'
  | 'workshop'
  | 'granary';

// Faction data for 1206 start
export interface Faction {
  id: FactionId;
  name: string;
  ruler: string;
  color: string;
  capitalId: string;
  personality: FactionPersonality;
  
  // Resources
  treasury: number;
  manpower: number;
  horses: number;
  
  // Modifiers
  cavalryBonus: number;
  taxBonus: number;
  siegeBonus: number;
  
  // AI
  isPlayer: boolean;
}

export type FactionPersonality = 
  | 'aggressive'
  | 'defensive'
  | 'trader'
  | 'expansionist'
  | 'cautious';

// Diplomacy
export interface DiplomaticRelation {
  factionA: FactionId;
  factionB: FactionId;
  relation: number; // -100 to 100
  trust: number; // 0 to 100
  threat: number; // 0 to 100
  treaties: Treaty[];
  borderFriction: number; // 0 to 100
  claims: string[]; // Province IDs that A claims from B
}

export type TreatyType = 
  | 'non_aggression'
  | 'trade_agreement'
  | 'alliance'
  | 'truce'
  | 'tributary'
  | 'peace';

export interface Treaty {
  type: TreatyType;
  startTurn: number;
  duration: number; // -1 for permanent
  terms?: string;
}

// Save System
export interface SaveMetadata {
  id: string;
  slotNumber: number;
  name: string;
  timestamp: number;
  turn: number;
  playerFaction: FactionId;
  provincesControlled: number;
  version: string;
  isAutosave: boolean;
}

export interface SaveData {
  metadata: SaveMetadata;
  state: ProvinceGameState;
}

export interface ProvinceGameState {
  // Core
  turn: number;
  year: number; // 1206 start
  currentPlayerId: FactionId;
  phase: GamePhase;
  
  // Map
  provinces: Province[];
  factions: Faction[];
  relations: DiplomaticRelation[];
  
  // Units
  armies: Army[];
  
  // Events
  activeEvents: ActiveGameEvent[];
  eventDeck: GameEvent[];
  
  // UI State
  selectedProvinceId: string | null;
  selectedArmyId: string | null;
  
  // Victory
  gameOver: boolean;
  winnerId: FactionId | null;
  
  // Settings
  gameSpeed: 'slow' | 'normal' | 'fast';
  difficulty: 'easy' | 'normal' | 'hard';
}

export type GamePhase = 
  | 'planning'
  | 'military'
  | 'diplomacy'
  | 'economy'
  | 'event';

export interface Army {
  id: string;
  ownerId: FactionId;
  provinceId: string;
  
  // Composition
  cavalry: number;
  infantry: number;
  siege: number;
  
  // State
  morale: number; // 0-100
  supply: number; // Days of supply
  movementLeft: number;
  
  // Leader
  leaderId?: string;
  leaderBonus: number;
}

export interface GameEvent {
  id: string;
  type: GameEventType;
  name: string;
  description: string;
  effect: string;
  duration: number;
  weight: number; // Probability weight
  conditions?: EventCondition[];
  choices?: EventChoice[];
}

export type GameEventType = 
  | 'plague'
  | 'rebellion'
  | 'trade_boom'
  | 'drought'
  | 'mongol_rally'
  | 'diplomatic_offer'
  | 'conquest_opportunity'
  | 'civil_war'
  | 'natural_disaster';

export interface EventCondition {
  type: 'min_provinces' | 'has_treaty' | 'at_war' | 'turn_range';
  value: string | number;
}

export interface EventChoice {
  text: string;
  effect: string;
  cost?: Partial<FactionResources>;
  result?: EventResult;
}

export interface EventResult {
  treasury?: number;
  manpower?: number;
  unrestChange?: number;
  relationChange?: { faction: FactionId; amount: number };
}

export interface FactionResources {
  treasury: number;
  manpower: number;
  horses: number;
}

export interface ActiveGameEvent {
  event: GameEvent;
  turnsRemaining: number;
  affectedFactions: FactionId[];
}

// Terrain info for province map
export const PROVINCE_TERRAIN_INFO: Record<ProvinceTerrain, {
  name: string;
  emoji: string;
  color: string;
  movementCost: number;
  defenseBonus: number;
  supplyLimit: number;
  taxModifier: number;
}> = {
  steppe: { 
    name: 'Steppi', emoji: '🌾', color: '#a8b077',
    movementCost: 1, defenseBonus: 0, supplyLimit: 3, taxModifier: 0.8 
  },
  grassland: { 
    name: 'Ruohomaa', emoji: '🌿', color: '#7cb342',
    movementCost: 1, defenseBonus: 0, supplyLimit: 5, taxModifier: 1.0 
  },
  forest: { 
    name: 'Metsä', emoji: '🌲', color: '#2d5a27',
    movementCost: 2, defenseBonus: 1, supplyLimit: 4, taxModifier: 0.9 
  },
  mountain: { 
    name: 'Vuoristo', emoji: '⛰️', color: '#6b7280',
    movementCost: 3, defenseBonus: 3, supplyLimit: 2, taxModifier: 0.5 
  },
  desert: { 
    name: 'Aavikko', emoji: '🏜️', color: '#d4a574',
    movementCost: 2, defenseBonus: 0, supplyLimit: 1, taxModifier: 0.3 
  },
  taiga: { 
    name: 'Taiga', emoji: '🌲', color: '#1e3a1a',
    movementCost: 2, defenseBonus: 1, supplyLimit: 2, taxModifier: 0.6 
  },
  tundra: { 
    name: 'Tundra', emoji: '❄️', color: '#b8c4cc',
    movementCost: 2, defenseBonus: 0, supplyLimit: 1, taxModifier: 0.2 
  },
  farmland: { 
    name: 'Viljelymaa', emoji: '🌾', color: '#8bc34a',
    movementCost: 1, defenseBonus: 0, supplyLimit: 8, taxModifier: 1.5 
  },
  hills: { 
    name: 'Kukkulat', emoji: '⛰️', color: '#9e9e6e',
    movementCost: 2, defenseBonus: 2, supplyLimit: 4, taxModifier: 0.8 
  },
  marsh: { 
    name: 'Suo', emoji: '🌿', color: '#5d8a66',
    movementCost: 3, defenseBonus: 1, supplyLimit: 2, taxModifier: 0.4 
  },
};

export const TRADE_GOODS_INFO: Record<TradeGood, {
  name: string;
  emoji: string;
  value: number;
  effect: string;
}> = {
  horses: { name: 'Hevoset', emoji: '🐴', value: 3, effect: '+2 ratsuväen rekrytointi' },
  silk: { name: 'Silkki', emoji: '🧣', value: 5, effect: '+50% kauppaverot' },
  spices: { name: 'Mausteet', emoji: '🌶️', value: 4, effect: '+25% kauppaverot' },
  gold: { name: 'Kulta', emoji: '🪙', value: 6, effect: '+3 kultaa/vuoro' },
  iron: { name: 'Rauta', emoji: '⚔️', value: 3, effect: '-20% yksiköiden kustannus' },
  fur: { name: 'Turkikset', emoji: '🧥', value: 4, effect: '+30% diplomaattinen arvo' },
  grain: { name: 'Vilja', emoji: '🌾', value: 2, effect: '+2 miesvoimaa' },
  salt: { name: 'Suola', emoji: '🧂', value: 3, effect: '+1 tarjonta' },
  livestock: { name: 'Karja', emoji: '🐄', value: 2, effect: '+1 miesvoimaa, +1 tarjonta' },
  gems: { name: 'Jalokivet', emoji: '💎', value: 5, effect: '+2 diplomaattinen arvo' },
};

export const FACTION_DATA_1206: Record<FactionId, Omit<Faction, 'isPlayer'>> = {
  mongol: {
    id: 'mongol',
    name: 'Mongolien valtakunta',
    ruler: 'Tšingis-kaani',
    color: '#f59e0b',
    capitalId: 'karakorum',
    personality: 'aggressive',
    treasury: 50,
    manpower: 80,
    horses: 100,
    cavalryBonus: 0.3,
    taxBonus: 0,
    siegeBonus: 0.2,
  },
  jin: {
    id: 'jin',
    name: 'Jin-dynastia',
    ruler: 'Keisari Xuanzong',
    color: '#ef4444',
    capitalId: 'zhongdu',
    personality: 'defensive',
    treasury: 150,
    manpower: 200,
    horses: 30,
    cavalryBonus: 0,
    taxBonus: 0.2,
    siegeBonus: 0,
  },
  song: {
    id: 'song',
    name: 'Song-dynastia',
    ruler: 'Keisari Ningzong',
    color: '#22c55e',
    capitalId: 'hangzhou',
    personality: 'trader',
    treasury: 200,
    manpower: 150,
    horses: 20,
    cavalryBonus: -0.1,
    taxBonus: 0.3,
    siegeBonus: -0.1,
  },
  xixia: {
    id: 'xixia',
    name: 'Länsi-Xia',
    ruler: 'Keisari Xiangzong',
    color: '#3b82f6',
    capitalId: 'xingqing',
    personality: 'cautious',
    treasury: 60,
    manpower: 60,
    horses: 40,
    cavalryBonus: 0.1,
    taxBonus: 0.1,
    siegeBonus: 0,
  },
  khwarezm: {
    id: 'khwarezm',
    name: 'Khwarezmin valtakunta',
    ruler: 'Šaahi Muhammad II',
    color: '#8b5cf6',
    capitalId: 'samarkand',
    personality: 'expansionist',
    treasury: 120,
    manpower: 100,
    horses: 50,
    cavalryBonus: 0.1,
    taxBonus: 0.2,
    siegeBonus: 0.1,
  },
  rus: {
    id: 'rus',
    name: 'Venäjän ruhtinaskunnat',
    ruler: 'Suuriruhtinas',
    color: '#64748b',
    capitalId: 'novgorod',
    personality: 'defensive',
    treasury: 80,
    manpower: 80,
    horses: 25,
    cavalryBonus: 0,
    taxBonus: 0.1,
    siegeBonus: 0.1,
  },
  kipchak: {
    id: 'kipchak',
    name: 'Kipčakit',
    ruler: 'Kaani Köten',
    color: '#ec4899',
    capitalId: 'sarkel',
    personality: 'aggressive',
    treasury: 30,
    manpower: 50,
    horses: 70,
    cavalryBonus: 0.2,
    taxBonus: -0.1,
    siegeBonus: -0.1,
  },
};

export const CURRENT_SAVE_VERSION = '1.0.0';

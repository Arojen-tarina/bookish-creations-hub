// Game Types for Mongolien Valtakunta Digital Game

export type FactionId = 'mongol' | 'china' | 'persia' | 'russia';

export type TerrainType = 'steppe' | 'mountain' | 'forest' | 'desert' | 'river' | 'city';

export type ResourceType = 'horses' | 'gold' | 'food' | 'artisans' | 'cattle';

export type UnitType = 'cavalry' | 'infantry' | 'leader';

export type BuildingType = 'fortress' | 'market' | 'stable' | 'temple' | 'watchtower';

export type GamePhase = 'planning' | 'action' | 'building' | 'event' | 'management';

export type ActionType = 'move' | 'attack' | 'build' | 'trade' | 'recruit';

export type EventType = 'plague' | 'drought' | 'trade_boom' | 'rebellion' | 'alliance' | 'storm' | 'harvest' | 'mongol_horde';

export interface EventCard {
  id: string;
  type: EventType;
  name: string;
  description: string;
  effect: string;
  duration: number; // turns the effect lasts
  affectsAll: boolean;
  targetFaction?: FactionId;
}

export interface Building {
  id: string;
  type: BuildingType;
  hexId: string;
  ownerId: FactionId;
  health: number;
  maxHealth: number;
  level: number;
}

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
  hasActed: boolean;
}

export interface HexTile {
  id: string;
  q: number;
  r: number;
  terrain: TerrainType;
  regionName: string;
  ownerId: FactionId | null;
  units: string[];
  buildings: string[];
  hasCity: boolean;
  hasFortress: boolean;
  hasTradeRoute: boolean;
  resourceProduction: Partial<Record<ResourceType, number>>;
  isHighlighted?: boolean;
  defenseBonus: number;
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
  aiPersonality: AIPersonality;
}

export type AIPersonality = 'aggressive' | 'defensive' | 'economic' | 'balanced';

export interface AIDecision {
  type: 'move' | 'attack' | 'build' | 'recruit' | 'skip';
  priority: number;
  unitId?: string;
  targetHexId?: string;
  buildingType?: BuildingType;
  reasoning: string;
}

export interface ActiveEvent {
  event: EventCard;
  turnsRemaining: number;
  affectedFactions: FactionId[];
}

export interface GameState {
  players: Player[];
  currentPlayerId: string;
  currentPhase: GamePhase;
  turn: number;
  maxTurns: number;
  hexes: HexTile[];
  units: Unit[];
  buildings: Building[];
  selectedUnitId: string | null;
  selectedHexId: string | null;
  availableMoves: string[];
  combatLog: CombatLogEntry[];
  eventLog: GameEventLog[];
  activeEvents: ActiveEvent[];
  eventDeck: EventCard[];
  currentEvent: EventCard | null;
  gameOver: boolean;
  winnerId: string | null;
  winCondition: string | null;
  showEventModal: boolean;
  showBuildMenu: boolean;
  aiThinking: boolean;
  lastAIActions: AIDecision[];
  cameraAngle: number;
  gameSpeed: 'slow' | 'normal' | 'fast';
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
  timestamp: number;
}

export interface GameEventLog {
  id: string;
  turn: number;
  type: 'combat' | 'event' | 'build' | 'conquest' | 'recruit' | 'resource';
  message: string;
  factionId?: FactionId;
  timestamp: number;
}

export const EVENT_CARDS: EventCard[] = [
  {
    id: 'plague-1',
    type: 'plague',
    name: 'Musta Surma',
    description: 'Rutto iskee valtakuntaan',
    effect: 'Kaikki pelaajat menettävät 2 ruokaa ja 1 yksikön jokaisesta kaupungista',
    duration: 1,
    affectsAll: true,
  },
  {
    id: 'drought-1',
    type: 'drought',
    name: 'Kuivuus',
    description: 'Pitkä kuivuus kuivattaa laitumet',
    effect: 'Steppialueet eivät tuota resursseja tällä vuorolla',
    duration: 1,
    affectsAll: true,
  },
  {
    id: 'trade-boom-1',
    type: 'trade_boom',
    name: 'Silkkitien Kukoistus',
    description: 'Kauppa kukoistaa silkkitiellä',
    effect: 'Kaikki kauppareitit tuottavat +3 kultaa',
    duration: 2,
    affectsAll: true,
  },
  {
    id: 'rebellion-1',
    type: 'rebellion',
    name: 'Kapina',
    description: 'Tyytymättömät talonpojat nousevat kapinaan',
    effect: 'Satunnainen alue menetetään neutraalille joukolle',
    duration: 1,
    affectsAll: false,
  },
  {
    id: 'storm-1',
    type: 'storm',
    name: 'Talvimyrsky',
    description: 'Ankara talvimyrsky pysäyttää armeijat',
    effect: 'Liikkuminen -1 kaikille yksiköille',
    duration: 1,
    affectsAll: true,
  },
  {
    id: 'harvest-1',
    type: 'harvest',
    name: 'Runsas Sato',
    description: 'Poikkeuksellisen hyvä satovuosi',
    effect: 'Kaikki pelaajat saavat +5 ruokaa',
    duration: 1,
    affectsAll: true,
  },
  {
    id: 'mongol-horde-1',
    type: 'mongol_horde',
    name: 'Mongoli-aalto',
    description: 'Uusi mongoliaalto saapuu idästä',
    effect: 'Mongoli-pelaaja saa 2 ilmaista ratsuväkiyksikköä',
    duration: 1,
    affectsAll: false,
    targetFaction: 'mongol',
  },
  {
    id: 'alliance-1',
    type: 'alliance',
    name: 'Diplomaattinen Liitto',
    description: 'Naapurivaltio tarjoaa liittoa',
    effect: 'Nykyinen pelaaja saa +10 kultaa ja +5 voittopistettä',
    duration: 1,
    affectsAll: false,
  },
];

export const BUILDING_INFO: Record<BuildingType, { 
  name: string; 
  emoji: string; 
  cost: Partial<Resources>; 
  effect: string;
  defenseBonus: number;
  resourceBonus: Partial<Resources>;
}> = {
  fortress: { 
    name: 'Linnoitus', 
    emoji: '🏯', 
    cost: { gold: 8, artisans: 3 }, 
    effect: '+3 puolustus, estää ratsuväen läpikulun',
    defenseBonus: 3,
    resourceBonus: {},
  },
  market: { 
    name: 'Kauppatori', 
    emoji: '🏪', 
    cost: { gold: 5, artisans: 2 }, 
    effect: '+2 kultaa per vuoro',
    defenseBonus: 0,
    resourceBonus: { gold: 2 },
  },
  stable: { 
    name: 'Talli', 
    emoji: '🐴', 
    cost: { gold: 4, food: 3 }, 
    effect: '+2 hevosta per vuoro, ratsuväen rekrytointi halvempaa',
    defenseBonus: 0,
    resourceBonus: { horses: 2 },
  },
  temple: { 
    name: 'Temppeli', 
    emoji: '⛩️', 
    cost: { gold: 6, artisans: 4 }, 
    effect: '+3 voittopistettä per vuoro, parantaa moraalia',
    defenseBonus: 0,
    resourceBonus: {},
  },
  watchtower: { 
    name: 'Vartiotorni', 
    emoji: '🗼', 
    cost: { gold: 3, artisans: 1 }, 
    effect: '+1 puolustus, näkee vihollisen liikkeet',
    defenseBonus: 1,
    resourceBonus: {},
  },
};

export const FACTIONS: Record<FactionId, Faction> = {
  mongol: {
    id: 'mongol',
    name: 'Mongoli-heimo',
    color: '#f59e0b',
    bonus: 'Ratsuväen bonus',
    bonusDescription: 'Ratsuväki liikkuu +1 ylimääräisen alueen ja saa +1 hyökkäysbonuksen stepillä',
  },
  china: {
    id: 'china',
    name: 'Kiinan dynastia',
    color: '#ef4444',
    bonus: 'Linnoitusbonus',
    bonusDescription: 'Linnoitukset maksavat -2 kultaa ja antavat +2 puolustusta',
  },
  persia: {
    id: 'persia',
    name: 'Persialainen valtakunta',
    color: '#3b82f6',
    bonus: 'Kauppabonus',
    bonusDescription: 'Kauppareitit tuottavat +2 kultaa ja +1 käsityöläisiä',
  },
  russia: {
    id: 'russia',
    name: 'Venäläiset ruhtinaskunnat',
    color: '#22c55e',
    bonus: 'Talvisotataktiikat',
    bonusDescription: 'Metsässä +2 puolustus ja jalkaväki liikkuu +1 metsässä',
  },
};

export const TERRAIN_INFO: Record<TerrainType, { 
  name: string; 
  emoji: string; 
  movementCost: number; 
  defenseBonus: number;
  color: string;
}> = {
  steppe: { name: 'Steppi', emoji: '🌾', movementCost: 1, defenseBonus: 0, color: '#a3a571' },
  mountain: { name: 'Vuoristo', emoji: '⛰️', movementCost: 3, defenseBonus: 2, color: '#6b7280' },
  forest: { name: 'Metsä', emoji: '🌲', movementCost: 2, defenseBonus: 1, color: '#15803d' },
  desert: { name: 'Autiomaa', emoji: '🏜️', movementCost: 2, defenseBonus: 0, color: '#d4a574' },
  river: { name: 'Jokilaakso', emoji: '🏞️', movementCost: 1, defenseBonus: 0, color: '#0ea5e9' },
  city: { name: 'Kaupunki', emoji: '🏰', movementCost: 1, defenseBonus: 3, color: '#78716c' },
};

export const UNIT_INFO: Record<UnitType, { 
  name: string; 
  emoji: string; 
  basePower: number; 
  baseMovement: number; 
  cost: Resources;
  symbol: string;
}> = {
  cavalry: { 
    name: 'Ratsuväki', 
    emoji: '🐎', 
    basePower: 3, 
    baseMovement: 3, 
    cost: { horses: 2, gold: 1, food: 1, artisans: 0, cattle: 0 },
    symbol: '♘',
  },
  infantry: { 
    name: 'Jalkaväki', 
    emoji: '⚔️', 
    basePower: 2, 
    baseMovement: 2, 
    cost: { horses: 0, gold: 1, food: 2, artisans: 0, cattle: 0 },
    symbol: '♟',
  },
  leader: { 
    name: 'Heimopäällikkö', 
    emoji: '👑', 
    basePower: 4, 
    baseMovement: 2, 
    cost: { horses: 0, gold: 0, food: 0, artisans: 0, cattle: 0 },
    symbol: '♔',
  },
};

export const RESOURCE_INFO: Record<ResourceType, { name: string; emoji: string }> = {
  horses: { name: 'Hevoset', emoji: '🐎' },
  gold: { name: 'Kulta', emoji: '🪙' },
  food: { name: 'Ruoka', emoji: '🌾' },
  artisans: { name: 'Käsityöläiset', emoji: '🛠️' },
  cattle: { name: 'Karja', emoji: '🐄' },
};

export const AI_PERSONALITIES: Record<AIPersonality, { 
  name: string; 
  description: string;
  aggressiveness: number;
  expansionism: number;
  economicFocus: number;
}> = {
  aggressive: {
    name: 'Hyökkäävä',
    description: 'Pyrkii valloittamaan aggressiivisesti',
    aggressiveness: 0.9,
    expansionism: 0.8,
    economicFocus: 0.3,
  },
  defensive: {
    name: 'Puolustava',
    description: 'Keskittyy alueiden puolustamiseen',
    aggressiveness: 0.3,
    expansionism: 0.4,
    economicFocus: 0.5,
  },
  economic: {
    name: 'Taloudellinen',
    description: 'Rakentaa ja kerää resursseja',
    aggressiveness: 0.2,
    expansionism: 0.5,
    economicFocus: 0.9,
  },
  balanced: {
    name: 'Tasapainoinen',
    description: 'Tasapainottaa kaikkia osa-alueita',
    aggressiveness: 0.5,
    expansionism: 0.5,
    economicFocus: 0.5,
  },
};

export type * from './enums';
export type { BuildingType } from './enums';
import type { BuildingType, CardEffectType, CardType, Difficulty, FactionId, Personality, Rarity, Region, Terrain, TradeGood, TreatyType, TurnLogEntry, TurnLogKind, WinCondition } from './enums';

export interface Point { x: number; y: number }
export interface Province { id: string; name: string; region: Region; ownerId: FactionId | null; terrain: Terrain; isCoastal: boolean; isCapital: boolean; neighbors: string[]; baseTax: number; baseManpower: number; tradeGood: TradeGood | null; hasSilkRoad: boolean; unrest: number; fortLevel: number; fortDurability: number | null; developmentLevel: number; garrison: number; siegeProgress: number | null; center: Point }
export interface Faction { id: FactionId; capitalId: string; personality: Personality; treasury: number; manpower: number; horses: number; cavalryBonus: number; taxBonus: number; siegeBonus: number; isPlayer: boolean }
export interface Army { id: string; ownerId: FactionId; provinceId: string; cavalry: number; infantry: number; siege: number; movementLeft: number; leaderBonus: number }
export interface Treaty { type: TreatyType; startTurn: number; duration: number }
export interface DiplomaticRelation { factionA: FactionId; factionB: FactionId; relation: number; trust: number; threat: number; treaties: Treaty[]; borderFriction: number; lastProposalTurn: number | null }
export interface CardEffect { type: CardEffectType; value: number; duration: number }
export interface Card { id: string; type: CardType; rarity: Rarity | null; effect: CardEffect }
export interface ActiveCardEffect { cardId: string; type: CardEffectType; value: number; remainingTurns: number }
export interface ResourceCollection { taxIncome: number; manpowerGain: number; marketBonus: number; silkRoadBonus: number; foodChange: number; artisansGain: number; horsesGain: number; influenceGain: number; prestigeGain: number }
export interface UnitLosses { cavalry: number; infantry: number }
export interface BattleReport { attacker: Army; defender: Army; attackerFaction: FactionId; defenderFaction: FactionId; provinceId: string; attackerWon: boolean; attackerLosses: UnitLosses; defenderLosses: UnitLosses; attackRoll: number; defenseRoll: number; attackerPower: number; defenderPower: number }
export interface GameState {
  turn: number; year: number; playerFactionId: FactionId; difficulty: Difficulty;
  provinces: Province[]; factions: Faction[]; relations: DiplomaticRelation[]; armies: Army[];
  deck: Card[]; hand: Card[]; discard: Card[]; playedTechCards: Card[]; activeEffects: ActiveCardEffect[]; attackBonus: number; defenseBonus: number; movementBonus: number;
  buildings: Record<string, BuildingType[]>; food: number; artisans: number; influence: number; prestige: number; treasuryStreak: number; aiTreasuryStreaks: Partial<Record<FactionId, number>>;
  turnLog: TurnLogEntry[]; resourcesCollected: boolean; lastCollection: ResourceCollection | null; chiefLost: boolean; tributeTurn: number; secondChanceUsed: boolean;
  gameOver: boolean; winnerId: FactionId | null; winCondition: WinCondition | null; nextId: number;
}
export const chiefArmyId = (owner: FactionId): string => `army-${owner}-main`;
export const isChiefArmy = (army: Army): boolean => army.id === chiefArmyId(army.ownerId);
export const newProvince = (value: Pick<Province, 'id' | 'name' | 'region' | 'ownerId' | 'terrain' | 'baseTax' | 'baseManpower' | 'center'> & Partial<Province>): Province => ({ isCoastal: false, isCapital: false, neighbors: [], tradeGood: null, hasSilkRoad: false, unrest: 0, fortLevel: 0, fortDurability: null, developmentLevel: 1, garrison: 0, siegeProgress: null, ...value });
export const newArmy = (value: Pick<Army, 'id' | 'ownerId' | 'provinceId' | 'cavalry' | 'infantry' | 'siege' | 'movementLeft'> & Partial<Army>): Army => ({ leaderBonus: 0, ...value });
export const newGameState = (value: Pick<GameState, 'turn' | 'year' | 'playerFactionId' | 'difficulty' | 'provinces' | 'factions' | 'relations' | 'armies' | 'deck' | 'hand' | 'discard' | 'food' | 'artisans'> & Partial<GameState>): GameState => ({ playedTechCards: [], activeEffects: [], attackBonus: 0, defenseBonus: 0, movementBonus: 0, buildings: {}, influence: 0, prestige: 0, treasuryStreak: 0, aiTreasuryStreaks: {}, turnLog: [], resourcesCollected: false, lastCollection: null, chiefLost: false, tributeTurn: 0, secondChanceUsed: false, gameOver: false, winnerId: null, winCondition: null, nextId: 1, ...value });
export const playerOf = (state: GameState): Faction => state.factions.find(f => f.id === state.playerFactionId)!;
export const provinceById = (state: GameState, id: string): Province | null => state.provinces.find(p => p.id === id) ?? null;
export const factionById = (state: GameState, id: FactionId): Faction | null => state.factions.find(f => f.id === id) ?? null;
export const relationBetween = (state: GameState, a: FactionId, b: FactionId): DiplomaticRelation | null => state.relations.find(r => (r.factionA === a && r.factionB === b) || (r.factionA === b && r.factionB === a)) ?? null;
export const armiesIn = (state: GameState, provinceId: string): Army[] => state.armies.filter(a => a.provinceId === provinceId);
export const buildingsIn = (state: GameState, provinceId: string): BuildingType[] => state.buildings[provinceId] ?? [];

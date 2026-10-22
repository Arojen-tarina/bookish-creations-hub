export type FactionId = 'mongol' | 'jin' | 'song' | 'xixia' | 'khwarezm' | 'rus' | 'kipchak';
export const ALL_FACTIONS: FactionId[] = ['mongol', 'jin', 'song', 'xixia', 'khwarezm', 'rus', 'kipchak'];
export const factionKey = (id: FactionId): string => id;

export type Region = 'mongolia' | 'manchuria' | 'jin_china' | 'song_china' | 'xixia' | 'tibet' | 'khwarezm' | 'persia' | 'khorasan' | 'transoxiana' | 'kipchak' | 'rus' | 'caucasus' | 'siberia' | 'korea' | 'central_asia';
export const ALL_REGIONS: Region[] = ['mongolia', 'manchuria', 'jin_china', 'song_china', 'xixia', 'tibet', 'khwarezm', 'persia', 'khorasan', 'transoxiana', 'kipchak', 'rus', 'caucasus', 'siberia', 'korea', 'central_asia'];

export type Terrain = 'steppe' | 'grassland' | 'forest' | 'mountain' | 'desert' | 'taiga' | 'tundra' | 'farmland' | 'hills' | 'marsh';
export interface TerrainInfo { movementCost: number; movementCostInfantry: number; movementCostCavalry: number; movementCostSiege: number; defenseBonus: number; supplyLimit: number; taxModifier: number }
export const TERRAIN_INFO: Record<Terrain, TerrainInfo> = {
  steppe: { movementCost: 1, movementCostInfantry: 1, movementCostCavalry: 1, movementCostSiege: 2, defenseBonus: 0, supplyLimit: 3, taxModifier: .8 },
  grassland: { movementCost: 1, movementCostInfantry: 1, movementCostCavalry: 1, movementCostSiege: 2, defenseBonus: 0, supplyLimit: 5, taxModifier: 1 },
  forest: { movementCost: 2, movementCostInfantry: 2, movementCostCavalry: 1, movementCostSiege: 3, defenseBonus: 1, supplyLimit: 4, taxModifier: .9 },
  mountain: { movementCost: 3, movementCostInfantry: 3, movementCostCavalry: 3, movementCostSiege: 4, defenseBonus: 3, supplyLimit: 2, taxModifier: .5 },
  desert: { movementCost: 2, movementCostInfantry: 2, movementCostCavalry: 2, movementCostSiege: 3, defenseBonus: 0, supplyLimit: 1, taxModifier: .3 },
  taiga: { movementCost: 2, movementCostInfantry: 2, movementCostCavalry: 2, movementCostSiege: 3, defenseBonus: 1, supplyLimit: 2, taxModifier: .6 },
  tundra: { movementCost: 2, movementCostInfantry: 2, movementCostCavalry: 2, movementCostSiege: 3, defenseBonus: 0, supplyLimit: 1, taxModifier: .2 },
  farmland: { movementCost: 1, movementCostInfantry: 1, movementCostCavalry: 1, movementCostSiege: 2, defenseBonus: 0, supplyLimit: 8, taxModifier: 1.5 },
  hills: { movementCost: 2, movementCostInfantry: 2, movementCostCavalry: 2, movementCostSiege: 3, defenseBonus: 2, supplyLimit: 4, taxModifier: .8 },
  marsh: { movementCost: 3, movementCostInfantry: 3, movementCostCavalry: 3, movementCostSiege: 4, defenseBonus: 1, supplyLimit: 2, taxModifier: .4 },
};
export const ALL_TERRAINS = Object.keys(TERRAIN_INFO) as Terrain[];

export type TradeGood = 'horses' | 'silk' | 'spices' | 'gold' | 'iron' | 'fur' | 'grain' | 'salt' | 'livestock' | 'gems';
export const TRADE_GOOD_VALUES: Record<TradeGood, number> = { horses: 3, silk: 5, spices: 4, gold: 6, iron: 3, fur: 4, grain: 2, salt: 3, livestock: 2, gems: 5 };
export const ALL_TRADE_GOODS = Object.keys(TRADE_GOOD_VALUES) as TradeGood[];
export type Personality = 'aggressive' | 'defensive' | 'trader' | 'expansionist' | 'cautious';
export const ALL_PERSONALITIES: Personality[] = ['aggressive', 'defensive', 'trader', 'expansionist', 'cautious'];
export type TreatyType = 'non_aggression' | 'trade_agreement' | 'alliance' | 'truce' | 'tributary' | 'peace' | 'war_surprise' | 'war_formal';
export const ALL_TREATY_TYPES: TreatyType[] = ['non_aggression', 'trade_agreement', 'alliance', 'truce', 'tributary', 'peace', 'war_surprise', 'war_formal'];
export const isWar = (type: TreatyType): boolean => type === 'war_surprise' || type === 'war_formal';
export const isPeaceful = (type: TreatyType): boolean => type === 'non_aggression' || type === 'peace' || type === 'truce' || type === 'alliance';
export type BuildingType = 'camp' | 'market' | 'fortress' | 'workshop' | 'stable' | 'bridge' | 'wonder';
export interface BuildingInfo { goldCost: number; artisanCost: number }
export const BUILDING_INFO: Record<BuildingType, BuildingInfo> = { camp: { goldCost: 15, artisanCost: 0 }, market: { goldCost: 25, artisanCost: 1 }, fortress: { goldCost: 50, artisanCost: 2 }, workshop: { goldCost: 30, artisanCost: 1 }, stable: { goldCost: 40, artisanCost: 1 }, bridge: { goldCost: 20, artisanCost: 1 }, wonder: { goldCost: 80, artisanCost: 3 } };
export const ALL_BUILDINGS = Object.keys(BUILDING_INFO) as BuildingType[];
export type RecruitType = 'infantry' | 'cavalry';
export type Difficulty = 'easy' | 'normal' | 'hard';
export const AI_INCOME_MULTIPLIER: Record<Difficulty, number> = { easy: .75, normal: 1, hard: 1.35 };
export const ALL_DIFFICULTIES: Difficulty[] = ['easy', 'normal', 'hard'];
export type CardType = 'strategy' | 'diplomacy' | 'technology' | 'resource';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'legendary';
export type CardEffectType = 'attack_bonus' | 'defense_bonus' | 'movement_bonus' | 'gold' | 'food' | 'horses' | 'artisans' | 'draw_cards' | 'recruit_free' | 'permanent_attack' | 'permanent_defense' | 'terrain_ignore' | 'morale';
export type WinCondition = 'military' | 'economic' | 'technology' | 'diplomatic' | 'cultural';
export type TurnLogKind = 'MERGED_ARMIES' | 'DEFEND_BORDER' | 'CAPTURE' | 'ADVANCE' | 'WON_BATTLE' | 'ATTACK_FAILED' | 'CONQUERED' | 'FORTIFY' | 'FORTIFY_CAPITAL' | 'BUILD_MARKET' | 'RECRUITED' | 'PLAYER_CHIEF_FELL';
export const ALL_RECRUIT_TYPES: RecruitType[] = ['infantry', 'cavalry'];
export const ALL_CARD_TYPES: CardType[] = ['strategy', 'diplomacy', 'technology', 'resource'];
export const ALL_RARITIES: Rarity[] = ['common', 'uncommon', 'rare', 'legendary'];
export const ALL_CARD_EFFECT_TYPES: CardEffectType[] = ['attack_bonus', 'defense_bonus', 'movement_bonus', 'gold', 'food', 'horses', 'artisans', 'draw_cards', 'recruit_free', 'permanent_attack', 'permanent_defense', 'terrain_ignore', 'morale'];
export const ALL_WIN_CONDITIONS: WinCondition[] = ['military', 'economic', 'technology', 'diplomatic', 'cultural'];
export const ALL_TURN_LOG_KINDS: TurnLogKind[] = ['MERGED_ARMIES', 'DEFEND_BORDER', 'CAPTURE', 'ADVANCE', 'WON_BATTLE', 'ATTACK_FAILED', 'CONQUERED', 'FORTIFY', 'FORTIFY_CAPITAL', 'BUILD_MARKET', 'RECRUITED', 'PLAYER_CHIEF_FELL'];

export interface TurnLogEntry { kind: TurnLogKind; factionId: FactionId | null; provinceId: string | null }

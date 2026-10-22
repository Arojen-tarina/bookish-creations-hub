import { useLocale } from '../../i18n';
import type { BuildingType, CardType, FactionId, Rarity, Terrain, TradeGood, TreatyType, WinCondition } from '../../game/model/enums';
import type { GameState, TurnLogEntry } from '../../game/model/models';
import { t } from '../../i18n';

export const factionName = (id: FactionId | null): string => t(id ? `faction_name_${id}` : 'neutral_land');
export const factionRuler = (id: FactionId): string | null => ['mongol', 'song', 'rus', 'khwarezm'].includes(id) ? t(`faction_ruler_${id}`) : null;
export const terrainName = (terrain: Terrain): string => t(`terrain_${terrain}`);
export const tradeGoodName = (good: TradeGood): string => t(`good_${good}`);
export const tradeGoodEffect = (good: TradeGood): string => t(`good_effect_${good}`);
export const buildingName = (building: BuildingType): string => t(`building_${building}_name`);
export const buildingEffect = (building: BuildingType): string => t(`building_${building}_effect`);
export const treatyName = (type: TreatyType): string => t(`treaty_${type}_name`);
export const treatyDescription = (type: TreatyType): string => t(`treaty_${type}_desc`);
export const cardTypeName = (type: CardType): string => t(`card_type_${type}`);
export const rarityName = (rarity: Rarity): string => t(`rarity_${rarity}`);
export const victoryText = (condition: WinCondition | null): string => t(condition ? `game_over_victory_${condition}` : 'game_over_victory_generic');
export const rulerName = factionRuler;

const logKeys: Record<TurnLogEntry['kind'], string> = {
  MERGED_ARMIES: 'log_merged_armies', DEFEND_BORDER: 'log_defend_border', CAPTURE: 'log_capture', ADVANCE: 'log_advance',
  WON_BATTLE: 'log_won_battle', ATTACK_FAILED: 'log_attack_failed', CONQUERED: 'log_conquered', FORTIFY: 'log_fortify',
  FORTIFY_CAPITAL: 'log_fortify_capital', BUILD_MARKET: 'log_build_market', RECRUITED: 'log_recruited', PLAYER_CHIEF_FELL: 'log_player_chief_fell',
};
export function turnLogText(entry: TurnLogEntry, game: GameState) {
  const where = entry.provinceId ? game.provinces.find((p) => p.id === entry.provinceId)?.name ?? '' : '';
  const who = factionName(entry.factionId);
  const key = logKeys[entry.kind];
  if (entry.kind === 'PLAYER_CHIEF_FELL') return t(key);
  if (entry.kind === 'MERGED_ARMIES') return t(key, who);
  return t(key, who, where);
}

/** Component wrapper that subscribes to locale changes for translated labels. */
export function GameText({ id, args = '', className }: { id: string; args?: string | number | Array<string | number>; className?: string }) {
  useLocale();
  const values = Array.isArray(args) ? args : [args];
  return <span className={className}>{t(id, ...values)}</span>;
}

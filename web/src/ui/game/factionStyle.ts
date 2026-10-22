import type { FactionId, TradeGood } from '../../game/model/enums';

export const NEUTRAL_COLOR = '#8a8a8a';
export function factionColor(id: FactionId | null): string {
  switch (id) {
    case 'mongol': return '#f59e0b'; case 'song': return '#22c55e'; case 'khwarezm': return '#8b5cf6';
    case 'rus': return '#3b7dd8'; case 'jin': return '#ef4444'; case 'xixia': return '#06b6d4';
    case 'kipchak': return '#ec4899'; default: return NEUTRAL_COLOR;
  }
}
type ArtSet = 'mongol' | 'chinese' | 'persian' | 'novgorod';
export function factionArtSet(id: FactionId | null): ArtSet {
  if (id === 'mongol' || id === 'kipchak') return 'mongol';
  if (id === 'jin' || id === 'song' || id === 'xixia') return 'chinese';
  if (id === 'khwarezm') return 'persian';
  return 'novgorod';
}
export type MapSprite = 'fort' | 'camp' | 'bridge' | 'leader' | 'cavalry' | 'infantry';
export function factionSprite(kind: MapSprite, id: FactionId | null) { return `sprites/sprite_${kind}_${factionArtSet(id)}.png`; }
export function resourceSprite(good: TradeGood) {
  switch (good) {
    case 'horses': return 'sprites/sprite_res_horse.png';
    case 'livestock': case 'grain': case 'salt': return 'sprites/sprite_res_food.png';
    case 'fur': return 'sprites/sprite_res_wood.png'; case 'iron': return 'sprites/sprite_res_iron.png';
    case 'silk': case 'gold': case 'gems': return 'sprites/sprite_res_gold.png'; default: return 'sprites/sprite_res_stone.png';
  }
}

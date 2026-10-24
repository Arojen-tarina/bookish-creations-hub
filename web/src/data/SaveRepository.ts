import type { Difficulty, FactionId } from '../game/model/enums';
import type { GameState } from '../game/model/models';
import { createStore, type Store } from '../lib/store';
import { logSecurityEvent } from '../lib/securityLog';
import { readSecure, removeSecure, writeSecure } from '../lib/secureStorage';

export interface SaveMeta { slot: number; savedAt: number; turn: number; year: number; faction: FactionId; provinces: number; difficulty: Difficulty; version: number }
interface SaveFile { meta: SaveMeta; state: GameState }
const key = (slot: number) => `arojen_save_${slot}`;
const isObject = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const factionIds = ['mongol', 'jin', 'song', 'xixia', 'khwarezm', 'rus', 'kipchak'];
const difficulties = ['easy', 'normal', 'hard'];
function validMeta(value: unknown): value is SaveMeta {
  if (!isObject(value)) return false;
  return Number.isInteger(value.slot) && (value.slot as number) >= 0 && (value.slot as number) <= 5 && Number.isFinite(value.savedAt) && (value.savedAt as number) > 0 && Number.isInteger(value.turn) && (value.turn as number) >= 1 && Number.isInteger(value.year) && factionIds.includes(String(value.faction)) && Number.isInteger(value.provinces) && difficulties.includes(String(value.difficulty)) && Number.isInteger(value.version) && (value.version as number) >= 1;
}
function finite(...values: unknown[]): boolean { return values.every(value => typeof value === 'number' && Number.isFinite(value)); }
function oneOf(value: unknown, values: readonly string[]): boolean { return typeof value === 'string' && values.includes(value); }
function validGame(value: unknown): value is GameState {
  if (!isObject(value)) return false;
  const g = value;
  const record = (v: unknown): v is Record<string, unknown> => isObject(v);
  const validProvince = (v: unknown): boolean => record(v) && typeof v.id === 'string' && typeof v.name === 'string' && oneOf(v.region, ['mongolia','manchuria','jin_china','song_china','xixia','tibet','khwarezm','persia','khorasan','transoxiana','kipchak','rus','caucasus','siberia','korea','central_asia']) && (v.ownerId === null || factionIds.includes(String(v.ownerId))) && oneOf(v.terrain, ['steppe','grassland','forest','mountain','desert','taiga','tundra','farmland','hills','marsh']) && typeof v.isCoastal === 'boolean' && typeof v.isCapital === 'boolean' && Array.isArray(v.neighbors) && v.neighbors.every(id => typeof id === 'string') && finite(v.baseTax,v.baseManpower,v.unrest,v.fortLevel,v.developmentLevel,v.garrison,v.center && (v.center as Record<string, unknown>).x,v.center && (v.center as Record<string, unknown>).y) && (v.tradeGood === null || ['horses','silk','spices','gold','iron','fur','grain','salt','livestock','gems'].includes(String(v.tradeGood))) && typeof v.hasSilkRoad === 'boolean' && (v.fortDurability === null || finite(v.fortDurability)) && (v.siegeProgress === null || finite(v.siegeProgress));
  const validFaction = (v: unknown): boolean => record(v) && factionIds.includes(String(v.id)) && typeof v.capitalId === 'string' && ['aggressive','defensive','trader','expansionist','cautious'].includes(String(v.personality)) && finite(v.treasury,v.manpower,v.horses,v.cavalryBonus,v.taxBonus,v.siegeBonus) && typeof v.isPlayer === 'boolean';
  const validArmy = (v: unknown): boolean => record(v) && typeof v.id === 'string' && factionIds.includes(String(v.ownerId)) && typeof v.provinceId === 'string' && finite(v.cavalry,v.infantry,v.siege,v.movementLeft,v.leaderBonus);
  const validRelation = (v: unknown): boolean => record(v) && factionIds.includes(String(v.factionA)) && factionIds.includes(String(v.factionB)) && finite(v.relation,v.trust,v.threat,v.borderFriction) && (v.lastProposalTurn === null || Number.isInteger(v.lastProposalTurn)) && Array.isArray(v.treaties) && v.treaties.every(t => record(t) && ['non_aggression','trade_agreement','alliance','truce','tributary','peace','war_surprise','war_formal'].includes(String(t.type)) && Number.isInteger(t.startTurn) && Number.isInteger(t.duration));
  const validCard = (v: unknown): boolean => record(v) && typeof v.id === 'string' && ['strategy','diplomacy','technology','resource'].includes(String(v.type)) && (v.rarity === null || ['common','uncommon','rare','legendary'].includes(String(v.rarity))) && record(v.effect) && ['attack_bonus','defense_bonus','movement_bonus','gold','food','horses','artisans','draw_cards','recruit_free','permanent_attack','permanent_defense','terrain_ignore'].includes(String(v.effect.type)) && finite(v.effect.value,v.effect.duration);
  if (!Number.isInteger(g.turn) || (g.turn as number) < 1 || !Number.isInteger(g.year) || !factionIds.includes(String(g.playerFactionId)) || !difficulties.includes(String(g.difficulty))) return false;
  if (!Array.isArray(g.provinces) || g.provinces.length > 1000 || !g.provinces.every(validProvince) || !Array.isArray(g.factions) || g.factions.length > 20 || !g.factions.every(validFaction) || !Array.isArray(g.armies) || g.armies.length > 10000 || !g.armies.every(validArmy) || !Array.isArray(g.relations) || !g.relations.every(validRelation)) return false;
  if (!['deck','hand','discard','playedTechCards'].every(key => Array.isArray(g[key]) && (g[key] as unknown[]).length <= 10000 && (g[key] as unknown[]).every(validCard))) return false;
  if (!Array.isArray(g.activeEffects) || !g.activeEffects.every(effect => record(effect) && typeof effect.cardId === 'string' && ['attack_bonus','defense_bonus','movement_bonus','gold','food','horses','artisans','draw_cards','recruit_free','permanent_attack','permanent_defense','terrain_ignore'].includes(String(effect.type)) && finite(effect.value,effect.remainingTurns))) return false;
  if (!record(g.buildings) || !Object.values(g.buildings).every(items => Array.isArray(items) && items.every(item => ['camp','market','fortress','workshop','stable','bridge','wonder'].includes(String(item))))) return false;
  if (!Array.isArray(g.turnLog) || !g.turnLog.every(log => record(log) && typeof log.kind === 'string' && (log.factionId === null || factionIds.includes(String(log.factionId))) && (log.provinceId === null || typeof log.provinceId === 'string'))) return false;
  if (!finite(g.food,g.artisans,g.influence,g.prestige,g.treasuryStreak,g.attackBonus,g.defenseBonus,g.movementBonus,g.nextId,g.tributeTurn) || !Number.isInteger(g.nextId) || typeof g.resourcesCollected !== 'boolean' || typeof g.chiefLost !== 'boolean' || typeof g.secondChanceUsed !== 'boolean' || typeof g.gameOver !== 'boolean' || (g.winnerId !== null && !factionIds.includes(String(g.winnerId))) || (g.winCondition !== null && !['military','economic','technology','diplomatic','cultural'].includes(String(g.winCondition)))) return false;
  if (!record(g.aiTreasuryStreaks) || !Object.entries(g.aiTreasuryStreaks).every(([id,n]) => factionIds.includes(id) && Number.isFinite(n))) return false;
  if (g.lastCollection !== null && (!record(g.lastCollection) || !['taxIncome','manpowerGain','marketBonus','silkRoadBonus','foodChange','artisansGain','horsesGain','influenceGain','prestigeGain'].every(key => finite(g.lastCollection && (g.lastCollection as Record<string, unknown>)[key])))) return false;
  const realms = new Set((g.factions as Record<string, unknown>[]).map(f => f.id));
  const places = new Set((g.provinces as Record<string, unknown>[]).map(p => p.id));
  return places.size === g.provinces.length && realms.has(g.playerFactionId) && (g.factions as Record<string, unknown>[]).every(f => places.has(f.capitalId)) && (g.provinces as Record<string, unknown>[]).every(p => (p.ownerId === null || realms.has(p.ownerId)) && (p.neighbors as string[]).every(id => places.has(id))) && (g.armies as Record<string, unknown>[]).every(a => realms.has(a.ownerId) && places.has(a.provinceId)) && (g.relations as Record<string, unknown>[]).every(r => realms.has(r.factionA) && realms.has(r.factionB));
}
function validSave(value: unknown): value is SaveFile {
  return isObject(value) && validMeta(value.meta) && validGame(value.state);
}
function removeLegacyArmyStats(state: GameState): GameState {
  const provinces = state.provinces.map(province => {
    const cleaned = { ...province } as typeof province & { supply?: unknown };
    delete cleaned.supply;
    return cleaned;
  });
  const armies = state.armies.map(army => {
    const cleaned = { ...army } as typeof army & { morale?: unknown; supply?: unknown };
    delete cleaned.morale;
    delete cleaned.supply;
    return cleaned;
  });
  return { ...state, provinces, armies };
}

/** Browser save slots: autosave at 0 and five manual slots, stored as checked JSON envelopes. */
export class SaveRepository {
  static readonly AUTOSAVE = 0;
  static readonly SLOTS = 5;
  static readonly FORMAT_VERSION = 1;
  readonly slots: Store<Record<number, SaveMeta>> = createStore({});
  private handoff: [number, GameState] | null = null;
  constructor(private readonly clock: () => number = Date.now) {}

  refresh(): void {
    const metas: Record<number, SaveMeta> = {};
    for (let slot = 0; slot <= SaveRepository.SLOTS; slot++) {
      const save = this.read(slot);
      if (save) metas[slot] = save.meta;
    }
    this.slots.set(metas);
  }

  save(slot: number, state: GameState): boolean {
    if (!Number.isInteger(slot) || slot < 0 || slot > SaveRepository.SLOTS || !validGame(state) || !isPlayable(state)) return false;
    const meta: SaveMeta = { slot, savedAt: this.clock(), turn: state.turn, year: state.year, faction: state.playerFactionId, provinces: state.provinces.filter(p => p.ownerId === state.playerFactionId).length, difficulty: state.difficulty, version: SaveRepository.FORMAT_VERSION };
    if (!writeSecure(key(slot), { meta, state }, SaveRepository.FORMAT_VERSION)) return false;
    this.slots.set(current => ({ ...current, [slot]: meta }));
    return true;
  }
  autosave(state: GameState): boolean { return this.save(SaveRepository.AUTOSAVE, state); }

  load(slot: number): GameState | null {
    const save = this.read(slot);
    if (!save) {
      this.slots.set(current => { const next = { ...current }; delete next[slot]; return next; });
      return null;
    }
    return save.state;
  }
  loadNow(slot: number): GameState | null { return this.load(slot); }
  delete(slot: number): void {
    removeSecure(key(slot));
    this.slots.set(current => { const next = { ...current }; delete next[slot]; return next; });
  }
  continueSlot(): number | null {
    const all = this.slots.get();
    return SaveRepository.AUTOSAVE in all ? SaveRepository.AUTOSAVE : Object.values(all).sort((a, b) => b.savedAt - a.savedAt)[0]?.slot ?? null;
  }
  handOff(slot: number, state: GameState): void { this.handoff = [slot, state]; }
  takeOrLoad(slot: number): GameState | null {
    const pending = this.handoff; this.handoff = null;
    return pending?.[0] === slot ? pending[1] : this.loadNow(slot);
  }
  private read(slot: number): SaveFile | null {
    if (!Number.isInteger(slot) || slot < 0 || slot > SaveRepository.SLOTS) return null;
    const save = readSecure<SaveFile | null>(key(slot), (v): v is SaveFile | null => v === null || validSave(v), null, SaveRepository.FORMAT_VERSION);
    if (!save || save.meta.version > SaveRepository.FORMAT_VERSION || !isPlayable(save.state)) {
      if (save) logSecurityEvent('save_invalid', `slot:${slot}`);
      return null;
    }
    return { ...save, state: removeLegacyArmyStats(save.state) };
  }
}

/** Checks referential integrity before a player save is opened; saves remain user-owned single-player data. */
export function isPlayable(state: GameState): boolean {
  try {
    if (!state || !Array.isArray(state.factions) || !Array.isArray(state.provinces) || !Array.isArray(state.armies) || !Array.isArray(state.relations)) return false;
    const factions = new Set(state.factions.filter(f => f && typeof f.id === 'string').map(f => f.id));
    const provinces = new Set(state.provinces.filter(p => p && typeof p.id === 'string').map(p => p.id));
    return Number.isInteger(state.turn) && state.turn >= 1 && factions.has(state.playerFactionId) && provinces.size === state.provinces.length && state.factions.every(f => !!f && provinces.has(f.capitalId)) && state.provinces.every(p => !!p && (p.ownerId === null || factions.has(p.ownerId)) && Array.isArray(p.neighbors) && p.neighbors.every(id => provinces.has(id))) && state.armies.every(a => !!a && factions.has(a.ownerId) && provinces.has(a.provinceId)) && state.relations.every(r => !!r && factions.has(r.factionA) && factions.has(r.factionB));
  } catch { return false; }
}

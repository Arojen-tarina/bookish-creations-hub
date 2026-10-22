import type { GameState, BattleReport } from '../game/model/models';
import { BUILDING_INFO, isWar } from '../game/model/enums';
import { buildingsIn, relationBetween } from '../game/model/models';
import type { AchievementDef } from '../game/achievements/achievementModel';

export interface AnalyticsEvent { name: string; payload: Record<string, unknown> }
const event = (name: string, payload: Record<string, unknown> = {}): AnalyticsEvent => ({ name, payload });
export const ALLOWED_EVENTS = new Set(['session_start','session_end','onboarding_step','game_start','game_over','campaign_restart','game_saved','game_loaded','progression_snapshot','battle_outcome','building_constructed','army_recruited','card_played','treaty_proposed','treaty_broken','war_declared','achievement_unlocked','menu_interaction','settings_changed','experiment_assigned']);
export const Onboarding = { FACTION_SELECT_VIEWED: 'faction_select_viewed', FACTION_CHOSEN: 'faction_chosen', TURN_1_COMPLETED: 'turn_1_completed', TURN_5_COMPLETED: 'turn_5_completed', FIRST_BATTLE: 'first_battle', FIRST_BUILDING: 'first_building' } as const;
export const Events = {
  ALLOWED: ALLOWED_EVENTS,
  Onboarding,
  sessionStart: (clientId: string, sessionId: string, daysSinceFirstOpen: number, isNewPlayer: boolean) => event('session_start', { clientId, sessionId, daysSinceFirstOpen, isNewPlayer }),
  sessionEnd: (sessionId: string, durationMs: number, turnsThisSession: number) => event('session_end', { sessionId, durationMs, turnsThisSession }),
  onboarding: (step: string) => event('onboarding_step', { step: Object.prototype.hasOwnProperty.call(Onboarding, step) ? Onboarding[step as keyof typeof Onboarding] : step }),
  gameStart: (state: GameState, isContinue: boolean) => event('game_start', { faction: state.playerFactionId, difficulty: state.difficulty, isContinue }),
  gameOver: (state: GameState, sessionTurns: number) => event('game_over', { faction: state.playerFactionId, won: state.winnerId === state.playerFactionId, winCondition: state.winCondition, turn: state.turn, year: state.year, sessionTurns }),
  campaignRestart: (state: GameState) => event('campaign_restart', { faction: state.playerFactionId, turnAtRestart: state.turn, midGame: !state.gameOver }),
  gameSaved: (slot: number) => event('game_saved', { slot: slot === 0 ? 'auto' : slot }),
  gameLoaded: (slot: number) => event('game_loaded', { slot: slot === 0 ? 'auto' : slot }),
  battleOutcome: (report: BattleReport, state: GameState) => { const attacking = report.attackerFaction === state.playerFactionId; const losses = attacking ? report.attackerLosses : report.defenderLosses; return event('battle_outcome', { faction: state.playerFactionId, won: report.attackerWon === attacking, isAttacker: attacking, turn: state.turn, attackerPower: report.attackerPower, defenderPower: report.defenderPower, unitsLost: losses.cavalry + losses.infantry }); },
  achievementUnlocked: (def: AchievementDef, sessionsSinceFirstOpen: number) => event('achievement_unlocked', { id: def.id, category: String(def.category).toLowerCase(), difficulty: String(def.difficulty).toLowerCase(), points: def.points, sessionsSinceFirstOpen }),
  menuInteraction: (target: string) => event('menu_interaction', { target }),
  settingsChanged: (setting: string, value: string) => event('settings_changed', { setting, value }),
  fromStateChange(prev: GameState, next: GameState, sessionTurns: number): AnalyticsEvent[] {
    if (prev.playerFactionId !== next.playerFactionId || next.turn < prev.turn) return [];
    const player = next.playerFactionId, turn = next.turn, events: AnalyticsEvent[] = [];
    const oldArmies = new Set(prev.armies.filter(army => army.ownerId === player).map(army => army.id));
    for (const army of next.armies) {
      if (army.ownerId !== player || oldArmies.has(army.id)) continue;
      events.push(event('army_recruited', { type: army.cavalry > army.infantry ? 'cavalry' : 'infantry', turn }));
    }
    for (const province of next.provinces) {
      if (province.ownerId !== player) continue;
      const current = buildingsIn(next, province.id), prior = buildingsIn(prev, province.id);
      for (const type of current.slice(prior.length)) events.push(event('building_constructed', { type, turn, goldCost: BUILDING_INFO[type].goldCost }));
    }
    const remaining = new Map<string, number>();
    for (const card of next.hand) remaining.set(card.id, (remaining.get(card.id) ?? 0) + 1);
    for (const card of prev.hand) {
      const count = remaining.get(card.id) ?? 0;
      if (count > 0) { remaining.set(card.id, count - 1); continue; }
      events.push(event('card_played', { cardId: card.id, cardType: card.type, rarity: card.rarity, turn }));
    }
    for (const relation of next.relations) {
      if (relation.factionA !== player && relation.factionB !== player) continue;
      const targetFaction = relation.factionA === player ? relation.factionB : relation.factionA;
      const before = new Set(relationBetween(prev, relation.factionA, relation.factionB)?.treaties.map(treaty => treaty.type) ?? []);
      const after = new Set(relation.treaties.map(treaty => treaty.type));
      for (const treatyType of after) if (!before.has(treatyType)) events.push(isWar(treatyType) ? event('war_declared', { targetFaction, turn }) : event('treaty_proposed', { targetFaction, treatyType, turn }));
      for (const treatyType of before) if (!after.has(treatyType)) events.push(event('treaty_broken', { targetFaction, treatyType, turn }));
    }
    if (next.turn === prev.turn + 1) {
      const owned = next.provinces.filter(province => province.ownerId === player);
      events.push(event('progression_snapshot', { turn, faction: player, difficulty: next.difficulty, provincesOwned: owned.length, treasury: next.factions.find(faction => faction.id === player)?.treasury ?? 0, armiesOwned: next.armies.filter(army => army.ownerId === player).length, buildingsOwned: owned.reduce((sum, province) => sum + buildingsIn(next, province.id).length, 0) }));
      if (prev.turn === 1) events.push(this.onboarding(Onboarding.TURN_1_COMPLETED));
      if (prev.turn === 5) events.push(this.onboarding(Onboarding.TURN_5_COMPLETED));
    }
    if (next.gameOver && !prev.gameOver) events.push(this.gameOver(next, sessionTurns));
    return events;
  },
};

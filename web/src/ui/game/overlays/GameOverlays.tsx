import { useEffect, useRef, useState } from 'react';
import type { Army, GameState } from '../../../game/model/models';
import { playerOf } from '../../../game/model/models';
import { VictoryTargets } from '../../../game/data/gameData';
import { factionColor } from '../factionStyle';
import { buildingName, factionName, treatyName, victoryText } from '../GameText';
import { ALL_FACTIONS, ALL_BUILDINGS, ALL_TREATY_TYPES } from '../../../game/model/enums';
import { useLocale, t } from '../../../i18n';
import type { CardText } from '../panels/RealmPanels';
import { GameButton } from '../../components/GameButton';
import { GameIcon, type GameIconName } from '../../icons/GameIcons';

export interface GameMessage { key: string; args?: Array<string | number>; tone?: 'positive' | 'negative' | 'neutral' }
export function AiTurnOverlay({ visible }: { visible: boolean }) {
  useLocale(); if (!visible) return null;
  return <div className="game-overlay ai-turn-overlay"><div className="game-dialog"><span className="game-spinner" /> {t('phase_ai_acting')}</div></div>;
}
export function GameOverDialog({ game, onPlayAgain, onMainMenu, onSecondChance }: { game: GameState; onPlayAgain: () => void; onMainMenu: () => void; onSecondChance?: (() => void) | null }) {
  useLocale();
  const won = game.winnerId === game.playerFactionId;
  const body = won ? victoryText(game.winCondition) : game.winnerId ? t('game_over_defeat_by', factionName(game.winnerId)) : t('game_over_defeat_text');
  return <div className="game-overlay"><section className="game-dialog game-over-dialog" role="dialog" aria-modal="true"><GameIcon name={won ? 'Trophy' : 'Swords'} width={60} style={{ color: won ? '#e0a944' : '#c2533a' }} /><h1 style={{ color: won ? '#f2c46b' : '#c2533a' }}>{t(won ? 'game_over_victory' : 'game_over_defeat')}</h1><p className="game-divider" /><p>{body}</p><p className="game-muted">{t('game_over_turn_year', game.turn, game.year)}</p>{onSecondChance && <GameButton className="second-chance-button" onClick={onSecondChance}><GameIcon name="Rewind" width={23} /><span><strong>{t('second_chance_title')}</strong><small>{t('second_chance_body')}</small></span></GameButton>}<div className="game-action-row" style={{ justifyContent: 'center', marginTop: 10 }}><GameButton variant="Secondary" onClick={onMainMenu}>{t('game_over_main_menu')}</GameButton><GameButton onClick={onPlayAgain}>{t('game_over_play_again')}</GameButton></div></section></div>;
}
export interface PauseActions { onToggleMusic: () => void; onResume: () => void; onSave: () => void; onLoad: () => void; onRulebook: () => void; onSettings: () => void; onExit: () => void }
export function PauseMenuDialog({ musicMuted, actions }: { musicMuted: boolean; actions: PauseActions }) {
  useLocale(); const [confirm, setConfirm] = useState(false);
  return <div className="game-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) actions.onResume(); }}><section className="game-dialog pause-dialog" role="dialog" aria-modal="true"><h2>{t(confirm ? 'pause_exit_confirm_title' : 'pause_title')}</h2>{confirm ? <><p>{t('pause_exit_confirm_body')}</p><div className="game-action-row" style={{ justifyContent: 'center' }}><GameButton variant="Secondary" onClick={() => setConfirm(false)}>{t('pause_exit_confirm_no')}</GameButton><GameButton onClick={actions.onExit}>{t('pause_exit_confirm_yes')}</GameButton></div></> : <><div className="game-action-row"><GameButton onClick={actions.onResume}>{t('pause_resume')}</GameButton><GameButton variant="Secondary" onClick={actions.onToggleMusic}><GameIcon name={musicMuted ? 'SoundOff' : 'SoundOn'} width={18} /> {t(musicMuted ? 'hud_mute_on' : 'hud_mute_off')}</GameButton></div><div className="game-action-row">{[['pause_save', actions.onSave], ['pause_load', actions.onLoad], ['pause_rulebook', actions.onRulebook], ['pause_settings', actions.onSettings]].map(([label, cb]) => <GameButton key={String(label)} compact variant="Secondary" onClick={cb as () => void}>{t(String(label))}</GameButton>)}</div><GameButton variant="Secondary" onClick={() => setConfirm(true)}>{t('pause_exit')}</GameButton></>}</section></div>;
}
export function MessageToast({ message, cardTexts, onDone }: { message: GameMessage | null; cardTexts: Record<string, CardText>; onDone: () => void }) {
  useLocale();
  const doneRef = useRef(onDone); doneRef.current = onDone;
  useEffect(() => { if (!message) return; const timer = window.setTimeout(() => doneRef.current(), 2600); return () => window.clearTimeout(timer); }, [message]);
  if (!message) return null;
  const args = (message.args ?? []).map((arg) => {
    if (typeof arg !== 'string') return arg;
    if (cardTexts[arg]?.n) return cardTexts[arg].n;
    if ((ALL_FACTIONS as string[]).includes(arg)) return factionName(arg as import('../../../game/model/enums').FactionId);
    if ((ALL_BUILDINGS as string[]).includes(arg)) return buildingName(arg as import('../../../game/model/enums').BuildingType);
    if ((ALL_TREATY_TYPES as string[]).includes(arg)) return treatyName(arg as import('../../../game/model/enums').TreatyType);
    return arg;
  });
  return <div className="game-toast" style={{ borderColor: message.tone === 'positive' ? '#5ba374' : message.tone === 'negative' ? '#c2533a' : '#e0a944' }}><i style={{ display: 'inline-block', width: 9, height: 9, borderRadius: '50%', marginRight: 9, background: message.tone === 'positive' ? '#5ba374' : message.tone === 'negative' ? '#c2533a' : '#e0a944' }} />{t(message.key, ...args)}</div>;
}
export function IncomeToast({ game, visible }: { game: GameState; visible: boolean }) {
  useLocale(); const c = game.lastCollection; if (!visible || !c) return null;
  const values: Array<[GameIconName, number, string]> = [['Chest', c.taxIncome, 'Gold'], ['People', c.manpowerGain, 'Manpower'], ['Leaf', c.foodChange, 'Food'], ['Horseshoe', c.horsesGain, 'Horses'], ['Hammer', c.artisansGain, 'Artisans'], ['Seal', c.influenceGain, 'Influence'], ['Temple', c.prestigeGain, 'Prestige']];
  return <div className="game-toast income-toast"><strong>{t('resource_collected')}</strong><div className="income-values">{values.filter(([, n], i) => i < 3 || n !== 0).map(([icon, n, key]) => <span key={key} style={{ color: n < 0 ? '#c2533a' : undefined }}><GameIcon name={icon} width={15} /> {n >= 0 ? '+' : ''}{n}</span>)}</div>{(c.silkRoadBonus || c.marketBonus) ? <small>{c.silkRoadBonus ? `${t('resource_silk_road')} +${c.silkRoadBonus} ` : ''}{c.marketBonus ? `${t('resource_market')} +${c.marketBonus}` : ''}</small> : null}</div>;
}
export function ArmyBanner({ army, attackPower }: { army: Army; attackPower: number }) {
  useLocale(); return <div className="game-toast army-banner"><span>♞ {army.cavalry}</span><span>⚔ {army.infantry}</span>{army.siege > 0 && <span>♜ {army.siege}</span>}<span aria-label={`${t('battle_attack_label')} ${attackPower}`}><GameIcon name="Swords" contentDescription={t('battle_attack_label')} width={14} /> {attackPower}</span><span>➤ {army.movementLeft}</span><small>{t('army_banner_hint')}</small></div>;
}
export function EngagementLayer({ game }: { game: GameState }) {
  const previous = useRef<{ gold: number; manpower: number; provinces: number; turn: number } | null>(null);
  const [streak, setStreak] = useState(0), [floats, setFloats] = useState<Array<{ id: number; text: string; icon: string; color: string }>>([]);
  useEffect(() => {
    const now = { gold: playerOf(game).treasury, manpower: playerOf(game).manpower, provinces: game.provinces.filter((p) => p.ownerId === game.playerFactionId).length, turn: game.turn }, before = previous.current;
    previous.current = now; if (!before) return;
    const delta = now.provinces - before.provinces;
    if (delta < 0) setStreak(0); else if (now.turn > before.turn) setStreak((x) => x + 1);
    const gains = [[now.gold - before.gold, '◉', '#fcd34d'], [now.manpower - before.manpower, '♟', '#bfdbfe'], [delta, '⌖', '#5ba374']].filter(([d]) => Number(d) >= (Number(d) === delta ? 1 : 3)) as Array<[number, string, string]>;
    if (!gains.length) return;
    const id = Date.now(); setFloats((old) => [...old, ...gains.map(([d, icon, color], i) => ({ id: id + i, text: `${d > 0 ? '+' : ''}${d}`, icon, color }))]);
    const timer = window.setTimeout(() => setFloats((old) => old.filter((x) => x.id < id || x.id >= id + gains.length)), 2000); return () => window.clearTimeout(timer);
  }, [game]);
  return <div className="engagement-layer">{streak >= 3 && <div className="streak-counter">⚑ {t('streak_label', streak)}</div>}{floats.map((f) => <div key={f.id} className="floating-gain" style={{ color: f.color }}>{f.icon} {f.text}</div>)}</div>;
}

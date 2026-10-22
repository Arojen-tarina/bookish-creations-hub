import { useLocale, t } from '../../../i18n';
import { VictoryTargets } from '../../../game/data/gameData';
import { relationBetween, playerOf, type GameState } from '../../../game/model/models';
import { factionColor } from '../factionStyle';
import { factionName, turnLogText } from '../GameText';
import { GameIcon } from '../../icons/GameIcons';

export interface CardText { n: string; d: string; e: string; c?: string | null; s: string }
function Goal({ icon, title, value, max, color }: { icon: string; title: string; value: number; max: number; color: string }) {
  return <div><div className="game-row"><span style={{ color }}>{icon}　{title}</span><strong>{Math.min(value, max)} / {max}</strong></div><div className="game-progress"><i style={{ width: `${Math.max(0, Math.min(1, value / max)) * 100}%`, background: color }} /></div></div>;
}
export function RealmPanel({ game, cardTexts = {} }: { game: GameState; cardTexts?: Record<string, CardText> }) {
  useLocale();
  const player = game.playerFactionId, owned = game.provinces.filter((p) => p.ownerId === player).length;
  const survivors = game.factions.filter((f) => f.id !== player && game.provinces.some((p) => p.ownerId === f.id));
  const allies = survivors.filter((f) => relationBetween(game, player, f.id)?.treaties.some((x) => x.type === 'alliance')).length;
  const alliesTarget = Math.max(VictoryTargets.DIPLOMATIC_MIN_ALLIES, survivors.length);
  const totalSilk = game.provinces.filter((p) => p.hasSilkRoad).length;
  return <>
    <section className="game-section"><h3><GameIcon name="Trophy" width={16} />　{t('ui_victory_goals')}</h3>
      <Goal icon="⚔" title={t('faction_goal_military_sub')} value={owned} max={VictoryTargets.PROVINCES} color="#f87171" />
      <Goal icon="◉" title={t('faction_goal_economic_sub')} value={playerOf(game).treasury} max={VictoryTargets.GOLD} color="#fbbf24" />
      <Goal icon="▤" title={t('faction_goal_tech_sub')} value={game.playedTechCards.length} max={VictoryTargets.TECH} color="#38bdf8" />
      <Goal icon="⚖" title={t('faction_goal_diplomatic_sub')} value={Math.max(game.influence / VictoryTargets.INFLUENCE, allies / Math.max(1, alliesTarget)) * 100} max={100} color="#34d399" />
      <Goal icon="♜" title={t('faction_goal_cultural_sub')} value={game.prestige} max={VictoryTargets.PRESTIGE} color="#c084fc" />
      <div className="game-muted">{t('goal_diplomatic_progress', game.influence, VictoryTargets.INFLUENCE, allies, alliesTarget)}</div>
    </section>
    <section className="game-section"><h3><GameIcon name="Crown" width={16} />　{t('ui_realm_status')}</h3>{game.factions.map((f) => {
      const count = game.provinces.filter((p) => p.ownerId === f.id).length, silk = game.provinces.filter((p) => p.hasSilkRoad && p.ownerId === f.id).length;
      const streak = f.id === player ? game.treasuryStreak : game.aiTreasuryStreaks[f.id] ?? 0;
      const near = f.treasury >= VictoryTargets.GOLD && totalSilk > 0 && silk * 2 > totalSilk;
      return <div key={f.id} style={{ margin: '8px 0' }}><div className="game-status"><i style={{ width: 10, height: 10, borderRadius: '50%', background: factionColor(f.id) }} /><strong style={{ color: f.id === player ? '#f2c46b' : '#f4ead5' }}>{factionName(f.id)} {f.id === player ? `(${t('ui_you_suffix')})` : ''}</strong></div><div className="game-muted" style={{ paddingLeft: 16 }}>{count} provinces　◉ {f.treasury}　♨ {silk}/{totalSilk}{near && <span style={{ color: '#c2533a' }}>　{t('realm_streak', streak, VictoryTargets.TREASURY_STREAK)}</span>}</div></div>;
    })}</section>
    {(game.attackBonus || game.defenseBonus || game.movementBonus) ? <section className="game-section"><h3>{t('ui_active_bonuses')}</h3>{game.attackBonus > 0 && <p>⚔ +{game.attackBonus} {t('ui_bonus_attack')}</p>}{game.defenseBonus > 0 && <p>⬟ +{game.defenseBonus} {t('ui_bonus_defense')}</p>}{game.movementBonus > 0 && <p>➤ +{game.movementBonus} {t('ui_bonus_movement')}</p>}</section> : null}
    {game.playedTechCards.length > 0 && <section className="game-section"><h3>{t('ui_technologies', game.playedTechCards.length)}</h3>{game.playedTechCards.map((c) => <p key={c.id}><strong>{cardTexts[c.id]?.n ?? c.id}:</strong> {cardTexts[c.id]?.s ?? ''}</p>)}</section>}
    <section className="game-section"><h3>{t('ui_statistics')}</h3><div className="game-row"><span>{t('ui_stat_provinces')}</span><strong>{owned} / {game.provinces.length}</strong></div><div className="game-row"><span>{t('ui_armies')}</span><strong>{game.armies.filter((a) => a.ownerId === player).length}</strong></div><div className="game-row"><span>{t('ui_stat_cards')}</span><strong>{game.hand.length}</strong></div><div className="game-row"><span>{t('ui_stat_buildings')}</span><strong>{Object.values(game.buildings).reduce((n, b) => n + b.length, 0)}</strong></div></section>
  </>;
}
export function ChroniclePanel({ game }: { game: GameState }) {
  useLocale();
  return <section className="game-section"><h3><GameIcon name="Scroll" width={16} />　{t('ui_ai_log')}</h3>{game.turnLog.length === 0 ? <p className="game-muted">{t('ui_no_events')}</p> : <><div className="game-label">{t('log_turn_header', game.turn - 1, game.year - 1)}</div>{game.turnLog.map((entry, i) => <div className="game-status" key={`${entry.kind}-${i}`} style={{ alignItems: 'flex-start', marginTop: 7 }}><i style={{ width: 8, height: 8, borderRadius: '50%', marginTop: 4, background: factionColor(entry.factionId) }} /><span>{turnLogText(entry, game)}</span></div>)}</>}</section>;
}

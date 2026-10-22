import { useState } from 'react';
import { ALL_TREATY_TYPES, isWar, type FactionId, type TreatyType } from '../../../game/model/enums';
import { factionById, relationBetween, type GameState } from '../../../game/model/models';
import { factionColor } from '../factionStyle';
import { factionName, treatyDescription, treatyName, rulerName } from '../GameText';
import { useLocale, t } from '../../../i18n';
import { GameButton } from '../../components/GameButton';
import { GameIcon } from '../../icons/GameIcons';
const OFFERABLE: TreatyType[] = ['non_aggression', 'trade_agreement', 'alliance', 'peace', 'war_surprise', 'war_formal'];
export function DiplomacyPanel({ game, onPropose, onBreak }: { game: GameState; onPropose: (id: FactionId, treaty: TreatyType) => void; onBreak: (id: FactionId, treaty: TreatyType) => void }) {
  useLocale();
  const [expanded, setExpanded] = useState<FactionId | null>(null);
  return <><p className="game-muted">{t('dipl_subtitle')}</p>{game.factions.filter((f) => f.id !== game.playerFactionId).map((rival) => {
    const rel = relationBetween(game, game.playerFactionId, rival.id); if (!rel) return null;
    const isOpen = expanded === rival.id, active = [...new Set(rel.treaties.map((x) => x.type))], used = rel.lastProposalTurn === game.turn;
    const [relationLabel, color] = rel.relation > 30 ? ['rel_friendly', '#5ba374'] : rel.relation > 0 ? ['rel_positive', '#5ba374'] : rel.relation > -30 ? ['ui_neutral', '#e0a944'] : rel.relation > -60 ? ['rel_hostile', '#c2533a'] : ['rel_enemy', '#c2533a'];
    const ruler = rulerName(rival.id);
    return <section className="game-section" key={rival.id} style={{ borderColor: `${factionColor(rival.id)}88`, cursor: 'pointer' }} onClick={() => setExpanded(isOpen ? null : rival.id)}>
      <div className="game-row"><span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><i style={{ width: 30, height: 30, borderRadius: '50%', background: factionColor(rival.id), display: 'inline-flex', justifyContent: 'center', alignItems: 'center' }}><GameIcon name="Crown" width={18} /></i><span><strong>{factionName(rival.id)}</strong>{ruler && <small className="game-muted" style={{ display: 'block' }}>{t('dipl_ruled_by', ruler)}</small>}</span></span><strong style={{ color }}>{t(relationLabel)}</strong></div>
      <div className="game-row"><span className="game-label">{t('dipl_relation')}</span><div className="game-progress" style={{ flex: 1 }}><i style={{ width: `${(rel.relation + 100) / 2}%`, background: color }} /></div><span className="game-label">{rel.relation >= 0 ? '+' : ''}{rel.relation}</span></div>
      {active.length > 0 && <div className="game-action-row">{active.map((type) => <span key={type} className="game-pill" style={{ color: isWar(type) ? '#c2533a' : undefined }}>{treatyName(type)}</span>)}</div>}
      {isOpen && <div onClick={(e) => e.stopPropagation()} style={{ marginTop: 12 }}><div className="game-row"><span>{t('dipl_trust')} {rel.trust}</span><span>{t('dipl_threat')} {rel.threat}</span></div><div className="game-label">{t('dipl_propose')} · {t('dipl_one_proposal')}</div><div style={{ display: 'grid', gap: 6, marginTop: 7 }}>{OFFERABLE.filter((type) => !active.includes(type)).map((type) => <div key={type} className="game-row" style={{ alignItems: 'flex-start', borderTop: '1px solid #43372a' }}><div style={{ flex: 1 }}><strong>{treatyName(type)}</strong><div className="game-label">{treatyDescription(type)}</div></div><GameButton compact variant={isWar(type) ? undefined : 'Secondary'} disabled={!isWar(type) && used} onClick={() => onPropose(rival.id, type)}>{treatyName(type)}</GameButton></div>)}</div>{active.length > 0 && <><div className="game-label" style={{ color: '#c2533a', marginTop: 10 }}>{t('dipl_break_treaty')}</div><div className="game-action-row">{active.map((type) => <GameButton key={type} compact variant="Secondary" onClick={() => onBreak(rival.id, type)}>{treatyName(type)} ×</GameButton>)}</div></>}</div>}
      <span className="game-label">{isOpen ? '▲' : '▼'} {t('dipl_relation')}</span>
    </section>;
  })}</>;
}

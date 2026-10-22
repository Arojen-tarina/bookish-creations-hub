import { useEffect, useState } from 'react';
import type { Army, BattleReport, FactionId } from '../../../game/model/models';
import { useLocale, t } from '../../../i18n';
import { factionColor, factionSprite } from '../factionStyle';
import { factionName } from '../GameText';
import { asset } from '../../../assets';
import { GameButton } from '../../components/GameButton';
import { GameIcon } from '../../icons/GameIcons';

function Die({ n, color }: { n: number; color: string }) { return <span className="battle-die" style={{ borderColor: color, color }}>{n}</span>; }
function Combatant({ army, faction, role, cavalryLoss, infantryLoss, reveal }: { army: Army; faction: FactionId; role: string; cavalryLoss: number; infantryLoss: number; reveal: boolean }) {
  const kind = army.id === `army-${army.ownerId}-main` || army.leaderBonus > 0 ? 'leader' : army.cavalry >= army.infantry && army.cavalry > 0 ? 'cavalry' : 'infantry';
  return <div className="battle-combatant" style={{ borderColor: `${factionColor(faction)}aa`, background: `linear-gradient(${factionColor(faction)}35,#120f0c99)` }}><strong style={{ color: factionColor(faction) }}>{factionName(faction)}</strong><small>{role}</small><img src={asset(factionSprite(kind, faction))} alt="" /><span>♞ {Math.max(0, army.cavalry - (reveal ? cavalryLoss : 0))}{reveal && cavalryLoss > 0 && <em> −{cavalryLoss}</em>}</span><span>⚔ {Math.max(0, army.infantry - (reveal ? infantryLoss : 0))}{reveal && infantryLoss > 0 && <em> −{infantryLoss}</em>}</span></div>;
}
export function BattleDialog({ battle, provinceName, captured, onClose }: { battle: BattleReport; provinceName: string; captured: boolean; onClose: () => void }) {
  useLocale();
  const [phase, setPhase] = useState(0), [dice, setDice] = useState<[number, number]>([1, 1]);
  useEffect(() => {
    let done = false;
    const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));
    (async () => {
      await wait(650); if (done) return; setPhase(1); await wait(700); if (done) return; setPhase(2);
      for (let i = 0; i < 14; i++) { setDice([1 + Math.floor(Math.random() * 6), 1 + Math.floor(Math.random() * 6)]); await wait(90); if (done) return; }
      setDice([battle.attackRoll, battle.defenseRoll]); setPhase(3); await wait(1000); if (done) return; setPhase(4); await wait(1300); if (!done) setPhase(5);
    })(); return () => { done = true; };
  }, [battle]);
  const skip = () => { setDice([battle.attackRoll, battle.defenseRoll]); setPhase(5); };
  const winner = battle.attackerWon ? battle.attackerFaction : battle.defenderFaction;
  return <div className="game-overlay" role="presentation" onClick={() => phase === 5 ? onClose() : skip()}><section className="game-dialog battle-dialog" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
    <h2><GameIcon name="Swords" width={22} />　{t('battle_title', provinceName)}</h2><div className="game-muted" style={{ textAlign: 'center' }}>{t('battle_versus', factionName(battle.attackerFaction), factionName(battle.defenderFaction))}</div>
    <div className="battle-line"><Combatant army={battle.attacker} faction={battle.attackerFaction} role={t('battle_attacker')} cavalryLoss={battle.attackerLosses.cavalry} infantryLoss={battle.attackerLosses.infantry} reveal={phase >= 4} /><div className="battle-center">{phase === 0 ? <strong>{t('battle_clash')}</strong> : <><small>{t('battle_dice')}</small><div><Die n={phase >= 2 ? dice[0] : 1} color="#f87171" /><Die n={phase >= 2 ? dice[1] : 1} color="#6b9ac4" /></div>{phase >= 3 && <><small>{t('battle_total_power')}</small><strong style={{ color: '#f87171' }}>{battle.attackerPower}</strong><b> : </b><strong style={{ color: '#6b9ac4' }}>{battle.defenderPower}</strong></>}</>}</div><Combatant army={battle.defender} faction={battle.defenderFaction} role={t('battle_defender')} cavalryLoss={battle.defenderLosses.cavalry} infantryLoss={battle.defenderLosses.infantry} reveal={phase >= 4} /></div>
    {phase >= 5 ? <div className="battle-result"><h2 style={{ color: factionColor(winner) }}>{battle.attackerWon ? t('battle_attacker_wins', factionName(battle.attackerFaction)) : t('battle_defender_holds', factionName(battle.defenderFaction))}</h2><p>{t(!battle.attackerWon ? 'battle_attack_repelled' : captured ? 'battle_province_taken' : 'battle_walls_hold')}</p><GameButton onClick={onClose}>{t('battle_continue')}</GameButton></div> : <div className="game-label" style={{ textAlign: 'center', marginTop: 8 }}>{t('battle_skip')}</div>}
  </section></div>;
}

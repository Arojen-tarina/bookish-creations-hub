import { BUILDING_INFO, type BuildingType, type RecruitType } from '../../../game/model/enums';
import { Rules } from '../../../game/data/gameData';
import { attackPower, defenseBreakdown, fortDurabilityOrFull, isFortDamaged } from '../../../game/engine/combat';
import { buildBlocker, recruitBlocker, repairFortBlocker } from '../../../game/engine/playerActions';
import { playerOf, type Army, type GameState, type Province } from '../../../game/model/models';
import { factionColor } from '../factionStyle';
import { buildingEffect, buildingName, factionName, terrainName, tradeGoodEffect, tradeGoodName } from '../GameText';
import { useLocale, t } from '../../../i18n';
import { GameIcon, type GameIconName } from '../../icons/GameIcons';
import { GameButton } from '../../components/GameButton';

export interface ProvinceActions { onSelectArmy: (id: string) => void; onMergeInto: (id: string) => void; onRecruit: (type: RecruitType) => void; onRepair: (artisan: boolean) => void; onBuild: (type: BuildingType) => void }
const buildIcons: Record<BuildingType, GameIconName> = { camp: 'Tent', market: 'Market', fortress: 'Castle', workshop: 'Anvil', stable: 'Horseshoe', bridge: 'Bridge', wonder: 'Temple' };
const BUILDINGS: BuildingType[] = ['camp', 'market', 'fortress', 'workshop', 'stable', 'bridge', 'wonder'];
const fmt = (n: number) => Number.isInteger(n) ? String(n) : n.toFixed(1);
const section = (title: string, children: React.ReactNode) => <section className="game-section"><h3>{title}</h3>{children}</section>;
const Stat = ({ label, value, icon }: { label: string; value: string | number; icon: string }) => <div style={{ flex: 1, padding: 8, background: '#31281f', borderRadius: 9, textAlign: 'center' }}><div aria-hidden>{icon}</div><strong>{value}</strong><div className="game-label">{label}</div></div>;
function costs(type: BuildingType) { return BUILDING_INFO[type]; }
function buildBlock(game: GameState, p: Province, type: BuildingType): string | null {
  const reason = buildBlocker(game, p.id, type);
  return reason ? `block_${reason.toLowerCase()}` : null;
}
function recruitBlock(game: GameState, p: Province, kind: RecruitType): string | null {
  const reason = recruitBlocker(game, p.id, kind);
  return reason ? `block_${reason.toLowerCase()}` : null;
}
function ArmyRow({ army, player, attack, selected, selectedOther, onSelect, onMerge }: { army: Army; player: boolean; attack: number; selected: boolean; selectedOther: boolean; onSelect: () => void; onMerge: () => void }) {
  const label = t;
  return <div style={{ padding: 9, borderRadius: 9, marginTop: 6, border: `1px solid ${selected ? '#e0a944' : factionColor(army.ownerId)}`, background: selected ? '#e0a94425' : '#31281f' }}>
    <button className="game-status" disabled={!player} onClick={onSelect} style={{ background: 'none', border: 0, padding: 0, color: '#f4ead5', cursor: 'pointer', width: '100%', textAlign: 'left' }}><i style={{ width: 9, height: 9, borderRadius: '50%', background: factionColor(army.ownerId) }} /><strong>{player ? label('ui_you') : factionName(army.ownerId)}</strong>{army.id === `army-${army.ownerId}-main` && <span className="game-pill">{label('army_chief')}</span>}</button>
    <div className="game-row game-muted" style={{ marginTop: 6 }}>♞ {army.cavalry}　⚔ {army.infantry}　♜ {army.siege}　<span aria-label={`${label('battle_attack_label')} ${attack}`}>⚔ {attack}</span><span>{army.movementLeft > 0 ? `${army.movementLeft} moves` : label('army_exhausted')}</span></div>
    <div className="game-status"><span>Morale</span><div className="game-progress" style={{ flex: 1 }}><i style={{ width: `${Math.min(100, army.morale)}%`, background: '#e0a944' }} /></div><span>{army.morale}%</span></div>
    {player && selectedOther && !selected && <GameButton compact variant="Secondary" onClick={onMerge}><GameIcon name="Merge" width={15} /> {label('ui_merge_armies')}</GameButton>}
  </div>;
}
export function ProvincePanel({ game, province, selectedArmyId, actions }: { game: GameState; province: Province | null; selectedArmyId: string | null; actions: ProvinceActions }) {
  useLocale();
  if (!province) return section(t('province_none_selected_title'), <p>{t('ui_select_province')}</p>);
  const p = province, owned = p.ownerId === game.playerFactionId, player = playerOf(game), defense = defenseBreakdown(p, game.defenseBonus), armies = game.armies.filter((a) => a.provinceId === p.id), selected = armies.find((a) => a.id === selectedArmyId), buildings = game.buildings[p.id] ?? [];
  return <>
    {section(p.name, <><div className="game-row"><span>{t('ui_owner')}</span><strong><i style={{ display: 'inline-block', width: 9, height: 9, borderRadius: '50%', background: factionColor(p.ownerId), marginRight: 7 }} />{p.ownerId === game.playerFactionId ? t('ui_you') : factionName(p.ownerId)}</strong></div><div className="game-row"><span>{t('ui_terrain')}</span><strong>{terrainName(p.terrain)}</strong></div>{p.isCapital && <span className="game-pill">{t('ui_capital')}</span>}</>)}
    <div style={{ display: 'flex', gap: 8 }}>{[[t('ui_taxes'), p.baseTax, '◉'], [t('ui_manpower'), p.baseManpower, '♟'], [t('ui_defense'), fmt(defense.total), '⬟'], [t('ui_supply'), p.supply, '⚑']].map(([label, value, icon]) => <Stat key={String(label)} label={String(label)} value={String(value)} icon={String(icon)} />)}</div>
    {p.fortLevel > 0 && section(t('ui_fortress'), <><div className="game-row"><span>{t('ui_level')} {p.fortLevel}</span><strong>{t('ui_durability')} {fortDurabilityOrFull(p)}%</strong></div><div className="game-progress"><i style={{ width: `${fortDurabilityOrFull(p)}%`, background: isFortDamaged(p) ? '#c2533a' : '#5ba374' }} /></div></>)}
    {p.tradeGood && section(tradeGoodName(p.tradeGood), <p>{tradeGoodEffect(p.tradeGood)}</p>)}
    {p.hasSilkRoad && section(t('ui_on_silk_road'), <p>{t('ui_silk_road_bonus')}</p>)}
    {p.unrest > 0 && section(t('ui_unrest'), <><div className="game-row"><span>{t('ui_unrest')}</span><strong>{p.unrest}%</strong></div><div className="game-progress"><i style={{ width: `${p.unrest}%`, background: '#c2533a' }} /></div></>)}
    {armies.length > 0 && section(t('ui_armies'), <>{armies.map((army) => <ArmyRow key={army.id} army={army} player={army.ownerId === game.playerFactionId} attack={attackPower(army, army.ownerId === game.playerFactionId ? game.attackBonus : 0)} selected={army.id === selectedArmyId} selectedOther={!!selected && selected.ownerId === game.playerFactionId && army.ownerId === game.playerFactionId} onSelect={() => actions.onSelectArmy(army.id)} onMerge={() => actions.onMergeInto(army.id)} />)}</>)}
    {owned && <>
      {section(t('ui_recruit_note'), <><div className="game-action-row">{(['infantry', 'cavalry'] as const).map((kind) => { const block = recruitBlock(game, p, kind), gold = kind === 'infantry' ? Rules.INFANTRY_GOLD : Rules.CAVALRY_GOLD, food = kind === 'infantry' ? Rules.INFANTRY_FOOD : Rules.CAVALRY_FOOD; return <div key={kind} style={{ flex: 1, minWidth: 95 }}><GameButton compact disabled={!!block} onClick={() => actions.onRecruit(kind)} style={{ flexDirection: 'column', gap: 3, lineHeight: 1.2, whiteSpace: 'normal' }}><span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><GameIcon name={kind === 'infantry' ? 'Sword' : 'Horseshoe'} width={15} /> {t(kind === 'infantry' ? 'ui_recruit_infantry' : 'ui_recruit_cavalry')}</span><span className="game-label">◉ {gold} · {kind === 'cavalry' && <>♞ {Rules.CAVALRY_HORSES} · </>}♨ {food}</span></GameButton>{block && <div className="game-label">{t(block)}</div>}</div>; })}</div>{isFortDamaged(p) && <div className="game-action-row" style={{ marginTop: 8 }}>{([false, true] as const).map((artisan) => { const block = repairFortBlocker(game, p.id, artisan); return <div key={String(artisan)} style={{ flex: 1 }}><GameButton compact variant="Secondary" disabled={!!block} onClick={() => actions.onRepair(artisan)}>{t(artisan ? 'ui_repair_artisan' : 'ui_repair_gold')}</GameButton>{block && <div className="game-label">{t(`block_${block.toLowerCase()}`)}</div>}</div>; })}</div>}</>)}
      {section(t('ui_build_heading', p.name), <>{BUILDINGS.filter((type) => type !== 'wonder' || p.id === player.capitalId).map((type) => { const block = buildBlock(game, p, type), finished = block === 'block_max_level' || block === 'block_already_built', info = costs(type); return <div key={type} className="game-row" style={{ alignItems: 'flex-start', borderTop: '1px solid #43372a', paddingTop: 8 }}><GameIcon name={buildIcons[type]} width={20} style={{ flex: 'none', color: finished ? '#5ba374' : '#f2c46b' }} /><div style={{ flex: 1 }}><strong>{buildingName(type)}{type === 'fortress' && p.fortLevel > 0 ? ` · ${t('ui_level')} ${p.fortLevel}` : ''}</strong><div className="game-muted">{type === 'fortress' ? t('ui_fortress_next_effect', Math.min(Rules.FORT_MAX_LEVEL, p.fortLevel + 1), Math.min(Rules.FORT_MAX_LEVEL, p.fortLevel + 1) * 35) : buildingEffect(type)}</div><div className="game-label">◉ {info.goldCost} · ⚒ {info.artisanCost}</div>{block && !finished && <div className="game-label">{t(block)}</div>}</div>{!finished && <GameButton compact disabled={!!block} onClick={() => actions.onBuild(type)}>{type === 'fortress' && p.fortLevel > 0 ? t('ui_upgrade') : t('ui_build')}</GameButton>}</div>; })}</>)}
    </>}
  </>;
}

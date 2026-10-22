import { useLocale, t } from '../../../i18n';
import { asset } from '../../../assets';
import { playerOf } from '../../../game/model/models';
import { factionColor } from '../factionStyle';
import { factionName } from '../GameText';
import { GameIcon, type GameIconName } from '../../icons/GameIcons';

export type PanelTab = 'Province' | 'Realm' | 'Chronicle' | 'Diplomacy';
interface Props { game: import('../../../game/model/models').GameState; openTab: PanelTab | null; endTurnEnabled: boolean; onMenu: () => void; onTab: (tab: PanelTab) => void; onEndTurn: () => void }
const iconByTab: Record<PanelTab, GameIconName> = { Province: 'MapPin', Realm: 'Trophy', Chronicle: 'Scroll', Diplomacy: 'Scales' };
const resourceSprites: Record<string, string> = { Gold: 'sprite_res_gold.png', Food: 'sprite_res_food.png', Horses: 'sprite_res_horse.png' };
const resourceIcons: Record<string, GameIconName> = { Manpower: 'People', Artisans: 'Hammer', Influence: 'Seal', Prestige: 'Temple' };
export function TopBar({ game, openTab, endTurnEnabled, onMenu, onTab, onEndTurn }: Props) {
  useLocale();
  const player = playerOf(game), income = game.lastCollection;
  const resources: Array<[string, number, number | undefined, string]> = [
    ['Gold', player.treasury, income?.taxIncome, 'hud_gold'], ['Food', game.food, income?.foodChange, 'hud_food'],
    ['Horses', player.horses, income?.horsesGain, 'hud_horses'], ['Manpower', player.manpower, income?.manpowerGain, 'hud_manpower'],
    ['Artisans', game.artisans, income?.artisansGain, 'hud_artisans'], ['Influence', game.influence, income?.influenceGain, 'hud_influence'], ['Prestige', game.prestige, income?.prestigeGain, 'hud_prestige'],
  ];
  const tabs: Array<[PanelTab, string]> = [['Realm', 'ui_realm_status'], ['Diplomacy', 'dipl_title']];
  return <header className="game-topbar">
    <button className="game-action game-round" aria-label={t('hud_menu')} title={t('hud_menu')} onClick={onMenu}><GameIcon name="Menu" width={19} /></button>
    <span style={{ width: 12, height: 12, borderRadius: '50%', background: factionColor(player.id), flex: 'none' }} />
    <div style={{ minWidth: 52, maxWidth: 150, lineHeight: 1.2 }}><strong className="game-player-name">{factionName(player.id)}</strong><div className="game-label game-turn">{t('log_turn_header', game.turn, game.year)}</div></div>
    <div className="game-resources">{resources.map(([name, value, delta, label]) => <button className="game-resource" title={`${t(label)}: ${value}${delta === undefined ? '' : ` · ${t('hud_per_turn', `${delta >= 0 ? '+' : ''}${delta}`)}`}`} key={name}>
      {resourceSprites[name] ? <img src={asset(`sprites/${resourceSprites[name]}`)} width="18" height="18" alt="" style={{ verticalAlign: 'middle' }} /> : <GameIcon name={resourceIcons[name]} width={17} style={{ verticalAlign: 'middle', color: '#bfdbfe' }} />} {value}
    </button>)}</div>
    {tabs.map(([tab, label]) => <button key={tab} className={`game-action game-round${openTab === tab ? ' active' : ''}`} aria-label={t(label)} title={t(label)} onClick={() => onTab(tab)}><GameIcon name={iconByTab[tab]} width={18} /></button>)}
    <button className="game-action primary" disabled={!endTurnEnabled} onClick={onEndTurn}><GameIcon name="EndTurn" width={18} /><span className="end-turn-label">{t('phase_end_turn')}</span></button>
  </header>;
}

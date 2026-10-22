import type { ReactNode } from 'react';
import { useLocale, t } from '../../../i18n';
import type { PanelTab } from '../hud/TopBar';
import { GameIcon, type GameIconName } from '../../icons/GameIcons';

const TAB_INFO: Array<[PanelTab, GameIconName, string]> = [
  ['Province', 'MapPin', 'sidebar_tab_province'], ['Realm', 'Trophy', 'sidebar_tab_goals'], ['Chronicle', 'Scroll', 'sidebar_tab_log'], ['Diplomacy', 'Scales', 'sidebar_tab_diplomacy'],
];
export function SidePanel({ tab, onTab, onClose, children, footer }: { tab: PanelTab; onTab: (tab: PanelTab) => void; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  useLocale();
  return <aside className="game-side-panel"><nav className="game-panel-tabs" aria-label="Game panels">
    {TAB_INFO.map(([key, icon, label]) => <button key={key} className={tab === key ? 'active' : ''} onClick={() => onTab(key)} aria-current={tab === key ? 'page' : undefined}><GameIcon name={icon} width={18} /><br />{t(label)}</button>)}
    <button aria-label={t('panel_close')} title={t('panel_close')} onClick={onClose}><GameIcon name="Close" width={18} /></button>
  </nav><div className="game-panel-content">{children}</div>{footer && <footer>{footer}</footer>}</aside>;
}
export const SidePanelWidth = 340;

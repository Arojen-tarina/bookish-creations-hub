import { useLocale, t } from '../../../i18n';
import { GameButton } from '../../components/GameButton';
import { GameIcon } from '../../icons/GameIcons';
export function TributeButton({ onClick, size = 44 }: { onClick: () => void; size?: number }) {
  useLocale(); return <button type="button" className="game-action game-tribute-button" style={{ width: size, height: size }} onClick={onClick} aria-label={t('tribute_button')} title={t('tribute_button')}><GameIcon name="Chest" width={24} /></button>;
}
export function TributeDialog({ gold, canDrawCard, onGold, onCard, onDismiss }: { gold: number; canDrawCard: boolean; onGold: () => void; onCard: () => void; onDismiss: () => void }) {
  useLocale(); return <div className="game-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onDismiss(); }}><section className="game-dialog tribute-dialog" role="dialog" aria-modal="true"><div className="tribute-medal"><GameIcon name="Chest" width={34} /></div><h2>{t('tribute_title')}</h2><p className="game-divider" /><p>{t('tribute_body')}</p><div className="game-action-row" style={{ justifyContent: 'center' }}><GameButton onClick={onGold}>{t('tribute_gold', gold)}</GameButton>{canDrawCard && <GameButton variant="Secondary" onClick={onCard}>{t('tribute_card')}</GameButton>}</div><GameButton compact variant="Secondary" onClick={onDismiss} style={{ marginTop: 10 }}>{t('tribute_decline')}</GameButton></section></div>;
}

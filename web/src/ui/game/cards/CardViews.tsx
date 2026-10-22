import type { CSSProperties } from 'react';
import type { Card, GameState } from '../../../game/model/models';
import { asset } from '../../../assets';
import { useLocale, t } from '../../../i18n';
import { cardTypeName, rarityName } from '../GameText';
import type { CardText } from '../panels/RealmPanels';
import { GameButton } from '../../components/GameButton';
import { GameIcon } from '../../icons/GameIcons';

const cardColor: Record<Card['type'], string> = { strategy: '#dc2626', diplomacy: '#2563eb', technology: '#16a34a', resource: '#d97706' };
const rarityColor: Record<NonNullable<Card['rarity']>, string> = { common: '#9ca3af', uncommon: '#22c55e', rare: '#3b82f6', legendary: '#a855f7' };
const effectIcon: Record<Card['effect']['type'], string> = { gold: '◉', food: '♨', horses: '♞', artisans: '⚒', attack_bonus: '⚔', permanent_attack: '⚔', defense_bonus: '⬟', permanent_defense: '⬟', movement_bonus: '➤', terrain_ignore: '➤', draw_cards: '▤', recruit_free: '♟', morale: '⚑' } as Record<Card['effect']['type'], string>;

export function CardFace({ card, text, width = 96, onClick, style }: { card: Card; text?: CardText; width?: number; onClick?: () => void; style?: CSSProperties }) {
  useLocale();
  return <button type="button" onClick={onClick} disabled={!onClick} className="game-card-face" style={{ width, borderColor: cardColor[card.type], ...style }} aria-label={text?.n ?? card.id}>
    <span className="game-card-art" style={{ backgroundImage: `linear-gradient(#120f0c35,#120f0cbb),url("${asset(`cards/${card.id}.jpg`)}")`, backgroundColor: cardColor[card.type] }}><strong>{text?.n ?? card.id}</strong><small style={{ color: card.rarity ? rarityColor[card.rarity] : '#9ca3af' }}>{card.rarity ? rarityName(card.rarity) : ''}</small><span className="game-card-fallback">{effectIcon[card.effect.type] ?? '▤'}</span></span>
    <span className="game-card-effect" style={{ backgroundColor: `${cardColor[card.type]}38` }}>{text?.s ?? ''}</span>
  </button>;
}
export function CardTray({ game, texts, expanded, onToggle, onCardClick }: { game: GameState; texts: Record<string, CardText>; expanded: boolean; onToggle: () => void; onCardClick: (card: Card) => void }) {
  useLocale();
  if (!expanded) return <button type="button" className="game-card-tray-collapsed" onClick={onToggle}><GameIcon name="Cards" width={19} /> {t('cards_hand_count', game.hand.length)}</button>;
  return <section className="game-card-tray-open"><div className="game-row"><strong><GameIcon name="Cards" width={17} /> {t('cards_hand_count', game.hand.length)}</strong><span className="game-label">{t('cards_deck_discard', game.deck.length, game.discard.length)}</span><button className="game-action game-round" onClick={onToggle} aria-label={t('cards_hide_hand')}><GameIcon name="Close" width={16} /></button></div>{game.hand.length ? <div className="game-card-list">{game.hand.map((card) => <CardFace key={card.id} card={card} text={texts[card.id]} onClick={() => onCardClick(card)} />)}</div> : <p>{t('cards_none')}</p>}</section>;
}
export function CardDetailDialog({ card, text, onPlay, onDismiss }: { card: Card; text?: CardText; onPlay: () => void; onDismiss: () => void }) {
  useLocale();
  return <div className="game-overlay" role="presentation" onMouseDown={(e) => { if (e.currentTarget === e.target) onDismiss(); }}><section className="game-dialog game-card-detail" role="dialog" aria-modal="true" aria-labelledby="card-detail-title"><button className="game-action game-round game-dismiss" onClick={onDismiss} aria-label={t('common_close')}><GameIcon name="Close" width={18} /></button><CardFace card={card} text={text} width={170} /><div className="game-card-fulltext"><h2 id="card-detail-title">{text?.n ?? card.id}</h2><p className="game-status"><span style={{ color: cardColor[card.type] }}>{cardTypeName(card.type)}</span>{card.rarity && <span style={{ color: rarityColor[card.rarity] }}> · {rarityName(card.rarity)}</span>}</p><p>{text?.d ?? ''}</p><p className="game-muted">{text?.e ?? ''}</p>{text?.c && <p className="game-muted">{t('card_cost', text.c)}</p>}<div className="game-section"><div className="game-label">{t('card_effect_now')}</div><strong>{text?.s ?? ''}</strong></div><div className="game-action-row" style={{ justifyContent: 'flex-end', marginTop: 12 }}><GameButton variant="Secondary" onClick={onDismiss}>{t('common_close')}</GameButton><GameButton onClick={onPlay}>{t('cards_play')}</GameButton></div></div></section></div>;
}

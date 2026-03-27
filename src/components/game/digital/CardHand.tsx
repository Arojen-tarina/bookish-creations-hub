/**
 * CardHand.tsx — Pelaajan korttikäsi
 * 
 * Selkeä korttinäkymä: kortit isompia, pelaa-nappi aina näkyvissä.
 */
import { PlayableCard } from '@/game/cards';
import { cardTypeInfo, rarityInfo } from '@/data/gameCards';
import { MVPPhase } from './PhaseBar';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const EFFECT_EMOJI: Record<string, string> = {
  attack_bonus: '⚔️',
  defense_bonus: '🛡️',
  movement_bonus: '🐴',
  permanent_attack: '⚔️',
  permanent_defense: '🛡️',
  terrain_ignore: '🏔️',
  gold: '💰',
  food: '🌾',
  horses: '🐎',
  artisans: '🔧',
  draw_cards: '🃏',
  recruit_free: '👥',
};

interface CardHandProps {
  cards: PlayableCard[];
  onPlayCard: (card: PlayableCard) => void;
  canPlay: boolean;
  currentPhase: MVPPhase;
  deckSize: number;
  discardSize: number;
}

export const CardHand = ({ cards, onPlayCard, canPlay, currentPhase, deckSize, discardSize }: CardHandProps) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  if (cards.length === 0) {
    return (
      <div className="flex items-center gap-3 px-4 py-2">
        <span className="text-amber-200/50 text-sm">Ei kortteja kädessä</span>
        <span className="text-amber-200/30 text-xs">📦 {deckSize} | 🗑️ {discardSize}</span>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-3">
      {/* Info */}
      <div className="flex flex-col gap-1 text-xs text-amber-200/50 min-w-[60px]">
        <span>📦 {deckSize}</span>
        <span>🗑️ {discardSize}</span>
        <span className="text-amber-300 font-bold">🃏 {cards.length}</span>
      </div>

      {/* Cards row */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {cards.map((card, idx) => {
          const typeInfo = cardTypeInfo[card.type];
          const rarity = rarityInfo[card.rarity || 'common'];
          const isSelected = selectedIdx === idx;
          const emoji = EFFECT_EMOJI[card.parsedEffect.type] || '✨';

          return (
            <div
              key={`${card.id}-${idx}`}
              className={`relative flex-shrink-0 w-44 rounded-xl overflow-hidden transition-all duration-200 cursor-pointer
                ${isSelected
                  ? 'ring-2 ring-green-400 -translate-y-3 shadow-xl shadow-green-500/20 scale-105'
                  : 'ring-1 ring-slate-600/50 hover:-translate-y-1 hover:ring-amber-500/50'
                }`}
              onClick={() => setSelectedIdx(isSelected ? null : idx)}
            >
              {/* Header */}
              <div className={`${typeInfo.color} px-2.5 py-1.5 flex items-center justify-between`}>
                <span className="text-white text-xs font-bold">{typeInfo.icon} {card.name}</span>
                <span className={`text-[10px] ${rarity.color} px-1 rounded text-white`}>{rarity.symbol}</span>
              </div>

              {/* Body */}
              <div className="bg-slate-800 px-2.5 py-2">
                <p className="text-slate-300 text-[11px] leading-snug mb-2 line-clamp-2">{card.description}</p>
                <div className="bg-amber-900/40 rounded-lg px-2 py-1.5 text-center">
                  <span className="text-amber-200 text-sm font-bold">{emoji} {card.parsedEffect.description}</span>
                </div>
              </div>

              {/* Play button — always visible when selected */}
              {isSelected && canPlay && (
                <div className="bg-slate-800 px-2 pb-2">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-500 text-white font-bold h-9 text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayCard(card);
                      setSelectedIdx(null);
                    }}
                  >
                    ▶ Pelaa kortti
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

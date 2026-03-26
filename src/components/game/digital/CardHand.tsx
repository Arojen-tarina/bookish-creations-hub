/**
 * CardHand.tsx — Pelaajan korttikäsi
 * 
 * Näyttää kädessä olevat kortit, mahdollistaa kortin valinnan ja pelaamisen.
 */
import { PlayableCard } from '@/game/cards';
import { cardTypeInfo, rarityInfo } from '@/data/gameCards';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface CardHandProps {
  cards: PlayableCard[];
  onPlayCard: (card: PlayableCard) => void;
  canPlay: boolean;
  deckSize: number;
  discardSize: number;
}

export const CardHand = ({ cards, onPlayCard, canPlay, deckSize, discardSize }: CardHandProps) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  
  if (cards.length === 0) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-slate-900/80 rounded-lg border border-amber-700/20">
        <span className="text-amber-200/50 text-sm">Ei kortteja kädessä</span>
        <span className="text-amber-200/30 text-xs">Pakka: {deckSize} | Poisto: {discardSize}</span>
      </div>
    );
  }
  
  return (
    <div className="relative">
      {/* Deck/discard info */}
      <div className="flex items-center gap-4 mb-2 px-2">
        <span className="text-amber-200/50 text-xs">📦 Pakka: {deckSize}</span>
        <span className="text-amber-200/50 text-xs">🗑️ Poisto: {discardSize}</span>
        <span className="text-amber-200/70 text-xs font-semibold">🃏 Käsi: {cards.length}</span>
      </div>
      
      {/* Cards */}
      <div className="flex gap-2 overflow-x-auto pb-2 px-2">
        {cards.map((card, idx) => {
          const typeInfo = cardTypeInfo[card.type];
          const rarity = rarityInfo[card.rarity || 'common'];
          const isSelected = selectedIdx === idx;
          const isHovered = hoveredIdx === idx;
          
          return (
            <div
              key={card.id}
              className={`relative flex-shrink-0 w-36 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'border-amber-400 -translate-y-4 shadow-lg shadow-amber-500/30 scale-105'
                  : isHovered
                  ? 'border-amber-600/50 -translate-y-2'
                  : 'border-slate-600/50'
              }`}
              onClick={() => setSelectedIdx(isSelected ? null : idx)}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Card header */}
              <div className={`${typeInfo.color} rounded-t-md px-2 py-1 flex items-center justify-between`}>
                <span className="text-white text-xs font-bold truncate">{typeInfo.icon} {card.type === 'strategy' ? 'Strat' : card.type === 'diplomacy' ? 'Dipl' : card.type === 'technology' ? 'Tek' : 'Res'}</span>
                <span className={`text-xs ${rarity.color} px-1 rounded text-white`}>{rarity.symbol}</span>
              </div>
              
              {/* Card body */}
              <div className="bg-slate-800/95 p-2 rounded-b-md">
                <h5 className="text-amber-100 text-xs font-bold leading-tight mb-1 truncate">{card.name}</h5>
                <p className="text-slate-300 text-[10px] leading-tight mb-1.5 line-clamp-2">{card.description}</p>
                <div className="bg-slate-700/50 rounded px-1.5 py-0.5">
                  <p className="text-amber-300 text-[10px] font-semibold">{card.parsedEffect.description}</p>
                </div>
              </div>
              
              {/* Play button on selected */}
              {isSelected && canPlay && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                  <Button
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-500 text-xs h-6 px-3 shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlayCard(card);
                      setSelectedIdx(null);
                    }}
                  >
                    Pelaa ▶
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

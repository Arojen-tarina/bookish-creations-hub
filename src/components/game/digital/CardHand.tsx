/**
 * CardHand.tsx — Pelaajan korttikäsi
 * 
 * Näyttää kädessä olevat kortit, mahdollistaa kortin valinnan ja pelaamisen.
 * Kortteja voi pelata useissa vaiheissa — UI kertoo milloin kortti on pelattavissa.
 */
import { PlayableCard } from '@/game/cards';
import { cardTypeInfo, rarityInfo } from '@/data/gameCards';
import { MVPPhase } from './PhaseBar';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Sparkles, Swords, Shield, Move, Coins, Wheat, Wrench } from 'lucide-react';

// Which phases allow which card effect types
const PHASE_ALLOWS: Record<string, MVPPhase[]> = {
  gold: ['cards', 'resource', 'build'],
  food: ['cards', 'resource', 'build'],
  horses: ['cards', 'resource'],
  artisans: ['cards', 'build'],
  attack_bonus: ['cards', 'move', 'battle'],
  defense_bonus: ['cards', 'move', 'battle'],
  movement_bonus: ['cards', 'move'],
  permanent_attack: ['cards'],
  permanent_defense: ['cards'],
  terrain_ignore: ['cards', 'move'],
  draw_cards: ['cards'],
  recruit_free: ['cards', 'build'],
};

function getEffectIcon(type: string) {
  switch (type) {
    case 'attack_bonus':
    case 'permanent_attack': return <Swords className="w-3 h-3" />;
    case 'defense_bonus':
    case 'permanent_defense': return <Shield className="w-3 h-3" />;
    case 'movement_bonus':
    case 'terrain_ignore': return <Move className="w-3 h-3" />;
    case 'gold': return <Coins className="w-3 h-3" />;
    case 'food': return <Wheat className="w-3 h-3" />;
    case 'artisans': return <Wrench className="w-3 h-3" />;
    default: return <Sparkles className="w-3 h-3" />;
  }
}

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
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  
  if (cards.length === 0) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-slate-900/80 rounded-lg border border-amber-700/20">
        <span className="text-amber-200/50 text-sm">Ei kortteja kädessä</span>
        <span className="text-amber-200/30 text-xs">Pakka: {deckSize} | Poisto: {discardSize}</span>
      </div>
    );
  }

  const canPlayCard = (card: PlayableCard): boolean => {
    if (!canPlay) return false;
    const allowed = PHASE_ALLOWS[card.parsedEffect.type] || ['cards'];
    return allowed.includes(currentPhase);
  };
  
  return (
    <div className="relative">
      {/* Deck/discard info */}
      <div className="flex items-center gap-4 mb-2 px-2">
        <span className="text-amber-200/50 text-xs">📦 Pakka: {deckSize}</span>
        <span className="text-amber-200/50 text-xs">🗑️ Poisto: {discardSize}</span>
        <span className="text-amber-200/70 text-xs font-semibold">🃏 Käsi: {cards.length}</span>
        {currentPhase !== 'end' && (
          <span className="text-green-400/70 text-xs ml-auto">💡 Valitse kortti ja pelaa</span>
        )}
      </div>
      
      {/* Cards */}
      <div className="flex gap-2 overflow-x-auto pb-2 px-2">
        {cards.map((card, idx) => {
          const typeInfo = cardTypeInfo[card.type];
          const rarity = rarityInfo[card.rarity || 'common'];
          const isSelected = selectedIdx === idx;
          const isHovered = hoveredIdx === idx;
          const playable = canPlayCard(card);
          
          return (
            <div
              key={`${card.id}-${idx}`}
              className={`relative flex-shrink-0 w-40 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? playable
                    ? 'border-green-400 -translate-y-6 shadow-lg shadow-green-500/30 scale-110'
                    : 'border-red-400/50 -translate-y-4 scale-105'
                  : isHovered
                  ? 'border-amber-600/50 -translate-y-2'
                  : playable
                  ? 'border-slate-500/50 hover:border-amber-500/50'
                  : 'border-slate-700/30 opacity-60'
              }`}
              onClick={() => setSelectedIdx(isSelected ? null : idx)}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Card header */}
              <div className={`${typeInfo.color} rounded-t-md px-2 py-1.5 flex items-center justify-between`}>
                <span className="text-white text-xs font-bold truncate flex items-center gap-1">
                  {typeInfo.icon} {card.type === 'strategy' ? 'Strat' : card.type === 'diplomacy' ? 'Dipl' : card.type === 'technology' ? 'Tek' : 'Res'}
                </span>
                <span className={`text-xs ${rarity.color} px-1 rounded text-white`}>{rarity.symbol}</span>
              </div>
              
              {/* Card body */}
              <div className="bg-slate-800/95 p-2 rounded-b-md">
                <h5 className="text-amber-100 text-xs font-bold leading-tight mb-1 truncate">{card.name}</h5>
                <p className="text-slate-300 text-[10px] leading-tight mb-1.5 line-clamp-2">{card.description}</p>
                <div className="bg-slate-700/50 rounded px-1.5 py-1 flex items-center gap-1">
                  {getEffectIcon(card.parsedEffect.type)}
                  <p className="text-amber-300 text-[10px] font-semibold">{card.parsedEffect.description}</p>
                </div>
                {!playable && isSelected && (
                  <p className="text-red-400 text-[9px] mt-1">⚠️ Ei pelattavissa tässä vaiheessa</p>
                )}
              </div>
              
              {/* Play button on selected */}
              {isSelected && playable && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2">
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-500 text-white text-xs h-7 px-4 shadow-lg shadow-green-500/40 font-bold animate-bounce"
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

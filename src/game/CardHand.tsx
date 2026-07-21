/**
 * CardHand.tsx — Pelaajan korttikäsi
 *
 * Selkeä korttinäkymä: kortit isompia, pelaa-nappi aina näkyvissä.
 */
import { PlayableCard } from '@/game/cards.ts';
import { cardTypeInfo, rarityInfo } from '@/data/gameCards.ts';
import { MVPPhase } from './PhaseBar.tsx';
import { Button } from '@/components/ui/button.tsx';
import { useState } from 'react';

// Korttikuvat: bundlataan importteina (hajautetut tiedostot normaalibuildissa,
// data-URL:t singlefile-buildissa). Osalla korteista ei ole kuvaa -> fallback.
const CARD_IMAGE_MODULES = import.meta.glob('@/assets/cards/*.{jpg,jpeg,png}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;
const CARD_IMAGES: Record<string, string> = {};
for (const [path, url] of Object.entries(CARD_IMAGE_MODULES)) {
  const id = path.split('/').pop()!.replace(/\.(jpe?g|png)$/i, '');
  // Suosi optimoitua jpg-versiota jos sekä jpg että png löytyy samalle kortille.
  if (!CARD_IMAGES[id] || /\.jpe?g$/i.test(path)) CARD_IMAGES[id] = url;
}
const cardImage = (id: string): string | undefined => CARD_IMAGES[id];

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
          const art = cardImage(card.id);

          return (
            <div
              key={`${card.id}-${idx}`}
              className={`relative flex-shrink-0 w-36 self-start rounded-lg overflow-hidden transition-all duration-200 cursor-pointer
                ${isSelected
                  ? 'ring-2 ring-green-400 -translate-y-2 shadow-xl shadow-green-500/20'
                  : 'ring-1 ring-slate-600/50 hover:-translate-y-1 hover:ring-amber-500/50'
                }`}
              onClick={() => setSelectedIdx(isSelected ? null : idx)}
            >
              {art ? (
                /* Koko korttikuva näkyvissä, peli-info tekstinä kuvan päällä */
                <div className="relative">
                  <img
                    src={art}
                    alt={card.name}
                    loading="lazy"
                    draggable={false}
                    className="block w-full h-auto select-none pointer-events-none"
                  />
                  {/* harvinaisuusmerkki kulmaan */}
                  <span className={`absolute top-1 right-1 text-[9px] ${rarity.color} px-1 rounded text-white shadow`}>{rarity.symbol}</span>
                  {/* efekti + pelaa-nappi kuvan päälle alareunaan */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-1.5 pb-1.5 pt-5">
                    <div className="rounded bg-amber-900/80 px-1.5 py-1 text-center backdrop-blur-sm ring-1 ring-amber-500/30">
                      <span className="text-amber-100 text-[11px] font-bold leading-tight break-words">{emoji} {card.parsedEffect.description}</span>
                    </div>
                    {isSelected && canPlay && (
                      <Button
                        className="mt-1 w-full bg-green-600 hover:bg-green-500 text-white font-bold h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlayCard(card);
                          setSelectedIdx(null);
                        }}
                      >
                        ▶ Pelaa
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                /* Ei kuvaa: tekstikortti */
                <>
                  <div className={`${typeInfo.color} px-2 py-1 flex items-center justify-between gap-1`}>
                    <span className="text-white text-[10px] font-bold break-words">{typeInfo.icon} {card.name}</span>
                    <span className={`text-[9px] ${rarity.color} px-1 rounded text-white flex-shrink-0`}>{rarity.symbol}</span>
                  </div>
                  <div className="bg-slate-800 px-2 py-1.5">
                    <p className="text-slate-300 text-[10px] leading-snug mb-1.5 break-words">{card.description}</p>
                    <div className="bg-amber-900/40 rounded px-1.5 py-1 text-center">
                      <span className="text-amber-200 text-[11px] font-bold leading-tight break-words">{emoji} {card.parsedEffect.description}</span>
                    </div>
                  </div>
                  {isSelected && canPlay && (
                    <div className="bg-slate-800 px-1.5 pb-1.5">
                      <Button
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          onPlayCard(card);
                          setSelectedIdx(null);
                        }}
                      >
                        ▶ Pelaa
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

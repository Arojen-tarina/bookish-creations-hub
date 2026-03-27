/**
 * PhaseBar.tsx — Vuoron vaihepalkki
 * 
 * Isompi, selkeämpi vaihepalkki integroidulla Seuraava/Lopeta-napilla.
 */
import { Button } from '@/components/ui/button';
import { ArrowRight, Check, Flag } from 'lucide-react';

export type MVPPhase = 'resource' | 'cards' | 'move' | 'battle' | 'build' | 'end';

const PHASE_INFO: Record<MVPPhase, { label: string; emoji: string; hint: string }> = {
  resource: { label: 'Resurssit', emoji: '🪙', hint: 'Kerää resurssit hallituilta alueilta.' },
  cards: { label: 'Kortit', emoji: '🃏', hint: 'Nosta kortti ja pelaa kortteja kädestäsi.' },
  move: { label: 'Liike', emoji: '🐴', hint: 'Valitse armeija ja liikuta sitä viereiseen alueeseen.' },
  battle: { label: 'Taistelu', emoji: '⚔️', hint: 'Hyökkää viereistä vihollista vastaan.' },
  build: { label: 'Rakenna', emoji: '🏗️', hint: 'Rakenna leiri, markkina tai linnoitus.' },
  end: { label: 'Lopeta', emoji: '🏁', hint: 'Lopeta vuoro ja anna AI-pelaajien toimia.' },
};

const PHASE_ORDER: MVPPhase[] = ['resource', 'cards', 'move', 'battle', 'build', 'end'];

interface PhaseBarProps {
  currentPhase: MVPPhase;
  onNextPhase: () => void;
  onEndTurn: () => void;
  disabled?: boolean;
}

export const PhaseBar = ({ currentPhase, onNextPhase, onEndTurn, disabled = false }: PhaseBarProps) => {
  const currentIndex = PHASE_ORDER.indexOf(currentPhase);
  const info = PHASE_INFO[currentPhase];
  const isLastPhase = currentPhase === 'end';

  return (
    <div className="bg-slate-900/95 backdrop-blur-xl border border-amber-600/30 rounded-2xl shadow-2xl shadow-black/40">
      {/* Phase steps row */}
      <div className="flex items-center px-3 pt-2.5 pb-1.5 gap-0.5">
        {PHASE_ORDER.map((phase, idx) => {
          const pInfo = PHASE_INFO[phase];
          const isDone = idx < currentIndex;
          const isCurrent = phase === currentPhase;

          return (
            <div key={phase} className="flex items-center flex-1">
              <div className={`flex items-center justify-center gap-1.5 w-full px-2 py-1.5 rounded-lg text-xs transition-all ${
                isCurrent
                  ? 'bg-amber-500 text-white font-black shadow-lg shadow-amber-500/30 scale-[1.05]'
                  : isDone
                  ? 'bg-green-800/40 text-green-300'
                  : 'bg-slate-800/40 text-slate-500'
              }`}>
                {isDone ? <Check className="w-3.5 h-3.5" /> : <span className="text-sm">{pInfo.emoji}</span>}
                <span className="hidden md:inline text-[11px]">{pInfo.label}</span>
              </div>
              {idx < PHASE_ORDER.length - 1 && (
                <div className={`w-4 h-0.5 mx-0.5 flex-shrink-0 rounded ${idx < currentIndex ? 'bg-green-500' : 'bg-slate-700'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Hint + action row */}
      <div className="flex items-center justify-between px-3 pb-2.5 gap-3">
        <p className="text-amber-200/90 text-sm font-medium flex-1">
          <span className="text-base mr-1">{info.emoji}</span>
          {info.hint}
        </p>
        {isLastPhase ? (
          <Button onClick={onEndTurn} className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 h-9 text-sm rounded-xl shadow-lg shadow-red-900/40 flex-shrink-0">
            <Flag className="w-4 h-4 mr-1.5" />
            Lopeta vuoro
          </Button>
        ) : (
          <Button onClick={onNextPhase} className="bg-amber-500 hover:bg-amber-400 text-white font-bold px-6 h-9 text-sm rounded-xl shadow-lg shadow-amber-900/40 flex-shrink-0">
            Seuraava
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        )}
      </div>
    </div>
  );
};

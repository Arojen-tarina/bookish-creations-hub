/**
 * PhaseBar.tsx — Vuoron vaihepalkki ja ohjeet
 * 
 * Näyttää kaikki vuoron vaiheet, korostaa aktiivisen vaiheen
 * ja kertoo pelaajalle mitä voi tehdä.
 */
import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';

export type MVPPhase = 'resource' | 'cards' | 'move' | 'battle' | 'build' | 'end';

const PHASE_INFO: Record<MVPPhase, { label: string; emoji: string; hint: string }> = {
  resource: { label: 'Resurssit', emoji: '🪙', hint: 'Kerää resurssit hallituilta alueilta.' },
  cards: { label: 'Kortit', emoji: '🃏', hint: 'Nosta kortti ja pelaa kortteja kädestäsi.' },
  move: { label: 'Liike', emoji: '🐴', hint: 'Valitse armeija ja liikuta sitä viereiseen alueeseen.' },
  battle: { label: 'Taistelu', emoji: '⚔️', hint: 'Hyökkää viereistä vihollista vastaan.' },
  build: { label: 'Rakenna', emoji: '🏗️', hint: 'Rakenna leiri, markkina tai linnoitus. Rekrytoi armeija.' },
  end: { label: 'Lopeta', emoji: '🏁', hint: 'Lopeta vuoro ja anna AI-pelaajien toimia.' },
};

const PHASE_ORDER: MVPPhase[] = ['resource', 'cards', 'move', 'battle', 'build', 'end'];

interface PhaseBarProps {
  currentPhase: MVPPhase;
  onNextPhase: () => void;
  onEndTurn: () => void;
}

export const PhaseBar = ({ currentPhase, onNextPhase, onEndTurn }: PhaseBarProps) => {
  const currentIndex = PHASE_ORDER.indexOf(currentPhase);
  const info = PHASE_INFO[currentPhase];
  const isLastPhase = currentPhase === 'end';
  
  return (
    <div className="bg-slate-900/90 backdrop-blur-md border border-amber-700/20 rounded-xl px-4 py-2">
      {/* Phase steps */}
      <div className="flex items-center gap-1 mb-2">
        {PHASE_ORDER.map((phase, idx) => {
          const pInfo = PHASE_INFO[phase];
          const isDone = idx < currentIndex;
          const isCurrent = phase === currentPhase;
          
          return (
            <div key={phase} className="flex items-center">
              <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all ${
                isCurrent 
                  ? 'bg-amber-600 text-white font-bold scale-105'
                  : isDone
                  ? 'bg-green-900/50 text-green-300'
                  : 'bg-slate-800/50 text-slate-500'
              }`}>
                {isDone ? <Check className="w-3 h-3" /> : <span>{pInfo.emoji}</span>}
                <span className="hidden sm:inline">{pInfo.label}</span>
              </div>
              {idx < PHASE_ORDER.length - 1 && (
                <div className={`w-3 h-0.5 mx-0.5 ${idx < currentIndex ? 'bg-green-600' : 'bg-slate-700'}`} />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Current phase hint + action */}
      <div className="flex items-center justify-between">
        <p className="text-amber-200/80 text-xs">{info.emoji} {info.hint}</p>
        {isLastPhase ? (
          <Button size="sm" onClick={onEndTurn} className="bg-red-600 hover:bg-red-500 text-xs h-7">
            Lopeta vuoro 🏁
          </Button>
        ) : (
          <Button size="sm" onClick={onNextPhase} className="bg-amber-600 hover:bg-amber-500 text-xs h-7">
            Seuraava <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        )}
      </div>
    </div>
  );
};

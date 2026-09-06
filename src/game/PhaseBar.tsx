/**
 * PhaseBar.tsx — Vuoron vaihepalkki
 * 
 * Isompi, selkeämpi vaihepalkki integroidulla Seuraava/Lopeta-napilla.
 */
import { Button } from '@/components/ui/button.tsx';
import { ArrowRight, Check, Flag } from 'lucide-react';
import { useLanguage } from '@/lib/i18n.tsx';

export type MVPPhase = 'resource' | 'cards' | 'move' | 'battle' | 'build' | 'end';

const PHASE_EMOJI: Record<MVPPhase, string> = {
  resource: '🪙', cards: '🃏', move: '🐴', battle: '⚔️', build: '🏗️', end: '🏁',
};

const PHASE_ORDER: MVPPhase[] = ['resource', 'cards', 'move', 'battle', 'build', 'end'];

interface PhaseBarProps {
  currentPhase: MVPPhase;
  onNextPhase: () => void;
  onEndTurn: () => void;
  disabled?: boolean;
  /** false = larger touch-friendly action button (mobile mode) */
  compact?: boolean;
}

export const PhaseBar = ({ currentPhase, onNextPhase, onEndTurn, disabled = false, compact = true }: PhaseBarProps) => {
  const { t } = useLanguage();
  const currentIndex = PHASE_ORDER.indexOf(currentPhase);
  const isLastPhase = currentPhase === 'end';

  return (
    <div className="bg-slate-900/95 backdrop-blur-xl border border-amber-600/30 rounded-2xl shadow-2xl shadow-black/40">
      {/* Phase steps row */}
      <div className="flex items-center px-3 pt-2.5 pb-1.5 gap-0.5">
        {PHASE_ORDER.map((phase, idx) => {
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
                {isDone ? <Check className="w-3.5 h-3.5" /> : <span className="text-sm">{PHASE_EMOJI[phase]}</span>}
                <span className="hidden md:inline text-[11px]">{t(`phase.${phase}.label`)}</span>
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
          <span className="text-base mr-1">{PHASE_EMOJI[currentPhase]}</span>
          {disabled ? t('phase.aiActing') : t(`phase.${currentPhase}.hint`)}
        </p>
        {isLastPhase ? (
          <Button disabled={disabled} onClick={onEndTurn} className={`bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-900/40 flex-shrink-0 disabled:opacity-40 ${compact ? 'px-6 h-9 text-sm' : 'px-8 h-12 text-base'}`}>
            <Flag className="w-4 h-4 mr-1.5" />
            {t('phase.endTurn')}
          </Button>
        ) : (
          <Button disabled={disabled} onClick={onNextPhase} className={`bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl shadow-lg shadow-amber-900/40 flex-shrink-0 disabled:opacity-40 ${compact ? 'px-6 h-9 text-sm' : 'px-8 h-12 text-base'}`}>
            {t('phase.next')}
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        )}
      </div>
    </div>
  );
};

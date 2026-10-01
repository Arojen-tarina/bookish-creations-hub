/**
 * PhaseBar.tsx — Vuoron vaihepalkki
 * 
 * Aladockiin kiinnittyvä vuoron vaihepalkki integroidulla toimintonapilla.
 * Oletuksena kompakti; kahvasta voi avata suuren, nykyistä vaihetta korostavan
 * paneelin.
 */
import { useCallback, useRef, useState } from 'react';
import { Button } from '@/components/ui/button.tsx';
import { ArrowRight, Check, ChevronDown, ChevronUp, Flag, GripHorizontal } from 'lucide-react';
import { useLanguage } from '@/lib/i18n.tsx';

export type MVPPhase = 'resource' | 'cards' | 'attack' | 'build' | 'end';

const PHASE_EMOJI: Record<MVPPhase, string> = {
  resource: '🪙', cards: '🃏', attack: '⚔️', build: '🏗️', end: '🏁',
};

const PHASE_ORDER: MVPPhase[] = ['resource', 'cards', 'attack', 'build', 'end'];

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
  const [collapsed, setCollapsed] = useState(true);
  const compactAction = collapsed && compact;
  const dragRef = useRef<{ startY: number; toggled: boolean } | null>(null);
  const onHandleDragStart = useCallback((clientY: number) => {
    dragRef.current = { startY: clientY, toggled: false };
    const move = (y: number) => {
      const state = dragRef.current;
      if (!state || state.toggled) return;
      const dy = y - state.startY;
      if (dy > 24) { setCollapsed(true); state.toggled = true; }
      else if (dy < -24) { setCollapsed(false); state.toggled = true; }
    };
    const onMouseMove = (e: MouseEvent) => move(e.clientY);
    const onTouchMove = (e: TouchEvent) => { if (e.touches[0]) move(e.touches[0].clientY); };
    const end = () => {
      dragRef.current = null;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', end);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', end);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', end);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', end);
  }, []);

  return (
    <div
      className={`flex flex-col overflow-hidden bg-slate-900/95 backdrop-blur-xl border border-amber-600/30 rounded-2xl shadow-2xl shadow-black/40 transition-[height] duration-300 ${collapsed ? '' : 'min-h-[168px]'}`}
      style={{ height: collapsed ? undefined : 'min(42dvh, 360px)' }}
    >
      {/* Raahaa ylös laajentaaksesi ja alas pienentääksesi; myös klikkaus vaihtaa kokoa. */}
      <div
        className="group flex items-center justify-center gap-1 h-5 cursor-ns-resize touch-none select-none bg-amber-500/5 hover:bg-amber-500/15 rounded-t-2xl transition-colors"
        onMouseDown={(e) => { e.preventDefault(); onHandleDragStart(e.clientY); }}
        onTouchStart={(e) => { if (e.touches[0]) onHandleDragStart(e.touches[0].clientY); }}
        onClick={() => setCollapsed(v => !v)}
        title={collapsed ? t('phase.expand') : t('phase.collapse')}
      >
        <GripHorizontal className="w-6 h-3.5 text-amber-400/70 group-hover:text-amber-300 transition-colors" />
        {collapsed ? <ChevronDown className="w-3.5 h-3.5 text-amber-400/70 group-hover:text-amber-300" /> : <ChevronUp className="w-3.5 h-3.5 text-amber-400/70 group-hover:text-amber-300" />}
      </div>

      {/* Phase steps row — hidden when collapsed to shrink the bar */}
      {!collapsed && (
        <div className="flex items-center px-3 pb-1.5 gap-0.5">
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
      )}

      {!collapsed && (
        <div className="flex min-h-0 flex-1 items-center justify-center px-5 py-4 text-center">
          <div className="max-w-2xl">
            <div className="mb-1 text-3xl">{PHASE_EMOJI[currentPhase]}</div>
            <h3 className="text-amber-100 text-xl font-bold">
              {t(`phase.${currentPhase}.label`)}
              <span className="ml-2 text-sm font-medium text-amber-300/60">{currentIndex + 1}/5</span>
            </h3>
            <p className="mt-1 text-amber-100/75 text-sm">
              {disabled ? t('phase.aiActing') : t(`phase.${currentPhase}.hint`)}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-3 pb-2.5 gap-3">
        {collapsed ? (
          <span className="min-w-0 truncate text-amber-200/80 text-xs font-medium">
            <span className="mr-1.5">{PHASE_EMOJI[currentPhase]}</span>
            {t(`phase.${currentPhase}.label`)} · {currentIndex + 1}/5
          </span>
        ) : <span />}
        {isLastPhase ? (
          <Button disabled={disabled} onClick={onEndTurn} className={`bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-900/40 flex-shrink-0 disabled:opacity-40 ${compactAction ? 'px-6 h-9 text-sm' : 'px-8 h-12 text-base'}`}>
            <Flag className="w-4 h-4 mr-1.5" />
            {t('phase.endTurn')}
          </Button>
        ) : (
          <Button disabled={disabled} onClick={onNextPhase} className={`bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl shadow-lg shadow-amber-900/40 flex-shrink-0 disabled:opacity-40 ${compactAction ? 'px-6 h-9 text-sm' : 'px-8 h-12 text-base'}`}>
            {t('phase.next')}
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        )}
      </div>
    </div>
  );
};


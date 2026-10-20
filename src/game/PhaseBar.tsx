/**
 * PhaseBar.tsx — End-turn and card-hand controls.
 */
import { Button } from '@/components/ui/button.tsx';
import { Eye, EyeOff, Flag, Trophy } from 'lucide-react';
import { useLanguage } from '@/lib/i18n.tsx';

interface PhaseBarProps {
  onEndTurn: () => void;
  showCardHand: boolean;
  onToggleCardHand: () => void;
  showAchievements: boolean;
  onToggleAchievements: () => void;
  disabled?: boolean;
  compact?: boolean;
  showEndTurn?: boolean;
}

export const PhaseBar = ({
  onEndTurn,
  showCardHand,
  onToggleCardHand,
  showAchievements,
  onToggleAchievements,
  disabled = false,
  compact = true,
  showEndTurn = true,
}: PhaseBarProps) => {
  const { t } = useLanguage();

  return (
    <div className="flex w-full min-w-0 items-center justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={onToggleAchievements}
        aria-label={t('achv.title')}
        aria-pressed={showAchievements}
        title={t('achv.title')}
        className={`shrink-0 rounded-xl border border-amber-400/40 bg-amber-600 font-bold text-white shadow-lg shadow-amber-900/40 hover:bg-amber-500 disabled:opacity-40 ${compact ? 'h-9 w-10 p-0' : 'h-12 w-12 p-0'}`}
      >
        <Trophy className="h-5 w-5" />
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={disabled}
        onClick={onToggleCardHand}
        aria-label={t(showCardHand ? 'cards.hideHand' : 'cards.showHand')}
        aria-pressed={showCardHand}
        title={t(showCardHand ? 'cards.hideHand' : 'cards.showHand')}
        className={`shrink-0 whitespace-nowrap rounded-xl border border-sky-400/40 bg-sky-600 font-bold text-white shadow-lg shadow-sky-900/40 hover:bg-sky-500 disabled:opacity-40 ${compact ? 'h-9 px-3 text-xs' : 'h-12 px-4 text-sm'}`}
      >
        {showCardHand ? <EyeOff className="w-4 h-4 sm:mr-1.5" /> : <Eye className="w-4 h-4 sm:mr-1.5" />}
        <span className="hidden sm:inline">{t(showCardHand ? 'cards.hideHand' : 'cards.showHand')}</span>
      </Button>
      {showEndTurn && (
        <Button
          disabled={disabled}
          onClick={onEndTurn}
          className={`shrink-0 whitespace-nowrap rounded-xl border border-amber-300/40 bg-gradient-to-b from-amber-400 to-amber-600 font-bold text-[#120f0c] shadow-lg shadow-amber-950/40 hover:from-amber-300 hover:to-amber-500 disabled:opacity-40 ${compact ? 'px-6 h-9 text-sm' : 'px-8 h-12 text-base'}`}
        >
          <Flag className="w-4 h-4 mr-1.5" />
          {t('phase.endTurn')}
        </Button>
      )}
    </div>
  );
};

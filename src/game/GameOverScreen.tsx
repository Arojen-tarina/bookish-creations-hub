/**
 * GameOverScreen.tsx — Voitto- ja häviöruutu
 */
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog.tsx';
import { Button } from '@/components/ui/button.tsx';
// import { AdManager } from '@/components/ui/AdManager.tsx';
import { Trophy, Skull, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/lib/i18n.tsx';

interface GameOverScreenProps {
  isOpen: boolean;
  isVictory: boolean;
  winCondition: string | null;
  turn: number;
  year: number;
  onRestart: () => void;
}



export const GameOverScreen = ({ isOpen, isVictory, winCondition, turn, year, onRestart }: GameOverScreenProps) => {
  const { t } = useLanguage();
  return (
    <Dialog open={isOpen}>
      <DialogContent className={`border text-white ${
        isVictory
          ? 'bg-gradient-to-br from-amber-900 to-amber-950 border-amber-600'
          : 'bg-gradient-to-br from-red-900 to-slate-950 border-red-600'
      }`}>
        <DialogHeader>
          <div className="flex justify-center mb-4">
            {isVictory ? (
              <Trophy className="w-20 h-20 text-amber-400 animate-pulse" />
            ) : (
              <Skull className="w-20 h-20 text-red-400 animate-pulse" />
            )}
          </div>
          <DialogTitle className={`text-3xl text-center ${isVictory ? 'text-amber-100' : 'text-red-100'}`}>
            {isVictory ? t('gameOver.victory') : t('gameOver.defeat')}
          </DialogTitle>
          <DialogDescription className={`text-center text-lg ${isVictory ? 'text-amber-200' : 'text-red-200'}`}>
            {isVictory ? (
              <>
                {winCondition === 'military' && t('gameOver.victory.military')}
                {winCondition === 'economic' && t('gameOver.victory.economic')}
                {winCondition === 'technology' && t('gameOver.victory.technology')}
                {winCondition === 'diplomatic' && t('gameOver.victory.diplomatic')}
                {winCondition === 'cultural' && t('gameOver.victory.cultural')}
                {!winCondition && t('gameOver.victory.generic')}
              </>
            ) : (
              t('gameOver.defeatText')
            )}
          </DialogDescription>
          <p className={`text-center text-sm mt-2 ${isVictory ? 'text-amber-300/70' : 'text-red-300/70'}`}>
            {t('gameOver.turnYear', { turn, year })}
          </p>
        </DialogHeader>


        <DialogFooter className="justify-center">
          <Button onClick={onRestart} size="lg" className={isVictory ? 'bg-amber-600 hover:bg-amber-500' : 'bg-red-600 hover:bg-red-500'}>
            <RotateCcw className="w-5 h-5 mr-2" />
            {t('gameOver.playAgain')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

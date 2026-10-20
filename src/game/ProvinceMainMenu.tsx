import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Compass, ScrollText, Settings, Sparkles, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { AchievementsPanel } from '@/game/AchievementsPanel.tsx';
import { SaveLoadMenu } from '@/game/SaveLoadMenu.tsx';
import { SettingsMenu } from '@/game/SettingsMenu.tsx';
import { useLanguage } from '@/lib/i18n.tsx';
import type { SaveMetadata } from '@/types/province.ts';
import type { MVPGameState } from '@/hooks/useProvinceGameState.ts';
import menuBackground from '@/assets/menu-bg.jpg';

interface ProvinceMainMenuProps {
  continueSave: SaveMetadata | null;
  onContinue: () => void;
  onNewGame: () => void;
  onLoad: (state: MVPGameState) => void;
  musicVolume: number;
  onMusicVolumeChange: (volume: number) => void;
}

export const ProvinceMainMenu = ({
  continueSave,
  onContinue,
  onNewGame,
  onLoad,
  musicVolume,
  onMusicVolumeChange,
}: ProvinceMainMenuProps) => {
  const { t } = useLanguage();
  const [showAchievements, setShowAchievements] = useState(false);

  return (
    <main className="native-screen fixed inset-0 overflow-y-auto bg-[#120f0c] text-[#f4ead5]">
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${menuBackground})` }}
      />
      <div className="fixed inset-0 bg-gradient-to-r from-[#120f0c]/95 via-[#120f0c]/75 to-[#120f0c]/35" />
      <div className="relative z-10 mx-auto flex min-h-full max-w-7xl flex-col justify-center gap-8 px-4 py-8 sm:px-8 lg:flex-row lg:items-center lg:gap-16">
        <section className="w-full max-w-md rounded-2xl border border-amber-500/30 bg-[#1b1612]/90 p-5 shadow-2xl shadow-black/50 backdrop-blur-md sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-amber-400/50 bg-amber-500/10 text-amber-300">
              <Compass className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-wide text-amber-200 sm:text-3xl">{t('faction.title')}</h1>
              <p className="text-xs uppercase tracking-[0.18em] text-amber-100/55">{t('faction.subtitle')}</p>
            </div>
          </div>
          <div className="mb-6 h-px bg-gradient-to-r from-amber-400/70 via-amber-500/20 to-transparent" />

          {continueSave && (
            <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-950/30 p-3 text-center">
              <p className="text-sm font-semibold text-amber-100">{t('faction.continueTitle')}</p>
              <p className="mt-1 text-xs text-amber-100/60">
                {t('faction.continueDesc', {
                  turn: continueSave.turn,
                  faction: t(`faction.name.${continueSave.playerFaction}`),
                })}
              </p>
              <Button onClick={onContinue} className="mt-3 w-full rounded-lg bg-amber-500 font-bold text-[#120f0c] hover:bg-amber-300">
                {t('faction.continueButton')}
              </Button>
            </div>
          )}

          <Button onClick={onNewGame} className="h-12 w-full rounded-lg bg-gradient-to-b from-amber-300 to-amber-500 font-bold text-[#120f0c] shadow-lg shadow-amber-950/40 hover:from-amber-200 hover:to-amber-400">
            <Sparkles className="mr-2 h-4 w-4" />
            {t('menu.newGame')}
          </Button>
          <div className="mt-3">
            <SaveLoadMenu gameState={null} onLoad={onLoad} buttonClassName="hidden" trigger={<Button variant="outline" className="h-11 w-full rounded-lg border-amber-500/30 bg-[#251e18] text-amber-100 hover:bg-[#31281f]">{t('menu.loadGame')}</Button>} />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => setShowAchievements(true)} className="rounded-lg border-amber-500/25 bg-[#251e18]/80 text-amber-100 hover:bg-[#31281f]">
              <Trophy className="mr-2 h-4 w-4 text-amber-300" />
              {t('menu.achievements')}
            </Button>
            <SettingsMenu
              buttonClassName="h-10 w-full rounded-lg border border-amber-500/25 bg-[#251e18]/80 text-amber-100 hover:bg-[#31281f]"
              musicVolume={musicVolume}
              onMusicVolumeChange={onMusicVolumeChange}
            />
            <Link to="/codex">
              <Button variant="outline" className="w-full rounded-lg border-amber-500/25 bg-[#251e18]/80 text-amber-100 hover:bg-[#31281f]">
                <ScrollText className="mr-2 h-4 w-4 text-amber-300" />
                {t('faction.worldChronicle')}
              </Button>
            </Link>
            <Link to="/ohjekirja">
              <Button variant="outline" className="w-full rounded-lg border-amber-500/25 bg-[#251e18]/80 text-amber-100 hover:bg-[#31281f]">
                <BookOpen className="mr-2 h-4 w-4 text-amber-300" />
                {t('faction.rulebook')}
              </Button>
            </Link>
          </div>
        </section>

        <aside className="hidden max-w-xl flex-1 self-end pb-8 text-right lg:block">
          <p className="text-lg italic leading-relaxed text-amber-100/80 xl:text-2xl">{t('faction.tagline')}</p>
        </aside>
      </div>

      {showAchievements && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm">
          <section className="native-panel relative max-h-[90dvh] w-full max-w-4xl overflow-y-auto rounded-2xl p-4 sm:p-6">
            <Button variant="ghost" onClick={() => setShowAchievements(false)} className="absolute right-2 top-2 text-amber-100">
              {t('common.close')}
            </Button>
            <AchievementsPanel />
          </section>
        </div>
      )}
    </main>
  );
};

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Compass, ScrollText, Sparkles, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { AchievementsPanel } from '@/game/AchievementsPanel.tsx';
import { ProvinceLoadGameScreen } from '@/game/ProvinceLoadGameScreen.tsx';
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
  const [showLoadGame, setShowLoadGame] = useState(false);

  if (showLoadGame) {
    return <ProvinceLoadGameScreen onBack={() => setShowLoadGame(false)} onLoad={onLoad} />;
  }

  return (
    <main className="native-screen fixed inset-0 overflow-y-auto bg-[#120f0c] text-[#f4ead5]">
      <div
        className="fixed inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${menuBackground})` }}
      />
      <div className="fixed inset-0 bg-gradient-to-r from-[#120f0c]/95 via-[#120f0c]/80 to-[#120f0c]/35" />
      <div className="relative z-10 mx-auto flex min-h-full max-w-7xl flex-col justify-center gap-8 px-5 py-6 sm:px-8 lg:flex-row lg:items-center lg:gap-14">
        <section className="w-full max-w-[380px] py-3">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center text-amber-300">
              <Compass className="h-12 w-12" strokeWidth={1.4} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-[0.08em] text-amber-200 sm:text-3xl">{t('faction.title')}</h1>
              <p className="text-xs text-[#c4b496]">{t('faction.subtitle')}</p>
            </div>
          </div>
          <div className="mb-5 h-px bg-gradient-to-r from-amber-400/80 via-amber-500/30 to-transparent" />

          {continueSave && (
            <div className="mb-2">
              <Button onClick={onContinue} className="native-button-primary w-full hover:brightness-110">
                {t('faction.continueButton')}
              </Button>
              <p className="mt-1 text-center text-xs text-[#c4b496]">
                {t('faction.continueDesc', {
                  turn: continueSave.turn,
                  faction: t(`faction.name.${continueSave.playerFaction}`),
                })}
              </p>
            </div>
          )}

          <Button onClick={onNewGame} className="native-button-primary w-full hover:brightness-110">
            <Sparkles className="mr-2 h-4 w-4" />
            {t('menu.newGame')}
          </Button>
          <div className="mt-3">
            <Button variant="outline" onClick={() => setShowLoadGame(true)} className="native-button-secondary w-full hover:bg-[#31281f]">
              {t('menu.loadGame')}
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => setShowAchievements(true)} className="native-button-secondary h-10 min-h-10 px-2 text-sm hover:bg-[#31281f]">
              <Trophy className="mr-2 h-4 w-4 text-amber-300" />
              {t('menu.achievements')}
            </Button>
            <SettingsMenu
              buttonClassName="native-button-secondary h-10 min-h-10 w-full gap-2 px-2 text-sm hover:bg-[#31281f]"
              musicVolume={musicVolume}
              onMusicVolumeChange={onMusicVolumeChange}
              fullScreen
              showLabel
            />
            <Link to="/codex">
              <Button variant="outline" className="native-button-secondary h-10 min-h-10 w-full px-2 text-sm hover:bg-[#31281f]">
                <ScrollText className="mr-2 h-4 w-4 text-amber-300" />
                {t('faction.worldChronicle')}
              </Button>
            </Link>
            <Link to="/ohjekirja">
              <Button variant="outline" className="native-button-secondary h-10 min-h-10 w-full px-2 text-sm hover:bg-[#31281f]">
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
        <div className="fixed inset-0 z-[80] flex items-stretch justify-stretch bg-black/75 p-0 backdrop-blur-sm sm:p-4">
          <section className="native-panel relative mx-auto h-full max-h-full w-full max-w-6xl overflow-y-auto rounded-none p-4 sm:rounded-2xl sm:p-6">
            <Button type="button" variant="ghost" onClick={() => setShowAchievements(false)} className="absolute right-2 top-2 text-amber-100">
              {t('common.close')}
            </Button>
            <AchievementsPanel />
          </section>
        </div>
      )}
    </main>
  );
};

import { useState } from 'react';
import { ArrowLeft, BookOpen, Check, Shield, Sparkles, Sword, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { SettingsMenu } from './SettingsMenu.tsx';
import { ACTIVE_FACTIONS, VICTORY_TARGETS } from '@/hooks/useProvinceGameState.ts';
import type { Difficulty } from '@/hooks/useProvinceGameState.ts';
import { FACTION_DATA_1206 } from '@/types/province.ts';
import type { FactionId, SaveMetadata } from '@/types/province.ts';
import { useLanguage } from '@/lib/i18n.tsx';
import menuBackground from '@/assets/menu-bg.jpg';
import leaderMongol from '@/assets/sprites/leader_mongol.png';
import leaderChinese from '@/assets/sprites/leader_chinese.png';
import leaderNovgorod from '@/assets/sprites/leader_novgorod.png';
import leaderPersian from '@/assets/sprites/leader_persian.png';
import resGold from '@/assets/sprites/res_gold.png';
import resHorse from '@/assets/sprites/res_horse.png';

interface ProvinceFactionSelectProps {
  onSelect: (factionId: FactionId, difficulty: Difficulty) => void;
  continueSave?: SaveMetadata | null;
  onContinue?: () => void;
  onBackToMenu?: () => void;
}

const LEADER_ART: Record<string, string> = {
  mongol: leaderMongol,
  song: leaderChinese,
  rus: leaderNovgorod,
  khwarezm: leaderPersian,
};

const REALM_STATS: Record<string, { cavalry: number; economy: number; defense: number; challenge: Difficulty }> = {
  mongol: { cavalry: 5, economy: 2, defense: 2, challenge: 'normal' },
  song: { cavalry: 1, economy: 5, defense: 3, challenge: 'easy' },
  rus: { cavalry: 2, economy: 3, defense: 4, challenge: 'hard' },
  khwarezm: { cavalry: 3, economy: 4, defense: 3, challenge: 'normal' },
};

const DIFFICULTIES: Difficulty[] = ['easy', 'normal', 'hard'];
const VICTORY_GOALS: {
  icon: string;
  title: string;
  subtitle: string;
  values: Record<string, number>;
}[] = [
  { icon: '🗺️', title: 'faction.goal.military.title', subtitle: 'faction.goal.military.sub', values: { provinces: VICTORY_TARGETS.provinces } },
  { icon: '💰', title: 'faction.goal.economic.title', subtitle: 'faction.goal.economic.sub', values: { gold: VICTORY_TARGETS.gold, streak: VICTORY_TARGETS.treasuryStreak } },
  { icon: '🔬', title: 'faction.goal.tech.title', subtitle: 'faction.goal.tech.sub', values: { tech: VICTORY_TARGETS.tech } },
  { icon: '🕊️', title: 'faction.goal.diplomatic.title', subtitle: 'faction.goal.diplomatic.sub', values: { influence: VICTORY_TARGETS.influence, allies: VICTORY_TARGETS.diplomaticMinAllies } },
  { icon: '🏛️', title: 'faction.goal.cultural.title', subtitle: 'faction.goal.cultural.sub', values: { prestige: VICTORY_TARGETS.prestige } },
];

export const ProvinceFactionSelect = ({
  onSelect,
  continueSave,
  onBackToMenu,
}: ProvinceFactionSelectProps) => {
  const { t } = useLanguage();
  const [selectedFaction, setSelectedFaction] = useState<FactionId>('mongol');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [showGuide, setShowGuide] = useState(false);
  const [confirmReplace, setConfirmReplace] = useState(false);
  const faction = FACTION_DATA_1206[selectedFaction];
  const stats = REALM_STATS[selectedFaction];

  const startGame = () => {
    if (continueSave) {
      setConfirmReplace(true);
      return;
    }
    onSelect(selectedFaction, difficulty);
  };

  return (
    <main className="native-screen fixed inset-0 overflow-y-auto bg-[#120f0c] text-[#f4ead5]">
      <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${menuBackground})` }} />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(18,15,12,.58),rgba(18,15,12,.92))]" />
      <div className="relative z-10 mx-auto flex min-h-full max-w-[1440px] flex-col px-3 py-3 sm:px-5 sm:py-4">
        <header className="mb-3 flex shrink-0 items-center gap-3">
          {onBackToMenu && (
            <Button
              type="button"
              variant="outline"
              onClick={onBackToMenu}
              aria-label={t('common.back')}
              className="native-button-secondary h-10 min-h-10 w-10 shrink-0 p-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-xl font-bold tracking-wide text-[#f2c46b] sm:text-2xl">
              {t('faction.selectTitle')}
            </h1>
            <p className="truncate text-xs text-[#c4b496]">{t('faction.selectHint')}</p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowGuide(true)}
            className="native-button-secondary h-10 min-h-10 gap-2 px-3"
          >
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">{t('faction.howToPlay')}</span>
          </Button>
          <SettingsMenu />
        </header>

        <div className="grid flex-1 gap-3 md:min-h-0 md:grid-cols-[1.1fr_1fr]">
          <section
            aria-label={t('faction.selectTitle')}
            className="grid min-h-[360px] grid-cols-2 grid-rows-2 gap-2 sm:gap-3 md:min-h-0"
          >
            {ACTIVE_FACTIONS.map(id => {
              const data = FACTION_DATA_1206[id];
              const selected = selectedFaction === id;
              const realmStats = REALM_STATS[id];
              const difficultyColor = realmStats.challenge === 'easy'
                ? 'border-emerald-400/70 text-emerald-200'
                : realmStats.challenge === 'hard'
                  ? 'border-red-400/70 text-red-200'
                  : 'border-amber-400/70 text-amber-200';
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setSelectedFaction(id)}
                  className={`group relative min-h-0 overflow-hidden rounded-xl border text-left transition duration-200 ${
                    selected
                      ? 'scale-[1.015] border-[#f2c46b] shadow-[0_0_22px_rgba(224,169,68,.22)]'
                      : 'border-white/15 hover:border-amber-300/60'
                  }`}
                  style={{ background: `linear-gradient(135deg, ${data.color}55 0%, #120f0c 82%)` }}
                >
                  <img
                    src={LEADER_ART[id]}
                    alt=""
                    draggable={false}
                    className="absolute inset-y-0 right-0 h-full w-[62%] object-contain object-bottom transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#120f0c]/95 via-[#120f0c]/55 to-transparent" />
                  <div className="relative flex h-full flex-col p-2.5 sm:p-3">
                    <span className="mb-1 h-2.5 w-2.5 rounded-full" style={{ backgroundColor: data.color }} />
                    <span className="max-w-[70%] text-sm font-bold leading-tight text-[#f4ead5] sm:text-base">
                      {t(`faction.name.${id}`)}
                    </span>
                    <span className="mt-0.5 max-w-[72%] text-[10px] text-[#c4b496] sm:text-xs">
                      {t(`faction.ruler.${id}`)}
                    </span>
                    <span className={`mt-auto w-fit rounded-full border bg-black/45 px-2 py-0.5 text-[9px] sm:text-[10px] ${difficultyColor}`}>
                      {t(`difficulty.${realmStats.challenge}`)}
                    </span>
                    {selected && <Check className="absolute right-2 top-2 h-4 w-4 text-[#f2c46b]" />}
                  </div>
                </button>
              );
            })}
          </section>

          <section className="native-panel flex min-h-[430px] flex-col overflow-hidden rounded-xl">
            <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
              <div className="mb-1 flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: faction.color }} />
                <h2 className="text-lg font-bold text-[#f2c46b] sm:text-xl">{t(`faction.name.${selectedFaction}`)}</h2>
              </div>
              <p className="mb-3 text-xs italic leading-relaxed text-[#c4b496]">
                {t(`faction.flavor.${selectedFaction}`)}
              </p>

              <div className="mb-3 grid grid-cols-3 gap-2">
                {[
                  { label: t('stat.cavalry'), value: stats.cavalry, icon: <Sword className="h-4 w-4 text-red-300" />, color: 'bg-red-400' },
                  { label: t('stat.economy'), value: stats.economy, icon: <span className="text-sm">🪙</span>, color: 'bg-amber-300' },
                  { label: t('stat.defense'), value: stats.defense, icon: <Shield className="h-4 w-4 text-sky-300" />, color: 'bg-sky-300' },
                ].map(stat => (
                  <div key={stat.label} className="rounded-lg border border-white/10 bg-black/20 p-2">
                    <div className="mb-1 flex items-center gap-1.5 text-[10px] text-[#f4ead5] sm:text-xs">
                      {stat.icon}
                      <span className="truncate">{stat.label}</span>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }, (_, index) => (
                        <span
                          key={index}
                          className={`h-1.5 flex-1 rounded-full ${index < stat.value ? stat.color : 'bg-[#43372a]'}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-3 rounded-lg border p-2.5" style={{ borderColor: `${faction.color}80`, backgroundColor: `${faction.color}20` }}>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-[#e0a944]">{t('faction.specialAbility')}</p>
                <p className="text-xs leading-relaxed text-[#f4ead5]">{t(`ability.${selectedFaction}`)}</p>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 pt-2">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-[#8c7d64]">
                  {t('faction.startingResources')}
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-amber-200">
                  <img src={resGold} alt="" className="h-5 w-4 object-contain" />{faction.treasury}
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-sky-200">
                  <Users className="h-4 w-4" />{faction.manpower}
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-orange-200">
                  <img src={resHorse} alt="" className="h-5 w-4 object-contain" />{faction.horses}
                </span>
              </div>
            </div>

            <div className="shrink-0 border-t border-amber-700/25 p-3 sm:p-4">
              <p className="mb-1.5 text-xs font-semibold text-[#8c7d64]">{t('faction.difficulty')}</p>
              <div className="grid grid-cols-3 gap-1.5">
                {DIFFICULTIES.map(level => (
                  <button
                    key={level}
                    type="button"
                    aria-pressed={difficulty === level}
                    onClick={() => setDifficulty(level)}
                    className={`rounded-lg border px-2 py-1.5 text-xs font-bold transition-colors ${
                      difficulty === level
                        ? 'border-[#f2c46b] bg-[#e0a944] text-[#120f0c]'
                        : 'border-[#43372a] bg-[#251e18] text-[#c4b496] hover:border-amber-500/70'
                    }`}
                  >
                    {t(`difficulty.${level}`)}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 min-h-8 text-[10px] leading-snug text-[#c4b496]">
                {t(`difficulty.${difficulty}Desc`)}
              </p>
              <Button type="button" onClick={startGame} className="native-button-primary mt-2 w-full hover:brightness-110">
                <Sparkles className="mr-2 h-4 w-4" />
                {t('faction.leadPrompt', { name: t(`faction.name.${selectedFaction}`) })}
              </Button>
            </div>
          </section>
        </div>
      </div>

      {(showGuide || confirmReplace) && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 p-3 backdrop-blur-sm"
          role="presentation"
          onMouseDown={event => {
            if (event.target === event.currentTarget) {
              setShowGuide(false);
              setConfirmReplace(false);
            }
          }}
        >
          <section
            className="native-panel max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-2xl p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="faction-dialog-title"
          >
            <div className="mb-4 flex items-start gap-3">
              <div className="flex-1">
                <h2 id="faction-dialog-title" className="text-xl font-bold text-[#f2c46b]">
                  {confirmReplace ? t('faction.replaceTitle') : t('faction.howToPlay')}
                </h2>
                {confirmReplace && continueSave && (
                  <p className="mt-2 text-sm text-[#c4b496]">
                    {t('faction.replaceDesc', {
                      turn: continueSave.turn,
                      faction: t(`faction.name.${continueSave.playerFaction}`),
                    })}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => { setShowGuide(false); setConfirmReplace(false); }}
                aria-label={t('common.close')}
                className="rounded-lg p-1 text-[#c4b496] hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {confirmReplace ? (
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setConfirmReplace(false)} className="native-button-secondary px-4">
                  {t('common.back')}
                </Button>
                <Button
                  type="button"
                  onClick={() => { setConfirmReplace(false); onSelect(selectedFaction, difficulty); }}
                  className="native-button-primary px-4"
                >
                  {t('faction.replaceConfirm')}
                </Button>
              </div>
            ) : (
              <>
                <p className="mb-3 text-xs text-[#c4b496]">{t('faction.howToPlayHint')}</p>
                <div className="grid gap-2 sm:grid-cols-5">
                  {[
                    ['🪙', 'faction.step1.title', 'faction.step1.desc'],
                    ['🃏', 'faction.step2.title', 'faction.step2.desc'],
                    ['⚔️', 'faction.step3.title', 'faction.step3.desc'],
                    ['🏗️', 'faction.step4.title', 'faction.step4.desc'],
                    ['🏁', 'faction.step5.title', 'faction.step5.desc'],
                  ].map(([icon, title, description], index) => (
                    <article key={title} className="rounded-lg border border-amber-700/30 bg-[#251e18] p-2.5">
                      <p className="text-sm">{icon} <span className="font-bold text-[#f4ead5]">{index + 1}. {t(title)}</span></p>
                      <p className="mt-1 text-[10px] leading-relaxed text-[#c4b496]">{t(description)}</p>
                    </article>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {VICTORY_GOALS.map(({ icon, title, subtitle, values }) => (
                    <article key={title} className="rounded-lg border border-white/10 bg-black/20 p-2 text-center">
                      <p>{icon}</p>
                      <p className="text-[10px] font-semibold text-[#f4ead5]">
                        {t(title, values)}
                      </p>
                      <p className="text-[9px] text-[#c4b496]">{t(subtitle)}</p>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
};

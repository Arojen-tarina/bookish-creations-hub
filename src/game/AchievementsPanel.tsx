/**
 * AchievementsPanel.tsx — Saavutusten lista (Tavoitteet-välilehti)
 *
 * Näyttää pelaajan tason/arvonimen, kokonaispisteet ja kaikki saavutukset
 * kategorioittain (piilotetut näkyvät "???"-tekstillä ennen avaamista).
 * Hakee tiedot AchievementManagerilta (natiivi SharedPreferences Androidilla,
 * localStorage muualla) ja PlayerStats-tilastoista (progressipalkkeja varten).
 */
import { useEffect, useMemo, useState } from 'react';
import { Lock, Trophy } from 'lucide-react';
import { achievementManager, ACHIEVEMENTS_UPDATED_EVENT, getPlayerProgression, type Achievement } from '@/game/achievements.ts';
import { getPlayerStats, PLAYER_STATS_UPDATED_EVENT } from '@/game/playerStats.ts';
import type { PlayerStats, AchievementCategory } from '@/game/achievementTypes.ts';
import { useLanguage } from '@/lib/i18n.tsx';

const CATEGORY_ORDER: AchievementCategory[] = [
  'tutorial', 'early_game', 'mid_game', 'end_game',
  'skill', 'exploration', 'collection', 'challenge',
  'historical', 'campaign', 'daily_weekly', 'lifetime', 'hidden',
];

export const AchievementsPanel = () => {
  const { lang, t } = useLanguage();
  const [achievements, setAchievements] = useState<Achievement[] | null>(null);
  const [stats, setStats] = useState<PlayerStats>(() => getPlayerStats());

  useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      achievementManager.getAllAchievements().then(list => {
        if (!cancelled) setAchievements(list);
      });
      setStats(getPlayerStats());
    };
    refresh();
    window.addEventListener(ACHIEVEMENTS_UPDATED_EVENT, refresh);
    window.addEventListener(PLAYER_STATS_UPDATED_EVENT, refresh);
    return () => {
      cancelled = true;
      window.removeEventListener(ACHIEVEMENTS_UPDATED_EVENT, refresh);
      window.removeEventListener(PLAYER_STATS_UPDATED_EVENT, refresh);
    };
  }, []);

  const totalPoints = useMemo(
    () => (achievements ?? []).filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0),
    [achievements],
  );
  const progression = useMemo(() => getPlayerProgression(totalPoints, lang), [totalPoints, lang]);

  if (!achievements) return null;

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const byCategory = CATEGORY_ORDER.map(category => ({
    category,
    items: achievements.filter(a => a.category === category),
  })).filter(group => group.items.length > 0);

  return (
    <div>
      <div className="mb-3 rounded-lg border border-amber-700/30 bg-amber-950/30 px-3 py-2">
        <h4 className="text-amber-100 text-xs font-bold flex items-center gap-1.5">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          {t('achv.title')} ({unlockedCount}/{achievements.length})
        </h4>
        <p className="text-amber-200/70 text-[11px] mt-0.5">
          {t('achv.level')} {progression.level} · {progression.title} · {totalPoints} {t('achv.points')}
        </p>
        <div className="mt-1.5 h-1.5 rounded-full bg-slate-800/80 overflow-hidden">
          <div
            className="h-full bg-amber-500"
            style={{ width: `${progression.pointsForNextLevel > 0 ? Math.min(100, (progression.pointsIntoLevel / progression.pointsForNextLevel) * 100) : 100}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {byCategory.map(({ category, items }) => {
          const unlockedInCategory = items.filter(a => a.unlocked).length;
          return (
            <div key={category}>
              <h5 className="text-amber-300/80 text-[11px] font-bold uppercase tracking-wide mb-1">
                {t(`achv.category.${category}`)} ({unlockedInCategory}/{items.length})
              </h5>
              <div className="space-y-1.5">
                {items.map(a => {
                  const isMysterious = a.hidden && !a.unlocked;
                  const progress = !a.unlocked && a.progress ? a.progress(stats) : null;
                  return (
                    <div
                      key={a.id}
                      className={`flex items-start gap-2 rounded-lg px-2 py-1.5 text-xs ${
                        a.unlocked
                          ? a.legendary
                            ? 'bg-gradient-to-r from-amber-900/50 to-purple-900/30 border border-amber-500/50'
                            : 'bg-amber-950/40 border border-amber-700/30'
                          : 'bg-slate-900/40 border border-slate-700/30 opacity-60'
                      }`}
                    >
                      {a.unlocked ? <Trophy className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" /> : <Lock className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />}
                      <div className="min-w-0 flex-1">
                        <p className={`font-semibold ${a.unlocked ? 'text-amber-100' : 'text-slate-400'}`}>
                          {isMysterious ? t('achv.hiddenName') : a.name[lang]}
                          <span className="ml-1.5 font-normal text-[10px] text-amber-400/70">+{a.points}</span>
                        </p>
                        <p className="text-slate-400">{isMysterious ? t('achv.hiddenDesc') : a.description[lang]}</p>
                        {a.unlocked && a.reward && (
                          <p className="text-amber-300/80 mt-0.5">{a.reward.icon} {a.reward.name[lang]}</p>
                        )}
                        {progress && (
                          <div className="mt-1 h-1 rounded-full bg-slate-800/80 overflow-hidden">
                            <div className="h-full bg-amber-600/70" style={{ width: `${Math.min(100, (progress.current / progress.target) * 100)}%` }} />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

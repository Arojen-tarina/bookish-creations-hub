/**
 * AchievementsPanel.tsx — Saavutusten lista (Tavoitteet-välilehti)
 *
 * Näyttää kaikki saavutukset ja niiden lukitustilan. Hakee tiedot
 * AchievementManagerilta (natiivi SharedPreferences Androidilla,
 * localStorage muualla).
 */
import { useEffect, useState } from 'react';
import { Lock, Trophy } from 'lucide-react';
import { achievementManager, ACHIEVEMENTS_UPDATED_EVENT, type Achievement } from '@/game/achievements.ts';
import { useLanguage } from '@/lib/i18n.tsx';

export const AchievementsPanel = () => {
  const { lang } = useLanguage();
  const [achievements, setAchievements] = useState<Achievement[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      achievementManager.getAllAchievements().then(list => {
        if (!cancelled) setAchievements(list);
      });
    };
    refresh();
    window.addEventListener(ACHIEVEMENTS_UPDATED_EVENT, refresh);
    return () => { cancelled = true; window.removeEventListener(ACHIEVEMENTS_UPDATED_EVENT, refresh); };
  }, []);

  if (!achievements) return null;

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div>
      <h4 className="text-amber-100 text-xs font-bold mb-2 flex items-center gap-1.5">
        <Trophy className="w-3.5 h-3.5 text-amber-400" />
        {lang === 'en' ? 'Achievements' : 'Saavutukset'} ({unlockedCount}/{achievements.length})
      </h4>
      <div className="space-y-1.5">
        {achievements.map(a => (
          <div
            key={a.id}
            className={`flex items-start gap-2 rounded-lg px-2 py-1.5 text-xs ${
              a.unlocked ? 'bg-amber-950/40 border border-amber-700/30' : 'bg-slate-900/40 border border-slate-700/30 opacity-60'
            }`}
          >
            {a.unlocked ? <Trophy className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" /> : <Lock className="w-3.5 h-3.5 text-slate-500 mt-0.5 flex-shrink-0" />}
            <div className="min-w-0">
              <p className={`font-semibold ${a.unlocked ? 'text-amber-100' : 'text-slate-400'}`}>{a.name[lang]}</p>
              <p className="text-slate-400">{a.description[lang]}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

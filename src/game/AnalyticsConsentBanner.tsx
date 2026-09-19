/**
 * AnalyticsConsentBanner.tsx — GDPR opt-in kysely (näytetään kerran)
 *
 * Näkyy vain kun suostumusta ei ole vielä päätetty (`getAnalyticsConsent()
 * === 'undecided'`). Molemmat painikkeet ("Salli"/"Ei kiitos") kirjaavat
 * eksplisiittisen päätöksen — kumpikaan ei jää roikkumaan, ja valinnan voi
 * aina muuttaa myöhemmin asetusvalikosta (SettingsMenu.tsx).
 */
import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { useLanguage } from '@/lib/i18n.tsx';
import { getAnalyticsConsent, setAnalyticsConsent, startSession } from '@/lib/analytics';

export const AnalyticsConsentBanner = () => {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getAnalyticsConsent() === 'undecided');
  }, []);

  if (!visible) return null;

  const decide = (granted: boolean) => {
    setAnalyticsConsent(granted);
    if (granted) startSession();
    setVisible(false);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[70] flex justify-center px-3 pt-3">
      <div className="max-w-xl w-full rounded-xl border border-amber-700/40 bg-slate-900/98 backdrop-blur-xl shadow-2xl p-4 flex gap-3 items-start">
        <ShieldCheck className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-amber-100 text-sm font-semibold mb-1">{t('analytics.consent.title')}</p>
          <p className="text-amber-200/70 text-xs mb-3">{t('analytics.consent.body')}</p>
          <div className="flex gap-2">
            <Button size="sm" className="bg-amber-500 hover:bg-amber-400 text-white" onClick={() => decide(true)}>
              {t('analytics.consent.accept')}
            </Button>
            <Button size="sm" variant="ghost" className="text-amber-200/70" onClick={() => decide(false)}>
              {t('analytics.consent.decline')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * useAnalyticsSession.ts — Mountataan kerran App.tsx:ssä
 *
 * Käynnistää istunnon (jos suostumus on jo annettu aiemmin) ja kytkee
 * näkyvyys-/sulkemiskuuntelijat, jotta `session_end` ehtii aina lähteä.
 */
import { useEffect } from 'react';
import { getAnalyticsConsent, startSession, wireSessionLifecycle } from '@/lib/analytics';

export const useAnalyticsSession = (): void => {
  useEffect(() => {
    if (getAnalyticsConsent() === 'granted') startSession();
    return wireSessionLifecycle();
  }, []);
};

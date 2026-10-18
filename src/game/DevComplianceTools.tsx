import { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { AdMob, AdmobConsentDebugGeography } from '@capacitor-community/admob';
import { LegalDisclaimer } from '@/game/LegalDisclaimer.tsx';

// Dev-only helpers for testing GDPR consent and the age disclaimer. Rendered only when import.meta.env.DEV.
export const DevComplianceTools = () => {
  const [log, setLog] = useState('');
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const native = Capacitor.isNativePlatform();

  const run = async (label: string, fn: () => Promise<unknown>) => {
    if (!native) {
      setLog(`${label}: AdMob works only in the Android app (not in the browser).`);
      return;
    }
    try {
      setLog(`${label}: ${JSON.stringify(await fn())}`);
    } catch (error) {
      setLog(`${label} failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const btn = 'w-full rounded-lg border border-fuchsia-500/40 bg-slate-800/60 px-2 py-1.5 text-left text-xs font-semibold text-fuchsia-200 hover:bg-slate-800';

  return (
    <div className="mt-3 border-t border-fuchsia-500/30 pt-2">
      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-fuchsia-300">DEV: GDPR tests</p>
      <div className="space-y-1.5">
        <button className={btn} onClick={() => run('Consent status', () => AdMob.requestConsentInfo())}>
          Check consent status
        </button>
        <button
          className={btn}
          onClick={() => run('Consent (EEA simulated)', async () => {
            await AdMob.resetConsentInfo();
            let info = await AdMob.requestConsentInfo({ debugGeography: AdmobConsentDebugGeography.EEA });
            if (info.isConsentFormAvailable) info = await AdMob.showConsentForm();
            return info;
          })}
        >
          Show consent dialog (simulate EEA)
        </button>
        <button className={btn} onClick={() => run('Reset consent', async () => { await AdMob.resetConsentInfo(); return 'reset'; })}>
          Reset consent
        </button>
        <button className={btn} onClick={() => setShowDisclaimer(true)}>
          Preview 18+ disclaimer
        </button>
      </div>
      {log && <p className="mt-1.5 break-words text-[10px] text-stone-300">{log}</p>}
      {showDisclaimer && (
        <LegalDisclaimer
          onAccept={() => setShowDisclaimer(false)}
          onShowPrivacy={() => setShowDisclaimer(false)}
        />
      )}
    </div>
  );
};

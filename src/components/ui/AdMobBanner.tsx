import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { Capacitor } from '@capacitor/core';
import { AdMob, BannerAdPosition, BannerAdSize } from '@capacitor-community/admob';
import { X } from 'lucide-react';
import { useLanguage } from '@/lib/i18n.tsx';
import { useDeviceMode } from '@/lib/deviceMode.tsx';
const bannerId = import.meta.env.VITE_ADMOB_BANNER_ID ?? '';
const canUseNativeAdMob = Capacitor.getPlatform() === 'android' && bannerId && bannerId !== 'ca-app-pub-0000000000000000/0000000000';

interface AdMobBannerProps {
  className?: string;
  style?: CSSProperties;
}

export function AdMobBanner({ className, style }: AdMobBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const { t } = useLanguage();
  const { deviceMode } = useDeviceMode();
  const isMobileMode = deviceMode === 'mobile';

  useEffect(() => {
    if (!canUseNativeAdMob || dismissed || !isMobileMode) {
      return;
    }

    let mounted = true;
    const showNativeBanner = async () => {
      try {
        await AdMob.initialize();
        if (!mounted) {
          return;
        }
        await AdMob.showBanner({
          adId: bannerId,
          adSize: BannerAdSize.BANNER,
          position: BannerAdPosition.BOTTOM_CENTER,
        });
        if (!mounted) {
          await AdMob.removeBanner();
        }
      } catch (error) {
        console.warn('AdMob banner failed to load:', error);
      }
    };

    showNativeBanner();

    return () => {
      mounted = false;
      AdMob.removeBanner().catch(() => undefined);
    };
  }, [dismissed, isMobileMode]);

  if (!isMobileMode) return null;

  return (
    <div className={`pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex h-[50px] w-full items-center justify-center ${className ?? ''}`} style={style}>
      {canUseNativeAdMob ? (
        <div className="h-[50px] w-[320px] max-w-full" aria-hidden="true" />
      ) : dismissed ? (
        <div className="h-[50px] w-[320px] max-w-full" aria-hidden="true" />
      ) : (
        <div className="pointer-events-auto flex h-[50px] w-[320px] max-w-full items-center justify-between border border-dashed border-amber-400/50 bg-slate-950/95 px-4 text-amber-100 shadow-[0_-4px_20px_rgba(0,0,0,0.35)]">
          <span className="text-[10px] font-bold uppercase">Test Ad</span>
          <span className="text-[10px] text-amber-200/70">320 x 50</span>
        </div>
      )}
      {canUseNativeAdMob && !dismissed && (
        <button
          type="button"
          aria-label={t('common.close')}
          title={t('common.close')}
          onClick={() => setDismissed(true)}
          className="pointer-events-auto absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full border border-white/40 bg-black/80 text-white shadow-lg hover:bg-black"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

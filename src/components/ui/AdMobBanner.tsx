import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { Capacitor } from '@capacitor/core';
import { AdMob, BannerAdPosition, BannerAdSize } from '@capacitor-community/admob';
import { X } from 'lucide-react';
import { useLanguage } from '@/lib/i18n.tsx';
const bannerId = import.meta.env.VITE_ADMOB_BANNER_ID ?? '';
const canUseNativeAdMob = Capacitor.getPlatform() === 'android' && bannerId && bannerId !== 'ca-app-pub-0000000000000000/0000000000';

interface AdMobBannerProps {
  className?: string;
  style?: CSSProperties;
}

export function AdMobBanner({ className, style }: AdMobBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (!canUseNativeAdMob || dismissed) {
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
          adSize: BannerAdSize.ADAPTIVE_BANNER,
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
  }, [dismissed]);

  if (!canUseNativeAdMob || dismissed) {
    return null;
  }

  return (
    <div className={`relative ${className ?? ''}`} style={{ width: '100%', minHeight: 90, ...style }}>
      <button
        type="button"
        aria-label={t('common.close')}
        title={t('common.close')}
        onClick={() => setDismissed(true)}
        className="absolute bottom-[calc(90px+0.75rem)] right-1 z-[100] flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-black/80 text-white shadow-lg hover:bg-black"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

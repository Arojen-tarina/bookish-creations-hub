import { useEffect } from 'react';
import type { CSSProperties } from 'react';
import { Capacitor } from '@capacitor/core';
import { AdMob, BannerAdPosition, BannerAdSize } from '@capacitor-community/admob';
const bannerId = import.meta.env.VITE_ADMOB_BANNER_ID ?? '';
const canUseNativeAdMob = Capacitor.getPlatform() === 'android' && bannerId && bannerId !== 'ca-app-pub-0000000000000000/0000000000';

interface AdMobBannerProps {
  className?: string;
  style?: CSSProperties;
}

export function AdMobBanner({ className, style }: AdMobBannerProps) {
  useEffect(() => {
    if (!canUseNativeAdMob) {
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
      } catch (error) {
        console.warn('AdMob banner failed to load:', error);
      }
    };

    showNativeBanner();

    return () => {
      mounted = false;
      AdMob.removeBanner().catch(() => undefined);
    };
  }, []);

  if (!canUseNativeAdMob) {
    return null;
  }

  return <div className={className} style={{ width: '100%', minHeight: 90, ...style }} />;
}

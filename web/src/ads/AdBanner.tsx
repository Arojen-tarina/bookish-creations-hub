import { useEffect } from 'react';
import { useStore } from '../lib/store';
import { ADSENSE_CLIENT, type AdUnit } from './adUnits';
import type { Ads } from './Ads';

interface AdBannerProps { ads: Ads; slot: AdUnit; className?: string }
declare global { interface Window { adsbygoogle?: unknown[] } }
export function AdBanner({ ads, slot, className = '' }: AdBannerProps) {
  const ready = useStore(ads.ready);
  const consent = useStore(ads.consent);
  useEffect(() => {
    if (!ready || consent !== 'accepted') return;
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch { /* AdSense can be blocked by the browser */ }
  }, [ready, consent, slot]);
  if (consent !== 'accepted') return null;
  return <ins className={`adsbygoogle ${className}`.trim()} style={{ display: 'block', minHeight: 50, textAlign: 'center' }} data-ad-client={ADSENSE_CLIENT} data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true" />;
}
export default AdBanner;

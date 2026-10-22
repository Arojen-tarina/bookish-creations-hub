import { useEffect, useState } from 'react';
declare global { interface Window { adsbygoogle?: unknown[] } }
import { useStore } from '../lib/store';
import type { Ads } from './Ads';
import type { GameMusic } from '../audio/GameMusic';
export function AdOverlayHost({ ads, music }: { ads: Ads; music?: GameMusic }) {
  const ad = useStore(ads.fullScreen);
  const [remaining, setRemaining] = useState(5);
  useEffect(() => { music?.setInterrupted(!!ad); return () => { if (!ad) music?.setInterrupted(false); }; }, [music, ad]);
  useEffect(() => { if (!ad) return; setRemaining(5); try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch { /* AdSense can be blocked */ } const timer = window.setInterval(() => setRemaining(value => Math.max(0, value - 1)), 1000); return () => window.clearInterval(timer); }, [ad]);
  if (!ad) return null;
  const slotLabel = ad.rewarded ? 'Rewarded ad' : 'Advertisement';
  return <div className="ad-overlay" role="dialog" aria-modal="true" aria-label={slotLabel}><div className="ad-overlay-card"><button className="ad-close" disabled={remaining > 0} onClick={() => ads.closeFullScreen(ad.rewarded && remaining <= 0)} aria-label="Close advertisement">{remaining > 0 ? `× ${remaining}` : '×'}</button><p className="ad-label">{slotLabel}</p><div className="ad-placeholder" style={{ width: 'min(90vw, 640px)', height: 'min(60vh, 480px)' }}><span>{slotLabel}</span><ins className="adsbygoogle" style={{ display: 'block', position: 'absolute', inset: 0 }} data-ad-client="ca-pub-1848284154496261" data-ad-slot={ad.slot} data-ad-format="auto" /></div><button className="game-button game-button-secondary" disabled={remaining > 0} onClick={() => ads.closeFullScreen(ad.rewarded && remaining <= 0)}>{remaining > 0 ? `Continue in ${remaining}` : 'Continue'}</button></div></div>;
}

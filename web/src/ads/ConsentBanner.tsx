import { useStore } from '../lib/store';
import type { Ads } from './Ads';
export function ConsentBanner({ ads }: { ads: Ads }) {
  const consent = useStore(ads.consent);
  if (consent !== 'undecided') return null;
  return <aside className="ads-consent" role="dialog" aria-label="Advertisement consent"><span>Allow ads to support the game? Ads will load only after you choose.</span><div><button className="game-button game-button-secondary game-button-compact" onClick={() => ads.declineConsent()}>Decline</button><button className="game-button game-button-primary game-button-compact" onClick={() => ads.acceptConsent()}>Allow ads</button></div></aside>;
}

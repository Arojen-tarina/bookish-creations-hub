import type { CSSProperties } from 'react';
import { GoogleAdSense } from '@/components/ui/AdSense.tsx';
import { HouseAd } from '@/components/ui/HouseAd.tsx';

export type AdZone =
  | 'global_bottom'
  | 'sidebar_in_game'
  | 'bottom_banner_in_game'
  | 'faction_select_banner'
  | 'game_over_screen';

const AD_SLOTS: Record<AdZone, string> = {
  global_bottom: '1234567890',
  sidebar_in_game: '2345678901',
  bottom_banner_in_game: '3456789012',
  faction_select_banner: '4567890123',
  game_over_screen: '5678901234',
};

const ADSENSE_CLIENT_ID = import.meta.env.VITE_ADSENSE_CLIENT_ID ?? '';
const isAdSenseConfigured = ADSENSE_CLIENT_ID && ADSENSE_CLIENT_ID !== 'ca-pub-0000000000000000';

interface AdManagerProps {
  zone: AdZone;
  variant?: 'banner' | 'square' | 'sidebar';
  className?: string;
  style?: CSSProperties;
}

export function AdManager({ zone, variant = 'banner', className, style }: AdManagerProps) {
  const slotId = AD_SLOTS[zone];

  if (isAdSenseConfigured && slotId) {
    return (
      <GoogleAdSense
        clientId={ADSENSE_CLIENT_ID}
        slotId={slotId}
        className={className}
        style={{ minHeight: 90, width: '100%', ...style }}
      />
    );
  }

  return <HouseAd slot={zone} variant={variant} className={className} />;
}

import type { CSSProperties } from 'react';

export type AdZone =
  | 'global_bottom'
  | 'sidebar_in_game'
  | 'bottom_banner_in_game'
  | 'faction_select_banner'
  | 'game_over_screen';

interface AdManagerProps {
  zone: AdZone;
  variant?: 'banner' | 'square' | 'sidebar';
  className?: string;
  style?: CSSProperties;
}

export function AdManager({ zone, variant = 'banner', className, style }: AdManagerProps) {
  return null;
}

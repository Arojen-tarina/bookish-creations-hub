import type { SVGProps } from 'react';

export type GameIconName = 'ZoomIn' | 'ZoomOut' | 'FitMap' | 'Back' | 'Close' | 'Menu' | 'Check' | 'Lock' | 'Trash' | 'Save' | 'Load' | 'EndTurn' | 'People' | 'Hammer' | 'Seal' | 'Temple' | 'Crown' | 'Trophy' | 'Scroll' | 'Scales' | 'MapPin' | 'Cards' | 'Swords' | 'Shield' | 'Horseshoe' | 'Sword' | 'Catapult' | 'Boot' | 'Flag' | 'Merge' | 'Wrench' | 'Tent' | 'Market' | 'Castle' | 'Anvil' | 'Bridge' | 'Search' | 'Feather' | 'Paw' | 'Mountain' | 'Leaf' | 'Compass' | 'Moose' | 'Send' | 'Chest' | 'Rewind' | 'SoundOn' | 'SoundOff' | 'Music';
export type GameIconComponent = (props: Omit<SVGProps<SVGSVGElement>, 'name'> & { contentDescription?: string }) => JSX.Element;

const paths: Record<GameIconName, string> = {
  ZoomIn: 'M11 5v12M5 11h12M21 21l-5-5', ZoomOut: 'M5 11h12M21 21l-5-5', FitMap: 'M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5',
  Back: 'M19 12H5m6-6-6 6 6 6', Close: 'm6 6 12 12M18 6 6 18', Menu: 'M4 7h16M4 12h16M4 17h16', Check: 'm5 12 5 5L20 7',
  Lock: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4', Trash: 'M4 7h16M9 7V4h6v3m-9 0 1 14h10l1-14M10 11v6m4-6v6',
  Save: 'M12 3v11m-5-5 5 5 5-5M4 14v6h16v-6', Load: 'M12 14V3m-5 5 5-5 5 5M4 14v6h16v-6', EndTurn: 'M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9m10-18c0 5-5 6-5 9s5 4 5 9',
  People: 'M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-6 9a6 6 0 0 1 12 0m2-13a3 3 0 0 1 0 6m1 2a5 5 0 0 1 3 5', Hammer: 'm3 21 8-8m-1-8 5-1 5 5-4 4-5-5m-2-2 4 4',
  Seal: 'M12 3a6 6 0 1 0 0 12 6 6 0 0 0 0-12Zm-3 11-2 8 5-3 5 3-2-8', Temple: 'm3 9 9-5 9 5M5 11v7m5-7v7m4-7v7m5-7v7M3 20h18', Crown: 'm3 7 5 5 4-8 4 8 5-5-2 12H5L3 7Zm2 15h14',
  Trophy: 'M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4m-4 1v5m-4 3h8m-7-3h6', Scroll: 'M7 4h12v16H7a3 3 0 0 1 0-6h12M7 4a3 3 0 0 0 0 6h12M10 7h5m-5 6h5', Scales: 'M12 3v18m-6 0h12M12 5 5 8m7-3 7 3M5 8l-3 6h6L5 8Zm14 0-3 6h6l-3-6Z',
  MapPin: 'M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Zm-5 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z', Cards: 'M7 4h13v16H7zM4 7v14h13M10 8h7m-7 4h7m-7 4h4', Swords: 'm4 4 16 16M20 4 4 20m-1-1 4 1 1 4m12-20-4 1-1 4m-9-5 4 1 1 4m7-5-4 1-1 4',
  Shield: 'M12 3 20 6v5c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-3Z', Horseshoe: 'M5 18V8a7 7 0 0 1 14 0v10m-14 0h4v-4H5m14 4h-4v-4h4M9 8v2m6-2v2', Sword: 'M5 19 19 5m-1-2 4 2-2 4M4 16l4 4m-6 2 5-5', Catapult: 'M4 20h16M6 20l2-8 8 8m-3-8 8-8m-4 1 3 3M5 4l14 8M4 4l2 4',
  Boot: 'M6 3v9l-2 5a2 2 0 0 0 2 3h13a2 2 0 0 0 2-2v-2l-7-2-3-5V3H6Z', Flag: 'M5 21V4m0 1c6-4 8 4 15 0v10c-7 4-9-4-15 0', Merge: 'M6 4v3c0 3 2 5 6 5h6m-4-4 4 4-4 4M6 20v-3c0-3 2-5 6-5', Wrench: 'M14 6a5 5 0 0 0-6 6l-5 5 4 4 5-5a5 5 0 0 0 6-6l-3 3-4-4 3-3Z',
  Tent: 'm3 20 9-16 9 16M7 20l5-9 5 9m-9-5h8', Market: 'M4 10v10h16V10M3 10l2-6h14l2 6a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0Zm8 10v-6h5v6', Castle: 'M3 21V8l4 3V6l5 4 5-4v5l4-3v13H3Zm5-7v3m8-3v3M9 21v-5h6v5', Anvil: 'M4 10h15l-2 5H9l-2 4H4l2-7-2-2Zm4-5h8l3 5H6l2-5Zm9 10 2 4',
  Bridge: 'M3 19h18M5 19V9m14 10V9M3 9c6-6 12-6 18 0M9 10v9m6-9v9M4 14h16', Search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm6-2 4 4', Feather: 'M20 4C12 3 5 9 5 17c0 2 1 3 3 3 8 0 14-7 12-16ZM4 21l9-9m-3-2 4 2', Paw: 'M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm8 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM4 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm16 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm-8-1c-3 0-6 5-4 7 1 1 3 0 4 0s3 1 4 0c2-2-1-7-4-7Z',
  Mountain: 'm3 20 7-12 4 6 3-4 4 10H3Zm7-12 2-4 2 4', Leaf: 'M20 4C10 4 4 8 4 15a5 5 0 0 0 5 5c7 0 11-6 11-16ZM4 21l9-9', Compass: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm4-14-2 6-6 2 2-6 6-2Z', Moose: 'M4 9 2 5l5 3m13 1 2-4-5 3M8 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm8 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm-6 4h4l2 3H8l2-3Zm2-4v4',
  Send: 'm22 2-7 20-4-9-9-4 20-7ZM22 2 11 13', Chest: 'M3 10h18v11H3zM2 7l3-4h14l3 4v3H2V7Zm10 3v4m-2-4h4', Rewind: 'm11 19-9-7 9-7v14Zm11 0-9-7 9-7v14Z', SoundOn: 'M4 10v4h4l5 4V6l-5 4H4Zm12-2a6 6 0 0 1 0 8m2-11a10 10 0 0 1 0 14', SoundOff: 'M4 10v4h4l5 4V6l-5 4H4Zm12-1 5 6m0-6-5 6', Music: 'M9 18V5l12-2v13m-12 2a3 3 0 1 1-3-3c2 0 3 1 3 3Zm12-2a3 3 0 1 1-3-3c2 0 3 1 3 3Z',
};

export function GameIcon({ name, contentDescription, ...props }: Omit<SVGProps<SVGSVGElement>, 'name'> & { name: GameIconName; contentDescription?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden={contentDescription ? undefined : true} aria-label={contentDescription} role={contentDescription ? 'img' : undefined} {...props}>{contentDescription && <title>{contentDescription}</title>}<path d={paths[name]} /></svg>;
}

const iconNames = Object.keys(paths) as GameIconName[];
const componentFor = (name: GameIconName): GameIconComponent => (props) => <GameIcon {...props} name={name} />;
export const GameIcons = Object.fromEntries(iconNames.map(name => [name, componentFor(name)])) as Record<GameIconName, GameIconComponent>;
export default GameIcons;

export const ADSENSE_CLIENT = 'ca-pub-1848284154496261';
export const AdUnits = {
  BANNER_MENU: '3145662729',
  BANNER_GAME: '7765514723',
  INTERSTITIAL: '2851107119',
  REWARDED: '2111287813',
  APP_OPEN: '8145911802',
} as const;
export type AdUnit = (typeof AdUnits)[keyof typeof AdUnits];

export type AdBreak = 'TURN_END' | 'GAME_OVER' | 'EXIT_TO_MENU';
export class AdPacing {
  static readonly FIRST_AD_TURN = 3;
  static readonly TURNS_BETWEEN_ADS = 3;
  static readonly MIN_GAP_MS = 150_000;
  static readonly SESSION_GRACE_MS = 60_000;
  static readonly APP_OPEN_FIRST_LAUNCH = 3;
  static readonly APP_OPEN_GAP_MS = 4 * 60 * 60 * 1000;
  private readonly sessionStart: number;
  private lastFullScreenAt: number | null = null;
  constructor(private readonly clock: () => number = Date.now, private readonly minGapMs = AdPacing.MIN_GAP_MS, private readonly sessionGraceMs = AdPacing.SESSION_GRACE_MS) { this.sessionStart = clock(); }
  interstitialDue(moment: AdBreak, turn: number): boolean {
    const now = this.clock();
    if (now - this.sessionStart < this.sessionGraceMs || (this.lastFullScreenAt !== null && now - this.lastFullScreenAt < this.minGapMs)) return false;
    if (moment === 'TURN_END') return turn >= AdPacing.FIRST_AD_TURN && turn % AdPacing.TURNS_BETWEEN_ADS === 0;
    if (moment === 'EXIT_TO_MENU') return turn >= AdPacing.FIRST_AD_TURN;
    return true;
  }
  onFullScreenShown(): void { this.lastFullScreenAt = this.clock(); }
  static appOpenDue(launches: number, lastShownAt: number, now: number): boolean { return launches >= this.APP_OPEN_FIRST_LAUNCH && now - lastShownAt >= this.APP_OPEN_GAP_MS; }
}

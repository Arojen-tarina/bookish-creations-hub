import { createStore, type Store } from '../lib/store';
import { readSecure, writeSecure } from '../lib/secureStorage';
import { AdPacing, type AdBreak } from './AdPacing';

export interface FullScreenAd { slot: string; rewarded: boolean; startedAt: number; resolve: (rewarded: boolean) => void }
const CONSENT_KEY = 'arojen_ads_consent';
const AD_SCRIPT = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1848284154496261';

/** Consent-gated AdSense lifecycle and paced full-screen ad promises. */
export class Ads {
  readonly consent = createStore(readSecure<'undecided' | 'accepted' | 'declined'>(CONSENT_KEY, (v): v is 'undecided' | 'accepted' | 'declined' => v === 'undecided' || v === 'accepted' || v === 'declined', 'undecided'));
  readonly ready: Store<boolean> = createStore(false);
  readonly consentFlowDone: Store<boolean> = createStore(false);
  readonly privacyOptionsRequired: Store<boolean> = createStore(false);
  readonly rewardReady: Store<boolean> = createStore(false);
  readonly fullScreenShowing: Store<boolean> = createStore(false);
  readonly fullScreen: Store<FullScreenAd | null> = createStore<FullScreenAd | null>(null);
  private readonly pacing: AdPacing;
  constructor(private readonly clock: () => number = Date.now) {
    this.pacing = new AdPacing(clock);
    this.consentFlowDone.set(this.consent.get() !== 'undecided');
    if (this.consent.get() === 'accepted') this.initialize();
  }
  acceptConsent(): void { this.consent.set('accepted'); writeSecure(CONSENT_KEY, 'accepted'); this.consentFlowDone.set(true); this.initialize(); }
  declineConsent(): void { this.consent.set('declined'); writeSecure(CONSENT_KEY, 'declined'); this.consentFlowDone.set(true); this.ready.set(false); this.rewardReady.set(false); }
  showPrivacyOptions(): void { this.consent.set('undecided'); this.consentFlowDone.set(false); writeSecure(CONSENT_KEY, 'undecided'); }
  private initialize(): void {
    if (typeof document === 'undefined') return;
    if (!document.querySelector(`script[src^="${AD_SCRIPT.split('?')[0]}"]`)) {
      const script = document.createElement('script'); script.async = true; script.crossOrigin = 'anonymous'; script.src = AD_SCRIPT;
      script.onload = () => { this.ready.set(true); this.rewardReady.set(true); };
      document.head.append(script);
    } else { this.ready.set(true); this.rewardReady.set(true); }
  }
  interstitialDue(moment: AdBreak, turn: number): boolean { return this.ready.get() && this.pacing.interstitialDue(moment, turn); }
  interstitialBreak(moment: AdBreak, turn: number): Promise<void> {
    if (!this.interstitialDue(moment, turn) || this.fullScreenShowing.get()) return Promise.resolve();
    this.pacing.onFullScreenShown();
    return this.showFullScreen({ slot: '2851107119', rewarded: false }).then(() => undefined);
  }
  showReward(): Promise<boolean> {
    if (!this.ready.get() || this.fullScreenShowing.get()) return Promise.resolve(false);
    this.pacing.onFullScreenShown();
    return this.showFullScreen({ slot: '2111287813', rewarded: true });
  }
  private showFullScreen(unit: Omit<FullScreenAd, 'startedAt' | 'resolve'>): Promise<boolean> {
    return new Promise(resolve => {
      this.fullScreenShowing.set(true);
      this.fullScreen.set({ ...unit, startedAt: this.clock(), resolve });
    });
  }
  closeFullScreen(earned = false): void {
    const ad = this.fullScreen.get();
    if (!ad) return;
    this.fullScreen.set(null); this.fullScreenShowing.set(false); ad.resolve(ad.rewarded && earned);
  }
  async awaitAppOpen(): Promise<void> { return; }
  finishColdStart(): void { /* AdSense does not expose a native app-open format. */ }
}

/**
 * index.ts — Analytiikkamoduulin julkinen rajapinta
 *
 * Tuo kaikkialta muualta koodikannasta AINA tämän tiedoston kautta:
 *   import { track, useExperiment, getRetentionSummary, estimateChurnRisk } from '@/lib/analytics';
 */
export { track, startSession, endSession, noteTurnCompleted, wireSessionLifecycle, getBufferedEvents, flush } from './core.ts';
export { getAnalyticsConsent, setAnalyticsConsent, getOrCreateClientId, forgetClientId } from './consent.ts';
export type { ConsentState } from './consent.ts';
export { getRetentionSummary, estimateChurnRisk } from './retention.ts';
export type { RetentionSummary, ChurnEstimate } from './retention.ts';
export { assignVariant, useExperiment } from './experiments.ts';
export type { AnalyticsEventName, AnalyticsEventPayloadMap, StoredAnalyticsEvent } from './types.ts';

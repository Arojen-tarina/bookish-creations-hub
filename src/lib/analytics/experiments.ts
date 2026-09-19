/**
 * experiments.ts — Kevyt A/B-testauskehys
 *
 * Deterministinen, pysyvä varianttijako per clientId+experimentKey (hash,
 * ei satunnaisuutta joka arvonnalla — sama pelaaja pysyy aina samassa
 * variantissa). Ei ulkoista feature-flag-palvelua; sopii yhden kehittäjän
 * mittakaavaan. Analyysi (mikä variantti voitti) tehdään jälkikäteen
 * `analytics_events`-taulusta suodattamalla `experiment_assigned` +
 * relevantit onnistumismittarit (esim. game_over.won, session_end.durationMs)
 * variantin mukaan ryhmiteltynä.
 */
import { useMemo } from 'react';
import { getAnalyticsConsent, getOrCreateClientId } from './consent.ts';
import { track } from './core.ts';

const ASSIGNMENTS_KEY = 'arojen_tarinat_experiments_v1';

const hash = (input: string): number => {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
  return Math.abs(h);
};

const readAssignments = (): Record<string, string> => {
  try {
    const raw = localStorage.getItem(ASSIGNMENTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeAssignments = (assignments: Record<string, string>) => {
  try { localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments)); } catch { /* ignore */ }
};

/**
 * Returns the sticky variant for `experimentKey` out of `variants`, assigning
 * one (and emitting `experiment_assigned` once) on first call. Consent-gated
 * like every other analytics event — with no consent, always returns the
 * first variant (control) so gameplay never depends on analytics opt-in.
 */
export const assignVariant = (experimentKey: string, variants: readonly string[]): string => {
  if (variants.length === 0) throw new Error('assignVariant requires at least one variant');
  if (getAnalyticsConsent() !== 'granted') return variants[0];

  const assignments = readAssignments();
  const existing = assignments[experimentKey];
  if (existing && variants.includes(existing)) return existing;

  const clientId = getOrCreateClientId();
  const variant = variants[hash(`${clientId}:${experimentKey}`) % variants.length];
  assignments[experimentKey] = variant;
  writeAssignments(assignments);
  track('experiment_assigned', { experimentKey, variant });
  return variant;
};

/** React convenience wrapper around `assignVariant` — stable for the component's lifetime. */
export const useExperiment = (experimentKey: string, variants: readonly string[]): string =>
  useMemo(() => assignVariant(experimentKey, variants), [experimentKey, variants.join('|')]);

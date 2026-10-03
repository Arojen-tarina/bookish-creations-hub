import type { Language } from '@/lib/i18n.tsx';

// n = nimi, d = kuvaus, e = efekti, c = hinta, s = lyhyt efekti kortin alaosaan (ilman nimeä)
export interface CardLocaleText {
  n: string;
  d: string;
  e: string;
  c?: string;
  s: string;
}
export type CardLocale = Record<string, CardLocaleText>;

// Ladataan vasta kun kieli tarvitaan. fi ja en tulevat gameCards.ts:stä / gameCardsTranslations.ts:stä.
export const cardLocaleLoaders: Partial<Record<Language, () => Promise<{ default: CardLocale }>>> = {
  zh: () => import('./zh.ts'),
  hi: () => import('./hi.ts'),
  es: () => import('./es.ts'),
  ar: () => import('./ar.ts'),
  fr: () => import('./fr.ts'),
  bn: () => import('./bn.ts'),
  pt: () => import('./pt.ts'),
  ru: () => import('./ru.ts'),
  ur: () => import('./ur.ts'),
  id: () => import('./id.ts'),
  de: () => import('./de.ts'),
  ja: () => import('./ja.ts'),
};

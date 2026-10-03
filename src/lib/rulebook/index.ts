import type { Language } from '../i18n.tsx';

export type RulebookDict = Record<string, string>;

// Käännökset ladataan vasta kun kieli tarvitaan, ettei pääpaketti kasva.
// fi ja en tulevat suoraan Ohjekirja.tsx:stä.
const loaders: Partial<Record<Language, () => Promise<{ default: RulebookDict }>>> = {
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

export const loadRulebookTranslations = async (lang: Language): Promise<RulebookDict | null> => {
  const loader = loaders[lang];
  return loader ? (await loader()).default : null;
};

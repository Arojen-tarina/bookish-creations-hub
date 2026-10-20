// Exports every card's display text for all 14 languages as JSON assets:
//   <outDir>/<lang>.json = { "<cardId>": { n: name, d: description, e: effect, c?: cost, s: short effect } }
// Sources: gameCards.ts + cards.ts (fi), gameCardsTranslations.ts (en), cardLocales/<lang>.ts (others).
// Missing entries fall back to English, exactly like the original localizeCard().
import { strategyCards, diplomacyCards, technologyCards, resourceCards } from '@/data/gameCards';
import { createPlayableDeck } from '@/game/cards';
import { CARD_TEXT_EN, CARD_EFFECT_DESC_EN } from '@/data/gameCardsTranslations';
import { cardLocaleLoaders } from '@/data/cardLocales/index.ts';
import { mkdirSync, writeFileSync } from 'node:fs';

type Text = { n: string; d: string; e: string; c?: string; s: string };

// The app never shows emoji (vector icons only), so strip any that crept into texts.
const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2300}-\u{23FF}\u{2190}-\u{21FF}\u{25A0}-\u{25FF}\u{FE0F}\u{200D}]/gu;
const clean = (s: string) => s.replace(EMOJI, '').replace(/\s{2,}/g, ' ').trim();
const stripTitle = (s: string) => {
  const i = s.indexOf(': ');
  return i >= 0 ? s.slice(i + 2) : s;
};
const tidy = (t: Text): Text => {
  const out: Text = { n: clean(t.n), d: clean(t.d), e: clean(t.e), s: clean(t.s) };
  if (t.c) out.c = clean(t.c);
  return out;
};

const outDir = process.argv[2];
mkdirSync(outDir, { recursive: true });

const cards = [...strategyCards, ...diplomacyCards, ...technologyCards, ...resourceCards];
const parsed = new Map(createPlayableDeck().map((c) => [c.id, c.parsedEffect.description]));

const fi: Record<string, Text> = {};
const en: Record<string, Text> = {};
for (const c of cards) {
  fi[c.id] = tidy({ n: c.name, d: c.description, e: c.effect, c: c.cost, s: stripTitle(parsed.get(c.id)!) });
  const t = CARD_TEXT_EN[c.id];
  en[c.id] = tidy({
    n: t?.name ?? c.name,
    d: t?.description ?? c.description,
    e: t?.effect ?? c.effect,
    c: t?.cost ?? c.cost,
    s: stripTitle(CARD_EFFECT_DESC_EN[c.id] ?? parsed.get(c.id)!),
  });
}
writeFileSync(`${outDir}/fi.json`, JSON.stringify(fi, null, 1));
writeFileSync(`${outDir}/en.json`, JSON.stringify(en, null, 1));

for (const [lang, load] of Object.entries(cardLocaleLoaders)) {
  const locale = (await load!()).default;
  const out: Record<string, Text> = {};
  let missing = 0;
  for (const c of cards) {
    const loc = locale[c.id];
    if (!loc) missing++;
    out[c.id] = loc ? tidy({ n: loc.n, d: loc.d, e: loc.e, c: loc.c ?? en[c.id].c, s: loc.s }) : en[c.id];
  }
  writeFileSync(`${outDir}/${lang}.json`, JSON.stringify(out, null, 1));
  console.log(`${lang}: ${cards.length - missing}/${cards.length} translated`);
}
console.log(`fi/en: ${cards.length} cards`);

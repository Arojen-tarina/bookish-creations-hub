// Converts the original Moose guide's local answer tables (mooseFaq.ts and
// mooseKnowledge.ts, Finnish and English only) into <outDir>/<lang>.json for the
// native guide. Answers are already filled in with the game's own numbers.
// Emoji are stripped; the arrow chain of the turn-phase answer becomes a list.
// The "device-mode" entry describes the web build's layout switch and is left out.
import { MOOSE_FAQ, __stopWords, __genericHelp } from './patched/mooseFaq.ts';
import { __knowledge } from './patched/mooseKnowledge.ts';
import { mkdirSync, writeFileSync } from 'node:fs';

const [outDir] = process.argv.slice(2);
const WEB_ONLY = new Set(['device-mode']);

const STRIP = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2300}-\u{23FF}\u{25A0}-\u{25FF}\u{FE0F}\u{200D}]/gu;
const clean = (s: string) =>
  s.replace(/\s*→\s*/g, ', ').replace(STRIP, '').replace(/\s*\(\s*\)/g, '').replace(/\s{2,}/g, ' ').trim();

mkdirSync(outDir, { recursive: true });
for (const lang of ['en', 'fi'] as const) {
  const out = {
    generic: clean(__genericHelp[lang]),
    stopWords: [...__stopWords[lang]],
    faq: MOOSE_FAQ.filter((e) => !WEB_ONLY.has(e.id)).map((e) => ({
      id: e.id,
      keywords: e.keywords[lang],
      answer: clean(e.answer[lang]),
    })),
    // The original entries have no ids; the first English keyword names them for the app's topic chips.
    knowledge: __knowledge.map((e: any) => ({ id: e.keywords.en[0], keywords: e.keywords[lang], answer: clean(e.answer[lang]) })),
  };
  writeFileSync(`${outDir}/${lang}.json`, JSON.stringify(out, null, 1));
}
console.log(`moose: ${MOOSE_FAQ.length - WEB_ONLY.size} faq entries, ${__knowledge.length} knowledge entries`);

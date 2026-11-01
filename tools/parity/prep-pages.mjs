// Copies original sources the content dumps need into the work folder, with
// small, checked patches so they run headless:
//  - Codex.tsx / Ohjekirja.tsx (dump-books.ts): UI library imports point at
//    stubs/page-shims.js, every tr() lookup is reported to globalThis so the dump
//    learns the keys, and module-level chapter tables are exported;
//  - mooseFaq.ts / mooseKnowledge.ts (dump-moose.ts): private tables are exported.
//
//   node prep-pages.mjs <original src> <work/patched>
import { readFileSync, writeFileSync } from 'node:fs';

const [srcDir, outDir] = process.argv.slice(2);
const SHIMMED = ['react-router-dom', 'lucide-react', '@/components/ui/button.tsx', '@/lib/i18n.tsx', '@/lib/codex/index.ts', '@/lib/rulebook/index.ts'];

function patch(path, replacements, append) {
  const file = path.split('/').pop();
  let s = readFileSync(`${srcDir}/${path}`, 'utf8');
  for (const spec of SHIMMED) s = s.replaceAll(`from '${spec}'`, `from '../stubs/page-shims.js'`);
  for (const [before, after] of replacements) {
    if (!s.includes(before)) throw new Error(`${file}: expected source line not found (the original changed?):\n  ${before}`);
    s = s.replace(before, after);
  }
  writeFileSync(`${outDir}/${file}`, s + append);
}

patch('pages/Codex.tsx', [[
  'const tr = (key: string, en: string) => (dict.lang === lang ? dict.entries?.[key] : undefined) ?? en;',
  'const tr = (key: string, en: string) => { (globalThis as any).__codexTr(key, en); return en; };',
]], '\nexport { chapters as __chapters, englishLoreChapters as __englishLore };\n');

patch('pages/Ohjekirja.tsx', [
  ['const useTr = () => useContext(TranslateContext);', 'const useTr = (): Translate => (globalThis as any).__rulebookTr;'],
  ['const tr: Translate = (key, fi, en) => {', 'const tr: Translate = (key, fi, en) => {\n    (globalThis as any).__rulebookTr(key, fi, en);'],
], '');

patch('game/mooseFaq.ts', [], '\nexport { STOP_WORDS as __stopWords, genericHelp as __genericHelp };\n');
patch('game/mooseKnowledge.ts', [], '\nexport { LOCAL_KNOWLEDGE as __knowledge };\n');

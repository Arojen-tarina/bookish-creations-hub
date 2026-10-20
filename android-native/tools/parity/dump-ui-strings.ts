// Converts the original game's UI translations (14 languages) into Android
// string resources: <resDir>/values[-xx]/strings_ui.xml.
// Lookup chain matches the original t(): own dictionary -> gameUi table -> en -> fi.
// Keys become snake_case ("hud.armySelected" -> hud_army_selected); {{vars}}
// become positional args ordered as in the English text; emoji and arrow
// glyphs are stripped (the app uses vector icons only).
import { translations } from '@/lib/i18n.tsx';
import { localeTranslations } from '@/lib/i18nLocales.ts';
import { gameUiTranslations } from '@/lib/i18nGameUi.ts';
import { mkdirSync, writeFileSync } from 'node:fs';

const [resDir, skipList = ''] = process.argv.slice(2);
// Names already defined by hand in values/strings.xml are skipped to avoid duplicates.
const skip = new Set(skipList.split(',').filter(Boolean));

const LANGS = ['en', 'fi', 'zh', 'hi', 'es', 'ar', 'fr', 'bn', 'pt', 'ru', 'ur', 'id', 'de', 'ja'] as const;
type Lang = (typeof LANGS)[number];
const FOLDER: Record<Lang, string> = {
  en: 'values', fi: 'values-fi', zh: 'values-zh', hi: 'values-hi', es: 'values-es', ar: 'values-ar', fr: 'values-fr',
  bn: 'values-bn', pt: 'values-pt', ru: 'values-ru', ur: 'values-ur', id: 'values-in', de: 'values-de', ja: 'values-ja',
};
// Prefixes with no meaning in the native app (desktop/mobile layout switch).
const EXCLUDED_PREFIXES = ['device.'];

const lookup = (lang: Lang, key: string): string | undefined => {
  const dict = lang === 'fi' || lang === 'en' ? translations[lang] : (localeTranslations as any)[lang];
  return dict?.[key] ?? (gameUiTranslations as any)[key]?.[lang] ?? translations.en?.[key] ?? translations.fi?.[key];
};

const STRIP = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2300}-\u{23FF}\u{2190}-\u{21FF}\u{25A0}-\u{25FF}\u{FE0F}\u{200D}]/gu;
const snake = (key: string) => key.replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/[.\-]/g, '_').toLowerCase();

const xmlEscape = (s: string) => {
  let out = s.replace(/\\/g, '\\\\').replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n');
  if (out.startsWith('@') || out.startsWith('?')) out = '\\' + out;
  return out;
};

const keys = new Set<string>([
  ...Object.keys(translations.en ?? {}),
  ...Object.keys(translations.fi ?? {}),
  ...Object.keys(gameUiTranslations),
]);
const usable = [...keys].filter((k) => !EXCLUDED_PREFIXES.some((p) => k.startsWith(p))).sort();

// Placeholder order per key comes from the English text.
const varOrder = new Map<string, string[]>();
for (const k of usable) {
  const en = lookup('en', k) ?? '';
  varOrder.set(k, [...new Set([...en.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]))]);
}

const skipped: string[] = [];
for (const lang of LANGS) {
  const lines: string[] = [];
  for (const k of usable) {
    const name = snake(k);
    if (skip.has(name)) { if (lang === 'en') skipped.push(name); continue; }
    const raw = lookup(lang, k);
    if (raw === undefined) continue;
    // "(📖)" style icon hints leave empty brackets behind once the emoji is gone.
    let text = raw.replace(STRIP, '').replace(/\s*\(\s*\)/g, '').replace(/\s{2,}/g, ' ').trim();
    if (!text) continue;
    const vars = varOrder.get(k)!;
    const formatted = vars.length > 0;
    if (formatted) {
      text = text.replace(/%/g, '%%');
      text = text.replace(/\{\{(\w+)\}\}/g, (_, v) => {
        const i = vars.indexOf(v);
        return i >= 0 ? `%${i + 1}$s` : `{{${v}}}`;
      });
    }
    const attrs = !formatted && text.includes('%') ? ' formatted="false"' : '';
    lines.push(`    <string name="${name}"${attrs}>${xmlEscape(text)}</string>`);
  }
  mkdirSync(`${resDir}/${FOLDER[lang]}`, { recursive: true });
  writeFileSync(
    `${resDir}/${FOLDER[lang]}/strings_ui.xml`,
    `<?xml version="1.0" encoding="utf-8"?>\n<!-- GENERATED from bookish-creations-hub src/lib/i18n*.ts by tools/parity. Do not edit by hand. -->\n<resources>\n${lines.join('\n')}\n</resources>\n`,
  );
  console.log(`${lang}: ${lines.length} strings`);
}
if (skipped.length) console.log(`skipped (defined by hand): ${skipped.join(', ')}`);

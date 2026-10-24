// Converts the original game's two books into structured JSON for the native
// Codex and Rulebook screens:
//   <outDir>/codex/<lang>.json     world chronicle (fi: the full chronicle, other
//                                  languages: the English summary + its translations)
//   <outDir>/rulebook/<lang>.json  the rulebook, article by article, with its tables
// Pages are patched by prep-books.mjs and rendered through the JSX stub, which
// returns plain { type, props } trees. Emoji are stripped; the few the cards
// used as pictures become icon keys the app maps to its own vector icons.
// **bold** markers are kept for the app to style.
import Codex, { __chapters, __englishLore } from './patched/Codex.tsx';
import Ohjekirja from './patched/Ohjekirja.tsx';
import codexZh from '@/lib/codex/zh.ts';
import codexHi from '@/lib/codex/hi.ts';
import codexEs from '@/lib/codex/es.ts';
import codexAr from '@/lib/codex/ar.ts';
import codexFr from '@/lib/codex/fr.ts';
import codexBn from '@/lib/codex/bn.ts';
import codexPt from '@/lib/codex/pt.ts';
import codexRu from '@/lib/codex/ru.ts';
import codexUr from '@/lib/codex/ur.ts';
import codexId from '@/lib/codex/id.ts';
import codexDe from '@/lib/codex/de.ts';
import codexJa from '@/lib/codex/ja.ts';
import rulebookZh from '@/lib/rulebook/zh.ts';
import rulebookHi from '@/lib/rulebook/hi.ts';
import rulebookEs from '@/lib/rulebook/es.ts';
import rulebookAr from '@/lib/rulebook/ar.ts';
import rulebookFr from '@/lib/rulebook/fr.ts';
import rulebookBn from '@/lib/rulebook/bn.ts';
import rulebookPt from '@/lib/rulebook/pt.ts';
import rulebookRu from '@/lib/rulebook/ru.ts';
import rulebookUr from '@/lib/rulebook/ur.ts';
import rulebookId from '@/lib/rulebook/id.ts';
import rulebookDe from '@/lib/rulebook/de.ts';
import rulebookJa from '@/lib/rulebook/ja.ts';
import { mkdirSync, writeFileSync } from 'node:fs';

type Dict = Record<string, string>;
const CODEX_DICTS: Record<string, Dict> = {
  zh: codexZh, hi: codexHi, es: codexEs, ar: codexAr, fr: codexFr, bn: codexBn,
  pt: codexPt, ru: codexRu, ur: codexUr, id: codexId, de: codexDe, ja: codexJa,
};
const RULEBOOK_DICTS: Record<string, Dict> = {
  zh: rulebookZh, hi: rulebookHi, es: rulebookEs, ar: rulebookAr, fr: rulebookFr, bn: rulebookBn,
  pt: rulebookPt, ru: rulebookRu, ur: rulebookUr, id: rulebookId, de: rulebookDe, ja: rulebookJa,
};

const [outDir] = process.argv.slice(2);
const g = globalThis as any;

// ---------- JSX tree helpers ----------

type El = { type: any; props: any };
const isEl = (n: any): n is El => !!n && typeof n === 'object' && 'type' in n && 'props' in n;
const flat = (a: any[]): any[] =>
  a.flatMap((x) => (Array.isArray(x) ? flat(x) : [x])).filter((x) => x !== null && x !== undefined && typeof x !== 'boolean' && x !== '');
const kids = (n: El): any[] => (n.props?.children === undefined ? [] : flat([n.props.children]));
const cls = (n: El) => String(n.props?.className ?? '');

function all(n: any, test: (e: El) => boolean, out: El[] = []): El[] {
  if (!isEl(n)) return out;
  if (test(n)) out.push(n);
  kids(n).forEach((k) => all(k, test, out));
  return out;
}
const first = (n: any, test: (e: El) => boolean) => all(n, test)[0];

const STRIP = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2300}-\u{23FF}\u{2190}-\u{21FF}\u{25A0}-\u{25FF}\u{FE0F}\u{200D}]/gu;
const clean = (s: unknown) => String(s).replace(STRIP, '').replace(/\s{2,}/g, ' ').trim();

/** Visible text of a subtree; <strong>/<b> become **bold**. */
function text(n: any): string {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(text).join('');
  if (!isEl(n)) return '';
  const inner = kids(n).map(text).join('');
  return n.type === 'strong' || n.type === 'b' ? `**${inner}**` : inner;
}

// Pictures the cards used, mapped to the app's vector icon keys (see BookIcons.kt).
const EMOJI_ICON: Record<string, string> = {
  '🦌': 'paw', '🦅': 'paw', '🐻': 'paw', '🦉': 'paw', '🦊': 'paw', '🐀': 'paw',
  '⚔️': 'swords', '🪓': 'swords', '🗡️': 'sword', '🧭': 'compass', '🕯️': 'temple', '🐦': 'feather',
  '🏇': 'horseshoe', '🐎': 'horseshoe', '🐉': 'crown', '👑': 'crown', '💜': 'crown', '🌾': 'people', '👥': 'people',
  '🛡️': 'shield', '🏗️': 'hammer', '💥': 'swords', '🏯': 'castle', '🌉': 'bridge', '⛰️': 'mountain', '🌿': 'leaf',
};

/** Icon key of the first emoji-only text inside a card, if any. */
function iconOf(n: any): string | undefined {
  const leaves: string[] = [];
  const visit = (x: any) => {
    if (typeof x === 'string') leaves.push(x);
    else if (isEl(x)) kids(x).forEach(visit);
  };
  visit(n);
  const emoji = leaves.map((s) => s.trim()).find((s) => s && !clean(s));
  if (emoji === undefined) return undefined;
  const key = EMOJI_ICON[emoji];
  if (!key) throw new Error(`no icon mapped for card picture ${emoji}`);
  return key;
}

// ---------- book model (mirrors app/.../ui/book/BookModel.kt) ----------

type Card = { title: string; text: string; subtitle?: string; kicker?: string; icon?: string };
type Block =
  | { type: 'para'; text: string; n?: string }
  | { type: 'quote'; text: string }
  | { type: 'cards'; style: 'grid' | 'tiles' | 'list' | 'timeline'; items: Card[] }
  | { type: 'table'; head: string[]; rows: string[][] };
type Chapter = { id: string; numeral: string; title: string; subtitle?: string; heading?: string; blocks: Block[] };
type Book = {
  title: string; subtitle: string; eyebrow?: string; tagline?: string; quote?: string;
  chapterLabel?: string; searchHint?: string; chapters: Chapter[];
};

function card(n: El): Card {
  // <Rule title text /> keeps its text in props.
  if (typeof n.type === 'function') return { title: clean(n.props.title), text: clean(n.props.text) };
  const c: Card = { title: '', text: '' };
  const visit = (x: any) => {
    if (!isEl(x)) return;
    if (x.type === 'h3') { c.title = clean(text(x)); return; }
    if (x.type === 'p') {
      const t = clean(text(x));
      if (!t) return;
      if (cls(x).includes('uppercase')) {
        if (c.title) c.subtitle = t; else c.kicker = t;
      } else c.text = c.text ? `${c.text}\n\n${t}` : t;
      return;
    }
    kids(x).forEach(visit);
  };
  visit(n);
  const icon = iconOf(n);
  if (icon) c.icon = icon;
  if (!c.title || !c.text) throw new Error(`card without title or text: ${JSON.stringify(c)}`);
  return c;
}

// ---------- codex ----------

const chapterMeta = (id: string) => {
  const m = __chapters.find((c: any) => c.id === id);
  if (!m) throw new Error(`unknown codex chapter ${id}`);
  return m;
};

/** The full Finnish chronicle, walked from the page's own JSX. */
function finnishCodex(): Book {
  g.__lang = 'fi';
  const root = (Codex as any)();
  const header = first(root, (e) => e.type === 'header');
  const ps = all(header, (e) => e.type === 'p').map((p) => clean(text(p)));
  const book: Book = {
    eyebrow: ps[0],
    title: clean(text(first(header, (e) => e.type === 'h1'))),
    subtitle: ps[1],
    tagline: ps[2],
    chapters: [],
  };
  let cur: Chapter | undefined;
  const start = (id: string, numeral: string, heading: string) => {
    const meta = chapterMeta(id);
    cur = { id, numeral, title: meta.title, subtitle: meta.subtitle, heading: clean(heading), blocks: [] };
    book.chapters.push(cur);
  };
  const push = (b: Block) => {
    if (!cur) throw new Error('codex content before the first chapter');
    cur.blocks.push(b);
  };
  const block = (n: any) => {
    if (!isEl(n)) return;
    const { type, props } = n;
    if (typeof type === 'function' && props.paras) {
      start(props.id, props.numeral, props.title);
      props.paras.forEach((p: string) => push({ type: 'para', text: clean(p) }));
    } else if (typeof type === 'function' && props.numeral) {
      start(props.id, props.numeral, props.title);
    } else if (type === 'p') {
      push({ type: 'para', text: clean(text(n)) });
    } else if (type === 'blockquote') {
      push({ type: 'quote', text: clean(text(n)) });
    } else if (type === 'ol') {
      push({ type: 'cards', style: 'timeline', items: kids(n).map(card) });
    } else if (type === 'div') {
      const c = cls(n);
      if (c.includes('border-t')) book.quote = clean(text(first(n, (e) => e.type === 'p')));
      else if (c.includes('space-y-5')) push({ type: 'cards', style: 'list', items: kids(n).map(card) });
      else if (c.includes('grid')) push({ type: 'cards', style: c.includes('grid-cols-3') ? 'tiles' : 'grid', items: kids(n).map(card) });
      else kids(n).forEach(block);
    } else {
      throw new Error(`unexpected codex element <${String(type)}>`);
    }
  };
  kids(first(root, (e) => e.type === 'main')).forEach(block);
  if (book.chapters.length !== __chapters.length) throw new Error(`walked ${book.chapters.length} of ${__chapters.length} codex chapters`);
  return book;
}

/** The English summary every other language translates by key. */
function summaryCodex(langs: string[]): Record<string, Book> {
  g.__lang = 'en';
  const english = new Map<string, string>();
  g.__codexTr = (key: string, en: string) => english.set(key, en);
  const page = (Codex as any)(); // <EnglishCodex />
  const rendered = page.type(page.props);
  const icons = all(rendered, (e) => e.type === 'article').map(iconOf);
  const count = (re: RegExp) => [...english.keys()].filter((k) => re.test(k)).length;
  const pantheon = count(/^pan\.\d+\.n$/), rules = count(/^rule\.\d+\.t$/), people = count(/^char\.\d+\.n$/);
  if (icons.length !== pantheon + rules + people) throw new Error('english codex layout changed');
  if (__englishLore.length !== 18) throw new Error('expected 18 english lore chapters');

  const out: Record<string, Book> = {};
  for (const lang of langs) {
    const dict = CODEX_DICTS[lang] ?? {};
    const tr = (key: string) => {
      const en = english.get(key);
      if (en === undefined) throw new Error(`codex key ${key} not used by the page`);
      return clean(dict[key] ?? en);
    };
    const range = (n: number) => [...Array(n).keys()];
    const chapters: Chapter[] = __englishLore.map(([numeral]: string[], i: number) => ({
      id: __chapters[i].id,
      numeral,
      title: tr(`lore.${numeral}.t`),
      subtitle: tr(`lore.${numeral}.s`),
      blocks: [{ type: 'para', text: tr(`lore.${numeral}.x`) } as Block],
    }));
    const byId = (id: string) => chapters.find((c) => c.id === id)!;
    byId('pantheon').blocks.push({
      type: 'cards', style: 'grid',
      items: range(pantheon).map((i) => ({ title: tr(`pan.${i}.n`), text: tr(`pan.${i}.x`), icon: icons[i] })),
    });
    byId('saannot').blocks.push({
      type: 'cards', style: 'grid',
      items: range(rules).map((i) => ({ title: tr(`rule.${i}.t`), text: tr(`rule.${i}.x`) })),
    });
    chapters.push({
      id: 'henkilot', numeral: '', title: tr('ui.people'),
      blocks: [{
        type: 'cards', style: 'grid',
        items: range(people).map((i) => ({
          title: tr(`char.${i}.n`), subtitle: tr(`char.${i}.r`), text: tr(`char.${i}.x`), icon: icons[pantheon + rules + i],
        })),
      }],
    });
    out[lang] = {
      eyebrow: tr('ui.eyebrow'), title: tr('ui.title'), subtitle: tr('ui.subtitle'),
      tagline: tr('ui.tagline'), quote: tr('ui.quote'), chapters,
    };
  }
  return out;
}

// ---------- rulebook ----------

function rulebooks(langs: string[]): Record<string, Book> {
  const seen = new Map<string, { fi: string; en: string }>();
  g.__rulebookTr = (key: string, fi: unknown, en: unknown) => {
    seen.set(key, { fi: String(fi), en: String(en) });
    return en;
  };
  g.__lang = 'en';
  const root = (Ohjekirja as any)();
  const chapters = all(root, (e) => typeof e.type === 'function' && e.props.num !== undefined && e.props.title !== undefined);
  chapters[0].type(chapters[0].props); // records ui.chapter

  const out: Record<string, Book> = {};
  for (const lang of langs) {
    const dict = RULEBOOK_DICTS[lang] ?? {};
    const tr = (key: string, fi: unknown, en: unknown) =>
      clean(lang === 'fi' ? fi : lang === 'en' ? en : dict[key] ?? en);
    const ui = (key: string) => {
      const v = seen.get(key);
      if (!v) throw new Error(`rulebook key ${key} not used by the page`);
      return tr(key, v.fi, v.en);
    };
    out[lang] = {
      title: ui('ui.title'),
      subtitle: ui('ui.subtitle'),
      chapterLabel: ui('ui.chapter'),
      searchHint: ui('ui.search'),
      chapters: chapters.map((ch) => ({
        id: ch.props.id,
        numeral: ch.props.num,
        title: tr(`ch.${ch.props.id}`, ch.props.title.fi, ch.props.title.en),
        blocks: kids(ch).map((b): Block => {
          const p = b.props;
          if (p.n !== undefined) return { type: 'para', n: p.n, text: tr(`p.${p.n}`, p.fi, p.en) };
          if (p.head !== undefined) {
            return {
              type: 'table',
              head: p.head.map((h: any, i: number) => tr(`t${p.id}.h.${i}`, h.fi, h.en)),
              rows: p.rows.map((r: any, i: number) => r.en.map((c: unknown, j: number) => tr(`t${p.id}.r.${i}.${j}`, r.fi[j], c))),
            };
          }
          throw new Error(`unexpected rulebook block in chapter ${ch.props.id}`);
        }),
      })),
    };
  }
  return out;
}

// ---------- write ----------

// An Urdu or Arabic paragraph that opens with a Latin name ("Tales of the Steppe ...")
// would otherwise be laid out left to right; a leading RLM keeps it right to left.
const RTL_LANGS = new Set(['ar', 'ur']);
const NOT_TEXT = new Set(['id', 'numeral', 'n', 'type', 'style', 'icon']);
function markRtl(value: any): any {
  if (typeof value === 'string') return value && !value.startsWith('\u200F') ? `\u200F${value}` : value;
  if (Array.isArray(value)) return value.map(markRtl);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, NOT_TEXT.has(k) ? v : markRtl(v)]));
  }
  return value;
}

const LANGS = ['en', 'fi', 'zh', 'hi', 'es', 'ar', 'fr', 'bn', 'pt', 'ru', 'ur', 'id', 'de', 'ja'];
const codex = { ...summaryCodex(LANGS.filter((l) => l !== 'fi')), fi: finnishCodex() };
const rulebook = rulebooks(LANGS);
for (const [name, books] of [['codex', codex], ['rulebook', rulebook]] as const) {
  mkdirSync(`${outDir}/${name}`, { recursive: true });
  for (const lang of LANGS) {
    const book = RTL_LANGS.has(lang) ? markRtl(books[lang]) : books[lang];
    writeFileSync(`${outDir}/${name}/${lang}.json`, JSON.stringify(book));
  }
}
console.log(`books: codex fi ${codex.fi.chapters.length} chapters, en ${codex.en.chapters.length}; rulebook ${rulebook.en.chapters.length} chapters`);

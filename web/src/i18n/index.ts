// Android string-resource equivalent. t("key", a, b) mirrors stringResource(R.string.key, a, b);
// plural("key", n, ...) mirrors pluralStringResource. Supports %1$s, %2$d, %s, %d and %%.
import { useSyncExternalStore } from 'react';

export const LOCALES = ['en', 'fi', 'zh', 'hi', 'es', 'ar', 'fr', 'bn', 'pt', 'ru', 'ur', 'id', 'de', 'ja'] as const;
export type Locale = (typeof LOCALES)[number];
export const RTL_LOCALES: Locale[] = ['ar', 'ur'];

type Entry = string | Record<string, string>;
type Table = Record<string, Entry>;

const modules = import.meta.glob<Table>('./generated/*.json', { eager: true, import: 'default' });
const tables: Record<string, Table> = {};
for (const [path, table] of Object.entries(modules)) {
  const m = /\/([a-z]+)\.json$/.exec(path);
  if (m) tables[m[1]] = table;
}

let current: Locale = 'en';
const listeners = new Set<() => void>();

export function detectLocale(): Locale {
  const langs = typeof navigator !== 'undefined' ? navigator.languages ?? [navigator.language] : [];
  for (const l of langs) {
    const base = l.toLowerCase().split('-')[0];
    const norm = base === 'in' ? 'id' : base;
    if ((LOCALES as readonly string[]).includes(norm)) return norm as Locale;
  }
  return 'en';
}

export function getLocale(): Locale {
  return current;
}

export function setLocale(locale: Locale) {
  current = locale;
  if (typeof document !== 'undefined') {
    document.documentElement.lang = locale;
    document.documentElement.dir = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';
  }
  listeners.forEach((l) => l());
}

export function useLocale(): Locale {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => current,
  );
}

export function format(template: string, args: unknown[]): string {
  let auto = 0;
  return template.replace(/%(?:(\d+)\$)?([sd%])/g, (_, idx, kind) => {
    if (kind === '%') return '%';
    const i = idx ? parseInt(idx, 10) - 1 : auto++;
    const v = args[i];
    return v === undefined ? '' : String(v);
  });
}

function lookup(key: string): Entry | undefined {
  return tables[current]?.[key] ?? tables.en?.[key];
}

export function t(key: string, ...args: unknown[]): string {
  const e = lookup(key);
  if (e === undefined) return key;
  return format(typeof e === 'string' ? e : e.other ?? '', args);
}

export function hasString(key: string): boolean {
  return lookup(key) !== undefined;
}

export function plural(key: string, count: number, ...args: unknown[]): string {
  const e = lookup(key);
  if (e === undefined) return key;
  if (typeof e === 'string') return format(e, [count, ...args]);
  const cat = new Intl.PluralRules(current).select(count);
  const form = e[cat] ?? e.other ?? Object.values(e)[0] ?? '';
  return format(form, [count, ...args]);
}

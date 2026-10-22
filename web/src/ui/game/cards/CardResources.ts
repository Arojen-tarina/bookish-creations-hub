import { useEffect, useState } from 'react';
import { useLocale } from '../../../i18n';
import type { CardText } from '../panels/RealmPanels';
import { asset } from '../../../assets';

const cache = new Map<string, Record<string, CardText>>();
export function useCardTexts(): Record<string, CardText> {
  const locale = useLocale();
  const [texts, setTexts] = useState<Record<string, CardText>>(() => cache.get(locale) ?? {});
  useEffect(() => {
    let active = true;
    if (cache.has(locale)) { setTexts(cache.get(locale)!); return () => { active = false; }; }
    setTexts({});
    fetch(asset(`i18n/cards/${locale}.json`)).then((r) => r.ok ? r.json() : {}).then((value: unknown) => {
      const valid = value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, CardText> : {};
      cache.set(locale, valid); if (active) setTexts(valid);
    }).catch(() => { if (active) setTexts({}); });
    return () => { active = false; };
  }, [locale]);
  return texts;
}

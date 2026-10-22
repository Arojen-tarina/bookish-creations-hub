const ASSET_LANGUAGES = new Set(['fi', 'en', 'zh', 'hi', 'es', 'ar', 'fr', 'bn', 'pt', 'ru', 'ur', 'id', 'de', 'ja']);
export function assetLanguage(language: string): string {
  const lang = language === 'in' ? 'id' : language;
  return ASSET_LANGUAGES.has(lang) ? lang : 'en';
}

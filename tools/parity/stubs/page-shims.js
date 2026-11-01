// Stand-ins for what the original Codex/Ohjekirja pages import. The dump only
// walks the JSX tree those pages return, so components can be plain names.
export const Link = 'Link';
export const Button = 'Button';
export const ArrowLeft = 'ArrowLeft';
export const BookOpen = 'BookOpen';
export const Feather = 'Feather';
export const ScrollText = 'ScrollText';
export const Printer = 'Printer';

export const useLanguage = () => ({ lang: globalThis.__lang });
export const getContentLanguage = (lang) => (lang === 'fi' ? 'fi' : 'en');
export const loadCodexTranslations = async () => null;
export const loadRulebookTranslations = async () => null;

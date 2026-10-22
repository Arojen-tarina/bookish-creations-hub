export interface MooseEntry { id: string; keywords: string[]; answer: string }
export interface MooseContent { generic: string; stopWords: string[]; faq: MooseEntry[]; knowledge: MooseEntry[] }
export interface LocalAnswer { entryId: string | null; text: string; exact: boolean }
export function entry(content: MooseContent, id: string): MooseEntry | null { return content.faq.find(item => item.id === id) ?? content.knowledge.find(item => item.id === id) ?? null; }
const COMBINING_MARKS = /[\u0300-\u036f]/g;
const NON_WORD = /[^a-z0-9]+/g;
export const MooseMatcher = {
  normalize(value: string): string { return value.toLowerCase().normalize('NFD').replace(COMBINING_MARKS, ''); },
  answer(content: MooseContent, question: string): LocalAnswer | null {
    const rules = this.faq(content, question);
    if (rules?.exact) return rules;
    const lore = this.knowledge(content, question);
    return lore?.exact ? lore : rules ?? lore;
  },
  faq(content: MooseContent, question: string): LocalAnswer | null {
    const stop = new Set(content.stopWords);
    const words = this.normalize(question).split(NON_WORD).filter(word => word.length >= 2 && !stop.has(word));
    if (!words.length) return { entryId: null, text: content.generic, exact: true };
    let best: MooseEntry | null = null, bestScore = 0, exact = false;
    for (const item of content.faq) {
      let entryExact = false;
      const score = item.keywords.map(keyword => {
        const key = this.normalize(keyword);
        const isExact = words.some(word => word === key);
        const partial = key.length >= 3 && words.some(word => word.includes(key) || (word.length >= 3 && key.includes(word)));
        const prefix = key.length >= 4 && words.some(word => word.startsWith(key) || (word.length >= 3 && key.startsWith(word)));
        if (isExact) entryExact = true;
        return isExact ? 4 : partial || prefix ? 2 : 0;
      }).reduce<number>((sum, value) => sum + value, 0);
      if (score > bestScore) { best = item; bestScore = score; exact = entryExact; }
    }
    return best && bestScore >= 2 ? { entryId: best.id, text: best.answer, exact } : null;
  },
  knowledge(content: MooseContent, question: string): LocalAnswer | null {
    const words = this.normalize(question).split(NON_WORD).filter(word => word.length >= 3);
    let best: MooseEntry | null = null, score = 0, exact = false;
    for (const item of content.knowledge) {
      const keywords = item.keywords.map(keyword => this.normalize(keyword));
      const hits = keywords.filter(keyword => words.some(word => word === keyword || word.includes(keyword) || keyword.includes(word))).length;
      if (hits > score) { best = item; score = hits; exact = keywords.some(keyword => words.includes(keyword)); }
    }
    return best ? { entryId: best.id, text: best.answer, exact } : null;
  },
};

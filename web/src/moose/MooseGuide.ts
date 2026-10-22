import { asset } from '../assets';
import { createStore, type Store } from '../lib/store';
import { MooseMatcher, entry, type MooseContent } from './MooseKnowledge';
import { MooseRemote, type MooseTurn } from './MooseRemote';

export interface MooseMessage { id: number; fromMoose: boolean; text: string }
export interface MooseTexts { unavailable: string; overrides: Record<string, string> }
export class MooseGuide {
  readonly messages: Store<MooseMessage[]> = createStore<MooseMessage[]>([]);
  readonly thinking: Store<boolean> = createStore(false);
  private contents = new Map<string, Promise<MooseContent>>();
  private nextId = 0;
  private queue: Promise<void> = Promise.resolve();
  constructor(private readonly remote: MooseRemote | null = null) {}
  ask(question: string, language: string, texts: MooseTexts, topicId: string | null = null): void {
    const text = question.trim();
    if (!text) return;
    const history: MooseTurn[] = this.messages.get().slice(-6).map(item => ({ role: item.fromMoose ? 'assistant' : 'user', content: item.text }));
    this.post(false, text);
    this.queue = this.queue.catch(() => {}).then(async () => this.post(true, await this.answer(text, language, history, texts, topicId)));
  }
  private async answer(question: string, language: string, history: MooseTurn[], texts: MooseTexts, topicId: string | null): Promise<string> {
    const localLang = language === 'fi' ? 'fi' : 'en';
    const localContent = await this.content(localLang);
    const local = () => {
      const found = topicId ? entry(localContent, topicId) : null;
      const match = topicId ? (found ? { entryId: topicId, text: found.answer } : null) : MooseMatcher.answer(localContent, question);
      const answer = match?.entryId ? texts.overrides[match.entryId] ?? match.text : match?.text;
      return answer?.trim() || null;
    };
    const hasLocalContent = language === 'fi' || language === 'en';
    if (hasLocalContent) { const answer = local(); if (answer) return answer; }
    if (this.remote) {
      this.thinking.set(true);
      try { const answer = await this.remote.reply(question, language, history); if (answer) return answer; }
      finally { this.thinking.set(false); }
    }
    return local() ?? texts.unavailable;
  }
  private async content(language: string): Promise<MooseContent> {
    let promise = this.contents.get(language);
    if (!promise) {
      promise = fetch(asset(`i18n/moose/${language}.json`)).then(async response => {
        if (!response.ok) throw new Error('Moose content unavailable');
        const value: unknown = await response.json();
        if (!isMooseContent(value)) throw new Error('Invalid Moose content');
        return value;
      });
      this.contents.set(language, promise);
    }
    try { return await promise; } catch { this.contents.delete(language); return { generic: '', stopWords: [], faq: [], knowledge: [] }; }
  }
  private post(fromMoose: boolean, text: string): void { this.messages.set([...this.messages.get(), { id: this.nextId++, fromMoose, text }]); }
}

function isMooseContent(value: unknown): value is MooseContent {
  if (!value || typeof value !== 'object') return false;
  const item = value as Record<string, unknown>;
  const validEntries = (entries: unknown): boolean => Array.isArray(entries) && entries.length <= 1000 && entries.every(entry => !!entry && typeof entry === 'object' && typeof (entry as Record<string, unknown>).id === 'string' && typeof (entry as Record<string, unknown>).answer === 'string' && Array.isArray((entry as Record<string, unknown>).keywords) && ((entry as Record<string, unknown>).keywords as unknown[]).length <= 100 && ((entry as Record<string, unknown>).keywords as unknown[]).every(word => typeof word === 'string'));
  return typeof item.generic === 'string' && item.generic.length <= 8000 && Array.isArray(item.stopWords) && item.stopWords.length <= 1000 && item.stopWords.every(word => typeof word === 'string') && validEntries(item.faq) && validEntries(item.knowledge);
}

export interface MooseTurn { role: 'assistant' | 'user'; content: string }
const EMOJI = /[\u{1F000}-\u{1FAFF}\u2600-\u27BF\u2B00-\u2BFF\uFE0F\u200D]/gu;
export class MooseRemote {
  constructor(private readonly baseUrl = import.meta.env.VITE_SUPABASE_URL ?? '', private readonly apiKey = import.meta.env.VITE_SUPABASE_KEY ?? '') {}
  async reply(message: string, language: string, history: MooseTurn[]): Promise<string | null> {
    if (!this.baseUrl || !this.apiKey || !message.trim()) return null;
    try {
      const response = await fetch(`${this.baseUrl.replace(/\/$/, '')}/functions/v1/moose-chat`, {
        method: 'POST', headers: { apikey: this.apiKey, Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.slice(0, 2000), lang: language.slice(0, 10), history: history.slice(-6).map(turn => ({ role: turn.role, content: turn.content.slice(0, 2000) })) }),
        signal: AbortSignal.timeout(25_000),
      });
      if (!response.ok) return null;
      const body: unknown = await response.json();
      if (!body || typeof body !== 'object' || typeof (body as { reply?: unknown }).reply !== 'string') return null;
      const answer = (body as { reply: string }).reply.replace(EMOJI, '').replace(/ {2,}/g, ' ').trim();
      return answer ? answer.slice(0, 8000) : null;
    } catch { return null; }
  }
}

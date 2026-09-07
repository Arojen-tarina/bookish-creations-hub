/**
 * MooseAssistant.tsx — Hymyilevä hirvi-avustaja
 *
 * Kelluva chat-painike, joka vastaa pelikysymyksiin. Kokeilee ensin
 * paikallista avainsanahakua (mooseFaq.ts, ei verkkoyhteyttä), ja jos
 * osuvaa vastausta ei löydy, kysyy tekoälyltä (moose-chat-Edge Function).
 * Toimii koko sovelluksessa, myös kesken pelin.
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, GripHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { useLanguage } from '@/lib/i18n.tsx';
import { matchMooseFaq } from './mooseFaq.ts';
import { supabase } from '@/integrations/supabase/client.ts';

interface ChatMessage {
  id: string;
  role: 'user' | 'moose';
  text: string;
}

export const MooseAssistant = () => {
  const { lang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Raahattava sijainti: null = oletuspaikka (kiinni oikeassa alakulmassa)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number; moved: boolean } | null>(null);

  const onDragStart = useCallback((clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    const origX = pos?.x ?? rect?.left ?? 0;
    const origY = pos?.y ?? rect?.top ?? 0;
    dragRef.current = { startX: clientX, startY: clientY, origX, origY, moved: false };

    const clamp = (x: number, y: number) => {
      const w = rect?.width ?? 56;
      const h = rect?.height ?? 56;
      return {
        x: Math.max(4, Math.min(window.innerWidth - w - 4, x)),
        y: Math.max(4, Math.min(window.innerHeight - h - 4, y)),
      };
    };
    const move = (x: number, y: number) => {
      if (!dragRef.current) return;
      const dx = x - dragRef.current.startX;
      const dy = y - dragRef.current.startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragRef.current.moved = true;
      setPos(clamp(dragRef.current.origX + dx, dragRef.current.origY + dy));
    };
    const onMouseMove = (e: MouseEvent) => move(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => { if (e.touches[0]) move(e.touches[0].clientX, e.touches[0].clientY); };
    const end = () => {
      // Klikkaus (ei raahausta) avaa/sulkee chatin; raahaus vain siirtää sitä.
      if (dragRef.current && !dragRef.current.moved) setOpen(v => !v);
      dragRef.current = null;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', end);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', end);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', end);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', end);
  }, [pos]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ id: 'greeting', role: 'moose', text: t('moose.greeting') }]);
    }
  }, [open, messages.length, t]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  const ask = useCallback(async (question: string) => {
    const localAnswer = matchMooseFaq(question, lang);
    if (localAnswer) {
      setMessages(m => [...m, { id: `${Date.now()}-a`, role: 'moose', text: localAnswer }]);
      return;
    }

    setThinking(true);
    try {
      const { data, error } = await supabase.functions.invoke('moose-chat', {
        body: { message: question, lang },
      });
      if (error || !data?.reply) throw error || new Error('no reply');
      setMessages(m => [...m, { id: `${Date.now()}-a`, role: 'moose', text: data.reply }]);
    } catch {
      setMessages(m => [...m, { id: `${Date.now()}-a`, role: 'moose', text: t('moose.fallback') }]);
    } finally {
      setThinking(false);
    }
  }, [lang, t]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || thinking) return;
    setMessages(m => [...m, { id: `${Date.now()}-q`, role: 'user', text: question }]);
    setInput('');
    ask(question);
  }, [input, thinking, ask]);

  return (
    <div
      ref={containerRef}
      className={pos ? 'fixed z-[60] flex flex-col items-end gap-2' : 'fixed bottom-20 right-3 sm:right-4 z-[60] flex flex-col items-end gap-2'}
      style={pos ? { left: pos.x, top: pos.y, right: 'auto', bottom: 'auto' } : undefined}
    >
      {open && (
        <div className="w-[min(90vw,340px)] h-[420px] max-h-[70vh] rounded-2xl border border-amber-700/40 bg-slate-900/98 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-amber-700/30 bg-gradient-to-r from-amber-900/40 to-slate-900/40">
            <span className="text-amber-100 font-bold text-sm flex items-center gap-1.5">🫎 {t('moose.title')}</span>
            <button onClick={() => setOpen(false)} aria-label={t('common.close')} className="text-amber-200/60 hover:text-amber-100 p-1 rounded-md hover:bg-amber-900/40">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
            {messages.map(m => (
              <div
                key={m.id}
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-snug ${
                  m.role === 'moose'
                    ? 'bg-amber-950/60 border border-amber-700/30 text-amber-100 mr-auto'
                    : 'bg-slate-700/60 text-slate-100 ml-auto'
                }`}
              >
                {m.text}
              </div>
            ))}
            {thinking && (
              <div className="max-w-[85%] rounded-xl px-3 py-2 text-sm bg-amber-950/60 border border-amber-700/30 text-amber-200/70 mr-auto animate-pulse">
                {t('moose.thinking')}
              </div>
            )}
          </div>
          <form onSubmit={handleSubmit} className="p-2 border-t border-amber-700/30 flex items-center gap-1.5">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={t('moose.placeholder')}
              className="flex-1 rounded-lg bg-slate-800/70 border border-amber-700/20 px-2.5 py-1.5 text-sm text-amber-50 placeholder:text-amber-200/30 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
              maxLength={500}
            />
            <Button type="submit" size="icon" className="h-8 w-8 bg-amber-600 hover:bg-amber-500 flex-shrink-0" disabled={thinking || !input.trim()} title={t('moose.send')}>
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      )}
      <button
        onMouseDown={(e) => { e.preventDefault(); onDragStart(e.clientX, e.clientY); }}
        onTouchStart={(e) => { if (e.touches[0]) onDragStart(e.touches[0].clientX, e.touches[0].clientY); }}
        aria-label={t('moose.openAria')}
        title={t('moose.title')}
        className="relative h-14 w-14 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 shadow-2xl shadow-black/40 border-2 border-amber-300/50 flex items-center justify-center text-3xl hover:scale-105 active:scale-95 transition-transform cursor-grab active:cursor-grabbing touch-none select-none"
      >
        🫎
        {/* Visible cue that this button can be dragged to reposition */}
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-slate-900/90 border border-amber-300/40 flex items-center justify-center">
          <GripHorizontal className="w-3 h-3 text-amber-300/90" />
        </span>
      </button>
    </div>
  );
};

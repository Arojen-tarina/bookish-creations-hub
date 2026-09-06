/**
 * SaveLoadMenu.tsx — Pelin tallennus ja lataus (5 paikkaa + autosave)
 *
 * Pieni ponnahdusvalikko: tallenna nykyinen peli johonkin viidestä paikasta,
 * lataa aiempi tallennus tai poista se. Käyttää useSaveManager-hookia
 * (localStorage), joka oli aiemmin toteutettu mutta ei kytketty käyttöliittymään.
 */
import { useState, useRef, useEffect } from 'react';
import { Save, FolderOpen, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/i18n.tsx';
import { useSaveManager } from '@/hooks/useSaveManager.ts';
import type { MVPGameState } from '@/hooks/useProvinceGameState.ts';
import type { ProvinceGameState } from '@/types/province.ts';

interface SaveLoadMenuProps {
  gameState: MVPGameState;
  onLoad: (state: MVPGameState) => void;
}

const SLOTS = [1, 2, 3, 4, 5];

export const SaveLoadMenu = ({ gameState, onLoad }: SaveLoadMenuProps) => {
  const { t } = useLanguage();
  const { saves, saveGame, loadGame, deleteGame } = useSaveManager();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  const metaForSlot = (slot: number) => saves.find(s => s.slotNumber === slot) ?? null;

  const handleSave = (slot: number) => {
    const ok = saveGame(slot, t('save.slot', { n: slot }), gameState as unknown as ProvinceGameState);
    toast[ok ? 'success' : 'error'](ok ? t('save.saved', { n: slot }) : t('save.saveFailed'));
  };

  const handleLoad = (slot: number) => {
    const state = loadGame(slot);
    if (state) {
      onLoad(state as unknown as MVPGameState);
      setOpen(false);
      toast.success(t('save.loaded'));
    }
  };

  const handleDelete = (slot: number) => {
    if (window.confirm(t('save.confirmDelete'))) deleteGame(slot);
  };

  return (
    <div ref={rootRef} className="relative">
      <Button
        variant="ghost" size="icon"
        onClick={() => setOpen(v => !v)}
        title={t('save.title')}
        className="text-amber-200/70 hover:text-amber-200 hover:bg-amber-900/30 h-8 w-8"
      >
        <Save className="w-4 h-4" />
      </Button>
      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-72 rounded-xl border border-amber-700/30 bg-slate-900/98 backdrop-blur-xl shadow-2xl p-3">
          <p className="text-amber-200/60 text-[11px] font-bold uppercase tracking-wide mb-1.5">{t('save.title')}</p>
          <div className="space-y-1.5 max-h-80 overflow-y-auto scrollbar-thin">
            {SLOTS.map(slot => {
              const meta = metaForSlot(slot);
              return (
                <div key={slot} className="rounded-lg border border-amber-700/20 bg-slate-800/60 px-2 py-1.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-amber-100 block truncate">{t('save.slot', { n: slot })}</span>
                    <span className="text-[10px] text-stone-400 block truncate">
                      {meta ? t('save.turn', { turn: meta.turn }) : t('save.emptySlot')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleSave(slot)}
                      title={t('save.saveButton')}
                      className="p-1.5 rounded-md text-amber-200/70 hover:text-amber-100 hover:bg-amber-900/40"
                    >
                      <Save className="w-3.5 h-3.5" />
                    </button>
                    {meta && (
                      <>
                        <button
                          onClick={() => handleLoad(slot)}
                          title={t('save.loadButton')}
                          className="p-1.5 rounded-md text-sky-300/80 hover:text-sky-100 hover:bg-sky-900/40"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(slot)}
                          title={t('save.deleteButton')}
                          className="p-1.5 rounded-md text-red-300/70 hover:text-red-100 hover:bg-red-900/40"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

import { ArrowLeft, FolderOpen, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { toast } from 'sonner';
import { useSaveManager } from '@/hooks/useSaveManager.ts';
import type { MVPGameState } from '@/hooks/useProvinceGameState.ts';
import { useLanguage } from '@/lib/i18n.tsx';
import type { SaveMetadata } from '@/types/province.ts';
import menuBackground from '@/assets/menu-bg.jpg';

interface ProvinceLoadGameScreenProps {
  onBack: () => void;
  onLoad: (state: MVPGameState) => void;
}

export const ProvinceLoadGameScreen = ({ onBack, onLoad }: ProvinceLoadGameScreenProps) => {
  const { t } = useLanguage();
  const { saves, autosave, loadAutosave, loadGame, deleteGame } = useSaveManager();

  const handleLoad = (meta: SaveMetadata) => {
    const state = meta.isAutosave ? loadAutosave() : loadGame(meta.slotNumber);
    if (!state) {
      toast.error(t('save.loadFailed'));
      return;
    }
    onLoad(state as unknown as MVPGameState);
  };

  const handleDelete = (meta: SaveMetadata) => {
    if (!window.confirm(t('save.confirmDelete'))) return;
    const deleted = deleteGame(meta.slotNumber);
    if (!deleted) toast.error(t('save.deleteFailed'));
  };

  const metadata: (SaveMetadata | null)[] = [
    autosave,
    ...[1, 2, 3, 4, 5].map(slot => saves.find(save => save.slotNumber === slot) ?? null),
  ];

  return (
    <main className="native-screen fixed inset-0 overflow-y-auto bg-[#120f0c] text-[#f4ead5]">
      <div className="fixed inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${menuBackground})` }} />
      <div className="fixed inset-0 bg-[#120f0c]/85" />
      <div className="relative z-10 mx-auto flex min-h-full max-w-6xl flex-col px-4 py-4 sm:px-6">
        <header className="mb-4 flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            aria-label={t('common.back')}
            className="native-button-secondary h-10 min-h-10 w-10 p-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-[#f2c46b] sm:text-2xl">{t('menu.loadGame')}</h1>
            <p className="text-xs text-[#c4b496]">{t('save.title')}</p>
          </div>
        </header>

        <section className="grid flex-1 auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label={t('menu.loadGame')}>
          {metadata.map((meta, index) => (
            <article key={meta?.id ?? `empty-${index}`} className="native-panel flex min-h-36 flex-col rounded-xl p-3 sm:p-4">
              <div className="flex-1">
                <h2 className="font-semibold text-[#f4ead5]">
                  {index === 0 ? t('save.autosave') : t('save.slot', { n: index })}
                </h2>
                {meta ? (
                  <div className="mt-2 space-y-1 text-xs text-[#c4b496]">
                    <p>{t('faction.continueDesc', {
                      turn: meta.turn,
                      faction: t(`faction.name.${meta.playerFaction}`),
                    })}</p>
                    <p>{new Date(meta.timestamp).toLocaleString()}</p>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-[#8c7d64]">{t('save.emptySlot')}</p>
                )}
              </div>
              {meta && (
                <div className="mt-3 flex justify-end gap-2">
                  <Button
                    type="button"
                    onClick={() => handleLoad(meta)}
                    className="native-button-primary h-9 min-h-9 px-3 text-sm"
                  >
                    <FolderOpen className="mr-1.5 h-4 w-4" />
                    {t('save.loadButton')}
                  </Button>
                  {!meta.isAutosave && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleDelete(meta)}
                      aria-label={`${t('save.deleteButton')}: ${t('save.slot', { n: meta.slotNumber })}`}
                      className="h-9 min-h-9 border border-red-500/40 bg-red-950/30 px-3 text-red-200 hover:bg-red-900/50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </article>
          ))}
        </section>
      </div>
    </main>
  );
};

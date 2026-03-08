/**
 * SaveLoadMenu.tsx — Tallenna/Lataa -valikko
 *
 * 5 tallennuspaikkaa + autosave. Tukee tallennusta, latausta, poistoa,
 * vientiä (JSON-tiedosto) ja tuontia. Käyttää useSaveManager-hookia.
 */
import { useState, useRef } from 'react';
import { SaveMetadata, ProvinceGameState, FACTION_DATA_1206, FactionId } from '@/types/province';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Save, 
  FolderOpen, 
  Trash2, 
  Download, 
  Upload, 
  Clock, 
  Map, 
  Crown,
  PlayCircle,
  AlertTriangle,
} from 'lucide-react';

interface SaveLoadMenuProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'save' | 'load';
  saves: SaveMetadata[];
  autosave: SaveMetadata | null;
  currentState?: ProvinceGameState;
  onSave: (slot: number, name: string) => void;
  onLoad: (slot: number) => void;
  onLoadAutosave: () => void;
  onDelete: (slot: number) => void;
  onExport: (slot: number) => string | null;
  onImport: (json: string) => { success: boolean; error?: string };
}

const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('fi-FI', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const SaveSlot = ({
  slot,
  save,
  mode,
  onSelect,
  onDelete,
  onExport,
  isSelected,
}: {
  slot: number;
  save: SaveMetadata | null;
  mode: 'save' | 'load';
  onSelect: () => void;
  onDelete: () => void;
  onExport: () => void;
  isSelected: boolean;
}) => {
  const isEmpty = !save;
  const factionData = save ? FACTION_DATA_1206[save.playerFaction] : null;

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'border-amber-500 bg-amber-900/30 ring-2 ring-amber-500/50' 
          : 'border-stone-700 bg-stone-900/50 hover:bg-stone-800/50 hover:border-stone-600'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-amber-200/60 text-sm">Paikka {slot}</span>
              {isEmpty ? (
                <span className="text-stone-500 italic">Tyhjä</span>
              ) : (
                <span className="text-amber-100 font-bold">{save.name}</span>
              )}
            </div>
            
            {save && (
              <div className="space-y-1 text-sm text-stone-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTimestamp(save.timestamp)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    Vuoro {save.turn}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <span 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: factionData?.color }}
                    />
                    {factionData?.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Map className="w-3 h-3" />
                    {save.provincesControlled} provinssia
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {save && (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-stone-400 hover:text-amber-200"
                onClick={(e) => {
                  e.stopPropagation();
                  onExport();
                }}
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-stone-400 hover:text-red-400"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const SaveLoadMenu = ({
  isOpen,
  onClose,
  mode,
  saves,
  autosave,
  currentState,
  onSave,
  onLoad,
  onLoadAutosave,
  onDelete,
  onExport,
  onImport,
}: SaveLoadMenuProps) => {
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [saveName, setSaveName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (selectedSlot && saveName.trim()) {
      onSave(selectedSlot, saveName.trim());
      onClose();
    }
  };

  const handleLoad = () => {
    if (selectedSlot) {
      onLoad(selectedSlot);
      onClose();
    }
  };

  const handleDelete = () => {
    if (selectedSlot) {
      onDelete(selectedSlot);
      setShowDeleteConfirm(false);
      setSelectedSlot(null);
    }
  };

  const handleExport = (slot: number) => {
    const json = onExport(slot);
    if (json) {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mongol_empire_save_${slot}_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const json = e.target?.result as string;
      const result = onImport(json);
      if (!result.success) {
        setImportError(result.error || 'Tuntematon virhe');
      } else {
        setImportError(null);
      }
    };
    reader.readAsText(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const slots = [1, 2, 3, 4, 5];

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-gradient-to-br from-stone-900 to-stone-950 border-amber-700/50 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-amber-100 flex items-center gap-2">
              {mode === 'save' ? (
                <>
                  <Save className="w-6 h-6" />
                  Tallenna peli
                </>
              ) : (
                <>
                  <FolderOpen className="w-6 h-6" />
                  Lataa peli
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-stone-400">
              {mode === 'save' 
                ? 'Valitse tallennuspaikka ja anna pelille nimi'
                : 'Valitse tallennuspaikka ladattavaksi'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Autosave section (only in load mode) */}
            {mode === 'load' && autosave && (
              <Card className="border-green-700/50 bg-green-900/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-green-300 text-sm flex items-center gap-2">
                    <PlayCircle className="w-4 h-4" />
                    Automaattinen tallennus
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-stone-300">
                      <span>Vuoro {autosave.turn}</span>
                      <span className="mx-2">•</span>
                      <span>{formatTimestamp(autosave.timestamp)}</span>
                    </div>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-500"
                      onClick={() => {
                        onLoadAutosave();
                        onClose();
                      }}
                    >
                      Jatka
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Save slots */}
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {slots.map(slot => {
                  const save = saves.find(s => s.slotNumber === slot);
                  return (
                    <SaveSlot
                      key={slot}
                      slot={slot}
                      save={save || null}
                      mode={mode}
                      isSelected={selectedSlot === slot}
                      onSelect={() => {
                        setSelectedSlot(slot);
                        if (save && mode === 'save') {
                          setSaveName(save.name);
                        }
                      }}
                      onDelete={() => {
                        setSelectedSlot(slot);
                        setShowDeleteConfirm(true);
                      }}
                      onExport={() => handleExport(slot)}
                    />
                  );
                })}
              </div>
            </ScrollArea>

            {/* Save name input (only in save mode) */}
            {mode === 'save' && selectedSlot && (
              <div className="space-y-2">
                <label className="text-sm text-stone-400">Tallennuksen nimi</label>
                <Input
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="Anna nimi tallennukselle..."
                  className="bg-stone-800 border-stone-600 text-white"
                />
              </div>
            )}

            {/* Import section */}
            <div className="flex items-center gap-2 pt-2 border-t border-stone-700">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                className="border-stone-600 text-stone-300"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Tuo tallennus
              </Button>
              {importError && (
                <span className="text-red-400 text-sm flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  {importError}
                </span>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={onClose} className="border-stone-600">
              Peruuta
            </Button>
            {mode === 'save' ? (
              <Button
                onClick={handleSave}
                disabled={!selectedSlot || !saveName.trim()}
                className="bg-amber-600 hover:bg-amber-500"
              >
                <Save className="w-4 h-4 mr-2" />
                Tallenna
              </Button>
            ) : (
              <Button
                onClick={handleLoad}
                disabled={!selectedSlot || !saves.some(s => s.slotNumber === selectedSlot)}
                className="bg-amber-600 hover:bg-amber-500"
              >
                <FolderOpen className="w-4 h-4 mr-2" />
                Lataa
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="bg-stone-900 border-red-700/50 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Vahvista poisto
            </DialogTitle>
            <DialogDescription className="text-stone-300">
              Haluatko varmasti poistaa tämän tallennuksen? Tätä toimintoa ei voi perua.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Peruuta
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Poista
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

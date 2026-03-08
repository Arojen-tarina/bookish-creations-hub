/**
 * AudioSettings.tsx — Ääniasetukset
 * 
 * Pelin äänenvoimakkuuden hallintapaneeli. Sisältää kolme liukusäädintä:
 * - Päävolyymi (master): kaikki äänet
 * - Musiikki: taustamusiikki
 * - Äänitehosteet (SFX): taisteluäänet, klikkaukset yms.
 * 
 * Tukee myös kaikkien äänten mykistystä yhdellä napilla.
 */
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Volume2, VolumeX, Music, Zap } from 'lucide-react';

interface AudioSettingsProps {
  settings: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    muted: boolean;
  };
  onMasterVolumeChange: (volume: number) => void;
  onMusicVolumeChange: (volume: number) => void;
  onSfxVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
}

export const AudioSettings = ({
  settings,
  onMasterVolumeChange,
  onMusicVolumeChange,
  onSfxVolumeChange,
  onToggleMute,
}: AudioSettingsProps) => {
  return (
    <Card className="bg-gradient-to-br from-stone-900/80 to-stone-950/80 border-stone-700/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-stone-100 text-lg flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          Ääniasetukset
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mute toggle */}
        <Button
          variant={settings.muted ? 'destructive' : 'outline'}
          size="sm"
          onClick={onToggleMute}
          className="w-full"
        >
          {settings.muted ? (
            <>
              <VolumeX className="w-4 h-4 mr-2" />
              Äänet pois
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 mr-2" />
              Äänet päällä
            </>
          )}
        </Button>
        
        {/* Master volume */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-300 flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Päävolyymi
            </span>
            <span className="text-stone-400">{Math.round(settings.masterVolume * 100)}%</span>
          </div>
          <Slider
            value={[settings.masterVolume * 100]}
            onValueChange={([val]) => onMasterVolumeChange(val / 100)}
            max={100}
            step={5}
            disabled={settings.muted}
            className="[&>span]:bg-amber-600"
          />
        </div>
        
        {/* Music volume */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-300 flex items-center gap-2">
              <Music className="w-4 h-4" />
              Musiikki
            </span>
            <span className="text-stone-400">{Math.round(settings.musicVolume * 100)}%</span>
          </div>
          <Slider
            value={[settings.musicVolume * 100]}
            onValueChange={([val]) => onMusicVolumeChange(val / 100)}
            max={100}
            step={5}
            disabled={settings.muted}
            className="[&>span]:bg-purple-600"
          />
        </div>
        
        {/* SFX volume */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-300 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Äänitehosteet
            </span>
            <span className="text-stone-400">{Math.round(settings.sfxVolume * 100)}%</span>
          </div>
          <Slider
            value={[settings.sfxVolume * 100]}
            onValueChange={([val]) => onSfxVolumeChange(val / 100)}
            max={100}
            step={5}
            disabled={settings.muted}
            className="[&>span]:bg-green-600"
          />
        </div>
      </CardContent>
    </Card>
  );
};

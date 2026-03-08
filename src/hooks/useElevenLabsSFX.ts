/**
 * useElevenLabsSFX.ts — ElevenLabs-ääniefektit
 *
 * Generoi ja toistaa ääniefektejä backend-funktiolla (elevenlabs-sfx).
 * Tukee välimuistia (SFXCache), esilataamista ja 10+ pelitilanne-ääntä
 * (stepin tuuli, ratsuväen rynnäkkö, taistelun alku/voitto/häviö jne.).
 */
// Hook for playing ElevenLabs-generated sound effects
import { supabase } from '@/integrations/supabase/client';

interface SFXCache {
  [key: string]: {
    url: string;
    audio: HTMLAudioElement;
    timestamp: number;
  };
}

interface UseElevenLabsSFXOptions {
  volume?: number;
  cacheEnabled?: boolean;
  cacheDurationMs?: number; // Default 1 hour
}

// Predefined game sound effects
export const GAME_SFX = {
  // UI sounds
  ui_click: 'Short UI click sound, modern digital button press',
  ui_confirm: 'Positive confirmation chime, game UI success sound',
  ui_error: 'Error buzz, negative feedback sound, game warning',
  ui_hover: 'Subtle hover sound, soft UI interaction',
  
  // Province/Map sounds
  province_select: 'Map territory selection sound, medieval strategy game',
  province_capture: 'Territory conquest fanfare, victory sound, medieval',
  
  // Battle sounds
  battle_start: 'War drums starting, medieval battle beginning, horses and armor',
  battle_win: 'Victory fanfare, medieval trumpet victory, triumphant',
  battle_lose: 'Defeat sound, somber horn, medieval loss',
  cavalry_charge: 'Horse cavalry charge, thundering hooves, medieval battle',
  sword_clash: 'Sword combat clash, metal on metal, medieval fight',
  arrow_volley: 'Arrows flying, bowstring release, medieval archery',
  
  // Turn sounds
  turn_start: 'New turn beginning, strategic game phase change',
  turn_end: 'Turn ending confirmation, game transition sound',
  
  // Diplomacy sounds
  treaty_signed: 'Scroll unrolling, quill writing, diplomatic agreement',
  treaty_broken: 'Scroll tearing, seal breaking, betrayal sound',
  
  // Ambient
  steppe_wind: 'Mongolian steppe wind ambience, grassland breeze',
  camp_night: 'Medieval camp at night, distant horses, fire crackling',
  
  // Economy
  gold_received: 'Coins clinking, treasure received, medieval gold',
  construction_complete: 'Building complete, medieval construction finishing',
} as const;

export type GameSFXKey = keyof typeof GAME_SFX;

export const useElevenLabsSFX = (options: UseElevenLabsSFXOptions = {}) => {
  const { 
    volume = 0.7, 
    cacheEnabled = true,
    cacheDurationMs = 3600000 // 1 hour
  } = options;
  
  const cacheRef = useRef<SFXCache>({});
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Clear expired cache entries
  const cleanCache = useCallback(() => {
    const now = Date.now();
    Object.entries(cacheRef.current).forEach(([key, entry]) => {
      if (now - entry.timestamp > cacheDurationMs) {
        URL.revokeObjectURL(entry.url);
        delete cacheRef.current[key];
      }
    });
  }, [cacheDurationMs]);
  
  // Generate and play a sound effect
  const playSFX = useCallback(async (
    prompt: string, 
    duration: number = 2,
    sfxVolume?: number
  ): Promise<boolean> => {
    const cacheKey = `${prompt}_${duration}`;
    
    try {
      setError(null);
      
      // Check cache first
      if (cacheEnabled && cacheRef.current[cacheKey]) {
        const cached = cacheRef.current[cacheKey];
        cached.audio.volume = sfxVolume ?? volume;
        cached.audio.currentTime = 0;
        await cached.audio.play();
        return true;
      }
      
      setIsLoading(prompt);
      cleanCache();
      
      // Fetch from edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-sfx`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ prompt, duration }),
        }
      );
      
      if (!response.ok) {
        throw new Error(`SFX request failed: ${response.status}`);
      }
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.volume = sfxVolume ?? volume;
      
      // Cache the audio
      if (cacheEnabled) {
        cacheRef.current[cacheKey] = {
          url: audioUrl,
          audio,
          timestamp: Date.now(),
        };
      }
      
      await audio.play();
      setIsLoading(null);
      
      return true;
    } catch (err) {
      console.error('Failed to play SFX:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsLoading(null);
      return false;
    }
  }, [volume, cacheEnabled, cleanCache]);
  
  // Play a predefined game sound effect
  const playGameSFX = useCallback(async (
    sfxKey: GameSFXKey,
    sfxVolume?: number
  ): Promise<boolean> => {
    const prompt = GAME_SFX[sfxKey];
    
    // Determine duration based on sound type
    let duration = 2;
    if (sfxKey.startsWith('ui_')) {
      duration = 0.5;
    } else if (sfxKey.includes('battle') || sfxKey.includes('ambient')) {
      duration = 4;
    } else if (sfxKey.includes('charge') || sfxKey.includes('volley')) {
      duration = 3;
    }
    
    return playSFX(prompt, duration, sfxVolume);
  }, [playSFX]);
  
  // Preload commonly used sounds
  const preloadSounds = useCallback(async (
    sfxKeys: GameSFXKey[]
  ): Promise<void> => {
    for (const key of sfxKeys) {
      const prompt = GAME_SFX[key];
      let duration = 2;
      if (key.startsWith('ui_')) duration = 0.5;
      
      const cacheKey = `${prompt}_${duration}`;
      
      if (cacheRef.current[cacheKey]) continue;
      
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-sfx`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ prompt, duration }),
          }
        );
        
        if (response.ok) {
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          
          cacheRef.current[cacheKey] = {
            url: audioUrl,
            audio,
            timestamp: Date.now(),
          };
        }
      } catch (err) {
        console.warn(`Failed to preload ${key}:`, err);
      }
    }
  }, []);
  
  // Clean up on unmount
  const cleanup = useCallback(() => {
    Object.values(cacheRef.current).forEach(entry => {
      URL.revokeObjectURL(entry.url);
    });
    cacheRef.current = {};
  }, []);
  
  return {
    playSFX,
    playGameSFX,
    preloadSounds,
    cleanup,
    isLoading,
    error,
  };
};

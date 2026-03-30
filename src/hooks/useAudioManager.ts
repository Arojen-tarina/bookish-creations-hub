/**
 * useAudioManager.ts — Äänihallinta
 *
 * Hallinnoi pelin ääniä: taustamusiikki (Web Audio API),
 * klikkaus-, valinta-, vahvistus- ja vuoronvaihtoäänet.
 * Tukee master/musiikki/SFX -äänenvoimakkuuksia ja mykistystä.
 */
import { useCallback, useRef, useEffect, useState } from 'react';

interface AudioSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
}

interface AudioManagerReturn {
  settings: AudioSettings;
  setMasterVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  setSfxVolume: (volume: number) => void;
  toggleMute: () => void;
  playClick: () => void;
  playSelect: () => void;
  playConfirm: () => void;
  playError: () => void;
  playBattleStart: () => void;
  playBattleWin: () => void;
  playBattleLose: () => void;
  playTurnEnd: () => void;
  playProvinceCapture: () => void;
  playAmbient: () => void;
  stopAmbient: () => void;
}

// Simple audio synthesis for SFX (no external files needed)
const createOscillatorSound = (
  audioContext: AudioContext,
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  gainValue: number = 0.3
): void => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    frequency * 0.5,
    audioContext.currentTime + duration
  );
  
  gainNode.gain.setValueAtTime(gainValue, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
};

// Create a more complex sound
const createComplexSound = (
  audioContext: AudioContext,
  frequencies: number[],
  durations: number[],
  types: OscillatorType[],
  delays: number[] = []
): void => {
  frequencies.forEach((freq, i) => {
    setTimeout(() => {
      createOscillatorSound(audioContext, freq, durations[i] || 0.1, types[i] || 'sine', 0.2);
    }, (delays[i] || 0) * 1000);
  });
};

// Noise generator for battle sounds
const createNoiseBuffer = (audioContext: AudioContext, duration: number): AudioBuffer => {
  const bufferSize = audioContext.sampleRate * duration;
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  return buffer;
};

const createMusicBuffer = (audioContext: AudioContext, variant: number = 0): AudioBuffer => {
  const sampleRate = audioContext.sampleRate;
  const durationSeconds = 16;
  const bufferSize = sampleRate * durationSeconds;
  const buffer = audioContext.createBuffer(2, bufferSize, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  const droneBase = variant === 0 ? 110 : 130;
  const melodyPattern = variant === 0
    ? [0, 3, 5, 7, 10, 7, 5, 3]
    : [0, 2, 5, 7, 9, 7, 5, 2];
  const pluckPattern = variant === 0
    ? [0, 4, 7, 10, 7, 4, 0, 3]
    : [0, 3, 7, 10, 8, 7, 5, 2];

  const getFreq = (semitones: number, octave: number = 0) =>
    droneBase * Math.pow(2, (semitones + 12 * octave) / 12);

  const getPluckEnv = (t: number) => Math.exp(-5 * t);
  const getBowEnv = (t: number) => Math.min(1, t / 0.2);

  for (let i = 0; i < bufferSize; i++) {
    const t = i / sampleRate;
    const globalPhase = t % durationSeconds;

    // Drone / morin khuur bass
    const drone =
      0.16 * Math.sin(2 * Math.PI * droneBase * t) +
      0.05 * Math.sin(2 * Math.PI * droneBase * 1.01 * t);

    // Bowed melody (jouhikko-like)
    const melodyIndex = Math.floor(t / 2) % melodyPattern.length;
    const melodyFreq = getFreq(melodyPattern[melodyIndex], 1);
    const melodyTime = t % 2;
    const bowEnv = melodyTime < 0.35 ? getBowEnv(melodyTime) : 0.95;
    const bow =
      0.08 * Math.sin(2 * Math.PI * melodyFreq * t) * bowEnv *
      (0.5 + 0.5 * Math.sin(2 * Math.PI * 0.1 * t));

    // Plucked kantele arpeggio
    const pluckIndex = Math.floor(t / 0.75) % pluckPattern.length;
    const pluckFreq = getFreq(pluckPattern[pluckIndex], 2);
    const pluckTime = (t % 0.75) / 0.75;
    const pluck =
      0.06 * Math.sin(2 * Math.PI * pluckFreq * t) * getPluckEnv(pluckTime);

    // Air / space
    const air = 0.02 * Math.sin(2 * Math.PI * 0.32 * t);

    const sample = (drone + bow + pluck + air) * 0.85;
    left[i] = sample;
    right[i] = sample;
  }

  return buffer;
};

const SETTINGS_KEY = 'mongol_empire_audio_settings';

const defaultSettings: AudioSettings = {
  masterVolume: 0.7,
  musicVolume: 0.5,
  sfxVolume: 0.8,
  muted: false,
};

export const useAudioManager = (): AudioManagerReturn => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambientSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const ambientTrackRef = useRef<number>(0);
  const ambientTimeoutRef = useRef<number | null>(null);
  const [settings, setSettings] = useState<AudioSettings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      return stored ? JSON.parse(stored) : defaultSettings;
    } catch {
      return defaultSettings;
    }
  });

  // Initialize audio context on first user interaction
  const getAudioContext = useCallback((): AudioContext => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save audio settings:', e);
    }
  }, [settings]);

  const getEffectiveVolume = useCallback((volumeType: 'sfx' | 'music'): number => {
    if (settings.muted) return 0;
    const typeVolume = volumeType === 'sfx' ? settings.sfxVolume : settings.musicVolume;
    return settings.masterVolume * typeVolume;
  }, [settings]);

  // Volume controls
  const setMasterVolume = useCallback((volume: number) => {
    setSettings(prev => ({ ...prev, masterVolume: Math.max(0, Math.min(1, volume)) }));
  }, []);

  const setMusicVolume = useCallback((volume: number) => {
    setSettings(prev => ({ ...prev, musicVolume: Math.max(0, Math.min(1, volume)) }));
  }, []);

  const setSfxVolume = useCallback((volume: number) => {
    setSettings(prev => ({ ...prev, sfxVolume: Math.max(0, Math.min(1, volume)) }));
  }, []);

  const toggleMute = useCallback(() => {
    setSettings(prev => ({ ...prev, muted: !prev.muted }));
  }, []);

  // SFX: Click
  const playClick = useCallback(() => {
    if (settings.muted) return;
    const ctx = getAudioContext();
    createOscillatorSound(ctx, 800, 0.05, 'square', getEffectiveVolume('sfx') * 0.3);
  }, [getAudioContext, settings.muted, getEffectiveVolume]);

  // SFX: Select
  const playSelect = useCallback(() => {
    if (settings.muted) return;
    const ctx = getAudioContext();
    createComplexSound(
      ctx,
      [440, 550],
      [0.08, 0.08],
      ['sine', 'sine'],
      [0, 0.05]
    );
  }, [getAudioContext, settings.muted]);

  // SFX: Confirm
  const playConfirm = useCallback(() => {
    if (settings.muted) return;
    const ctx = getAudioContext();
    createComplexSound(
      ctx,
      [523, 659, 784],
      [0.1, 0.1, 0.15],
      ['sine', 'sine', 'sine'],
      [0, 0.08, 0.16]
    );
  }, [getAudioContext, settings.muted]);

  // SFX: Error
  const playError = useCallback(() => {
    if (settings.muted) return;
    const ctx = getAudioContext();
    createComplexSound(
      ctx,
      [200, 150],
      [0.15, 0.2],
      ['sawtooth', 'sawtooth'],
      [0, 0.1]
    );
  }, [getAudioContext, settings.muted]);

  // SFX: Battle Start (dramatic)
  const playBattleStart = useCallback(() => {
    if (settings.muted) return;
    const ctx = getAudioContext();
    
    // War drums effect
    createComplexSound(
      ctx,
      [80, 60, 80, 100],
      [0.2, 0.3, 0.2, 0.4],
      ['triangle', 'triangle', 'triangle', 'triangle'],
      [0, 0.25, 0.5, 0.75]
    );
    
    // Battle horn
    setTimeout(() => {
      createOscillatorSound(ctx, 220, 0.5, 'sawtooth', getEffectiveVolume('sfx') * 0.4);
    }, 200);
  }, [getAudioContext, settings.muted, getEffectiveVolume]);

  // SFX: Battle Win
  const playBattleWin = useCallback(() => {
    if (settings.muted) return;
    const ctx = getAudioContext();
    
    // Victory fanfare
    createComplexSound(
      ctx,
      [392, 494, 587, 784],
      [0.15, 0.15, 0.15, 0.4],
      ['triangle', 'triangle', 'triangle', 'sine'],
      [0, 0.15, 0.3, 0.45]
    );
  }, [getAudioContext, settings.muted]);

  // SFX: Battle Lose
  const playBattleLose = useCallback(() => {
    if (settings.muted) return;
    const ctx = getAudioContext();
    
    // Defeat sound
    createComplexSound(
      ctx,
      [300, 250, 200, 150],
      [0.2, 0.2, 0.2, 0.4],
      ['sawtooth', 'sawtooth', 'sawtooth', 'triangle'],
      [0, 0.2, 0.4, 0.6]
    );
  }, [getAudioContext, settings.muted]);

  // SFX: Turn End
  const playTurnEnd = useCallback(() => {
    if (settings.muted) return;
    const ctx = getAudioContext();
    
    createComplexSound(
      ctx,
      [330, 440],
      [0.1, 0.2],
      ['sine', 'sine'],
      [0, 0.1]
    );
  }, [getAudioContext, settings.muted]);

  // SFX: Province Capture
  const playProvinceCapture = useCallback(() => {
    if (settings.muted) return;
    const ctx = getAudioContext();
    
    // Triumphant chord
    createComplexSound(
      ctx,
      [262, 330, 392, 523],
      [0.1, 0.1, 0.1, 0.3],
      ['sine', 'sine', 'sine', 'triangle'],
      [0, 0.05, 0.1, 0.15]
    );
  }, [getAudioContext, settings.muted]);

  // Ambient: Background string-music loop with morin khuur / jouhikko / kantele flavor
  const playAmbient = useCallback(() => {
    if (settings.muted) return;

    const ctx = getAudioContext();

    if (ambientSourceRef.current) {
      ambientSourceRef.current.stop();
    }
    clearAmbientTimeout();

    ambientTrackRef.current = Math.random() < 0.5 ? 0 : 1;
    const buffer = createMusicBuffer(ctx, ambientTrackRef.current);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gainNode = ctx.createGain();
    gainNode.gain.value = getEffectiveVolume('music') * 0.18;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1200;
    filter.Q.value = 1.2;

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    source.start();
    ambientSourceRef.current = source;

    scheduleAmbientSwitch(ctx);
  }, [getAudioContext, settings.muted, getEffectiveVolume, clearAmbientTimeout, scheduleAmbientSwitch]);

  const clearAmbientTimeout = useCallback(() => {
    if (ambientTimeoutRef.current !== null) {
      window.clearTimeout(ambientTimeoutRef.current);
      ambientTimeoutRef.current = null;
    }
  }, []);

  const stopAmbient = useCallback(() => {
    if (ambientSourceRef.current) {
      ambientSourceRef.current.stop();
      ambientSourceRef.current = null;
    }
    clearAmbientTimeout();
  }, [clearAmbientTimeout]);

  const scheduleAmbientSwitch = useCallback((ctx: AudioContext) => {
    clearAmbientTimeout();
    ambientTimeoutRef.current = window.setTimeout(() => {
      ambientTrackRef.current = 1 - ambientTrackRef.current;
      if (settings.muted) return;
      const buffer = createMusicBuffer(ctx, ambientTrackRef.current);
      if (ambientSourceRef.current) {
        ambientSourceRef.current.stop();
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const gainNode = ctx.createGain();
      gainNode.gain.value = getEffectiveVolume('music') * 0.18;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1200;
      filter.Q.value = 1.2;

      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start();
      ambientSourceRef.current = source;
      scheduleAmbientSwitch(ctx);
    }, 18000 + Math.random() * 12000);
  }, [clearAmbientTimeout, getEffectiveVolume, settings.muted]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (ambientSourceRef.current) {
        ambientSourceRef.current.stop();
      }
      clearAmbientTimeout();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [clearAmbientTimeout]);

  return {
    settings,
    setMasterVolume,
    setMusicVolume,
    setSfxVolume,
    toggleMute,
    playClick,
    playSelect,
    playConfirm,
    playError,
    playBattleStart,
    playBattleWin,
    playBattleLose,
    playTurnEnd,
    playProvinceCapture,
    playAmbient,
    stopAmbient,
  };
};

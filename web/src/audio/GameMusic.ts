import { asset } from '../assets';
import type { SettingsRepository } from '../data/SettingsRepository';

export type MusicMood = 'CALM' | 'COMBAT';
const PLAYLIST = ['music_track1.mp3','music_track2.mp3','music_track3.mp3','music_track4.mp3','music_track5.mp3','music_track6.mp3'];
const VOLUME_SCALE = 0.6;

/** Browser music player: a six-track playlist and looping combat track, unlocked by the first user gesture. */
export class GameMusic {
  private audio: HTMLAudioElement | null = null;
  private settingsValue: ReturnType<SettingsRepository['settings']['get']>;
  private mood: MusicMood = 'CALM';
  private foreground = true;
  private interrupted = false;
  private unlocked = false;
  private yielding = false;
  private preview: number | null = null;
  private playlistIndex = 0;
  private playlistPosition = 0;
  private fadeFrame = 0;
  private gestureListener = () => this.unlock();

  constructor(settings: SettingsRepository) {
    this.settingsValue = settings.settings.get();
    settings.settings.subscribe(() => {
      const next = settings.settings.get();
      if (next.musicVolume !== this.settingsValue.musicVolume) this.preview = null;
      this.settingsValue = next;
      this.update();
    });
    if (typeof document !== 'undefined') {
      document.addEventListener('pointerdown', this.gestureListener, { once: true });
      document.addEventListener('keydown', this.gestureListener, { once: true });
      document.addEventListener('visibilitychange', () => document.hidden ? this.onBackground() : this.onForeground());
    }
  }
  onForeground(): void {
    this.foreground = true;
    this.yielding = false;
    this.update();
  }
  onBackground(): void { this.foreground = false; this.update(); }
  setMood(mood: MusicMood): void {
    if (this.mood === mood) return;
    if (this.mood === 'CALM' && this.audio) { this.playlistIndex = Math.max(0, PLAYLIST.indexOf(this.audio.src.split('/').pop() ?? PLAYLIST[0])); this.playlistPosition = this.audio.currentTime; }
    this.mood = mood;
    const audio = this.audio;
    if (audio && !audio.paused && this.shouldPlay()) {
      this.fadeTo(0, 350, () => { audio.pause(); this.loadTrack(); if (!this.shouldPlay()) return; audio.volume = 0; void audio.play().then(() => this.fadeTo(this.target(), 700)).catch(() => {}); });
    } else this.update(true);
  }
  setInterrupted(value: boolean): void { this.interrupted = value; this.update(); }
  previewVolume(volume: number): void { this.preview = Math.max(0, Math.min(1, volume)); this.update(); }
  private unlock(): void {
    this.unlocked = true;
    document.removeEventListener('pointerdown', this.gestureListener);
    document.removeEventListener('keydown', this.gestureListener);
    this.update();
  }
  private target(): number { return (this.preview ?? this.settingsValue.musicVolume) * VOLUME_SCALE; }
  private shouldPlay(): boolean { return this.unlocked && this.foreground && !this.yielding && !this.interrupted && !this.settingsValue.musicMuted && this.target() > 0; }
  private update(reload = false): void {
    if (typeof Audio === 'undefined') return;
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.preload = 'auto';
      this.audio.addEventListener('ended', () => { if (this.mood === 'CALM') { this.playlistIndex = (this.playlistIndex + 1) % PLAYLIST.length; this.playlistPosition = 0; this.loadTrack(); void this.audio?.play().catch(() => {}); } });
    }
    const audio = this.audio;
    if (!this.shouldPlay()) { this.fadeTo(0, 350, () => audio.pause()); return; }
    const desired = this.mood === 'COMBAT' ? 'music_combat.mp3' : PLAYLIST[this.playlistIndex];
    if (reload || !audio.src.endsWith(`/${desired}`)) this.loadTrack();
    if (audio.paused) { audio.volume = 0; void audio.play().then(() => this.fadeTo(this.target(), 700)).catch(() => { this.unlocked = false; document.addEventListener('pointerdown', this.gestureListener, { once: true }); }); }
    else this.fadeTo(this.target(), 350);
  }
  private loadTrack(): void {
    if (!this.audio) return;
    const name = this.mood === 'COMBAT' ? 'music_combat.mp3' : PLAYLIST[this.playlistIndex];
    this.audio.src = asset(`music/${name}`);
    this.audio.loop = this.mood === 'COMBAT';
    this.audio.load();
    if (this.mood === 'CALM' && this.playlistPosition > 0) {
      const position = this.playlistPosition;
      try { this.audio.currentTime = position; }
      catch { this.audio.addEventListener('loadedmetadata', () => { if (this.audio) this.audio.currentTime = position; }, { once: true }); }
    }
  }
  private fadeTo(target: number, duration: number, done?: () => void): void {
    if (!this.audio) return;
    cancelAnimationFrame(this.fadeFrame);
    const audio = this.audio, from = audio.volume, started = performance.now();
    const frame = (now: number) => {
      const progress = Math.min(1, (now - started) / duration);
      audio.volume = Math.max(0, Math.min(1, from + (target - from) * progress));
      if (progress < 1) this.fadeFrame = requestAnimationFrame(frame); else done?.();
    };
    this.fadeFrame = requestAnimationFrame(frame);
  }
  dispose(): void { cancelAnimationFrame(this.fadeFrame); this.audio?.pause(); this.audio = null; }
}

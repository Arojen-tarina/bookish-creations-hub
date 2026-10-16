/**
 * SettingsMenu.tsx — Peli- ja ääniasetukset
 *
 * Pieni ponnahdusvalikko peli-, ääni- ja kieliasetuksille.
 */
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { RotateCcw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { useLanguage, LANGUAGE_OPTIONS } from '@/lib/i18n.tsx';
import { useDeviceMode, DeviceMode } from '@/lib/deviceMode.tsx';
import { getAnalyticsConsent, setAnalyticsConsent, startSession, track } from '@/lib/analytics';

interface SettingsMenuProps {
  className?: string;
  buttonClassName?: string;
  musicVolume?: number;
  onMusicVolumeChange?: (volume: number) => void;
  onRestart?: () => void;
}

export const SettingsMenu = ({ className = '', buttonClassName = '', musicVolume, onMusicVolumeChange, onRestart }: SettingsMenuProps) => {
  const { lang, setLang, t } = useLanguage();
  const { deviceMode, setDeviceMode } = useDeviceMode();
  const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
  const isMobileViewport = deviceMode === 'mobile' || (typeof window !== 'undefined' && window.innerWidth < 768);
  const [open, setOpen] = useState(false);
  const [analyticsOn, setAnalyticsOn] = useState(() => getAnalyticsConsent() === 'granted');
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 256 });

  const updateMenuPosition = () => {
    const button = rootRef.current?.querySelector('button');
    if (!button) return;
    const rect = button.getBoundingClientRect();
    const margin = 12;
    const menuWidth = Math.min(280, window.innerWidth - margin * 2);
    const menuHeight = menuRef.current?.offsetHeight ?? 440;
    const left = clamp(rect.left + rect.width / 2 - menuWidth / 2, margin, Math.max(margin, window.innerWidth - menuWidth - margin));
    const top = clamp(rect.bottom + 8, margin, Math.max(margin, window.innerHeight - menuHeight - margin));
    setMenuPosition({ top, left, width: menuWidth });
  };

  const toggleAnalytics = () => {
    const next = !analyticsOn;
    setAnalyticsConsent(next);
    if (next) startSession();
    setAnalyticsOn(next);
  };

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!rootRef.current?.contains(target) && !menuRef.current?.contains(target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    updateMenuPosition();
    const frame = requestAnimationFrame(updateMenuPosition);
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [open]);

  const modes: { id: DeviceMode; label: string; desc: string }[] = [
    { id: 'desktop', label: t('device.desktop'), desc: t('device.desktopDesc') },
    { id: 'mobile', label: t('device.mobile'), desc: t('device.mobileDesc') },
  ];

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <Button
        variant="ghost" size="icon"
        onClick={() => setOpen(v => !v)}
        title={t('settings.title')}
        aria-label={t('settings.title')}
        className={buttonClassName || 'text-amber-200/70 hover:text-amber-200 hover:bg-amber-900/30 h-8 w-8'}
      >
        <Settings className="w-4 h-4" />
      </Button>
      {open && createPortal(
        <div
          ref={menuRef}
          className="fixed z-[10000] max-h-[calc(100dvh-1rem)] overflow-y-auto rounded-xl border border-amber-700/30 bg-slate-900/98 backdrop-blur-xl shadow-2xl p-3"
          style={{
            top: menuPosition.top,
            left: menuPosition.left,
            width: menuPosition.width,
            maxWidth: `calc(100vw - ${24}px)`,
            maxHeight: `calc(100dvh - ${24}px)`,
          }}
        >
          <p className="text-sm font-bold text-amber-100 mb-3">{t('settings.title')}</p>
          <p className="text-amber-200/60 text-[11px] font-bold uppercase tracking-wide mb-1.5">{t('lang.switch')}</p>
          <select
            value={lang}
            onChange={event => {
              const next = event.target.value as typeof lang;
              track('settings_changed', { setting: 'language', value: next });
              setLang(next);
            }}
            aria-label={t('lang.switch')}
            className="w-full mb-3 rounded-lg border border-amber-700/30 bg-slate-800 px-2 py-2 text-sm font-semibold text-amber-100 outline-none focus:border-amber-400"
          >
            {LANGUAGE_OPTIONS.map(language => (
              <option key={language.id} value={language.id}>{language.label}</option>
            ))}
          </select>
          <p className="text-amber-200/60 text-[11px] font-bold uppercase tracking-wide mb-1.5">{t('device.title')}</p>
          <div className="space-y-1.5">
            {modes.map(m => (
              <button
                key={m.id}
                onClick={() => { track('settings_changed', { setting: 'deviceMode', value: m.id }); setDeviceMode(m.id); }}
                className={`w-full text-left rounded-lg px-2 py-1.5 border transition-colors ${
                  deviceMode === m.id
                    ? 'bg-amber-500/20 border-amber-500/60'
                    : 'bg-slate-800/60 border-amber-700/20 hover:bg-slate-800'
                }`}
              >
                <span className={`text-xs font-semibold block ${deviceMode === m.id ? 'text-amber-100' : 'text-amber-200/70'}`}>{m.label}</span>
                <span className="text-[10px] text-stone-400 block leading-snug">{m.desc}</span>
              </button>
            ))}
          </div>
          <p className="text-amber-200/60 text-[11px] font-bold uppercase tracking-wide mt-3 mb-1.5">{t('analytics.settings.title')}</p>
          <button
            onClick={toggleAnalytics}
            className={`w-full text-left rounded-lg px-2 py-1.5 border transition-colors ${
              analyticsOn ? 'bg-amber-500/20 border-amber-500/60' : 'bg-slate-800/60 border-amber-700/20 hover:bg-slate-800'
            }`}
          >
            <span className={`text-xs font-semibold block ${analyticsOn ? 'text-amber-100' : 'text-amber-200/70'}`}>
              {analyticsOn ? t('analytics.settings.on') : t('analytics.settings.off')}
            </span>
            <span className="text-[10px] text-stone-400 block leading-snug">{t('analytics.settings.desc')}</span>
          </button>
          {onMusicVolumeChange && musicVolume !== undefined && (
            <>
              <p className="text-amber-200/60 text-[11px] font-bold uppercase tracking-wide mt-3 mb-1.5">{t('music.title')}</p>
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="music-volume" className="text-xs text-amber-100/80">{t('music.volume')}</label>
                  <span className="text-xs tabular-nums text-amber-200/60">{Math.round(musicVolume * 100)}%</span>
                </div>
                <input
                  id="music-volume"
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={musicVolume}
                  onChange={event => onMusicVolumeChange(Number(event.target.value))}
                  className="w-full h-2 accent-amber-400 cursor-pointer"
                />
              </div>
            </>
          )}
          {onRestart && (
            <Button
              variant="destructive"
              size="sm"
              className="mt-2 w-full"
              onClick={() => {
                setOpen(false);
                onRestart();
              }}
            >
              <RotateCcw className="mr-1 h-3.5 w-3.5" />
              {t('sidebar.reset')}
            </Button>
          )}
        </div>,
        document.fullscreenElement ?? document.body,
      )}
    </div>
  );
};

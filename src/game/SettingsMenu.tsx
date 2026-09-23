/**
 * SettingsMenu.tsx — Kieli- ja laiteoptimointivalinta
 *
 * Pieni ponnahdusvalikko (ei ulkoista popover-riippuvuutta): kielivalinta
 * (suomi/englanti) ja käyttöliittymän optimointi (tietokone/puhelin).
 */
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { useLanguage, Language } from '@/lib/i18n.tsx';
import { useDeviceMode, DeviceMode } from '@/lib/deviceMode.tsx';
import type { MusicTrackId } from '@/hooks/useAudioManager.ts';
import { getAnalyticsConsent, setAnalyticsConsent, startSession, track } from '@/lib/analytics';

interface SettingsMenuProps {
  className?: string;
  buttonClassName?: string;
  musicTracks?: MusicTrackId[];
  currentTrack?: MusicTrackId;
  onSelectTrack?: (id: MusicTrackId) => void;
}

export const SettingsMenu = ({ className = '', buttonClassName = '', musicTracks, currentTrack, onSelectTrack }: SettingsMenuProps) => {
  const { lang, setLang, t } = useLanguage();
  const { deviceMode, setDeviceMode } = useDeviceMode();
  const [open, setOpen] = useState(false);
  const [analyticsOn, setAnalyticsOn] = useState(() => getAnalyticsConsent() === 'granted');
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });

  const updateMenuPosition = () => {
    const button = rootRef.current?.querySelector('button');
    if (!button) return;
    const rect = button.getBoundingClientRect();
    setMenuPosition({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
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
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);
    return () => {
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [open]);

  const languages: { id: Language; label: string }[] = [
    { id: 'fi', label: t('lang.fi') },
    { id: 'en', label: t('lang.en') },
  ];
  const modes: { id: DeviceMode; label: string; desc: string }[] = [
    { id: 'desktop', label: t('device.desktop'), desc: t('device.desktopDesc') },
    { id: 'mobile', label: t('device.mobile'), desc: t('device.mobileDesc') },
  ];

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <Button
        variant="ghost" size="icon"
        onClick={() => setOpen(v => !v)}
        title={t('lang.switch')}
        className={buttonClassName || 'text-amber-200/70 hover:text-amber-200 hover:bg-amber-900/30 h-8 w-8'}
      >
        <Languages className="w-4 h-4" />
      </Button>
      {open && createPortal(
        <div
          ref={menuRef}
          className="fixed z-[10000] w-64 rounded-xl border border-amber-700/30 bg-slate-900/98 backdrop-blur-xl shadow-2xl p-3"
          style={{ top: menuPosition.top, right: menuPosition.right }}
        >
          <p className="text-amber-200/60 text-[11px] font-bold uppercase tracking-wide mb-1.5">{t('lang.switch')}</p>
          <div className="flex gap-1.5 mb-3">
            {languages.map(l => (
              <button
                key={l.id}
                onClick={() => { track('settings_changed', { setting: 'language', value: l.id }); setLang(l.id); }}
                className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold border transition-colors ${
                  lang === l.id
                    ? 'bg-amber-500 text-white border-amber-400'
                    : 'bg-slate-800/60 text-amber-200/70 border-amber-700/20 hover:bg-slate-800'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
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
          {musicTracks && musicTracks.length > 0 && onSelectTrack && (
            <>
              <p className="text-amber-200/60 text-[11px] font-bold uppercase tracking-wide mt-3 mb-1.5">{t('music.title')}</p>
              <div className="space-y-1.5">
                {musicTracks.map(id => (
                  <button
                    key={id}
                    onClick={() => onSelectTrack(id)}
                    className={`w-full text-left rounded-lg px-2 py-1.5 text-xs font-semibold border transition-colors ${
                      currentTrack === id
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-100'
                        : 'bg-slate-800/60 text-amber-200/70 border-amber-700/20 hover:bg-slate-800'
                    }`}
                  >
                    {t(`music.${id}`)}
                    {currentTrack === id && <span className="ml-1.5 text-[10px] text-amber-400/80">· {t('music.nowPlaying')}</span>}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>,
        document.body,
      )}
    </div>
  );
};

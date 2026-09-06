/**
 * SettingsMenu.tsx — Kieli- ja laiteoptimointivalinta
 *
 * Pieni ponnahdusvalikko (ei ulkoista popover-riippuvuutta): kielivalinta
 * (suomi/englanti) ja käyttöliittymän optimointi (tietokone/puhelin).
 */
import { useState, useRef, useEffect } from 'react';
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';
import { useLanguage, Language } from '@/lib/i18n.tsx';
import { useDeviceMode, DeviceMode } from '@/lib/deviceMode.tsx';

interface SettingsMenuProps {
  className?: string;
  buttonClassName?: string;
}

export const SettingsMenu = ({ className = '', buttonClassName = '' }: SettingsMenuProps) => {
  const { lang, setLang, t } = useLanguage();
  const { deviceMode, setDeviceMode } = useDeviceMode();
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
      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-xl border border-amber-700/30 bg-slate-900/98 backdrop-blur-xl shadow-2xl p-3">
          <p className="text-amber-200/60 text-[11px] font-bold uppercase tracking-wide mb-1.5">{t('lang.switch')}</p>
          <div className="flex gap-1.5 mb-3">
            {languages.map(l => (
              <button
                key={l.id}
                onClick={() => setLang(l.id)}
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
                onClick={() => setDeviceMode(m.id)}
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
        </div>
      )}
    </div>
  );
};

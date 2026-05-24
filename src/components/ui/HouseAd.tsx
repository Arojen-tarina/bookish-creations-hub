/**
 * HouseAd.tsx — Sisäinen mainoskomponentti (ei ulkoisia skriptejä)
 *
 * Korvaa Google AdSensen kevyellä, projektin omalla mainospaikalla.
 * Näyttää satunnaisen "talon mainoksen" eri muodoissa: banneri, neliö, sivupalkki.
 */
import { useMemo } from 'react';

interface HouseAdProps {
  /** Mainospaikan tunniste (esim. "sidebar", "bottom_banner", "game_over"). Käytetään mainoksen valintaan. */
  slot: string;
  /** Lisätyylit ulkokehälle. */
  className?: string;
  /** Mainoksen muoto. */
  variant?: 'banner' | 'square' | 'sidebar';
}

interface AdContent {
  title: string;
  body: string;
  cta: string;
  href: string;
  bg: string;
}

const ADS: AdContent[] = [
  {
    title: 'Arojen Tarinat',
    body: 'Hallitse mongolien aikakauden valtakuntia. Vuoropohjainen strategia.',
    cta: 'Pelaa nyt',
    href: '#',
    bg: 'from-amber-700 to-amber-900',
  },
  {
    title: 'Tue kehittäjiä',
    body: 'Juuso & Vilho kehittävät peliä. Jaa peli kavereille!',
    cta: 'Jaa peli',
    href: '#',
    bg: 'from-emerald-700 to-emerald-900',
  },
  {
    title: 'Historian aroilla',
    body: 'Tšingis-kaani, Silkkitie ja 70 historiallista provinssia odottavat.',
    cta: 'Lue lisää',
    href: '#',
    bg: 'from-indigo-700 to-indigo-900',
  },
  {
    title: 'Vinkki',
    body: 'Linnoita pääkaupunkisi! Linnoitukset estävät valtauksen.',
    cta: 'Sulje',
    href: '#',
    bg: 'from-slate-700 to-slate-900',
  },
];

export function HouseAd({ slot, className, variant = 'banner' }: HouseAdProps) {
  // Valitaan mainos slot-tunnisteen perusteella deterministisesti
  const ad = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < slot.length; i++) hash = (hash * 31 + slot.charCodeAt(i)) | 0;
    return ADS[Math.abs(hash) % ADS.length];
  }, [slot]);

  const isSquare = variant === 'square';
  const isSidebar = variant === 'sidebar';

  return (
    <a
      href={ad.href}
      aria-label={`Mainos: ${ad.title}`}
      className={`block w-full bg-gradient-to-br ${ad.bg} text-white rounded-xl overflow-hidden border border-white/10 shadow-inner hover:brightness-110 transition ${className ?? ''}`}
    >
      <div className={`p-3 flex ${isSquare ? 'flex-col items-start gap-2' : isSidebar ? 'flex-col items-start gap-2' : 'items-center gap-3'}`}>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-white/60 mb-0.5">Mainos</div>
          <div className="font-bold text-sm leading-tight truncate">{ad.title}</div>
          <div className="text-xs text-white/80 leading-snug line-clamp-2">{ad.body}</div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white/15 hover:bg-white/25 whitespace-nowrap">
          {ad.cta}
        </span>
      </div>
    </a>
  );
}

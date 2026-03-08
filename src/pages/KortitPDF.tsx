/**
 * KortitPDF.tsx — Pelikorttien PDF-tulostussivu
 *
 * Renderöi kaikki 180 pelikorttia A4-sivuille tulostettavassa muodossa.
 * Kortit näytetään 3×3 -ruudukossa sivua kohden, kansilehden kera.
 * Käyttää AI-generoituja kuvia Supabase Storagesta.
 */
import { useEffect } from "react";
import {
  allCards,
  strategyCards,
  diplomacyCards,
  technologyCards,
  resourceCards,
  cardTypeInfo,
  rarityInfo,
  GameCard,
} from "@/data/gameCards";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

const getImageUrl = (cardId: string) =>
  `${SUPABASE_URL}/storage/v1/object/public/card-images/${cardId}.png`;

const CardTile = ({ card }: { card: GameCard }) => {
  const typeInfo = cardTypeInfo[card.type];
  const rarity = rarityInfo[card.rarity || "common"];

  return (
    <div className="w-[63mm] h-[88mm] bg-gradient-to-b from-amber-50 to-amber-100 border-2 rounded-lg flex flex-col overflow-hidden break-inside-avoid"
      style={{ borderColor: typeInfo.borderColor.replace('border-', '') }}>
      {/* Header */}
      <div className={`${typeInfo.color} text-white px-2 py-1.5 flex items-center justify-between`}>
        <span className="text-lg">{typeInfo.icon}</span>
        <span className="font-bold text-[10px] uppercase tracking-wider">{typeInfo.name}</span>
        <span className="text-lg">{typeInfo.icon}</span>
      </div>

      {/* Name */}
      <div className="px-2 py-1.5 bg-gradient-to-r from-amber-200 to-amber-100 border-b-2 border-amber-400">
        <h3 className="font-bold text-xs text-amber-900 text-center leading-tight">{card.name}</h3>
      </div>

      {/* Image — slightly shorter to give text more room */}
      <div className="h-16 mx-1.5 mt-1.5 rounded border border-amber-400 overflow-hidden bg-amber-200 flex items-center justify-center">
        <img
          src={getImageUrl(card.id)}
          alt={card.name}
          className="w-full h-full object-cover"
          crossOrigin="anonymous"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
            (e.target as HTMLImageElement).parentElement!.innerHTML = `<span style="font-size:2rem;opacity:0.4">${typeInfo.icon}</span>`;
          }}
        />
      </div>

      {/* Description + Effect — larger text, better contrast */}
      <div className="flex-1 px-2 py-1.5 flex flex-col gap-1">
        <p className="text-[9px] leading-tight text-amber-800 italic text-center">{card.description}</p>
        <div className="bg-amber-900/90 rounded p-1.5 border border-amber-700 flex-shrink-0">
          <p className="text-[9px] leading-tight text-amber-100 font-bold text-center">{card.effect}</p>
        </div>
        {card.cost && (
          <p className="text-[9px] font-semibold text-amber-700 text-center">💰 {card.cost}</p>
        )}
      </div>

      {/* Footer */}
      <div className="px-2 py-1 bg-amber-200 border-t-2 border-amber-400 flex items-center justify-between">
        <span className="text-[8px] font-mono text-amber-600">{card.id}</span>
        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${rarity.color}`}></span>
          <span className="text-[8px] font-semibold text-amber-700">{rarity.name}</span>
        </div>
      </div>
    </div>
  );
};

interface CardSectionProps {
  title: string;
  icon: string;
  cards: GameCard[];
}

const CardSection = ({ title, icon, cards }: CardSectionProps) => {
  const pages: GameCard[][] = [];
  for (let i = 0; i < cards.length; i += 9) {
    pages.push(cards.slice(i, i + 9));
  }

  return (
    <>
      {pages.map((pageCards, pageIdx) => (
        <div key={pageIdx} className="w-[210mm] min-h-[297mm] p-4 bg-white break-after-page">
          {pageIdx === 0 && (
            <h2 className="text-lg font-bold text-center mb-3 text-amber-900">
              {icon} {title} ({cards.length} kpl) — Sivu {pageIdx + 1}/{pages.length}
            </h2>
          )}
          {pageIdx > 0 && (
            <p className="text-xs text-center text-gray-400 mb-3">
              {title} — Sivu {pageIdx + 1}/{pages.length}
            </p>
          )}
          <div className="grid grid-cols-3 gap-2 justify-items-center">
            {pageCards.map((card) => (
              <CardTile key={card.id} card={card} />
            ))}
          </div>
          <p className="text-[8px] text-center text-gray-400 mt-2">
            Mongolien Valtakunta — {title}
          </p>
        </div>
      ))}
    </>
  );
};

const KortitPDF = () => {
  useEffect(() => {
    document.title = "Mongolien Valtakunta — Kaikki Pelikortit (PDF)";
  }, []);

  return (
    <div className="bg-white min-h-screen">
      {/* Print controls — hidden on print */}
      <div className="print:hidden sticky top-0 z-50 bg-amber-800 text-white p-4 flex items-center justify-between shadow-lg">
        <div>
          <h1 className="font-bold text-lg">Mongolien Valtakunta — Korttien PDF</h1>
          <p className="text-amber-200 text-sm">{allCards.length} korttia kuvineen</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="bg-white text-amber-900 font-bold px-6 py-2 rounded-lg hover:bg-amber-100 transition-colors"
          >
            🖨️ Tulosta / Tallenna PDF
          </button>
          <button
            onClick={() => window.history.back()}
            className="border border-amber-400 text-amber-200 px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
          >
            ← Takaisin
          </button>
        </div>
      </div>

      {/* Kansilehti */}
      <div className="w-[210mm] min-h-[297mm] mx-auto p-8 flex flex-col items-center justify-center break-after-page">
        <div className="text-center">
          <div className="text-8xl mb-6">🏇</div>
          <h1 className="text-4xl font-bold text-amber-800 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
            MONGOLIEN VALTAKUNTA
          </h1>
          <p className="text-xl text-amber-600 mb-8">Kaikki Pelikortit</p>
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto text-sm text-amber-700">
            <div className="bg-amber-50 border border-amber-200 rounded p-3 text-center">
              <div className="text-2xl font-bold text-red-700">{strategyCards.length}</div>
              <div>⚔️ Strategia</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded p-3 text-center">
              <div className="text-2xl font-bold text-blue-700">{diplomacyCards.length}</div>
              <div>🤝 Diplomatia</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded p-3 text-center">
              <div className="text-2xl font-bold text-green-700">{technologyCards.length}</div>
              <div>⚙️ Teknologia</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded p-3 text-center">
              <div className="text-2xl font-bold text-amber-700">{resourceCards.length}</div>
              <div>📦 Resurssit</div>
            </div>
          </div>
          <p className="mt-8 text-gray-500 text-sm italic">
            Yhteensä {allCards.length} pelikorttia — Tulosta ja leikkaa
          </p>
        </div>
      </div>

      {/* Kortit kategorioittain */}
      <CardSection title="Strategiakortit" icon="⚔️" cards={strategyCards} />
      <CardSection title="Diplomatiakortit" icon="🤝" cards={diplomacyCards} />
      <CardSection title="Teknologiakortit" icon="⚙️" cards={technologyCards} />
      <CardSection title="Resurssikortit" icon="📦" cards={resourceCards} />
    </div>
  );
};

export default KortitPDF;

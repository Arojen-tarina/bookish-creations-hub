/**
 * PrintableCard.tsx — Tulostettavan pelikortin komponentti
 *
 * Renderöi yksittäisen kortin (63×88 mm) ja korttiarkin (PrintableCardSheet)
 * A4-sivuille 3×3-ruudukossa tulostusta varten.
 */
import { GameCard, cardTypeInfo, rarityInfo } from "@/data/gameCards";
import { useGeneratedCardImages } from "@/hooks/useGeneratedCardImages";

interface PrintableCardProps {
  card: GameCard;
  showBack?: boolean;
  imageUrl?: string;
}

export const PrintableCard = ({ card, showBack = false, imageUrl }: PrintableCardProps) => {
  const typeInfo = cardTypeInfo[card.type];
  const rarity = rarityInfo[card.rarity || 'common'];

  if (showBack) {
    return (
      <div className={`w-[63mm] h-[88mm] bg-gradient-to-b from-amber-50 to-amber-100 border-2 ${typeInfo.borderColor} rounded-lg flex flex-col overflow-hidden print:break-inside-avoid`}>
        {/* Header with type */}
        <div className={`${typeInfo.color} text-white px-2 py-1.5 flex items-center justify-between`}>
          <span className="text-lg">{typeInfo.icon}</span>
          <span className="font-display text-[10px] font-bold uppercase tracking-wider">{typeInfo.name}</span>
          <span className="text-lg">{typeInfo.icon}</span>
        </div>

        {/* Card name */}
        <div className="px-2 py-1.5 bg-gradient-to-r from-amber-200 to-amber-100 border-b-2 border-amber-400">
          <h3 className="font-display font-bold text-xs text-amber-900 text-center leading-tight">
            {card.name}
          </h3>
        </div>

        {/* Stats area */}
        <div className="flex-1 px-2.5 py-2 flex flex-col gap-1.5">
          <div className="bg-amber-200/60 rounded p-1.5 border border-amber-300">
            <p className="text-[10px] leading-snug text-amber-900 text-center font-medium">
              📜 {card.description}
            </p>
          </div>

          <div className="bg-amber-900/90 rounded p-2 border border-amber-700 flex-1 flex items-center">
            <p className="text-[11px] leading-snug text-amber-100 font-bold text-center w-full">
              ⚡ {card.effect}
            </p>
          </div>

          {card.cost && (
            <div className="bg-amber-700/90 rounded p-1.5 border border-amber-600">
              <p className="text-[10px] text-amber-100 font-bold text-center">
                💰 Hinta: {card.cost}
              </p>
            </div>
          )}

          <div className="flex items-center justify-center gap-2 pt-0.5">
            <span className={`w-2.5 h-2.5 rounded-full ${rarity.color}`}></span>
            <span className="text-[10px] font-semibold text-amber-800">{rarity.name}</span>
            <span className="text-[9px] text-amber-600">({rarity.symbol})</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-2 py-1 bg-amber-200 border-t-2 border-amber-400 flex items-center justify-between">
          <span className="text-[8px] font-mono text-amber-600">{card.id}</span>
          <span className="text-[8px] text-amber-700 font-bold">MONGOLIEN VALTAKUNTA</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-[63mm] h-[88mm] bg-gradient-to-b from-amber-50 to-amber-100 border-2 ${typeInfo.borderColor} rounded-lg flex flex-col overflow-hidden print:break-inside-avoid`}>
      {/* Header */}
      <div className={`${typeInfo.color} text-white px-2 py-1.5 flex items-center justify-between`}>
        <span className="text-lg">{typeInfo.icon}</span>
        <span className="font-display text-[10px] font-bold uppercase tracking-wider">{typeInfo.name}</span>
        <span className="text-lg">{typeInfo.icon}</span>
      </div>
      
      {/* Kortin nimi */}
      <div className="px-3 py-2 bg-gradient-to-r from-amber-200 to-amber-100 border-b-2 border-amber-400">
        <h3 className="font-display font-bold text-sm text-amber-900 text-center leading-tight">
          {card.name}
        </h3>
      </div>
      
      {/* Kuva-alue */}
      <div className="flex-1 mx-2 mt-2 mb-1 bg-gradient-to-b from-amber-200 to-amber-300 rounded border border-amber-400 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={card.name}
            className="w-full h-full object-cover"
            loading="lazy"
            crossOrigin="anonymous"
          />
        ) : (
          <span className="text-4xl opacity-50">{typeInfo.icon}</span>
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

interface PrintableCardSheetProps {
  cards: GameCard[];
  title: string;
}

export const PrintableCardSheet = ({ cards, title }: PrintableCardSheetProps) => {
  const { images, isLoading } = useGeneratedCardImages();
  
  const cardsPerPage = 9;
  const pages = [];
  
  for (let i = 0; i < cards.length; i += cardsPerPage) {
    pages.push(cards.slice(i, i + cardsPerPage));
  }

  const cardsWithImages = cards.filter(card => images.has(card.id)).length;

  // Helper: reverse each row of 3 so backs align with fronts when flipping along long edge
  const mirrorRowOrder = (cards: GameCard[]): GameCard[] => {
    const result: GameCard[] = [];
    for (let i = 0; i < cards.length; i += 3) {
      const row = cards.slice(i, i + 3);
      result.push(...row.reverse());
    }
    return result;
  };

  return (
    <div className="print:block">
      {!isLoading && cardsWithImages > 0 && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg print:hidden">
          <p className="text-sm text-green-800">
            ✅ <strong>{cardsWithImages}/{cards.length}</strong> korttia näyttää AI-generoidun kuvan
          </p>
        </div>
      )}

      {/* Print hint */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg print:hidden">
        <p className="text-sm text-blue-800">
          🖨️ <strong>Kaksipuolinen tulostus:</strong> Etupuoli ja takapuoli tulostetaan peräkkäisille sivuille. 
          Valitse tulostusasetuksista "Käännä pitkän sivun kautta" (Flip on long edge). 
          Takapuolen kortit on peilattu automaattisesti oikein.
        </p>
      </div>
      
      {/* Interleaved: front page, then its matching back page */}
      {pages.map((pageCards, pageIndex) => (
        <div key={`pair-${pageIndex}`}>
          {/* FRONT side */}
          <div className="w-[210mm] min-h-[297mm] p-4 bg-white print:break-after-page">
            <h2 className="font-display text-sm font-bold text-center mb-4 text-amber-900 print:text-black">
              {title} — Etupuoli (Sivu {pageIndex + 1}/{pages.length})
            </h2>
            <div className="grid grid-cols-3 gap-2 justify-items-center">
              {pageCards.map((card) => (
                <PrintableCard 
                  key={card.id} 
                  card={card} 
                  imageUrl={images.get(card.id) ?? `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/card-images/${card.id}.png`}
                />
              ))}
            </div>
            <p className="text-xs text-center text-gray-400 mt-2">
              Mongolien Valtakunta — {title} — Etupuoli {pageIndex + 1}/{pages.length}
            </p>
          </div>

          {/* BACK side — row-mirrored for double-sided printing */}
          <div className="w-[210mm] min-h-[297mm] p-4 bg-white print:break-after-page">
            <h2 className="font-display text-sm font-bold text-center mb-4 text-amber-900 print:text-black">
              {title} — Takapuoli (Sivu {pageIndex + 1}/{pages.length})
            </h2>
            <div className="grid grid-cols-3 gap-2 justify-items-center">
              {mirrorRowOrder(pageCards).map((card) => (
                <PrintableCard 
                  key={card.id} 
                  card={card}
                  showBack={true}
                />
              ))}
            </div>
            <p className="text-xs text-center text-gray-400 mt-2">
              Mongolien Valtakunta — {title} — Takapuoli {pageIndex + 1}/{pages.length}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

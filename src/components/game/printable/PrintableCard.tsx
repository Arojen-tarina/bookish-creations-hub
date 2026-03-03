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
      <div className="w-[63mm] h-[88mm] bg-gradient-to-br from-amber-800 to-amber-950 border-2 border-amber-600 rounded-lg flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-4xl mb-2">🏇</div>
          <div className="font-display text-amber-200 text-lg font-bold">Mongolien</div>
          <div className="font-display text-amber-100 text-xl font-bold">Valtakunta</div>
          <div className="mt-2 text-amber-300 text-xs">1206 AD</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-[63mm] h-[88mm] bg-gradient-to-b from-amber-50 to-amber-100 border-2 ${typeInfo.borderColor} rounded-lg flex flex-col overflow-hidden print:break-inside-avoid`}>
      {/* Header */}
      <div className={`${typeInfo.color} text-white px-2 py-1.5 flex items-center justify-between`}>
        <span className="text-lg">{typeInfo.icon}</span>
        <span className="font-display text-xs font-bold uppercase tracking-wide">{typeInfo.name}</span>
        <span className="text-lg">{typeInfo.icon}</span>
      </div>
      
      {/* Kortin nimi */}
      <div className="px-3 py-2 bg-gradient-to-r from-amber-200 to-amber-100 border-b border-amber-300">
        <h3 className="font-display font-bold text-sm text-amber-900 text-center leading-tight">
          {card.name}
        </h3>
      </div>
      
      {/* Kuva-alue - näyttää AI-generoidun kuvan tai placeholderin */}
      <div className="h-20 mx-2 mt-2 bg-gradient-to-b from-amber-200 to-amber-300 rounded border border-amber-400 flex items-center justify-center overflow-hidden">
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
      
      {/* Kuvaus */}
      <div className="flex-1 px-3 py-2">
        <p className="text-xs text-amber-800 italic text-center mb-2">
          {card.description}
        </p>
        <div className="bg-amber-200/50 rounded p-2 border border-amber-300">
          <p className="text-xs text-amber-900 font-medium text-center">
            {card.effect}
          </p>
        </div>
        {card.cost && (
          <p className="text-xs text-amber-700 text-center mt-1">
            💰 {card.cost}
          </p>
        )}
      </div>
      
      {/* Footer */}
      <div className="px-2 py-1 bg-amber-200 border-t border-amber-300 flex items-center justify-between">
        <span className="text-xs text-amber-700">{card.id}</span>
        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${rarity.color}`}></span>
          <span className="text-xs text-amber-700">{rarity.name}</span>
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
  
  // 9 korttia per sivu (3x3)
  const cardsPerPage = 9;
  const pages = [];
  
  for (let i = 0; i < cards.length; i += cardsPerPage) {
    pages.push(cards.slice(i, i + cardsPerPage));
  }

  // Count how many cards have images
  const cardsWithImages = cards.filter(card => images.has(card.id)).length;

  return (
    <div className="print:block">
      {/* Info banner - hidden when printing */}
      {!isLoading && cardsWithImages > 0 && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg print:hidden">
          <p className="text-sm text-green-800">
            ✅ <strong>{cardsWithImages}/{cards.length}</strong> korttia näyttää AI-generoidun kuvan
          </p>
        </div>
      )}
      
      {pages.map((pageCards, pageIndex) => (
        <div 
          key={pageIndex} 
          className="w-[210mm] min-h-[297mm] p-4 bg-white print:break-after-page"
        >
          {pageIndex === 0 && (
            <h2 className="font-display text-lg font-bold text-center mb-4 text-amber-900 print:text-black">
              {title} (Sivu {pageIndex + 1}/{pages.length})
            </h2>
          )}
          <div className="grid grid-cols-3 gap-2 justify-items-center">
            {pageCards.map((card) => (
              <PrintableCard 
                key={card.id} 
                card={card} 
                imageUrl={images.get(card.id)}
              />
            ))}
          </div>
          <p className="text-xs text-center text-gray-400 mt-2">
            Mongolien Valtakunta — {title} — Sivu {pageIndex + 1}/{pages.length}
          </p>
        </div>
      ))}
    </div>
  );
};

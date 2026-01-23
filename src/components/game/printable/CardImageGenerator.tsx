import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCardImageGenerator } from '@/hooks/useCardImageGenerator';
import { 
  allCards, 
  strategyCards, 
  diplomacyCards, 
  technologyCards, 
  resourceCards,
  GameCard 
} from '@/data/gameCards';
import { 
  Wand2, 
  Pause, 
  Play, 
  Trash2, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';

interface CardWithImageProps {
  card: GameCard;
  imageUrl?: string;
  error?: string;
  isLoading?: boolean;
}

const CardWithImage = ({ card, imageUrl, error, isLoading }: CardWithImageProps) => {
  const typeColors = {
    strategy: 'border-red-500 bg-red-500/10',
    diplomacy: 'border-blue-500 bg-blue-500/10',
    technology: 'border-green-500 bg-green-500/10',
    resource: 'border-amber-500 bg-amber-500/10',
  };

  return (
    <div className={`border-2 rounded-lg p-2 ${typeColors[card.type]} transition-all`}>
      <div className="aspect-[3/4] bg-black/5 rounded mb-2 flex items-center justify-center overflow-hidden">
        {isLoading ? (
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        ) : imageUrl ? (
          <img 
            src={imageUrl} 
            alt={card.name} 
            className="w-full h-full object-cover rounded"
          />
        ) : error ? (
          <div className="text-center p-2">
            <XCircle className="w-6 h-6 mx-auto text-red-500 mb-1" />
            <p className="text-xs text-red-500">Virhe</p>
          </div>
        ) : (
          <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
        )}
      </div>
      <div className="text-center">
        <p className="text-xs font-medium truncate">{card.name}</p>
        <p className="text-[10px] text-muted-foreground">{card.id}</p>
      </div>
      {imageUrl && (
        <div className="mt-1 flex justify-center">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        </div>
      )}
    </div>
  );
};

interface CardGridProps {
  cards: GameCard[];
  generatedImages: Map<string, string>;
  errors: Map<string, string>;
  loadingCards: Set<string>;
}

const CardGrid = ({ cards, generatedImages, errors, loadingCards }: CardGridProps) => {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
      {cards.map(card => (
        <CardWithImage
          key={card.id}
          card={card}
          imageUrl={generatedImages.get(card.id)}
          error={errors.get(card.id)}
          isLoading={loadingCards.has(card.id)}
        />
      ))}
    </div>
  );
};

export const CardImageGenerator = () => {
  const {
    isGenerating,
    progress,
    generatedImages,
    errors,
    generateImages,
    stopGeneration,
    clearResults,
  } = useCardImageGenerator();

  const [selectedCategory, setSelectedCategory] = useState<'all' | 'strategy' | 'diplomacy' | 'technology' | 'resource'>('all');

  const getCards = () => {
    switch (selectedCategory) {
      case 'strategy': return strategyCards;
      case 'diplomacy': return diplomacyCards;
      case 'technology': return technologyCards;
      case 'resource': return resourceCards;
      default: return allCards;
    }
  };

  const handleGenerate = async () => {
    const cards = getCards();
    toast.info(`Aloitetaan ${cards.length} kortin kuvien generointi...`, {
      description: 'Tämä voi kestää useita minuutteja.'
    });
    
    const results = await generateImages(cards);
    const successful = results.filter(r => r.success).length;
    
    toast.success(`Generointi valmis!`, {
      description: `${successful}/${cards.length} kuvaa luotu onnistuneesti.`
    });
  };

  const handleDownloadAll = () => {
    generatedImages.forEach((url, cardId) => {
      const link = document.createElement('a');
      link.href = url;
      link.download = `${cardId}.png`;
      link.click();
    });
    toast.success(`${generatedImages.size} kuvaa ladattu.`);
  };

  const progressPercent = progress.total > 0 
    ? Math.round((progress.processed / progress.total) * 100) 
    : 0;

  // Create a set of cards currently being processed
  const loadingCards = new Set<string>();
  if (isGenerating && progress.currentBatch > 0) {
    const cards = getCards();
    const batchStart = (progress.currentBatch - 1) * 3;
    const batchEnd = Math.min(batchStart + 3, cards.length);
    for (let i = batchStart; i < batchEnd; i++) {
      if (!generatedImages.has(cards[i].id) && !errors.has(cards[i].id)) {
        loadingCards.add(cards[i].id);
      }
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="w-5 h-5" />
          Tekoälykuvien Generointi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category selector */}
        <Tabs value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as typeof selectedCategory)}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">
              Kaikki ({allCards.length})
            </TabsTrigger>
            <TabsTrigger value="strategy">
              Strategia ({strategyCards.length})
            </TabsTrigger>
            <TabsTrigger value="diplomacy">
              Diplomatia ({diplomacyCards.length})
            </TabsTrigger>
            <TabsTrigger value="technology">
              Teknologia ({technologyCards.length})
            </TabsTrigger>
            <TabsTrigger value="resource">
              Resurssit ({resourceCards.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Controls */}
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating}
            className="gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generoidaan...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Aloita Generointi ({getCards().length} korttia)
              </>
            )}
          </Button>

          {isGenerating && (
            <Button variant="destructive" onClick={stopGeneration} className="gap-2">
              <Pause className="w-4 h-4" />
              Pysäytä
            </Button>
          )}

          {generatedImages.size > 0 && (
            <>
              <Button variant="outline" onClick={handleDownloadAll} className="gap-2">
                <Download className="w-4 h-4" />
                Lataa Kaikki ({generatedImages.size})
              </Button>
              <Button variant="ghost" onClick={clearResults} className="gap-2">
                <Trash2 className="w-4 h-4" />
                Tyhjennä
              </Button>
            </>
          )}
        </div>

        {/* Progress */}
        {(isGenerating || progress.processed > 0) && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                Erä {progress.currentBatch}/{progress.totalBatches}
              </span>
              <span>
                {progress.processed}/{progress.total} ({progressPercent}%)
              </span>
            </div>
            <Progress value={progressPercent} className="h-3" />
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                Onnistuneet: {progress.successful}
              </span>
              <span className="flex items-center gap-1">
                <XCircle className="w-4 h-4 text-red-500" />
                Epäonnistuneet: {progress.failed}
              </span>
            </div>
          </div>
        )}

        {/* Card Grid */}
        <div className="max-h-[600px] overflow-y-auto">
          <CardGrid 
            cards={getCards()} 
            generatedImages={generatedImages}
            errors={errors}
            loadingCards={loadingCards}
          />
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
          <p className="font-medium mb-1">💡 Tietoa generoinnista:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Kuvat generoidaan 3 kortin erissä virheiden välttämiseksi</li>
            <li>180 kortin generointi kestää noin 60 minuuttia</li>
            <li>Kuvat tallennetaan selaimen muistiin - muista ladata ne!</li>
            <li>Tyyli: Realistinen maalaus, 1200-luvun mongolilais-persialainen</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

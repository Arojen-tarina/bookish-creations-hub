import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ComicPanel } from "@/components/ComicPanel";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Dice6, Layers } from "lucide-react";
import gameBoardMap from "@/assets/game-board-map.png";

const showcaseCards = {
  strategy: ["str-034", "str-035", "str-036", "str-037", "str-038", "str-039", "str-040", "str-041"],
  diplomacy: ["dip-001", "dip-002", "dip-003", "dip-004", "dip-005", "dip-006", "dip-007", "dip-008"],
  technology: ["tek-001", "tek-002", "tek-003", "tek-004", "tek-005", "tek-006", "tek-007", "tek-008"],
};

const PelinEsittely = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6">
            Miltä lautapeli näyttää valmiina?
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Mongolien Valtakunta -lautapeli yhdistää historiallisen strategian, kauniin visuaalisen ilmeen 
            ja mukaansatempaavan pelimekaniikan. Tässä esittelyssä näet, miltä peli näyttää pöydällä.
          </p>
        </div>
      </section>

      {/* Game Board Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Layers className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold">Pelilauta</h2>
                <p className="text-muted-foreground">60×80 cm strateginen karttalauta</p>
              </div>
            </div>
            <ComicPanel className="overflow-hidden p-0">
              <img 
                src={gameBoardMap} 
                alt="Mongolien Valtakunta -lautapelin pelilauta" 
                className="w-full h-auto"
                loading="lazy"
              />
            </ComicPanel>
            <p className="text-center text-sm text-muted-foreground mt-4 italic">
              Mongolien Valtakunta — strateginen lautapeli 2–4 pelaajalle
            </p>
          </div>
        </div>
      </section>

      {/* Card Showcase Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Dice6 className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold">Pelikortit</h2>
                <p className="text-muted-foreground">180 uniikkia pelikorttia — strategia, diplomatia ja teknologia</p>
              </div>
            </div>
            
            {/* Strategy cards */}
            <div className="mb-8">
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">⚔️ Strategiakortit</h3>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                {showcaseCards.strategy.map((id) => (
                  <img
                    key={id}
                    src={`/cards/${id}.png`}
                    alt={`Strategiakortti ${id}`}
                    className="w-full h-auto rounded-sm border border-border shadow-sm hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                ))}
              </div>
            </div>

            {/* Diplomacy cards */}
            <div className="mb-8">
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">🤝 Diplomatiakortit</h3>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                {showcaseCards.diplomacy.map((id) => (
                  <img
                    key={id}
                    src={`/cards/${id}.png`}
                    alt={`Diplomatiakortti ${id}`}
                    className="w-full h-auto rounded-sm border border-border shadow-sm hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                ))}
              </div>
            </div>

            {/* Technology cards */}
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-3">⚙️ Teknologiakortit</h3>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                {showcaseCards.technology.map((id) => (
                  <img
                    key={id}
                    src={`/cards/${id}.png`}
                    alt={`Teknologiakortti ${id}`}
                    className="w-full h-auto rounded-sm border border-border shadow-sm hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                ))}
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6 italic">
              Esimerkkejä 180 pelikortista — kaikki tulostettavissa
            </p>
          </div>
        </div>
      </section>

      {/* Printable Materials Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Printer className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold">Tulostettavat materiaalit</h2>
                <p className="text-muted-foreground">Kortit, pelilauta ja komponentit</p>
              </div>
            </div>
            <ComicPanel className="overflow-hidden p-4 md:p-8">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <div className="text-4xl">🃏</div>
                  <p className="font-display font-bold text-foreground">180 pelikorttia</p>
                  <p className="text-sm text-muted-foreground">Strategia, diplomatia, teknologia ja resurssit</p>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl">🗺️</div>
                  <p className="font-display font-bold text-foreground">60×80 cm pelilauta</p>
                  <p className="text-sm text-muted-foreground">Historiallinen Euraasian kartta</p>
                </div>
                <div className="space-y-2">
                  <div className="text-4xl">📖</div>
                  <p className="font-display font-bold text-foreground">Sääntökirja</p>
                  <p className="text-sm text-muted-foreground">10 osiota — kaikki säännöt selitettynä</p>
                </div>
              </div>
            </ComicPanel>
            <p className="text-center text-sm text-muted-foreground mt-4 italic">
              Kaikki materiaalit tulostettavissa A4-koossa
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="font-display text-4xl font-bold text-primary mb-2">180</div>
              <p className="text-muted-foreground text-sm">Pelikorttia</p>
            </div>
            <div className="text-center">
              <div className="font-display text-4xl font-bold text-accent mb-2">2–4</div>
              <p className="text-muted-foreground text-sm">Pelaajaa</p>
            </div>
            <div className="text-center">
              <div className="font-display text-4xl font-bold text-primary mb-2">60×80</div>
              <p className="text-muted-foreground text-sm">cm pelilauta</p>
            </div>
            <div className="text-center">
              <div className="font-display text-4xl font-bold text-accent mb-2">10</div>
              <p className="text-muted-foreground text-sm">Sääntöosiota</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-6">
            Haluatko kokeilla peliä?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Tulosta pelimateriaalit ja aloita valloitus ystäviesi kanssa!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="font-display uppercase tracking-wide">
              <Link to="/tulosta">Tulosta Materiaalit</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="font-display uppercase tracking-wide gap-2">
              <Link to="/">
                <ArrowLeft className="w-4 h-4" />
                Palaa Etusivulle
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PelinEsittely;

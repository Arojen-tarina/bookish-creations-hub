import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ComicPanel } from "@/components/ComicPanel";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Dice6, Layers } from "lucide-react";

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

      {/* 3D Render Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Layers className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold">3D-malli lautapelistä</h2>
                <p className="text-muted-foreground">Renderöity kuva valmiista pelipaketista</p>
              </div>
            </div>
            <ComicPanel className="overflow-hidden p-0">
              <div className="aspect-video bg-muted flex items-center justify-center">
                <p className="text-muted-foreground italic text-lg" id="render-placeholder">
                  📦 3D-renderöity kuva — lataa kuva chatissa
                </p>
              </div>
            </ComicPanel>
            <p className="text-center text-sm text-muted-foreground mt-4 italic">
              Mongolien Valtakunta — strateginen lautapeli 2–4 pelaajalle
            </p>
          </div>
        </div>
      </section>

      {/* Game Session Section */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Dice6 className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold">Pelitilanne pöydällä</h2>
                <p className="text-muted-foreground">Näin peliä pelataan — tunnelmaa ja strategiaa</p>
              </div>
            </div>
            <ComicPanel className="overflow-hidden p-0">
              <div className="aspect-video bg-muted flex items-center justify-center">
                <p className="text-muted-foreground italic text-lg" id="session-placeholder">
                  🎲 Kuva pelitilanteesta — lataa kuva chatissa
                </p>
              </div>
            </ComicPanel>
            <p className="text-center text-sm text-muted-foreground mt-4 italic">
              Pelaajat suunnittelevat strategiaansa arojen hallinnasta
            </p>
          </div>
        </div>
      </section>

      {/* Printable Materials Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-full bg-steppe-gold/20 flex items-center justify-center">
                <Printer className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold">Tulostettavat materiaalit</h2>
                <p className="text-muted-foreground">Kortit, pelilauta ja komponentit</p>
              </div>
            </div>
            <ComicPanel className="overflow-hidden p-0">
              <div className="aspect-video bg-muted flex items-center justify-center">
                <p className="text-muted-foreground italic text-lg" id="materials-placeholder">
                  🃏 Kuva tulostettavista materiaaleista — lataa kuva chatissa
                </p>
              </div>
            </ComicPanel>
            <p className="text-center text-sm text-muted-foreground mt-4 italic">
              180 pelikorttia, pelilauta ja sääntökirja — kaikki tulostettavissa
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

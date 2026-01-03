import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ComicPanel } from "@/components/ComicPanel";
import { Button } from "@/components/ui/button";
import { BookOpen, Gamepad2, FileText, TrendingUp } from "lucide-react";
import comicArt from "@/assets/comic-panel.png";

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background with comic art */}
        <div className="absolute inset-0 z-0">
          <img
            src={comicArt}
            alt="Sarjakuvataide"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>

        <div className="container mx-auto px-4 z-10">
          <div className="max-w-3xl">
            <h1 className="font-display text-5xl md:text-7xl font-bold text-foreground mb-6 animate-fade-in">
              Arojen Tarina
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 font-body leading-relaxed animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Eeppinen trilogia mongolisotureista — kunniasta, rakkaudesta ja
              arojen loputtomasta horisontista.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <Button asChild size="lg" className="font-display uppercase tracking-wide">
                <Link to="/romaani">Tutustu Romaaniin</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="font-display uppercase tracking-wide">
                <Link to="/lautapeli">Lautapeli</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Comic Panel */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <ComicPanel className="overflow-hidden p-0">
              <img
                src={comicArt}
                alt="Sarjakuvapaneeli mongolisotureista"
                className="w-full h-auto"
              />
            </ComicPanel>
            <p className="text-center text-sm text-muted-foreground mt-4 italic">
              Alkuperäinen sarjakuvataide — mongolisotureita, shamaaneja ja arojen maisemia
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
            Projektin Osat
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/romaani" className="group">
              <ComicPanel className="h-full transition-transform group-hover:-translate-y-1">
                <BookOpen className="w-12 h-12 text-primary mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2">Romaani</h3>
                <p className="text-muted-foreground text-sm">
                  Historiallis-fantastinen eeppinen draama mongolisoturien maailmasta.
                </p>
              </ComicPanel>
            </Link>

            <Link to="/suunnitelma" className="group">
              <ComicPanel variant="accent" className="h-full transition-transform group-hover:-translate-y-1">
                <FileText className="w-12 h-12 text-accent mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2">Suunnitelma</h3>
                <p className="text-muted-foreground text-sm">
                  Trilogian rakenne, teemat ja kirjoitusprosessin dokumentaatio.
                </p>
              </ComicPanel>
            </Link>

            <Link to="/lautapeli" className="group">
              <ComicPanel variant="primary" className="h-full transition-transform group-hover:-translate-y-1">
                <Gamepad2 className="w-12 h-12 text-primary mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2">Lautapeli</h3>
                <p className="text-muted-foreground text-sm">
                  Strateginen lautapeli romaanin maailmaan perustuen.
                </p>
              </ComicPanel>
            </Link>

            <Link to="/liiketoiminta" className="group">
              <ComicPanel className="h-full transition-transform group-hover:-translate-y-1">
                <TrendingUp className="w-12 h-12 text-accent mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2">Liiketoiminta</h3>
                <p className="text-muted-foreground text-sm">
                  Liiketoimintasuunnitelma ja kaupallinen strategia.
                </p>
              </ComicPanel>
            </Link>
          </div>
        </div>
      </section>

      {/* Themes Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-12">
            Keskeiset Teemat
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-steppe-gold/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚔️</span>
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">Kunnia & Resilienssi</h3>
              <p className="text-muted-foreground text-sm">
                Soturien tie ja kestävyys vaikeuksien edessä.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">❤️</span>
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">Kielletty Rakkaus</h3>
              <p className="text-muted-foreground text-sm">
                Rakkaus, joka ylittää rajat ja ennakkoluulot.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🦌</span>
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">Mytologia & Shamanismi</h3>
              <p className="text-muted-foreground text-sm">
                Myyttiset eläimet ja henkimaailman viisaus.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;

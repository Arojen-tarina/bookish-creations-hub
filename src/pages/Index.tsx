/**
 * Index.tsx — Etusivu / Landing Page
 * 
 * Projektin pääsivu, joka esittelee "Arojen Tarina" -maailman kolme kokemusta:
 * 1. Romaani (historiallis-fantastinen trilogia)
 * 2. Lautapeli (fyysinen strategiapeli 2–5 pelaajalle)
 * 3. Digipeli (selainpohjainen digitaalinen versio)
 * 
 * Sisältää hero-osion, teemabannerin ja kolme posterityylistä linkkikorttia.
 */
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ComicPanel } from "@/components/ComicPanel";
import { Button } from "@/components/ui/button";
import { BookOpen, Gamepad2, Swords, Map, Crown, Scroll } from "lucide-react";
import comicArt from "@/assets/comic-panel.png";
import gameBoardMap from "@/assets/game-board-map.png";

const Index = () => {
  return (
    <Layout>
      {/* Hero Section — Cinematic Poster */}
      <section className="relative min-h-[95vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={comicArt} alt="Sarjakuvataide" className="w-full h-full object-cover opacity-15" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
        </div>

        <div className="container mx-auto px-4 z-10 text-center">
          <div className="max-w-4xl mx-auto">
            <p className="font-body text-sm uppercase tracking-[0.4em] text-primary/80 mb-4 animate-fade-in">
              Eeppinen trilogia &bull; Strategiapeli &bull; Digitaalinen kokemus
            </p>
            <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-bold text-foreground mb-6 animate-fade-in leading-[0.9]">
              Arojen<br />Tarina
            </h1>
            <p
              className="text-lg md:text-xl text-muted-foreground mb-10 font-body leading-relaxed max-w-2xl mx-auto animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              Kunniasta, rakkaudesta ja arojen loputtomasta horisontista — mongolisotureista kertova eeppinen maailma romaanina, lautapelinä ja digitaalisena pelinä.
            </p>
            <div className="flex flex-wrap justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <Button asChild size="lg" className="font-display uppercase tracking-wide text-base px-8">
                <Link to="/romaani">Lue Romaani</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="font-display uppercase tracking-wide text-base px-8">
                <Link to="/esittely">Tutustu Peliin</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Teemat — Elokuvamainen nauha */}
      <section className="py-16 bg-primary/5 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto text-center">
            <div>
              <span className="text-3xl mb-2 block">⚔️</span>
              <h3 className="font-display text-sm md:text-base font-semibold uppercase tracking-wide">Kunnia & Resilienssi</h3>
            </div>
            <div>
              <span className="text-3xl mb-2 block">❤️</span>
              <h3 className="font-display text-sm md:text-base font-semibold uppercase tracking-wide">Kielletty Rakkaus</h3>
            </div>
            <div>
              <span className="text-3xl mb-2 block">🦌</span>
              <h3 className="font-display text-sm md:text-base font-semibold uppercase tracking-wide">Mytologia & Shamanismi</h3>
            </div>
          </div>
        </div>
      </section>

      {/* POSTER-osio: Lautapeli + Digipeli + Esittely yhdessä */}
      <section className="py-20 relative overflow-hidden">
        {/* Tausta: pelilautakartta */}
        <div className="absolute inset-0 z-0">
          <img src={gameBoardMap} alt="Pelilauta" className="w-full h-full object-cover opacity-[0.07]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-14">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Yksi Maailma, Kolme Kokemusta
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Sama eeppinen tarina — koettavissa romaanina, fyysisellä pelilaudalla tai digitaalisena strategiapelinä.
            </p>
          </div>

          {/* Kolme korttia posterityylillä */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto mb-12">
            {/* Lautapeli */}
            <Link to="/lautapeli" className="group relative">
              <div className="relative bg-card/80 backdrop-blur-sm border-2 border-primary/20 rounded-xl overflow-hidden transition-all duration-300 group-hover:border-primary/60 group-hover:shadow-[0_0_40px_-10px_hsl(var(--primary)/0.3)] h-full">
                <div className="aspect-[3/4] relative overflow-hidden">
                  <img src={gameBoardMap} alt="Lautapeli" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Map className="w-5 h-5 text-primary" />
                    <span className="font-body text-xs uppercase tracking-widest text-primary/80">Fyysinen peli</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-2">Lautapeli</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Strateginen lautapeli 2–5 pelaajalle. Hallitse arojen fraktioita, käy diplomatiaa ja valloita provinsseja heksaruudukolla.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">2–5 pelaajaa</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">60–120 min</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">Strategia</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Pelin Esittely — keskellä, korostettu */}
            <Link to="/esittely" className="group relative md:-mt-4 md:mb-4">
              <div className="relative bg-card/90 backdrop-blur-sm border-2 border-accent/30 rounded-xl overflow-hidden transition-all duration-300 group-hover:border-accent/60 group-hover:shadow-[0_0_40px_-10px_hsl(var(--accent)/0.4)] h-full ring-1 ring-accent/10">
                <div className="absolute top-3 right-3 z-10">
                  <span className="text-[10px] px-3 py-1 rounded-full bg-accent/20 text-accent border border-accent/30 font-semibold uppercase tracking-wider">Tutustu</span>
                </div>
                <div className="aspect-[3/4] relative overflow-hidden">
                  <img src={comicArt} alt="Pelin esittely" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-5 h-5 text-accent" />
                    <span className="font-body text-xs uppercase tracking-widest text-accent/80">Visuaalinen esittely</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-2">Pelin Esittely</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Tutustu pelikortteihin, fraktioihin ja pelimaailman tunnelmaan interaktiivisen esittelyn kautta.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">Kortit</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">Fraktiot</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">3D-kuvat</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Digipeli */}
            <Link to="/digipeli" className="group relative">
              <div className="relative bg-card/80 backdrop-blur-sm border-2 border-primary/20 rounded-xl overflow-hidden transition-all duration-300 group-hover:border-primary/60 group-hover:shadow-[0_0_40px_-10px_hsl(var(--primary)/0.3)] h-full">
                <div className="aspect-[3/4] relative overflow-hidden bg-gradient-to-br from-primary/20 via-background to-accent/20 flex items-center justify-center">
                  <Gamepad2 className="w-24 h-24 text-primary/30" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Gamepad2 className="w-5 h-5 text-primary" />
                    <span className="font-body text-xs uppercase tracking-widest text-primary/80">Digitaalinen</span>
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-2">Digipeli</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    Pelaa lautapelin digitaalista versiota — provinssien hallintaa, taisteluja ja diplomatiaa selaimessa.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">Selainpeli</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">Yksinpeli</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">Tekoäly</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Romaani-kutsu */}
          <div className="max-w-3xl mx-auto text-center mt-16">
            <Scroll className="w-10 h-10 text-primary/50 mx-auto mb-4" />
            <h3 className="font-display text-2xl md:text-3xl font-bold mb-3">Tarina alkaa romaanista</h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Lue historiallis-fantastinen eeppinen trilogia, joka vie sinut 1200-luvun Mongolian aroille.
            </p>
            <Button asChild size="lg" variant="outline" className="font-display uppercase tracking-wide">
              <Link to="/romaani">Tutustu Romaaniin</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;

/**
 * GameIntroduction.tsx — Pelin yleiskuvaus ja johdanto
 *
 * Kertoo mikä "Mongolien Valtakunta" on, pelin tavoite,
 * ainutlaatuiset piirteet ja historiallinen tausta (vuosi 1206).
 */
import { ComicPanel } from "@/components/ComicPanel";
import { Scroll, Target, Sparkles, Globe } from "lucide-react";

export const GameIntroduction = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
              <Scroll className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-primary">Pelisuunnitteludokumentti v1.0</span>
            </div>
            <h2 className="font-display text-3xl font-bold mb-4">
              Pelin Yleiskuvaus
            </h2>
          </div>
          
          <ComicPanel className="mb-8">
            <div className="flex items-start gap-4">
              <Globe className="w-12 h-12 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-display text-xl font-bold mb-3">Mikä on Mongolien Valtakunta?</h3>
                <p className="text-muted-foreground mb-4">
                  <strong>Mongolien Valtakunta</strong> on syvällinen strategialautapeli, joka sijoittuu 1200-luvun Aasiaan — 
                  aikakauteen, jolloin Genghis Khan ja hänen seuraajansa rakensivat historian suurimman maavallan. 
                  Pelaajat johtavat yhtä neljästä suurvallasta kamppaillessaan Aasian herruudesta.
                </p>
                <p className="text-muted-foreground">
                  Peli yhdistää ainutlaatuisella tavalla <span className="text-primary font-medium">sotilaallisen valloituksen</span>, {" "}
                  <span className="text-primary font-medium">diplomaattisen intriigin</span>, {" "}
                  <span className="text-primary font-medium">taloudellisen kilpailun</span> ja {" "}
                  <span className="text-primary font-medium">teknologisen edistyksen</span>. 
                  Toisin kuin monet pelit, Mongolien Valtakunta ei palkitse pelkästään aggressiota — 
                  viisas diplomaatti tai taitava hallitsija voi voittaa myös ilman suuria armeijoita.
                </p>
              </div>
            </div>
          </ComicPanel>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <ComicPanel variant="primary">
              <Target className="w-8 h-8 text-primary mb-3" />
              <h4 className="font-display font-bold mb-2">Pelin Tavoite</h4>
              <p className="text-sm text-muted-foreground">
                Saavuta voitto yhdellä neljästä tiestä: sotilaallinen ylivalta, taloudellinen hegemonia, 
                kulttuurinen vaikutusvalta tai teknologinen johtoasema. Jokainen pelaaja valitsee oman strategiansa, 
                mutta joutuu sopeutumaan vastustajien liikkeisiin ja satunnaisten tapahtumien yllätyksiin.
              </p>
            </ComicPanel>
            
            <ComicPanel variant="primary">
              <Sparkles className="w-8 h-8 text-primary mb-3" />
              <h4 className="font-display font-bold mb-2">Mikä Tekee Pelistä Ainutlaatuisen?</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• <strong>Asymmetriset heimot</strong> — jokainen pelaa eri säännöillä</li>
                <li>• <strong>Dynaaminen diplomatia</strong> — liitot, petokset, verenvihamekaniikat</li>
                <li>• <strong>Historialliset tapahtumat</strong> — aidot käännekohdat 1200-luvulta</li>
                <li>• <strong>Moniulotteinen voitto</strong> — ei yhtä "oikeaa" strategiaa</li>
              </ul>
            </ComicPanel>
          </div>
          
          <div className="bg-card border-2 border-border rounded-sm p-6">
            <h4 className="font-display font-bold text-center mb-4">Historiallinen Tausta</h4>
            <p className="text-sm text-muted-foreground text-center max-w-2xl mx-auto">
              Vuonna 1206 Temüjin yhdisti Mongolian heimot ja sai nimen <strong>Genghis Khan</strong> — 
              "Universaalinen Hallitsija". Seuraavien vuosikymmenten aikana mongolit valloittivat 
              Kiinasta Persiaan, Venäjälle ja Lähi-itään ulottuvan valtakunnan. Tämä peli 
              antaa pelaajien kokea tuon eeppisen aikakauden strategiset haasteet ja mahdollisuudet.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

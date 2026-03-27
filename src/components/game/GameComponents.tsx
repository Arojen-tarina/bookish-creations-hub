/**
 * GameComponents.tsx — Pelin osat ja materiaalit
 *
 * Listaa kaikki fyysiset peliosat:
 * - Heimopalat (5 yksikkötyyppiä, 4 väriä)
 * - 180 korttia (strategia, diplomatia, teknologia, resurssi)
 * - Muut osat (nopat, voittopistemerkit, Silkkitie-tokenit, linnoitukset)
 */
import { ComicPanel } from "@/components/ComicPanel";
import { Swords, Shield, Crown, Package, Dices, MapPin, Castle } from "lucide-react";

const unitTypes = [
  { icon: Swords, name: "Ratsuväkiyksikkö", count: "20/väri", desc: "Nopeat hyökkäysjoukot" },
  { icon: Shield, name: "Jalkaväkiyksikkö", count: "15/väri", desc: "Puolustus ja piirittäminen" },
  { icon: Crown, name: "Kaaninpalvelija", count: "8/väri", desc: "Hallinto ja veronkeruu" },
  { icon: Package, name: "Tiedustelija", count: "6/väri", desc: "Vakoilu ja tiedustelu" },
  { icon: Crown, name: "Heimopäällikkö", count: "1/väri", desc: "Johtajahahmo (kriittinen!)" },
];

const cardTypes = [
  { name: "Strategiakortit", count: 60, desc: "Erikoistaktiikat ja historialliset tapahtumat" },
  { name: "Diplomatiakortit", count: 40, desc: "Liittolaisuudet, sopimukset, häät" },
  { name: "Teknologiakortit", count: 30, desc: "Sotatekniikat, hallinnolliset innovaatiot" },
  { name: "Resurssikortit", count: 50, desc: "Hevoset, kulta, käsityöläiset, ruoka" },
];

const otherComponents = [
  { icon: Dices, name: "Erikoisnopat", desc: "6 kpl D6 modifioiduilla symboleilla" },
  { icon: Crown, name: "Voittopistemerkit", desc: "100 kpl neutraalia markkeria" },
  { icon: MapPin, name: "Silkkitie-tokenit", desc: "20 kpl, sijoitettavissa Silkkitien varteen" },
  { icon: Castle, name: "Linnoitusmerkit", desc: "30 kpl, provinssien vahvistamiseen" },
];

export const GameComponents = () => {
  return (
    <section className="py-16 bg-primary/5">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-3xl font-bold text-center mb-12">
          Pelin Osat ja Materiaalit
        </h2>
        
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Heimopalat */}
          <div>
            <h3 className="font-display text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm">1</span>
              Heimopalat (4 väriä)
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unitTypes.map((unit) => (
                <ComicPanel key={unit.name} className="flex items-start gap-3">
                  <unit.icon className="w-8 h-8 text-primary flex-shrink-0" />
                  <div>
                    <h4 className="font-display font-semibold">{unit.name}</h4>
                    <p className="text-xs text-accent font-medium">{unit.count}</p>
                    <p className="text-sm text-muted-foreground">{unit.desc}</p>
                  </div>
                </ComicPanel>
              ))}
            </div>
          </div>
          
          {/* Kortit */}
          <div>
            <h3 className="font-display text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm">2</span>
              Kortit (180 kpl)
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {cardTypes.map((card) => (
                <div key={card.name} className="p-4 bg-card border-2 border-border rounded-sm flex items-center gap-4">
                  <span className="text-2xl font-display font-bold text-primary">{card.count}</span>
                  <div>
                    <h4 className="font-display font-semibold">{card.name}</h4>
                    <p className="text-sm text-muted-foreground">{card.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Muut osat */}
          <div>
            <h3 className="font-display text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm">3</span>
              Muut Peliosat
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {otherComponents.map((comp) => (
                <ComicPanel key={comp.name} className="text-center">
                  <comp.icon className="w-8 h-8 text-accent mx-auto mb-2" />
                  <h4 className="font-display font-semibold text-sm">{comp.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{comp.desc}</p>
                </ComicPanel>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

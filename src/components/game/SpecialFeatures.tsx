/**
 * SpecialFeatures.tsx — Erityispiirteet
 *
 * Sisältää:
 * - Heimopäällikön kehityspolut (soturi, diplomaatti, kulttuurivaikuttaja)
 * - Sääefektit ja sesongit (talvi, kesä, sateet, kuivuus)
 * - Historialliset tapahtumat (Genghis Khan, Silkkitie, Mustasurma jne.)
 */
import { ComicPanel } from "@/components/ComicPanel";
import { Crown, Cloud, ScrollText, Swords, Handshake, Lightbulb } from "lucide-react";

const leaderPaths = [
  { icon: Swords, name: "Soturijohtaja", bonus: "Bonukset taistelussa ja armeijan liikkeessä" },
  { icon: Handshake, name: "Diplomaatti-hallitsija", bonus: "Edut sopimuksissa ja veronkeruussa" },
  { icon: Lightbulb, name: "Kulttuurin vaikuttaja", bonus: "Teknologian ja rakennusten kehitysbonus" },
];

const weatherEffects = [
  { season: "Talvi", effect: "Rajoittaa liikkumista tietyillä alueilla", emoji: "❄️" },
  { season: "Kesä", effect: "Steppiheimot saavat liikkumisbonuksen", emoji: "☀️" },
  { season: "Sateet/tulvat", effect: "Vaikuttavat huoltoreitteihin ja liikkumiseen", emoji: "🌧️" },
  { season: "Kuivuus", effect: "Vähentää ruoantuotantoa", emoji: "🏜️" },
];

const historicalEvents = [
  "Genghis Khanin yhdistäminen",
  "Silkkitien avaaminen",
  "Mustasurma",
  "Bagdadin valtaaminen",
  "Eurooppahyökkäykset",
];

export const SpecialFeatures = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-3xl font-bold text-center mb-12">
          Erityispiirteet
        </h2>
        
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Heimopäällikön kehitys */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Crown className="w-8 h-8 text-primary" />
              <h3 className="font-display text-xl font-bold">Heimopäällikön Kehitys</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Pelin aikana heimopäälliköt voivat kehittyä kolmeen suuntaan:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              {leaderPaths.map((path) => (
                <ComicPanel key={path.name} className="text-center">
                  <path.icon className="w-10 h-10 text-accent mx-auto mb-3" />
                  <h4 className="font-display font-bold">{path.name}</h4>
                  <p className="text-sm text-muted-foreground mt-2">{path.bonus}</p>
                </ComicPanel>
              ))}
            </div>
          </div>
          
          {/* Sääefektit */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Cloud className="w-8 h-8 text-primary" />
              <h3 className="font-display text-xl font-bold">Sääefektit ja Sesongit</h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {weatherEffects.map((weather) => (
                <div key={weather.season} className="p-4 bg-secondary/50 rounded-sm border border-border text-center">
                  <span className="text-3xl block mb-2">{weather.emoji}</span>
                  <h4 className="font-display font-semibold">{weather.season}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{weather.effect}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Historialliset tapahtumat */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <ScrollText className="w-8 h-8 text-primary" />
              <h3 className="font-display text-xl font-bold">Historialliset Tapahtumat</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Erityiset tapahtumakortit tuovat peliin historiallista syvyyttä:
            </p>
            <div className="flex flex-wrap gap-3">
              {historicalEvents.map((event, index) => (
                <div
                  key={event}
                  className="flex items-center gap-3 px-4 py-3 bg-card border-2 border-border rounded-sm"
                >
                  <span className="font-display text-xl font-bold text-primary/30">
                    {index + 1}
                  </span>
                  <span className="font-body">{event}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * DetailedFactions.tsx — Heimojen yksityiskohtainen kuvaus
 *
 * Renderöi 4 heimon (mongoli, Kiina, Persia, Venäjä) täydet tiedot.
 * Data tulee erillisestä src/data/factions.ts -tiedostosta.
 */
import { ComicPanel } from "@/components/ComicPanel";
import { AlertTriangle } from "lucide-react";
import { detailedFactions } from "@/data/factions";

export const DetailedFactions = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-3xl font-bold text-center mb-4">
          Heimot ja Faktiot — Yksityiskohtainen Kuvaus
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Jokainen heimo tarjoaa ainutlaatuisen pelikokemuksen erilaisine vahvuuksineen ja heikkouksineen
        </p>
        
        <div className="max-w-6xl mx-auto space-y-8">
          {detailedFactions.map((faction) => (
            <ComicPanel 
              key={faction.name} 
              className={`relative overflow-hidden border-l-4 ${faction.borderColor}`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 ${faction.color} opacity-5 rounded-full -translate-y-8 translate-x-8`} />
              
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Vasen kolumni - Yleiskuvaus */}
                <div>
                  <div className={`inline-block px-3 py-1 ${faction.color} text-white text-xs rounded-full mb-3`}>
                    {faction.subtitle}
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-3">{faction.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{faction.description}</p>
                  
                  <div className="bg-secondary/50 p-3 rounded-sm">
                    <p className="text-xs font-semibold text-accent mb-1">PELITYYLI:</p>
                    <p className="text-sm text-muted-foreground italic">{faction.playstyle}</p>
                  </div>
                </div>
                
                {/* Keskimmäinen kolumni - Vahvuudet & Heikkous */}
                <div>
                  <h4 className="font-display font-bold text-sm text-primary mb-3">VAHVUUDET:</h4>
                  <ul className="space-y-2 mb-4">
                    {faction.strengths.map((strength, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <strength.icon className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{strength.text}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-sm">
                    <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-destructive mb-1">HEIKKOUS:</p>
                      <p className="text-sm text-muted-foreground">{faction.weakness}</p>
                    </div>
                  </div>
                </div>
                
                {/* Oikea kolumni - Erikoiskyky & Aloitus */}
                <div>
                  <div className={`p-3 ${faction.color}/10 border border-${faction.color}/20 rounded-sm mb-4`}>
                    <p className="text-xs font-semibold text-accent mb-1">ERIKOISKYKY:</p>
                    <h4 className="font-display font-bold text-sm mb-1">{faction.specialAbility.name}</h4>
                    <p className="text-xs text-muted-foreground">{faction.specialAbility.description}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">ALKUASETELMA:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {faction.startSetup.units.map((unit, i) => (
                        <li key={i}>• {unit}</li>
                      ))}
                      <li className="mt-2">📦 {faction.startSetup.resources}</li>
                      <li>📍 {faction.startSetup.territory}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </ComicPanel>
          ))}
        </div>
      </div>
    </section>
  );
};

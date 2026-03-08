/**
 * GameMechanics.tsx — Vuoromekaniikan esittely
 * 
 * Staattinen esittelysivu, joka selittää lautapelin neljä vuorovaihetta:
 * 1. Suunnitteluvaihe (Kurultai-kokous) — korttien nosto ja taktiikan valinta
 * 2. Toimintavaihe — liikkuminen, hyökkäys, rakentaminen ja kauppa
 * 3. Hallintovaihe — resurssien keräys ja ylläpitokustannukset
 * 4. Tapahtumavaihe — satunnaiset tapahtumakorttien vaikutukset
 * 
 * Käytetään lautapelin sääntösivulla (/lautapeli).
 */
import { ComicPanel } from "@/components/ComicPanel";
import { ScrollText, Swords, Building, Sparkles } from "lucide-react";

const phases = [
  {
    icon: ScrollText,
    name: "1. Suunnitteluvaihe",
    subtitle: "Kurultai-kokous",
    actions: [
      "Vedä uusia kortteja (strategia-, diplomatia- tai teknologiakortteja)",
      "Valitse käytettävät taktiikkakortit kyseiselle vuorolle",
      "Määritä vuoron pääpainopiste: Valloitus, Kauppa tai Diplomatia",
    ],
  },
  {
    icon: Swords,
    name: "2. Toimintavaihe",
    subtitle: "Pääasialliset toiminnot",
    actions: [
      "Liikkuminen: Siirrä yksiköitä (ratsuväki 3 aluetta, jalkaväki 2 aluetta)",
      "Hyökkääminen: Hyökkää vihollisen alueille",
      "Rakentaminen: Pystytä linnoituksia tai kauppareittejä",
      "Kaupankäynti: Vaihda resursseja muiden pelaajien kanssa",
    ],
  },
  {
    icon: Building,
    name: "3. Hallintovaihe",
    subtitle: "Resurssien hallinta",
    actions: [
      "Kerää resursseja hallitsemistasi alueista",
      "Maksa armeijan ylläpitokustannukset",
      "Toteuta diplomatiakorttien vaikutukset",
    ],
  },
  {
    icon: Sparkles,
    name: "4. Tapahtumavaihe",
    subtitle: "Satunnaiset tapahtumat",
    actions: [
      "Vedä satunnainen tapahtumakortti",
      "Sovella sen vaikutukset kaikkiin pelaajiin",
    ],
  },
];

export const GameMechanics = () => {
  return (
    <section className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-3xl font-bold text-center mb-4">
          Vuoromekaniikka
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Jokainen vuoro koostuu neljästä vaiheesta
        </p>
        
        <div className="max-w-4xl mx-auto space-y-6">
          {phases.map((phase, index) => (
            <ComicPanel key={phase.name} className="relative">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                  <phase.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-lg font-bold">{phase.name}</h3>
                  <p className="text-sm text-accent font-medium mb-3">{phase.subtitle}</p>
                  <ul className="space-y-2">
                    {phase.actions.map((action, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              {index < phases.length - 1 && (
                <div className="absolute -bottom-3 left-6 w-0.5 h-6 bg-border" />
              )}
            </ComicPanel>
          ))}
        </div>
      </div>
    </section>
  );
};

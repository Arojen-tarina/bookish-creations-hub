import { ComicPanel } from "@/components/ComicPanel";
import { Trophy, Coins, Users, Lightbulb } from "lucide-react";

const victoryTypes = [
  {
    icon: Trophy,
    name: "Sotilaallinen Voitto",
    title: "Maailmanvalloittaja",
    color: "bg-red-500",
    conditions: [
      "Hallitse 60% pelilaudan kaupungeista",
      "Eliminoi vähintään kaksi muuta heimopäällikköä",
      "Säilytä hallinto vähintään 3 vuoroa",
    ],
  },
  {
    icon: Coins,
    name: "Ekonominen Voitto",
    title: "Silkkitien Herra",
    color: "bg-amber-500",
    conditions: [
      "Kerää 50 voittopistettä kaupankäynnistä ja tributtimaksuista",
      "Hallitse vähintään 5 merkittävää kauppareittiä",
      "Säilytä taloudellinen hegemonia 2 vuoroa",
    ],
  },
  {
    icon: Users,
    name: "Kulttuurinen Voitto",
    title: "Kansojen Yhdistäjä",
    color: "bg-blue-500",
    conditions: [
      "Solmi diplomatiasopimus jokaisen muun elävän pelaajan kanssa",
      "Rakenna vähintään 8 kulttuurirakennusta (moskeijoita, kirjastoja, palatseja)",
      "Toteuta 5 erikoista \"kulttuurievoluutio\"-korttia",
    ],
  },
  {
    icon: Lightbulb,
    name: "Teknologinen Voitto",
    title: "Innovaattorien Keisari",
    color: "bg-green-500",
    conditions: [
      "Kehitä ja ota käyttöön 12 erilaista teknologiakorttia",
      "Rakenna vähintään 6 \"edistynyttä linnoitusta\"",
      "Säilytä teknologinen etumatka 3 vuoroa",
    ],
  },
];

export const VictoryConditions = () => {
  return (
    <section className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-3xl font-bold text-center mb-4">
          Voittoehdot
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Neljä erilaista tietä voittoon — valitse strategiasi viisaasti
        </p>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {victoryTypes.map((victory) => (
            <ComicPanel key={victory.name} className="relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-1 ${victory.color}`} />
              <div className="flex items-start gap-4 pt-2">
                <div className={`w-12 h-12 ${victory.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <victory.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wide text-accent font-semibold">
                    {victory.name}
                  </span>
                  <h3 className="font-display text-lg font-bold mt-1">
                    "{victory.title}"
                  </h3>
                  <ul className="mt-3 space-y-2">
                    {victory.conditions.map((condition, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary">✓</span>
                        {condition}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </ComicPanel>
          ))}
        </div>
      </div>
    </section>
  );
};

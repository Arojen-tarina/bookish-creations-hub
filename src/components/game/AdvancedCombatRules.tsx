/**
 * AdvancedCombatRules.tsx — Laajennetut taistelussäännöt
 *
 * Esittää lautapelin edistyneet taistelumekaniikat:
 * - Taistelumodifikaattorit (maasto, ylivoima, johtajat)
 * - Piiritysjärjestelmän vaiheet
 * - Vetäytymissäännöt yksikkötyypeittäin
 * - Tuhoaminen, ryöstäminen ja erikoisyksiköt
 */
import { ComicPanel } from "@/components/ComicPanel";
import { Swords, Shield, Target, Flame, Timer, TrendingUp } from "lucide-react";

const combatModifiers = [
  { condition: "Hyökkääjän ratsuväki avoimessa maastossa", modifier: "+2", type: "positive" },
  { condition: "Puolustaja linnoitetussa kaupungissa", modifier: "+3", type: "positive" },
  { condition: "Hyökkäys vuoristoon", modifier: "-2", type: "negative" },
  { condition: "Hyökkäys talvella (ei-venäläiset)", modifier: "-1", type: "negative" },
  { condition: "Heimopäällikkö läsnä", modifier: "+1", type: "positive" },
  { condition: "Ylivoima (2:1 tai enemmän)", modifier: "+1", type: "positive" },
  { condition: "Huoltoreittien katkeaminen", modifier: "-1", type: "negative" },
];

const siegePhases = [
  { phase: "Piiritysvalmistelut", duration: "1 vuoro", description: "Armeija asettuu piiritysasemiin, rakentaa leirinsä" },
  { phase: "Muurien pommitus", duration: "1-3 vuoroa", description: "Heitetään noppaa joka vuoro, 5-6 tekee vahinkoa linnoitukselle" },
  { phase: "Rynnäkkö", duration: "1 vuoro", description: "Kun linnoitus on heikentynyt, voi yrittää rynnäkköä" },
  { phase: "Antautuminen", duration: "-", description: "Puolustaja voi antautua missä vaiheessa tahansa" },
];

const retreatRules = [
  { unit: "Ratsuväki", rule: "Voi vetäytyä ennen taistelun ratkaisua (mongoli-heimo: ilman tappiota)" },
  { unit: "Jalkaväki", rule: "Vetäytyminen aiheuttaa 1 ylimääräisen tappion" },
  { unit: "Heimopäällikkö", rule: "Voi paeta vaikka armeija tuhoutuisi (50% todennäköisyys)" },
];

export const AdvancedCombatRules = () => {
  return (
    <section className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-3xl font-bold text-center mb-12">
          Laajennetut Taistelussäännöt
        </h2>
        
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Taistelumodifikaattorit */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-8 h-8 text-primary" />
              <h3 className="font-display text-xl font-bold">Taistelumodifikaattorit</h3>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {combatModifiers.map((mod, i) => (
                <div 
                  key={i} 
                  className={`p-3 rounded-sm border-2 flex items-center justify-between ${
                    mod.type === 'positive' 
                      ? 'bg-green-500/5 border-green-500/20' 
                      : 'bg-red-500/5 border-red-500/20'
                  }`}
                >
                  <span className="text-sm text-muted-foreground">{mod.condition}</span>
                  <span className={`font-display font-bold ${
                    mod.type === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {mod.modifier}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Piiritysjärjestelmä */}
          <div className="grid lg:grid-cols-2 gap-8">
            <ComicPanel variant="primary">
              <div className="flex items-center gap-3 mb-4">
                <Timer className="w-8 h-8 text-primary" />
                <h3 className="font-display text-xl font-bold">Piiritysjärjestelmä</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Linnoitettujen kaupunkien valtaaminen vaatii piiritystä — ei suoraa rynnäkköä.
              </p>
              <div className="space-y-3">
                {siegePhases.map((phase, i) => (
                  <div key={i} className="flex items-start gap-3 p-2 bg-secondary/50 rounded-sm">
                    <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs flex-shrink-0">
                      {i + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-semibold text-sm">{phase.phase}</span>
                        <span className="text-xs text-accent">({phase.duration})</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{phase.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ComicPanel>
            
            <div className="space-y-6">
              <ComicPanel>
                <div className="flex items-center gap-3 mb-3">
                  <Shield className="w-6 h-6 text-accent" />
                  <h4 className="font-display font-bold">Vetäytymissäännöt</h4>
                </div>
                <div className="space-y-2">
                  {retreatRules.map((rule, i) => (
                    <div key={i} className="text-sm">
                      <span className="font-semibold text-primary">{rule.unit}:</span>{" "}
                      <span className="text-muted-foreground">{rule.rule}</span>
                    </div>
                  ))}
                </div>
              </ComicPanel>
              
              <ComicPanel>
                <div className="flex items-center gap-3 mb-3">
                  <Flame className="w-6 h-6 text-destructive" />
                  <h4 className="font-display font-bold">Tuhoaminen ja Ryöstäminen</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• <strong>Ryöstäminen:</strong> Vallatusta kaupungista voi ottaa kaikki resurssit (+2 kultaa, +1 muu resurssi)</li>
                  <li>• <strong>Polttaminen:</strong> Voi tuhota kaupungin (estää muita hyödyntämästä, mutta -2 diplomatiapistettä)</li>
                  <li>• <strong>Kansanmurha:</strong> Poistaa kaupungin kartalta pysyvästi (äärimmäinen rangaistus diplomatiassa)</li>
                </ul>
              </ComicPanel>
              
              <ComicPanel>
                <div className="flex items-center gap-3 mb-3">
                  <Target className="w-6 h-6 text-accent" />
                  <h4 className="font-display font-bold">Erikoisyksiköiden Taistelukyvyt</h4>
                </div>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• <strong>Jousiampujat:</strong> Voivat hyökätä viereiselle alueelle ilman liikkumista</li>
                  <li>• <strong>Raskasratsuväki:</strong> Ensimmäinen isku +2, mutta hitaampi liike</li>
                  <li>• <strong>Piirityskoneet:</strong> Välttämättömät linnoitusten kaatamiseen</li>
                </ul>
              </ComicPanel>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

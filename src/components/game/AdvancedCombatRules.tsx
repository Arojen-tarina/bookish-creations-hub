/**
 * AdvancedCombatRules.tsx — Laajennetut taistelussäännöt
 *
 * Renderöi edistyneet taistelumekaniikat.
 * Data tulee erillisestä src/data/combatRules.ts -tiedostosta.
 */
import { ComicPanel } from "@/components/ComicPanel";
import { Shield, Target, Flame, Timer, TrendingUp } from "lucide-react";
import { combatModifiers, siegePhases, retreatRules } from "@/data/combatRules";

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

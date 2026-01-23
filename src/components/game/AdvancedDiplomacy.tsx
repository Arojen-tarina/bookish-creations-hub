import { ComicPanel } from "@/components/ComicPanel";
import { Handshake, Heart, Coins, Skull, AlertTriangle, Scale, Crown, Users } from "lucide-react";

const treatyTypes = [
  {
    icon: Handshake,
    name: "Rauhansopimus",
    duration: "3 vuoroa",
    effect: "Osapuolet eivät voi hyökätä toisiaan vastaan",
    breakPenalty: "Petturimerkki, -3 diplomatiapistettä",
    color: "bg-green-500"
  },
  {
    icon: Coins,
    name: "Kauppasopimus",
    duration: "5 vuoroa",
    effect: "Molemmat saavat +1 kultaa per vuoro",
    breakPenalty: "Menettää kaikki kauppaedut välittömästi",
    color: "bg-amber-500"
  },
  {
    icon: Heart,
    name: "Dynastinen Liitto",
    duration: "Pysyvä",
    effect: "Ei voi hyökätä, jaettu puolustus, perimysoikeudet",
    breakPenalty: "Verenvihan julistus, kaikki pelaajat vihollisia",
    color: "bg-pink-500"
  },
  {
    icon: Crown,
    name: "Vasallisuhde",
    duration: "Kunnes purjetaan",
    effect: "Vasalli maksaa tributin (2 resurssia/vuoro), saa suojelun",
    breakPenalty: "Vasallin tulee voittaa taistelu vapautuakseen",
    color: "bg-purple-500"
  },
];

const diplomaticActions = [
  { action: "Lähettiläs", cost: "1 kauppias", effect: "Avaa neuvottelut, +1 diplomatiapiste kyseisen pelaajan kanssa" },
  { action: "Lahja", cost: "3 resurssia", effect: "+2 diplomatiapistettä, mahdollistaa sopimusneuvottelut" },
  { action: "Uhkavaatimus", cost: "Vähintään 2:1 sotilasylivoima", effect: "Pakottaa vastustajan valitsemaan: tributti tai sota" },
  { action: "Salamurha", cost: "1 strategiakortti + 5 kultaa", effect: "50% mahdollisuus eliminoida vastustajan johtohahmo" },
];

const bloodFeudRules = [
  "Verenvihaa ei voi lopettaa ilman sopimuskorttia",
  "Vihollisen alueiden valloitus antaa +1 voittopiste",
  "Muut pelaajat eivät voi liittoutua kummankaan kanssa (paitsi jos itsekin sodassa)",
  "Verenvihan aiheuttaja saa -2 diplomatiaa kaikkien muidenkin kanssa"
];

export const AdvancedDiplomacy = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-3xl font-bold text-center mb-4">
          Diplomatia — Täydet Säännöt
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Diplomatiajärjestelmä mahdollistaa syvälliset neuvottelut, liitot ja petokset
        </p>
        
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Sopimustyypit */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Scale className="w-8 h-8 text-primary" />
              <h3 className="font-display text-xl font-bold">Sopimustyypit</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {treatyTypes.map((treaty) => (
                <ComicPanel key={treaty.name} className="relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1 h-full ${treaty.color}`} />
                  <div className="pl-4">
                    <div className="flex items-center gap-3 mb-3">
                      <treaty.icon className="w-8 h-8 text-primary" />
                      <div>
                        <h4 className="font-display font-bold">{treaty.name}</h4>
                        <span className="text-xs text-accent">Kesto: {treaty.duration}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{treaty.effect}</p>
                    <div className="flex items-start gap-2 p-2 bg-destructive/10 rounded-sm">
                      <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground">
                        <span className="font-semibold">Rikkominen:</span> {treaty.breakPenalty}
                      </p>
                    </div>
                  </div>
                </ComicPanel>
              ))}
            </div>
          </div>
          
          {/* Diplomaattiset toiminnot */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-8 h-8 text-primary" />
              <h3 className="font-display text-xl font-bold">Diplomaattiset Toiminnot</h3>
            </div>
            <div className="bg-card border-2 border-border rounded-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50">
                  <tr>
                    <th className="text-left p-3 font-display font-bold">Toiminto</th>
                    <th className="text-left p-3 font-display font-bold">Hinta</th>
                    <th className="text-left p-3 font-display font-bold">Vaikutus</th>
                  </tr>
                </thead>
                <tbody>
                  {diplomaticActions.map((action, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="p-3 font-semibold text-primary">{action.action}</td>
                      <td className="p-3 text-muted-foreground">{action.cost}</td>
                      <td className="p-3 text-muted-foreground">{action.effect}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Verenvihajärjestelmä */}
          <ComicPanel variant="accent">
            <div className="flex items-start gap-4">
              <Skull className="w-12 h-12 text-destructive flex-shrink-0" />
              <div>
                <h3 className="font-display text-xl font-bold mb-3">Verenvihajärjestelmä</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Kun pelaaja rikkoo dynastisen liiton tai murhaa toisen pelaajan heimopäällikön, 
                  syntyy <strong className="text-destructive">Verenviha</strong> — pysyvä vihollisuus, 
                  jota ei voi ratkaista diplomatialla.
                </p>
                <ul className="space-y-2">
                  {bloodFeudRules.map((rule, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-destructive">⚔</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </ComicPanel>
        </div>
      </div>
    </section>
  );
};

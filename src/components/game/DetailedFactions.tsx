import { ComicPanel } from "@/components/ComicPanel";
import { Sword, Shield, Coins, Sparkles, AlertTriangle, Users, Zap, Crown } from "lucide-react";

const detailedFactions = [
  {
    name: "Mongoli-heimo",
    color: "bg-amber-500",
    borderColor: "border-amber-500",
    subtitle: "Stepin Herrat",
    description: "Nopealiikkeinen valloitusvoima, joka hallitsee avointa maastoa ja ratsusotataitoa.",
    strengths: [
      { icon: Zap, text: "Ratsuväki liikkuu +1 alueen pidemmälle" },
      { icon: Sword, text: "+1 hyökkäysbonus avoimessa maastossa" },
      { icon: Shield, text: "Voi vetäytyä taistelusta ilman rangaistusta" },
      { icon: Users, text: "Aloittaa ylimääräisellä ratsuväkiyksiköllä" },
    ],
    weakness: "Heikompi puolustus linnoituksissa ja kaupungeissa (-1 puolustus)",
    specialAbility: {
      name: "Khuriltai-kokous",
      description: "Kerran pelissä voi kutsua kaikki mongoli-yksiköt yhteen alueeseen ilmaiseksi liikkumisena."
    },
    startSetup: {
      units: ["4 ratsuväkiyksikköä", "2 jalkaväkiyksikköä", "1 heimopäällikkö", "2 kauppiasta"],
      resources: "8 resurssikorttia (painotus hevosiin)",
      territory: "Mongolian keskustasangot (3 aluetta)"
    },
    playstyle: "Aggressiivinen, nopea laajentuminen, häirintätaktiikat"
  },
  {
    name: "Kiinan Dynastia",
    color: "bg-red-600",
    borderColor: "border-red-600",
    subtitle: "Lohikäärmeen Valtakunta",
    description: "Puolustuksellinen supervalta, joka luottaa linnoituksiin, teknologiaan ja taloudelliseen voimaan.",
    strengths: [
      { icon: Shield, text: "+2 puolustus linnoitetuissa kaupungeissa" },
      { icon: Sparkles, text: "Aloittaa yhdellä teknologiakortilla" },
      { icon: Coins, text: "Kaupungit tuottavat +1 kultaa per vuoro" },
      { icon: Crown, text: "Voi rakentaa Suuren Muurin -erikoislinnoituksen" },
    ],
    weakness: "Ratsuväki liikkuu -1 alueen vähemmän (raskas varustus)",
    specialAbility: {
      name: "Ruutikeksintö",
      description: "Kerran pelissä voi tuhota vihollisen linnoituksen automaattisesti piirityksessä."
    },
    startSetup: {
      units: ["2 ratsuväkiyksikköä", "4 jalkaväkiyksikköä", "1 heimopäällikkö", "2 kauppiasta"],
      resources: "6 resurssikorttia + 1 teknologiakortti",
      territory: "Pohjois-Kiinan linnoitetut kaupungit (2 aluetta)"
    },
    playstyle: "Puolustuksellinen, teknologiapainotteinen, taloudellinen kasvu"
  },
  {
    name: "Persialainen Valtakunta",
    color: "bg-cyan-600",
    borderColor: "border-cyan-600",
    subtitle: "Silkkitien Kuningas",
    description: "Kaupallinen mahti, joka hallitsee diplomatiaa ja taloudellisia verkostoja Keski-Aasiassa.",
    strengths: [
      { icon: Coins, text: "Kauppasopimusten arvo kaksinkertainen" },
      { icon: Users, text: "+1 diplomatiakortti pelin alussa" },
      { icon: Sparkles, text: "Voi solmia 2 liittosopimusta samanaikaisesti" },
      { icon: Crown, text: "Kauppareitit tuottavat bonusresursseja" },
    ],
    weakness: "Pienempi aloitusarmeija (-1 jalkaväkiyksikkö)",
    specialAbility: {
      name: "Silkkitien Monopoli",
      description: "Kerran pelissä voi sulkea yhden kauppareitin muilta pelaajilta 3 vuoroksi."
    },
    startSetup: {
      units: ["3 ratsuväkiyksikköä", "1 jalkaväkiyksikkö", "1 heimopäällikkö", "3 kauppiasta"],
      resources: "5 resurssikorttia + 2 diplomatiakorttia",
      territory: "Samarkand ja Bukhara (2 kaupunkia)"
    },
    playstyle: "Diplomaattinen, kaupallinen, liittolaisverkostot"
  },
  {
    name: "Venäläiset Ruhtinaskunnat",
    color: "bg-green-600",
    borderColor: "border-green-600",
    subtitle: "Pohjoisen Karhut",
    description: "Sitkeä puolustaja, joka hyödyntää karua maastoa ja talven voimaa.",
    strengths: [
      { icon: Shield, text: "Talvella +2 puolustusbonus" },
      { icon: Sword, text: "Metsäalueilla +1 hyökkäys ja puolustus" },
      { icon: Users, text: "Jalkaväki on halvempaa rekrytoida (−1 resurssi)" },
      { icon: Sparkles, text: "Immuuni 'talvikatastrofi'-tapahtumakorteille" },
    ],
    weakness: "Hitaampi liikkuminen kesällä (−1 ratsuväen liike)",
    specialAbility: {
      name: "Poltetun Maan Taktiikka",
      description: "Voi tuhota oman alueensa resurssit estääkseen vihollisen hyödyntämisen."
    },
    startSetup: {
      units: ["2 ratsuväkiyksikköä", "4 jalkaväkiyksikköä", "1 heimopäällikkö", "1 kauppias"],
      resources: "7 resurssikorttia (painotus ruokaan)",
      territory: "Novgorod ja Vladimir (2 ruhtinaskuntaa)"
    },
    playstyle: "Puolustuksellinen, partisaanisotataktiikka, resurssien säästö"
  },
];

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

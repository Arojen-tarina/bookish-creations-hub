import { ComicPanel } from "@/components/ComicPanel";
import { Swords, TrendingUp, Users } from "lucide-react";

const strategies = [
  {
    icon: Swords,
    name: "Aggressiivinen Valloitus",
    desc: "Nopea sotilastoiminta ja vihollisten murskaaminen",
    pros: ["Nopea alueenlaajuus", "Suora tie sotilaalliseen voittoon"],
    cons: ["Korkeat resurssikustannukset", "Diplomaattiset seuraukset"],
  },
  {
    icon: TrendingUp,
    name: "Ekonominen Hegemonia",
    desc: "Kauppareittien hallinta ja vaurauden kasaaminen",
    pros: ["Vakaa resurssitulo", "Diplomaattinen vaikutusvalta"],
    cons: ["Haavoittuvainen hyökkäyksille", "Vaatii aikaa"],
  },
  {
    icon: Users,
    name: "Diplomaattinen Manipulaatio",
    desc: "Liittolaisten käyttäminen ja vastustajien eristäminen",
    pros: ["Vähäinen resurssien kulutus", "Joustavuus"],
    cons: ["Riippuvuus muista", "Petturimerkkien riski"],
  },
];

export const StrategicConsiderations = () => {
  return (
    <section className="py-16 bg-primary/5">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-3xl font-bold text-center mb-4">
          Strategisia Näkökohtia
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Peli tasapainottaa kolme päätaktiikkaa — valitse viisaasti ja mukaudu tilanteeseen
        </p>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {strategies.map((strategy) => (
            <ComicPanel key={strategy.name}>
              <div className="flex items-center gap-3 mb-4">
                <strategy.icon className="w-8 h-8 text-primary" />
                <h3 className="font-display font-bold">{strategy.name}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{strategy.desc}</p>
              
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-semibold text-green-600 mb-1">Edut:</p>
                  <ul className="text-muted-foreground space-y-1">
                    {strategy.pros.map((pro, i) => (
                      <li key={i}>+ {pro}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-red-600 mb-1">Haitat:</p>
                  <ul className="text-muted-foreground space-y-1">
                    {strategy.cons.map((con, i) => (
                      <li key={i}>- {con}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </ComicPanel>
          ))}
        </div>
        
        <div className="mt-12 max-w-3xl mx-auto text-center">
          <ComicPanel className="bg-secondary/50">
            <p className="text-muted-foreground">
              Pelaajien on tasapainoteltava lyhyen ja pitkän aikavälin tavoitteita, 
              ja mukauduttava nopeasti muuttuviin olosuhteisiin. Pelin syvyys ja 
              monipuolisuus tekevät jokaisesta pelikerrasta ainutlaatuisen, kun 
              pelaajat kamppailevat keskenään Aasian herruudesta mongoliajan hengessä.
            </p>
          </ComicPanel>
        </div>
      </div>
    </section>
  );
};

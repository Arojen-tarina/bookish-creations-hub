/**
 * ExpansionIdeas.tsx — Laajennusideat
 *
 * Esittelee 4 suurta laajennusta (Eurooppa, Silkkitie, dynastia, kulttuuri)
 * ja 4 mini-laajennusta (komentajat, katastrofit, salatehtävät, soolo).
 */
import { ComicPanel } from "@/components/ComicPanel";
import { Puzzle, Globe, Anchor, BookOpen, Sparkles } from "lucide-react";

const expansions = [
  {
    icon: Globe,
    name: "Lännen Valloitus",
    subtitle: "Laajennus Eurooppaan",
    description: "Lisää pelilautaan Puolan, Unkarin ja Pyhän Rooman keisarikunnan alueet. Uudet heimot: Teutoniritarit ja Unkarin kuningaskunta.",
    contents: [
      "Laajennettu pelilauta (40x60 cm lisäosa)",
      "2 uutta heimoa erikoiskykyineen",
      "25 uutta strategiakorttia",
      "15 historiallista tapahtumakorttia",
      "Uusi voittotapa: Euroopan Valloittaja"
    ]
  },
  {
    icon: Anchor,
    name: "Silkkitien Herrat",
    subtitle: "Kauppalaajennus",
    description: "Syvennä taloudellista peliä uusilla kauppamekaniikoilla, karavaanieilla ja merireiteillä. Intian ja Kiinan merikauppa avautuu.",
    contents: [
      "Merireittilaatta-järjestelmä",
      "30 kauppakorttia erikoishyödykkeineen",
      "Karavaaninjohtaja-yksiköt",
      "Kauppaportti-linnoitukset",
      "Monopoli- ja hintamanipulaatiomekaniikat"
    ]
  },
  {
    icon: BookOpen,
    name: "Khanien Perintö",
    subtitle: "Dynastialaajennus",
    description: "Tuo peliin sukupolvien välinen kamppailu. Heimopäälliköt vanhenevat, perilliset kilpailevat vallasta, ja dynastiset liitot muuttavat diplomatiaa.",
    contents: [
      "Perimysjärjestelmä ja suksessiokortit",
      "Perillishahmot (3 per heimo)",
      "Palatsiintrigikortit",
      "Dynastiset liittokuningattaret",
      "Sisällissota-mekaniikat"
    ]
  },
  {
    icon: Sparkles,
    name: "Kulttuurin Kulta-aika",
    subtitle: "Kulttuurilaajennus",
    description: "Keskity kulttuuriseen kilpailuun, uskonnon levittämiseen ja tieteelliseen edistymiseen. Uudet voittotavat ja rakennukset.",
    contents: [
      "Uskontojärjestelmä (3 uskontoa)",
      "Tiedeakatemiat ja kirjastot",
      "20 kulttuurikorttia",
      "Monumenttirakentaminen",
      "Uskonnollinen käännytysmekanismi"
    ]
  },
];

const miniExpansions = [
  {
    name: "Legendaariset Komentajat",
    description: "12 historiallista komentajakorttia erikoiskyvyillä (Subutai, Jebe, Möngke...)"
  },
  {
    name: "Luonnonkatastrofit",
    description: "15 uutta tapahtumakorttia: maanjäristykset, kulkutaudit, tulvat"
  },
  {
    name: "Salaiset Tehtävät",
    description: "Henkilökohtaiset tavoitekortit joka pelaajalle pelin alussa"
  },
  {
    name: "Soololaajennus",
    description: "Tekoälysäännöt 1 pelaajan peliä varten"
  },
];

export const ExpansionIdeas = () => {
  return (
    <section className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Puzzle className="w-10 h-10 text-primary" />
          <h2 className="font-display text-3xl font-bold text-center">
            Laajennusideat
          </h2>
        </div>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Suunniteltuja laajennuksia jotka syventävät pelikokemusta ja tuovat uusia strategioita
        </p>
        
        <div className="max-w-6xl mx-auto">
          {/* Suuret laajennukset */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {expansions.map((exp) => (
              <ComicPanel key={exp.name} className="relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary to-accent" />
                <div className="pt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <exp.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold">{exp.name}</h3>
                      <p className="text-xs text-accent font-medium">{exp.subtitle}</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">{exp.description}</p>
                  
                  <div className="border-t border-border pt-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">SISÄLTÖ:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {exp.contents.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </ComicPanel>
            ))}
          </div>
          
          {/* Mini-laajennukset */}
          <div>
            <h3 className="font-display text-xl font-bold text-center mb-6">
              Mini-laajennukset
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {miniExpansions.map((mini) => (
                <div key={mini.name} className="p-4 bg-card border-2 border-border rounded-sm">
                  <h4 className="font-display font-semibold text-sm mb-2">{mini.name}</h4>
                  <p className="text-xs text-muted-foreground">{mini.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * VisualMockups.tsx — Visuaaliset mock-up -tarpeet
 *
 * Listaa 6 mock-up -kategoriaa (pelilauta, korttitaide, miniatyyrit,
 * heimosymbolit, sääntökirja, pakkaus) spekseineen ja suunnitteluohjeet
 * (väripaletti, typografia, kuvitustyyli).
 */
import { ComicPanel } from "@/components/ComicPanel";
import { Image, Palette, Layers, FileText, Map, CreditCard } from "lucide-react";

const mockupNeeds = [
  {
    icon: Map,
    name: "Pelilauta",
    priority: "Kriittinen",
    priorityColor: "bg-red-500",
    description: "Aasian kartta heksakenttänä",
    specs: [
      "Koko: 60x80 cm taitettava lauta",
      "Maastotyypit selkeästi eroteltuna väreillä",
      "Pääkaupungit omilla symboleillaan",
      "Silkkitie korostettuna viivana",
      "Alueiden nimet sekä latinaksi että mongoliksi"
    ],
    style: "Historiallinen karttaestetiikka, pergamenttitekstuuri, vanhat kartografiaelementit"
  },
  {
    icon: CreditCard,
    name: "Korttien Taide",
    priority: "Kriittinen",
    priorityColor: "bg-red-500",
    description: "180 kortin kuvitukset",
    specs: [
      "Strategiakortit: Sotakohtaukset ja taktiikat",
      "Diplomatiakortit: Neuvottelut ja seremoniat",
      "Teknologiakortit: Keksinnöt ja innovaatiot",
      "Resurssikortit: Eläimet, materiaalit, hyödykkeet"
    ],
    style: "Mongolilais-persialainen miniatyyrityyli, kullan ja sinisen korostus"
  },
  {
    icon: Layers,
    name: "Yksiköminiatyyrit",
    priority: "Korkea",
    priorityColor: "bg-amber-500",
    description: "3D-mallinnukset tuotantoa varten",
    specs: [
      "Ratsuväki: Mongolijousiampuja hevosen selässä",
      "Jalkaväki: Keihäsmies kilpineen",
      "Heimopäällikkö: Korotettu figuuri valtikkoineen",
      "Tiedustelija: Vakooja viitassaan"
    ],
    style: "Historiallisesti tarkat asut ja varusteet, 28mm mittakaava"
  },
  {
    icon: Palette,
    name: "Heimojen Värit & Symbolit",
    priority: "Korkea",
    priorityColor: "bg-amber-500",
    description: "Graafinen identiteetti per heimo",
    specs: [
      "Mongoli-heimo: Kultainen susi sinisellä pohjalla",
      "Kiinan dynastia: Punainen lohikäärme kultakoristein",
      "Persialainen valtakunta: Turkoosi leijona auringolla",
      "Venäläiset ruhtinaat: Vihreä kaksipäinen kotka"
    ],
    style: "Heraldinen tyyli, selkeät siluetit, printattavuus huomioitu"
  },
  {
    icon: FileText,
    name: "Sääntökirja",
    priority: "Keskitaso",
    priorityColor: "bg-blue-500",
    description: "Visuaalinen sääntödokumentti",
    specs: [
      "Kansi: Temaattinen kuvitusteos",
      "Esimerkkikuvat vuoronkulusta",
      "Taistelutaulukko-infografiikat",
      "QR-koodit opetusvideoihin"
    ],
    style: "Moderni layout historiallisella twistillä, helppolukuinen fontti"
  },
  {
    icon: Image,
    name: "Pakkauksen Taide",
    priority: "Keskitaso",
    priorityColor: "bg-blue-500",
    description: "Laatikon kansi ja sivut",
    specs: [
      "Etukansi: Genghis Khan johtamassa armeijaansa",
      "Takakansi: Pelin esittely, komponenttikuva, pelaajatiedot",
      "Sivut: Heimojen symbolit ja pelin nimi"
    ],
    style: "Eeppinen fantasiataide, kultafolioyksityiskohdat, premium-tuntuma"
  },
];

const designGuidelines = [
  {
    title: "Väripaletti",
    items: [
      "Päävärit: Kulta (#D4AF37), Tummansininen (#1E3A5F)",
      "Maastot: Vihreä (steppi), Keltainen (autiomaa), Ruskea (vuoristo)",
      "Heimovärit: Keltainen, Punainen, Turkoosi, Vihreä"
    ]
  },
  {
    title: "Typografia",
    items: [
      "Otsikot: Historiallinen serif (Cinzel, Trajan Pro)",
      "Leipäteksti: Selkeä sans-serif (Open Sans, Lato)",
      "Korttitekstit: Kompakti ja luettava"
    ]
  },
  {
    title: "Kuvitustyyli",
    items: [
      "Inspiraatio: Persialainen miniatyyri, kiinalainen tuschimaalaus",
      "Värimaailma: Lämmin, maanläheinen, kullan korostukset",
      "Yksityiskohdat: Historialliset aseet, asut, arkkitehtuuri"
    ]
  },
];

export const VisualMockups = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-3xl font-bold text-center mb-4">
          Visuaaliset Mock-up -tarpeet
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Yksityiskohtainen lista tarvittavista visuaalisista elementeistä ja niiden spesifikaatioista
        </p>
        
        <div className="max-w-6xl mx-auto">
          {/* Mock-up tarpeet */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {mockupNeeds.map((mockup) => (
              <ComicPanel key={mockup.name} className="relative">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <mockup.icon className="w-8 h-8 text-primary" />
                    <h3 className="font-display font-bold">{mockup.name}</h3>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full text-white ${mockup.priorityColor}`}>
                    {mockup.priority}
                  </span>
                </div>
                
                <p className="text-sm text-accent font-medium mb-3">{mockup.description}</p>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1">SPEKSIT:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {mockup.specs.map((spec, i) => (
                        <li key={i}>• {spec}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="pt-3 border-t border-border">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">TYYLI:</p>
                    <p className="text-xs text-muted-foreground italic">{mockup.style}</p>
                  </div>
                </div>
              </ComicPanel>
            ))}
          </div>
          
          {/* Design Guidelines */}
          <div className="bg-card border-2 border-border rounded-sm p-6">
            <h3 className="font-display text-xl font-bold mb-6 text-center">
              Suunnitteluohjeet
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              {designGuidelines.map((guide) => (
                <div key={guide.title}>
                  <h4 className="font-display font-semibold text-primary mb-3">{guide.title}</h4>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    {guide.items.map((item, i) => (
                      <li key={i}>• {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

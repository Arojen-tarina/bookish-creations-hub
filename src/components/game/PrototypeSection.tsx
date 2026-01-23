import { ComicPanel } from "@/components/ComicPanel";
import { Link } from "react-router-dom";
import { Printer, Download, FileText, CreditCard, Package, Dices, Map } from "lucide-react";
import { Button } from "@/components/ui/button";

const printableItems = [
  {
    icon: FileText,
    name: "Sääntökirja",
    description: "10-sivuinen täydellinen sääntödokumentti aloittelijoille ja kokeneille pelaajille",
    pages: "10 sivua"
  },
  {
    icon: CreditCard,
    name: "Strategiakortit",
    description: "60 korttia taistelutaktiikoille, erikoisliikkeille ja historiallisille tapahtumille",
    pages: "7 sivua"
  },
  {
    icon: CreditCard,
    name: "Diplomatiakortit", 
    description: "40 korttia sopimuksille, liittolaisuuksille ja diplomaattisille toimille",
    pages: "5 sivua"
  },
  {
    icon: CreditCard,
    name: "Teknologiakortit",
    description: "30 korttia sotateknologialle, hallinnolle ja kulttuurisille innovaatioille",
    pages: "4 sivua"
  },
  {
    icon: Package,
    name: "Resurssikortit",
    description: "50 korttia hevosille, kullalle, ruoalle, käsityöläisille ja karjalle",
    pages: "6 sivua"
  },
];

export const PrototypeSection = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
            <Printer className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">Tulostettava Prototyyppi</span>
          </div>
          <h2 className="font-display text-3xl font-bold mb-4">
            Pelaa Kotona — Tulosta ja Leikkaa
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Valmis tulostettava prototyyppi sisältäen kaikki 180 pelikorttia ja täydellisen sääntökirjan. 
            Tulosta A4-paperille, leikkaa kortit ja aloita pelaaminen!
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-8">
          {printableItems.map((item) => (
            <ComicPanel key={item.name} className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-bold">{item.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                <span className="text-xs text-accent font-medium">{item.pages}</span>
              </div>
            </ComicPanel>
          ))}
          
          {/* Yhteenveto */}
          <ComicPanel variant="accent" className="flex flex-col justify-center text-center">
            <p className="text-4xl font-display font-bold text-primary mb-2">180</p>
            <p className="text-sm font-medium">korttia yhteensä</p>
            <p className="text-xs text-muted-foreground mt-2">~32 A4-sivua tulostettavana</p>
          </ComicPanel>
        </div>

        <div className="text-center">
          <Link to="/tulosta">
            <Button size="lg" className="gap-2">
              <Download className="w-5 h-5" />
              Avaa Tulostettavat Materiaalit
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground mt-4">
            Suosittelemme tulostamaan 200g/m² paperille parempaa korttituntumaa varten
          </p>
        </div>

        {/* Ohjeet */}
        <div className="mt-12 max-w-3xl mx-auto">
          <h3 className="font-display text-xl font-bold text-center mb-6">
            Tulostusohje
          </h3>
          <div className="grid md:grid-cols-4 gap-4 text-center text-sm">
            <div className="p-4 bg-card border rounded-lg">
              <span className="text-2xl mb-2 block">1️⃣</span>
              <p className="font-medium">Tulosta</p>
              <p className="text-xs text-muted-foreground">A4, väri, 100% mittakaava</p>
            </div>
            <div className="p-4 bg-card border rounded-lg">
              <span className="text-2xl mb-2 block">2️⃣</span>
              <p className="font-medium">Leikkaa</p>
              <p className="text-xs text-muted-foreground">Viivoja pitkin saksilla</p>
            </div>
            <div className="p-4 bg-card border rounded-lg">
              <span className="text-2xl mb-2 block">3️⃣</span>
              <p className="font-medium">Suojaa</p>
              <p className="text-xs text-muted-foreground">Korttitaskuihin tai laminoi</p>
            </div>
            <div className="p-4 bg-card border rounded-lg">
              <span className="text-2xl mb-2 block">4️⃣</span>
              <p className="font-medium">Pelaa!</p>
              <p className="text-xs text-muted-foreground">Kutsu ystävät koolle</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

import { Layout } from "@/components/Layout";
import { ComicPanel } from "@/components/ComicPanel";
import { Trophy, Coins, Users, Lightbulb } from "lucide-react";
import comicArt from "@/assets/comic-panel.png";

const victoryTypes = [
  {
    icon: Trophy,
    name: "Sotilaallinen Voitto",
    title: "Maailmanvalloittaja",
    description: "Hallitse laajinta aluetta ja voita vastustajien armeijat.",
  },
  {
    icon: Coins,
    name: "Ekonominen Voitto",
    title: "Silkkitien Herra",
    description: "Hallitse kauppareittejä ja kerää suurin vauraus.",
  },
  {
    icon: Users,
    name: "Kulttuurinen Voitto",
    title: "Kansojen Yhdistäjä",
    description: "Yhdistä kansat kulttuurievoluution kautta.",
  },
  {
    icon: Lightbulb,
    name: "Teknologinen Voitto",
    title: "Innovaattorien Keisari",
    description: "Kehitä edistynein teknologia ja linnoitukset.",
  },
];

const Lautapeli = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Lautapeli
            </h1>
            <p className="text-xl text-muted-foreground">
              Strateginen lautapeli Aasian stepiltä — hallitse arojen, valloita
              kaupparetit ja johda kansasi voittoon.
            </p>
          </div>
        </div>
      </section>

      {/* Game Board Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <ComicPanel className="p-0 overflow-hidden">
              <img
                src={comicArt}
                alt="Lautapelin konseptitaide"
                className="w-full h-auto"
              />
            </ComicPanel>
            <div>
              <h2 className="font-display text-3xl font-bold mb-6">
                Aasian Steppi ja Sen Ympäristö
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Pelilauta kuvaa Aasian arojen laajoja maisemia — vuoristoja,
                  jokia, kaupunkeja ja kauppareittejä.
                </p>
                <p>
                  Sarjakuvamaiset kuvat ja konsepti perustuvat mongolisotureihin,
                  arojen maisemiin ja historiallisiin tapahtumiin.
                </p>
              </div>

              <div className="mt-8 p-4 bg-secondary/50 rounded-sm border-2 border-border">
                <h3 className="font-display font-semibold mb-2">Alkusetup</h3>
                <p className="text-sm text-muted-foreground">
                  Jokainen pelaaja sijoittaa kotialueelleen aloitusresurssit ja
                  ensimmäiset yksiköt.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Victory Conditions */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center mb-12">
            Voittoehdot
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {victoryTypes.map((victory) => (
              <ComicPanel key={victory.name} className="text-center">
                <victory.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                <span className="text-xs uppercase tracking-wide text-accent font-semibold">
                  {victory.name}
                </span>
                <h3 className="font-display text-lg font-bold mt-1 mb-2">
                  "{victory.title}"
                </h3>
                <p className="text-muted-foreground text-sm">
                  {victory.description}
                </p>
              </ComicPanel>
            ))}
          </div>
        </div>
      </section>

      {/* Factions */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-center mb-12">
              Faktiot ja Vastavoimat
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <ComicPanel variant="primary">
                <h3 className="font-display text-lg font-semibold mb-3">
                  Protagonistien Ratsuväki
                </h3>
                <p className="text-muted-foreground text-sm">
                  Protagonistien heimo hyödyntää liikkuvuutta ja komposiittijousia
                  tehokkaassa ratsuväessä, mikä antaa taktista etua.
                </p>
              </ComicPanel>

              <ComicPanel variant="accent">
                <h3 className="font-display text-lg font-semibold mb-3">
                  Antagonistien Jalkaväki
                </h3>
                <p className="text-muted-foreground text-sm">
                  Antagonistit luottavat vahvaan jalkaväkeen ja linnoituksiin
                  keihäineen ja kilpimuurein puolustaakseen aluettaan.
                </p>
              </ComicPanel>

              <ComicPanel>
                <h3 className="font-display text-lg font-semibold mb-3">
                  Teknologiset Innovaatiot
                </h3>
                <p className="text-muted-foreground text-sm">
                  Rakentajat ja varsijousiheimot käyttävät katapultteja ja
                  varsijousia, jotka muuttavat taisteluiden dynamiikkaa.
                </p>
              </ComicPanel>

              <ComicPanel>
                <h3 className="font-display text-lg font-semibold mb-3">
                  Ulkomaiden Valtiot
                </h3>
                <p className="text-muted-foreground text-sm">
                  Ulkomaiden valtiot edustavat tulen, metallin ja byrokratian
                  voimaa, mikä luo strategisia haasteita.
                </p>
              </ComicPanel>
            </div>
          </div>
        </div>
      </section>

      {/* Historical Events */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-center mb-12">
              Historialliset Tapahtumat
            </h2>

            <div className="space-y-4">
              {[
                "Genghis Khanin yhdistäminen",
                "Silkkitien avaaminen",
                "Mustasurma",
                "Bagdadin valtaaminen",
                "Eurooppahyökkäykset",
              ].map((event, index) => (
                <div
                  key={event}
                  className="flex items-center gap-4 p-4 bg-card border-2 border-border rounded-sm"
                >
                  <span className="font-display text-2xl font-bold text-primary/30">
                    {index + 1}
                  </span>
                  <span className="font-body">{event}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Lautapeli;

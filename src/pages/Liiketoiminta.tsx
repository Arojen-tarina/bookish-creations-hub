import { Layout } from "@/components/Layout";
import { ComicPanel } from "@/components/ComicPanel";
import { BookOpen, Gamepad2, Palette, Globe } from "lucide-react";

const Liiketoiminta = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Liiketoimintasuunnitelma
            </h1>
            <p className="text-xl text-muted-foreground">
              Kaupallinen strategia romaanille, lautapelille ja oheistuotteille.
            </p>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center mb-12">
            Tuotteet
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <ComicPanel className="text-center">
              <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-display text-lg font-semibold mb-2">
                Romaanit
              </h3>
              <p className="text-muted-foreground text-sm">
                Kolmen kirjan trilogia painettuna ja e-kirjana.
              </p>
            </ComicPanel>

            <ComicPanel className="text-center">
              <Gamepad2 className="w-12 h-12 text-accent mx-auto mb-4" />
              <h3 className="font-display text-lg font-semibold mb-2">
                Lautapeli
              </h3>
              <p className="text-muted-foreground text-sm">
                Strateginen lautapeli keräilylaatikossa.
              </p>
            </ComicPanel>

            <ComicPanel className="text-center">
              <Palette className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-display text-lg font-semibold mb-2">
                Taideteokset
              </h3>
              <p className="text-muted-foreground text-sm">
                Sarjakuvataideprintit ja konseptitaide.
              </p>
            </ComicPanel>

            <ComicPanel className="text-center">
              <Globe className="w-12 h-12 text-accent mx-auto mb-4" />
              <h3 className="font-display text-lg font-semibold mb-2">
                Digitaalinen
              </h3>
              <p className="text-muted-foreground text-sm">
                Äänikirjat ja digitaalinen peli.
              </p>
            </ComicPanel>
          </div>
        </div>
      </section>

      {/* Target Market */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-center mb-12">
              Kohdemarkkina
            </h2>

            <div className="space-y-6">
              <ComicPanel>
                <h3 className="font-display text-lg font-semibold mb-3">
                  Historiallisen Fiktion Lukijat
                </h3>
                <p className="text-muted-foreground text-sm">
                  Aikuiset lukijat, jotka nauttivat eeppisistä tarinoista,
                  historiallisista kulttuureiden kuvauksista ja mytologiasta.
                </p>
              </ComicPanel>

              <ComicPanel>
                <h3 className="font-display text-lg font-semibold mb-3">
                  Strategiapelaajat
                </h3>
                <p className="text-muted-foreground text-sm">
                  Lautapeliharrastajat, jotka arvostavat syvällistä strategiaa,
                  historiallista teemaa ja kaunista komponenttien laatua.
                </p>
              </ComicPanel>

              <ComicPanel>
                <h3 className="font-display text-lg font-semibold mb-3">
                  Taiteen Keräilijät
                </h3>
                <p className="text-muted-foreground text-sm">
                  Sarjakuva- ja fantasiataiteen ystävät, jotka arvostavat
                  alkuperäistä taidetta ja rajoitettuja painoksia.
                </p>
              </ComicPanel>
            </div>
          </div>
        </div>
      </section>

      {/* Revenue Streams */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-center mb-12">
              Tulovirrat
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <ComicPanel variant="primary">
                <span className="text-3xl font-display font-bold text-primary/30">1</span>
                <h3 className="font-display text-lg font-semibold mt-2 mb-2">
                  Kirjamyynti
                </h3>
                <ul className="text-muted-foreground text-sm space-y-1">
                  <li>• Painetut kirjat</li>
                  <li>• E-kirjat</li>
                  <li>• Äänikirjat</li>
                  <li>• Keräilyversiot</li>
                </ul>
              </ComicPanel>

              <ComicPanel variant="accent">
                <span className="text-3xl font-display font-bold text-accent/30">2</span>
                <h3 className="font-display text-lg font-semibold mt-2 mb-2">
                  Pelimyynti
                </h3>
                <ul className="text-muted-foreground text-sm space-y-1">
                  <li>• Lautapeli</li>
                  <li>• Laajennukset</li>
                  <li>• Digitaalinen versio</li>
                  <li>• Lisensointi</li>
                </ul>
              </ComicPanel>

              <ComicPanel>
                <span className="text-3xl font-display font-bold text-muted-foreground/30">3</span>
                <h3 className="font-display text-lg font-semibold mt-2 mb-2">
                  Oheistuotteet
                </h3>
                <ul className="text-muted-foreground text-sm space-y-1">
                  <li>• Taideprintit</li>
                  <li>• Hahmofiguurit</li>
                  <li>• Kartat ja julisteet</li>
                  <li>• Teemavaatteet</li>
                </ul>
              </ComicPanel>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-3xl font-bold text-center mb-12">
              Aikataulu
            </h2>

            <div className="space-y-4">
              {[
                { phase: "Vaihe 1", title: "Ensimmäisen kirjan julkaisu", time: "2026" },
                { phase: "Vaihe 2", title: "Lautapelin prototyyppi", time: "2026-2027" },
                { phase: "Vaihe 3", title: "Joukkorahoituskampanja", time: "2027" },
                { phase: "Vaihe 4", title: "Toisen kirjan julkaisu", time: "2027" },
                { phase: "Vaihe 5", title: "Lautapelin tuotanto", time: "2028" },
              ].map((item) => (
                <div
                  key={item.phase}
                  className="flex items-center gap-4 p-4 bg-card border-2 border-border rounded-sm"
                >
                  <span className="font-display text-sm font-semibold text-primary uppercase">
                    {item.phase}
                  </span>
                  <span className="flex-1 font-body">{item.title}</span>
                  <span className="text-muted-foreground text-sm">{item.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <ComicPanel className="max-w-2xl mx-auto text-center" variant="primary">
            <h2 className="font-display text-2xl font-bold mb-4">
              Kiinnostaako Yhteistyö?
            </h2>
            <p className="text-muted-foreground mb-6">
              Jos olet kiinnostunut kustannusyhteistyöstä, pelijulkaisusta tai
              muista liiketoimintamahdollisuuksista, ota yhteyttä.
            </p>
            <p className="font-display text-lg text-primary">
              Yhteystiedot tulossa pian
            </p>
          </ComicPanel>
        </div>
      </section>
    </Layout>
  );
};

export default Liiketoiminta;

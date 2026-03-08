/**
 * DocumentSummary.tsx — Pelisuunnitteludokumentin yhteenveto
 *
 * Listaa kaikki 13 dokumentin osiota ja niiden statuksen.
 * Näyttää seuraavat askeleet (mock-upit, testipelaus, prototyyppi, joukkorahoitus).
 */
import { ComicPanel } from "@/components/ComicPanel";
import { CheckCircle, FileText, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const documentSections = [
  { section: "1. Pelin yleiskuvaus", status: "Valmis", description: "Teema, pelaajamäärä, kesto, tavoitteet" },
  { section: "2. Pelilauta: Aasian Steppi", status: "Valmis", description: "7 aluetta, 6 maastotyyppiä, vaikutukset" },
  { section: "3. Pelin osat ja materiaalit", status: "Valmis", description: "180 korttia, 50+ miniatyyriä, erikoisosat" },
  { section: "4. Heimot ja faktiot", status: "Valmis", description: "4 asymmetristä heimoa täysine sääntöineen" },
  { section: "5. Vuoromekaniikka", status: "Valmis", description: "4-vaiheinen vuorojärjestelmä" },
  { section: "6. Taistelujärjestelmä", status: "Valmis", description: "Modifikaattorit, piiritus, vetäytyminen" },
  { section: "7. Resurssijärjestelmä", status: "Valmis", description: "5 resurssia, keruu, kulutus, vaihto" },
  { section: "8. Diplomatia", status: "Valmis", description: "Sopimukset, petokset, verenvihat" },
  { section: "9. Voittotavat", status: "Valmis", description: "4 erilaista voittotietä" },
  { section: "10. Erityissäännöt", status: "Valmis", description: "Sää, tapahtumat, johtajien kehitys" },
  { section: "11. Strategiset näkökulmat", status: "Valmis", description: "3 päästrategiaa edut/haitat" },
  { section: "12. Laajennusideat", status: "Valmis", description: "4 suurta + 4 mini-laajennusta" },
  { section: "13. Visuaaliset mock-up -tarpeet", status: "Valmis", description: "6 mock-up -kategoriaa spekseineen" },
];

export const DocumentSummary = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-secondary/30 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 rounded-full mb-4">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Dokumentti Valmis</span>
            </div>
            <h2 className="font-display text-3xl font-bold mb-4">
              Pelisuunnitteludokumentin Yhteenveto
            </h2>
            <p className="text-muted-foreground">
              Täydellinen dokumentaatio "Mongolien Valtakunta" -lautapelille
            </p>
          </div>
          
          <ComicPanel className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-8 h-8 text-primary" />
              <h3 className="font-display text-xl font-bold">Dokumentin Osiot</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {documentSections.map((doc) => (
                <div key={doc.section} className="flex items-start gap-3 p-3 bg-secondary/30 rounded-sm">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">{doc.section}</p>
                    <p className="text-xs text-muted-foreground">{doc.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </ComicPanel>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 bg-card border-2 border-border rounded-sm">
              <p className="text-4xl font-display font-bold text-primary mb-2">13</p>
              <p className="text-sm text-muted-foreground">Dokumentin osiota</p>
            </div>
            <div className="text-center p-6 bg-card border-2 border-border rounded-sm">
              <p className="text-4xl font-display font-bold text-primary mb-2">4</p>
              <p className="text-sm text-muted-foreground">Pelattavaa heimoa</p>
            </div>
            <div className="text-center p-6 bg-card border-2 border-border rounded-sm">
              <p className="text-4xl font-display font-bold text-primary mb-2">180+</p>
              <p className="text-sm text-muted-foreground">Pelikorttia</p>
            </div>
          </div>
          
          <div className="bg-primary/5 border-2 border-primary/20 rounded-sm p-6">
            <h4 className="font-display font-bold text-center mb-4">Seuraavat Askeleet</h4>
            <ol className="space-y-3 max-w-md mx-auto">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs flex-shrink-0">1</span>
                <span className="text-sm text-muted-foreground">Tilaa visuaaliset mock-upit graafikolta (ks. mock-up -osio)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs flex-shrink-0">2</span>
                <span className="text-sm text-muted-foreground">Testipelaa säännöt pienellä ryhmällä ja iteroi</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs flex-shrink-0">3</span>
                <span className="text-sm text-muted-foreground">Kehitä prototyyppi (paperiversio tai 3D-printit)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs flex-shrink-0">4</span>
                <span className="text-sm text-muted-foreground">Harkitse joukkorahoituskampanjaa (Kickstarter, Indiegogo)</span>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
};

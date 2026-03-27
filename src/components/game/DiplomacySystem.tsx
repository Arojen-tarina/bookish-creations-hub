/**
 * DiplomacySystem.tsx — Diplomatian yleiskatsaus
 *
 * Esittelee 4 diplomaattista sopimustyyppiä (liitto, verosopimus, tributti, dynastia)
 * ja petoksen/verenvihojen mekaniikat lyhyesti.
 */
import { ComicPanel } from "@/components/ComicPanel";
import { Handshake, Heart, Coins, AlertTriangle, Skull } from "lucide-react";

const diplomacyTypes = [
  { icon: Handshake, name: "Liittolaisuussopimukset", desc: "Yhteinen puolustus tai hyökkäys" },
  { icon: Coins, name: "Verosopimukset", desc: "Molemmat osapuolet hyötyvät taloudellisesti" },
  { icon: AlertTriangle, name: "Tributti", desc: "Heikompi maksaa veroja vahvemmalle" },
  { icon: Heart, name: "Dynastialiitot", desc: "Avioliitot, jotka luovat pysyviä suhteita" },
];

export const DiplomacySystem = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-3xl font-bold text-center mb-12">
          Diplomatia- ja Liittolaisuusjärjestelmä
        </h2>
        
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {diplomacyTypes.map((type) => (
              <ComicPanel key={type.name} className="text-center">
                <type.icon className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-display font-semibold">{type.name}</h3>
                <p className="text-sm text-muted-foreground mt-2">{type.desc}</p>
              </ComicPanel>
            ))}
          </div>
          
          <ComicPanel variant="accent" className="mt-8">
            <div className="flex items-start gap-4">
              <Skull className="w-10 h-10 text-destructive flex-shrink-0" />
              <div>
                <h3 className="font-display font-bold text-lg mb-2">Petokset ja Verenvihät</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• <strong>Petturimerkit:</strong> Liittolaisuuksien rikkominen antaa "petturi"-merkkejä</li>
                  <li>• <strong>Verenvihamerkit:</strong> Vaikuttavat tuleviin diplomaattisiin toimiin</li>
                  <li>• <strong>Dynamiikka:</strong> Liittojen suhteet muuttuvat jatkuvasti strategisen tilanteen mukaan</li>
                </ul>
              </div>
            </div>
          </ComicPanel>
        </div>
      </div>
    </section>
  );
};

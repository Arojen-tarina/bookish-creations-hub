/**
 * Factions.tsx — Heimojen yleiskatsaus
 *
 * Näyttää 4 heimon perustiedot: nimi, bonus ja alkuasetelma.
 * Tiivistetympi versio kuin DetailedFactions.
 */
import { ComicPanel } from "@/components/ComicPanel";

const factions = [
  {
    name: "Mongoli-heimo",
    color: "bg-amber-500",
    bonus: "Ratsuväen bonus, nopea liikkeelläolo",
    startUnits: ["3 ratsuväkiyksikköä", "2 jalkaväkiyksikköä", "1 heimopäällikkö"],
  },
  {
    name: "Kiinan dynastia",
    color: "bg-red-500",
    bonus: "Linnoitukset, teknologia-edistykset",
    startUnits: ["3 ratsuväkiyksikköä", "2 jalkaväkiyksikköä", "1 heimopäällikkö"],
  },
  {
    name: "Persialainen valtakunta",
    color: "bg-blue-500",
    bonus: "Kauppataidot, kulttuuriresurssit",
    startUnits: ["3 ratsuväkiyksikköä", "2 jalkaväkiyksikköä", "1 heimopäällikkö"],
  },
  {
    name: "Venäläiset ruhtinaskunnat",
    color: "bg-green-500",
    bonus: "Talvisotataktiikat, metsäresurssit",
    startUnits: ["3 ratsuväkiyksikköä", "2 jalkaväkiyksikköä", "1 heimopäällikkö"],
  },
];

export const Factions = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-3xl font-bold text-center mb-4">
          Heimot ja Faktiot
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Valitse heimosi ja hyödynnä sen ainutlaatuisia erikoisuuksia
        </p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {factions.map((faction) => (
            <ComicPanel key={faction.name} className="relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-2 ${faction.color}`} />
              <div className="pt-4">
                <h3 className="font-display text-lg font-bold mb-2">{faction.name}</h3>
                <p className="text-sm text-accent font-medium mb-4">{faction.bonus}</p>
                
                <div className="border-t border-border pt-3 mt-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">ALKUSETUP:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {faction.startUnits.map((unit, i) => (
                      <li key={i}>• {unit}</li>
                    ))}
                    <li>• 5 satunnaista resurssikorttia</li>
                    <li>• 2 strategiakorttia</li>
                  </ul>
                </div>
              </div>
            </ComicPanel>
          ))}
        </div>
      </div>
    </section>
  );
};

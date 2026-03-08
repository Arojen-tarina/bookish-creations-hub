/**
 * ResourceSystem.tsx — Resurssijärjestelmä
 *
 * Esittelee pelin 5 resurssia (hevoset, kulta, ruoka, käsityöläiset, karja)
 * ja niiden lähteet (steppialueet, viljelysalueet, kaupungit, kauppareitit).
 */
import { ComicPanel } from "@/components/ComicPanel";

const resources = [
  { emoji: "🐎", name: "Hevoset", use: "Ratsuväen rekrytointi", source: "Steppialueet" },
  { emoji: "🪙", name: "Kulta", use: "Kaupankäynti ja korruption maksaminen", source: "Kaupungit" },
  { emoji: "🌾", name: "Ruoka", use: "Armeijan ylläpito", source: "Viljelysalueet" },
  { emoji: "🛠️", name: "Käsityöläiset", use: "Teknologian kehitys ja rakentaminen", source: "Kaupungit" },
  { emoji: "🐄", name: "Karja", use: "Perustarpeet ja kaupankäynti", source: "Steppialueet" },
];

export const ResourceSystem = () => {
  return (
    <section className="py-16 bg-primary/5">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-3xl font-bold text-center mb-12">
          Resurssijärjestelmä
        </h2>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resources.map((resource) => (
              <ComicPanel key={resource.name} className="text-center">
                <span className="text-4xl mb-3 block">{resource.emoji}</span>
                <h3 className="font-display font-bold text-lg">{resource.name}</h3>
                <p className="text-sm text-muted-foreground mt-2">{resource.use}</p>
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-accent">Lähde: {resource.source}</p>
                </div>
              </ComicPanel>
            ))}
          </div>
          
          <div className="mt-8 p-6 bg-card border-2 border-border rounded-sm">
            <h3 className="font-display font-bold mb-4">Resurssilähteet</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div>• <strong>Steppialueet</strong> tuottavat hevosia ja karjaa</div>
              <div>• <strong>Viljelysalueet</strong> tuottavat ruokaa</div>
              <div>• <strong>Kaupungit</strong> tuottavat kultaa ja käsityöläisiä</div>
              <div>• <strong>Kauppareitit</strong> tuottavat sekalaisesti resursseja</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

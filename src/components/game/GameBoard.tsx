/**
 * GameBoard.tsx — Pelilaudan esittely
 * 
 * Staattinen esittelysivu, joka kuvaa lautapelin fyysistä pelilautaa:
 * - Seitsemän maantieteellistä aluetta (Mongoliasteppi, Gobi, Kiina jne.)
 * - Kuusi maastotyyppiä ja niiden pelimekaaniset vaikutukset
 * - Konseptitaide pelilaudasta
 * 
 * Käytetään lautapelin sääntösivulla (/lautapeli).
 */
import { ComicPanel } from "@/components/ComicPanel";
import { Mountain, TreePine, Waves, Building2, Wheat, Sun } from "lucide-react";
import comicArt from "@/assets/comic-panel.png";

const regions = [
  { name: "Mongoliasteppi", desc: "Laajat ruohomaat, pelin sydän. Useita heimojen asuinalueita." },
  { name: "Gobin autiomaa", desc: "Haastavaa maastoa, strategisia reittejä." },
  { name: "Kiinan valtakunta", desc: "Rikkaat ja linnoitetut kaupungit itärajalla." },
  { name: "Keski-Aasian kauppakeskukset", desc: "Silkkitien kaupunkivaltiot (Samarkand, Bukhara)." },
  { name: "Persianlahden alueet", desc: "Kulttuurikeskukset ja rikkaudet." },
  { name: "Venäjän metsät", desc: "Pohjoiset heimot ja kaupunkivaltiot." },
  { name: "Intian vuoristopassit", desc: "Etelän rikkaudet ja linnoitetut kaupungit." },
];

const terrainTypes = [
  { icon: Sun, name: "Steppialueet", effect: "Nopea ratsastus, karjanhoito" },
  { icon: Mountain, name: "Vuoristo", effect: "Hidas kulku, puolustusetu" },
  { icon: TreePine, name: "Metsät", effect: "Jalkaväen etu, puuvarannot" },
  { icon: Waves, name: "Autiomaa", effect: "Vaikea ylitys, kauppareitit" },
  { icon: Wheat, name: "Jokilaaksot", effect: "Viljelysmaita, kaupankäynti" },
  { icon: Building2, name: "Kaupunkivaltiot", effect: "Linnoitukset, käsityöläisyys" },
];

export const GameBoard = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-3xl font-bold text-center mb-12">
          Pelilauta: Aasian Steppi
        </h2>
        
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <ComicPanel className="p-0 overflow-hidden">
            <img
              src={comicArt}
              alt="Lautapelin konseptitaide"
              className="w-full h-auto"
            />
          </ComicPanel>
          
          <div className="space-y-8">
            <div>
              <h3 className="font-display text-xl font-bold mb-4">Alueellinen Jakautuminen</h3>
              <div className="space-y-2">
                {regions.map((region) => (
                  <div key={region.name} className="p-3 bg-secondary/50 rounded-sm border border-border">
                    <span className="font-semibold text-primary">{region.name}:</span>{" "}
                    <span className="text-muted-foreground text-sm">{region.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12">
          <h3 className="font-display text-xl font-bold text-center mb-6">Maastotyypit</h3>
          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
            {terrainTypes.map((terrain) => (
              <ComicPanel key={terrain.name} className="text-center p-4">
                <terrain.icon className="w-8 h-8 text-accent mx-auto mb-2" />
                <h4 className="font-display font-semibold text-sm">{terrain.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">{terrain.effect}</p>
              </ComicPanel>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

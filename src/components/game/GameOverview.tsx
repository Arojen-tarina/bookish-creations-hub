import { ComicPanel } from "@/components/ComicPanel";
import { Users, Clock, Target } from "lucide-react";

export const GameOverview = () => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
            Mongolien Valtakunta
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Epookillinen strategiapeli 2-4 pelaajalle, joka sijoittuu 1200-luvun 
            Mongoliaan ja sen ympärysmaihin.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <ComicPanel className="text-center">
              <Users className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="font-display font-bold">2-4 Pelaajaa</h3>
              <p className="text-sm text-muted-foreground">Johda mongoliheimoja tai naapurikansoja</p>
            </ComicPanel>
            
            <ComicPanel className="text-center">
              <Clock className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="font-display font-bold">3-5 Tuntia</h3>
              <p className="text-sm text-muted-foreground">Täysipainoinen strategiaelämys</p>
            </ComicPanel>
            
            <ComicPanel className="text-center">
              <Target className="w-10 h-10 text-primary mx-auto mb-3" />
              <h3 className="font-display font-bold">4 Voittotietä</h3>
              <p className="text-sm text-muted-foreground">Sotilaalliset, taloudelliset, kulttuuriset tai teknologiset</p>
            </ComicPanel>
          </div>
          
          <p className="text-muted-foreground mt-12 max-w-2xl mx-auto">
            Pelaajat yhdistävät sotilaalliset valloitukset, diplomaattisen neuvottelun 
            ja hallinnollisen kehityksen kamppailussaan Aasian herruudesta.
          </p>
        </div>
      </div>
    </section>
  );
};

/**
 * CombatSystem.tsx — Taistelujärjestelmän yleiskuvaus
 *
 * Esittää hyökkäysmekanismin 5 vaihetta ja erikoistaistelut:
 * kaupunkien piirittäminen, ratsuväen iskut ja linnoitusten valtaaminen.
 */
import { ComicPanel } from "@/components/ComicPanel";
import { Swords, Shield, Castle, Zap } from "lucide-react";

export const CombatSystem = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-3xl font-bold text-center mb-12">
          Taistelujärjestelmä
        </h2>
        
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Hyökkäysmekanismi */}
            <ComicPanel variant="primary">
              <div className="flex items-center gap-3 mb-4">
                <Swords className="w-8 h-8 text-primary" />
                <h3 className="font-display text-xl font-bold">Hyökkäysmekanismi</h3>
              </div>
              <ol className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs flex-shrink-0">1</span>
                  <span className="text-muted-foreground">Hyökkääjä ja puolustaja laskevat omat taisteluvoimansa</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs flex-shrink-0">2</span>
                  <span className="text-muted-foreground">Maastomodifikaattorit (-1 vuoristo puolustajalle, +1 steppi ratsuväelle)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs flex-shrink-0">3</span>
                  <span className="text-muted-foreground">Heitetään noppia (yksi per taisteluvoima, maksimi 6)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs flex-shrink-0">4</span>
                  <span className="text-muted-foreground">Osumia 4+ (modifioitu maastosta ja korteista)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs flex-shrink-0">5</span>
                  <span className="text-muted-foreground">Häviäjä vetäytyy tai menettää yksiköitä</span>
                </li>
              </ol>
            </ComicPanel>
            
            {/* Erikoistaistelut */}
            <div className="space-y-4">
              <ComicPanel>
                <div className="flex items-center gap-3 mb-2">
                  <Castle className="w-6 h-6 text-accent" />
                  <h4 className="font-display font-bold">Kaupunkien Piirittäminen</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Vaatii erityisiä strategiakortteja ja aikaa. Piirittäjän on varauduttava 
                  pitkään operaatioon resurssiensa puolesta.
                </p>
              </ComicPanel>
              
              <ComicPanel>
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-6 h-6 text-accent" />
                  <h4 className="font-display font-bold">Ratsuväen Iskut</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Nopeat hyökkäykset, jotka sallivat perääntymisen ilman rangaistusta. 
                  Ihanteellinen häirintätaktiikka.
                </p>
              </ComicPanel>
              
              <ComicPanel>
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-6 h-6 text-accent" />
                  <h4 className="font-display font-bold">Linnoitusten Valtaaminen</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Teknologia- ja strategiakorttien käyttö vaaditaan. Linnoitukset 
                  antavat merkittävän puolustusedun.
                </p>
              </ComicPanel>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

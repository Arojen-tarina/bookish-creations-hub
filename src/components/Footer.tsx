/**
 * Footer.tsx — Sivuston alatunniste
 *
 * Näyttää navigaatiolinkit, yhteystiedot ja tekijänoikeusmerkinnän.
 * Käytetään Layout-komponentissa jokaisella sivulla.
 */
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-secondary/50 border-t-2 border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-display text-lg font-bold text-primary mb-4">
              Arojen Tarina
            </h3>
            <p className="text-muted-foreground text-sm">
              Eeppinen trilogia mongolisotureista, arojen maisemista ja ikuisesta
              kunniasta.
            </p>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wide mb-4">
              Navigaatio
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/romaani" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Romaani
                </Link>
              </li>
              <li>
                <Link to="/suunnitelma" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Suunnitelma
                </Link>
              </li>
              <li>
                <Link to="/lautapeli" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Lautapeli
                </Link>
              </li>
              <li>
                <Link to="/liiketoiminta" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Liiketoiminta
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold uppercase tracking-wide mb-4">
              Yhteystiedot
            </h4>
            <p className="text-sm text-muted-foreground">
              Ota yhteyttä kirjailijaan tai liiketoimintakyselyihin.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © 2026 Arojen Tarina. Kaikki oikeudet pidätetään.
          </p>
        </div>
      </div>
    </footer>
  );
};

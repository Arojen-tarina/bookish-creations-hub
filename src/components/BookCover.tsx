/**
 * BookCover.tsx — Kirjan kansikomponentti
 *
 * Renderöi interaktiivisen kirjan kannen, joka toimii linkkinä
 * koko romaanin lukusivulle (/luku/koko-kirja).
 * Sisältää hover-animaatiot ja kirjan selkärangan visuaalisen efektin.
 */
import { Link } from "react-router-dom";
import comicArt from "@/assets/comic-panel.png";

export const BookCover = () => {
  return (
    <Link to="/luku/koko-kirja" className="group block">
      <div className="relative overflow-hidden rounded-sm border-4 border-border shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-2 group-hover:border-primary">
        {/* Book spine effect */}
        <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-border/50 to-transparent z-10" />
        
        {/* Cover image */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={comicArt}
            alt="Arojen Tarina - Kirjan kansi"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          
          {/* Title on cover */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-center">
            <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground drop-shadow-lg">
              Arojen Tarina
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              Koko romaani
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-sm text-sm font-display uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">
              Avaa ja lue
            </div>
          </div>
        </div>
        
        {/* Page effect on right side */}
        <div className="absolute right-0 top-2 bottom-2 w-1 bg-muted/50" />
        <div className="absolute right-1 top-3 bottom-3 w-px bg-muted/30" />
      </div>
    </Link>
  );
};

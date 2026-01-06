import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { path: "/", label: "Koti" },
  { path: "/romaani", label: "Romaani" },
  { path: "/suunnitelma", label: "Suunnitelma" },
  { path: "/lautapeli", label: "Lautapeli" },
  { path: "/digipeli", label: "Digipeli" },
  { path: "/liiketoiminta", label: "Liiketoiminta" },
];

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b-2 border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="font-display text-xl font-bold text-primary">
            Arojen Tarina
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-body text-sm uppercase tracking-wide transition-colors hover:text-primary ${
                  location.pathname === link.path
                    ? "text-primary font-semibold"
                    : "text-foreground/70"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block py-3 font-body uppercase tracking-wide transition-colors hover:text-primary ${
                  location.pathname === link.path
                    ? "text-primary font-semibold"
                    : "text-foreground/70"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

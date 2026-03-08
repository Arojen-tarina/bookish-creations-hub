/**
 * Layout.tsx — Sivuston perusasettelu
 *
 * Käärii jokaisen sivun Navigation + main + Footer -rakenteeseen.
 * Main-sisältö saa pt-16 navigaatiopalkin alle.
 */
import { ReactNode } from "react";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col parchment-bg">
      <Navigation />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
};

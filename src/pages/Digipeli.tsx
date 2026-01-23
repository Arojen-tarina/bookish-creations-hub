import { Layout } from "@/components/Layout";
import { MongolianGame } from "@/components/game/digital/MongolianGame";

const Digipeli = () => {
  return (
    <Layout>
      <section className="py-8 bg-gradient-to-b from-amber-950/20 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-amber-100 mb-4">
              🎮 Mongolien Valtakunta - Digipeli
            </h1>
            <p className="text-xl text-amber-200/80 max-w-2xl mx-auto">
              Pelaa lautapelin digitaalista versiota suoraan selaimessasi
            </p>
          </div>
        </div>
      </section>
      
      <MongolianGame />
    </Layout>
  );
};

export default Digipeli;

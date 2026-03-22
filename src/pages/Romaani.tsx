/**
 * Romaani.tsx — Romaanin pääsivu
 *
 * Esittelee "Arojen Tarina" -romaanin: juoni, kirjan kansi,
 * trilogian kolme osaa linkkeineen, ja päähahmot.
 */
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ComicPanel } from "@/components/ComicPanel";
import { BookCover } from "@/components/BookCover";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import comicArt from "@/assets/comic-panel.png";
import { characters, categoryLabels, categoryColors, type Character } from "@/data/characters";

const trilogyParts = [
  {
    number: "I",
    title: "Yhdistyminen",
    description: "Arojen maailma ja sen kansa.",
    link: "/luku/osa-1",
    variant: "primary" as const,
  },
  {
    number: "II",
    title: "Valloitus",
    description: "Henget, taidot ja soturin tie.",
    link: "/luku/osa-2",
    variant: "accent" as const,
  },
  {
    number: "III",
    title: "Koettelemus",
    description: "Johtajuus, valta ja yhteiskunnan haasteet.",
    link: "/luku/osa-3",
    variant: "default" as const,
  },
];

const Romaani = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Romaani
            </h1>
            <p className="text-xl text-muted-foreground">
              Historiallis-fantastinen eeppinen draama, joka yhdistää sotaretket ja
              mytologian rakenteellisesti läpinäkyväksi tarinaksi.
            </p>
          </div>
        </div>
      </section>

      {/* Book Cover - Full Book */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
            <div className="max-w-xs mx-auto md:mx-0">
              <BookCover />
            </div>
            <div>
              <h2 className="font-display text-3xl font-bold mb-4">
                Lue Koko Kirja
              </h2>
              <p className="text-muted-foreground mb-4">
                Klikkaa kirjan kantta avataksesi koko romaanin yhtenä kokonaisuutena. 
                Sisältää kaikki 15 lukua sisällysluetteloineen.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  15 lukua jaettuna kolmeen osaan
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  Sisällysluettelo nopeaan navigointiin
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  Noin 30 minuutin lukuaika
                </li>
              </ul>
              <Link to="/luku/koko-kirja">
                <Button className="font-display uppercase tracking-wide">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Avaa koko kirja
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Synopsis */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-display text-3xl font-bold mb-6">Juoni</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Tarina seuraa nuorta Temüütä, joka kasvaa paimentolaiskulttuurissa
                  arojen keskellä. Isänsä Ganbaatarin opettamana hän oppii soturin
                  taidot ja arvot.
                </p>
                <p>
                  Kun ulkoiset uhat uhkaavat heimon rauhaa, Temüün on astuttava
                  esiin ja todistettava itsensä. Matka vie hänet läpi arojen,
                  taistelujen ja lopulta omien pelkojensa kohtaamiseen.
                </p>
                <p>
                  Shamanistinen maailmankuva ohjaa hahmoja, ja myyttiset eläimet —
                  hirvi, susi, kotka, karhu ja pöllö — symboloivat eri voimia ja
                  kohtalon polkuja.
                </p>
              </div>
            </div>
            <ComicPanel className="p-0 overflow-hidden">
              <img
                src={comicArt}
                alt="Romaanin sarjakuvataide"
                className="w-full h-auto"
              />
            </ComicPanel>
          </div>
        </div>
      </section>

      {/* Trilogy Structure - Read by parts */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center mb-4">
            Lue Osissa
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Voit myös lukea tarinan osissa — klikkaa osaa aloittaaksesi
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {trilogyParts.map((part) => (
              <Link key={part.number} to={part.link} className="group">
                <ComicPanel 
                  variant={part.variant} 
                  className="h-full transition-all group-hover:-translate-y-2 group-hover:shadow-lg cursor-pointer"
                >
                  <span className="text-4xl font-display font-bold text-primary/30">
                    {part.number}
                  </span>
                  <h3 className="font-display text-lg font-semibold mt-2 mb-2">
                    {part.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {part.description}
                  </p>
                  <Button variant="outline" size="sm" className="w-full font-display uppercase tracking-wide group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Lue osa
                  </Button>
                </ComicPanel>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Characters - collapsible categories */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center mb-4">
            Hahmot
          </h2>
          <p className="text-center text-muted-foreground mb-8">
            Klikkaa kategoriaa nähdäksesi hahmot
          </p>

          <div className="max-w-4xl mx-auto">
            <Accordion type="multiple" className="space-y-3">
              {(["main", "family", "allies", "enemies", "spirits"] as const).map((cat) => {
                const group = characters.filter((c) => c.category === cat);
                if (group.length === 0) return null;
                return (
                  <AccordionItem key={cat} value={cat} className="border rounded-sm bg-card px-4">
                    <AccordionTrigger className="hover:no-underline">
                      <span className={`font-display text-lg font-semibold ${categoryColors[cat]}`}>
                        {categoryLabels[cat]}
                        <span className="text-muted-foreground text-sm font-normal ml-2">
                          ({group.length})
                        </span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2 pb-2">
                        {group.map((character) => (
                          <ComicPanel key={character.name} variant={cat === "spirits" ? "accent" : cat === "enemies" ? "primary" : "default"}>
                            <span className={`text-xs uppercase tracking-wide font-semibold ${categoryColors[cat]}`}>
                              {character.role}
                            </span>
                            <h4 className="font-display text-lg font-bold mt-1 mb-2">
                              {character.name}
                            </h4>
                            <p className="text-muted-foreground text-sm">
                              {character.description}
                            </p>
                          </ComicPanel>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Romaani;

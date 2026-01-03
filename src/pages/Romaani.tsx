import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ComicPanel } from "@/components/ComicPanel";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import comicArt from "@/assets/comic-panel.png";

const characters = [
  {
    name: "Temüü \"Baatar\"",
    role: "Päähenkilö",
    description: "Nuori soturi, joka kasvaa mieheksi isänsä opastuksella.",
  },
  {
    name: "Naran",
    role: "Sisko",
    description: "Temüün sisko, vahva ja itsenäinen nainen.",
  },
  {
    name: "Ganbaatar",
    role: "Isä",
    description: "Kokenut soturi ja opettaja, joka kasvattaa poikansa soturiksi.",
  },
  {
    name: "Bolormaa",
    role: "Äiti",
    description: "Sydämellinen äiti, joka pitää perheen koossa.",
  },
  {
    name: "Batu",
    role: "Johtaja",
    description: "Sotajohtaja, joka näkee potentiaalin nuoressa Temüüssä.",
  },
  {
    name: "Erdenetögs \"Böö\"",
    role: "Shamaani",
    description: "Yliluonnollisten voimien välittäjä ja henkinen opas.",
  },
];

const trilogyParts = [
  {
    number: "I",
    title: "Yhdistyminen",
    description: "Sisäinen konflikti ja kasvutarina. Temüün matka pojasta mieheksi.",
    link: "/luku/osa-1",
    variant: "primary" as const,
  },
  {
    number: "II",
    title: "Valloitus",
    description: "Sodankäynnit ja hallinto. Taistelu vallasta ja alueista.",
    link: "/luku/osa-2",
    variant: "accent" as const,
  },
  {
    number: "III",
    title: "Koettelemus",
    description: "Filosofiset kysymykset. Mitä jää jäljelle kun taistelut on käyty?",
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

      {/* Synopsis */}
      <section className="py-16">
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

      {/* Trilogy Structure - Now with links */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center mb-4">
            Trilogia
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Klikkaa osaa lukeaksesi tarinan
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
                    Lue tarina
                  </Button>
                </ComicPanel>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Characters */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center mb-12">
            Hahmot
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {characters.map((character) => (
              <ComicPanel key={character.name}>
                <span className="text-xs uppercase tracking-wide text-accent font-semibold">
                  {character.role}
                </span>
                <h3 className="font-display text-xl font-bold mt-1 mb-2">
                  {character.name}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {character.description}
                </p>
              </ComicPanel>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Romaani;

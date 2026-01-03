import { Layout } from "@/components/Layout";
import { ComicPanel } from "@/components/ComicPanel";
import comicArt from "@/assets/comic-panel.png";

const characters = [
  {
    name: "Temüü 'Baatar'",
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
    name: "Shamaani",
    role: "Henkinen opas",
    description: "Yliluonnollisten voimien välittäjä ja neuvonantaja.",
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

      {/* Characters */}
      <section className="py-16 bg-primary/5">
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

      {/* Trilogy Structure */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-bold text-center mb-12">
            Trilogia
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <ComicPanel variant="primary">
              <span className="text-4xl font-display font-bold text-primary/30">I</span>
              <h3 className="font-display text-lg font-semibold mt-2 mb-2">
                Yhdistyminen
              </h3>
              <p className="text-muted-foreground text-sm">
                Sisäinen konflikti ja kasvutarina. Temüün matka pojasta mieheksi.
              </p>
            </ComicPanel>

            <ComicPanel variant="accent">
              <span className="text-4xl font-display font-bold text-accent/30">II</span>
              <h3 className="font-display text-lg font-semibold mt-2 mb-2">
                Valloitus
              </h3>
              <p className="text-muted-foreground text-sm">
                Sodankäynnit ja hallinto. Taistelu vallasta ja alueista.
              </p>
            </ComicPanel>

            <ComicPanel>
              <span className="text-4xl font-display font-bold text-muted-foreground/30">III</span>
              <h3 className="font-display text-lg font-semibold mt-2 mb-2">
                Koettelemus
              </h3>
              <p className="text-muted-foreground text-sm">
                Filosofiset kysymykset. Mitä jää jäljelle kun taistelut on käyty?
              </p>
            </ComicPanel>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Romaani;

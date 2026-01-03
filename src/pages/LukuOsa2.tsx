import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

const LukuOsa2 = () => {
  return (
    <Layout>
      {/* Header */}
      <section className="py-12 bg-secondary/30 border-b-2 border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Link to="/romaani" className="text-primary hover:underline text-sm uppercase tracking-wide flex items-center gap-2 mb-4">
              <ArrowLeft className="w-4 h-4" />
              Takaisin romaaniin
            </Link>
            <span className="text-accent font-semibold text-sm uppercase tracking-wide">Osa II</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold mt-2">
              Valloitus
            </h1>
            <p className="text-muted-foreground mt-4">
              Toinen kirja keskittyy sodankäynteihin ja hallintoon — taistelu vallasta ja alueista.
            </p>
          </div>
        </div>
      </section>

      {/* Reading Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <article className="max-w-3xl mx-auto prose prose-lg">
            <div className="font-body text-foreground leading-relaxed space-y-6">
              <p className="first-letter:text-5xl first-letter:font-display first-letter:font-bold first-letter:mr-2 first-letter:float-left">
                Temüü oli kasvanut mieheksi. Hänen isänsä opetukset olivat juurtuneet syvälle hänen sieluunsa, ja nyt oli aika todistaa itsensä taistelussa.
              </p>

              <p>
                Heimopäällikkö huusi raivosta ja sanoi joukoilleen: "Meidän on nyt toimittava! Viholliset lähestyvät eikä meillä ole aikaa epäröintiin."
              </p>

              <p>
                Batu, kokenut sotajohtaja, määräsi kaikki heidän joukkonsa valmiuteen. Hän tiesi, että tuleva taistelu ratkaisisi paljon enemmän kuin vain tämän päivän kohtalon.
              </p>

              <div className="my-8 p-6 bg-secondary/30 border-l-4 border-accent rounded-r-sm">
                <p className="italic text-muted-foreground">
                  "Pojasta on tuleva sotajohtaja, joka komentaa joukot voittoon," Batu oli sanonut. Nyt nuo sanat kaikuivat Temüün mielessä, kun hän nousi hevosensa selkään.
                </p>
              </div>

              <p>
                Shamaani asteli joukon perästä esiin ja sanoi: "Henget ovat puolellanne tänään. Mutta muistakaa — voitto ei tule pelkästä voimasta. Se tulee viisaudesta ja rohkeudesta."
              </p>

              <p>
                Temüü katsoi ympärilleen. Hänen siskoonsa Naran seisoi joukkojen takana, huoli silmissään mutta myös ylpeys. Hän tiesi, että veljensä oli valmis.
              </p>

              <p>
                Ganbaatar, Temüün isä, ratsasti hänen viereensä. "Muista kaikki, mitä olemme harjoitelleet. Miekkaa pitää olla käden jatke, ei este."
              </p>

              <p>
                Taistelukentällä kaikui sotahuutoja. Vihollisen linnoitus kohosi heidän edessään kuin uhkaava varjo. Mutta Temüü ei pelännyt. Hän oli kasvanut pelkäämättömäksi.
              </p>

              <div className="my-8 p-6 bg-primary/5 border-l-4 border-primary rounded-r-sm">
                <p className="italic text-muted-foreground">
                  "Me emme voi perääntyä niin kuin aina," Temüü huusi joukoilleen. "Tänään me seisomme! Tänään me taistelemme! Tänään me voitamme!"
                </p>
              </div>

              <p>
                Hyökkäys alkoi. Ratsuväki vyöryi eteenpäin kuin tulva, ja Temüü johti heitä ensimmäisenä. Hänen miekkansa leikkasi ilmaa, ja jokainen isku oli tarkka ja voimakas.
              </p>

              <p>
                Linnoituksen muurit kestivät ensimmäisen rynnäkön, mutta Temüü tiesi, että tämä oli vasta alkua. Hän määräsi joukkonsa perääntymään ja valmistautumaan uuteen strategiaan.
              </p>

              <p>
                Erdenetögs, shamaani, lähestyi häntä taistelun jälkeen. "Olet osoittanut rohkeutta, mutta muista myös kärsivällisyys. Suurimmat voitot eivät tule yhden päivän aikana."
              </p>

              <p>
                Temüü nyökkäsi. Hän ymmärsi nyt, mitä johtajuus todella tarkoitti. Se ei ollut pelkkää voimaa tai rohkeutta — se oli vastuuta kaikista niistä, jotka seurasivat häntä.
              </p>

              <p>
                Illalla, nuotion ääressä, Temüü katsoi tähtiä. Hänen matkansa oli vasta alkanut, mutta hän tiesi jo, että tie voittoon olisi pitkä ja vaativa. Silti hän oli valmis.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-8 border-t-2 border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto flex justify-between items-center">
            <Link to="/luku/osa-1">
              <Button variant="outline" className="font-display uppercase tracking-wide">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Osa I
              </Button>
            </Link>
            <Link to="/luku/osa-3">
              <Button className="font-display uppercase tracking-wide">
                Osa III
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default LukuOsa2;

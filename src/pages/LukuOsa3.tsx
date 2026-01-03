import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const LukuOsa3 = () => {
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
            <span className="text-accent font-semibold text-sm uppercase tracking-wide">Osa III</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold mt-2">
              Koettelemus
            </h1>
            <p className="text-muted-foreground mt-4">
              Kolmas kirja käsittelee filosofisia kysymyksiä — mitä jää jäljelle kun taistelut on käyty?
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
                Vuodet olivat kuluneet. Temüü istui nyt valtaistuinsalissa, mutta voitto ei tuntunut sellaiselta kuin hän oli kuvitellut. Jokainen taistelu oli jättänyt jälkensä — ei vain kehoon, vaan myös sieluun.
              </p>

              <p>
                Shamaani sanoi Temüülle: "Teistähän on tullut oikea johtaja. Mutta muistakaa opetukset, joita olen teille antanut. Voima ilman viisautta on tuhoisa."
              </p>

              <p>
                Temüü katsoi ulos ikkunasta. Arojen horisontit ulottuivat loputtomiin, mutta hän tiesi nyt, että todellinen matka oli sisäinen. Ulkoiset valloitukset olivat vain heijastumia siitä, mitä tapahtui ihmisen sydämessä.
              </p>

              <div className="my-8 p-6 bg-secondary/30 border-l-4 border-accent rounded-r-sm">
                <p className="italic text-muted-foreground">
                  "Kuoleminen yksin nähtiin heidän kulttuurissaan häpeällisenä, koska todelliset hautajaiset kuuluivat myös heidän kulttuuriinsa. Usein heidät haudattiin nimettömiin hautoihin, ilman että kukaan välttämättä sai selville, minne heidät oli oikeasti kaivettu."
                </p>
              </div>

              <p>
                Naran, hänen siskonsa, astui huoneeseen. "Veli, olet ollut hiljainen viime aikoina. Mitä mielessäsi liikkuu?"
              </p>

              <p>
                Temüü hymyili väsyneesti. "Mietin niitä, jotka menetimme matkalla tänne. Ja mietin, oliko kaikki sen arvoista."
              </p>

              <p>
                "Isä olisi ylpeä sinusta," Naran sanoi. "Hän kasvatti sinut tähän. Ja sinä teit enemmän kuin hän koskaan uskalsi unelmoida."
              </p>

              <div className="my-8 p-6 bg-primary/5 border-l-4 border-primary rounded-r-sm">
                <p className="italic text-muted-foreground">
                  "Heimot eivät välttämättä kunnioittaneet soturia, joka kuoli taistelussa, tai siviiliä, joka kuoli vanhuuteen. He kunnioittivat heimolaista, joka oli elänyt elämänsä heidän elinolojaan parantaen — elämänsä heidän kunniaansa puolesta."
                </p>
              </div>

              <p>
                Temüü nousi ja käveli kohti parveketta. Aurinko laski arojen ylle, maalaten taivaan oranssiksi ja punaiseksi. Se oli sama taivas, jonka alla hän oli kasvanut — sama taivas, jonka alla hänen esi-isänsä olivat eläneet ja kuolleet.
              </p>

              <p>
                "Shamaani opetti minulle kerran," Temüü sanoi hiljaa, "että todellinen voitto ei ole vihollisten kukistaminen. Se on oman pelon voittaminen. Oman heikkouden kohtaaminen."
              </p>

              <p>
                Erdenetögs, vanha shamaani, ilmestyi ovelle. Hänen kasvonsa olivat uurteiset vuosien viisaudesta, mutta hänen silmänsä loistivat yhä nuorekkaasti.
              </p>

              <p>
                "Dengri Hangin, Hirvi, loi maan laulullaan," shamaani aloitti. "Ja me kaikki olemme osa tuota laulua. Sinun tarinasi, Temüü, on vain yksi säe suuressa eepoksessa."
              </p>

              <p>
                Temüü nyökkäsi. Hän ymmärsi nyt, mitä hänen elämänsä todella merkitsi. Ei ollut kyse vallasta tai kunniasta — oli kyse jäljestä, jonka hän jättäisi jälkeensä. Tarinoista, joita tuleville sukupolville kerrottaisiin.
              </p>

              <p>
                "Mitä aiot tehdä nyt?" Naran kysyi.
              </p>

              <p>
                Temüü kääntyi katsomaan heitä molempia — siskoaan ja opettajaansa. "Aion varmistaa, että meidän kansamme muistaa. Muistaa mistä tulimme, mitä kestimme, ja miksi taistelemme. Koska todellinen perintö ei ole maata tai vaurautta — se on tarina."
              </p>

              <p>
                Ja niin Temüü "Baatar" — soturi, johtaja, legenda — aloitti viimeisen tehtävänsä: varmistaa, että arojen lasten tarinat eläisivät ikuisesti.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-8 border-t-2 border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto flex justify-between items-center">
            <Link to="/luku/osa-2">
              <Button variant="outline" className="font-display uppercase tracking-wide">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Osa II
              </Button>
            </Link>
            <Link to="/romaani">
              <Button className="font-display uppercase tracking-wide">
                Takaisin romaaniin
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default LukuOsa3;

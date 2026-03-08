/**
 * LukuOsa2.tsx — Romaanin toinen osa: "Valloitus"
 *
 * Luvut 6–10: Uhraukset ja henget, soturin ominaisuudet, ratsastus,
 * paini ja miekkailu, sukupuolet ja arvot.
 */
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
              Toinen kirja — Henget, taidot ja soturin tie
            </p>
          </div>
        </div>
      </section>

      {/* Reading Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <article className="max-w-3xl mx-auto">
            <div className="font-body text-foreground leading-relaxed space-y-6">
              
              <h2 className="font-display text-2xl font-bold mt-8 mb-4">Luku 6: Uhraukset ja Henget</h2>
              
              <p className="first-letter:text-5xl first-letter:font-display first-letter:font-bold first-letter:mr-2 first-letter:float-left">
                Välillä saatettiin myös tehdä uhrauksia erilaisille eläimille. Ihmisuhrauksia ei harjoitettu, mutta vähemmän palvottuja eläimiä uhrattiin eläimiä varten ja henkiä varten, joita kunnioitettiin.
              </p>

              <p>
                Tietoisuus siitä, millaisia henkiä oli, oli yhtä tärkeää kuin tietoisuus siitä, miten käyttäytyä ja miten selviytyä.
              </p>

              <p>
                Rankoilla aroilla tehtiin usein pyhiinvaelluksia pyhille maille, kuten vuorille, joissa tiedettiin asuvan henkeä. Piti tietää, mitä kukin henki halusi ja mitä kenellekin hengelle piti antaa ja luovuttaa.
              </p>

              <div className="my-8 p-6 bg-secondary/30 border-l-4 border-accent rounded-r-sm">
                <p className="italic text-muted-foreground">
                  Jos väärän lahjan antoi väärälle hengelle, se saattoi tietää omaa kuolemaa tai vähintäänkin jotain pahaa ennettä, mitä lähitulevaisuudessa tulisi tapahtumaan itselle tai jollekin läheiselle.
                </p>
              </div>

              <h2 className="font-display text-2xl font-bold mt-12 mb-4">Luku 7: Soturin Ominaisuudet</h2>

              <p>
                Kaikille heimoille ominaisia piirteitä olivat voima, viekkaus, nopeus, kovuus. Luontaisilta ominaisuuksiltaan arokansat olivat vahvoja johtuen rankoista sääolosuhteista myös heidän liikunnallisesta elämäntyylistään.
              </p>

              <p>
                Merkittävin kontribuutio heidän vahvoille kropilleen ja mielillään oli myös heidän ruokavalio, jossa oli paljon proteiinia. He joivat paljon maitoa ja he söivät paljon lampaanlihaa. Maidossa on paljon proteiineja ja kalsiumia, jotka auttavat lihasten ja luuston vahvistamisessa.
              </p>

              <p>
                Lampaanlihassa on paljon rasvaa ja proteiinia ja rautaa, joka tukee hermoston ja lihaksiston kehittymistä aikaisesta iästä lähtien.
              </p>

              <p>
                He olivat myös tehneet raskaita, fyysisiä töitä nuoresta iästä lähtien. Noihin aikoihin ei niinkään paljon maataloustöitä, mutta he olivat tottuneet kantamaan raskaita kuormia omien kykyjensä mukaisesti. He olivat tottuneet lypsämään hevoset ja aasit. He olivat tottuneet pystyttämään ja purkamaan teltat.
              </p>

              <h2 className="font-display text-2xl font-bold mt-12 mb-4">Luku 8: Ratsastuksen Taito</h2>

              <p>
                Heidän voimaannuttamisessaan yksi tärkeä ominaisuus oli heidän rakkaus ja tiukka kuri hevosratsastuksen taitoa koskien. Jokaisen arokansalaisen piti lapsesta asti opetella ratsastamaan.
              </p>

              <p>
                Ratsastus kehittää alempia vatsalihaksia, jotka ovat tärkeitä monessa arkipäiväisessä rutiinissa, kuten pystyasennon säilyttämisessä, hyvän ryhdin säilyttämisessä ja erilaisessa liikunnassa.
              </p>

              <p>
                Tämä antoi hyvän pohjan uusien taitojen opettelemiselle, kuten jousiammunnan. Jousiammunnassa hyvä tasapaino, ryhti ja rauhallisuus on tärkeää.
              </p>

              <div className="my-8 p-6 bg-primary/5 border-l-4 border-primary rounded-r-sm">
                <p className="italic text-muted-foreground">
                  On myytti, joka usein kulkee arokansojen salaisesta taidosta — että he ampuisivat heidän jousellaan, joka on käännettynä sivulle. Mutta todellisuudessa he ampuivat jousella täysin samassa asennossa kuin me länsimaalaisetkin.
                </p>
              </div>

              <h2 className="font-display text-2xl font-bold mt-12 mb-4">Luku 9: Paini ja Miekkailu</h2>

              <p>
                Seuraavaksi tärkein taito, joka jokaisen piti opetella, oli heidän oma kansanpaininsa. Heidän kansanpaininsa eroaa meidän kansanpainistamme siinä, missä asennossa ja millaisia pisteytyksiä palkitaan.
              </p>

              <p>
                He painivat paljon enemmän sumopaini-tyyppisesti ja heillä on vielä vähemmän mattopainia kuin meillä. Heidän paininsa on kehittynyt heitä opettelemaan miekkailua, koska miekkailu on painimista silloin kun miekat ovat sidoksissa ja kosketuksissa toisiinsa.
              </p>

              <p>
                Lapset eivät toki saaneet rautaisia miekkoja itsellensä, vaan saivat tyytyä puisiin harjoitusmiekkoihin, ettei vain tulisi sivullisia uhreja, kun leikit yltyvät liian rajuiksi.
              </p>

              <p>
                Kun he kasvoivat vanhemmiksi, heillä oli usein tapana kilpailla keskenään erilaisissa sotilaiden kilpailuissa, koska arokansoilla kaikki taistelukykyiset miehet kuuluivat heidän armeijaansa, jota he kutsuivat suureksi laumaksi.
              </p>

              <h2 className="font-display text-2xl font-bold mt-12 mb-4">Luku 10: Sukupuolet ja Arvot</h2>

              <p>
                Heidän tietäällinen suhtautumisensa sukupuoliin oli eriskummallinen ulkomaalaisten mielestä. Esimerkiksi vain naisiin viitattiin sukupuolena, koska miehillä ei heidän mielestään sellaista edes ollut.
              </p>

              <p>
                He myöskin arvostivat nopeutta ja kovuutta heidän yhteiskunnassaan. Vähemmän tunnettu fakta, koska välillä olosuhteet olivat raskaat, ja jos ihminen selvisi siellä, välillä täytyi olla valmiina marssimaan pitkiä matkoja.
              </p>

              <p>
                Jos oli erottunut laumasta, navigoimaan yksin ja lukemaan luonnonantamia hienovaraisia vihjeitä. Arvostettiin myös viekkautta, koska välillä voimakomus ja nopeus ja vahvat selviytymistaidot eivät riitä.
              </p>

              <div className="my-8 p-6 bg-secondary/30 border-l-4 border-accent rounded-r-sm">
                <p className="italic text-muted-foreground">
                  Täytyy olla ovelampi kuin luonto. Täytyy olla ovelampi kuin viekkain kettu. Tai täytyy olla ovelampi kuin se henkilö, joka haluaa elää ja pahaa sinulle.
                </p>
              </div>

              <p>
                Yleisesti ottaen miten miehen täytyy tuoda itseään esille oli näiden ominaisuuksien kautta. Miehen täytyy olla vahva. Miehen täytyy olla viekas, älykäs ja selviytymiskykyinen.
              </p>

              <p>
                Naisilta taas odotettiin viehkeyttä, älyä, kykyä tuntea itsensä ja olla vaatimaton.
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

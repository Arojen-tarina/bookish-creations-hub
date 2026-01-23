import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

const LukuOsa1 = () => {
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
            <span className="text-accent font-semibold text-sm uppercase tracking-wide">Osa I</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold mt-2">
              Yhdistyminen
            </h1>
            <p className="text-muted-foreground mt-4">
              Ensimmäinen kirja — Arojen maailma ja sen kansa
            </p>
          </div>
        </div>
      </section>

      {/* Reading Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <article className="max-w-3xl mx-auto">
            <div className="font-body text-foreground leading-relaxed space-y-6">
              
              <h2 className="font-display text-2xl font-bold mt-8 mb-4">Luku 1: Arojen Maa</h2>
              
              <p className="first-letter:text-5xl first-letter:font-display first-letter:font-bold first-letter:mr-2 first-letter:float-left">
                Olipa kerran kaukaisessa maassa joukko keskenään riiteleviä heimoja. Nämä maat olivat luonnoltaan aroa eli steppejä.
              </p>

              <p>
                Steppi on luonnonvaraisen heinä- ja ruohokasvillisuuden ja joskus myös pensaiden peittämä, verrattain kuiva ja puuton kasvillisuusvyöhyke. Aroilla elämä oli karua.
              </p>

              <p>
                Mutta monien ulkomaalaisten mielestä ne olisivat olleet loistavia maita maanviljelykseen ja aroilla kasvoi mustaa multaa toisinaan. Joissain paikoin aro saattoi olla myös kosteaa niittyaroa.
              </p>

              <p>
                Jollain elämä oli vähemmän karua, joissa sijaitsi enemmän vesistöjä läheisyydessä helpottaen elämää ja leiriytymistä niiden lähellä. Vaikka ihmiset elivät alkeellisissa olosuhteissa, olivat he myös resilienttejä.
              </p>

              <p>
                Esimerkiksi ympäröivät vaatteensa rasvalla ja laardilla. Se suojasi heitä kylmyydeltä ja eristi lämpöä ulkopuolelle pois heidän iholtaan.
              </p>

              <p>
                Ulkomaalaiset näkevät tämänkin tavan barbaarisena ja karkeana, mutta niin yksinkertaisesti tehtiin ruokailun yhteydessä. Rasvaa ja laardia hierattiin omien vaatteidensa ympärillä.
              </p>

              <h2 className="font-display text-2xl font-bold mt-12 mb-4">Luku 2: Ruoka ja Tavat</h2>

              <p>
                Tässä maassa ei myöskään käytetty lehmiä niin kuin usein ulkomailla on totuttu kehittyneemmän maatalouden ja karjanhoidon takia, vaan tässä maassa käytettiin hevosten ja aasien maitoa. Siinä uskottiin olevan kehoa puhdistavia ominaisuuksia, joka sai vatsan liikkeelle.
              </p>

              <p>
                Oli myös ominaista ja kulttuurillisesti hyvä tapa kokata juurta ulkopuolella. Lihaa myös puhdistettiin kypsentämisen lisäksi sen keittämällä. Keittäminen toteutettiin myös hengellisistä syistä.
              </p>

              <p>
                Myös ulkomaalaisten mielestä barbaarinen tapa oli veren käyttäminen ruuassa. Verta saatettiin juoda myös ennen taistelua. Syy, minkä takia vettä ei käytetty vaatteiden pesussa, oli koska he uskoivat veden olevan pyhää ja he eivät halunneet liata läheisiä vesistöjä.
              </p>

              <div className="my-8 p-6 bg-secondary/30 border-l-4 border-accent rounded-r-sm">
                <p className="italic text-muted-foreground">
                  He suhtautuivat myös kusemiseen eri tavalla kuin ulkomaiset kansat. Kuseminen julkiselle paikalle ei ollut häpeällinen teko, mutta yksi asia, josta he rankaisivat: yksikään tippa miehen tai naisen virtsaa ei saanut osua mihinkään vesistöön tai veteen. Vedet ja vesistöt olivat pyhiä maita.
                </p>
              </div>

              <h2 className="font-display text-2xl font-bold mt-12 mb-4">Luku 3: Vapaus ja Karu Elämä</h2>

              <p>
                Elämä oli karua ja tämä olisi luonnostaan saanut monet ihmiset ajattelemaan, että he haluavat etsiä parempaa ja mukavampaa elämää ulkomailta. Poissa moisesta kurjuudesta, jota he kaikki ovat joutuneet sietämään.
              </p>

              <p>
                Mutta kuitenkin ihminen, joka on kasvanut tietynlaisissa olosuhteissa, on jo mukautunut sen kaltaiseen elämään. He tukevat toisiansa, tiedostavat kuinka vaikeaa tilanne on ja elävät elämäänsä sen mukaisesti.
              </p>

              <p>
                Kaikesta vaikeuksista huolimatta oli myös vapaus. Rauhallista ja luonnollista elämää suuren taivaan alla. Heimot uskoivat siihen, että he olivat todella vapaita ja että ulkomaalaiset olivat rakentaneet keinotekoisen häkin itsensä ympärille — erottamaan heidät luonnollisesta tavastaan elää.
              </p>

              <p>
                Oli myös joitakin, jotka olivat tottuneet yksinäiseen ja erakoituneeseen elämään poissa laumoista ja heidän mielestään konventionaalisesta yhteiskunnasta. Nämä olivat usein ihmisiä, jotka olivat elämässään kokeneet liian paljon tai yksinkertaisesti eivät olleet tyytyväisiä heidän tapaansa elää.
              </p>

              <h2 className="font-display text-2xl font-bold mt-12 mb-4">Luku 4: Talven Karuus</h2>

              <p>
                Oli myös äärimmäisissä tapauksissa rangaistu joitakin ihmisiä siitä, jos he olivat käyttäytyneet jollain tavalla kuulemattomasti tai eettisesti väärin heidän tapojansa ja lakiensa mukaisesti.
              </p>

              <p>
                Elämä aroilla yksin varsinkin talvisaikaan oli todella raskasta, koska pakkaset saattoivat olla -20 tai jopa -30 celsiusasteita. Siinähän se kysymys onkin, miten pystyy pitämään teltan tai mökin lämpimänä yön ylitse, jos itse nukkuu ja kamina sen kuin vaan polttaa ja polttaa.
              </p>

              <p>
                Oli monia tapauksia, että ihmiset paleltuivat kuoliaaksi yksin heidän mökeissään ilman että kukaan kuuli heidän tuskanhuutonsa, joita tuskin edes oli, koska he vain kuolivat uniinsa.
              </p>

              <div className="my-8 p-6 bg-primary/5 border-l-4 border-primary rounded-r-sm">
                <p className="italic text-muted-foreground">
                  Kuoleminen yksin nähtiin myös heidän kulttuurissaan häpeällisenä, koska todelliset hautajaiset kuuluivat myös heidän kulttuuriinsa, vaikkakin eri lailla. Usein heidät haudattiin nimettömiin hautoihin, ilman että kukaan välttämättä sai selville koskaan, minne heidät oli oikeasti kaivettu.
                </p>
              </div>

              <h2 className="font-display text-2xl font-bold mt-12 mb-4">Luku 5: Kunnia</h2>

              <p>
                Heimot eivät välttämättä kunnioittaneet soturia, joka kuoli taistelussa, tai siviiliä, joka kuoli vanhuuteen. He kunnioittivat heimolaista, joka oli elänyt elämänsä heidän elinolojaan parantaen — elämänsä heidän kunniaansa puolesta.
              </p>

              <p>
                Kunnia oli toinen asia, johon uskottiin, joita tultiin puolustamaan hamaan loppuun asti. Kunnioitus ja kunnia ei pelkästään tarkoittanut sitä, että omaa kunniaa puolustettiin tai omaa perhettä. Kunnioitus tarkoitti myös sitä, että sitä piti antaa muille, jotta sitä pystyi saamaan muilta.
              </p>

              <p>
                Yhteisöissä uskottiin molempipuoliseen vuorovaikuttamiseen, jos tahtoi saada apua muilta. Esimerkiksi jos tiesi, että joku oli hallinnut polttopuita itselleen mielin määrin, niitä saattoi mennä kysymään. Mutta jos itse omasi esimerkiksi lihaa, jota hänellä ei ollut, sitten odotettiin myös, että itseohjautuvasti tarjoutui tätä lihaa tarjoamaan.
              </p>

              <p>
                Rikastumista ei nähty hyvänä tässä yhteiskunnassa. Kaikki vauraudet ja rikkaudet luovutettiin heimon yhteiseen varastoon pahoja aikoja varten.
              </p>

            </div>
          </article>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-8 border-t-2 border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto flex justify-between items-center">
            <Link to="/romaani">
              <Button variant="outline" className="font-display uppercase tracking-wide">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Romaani
              </Button>
            </Link>
            <Link to="/luku/osa-2">
              <Button className="font-display uppercase tracking-wide">
                Osa II
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default LukuOsa1;

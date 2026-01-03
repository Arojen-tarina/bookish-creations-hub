import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";

const KokoKirja = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Layout>
      {/* Header */}
      <section className="py-12 bg-secondary/30 border-b-2 border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Link to="/romaani" className="text-primary hover:underline text-sm uppercase tracking-wide inline-flex items-center gap-2 mb-6">
              <ArrowLeft className="w-4 h-4" />
              Takaisin romaaniin
            </Link>
            <h1 className="font-display text-4xl md:text-6xl font-bold">
              Arojen Tarina
            </h1>
            <p className="text-xl text-muted-foreground mt-4">
              Koko romaani — Lue alusta loppuun
            </p>
            <div className="flex justify-center gap-4 mt-6 text-sm text-muted-foreground">
              <span>15 lukua</span>
              <span>•</span>
              <span>~30 min lukuaika</span>
            </div>
          </div>
        </div>
      </section>

      {/* Table of Contents */}
      <section className="py-8 bg-card border-b-2 border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display text-lg font-semibold mb-4">Sisällysluettelo</h2>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="font-semibold text-primary mb-2">Osa I: Yhdistyminen</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li><a href="#luku-1" className="hover:text-primary">1. Arojen Maa</a></li>
                  <li><a href="#luku-2" className="hover:text-primary">2. Ruoka ja Tavat</a></li>
                  <li><a href="#luku-3" className="hover:text-primary">3. Vapaus ja Karu Elämä</a></li>
                  <li><a href="#luku-4" className="hover:text-primary">4. Talven Karuus</a></li>
                  <li><a href="#luku-5" className="hover:text-primary">5. Kunnia</a></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-accent mb-2">Osa II: Valloitus</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li><a href="#luku-6" className="hover:text-primary">6. Uhraukset ja Henget</a></li>
                  <li><a href="#luku-7" className="hover:text-primary">7. Soturin Ominaisuudet</a></li>
                  <li><a href="#luku-8" className="hover:text-primary">8. Ratsastuksen Taito</a></li>
                  <li><a href="#luku-9" className="hover:text-primary">9. Paini ja Miekkailu</a></li>
                  <li><a href="#luku-10" className="hover:text-primary">10. Sukupuolet ja Arvot</a></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-primary mb-2">Osa III: Koettelemus</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li><a href="#luku-11" className="hover:text-primary">11. Naisten Rooli</a></li>
                  <li><a href="#luku-12" className="hover:text-primary">12. Ulkomaalaiset</a></li>
                  <li><a href="#luku-13" className="hover:text-primary">13. Johtajat</a></li>
                  <li><a href="#luku-14" className="hover:text-primary">14. Verot ja Korruptio</a></li>
                  <li><a href="#luku-15" className="hover:text-primary">15. Kultainen Aika</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full Book Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <article className="max-w-3xl mx-auto">
            <div className="font-body text-foreground leading-relaxed space-y-6">
              
              {/* OSA I */}
              <div className="my-12 text-center">
                <span className="text-6xl font-display font-bold text-primary/20">I</span>
                <h2 className="font-display text-3xl font-bold mt-2">Yhdistyminen</h2>
                <p className="text-muted-foreground mt-2">Arojen maailma ja sen kansa</p>
              </div>

              <h3 id="luku-1" className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Luku 1: Arojen Maa</h3>
              
              <p className="first-letter:text-5xl first-letter:font-display first-letter:font-bold first-letter:mr-2 first-letter:float-left">
                Olipa kerran kaukaisessa maassa joukko keskenänsä riiteleviä heimoja. Nämä maat olivat luonnoltaan aroa eli steppejä.
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

              <h3 id="luku-2" className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Luku 2: Ruoka ja Tavat</h3>

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

              <h3 id="luku-3" className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Luku 3: Vapaus ja Karu Elämä</h3>

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

              <h3 id="luku-4" className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Luku 4: Talven Karuus</h3>

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

              <h3 id="luku-5" className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Luku 5: Kunnia</h3>

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

              {/* OSA II */}
              <div className="my-16 text-center">
                <div className="w-full h-px bg-border mb-12"></div>
                <span className="text-6xl font-display font-bold text-accent/20">II</span>
                <h2 className="font-display text-3xl font-bold mt-2">Valloitus</h2>
                <p className="text-muted-foreground mt-2">Henget, taidot ja soturin tie</p>
              </div>

              <h3 id="luku-6" className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Luku 6: Uhraukset ja Henget</h3>
              
              <p>
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

              <h3 id="luku-7" className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Luku 7: Soturin Ominaisuudet</h3>

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

              <h3 id="luku-8" className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Luku 8: Ratsastuksen Taito</h3>

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

              <h3 id="luku-9" className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Luku 9: Paini ja Miekkailu</h3>

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

              <h3 id="luku-10" className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Luku 10: Sukupuolet ja Arvot</h3>

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

              {/* OSA III */}
              <div className="my-16 text-center">
                <div className="w-full h-px bg-border mb-12"></div>
                <span className="text-6xl font-display font-bold text-primary/20">III</span>
                <h2 className="font-display text-3xl font-bold mt-2">Koettelemus</h2>
                <p className="text-muted-foreground mt-2">Johtajuus, valta ja yhteiskunnan haasteet</p>
              </div>

              <h3 id="luku-11" className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Luku 11: Naisten Rooli</h3>
              
              <p>
                Usein naisten asema ylenkatsotaan tämän ajan maailmassa pois, koska se on nimenomaisesti miehet, jotka ovat kirjoittaneet historian. Mutta se on naiset, jotka ovat antaneet kyvyn miehille lähteä pois leiristä, kun heidän omaisuudesta ja läheisistä pidetään huolta.
              </p>

              <p>
                Kun miehet olivat pois sotaretkillä, solmittiin myös usein sisäpiirikauppoja toisten heimojen ja toisten ulkomaalaisten kanssa, koska kukaan ei ollut kotona metsästämässä ja tuomassa ruokaa ja kotitalouden pyörittämiselle välttämättömiä tarvikkeita kotiin.
              </p>

              <p>
                Myös paljon historiallista tutkimusta tehtiin silloin, kun miehet olivat sotaretkillä, koska nyt ulkomaalaisillakin saattoi olla pääsy leireihin, joissa heidät olisi todennäköisesti vain teloitettu, jos miehet olisivat olleet paikalla.
              </p>

              <h3 id="luku-12" className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Luku 12: Ulkomaalaiset</h3>

              <p>
                Ulkomaalaisiin usein suhtauduttiin jokseenkin kielteisesti ja halveksuvasti, mutta heitä kunnioitettiin kuitenkin siinä mielessä, että heillä oli paljon sellaisia taitoja, ja joitakin näitä taitoja jopa pidettiin taikavoimina ja pakanallisina oppeina, jotka herättivät pelkoa — melkein taikauskoista pelkoa — arokansojen heimojen sydämissä ja mielissä.
              </p>

              <div className="my-8 p-6 bg-secondary/30 border-l-4 border-accent rounded-r-sm">
                <p className="italic text-muted-foreground">
                  Esimerkiksi sanottiin, että jotkin eteläiset heimot kykenivät luomaan piippuja ja putkia, jotka pystyivät syöksymään tulta — niin kuin länsimaalaisten tarinoissa kerrotut lohikäärmeet, jotka saattoivat viedä viatonta karjaa pois heidän paimeniensa luota.
                </p>
              </div>

              <p>
                Heimojen sotaretkillä oli kuitenkin tietynlainen kunnioitus ulkomaalaisia kohtaan siinä mielessä, että kaikki ihmiset, joilla oli jokin taito, säästettiin verisempien taisteluiden ja kaupunkien piiritysten jälkeen.
              </p>

              <p>
                Oli myös tunnustettu se fakta, että jokaisella ihmisellä ja ihmisyhteisellä pitää saada olla heidän oma kulttuurinsa ja oma uskontonsa. Toisten ihmisten uskomuksia ja tapoja ei niinkään pitäisi sortaa, vaan niistä pitäisi katsoa vilpittömästi, että mitä hyvää niissä on ja miten ulkomaalaisten kulttuureista voitaisiin hyötyä mahdollisimman paljon.
              </p>

              <h3 id="luku-13" className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Luku 13: Johtajat</h3>

              <p>
                Heidän yhteisistä jaetuista piirteistään huolimatta he olivat kaikki ainutlaatuisia. Kaikista näistä samankaltaisuuksista huolimatta heidän riveissään silti kyti paljon epäpätevyyttä.
              </p>

              <p>
                Useasti arokansoilla oli sellainen maine, että he olivat voittamattomia taistelukentillä. He olivat enemmän kuin ihmisiä. He olivat demoneita tai jumalia riippuen omasta mielipiteestään.
              </p>

              <p>
                Heidän riveissään kuitenkin oli paljon eriävää kansaa ja eri mieltä olevia ihmisiä. Heillä oli sotilasjohtajia, jotka kykenivät johtamaan omaa tekemistään, johtamaan esimerkillä ja johtamaan edestä.
              </p>

              <div className="my-8 p-6 bg-primary/5 border-l-4 border-primary rounded-r-sm">
                <p className="italic text-muted-foreground">
                  Heillä oli johtajia, jotka kykenivät delegoimaan omaa kuormaansa ylhäältä alaspäin ja johtajia, jotka kykenivät jalkauttamaan käskyjä ylhäältä alaspäin. Oli johtajia, joiden ei tarvinnut sanoa paljon — kun hän nosti kulmakarvaansa, oli ikään kuin maat ja taivaat olisivat alkaneet liikkumaan.
                </p>
              </div>

              <p>
                Tämän jälkeen oli kuitenkin johtajia, jotka yliarvioivat omat vahvuutensa. Heitä ei kiinnostanut pienien asioiden tekeminen, vaan he vain ryhtyivät hegemonistiseen hedonistiseen ilakointiin monien naistensa kanssa.
              </p>

              <p>
                He eivät ikinä vaivautuneet tulemaan jurtasta ulos ja silloin kun he tulivat, he juuri ja juuri pysyivät hevosensa selässä. Posket punoittivat.
              </p>

              <h3 id="luku-14" className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Luku 14: Verot ja Korruptio</h3>

              <p>
                He suhtautuivat veron maksamiseen todella tiukasti ja todella hierarkkisesti. Jos kuului yhteiskunnan ylempiin kasteihin, veroa ei tarvinnut maksaa, kun taas tavalliset ihmiset maksoivat veron, tekivät kaikki ei-halutut työt ja kontribuoivat heimojen kirstoihin.
              </p>

              <p>
                Tällä tavalla tämä loi katkeruutta. Tämä loi riitoja riveissä. Tämä sai aikaan usein jopa kapinoita heimojen sisällä, mikä saattoi olla oiva hetki vihollisille hyökätä myös ulkopuolelta ja napata ainakin osa heimon alueesta itsellensä.
              </p>

              <p>
                Korruptio oli valitettavan yleistä näihin aikoihin. Korruptio sai aikaan maaseudulla, jossa armeijat eivät pystyneet valvomaan järjestystä samalla tavalla: hevosvarkaat, maa-alueiden näkymättömät pienet kaappaukset, laitonta metsästystä, vesistöjen käyttämistä viljelysalueena, vaikka uskonnot ja pyhät lait kielsivätkin.
              </p>

              <h3 id="luku-15" className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Luku 15: Kultainen Aika</h3>

              <p>
                Usein myös armeijan viranomaiset kuin myös siviilijohtajat riitelivät keskenään vaikutusvallasta. He tiesivät toistensa asiat, koska he olivat kasvaneet yhdessä, mutta armeijakenraalit olivat usein kateellisia niistä mukavista oloista, missä siviiliprinssit ja kuninkaat saivat elää.
              </p>

              <p>
                Kun taas he joutuivat käyttämään parhaat vuodet elämästänsä sotaretkillä palellen ja nukkuen heidän ylellisillä teltoissaan — mutta kuitenkin nimenomaan teltoissaan.
              </p>

              <div className="my-8 p-6 bg-secondary/30 border-l-4 border-accent rounded-r-sm">
                <p className="italic text-muted-foreground">
                  Oli ehkä sellainen aika heidän historiassaan, kun he pystyivät istumaan saman pöydän ääreen. Kun he pystyivät jakamaan ja murtamaan leipää ja juomaan heidän pöydissään. Tätä aikakautta kutsuttiin heidän kultaa-ajaksi ja sitä oli kestänyt satoja vuosia.
                </p>
              </div>

              <p>
                He olivat pystyneet valitsemaan yhden ihmisen, joka edustaisi heitä ulkomailla, joka pystyisi päättämään heidän yhteiskuntansa yleisestä linjauksista, kun he säilyttäisivät omien heimojensa kesken laajaa autonomiaa.
              </p>

              <p>
                Heidän valtansa kasvaessa ja vallanhimonsa noustessa ja kehittyessä sitä syödessä, heidän erimielisyytensä kuitenkin nousivat, koska he eivät nytkään pystyneet sopimaan keskenään siitä, miten valtakuntaa pitäisi sisällään viedä eteenpäin ja mihin suuntaan.
              </p>

              {/* LOPPU */}
              <div className="my-16 py-12 text-center border-t-2 border-b-2 border-border">
                <p className="font-display text-2xl text-muted-foreground italic">
                  — Loppu —
                </p>
                <p className="text-muted-foreground mt-4">
                  Kiitos lukemisesta
                </p>
              </div>

            </div>
          </article>
        </div>
      </section>

      {/* Back to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all z-50"
          aria-label="Takaisin ylös"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}

      {/* Navigation */}
      <section className="py-8 border-t-2 border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto flex justify-center">
            <Link to="/romaani">
              <Button variant="outline" className="font-display uppercase tracking-wide">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Takaisin romaaniin
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default KokoKirja;

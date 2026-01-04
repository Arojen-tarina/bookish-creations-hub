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
                <p className="font-semibold text-primary mb-2">Sivut 1-20</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li><a href="#sivu-1" className="hover:text-primary">Sivu 1-5: Arojen maa</a></li>
                  <li><a href="#sivu-6" className="hover:text-primary">Sivu 6-10: Ruoka ja tavat</a></li>
                  <li><a href="#sivu-11" className="hover:text-primary">Sivu 11-15: Vapaus</a></li>
                  <li><a href="#sivu-16" className="hover:text-primary">Sivu 16-20: Talven karuus</a></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-accent mb-2">Sivut 21-40</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li><a href="#sivu-21" className="hover:text-primary">Sivu 21-25: Kunnia</a></li>
                  <li><a href="#sivu-26" className="hover:text-primary">Sivu 26-30: Henget</a></li>
                  <li><a href="#sivu-31" className="hover:text-primary">Sivu 31-35: Soturin taidot</a></li>
                  <li><a href="#sivu-36" className="hover:text-primary">Sivu 36-40: Arvot</a></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-primary mb-2">Sivut 41-50+</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li><a href="#sivu-41" className="hover:text-primary">Sivu 41-45: Johtajat</a></li>
                  <li><a href="#sivu-46" className="hover:text-primary">Sivu 46-50: Kultainen aika</a></li>
                  <li><a href="#tulevat-sivut" className="hover:text-primary text-accent">→ Tulevat sivut (51+)</a></li>
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
              
              {/* ==================== SIVUT 1-10 ==================== */}
              <div className="my-12 text-center">
                <span className="text-6xl font-display font-bold text-primary/20">I</span>
                <h2 className="font-display text-3xl font-bold mt-2">Arojen Maailma</h2>
                <p className="text-muted-foreground mt-2">Sivut 1-10</p>
              </div>

              <h3 id="sivu-1" className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Sivut 1-5: Arojen Maa</h3>
              
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

              <p>
                Oli myös paljon vitsejä siitä, että ilma Mongoliassa oli laarin rasvan peittämä, mutta tämä ei ollut heidän mielestään hauska vitsi.
              </p>

              <h3 id="sivu-6" className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Sivut 6-10: Ruoka ja Tavat</h3>

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

              {/* ==================== SIVUT 11-20 ==================== */}
              <h3 id="sivu-11" className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Sivut 11-15: Vapaus ja Karu Elämä</h3>

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

              <p>
                Mutta eivät myöskään kokeneet, että ulkomailla asiat olisivat yhtään varsin paremmin.
              </p>

              <h3 id="sivu-16" className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Sivut 16-20: Talven Karuus</h3>

              <p>
                Oli myös äärimmäisissä tapauksissa rangaistu joitakin ihmisiä siitä, jos he olivat käyttäytyneet jollain tavalla kuulemattomasti tai eettisesti väärin heidän tapojansa ja lakiensa mukaisesti.
              </p>

              <p>
                Elämä aroilla yksin varsinkin talvisaikaan oli todella raskasta, koska pakkaset saattoivat olla -20 tai jopa -30 celsiusasteita nykypäivän mittausten mukaisesti.
              </p>

              <p>
                Siinähän se kysymys onkin, miten pystyy pitämään teltan tai mökin lämpimänä yön ylitse, jos itse nukkuu ja kamina sen kuin vaan polttaa ja polttaa. Oli monia tapauksia, että ihmiset paleltuivat kuoliaaksi yksin heidän mökeissään ilman että kukaan kuuli heidän tuskanhuutonsa, joita tuskin edes oli, koska he vain kuolivat uniinsa.
              </p>

              <div className="my-8 p-6 bg-primary/5 border-l-4 border-primary rounded-r-sm">
                <p className="italic text-muted-foreground">
                  Kuoleminen yksin nähtiin myös heidän kulttuurissaan häpeällisenä, koska todelliset hautajaiset kuuluivat myös heidän kulttuuriinsa, vaikkakin eri lailla. Usein heidät haudattiin nimettömiin hautoihin, ilman että kukaan välttämättä sai selville koskaan, minne heidät oli oikeasti kaivettu.
                </p>
              </div>

              <p>
                Heimot eivät välttämättä kunnioittaneet soturia, joka kuoli taistelussa, tai siviiliä, joka kuoli vanhuuteen. He kunnioittivat heimolaista, joka oli elänyt elämänsä heidän elinolojaan parantaen — elämänsä heidän kunniaansa puolesta.
              </p>

              {/* ==================== SIVUT 21-30 ==================== */}
              <div className="my-16 text-center">
                <div className="w-full h-px bg-border mb-12"></div>
                <span className="text-6xl font-display font-bold text-accent/20">II</span>
                <h2 className="font-display text-3xl font-bold mt-2">Kunnia ja Henget</h2>
                <p className="text-muted-foreground mt-2">Sivut 21-30</p>
              </div>

              <h3 id="sivu-21" className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Sivut 21-25: Kunnia</h3>

              <p>
                Kunnia oli toinen asia, johon uskottiin, joita tultiin puolustamaan hamaan loppuun asti. Kunnioitus ja kunnia ei pelkästään tarkoittanut sitä, että omaa kunniaa puolustettiin tai omaa perhettä.
              </p>

              <p>
                Kunnioitus tarkoitti myös sitä, että sitä piti antaa muille, jotta sitä pystyi saamaan muilta. Yhteisöissä uskottiin molempipuoliseen vuorovaikuttamiseen, jos tahtoi saada apua muilta.
              </p>

              <p>
                Esimerkiksi jos tiesi, että joku oli hallinnut polttopuita itselleen mielin määrin, niitä saattoi mennä kysymään. Mutta jos itse omasi esimerkiksi lihaa, jota hänellä ei ollut, sitten odotettiin myös, että itseohjautuvasti tarjoutui tätä lihaa tarjoamaan.
              </p>

              <p>
                Rikastumista ei nähty hyvänä tässä yhteiskunnassa. Kaikki vauraudet ja rikkaudet luovutettiin heimon yhteiseen varastoon pahoja aikoja varten.
              </p>

              <h3 id="sivu-26" className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Sivut 26-30: Uhraukset ja Henget</h3>
              
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

              {/* ==================== SIVUT 31-40 ==================== */}
              <div className="my-16 text-center">
                <div className="w-full h-px bg-border mb-12"></div>
                <span className="text-6xl font-display font-bold text-primary/20">III</span>
                <h2 className="font-display text-3xl font-bold mt-2">Soturin Tie</h2>
                <p className="text-muted-foreground mt-2">Sivut 31-40</p>
              </div>

              <h3 id="sivu-31" className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Sivut 31-35: Soturin Ominaisuudet</h3>

              <p>
                Kaikille heimoille ominaisia piirteitä olivat voima, viekkaus, nopeus, kovuus. Luontaisilta ominaisuuksiltaan arokansat olivat vahvoja johtuen rankoista sääolosuhteista myös heidän liikunnallisesta elämäntyylistään.
              </p>

              <p>
                Merkittävin kontribuutio heidän vahvoille kropilleen ja mielillään oli myös heidän ruokavalio, jossa oli paljon proteiinia. He joivat paljon maitoa ja he söivät paljon lampaanlihaa.
              </p>

              <p>
                Maidossa on paljon proteiineja ja kalsiumia, jotka auttavat lihasten ja luuston vahvistamisessa. Lampaanlihassa on paljon rasvaa ja proteiinia ja rautaa, joka tukee hermoston ja lihaksiston kehittymistä aikaisesta iästä lähtien.
              </p>

              <p>
                He olivat myös tehneet raskaita, fyysisiä töitä nuoresta iästä lähtien. Noihin aikoihin ei niinkään paljon maataloustöitä, mutta he olivat tottuneet kantamaan raskaita kuormia omien kykyjensä mukaisesti.
              </p>

              <p>
                He olivat tottuneet lypsämään hevoset ja aasit. He olivat tottuneet pystyttämään ja purkamaan teltat. Telttakalusto saattoi olla raskasta ja epämukava kantaa.
              </p>

              <p>
                Pienestä iästä lähtien olivat tottuneet siihen, että heidän piti vaeltaa huonoissa sääolosuhteissa niin kuin myös hyvissäkin sääolosuhteissa. Olivat tottuneet käyttämään välillä jopa tylppiä ruokailuvälineitä pilkkoakseen sitkeää ja raakaa lihaa, joka oli usein kiinni raskaasti luustossa.
              </p>

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

              <h3 id="sivu-36" className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Sivut 36-40: Paini, Miekkailu ja Arvot</h3>

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

              <p>
                Heidän tietäällinen suhtautumisensa sukupuoliin oli eriskummallinen ulkomaalaisten mielestä. Esimerkiksi vain naisiin viitattiin sukupuolena, koska miehillä ei heidän mielestään sellaista edes ollut.
              </p>

              <p>
                He myöskin arvostivat nopeutta ja kovuutta heidän yhteiskunnassaan. Vähemmän tunnettu fakta, koska välillä olosuhteet olivat raskaat ja ottaa ihminen selvisi siellä välillä täytyi olla valmiina marssimaan pitkiä matkoja.
              </p>

              <p>
                Jos oli erottunut laumasta, piti osata navigoida yksin ja lukea luonnon antamia hienovaraisia vihjeitä. Arvostettiin myös viekkautta, koska välillä voima, nopeus ja vahvat selviytymistaidot eivät riitä.
              </p>

              <p>
                Täytyy olla ovelampi kuin luonto. Täytyy olla ovelampi kuin viekkain kettu. Tai täytyy olla ovelampi kuin se henkilö, joka haluaa pahaa sinulle.
              </p>

              <p>
                Yleisesti ottaen miten miehen täytyy tuoda itseään esille oli näiden ominaisuuksien kautta. Miehen täytyy olla vahva. Miehen täytyy olla viekas, älykäs ja selviytymiskykyinen.
              </p>

              <p>
                Naisilta taas odotettiin viehkeyttä, älyä, kykyä tuntea itsensä ja olla vaatimaton. Usein naisten asema ylenkatsotaan tämän ajan maailmassa pois, koska se on nimenomaisesti miehet, jotka ovat kirjoittaneet historian.
              </p>

              <p>
                Mutta se on naiset, jotka ovat antaneet kyvyn miehille lähteä pois leiristä, kun heidän omaisuudesta ja läheisistä pidetään huolta.
              </p>

              {/* ==================== SIVUT 41-50 ==================== */}
              <div className="my-16 text-center">
                <div className="w-full h-px bg-border mb-12"></div>
                <span className="text-6xl font-display font-bold text-accent/20">IV</span>
                <h2 className="font-display text-3xl font-bold mt-2">Johtajuus ja Valta</h2>
                <p className="text-muted-foreground mt-2">Sivut 41-50</p>
              </div>

              <h3 id="sivu-41" className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Sivut 41-45: Johtajat ja Korruptio</h3>

              <p>
                Kun miehet olivat sotaretkillä, naisilla solmittiin myös usein sisäpiirikauppoja toisten heimojen ja toisten ulkomaalaisten kanssa, koska kukaan ei ollut kotona metsästämässä ja tuomassa ruokaa ja kotitalouden pyörittämiselle välttämättömiä tarvikkeita kotiin.
              </p>

              <p>
                Myös paljon historiallista tutkimusta tehtiin silloin, kun miehet olivat sotaretkillä, koska nyt ulkomaalaisillakin saattoi olla pääsy leireihin, joissa heidät olisi todennäköisesti vain teloitettu, jos miehet olisivat olleet paikalla.
              </p>

              <p>
                Ulkomaalaisiin usein suhtauduttiin jokseenkin kielteisesti ja halveksuvasti, mutta heitä kunnioitettiin kuitenkin siinä mielessä, että heillä oli paljon sellaisia taitoja ja joitakin näitä taitoja jopa pidettiin taikavoimina ja pakanallisina oppeina ja jotka herättivät pelkoa.
              </p>

              <p>
                Melkein taikauskoista pelkoa arokansojen heimojen sydämissä ja mielissä. Esimerkiksi sanottiin, että jotkin eteläiset heimot kykenivät luomaan piippuja ja putkia, jotka pystyivät syöksymään tulta.
              </p>

              <p>
                Niin kuin länsimaalaisten tarinoissa kerrotut lohikäärmeet, jotka saattoivat viedä viatonta karjaa pois heidän paimeniensa luota. Heimojen sotaretkillä oli kuitenkin tietynlainen kunnioitus ulkomaalaisia kohtaan siinä mielessä, että kaikki ihmiset, joilla oli jokin taito, säästettiin verisempien taisteluiden ja kaupunkien piiritysten jälkeen.
              </p>

              <p>
                Oli myös tunnustettu se fakta, että jokaisella ihmisellä ja ihmisyhteisöllä pitää saada olla heidän oma kulttuurinsa ja oma uskontonsa. Toisten ihmisten uskomuksia ja tapoja ei niinkään pitäisi sortaa.
              </p>

              <p>
                Vaan niistä pitäisi katsoa vilpittömästi, että mitä hyvää niissä on ja miten ulkomaalaisten kulttuureista voitaisiin hyötyä mahdollisimman paljon.
              </p>

              <h3 id="sivu-46" className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Sivut 46-50: Kultainen Aika ja Sen Haasteet</h3>

              <p>
                Heidän yhteisistä jaetuista piirteistään huolimatta he olivat kaikki ainutlaatuisia keskenään. Kaikista näistä samankaltaisuuksista huolimatta heidän riveissään silti kyti paljon epäpätevyyttä.
              </p>

              <p>
                Useasti arokansoilla oli sellainen maine, että he olivat voittamattomia taistelukentillä. He olivat enemmän kuin ihmisiä. He olivat demoneita tai jumalia riippuen omasta mielipiteestään heistä.
              </p>

              <p>
                Heidän riveissään kuitenkin oli paljon eriävää kansaa ja eri mieltä olevia ihmisiä. Heillä oli sotilasjohtajia, jotka kykenivät johtamaan omaa tekemistään johtamaan esimerkillä ja johtamaan edestä.
              </p>

              <p>
                Heillä oli johtajia, jotka kykenivät delegoimaan omaa kuormaansa ylhäältä alaspäin ja johtajia, jotka kykenivät jalkauttamaan käskyjä ylhäältä alaspäin. Oli johtajia, joiden ei tarvinnut sanoa paljon vaan kun he kohottivat kulmakarvaansa, oli ikään kuin maat ja taivaat olisivat alkaneet liikkumaan jo tämän jälkeen.
              </p>

              <p>
                Oli kuitenkin johtajia, jotka yliarvioivat omat vahvuutensa. Heitä ei kiinnostanut pienien asioiden tekeminen, vaan he vain ryhtyivät hegemonistiseen hedonistiseen ilakointiin monien naistensa kanssa.
              </p>

              <p>
                He eivät ikinä vaivautuneet tulemaan jurtasta ulos ja silloin kun he tulivat, he juuri ja juuri pysyivät hevosensa selässä. Posket punoittivat alkoholista.
              </p>

              <p>
                He suhtautuivat veron maksamiseen todella tiukasti ja todella hierarkkisesti. Jos kuului yhteiskunnan ylempiin kasteihin, veroa ei tarvinnut maksaa, kun taas tavalliset ihmiset maksoivat veron, tekivät kaikki ei-halutut työt ja kontribuoivat heimojen kirstoihin tällä tavalla.
              </p>

              <p>
                Tämä loi katkeruutta. Tämä loi riitoja riveissä. Tämä sai aikaan usein jopa kapinoita heimojen sisällä, mikä saattoi olla oiva hetki vihollisille hyökätä myös ulkopuolelta ja napata ainakin osa heimon alueesta itsellensä.
              </p>

              <p>
                Korruptio oli valitettavan yleistä näihin aikoihin. Korruptio sai aikaan maaseudulta, jossa armeijat eivät pystyneet valvomaan järjestystä samalla tavalla, hevosvarkaat, maa-alueiden näkymättömät pienet kaappaukset.
              </p>

              <p>
                Laitonta metsästystä, vesistöjen käyttämistä viljelysalueena, vaikka uskonnot ja pyhät lait kielsivätkin. Tämän kaiken hallitsevat viranomaiset ja eliitti väittivät tätä suurimmaksi korruption lähteeksi.
              </p>

              <p>
                Vaikka nimenomaan he olivat näkymättömien näkymättömyyksissä. Juuri he, jotka tukivat tällaista maantie- ja maalaisrosvoutta. Usein he olivat ne, jotka ostivat heidän viljansa. He olivat ne, jotka ostivat heidän hevosensa ja söivät ne lihoina.
              </p>

              <p>
                Usein myös armeijan viranomaiset kuin myös siviilijohtajat riitelivät keskenään vaikutusvallasta. He tiesivät toistensa asiat, koska he olivat kasvaneet yhdessä.
              </p>

              <p>
                Mutta he armeijakenraalit olivat usein kateellisia niistä mukavista oloista, missä siviiliprinssit ja kuninkaat saivat elää, kun taas he joutuivat käyttämään parhaat vuodet elämästänsä sotaretkillä palellen ja nukkuen heidän ylellisissa teltoissaan — mutta kuitenkin nimenomaan teltoissaan.
              </p>

              <div className="my-8 p-6 bg-secondary/30 border-l-4 border-accent rounded-r-sm">
                <p className="italic text-muted-foreground">
                  Ehkä oli sellainen aika heidän historiassaan, kun he pystyivät istumaan saman pöydän ääreen. Kun he pystyivät jakamaan ja murtamaan leipää ja juomaan heidän pöydissään. Tätä aikakautta kutsuttiin heidän kultaiseksi ajakseen ja sitä oli kestänyt satoja vuosia.
                </p>
              </div>

              <p>
                He olivat pystyneet valitsemaan yhden ihmisen, joka edustaisi heitä ulkomailla, joka pystyisi päättämään heidän yhteiskuntansa yleisestä linjauksista, kun he säilyttäisivät omien heimojensa kesken laajaa autonomiaa, josta he kaikki silloin nauttivat.
              </p>

              <p>
                Heidän valtansa kasvaessa ja eksponentiaalisesti vallanhimonsa noustessa ja kehittyessä sitä syödessä, heidän erimielisyytensä kuitenkin nousivat. Koska he eivät nytkään pystyneet sopimaan keskenään siitä, miten valtakuntaa pitäisi sisällään viedä eteenpäin ja mihin suuntaan.
              </p>

              {/* ==================== TULEVAT SIVUT - PAIKKAMERKIT ==================== */}
              <div id="tulevat-sivut" className="my-16 text-center scroll-mt-20">
                <div className="w-full h-px bg-border mb-12"></div>
                <span className="text-6xl font-display font-bold text-muted-foreground/20">...</span>
                <h2 className="font-display text-3xl font-bold mt-2 text-muted-foreground">Tulevat Sivut</h2>
                <p className="text-muted-foreground mt-2">Lisää tekstiä tähän alle</p>
              </div>

              {/* ==================== SIVU 51-60: LISÄÄ TEKSTI TÄHÄN ==================== */}
              <div className="my-12 p-8 bg-muted/50 border-2 border-dashed border-muted-foreground/30 rounded-lg">
                <h3 id="sivu-51" className="font-display text-2xl font-bold mb-4 text-muted-foreground scroll-mt-20">
                  Sivut 51-60
                </h3>
                <p className="text-muted-foreground italic mb-4">
                  Lisää tänne sivujen 51-60 teksti...
                </p>
                {/* 
                  OHJEET: Korvaa tämä kommentti ja yllä oleva placeholder-teksti 
                  oikealla romaanin tekstillä. Käytä samaa muotoilua kuin yllä olevissa osioissa:
                  
                  <p>
                    Tekstisi tähän...
                  </p>
                  
                  Lainaukset ja korostukset:
                  <div className="my-8 p-6 bg-secondary/30 border-l-4 border-accent rounded-r-sm">
                    <p className="italic text-muted-foreground">
                      Lainaus tai korostettu teksti...
                    </p>
                  </div>
                */}
              </div>

              {/* ==================== SIVU 61-70: LISÄÄ TEKSTI TÄHÄN ==================== */}
              <div className="my-12 p-8 bg-muted/50 border-2 border-dashed border-muted-foreground/30 rounded-lg">
                <h3 id="sivu-61" className="font-display text-2xl font-bold mb-4 text-muted-foreground scroll-mt-20">
                  Sivut 61-70
                </h3>
                <p className="text-muted-foreground italic mb-4">
                  Lisää tänne sivujen 61-70 teksti...
                </p>
              </div>

              {/* ==================== SIVU 71-80: LISÄÄ TEKSTI TÄHÄN ==================== */}
              <div className="my-12 p-8 bg-muted/50 border-2 border-dashed border-muted-foreground/30 rounded-lg">
                <h3 id="sivu-71" className="font-display text-2xl font-bold mb-4 text-muted-foreground scroll-mt-20">
                  Sivut 71-80
                </h3>
                <p className="text-muted-foreground italic mb-4">
                  Lisää tänne sivujen 71-80 teksti...
                </p>
              </div>

              {/* ==================== SIVU 81-90: LISÄÄ TEKSTI TÄHÄN ==================== */}
              <div className="my-12 p-8 bg-muted/50 border-2 border-dashed border-muted-foreground/30 rounded-lg">
                <h3 id="sivu-81" className="font-display text-2xl font-bold mb-4 text-muted-foreground scroll-mt-20">
                  Sivut 81-90
                </h3>
                <p className="text-muted-foreground italic mb-4">
                  Lisää tänne sivujen 81-90 teksti...
                </p>
              </div>

              {/* ==================== SIVU 91-100: LISÄÄ TEKSTI TÄHÄN ==================== */}
              <div className="my-12 p-8 bg-muted/50 border-2 border-dashed border-muted-foreground/30 rounded-lg">
                <h3 id="sivu-91" className="font-display text-2xl font-bold mb-4 text-muted-foreground scroll-mt-20">
                  Sivut 91-100
                </h3>
                <p className="text-muted-foreground italic mb-4">
                  Lisää tänne sivujen 91-100 teksti...
                </p>
              </div>

              {/* ==================== LISÄÄ UUSIA OSIOITA TÄHÄN ==================== */}
              {/* 
                KOPIOI TÄMÄ POHJA UUSILLE SIVUILLE:
                
                <div className="my-12 p-8 bg-muted/50 border-2 border-dashed border-muted-foreground/30 rounded-lg">
                  <h3 id="sivu-XXX" className="font-display text-2xl font-bold mb-4 text-muted-foreground scroll-mt-20">
                    Sivut XXX-YYY
                  </h3>
                  <p>
                    Tekstisi tähän...
                  </p>
                </div>
                
                TAI KUN TEKSTI ON VALMIS, KÄYTÄ TÄTÄ MUOTOILUA:
                
                <h3 id="sivu-XXX" className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">
                  Sivut XXX-YYY: Otsikko
                </h3>
                <p>
                  Ensimmäinen kappale...
                </p>
                <p>
                  Toinen kappale...
                </p>
              */}

              {/* Loppu */}
              <div className="my-16 text-center">
                <div className="w-full h-px bg-border mb-8"></div>
                <p className="text-muted-foreground italic">Tarina jatkuu...</p>
                <p className="text-sm text-muted-foreground mt-4">
                  Lisää uusia sivuja muokkaamalla tiedostoa: <code className="bg-muted px-2 py-1 rounded">src/pages/KokoKirja.tsx</code>
                </p>
              </div>

            </div>
          </article>
        </div>
      </section>

      {/* Scroll to top button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 rounded-full w-12 h-12 shadow-lg z-50"
          size="icon"
        >
          <ChevronUp className="w-6 h-6" />
        </Button>
      )}
    </Layout>
  );
};

export default KokoKirja;

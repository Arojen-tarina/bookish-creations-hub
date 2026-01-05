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
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="font-semibold text-primary mb-2">Ensimmäinen kirja</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li><a href="#osa-1" className="hover:text-primary">Arojen maailma (s. 1-50)</a></li>
                  <li><a href="#osa-2" className="hover:text-primary">Jonin lapsuus (s. 51-100)</a></li>
                  <li><a href="#osa-3" className="hover:text-primary">Ensimmäinen taistelu (s. 101-150)</a></li>
                  <li><a href="#osa-4" className="hover:text-primary">Uskomusten kirja (s. 151-250)</a></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-accent mb-2">Toinen kirja</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li><a href="#osa-5" className="hover:text-primary">Jonin ja isän taistelu (s. 251-300)</a></li>
                  <li><a href="#osa-6" className="hover:text-primary">Valloitusretket (s. 301-350)</a></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-primary mb-2">Kolmas kirja</p>
                <ul className="space-y-1 text-muted-foreground">
                  <li><a href="#osa-7" className="hover:text-primary">Suuri sota (s. 351-360)</a></li>
                  <li><a href="#osa-8" className="hover:text-primary">Epilogi (s. 361-368)</a></li>
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
              
              {/* ==================== ENSIMMÄINEN KIRJA ==================== */}
              <div className="my-12 text-center">
                <span className="text-6xl font-display font-bold text-primary/20">I</span>
                <h2 id="osa-1" className="font-display text-3xl font-bold mt-2 scroll-mt-20">Ensimmäinen Kirja</h2>
                <p className="text-muted-foreground mt-2">Arojen Maailma</p>
              </div>

              <h3 className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Arojen Maa</h3>
              
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

              <h3 className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Ruoka ja Tavat</h3>

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

              <h3 className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Vapaus ja Karu Elämä</h3>

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

              <h3 className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Talven Karuus</h3>

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

              <h3 className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Kunnia</h3>

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

              <h3 className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Uhraukset ja Henget</h3>
              
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

              <h3 className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Soturin Ominaisuudet</h3>

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

              <h3 className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Paini, Miekkailu ja Arvot</h3>

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
                Miekkailuun kuului myös muunlaisia teräviä aseita, kuten keihäiden ja tikareiden ja kirveiden käyttöä. Nämä olivat kaikki tehty puusta harjoitusta varten. Nuorena lasten täytyi opetella myös pään ja niskan käyttöä.
              </p>

              <p>
                Arokansojen nyrkkeily on nimeltään päällepainiminen. Se sisältää pääniskuja ja otekaadon ja muistuttaa meidän vapaapainimme ja länsimaisen nyrkkeilyn sekoitusta. Mutta suurin ero on se, että päätäkin sai käyttää.
              </p>

              <h3 className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Johtajat ja Päätöksenteko</h3>

              <p>
                Suurimpia arvoja, mitä arokansalaiset jakoivat ja opettivat nuoremmille sukupolville, olivat uskollisuus, kunnia ja voima. Uskollisuus tarkoitti sitä, että pidettiin huoli omasta perheestä ja heimostaan.
              </p>

              <p>
                Jokainen ihminen oli valmis tulemaan taistoon minkä milloin vain. He olivat valmiita uhraamaan omat henkensä, jotta heidän perheensä saisi elää, kuten myös heidän heimonsa.
              </p>

              <p>
                Vaikka kaikki olivat valmiita taisteluun, niin täytyi olla kuitenkin jonkinlaisia johtajia. Nämä johtajat valitsivat taktiikan ja strategian, jolla taistellaan. He myös informoivat sitä, milloin ja miten hyökätään. Ja onko tällä hetkellä parempaa perääntyä.
              </p>

              <p>
                Johtajien työnä oli myös informoida, oliko jollain vihollisillamme mahdollisia vaarallisia voimia ja mitä ne olivat, millä ne voi lyödä ja torjua.
              </p>

              <p>
                Johtajia oli monen tasoisia. Oli heimojohtajia, jotka päättivät ison mittakaavan asioista. Johtotasot olivat heimon eri kokoisista ryhmistä päättävät. Oli 100 miestä päättävä ja oli 10 miestä päättävä.
              </p>

              <p>
                Tällaiselle sotapolulle kouluttautui vain jokunen jokaisesta perhekunnasta, muut olivat vastuussa erilaisista tehtävistä, kuten logistiikasta, ruokien toimittamisesta, telttakalusteiden kantamisesta ja kyseisen telttakaluston pystyttämisestä ja muista logistisista asioista.
              </p>

              <p>
                Aroilla johtaja valittiin usein verimääritellysti. Se oli usein vanhin miespuolinen henkilö. Mutta toisinaan kuka tahansa pystyi haastamaan johtajan kaksintaisteluun. Ja siinä tapauksessa kaikki oli mahdollista.
              </p>

              <div className="my-8 p-6 bg-secondary/30 border-l-4 border-accent rounded-r-sm">
                <p className="italic text-muted-foreground">
                  Aroilla johtaja valittiin usein verimääritellysti. Se oli usein vanhin miespuolinen henkilö. Mutta toisinaan kuka tahansa pystyi haastamaan johtajan kaksintaisteluun. Ja siinä tapauksessa kaikki oli mahdollista.
                </p>
              </div>

              <h3 className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Kultainen Aika</h3>

              <p>
                Kultaisena aikana kaikki oli rauhaa. Silloin oli kaunis sää ja paljon ruokaa ja kauniita ihmisiä ja lepoa. Kultainen aika oli juuri se, mitä kaikki kaipasivat ja halusivat, mutta joita harva ikinä sai.
              </p>

              <p>
                Tämän kultaisen ajan saavuttaminen on jokaiselle yksilölle erilaista. Osa näistä kultaisista ajoista tulevat eri elämäntilanteissa oleville ihmisille eri tavalla.
              </p>

              <p>
                Nuorelle miehelle kultainen aika saattoi tulla sen jälkeen, kun hän oli saavuttanut jotain hienoa. Hän oli saanut oman telttansa tai perheensä. Hän oli saanut jotakin palkkiota siitä, että hän oli tapistanut vihollisen ja oli saanut kunniamainintoja sotaretkilleen.
              </p>

              <p>
                Vanhemmalle miehelle kultainen aika usein tulee sen jälkeen, kun ura on tullut päätökseensä. Kun ei enää tarvitse miettiä uraa ja kun on jo rakennettu kaikki se, mitä on tarvinnut saavuttaa. Mutta aina kultainen aika ei tullut aikuisenakaan.
              </p>

              <p>
                Arokansat elivät jatkuvien konfliktien varjossa.
              </p>

              {/* ==================== OSA 2: JONIN LAPSUUS ==================== */}
              <div className="my-16 text-center">
                <div className="w-full h-px bg-border mb-12"></div>
                <span className="text-6xl font-display font-bold text-accent/20">II</span>
                <h2 id="osa-2" className="font-display text-3xl font-bold mt-2 scroll-mt-20">Jonin Lapsuus</h2>
                <p className="text-muted-foreground mt-2">Sivut 51-100</p>
              </div>

              <h3 className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Jonin Syntymä</h3>

              <p>
                Keskitymmeko nyt tarinamme päähenkilöön ja hänen tarinaansa. Hänen nimekseen annettiin joni, mikä tarkoittaa heimollisesti tietynlaista nuorta metsästyskoiraa.
              </p>

              <p>
                Tarinassamme ei ollut Djonin syntymässä mitään erikoista. Hänellä ei myöskään ollut ihmeellistä lapsuutta tai kummallisia olosuhteita. Varmasti kaikki olivat tulleet samanlaisista lähtökohdista niin kuin kaikki muutkin aroilla.
              </p>

              <p>
                Varmasti myös kukaan ei olisi uskonut, että hänestä tulisi sitä jota hänestä lopulta tuli. Hänen äitinsä oli tottunut kolmelta mieheltä hyväksikäyttöön, joista yhdeltä oli syntynyt ioni.
              </p>

              <p>
                Seuraava mies hyväksikäytti häntä. Myös fyysisesti, hän usein palasi juopuneena kotiin ja pahoinpiteli sekä hänen äitinsä, että hänet ja hänen sisaruksiaan.
              </p>

              <p>
                Jonista tuli vanhempi mies ja hänellä oli paljon velvollisuuksia, mitä äiti hänen harteilleen olisi laskenut. Joni oli vastuussa hänen pikkuveljiensä ja pikkusiskojensa hyvinvoinnista.
              </p>

              <p>
                Hän oli usein laittamassa ruokaa ja tuomassa saalista heidän kotijurttaansa. Koska hänen isänsä ei ollut enää kyvykäs siihen.
              </p>

              <p>
                Kuitenkin hänellä oli myös vapaa-aikaa ja vapaa-ajalla hän usein leikki hänen pikku sisarustensa kanssa, mutta koska hän oli niin paljon vanhempi kuin he, hän usein turhautui siihen.
              </p>

              <p>
                Hänen vanhempansa olivat huomanneet, miten hänen silmänsä loisivat ja leikkasivat auringon valossa. Tämä oli merkki siitä, että hänessä oli henkeä, joka oli suojelemassa häntä.
              </p>

              <div className="my-8 p-6 bg-primary/5 border-l-4 border-primary rounded-r-sm">
                <p className="italic text-muted-foreground">
                  Yksi asia oli erikoista jonissa. Hänen vanhempansa olivat huomanneet, miten hänen silmänsä loisivat ja leikkasivat auringon valossa. Tämä oli merkki siitä, että hänessä oli henkeä, joka oli suojelemassa häntä.
                </p>
              </div>

              <h3 className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Hevosten Kanssa</h3>

              <p>
                Jonin lapsuuden parhaat hetket olivat hänen isosiskonsa kanssa, joka leikki usein hänen kanssaan heidän ainoalla hevosella.
              </p>

              <p>
                Heidän mielikuvituksensa loi tälle hevoselle suuren merkityksen. Se oli heidän omansa. Mitä kukaan ei voisi viedä heiltä pois. Kukaan ei ikinä voisi tietää, mitä se merkitsee heille.
              </p>

              <p>
                He leikkivät kuin mikään ei olisi väliä, ihan kuin he eivät olisi siellä missä he olivat. Heidän mielikuvituksensa pystyi korvaamaan sen surun, minkä heidän isänsä heihin kohdistivat.
              </p>

              <p>
                Mutta aina tämä mielikuvitus ei pelastanut heitä shokilta, kun heidän oli palattava takaisin heidän reaalielämäänsä.
              </p>

              <p>
                Jonin isosisko suojeli häntä usein isänsä hyökkäyksiltä. Hän meni eteensä seisomaan ja otti usein vastaan lyöntejä, joita oli tarkoitettu ionille tai hänen muille sisaruksilleen.
              </p>

              <p>
                Yksi asia, jota ioni ei koskaan antaisi itselleen anteeksi, oli se, kun hänen oli joskus jätettävä hänen siskonsa yksin, kun hän yksinkertaisesti ei halunnut olla paikalla enää tässä tilanteessa. Hän joskus myös halusi juosta pakoon metsään ja piiloutua sinne tietäen kuitenkin, että hänellä ei olisi mitään mahdollisuuksia olla poissa kauaa.
              </p>

              <h3 className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Ankarat Talvet</h3>

              <p>
                Yksi talvi oli sellainen, että kaikki melkein kuolivat. Ruokaa ei ollut, koska sitä ei ollut varastoitu tarpeeksi talveksi.
              </p>

              <p>
                Itseasiassa tuntui siltä, kun he olisivat nääntyä kuoliaaksi. Kuitenkin jokin vei heidät eteenpäin. Jokin meni jaksamaan eteenpäin jokainen yksi päivä kerrallaan.
              </p>

              <p>
                Jokin vei heitä eteenpäin tämän tuskan, kylmyyden ja lohduttomuuden keskellä. Ruuanlaittajia ei ollut, koska heidän isänsä oli kaapannut heidän leiristään oman perhekuntansa erilleen taistellessaan toisen johtajan kanssa.
              </p>

              <p>
                Jonin äiti oli joutunut tekemään kaikki ruuat, jotka koostuivat vain juurista ja yrteistä, joita löytyi lumikinoksien alta. Ei vain ruuanlaittajia, mutta myöskään lääkäreitä ei ollut mukana ollenkaan.
              </p>

              <p>
                Jonilla ei ollut taitoja käydä metsästämässä tässä vaiheessa, mutta hänen olisi ollut pakko oppia. Hänen olisi pitänyt jonkun opettaa, mutta miten hän olisi voinut omillaan oppia näitä asioita.
              </p>

              <p>
                He sinnittelivät sen talven läpi. Se oli rankin aika, mitä yksikään heistä oli koskaan kokenut ja se ylitti jopa sen kivun, mitä heidän isänsä oli heihin kohdistanut.
              </p>

              <div className="my-8 p-6 bg-secondary/30 border-l-4 border-accent rounded-r-sm">
                <p className="italic text-muted-foreground">
                  Tuli aika, kun joni todella halusi tappaa hänen isänsä. Oli niin monta asiaa, mitä hän teki väärin. Ei vain häneen ja hänen perheeseensä, mutta myös omiin joukkoihinsa.
                </p>
              </div>

              <h3 className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Soturiksi Kasvaminen</h3>

              <p>
                Jonista kehittyi vahva nuori mies. Vaikka hän oli fyysisesti nääntyneessä tilassa aikanaan, hän oli kasvanut isokokoiseksi ja resilienssiä täyteen.
              </p>

              <p>
                Hän oli tullut kovaksi tuhansien tuntien kovan harjoittelun myötä. Hän oli tullut tuhansia tunteja viisaammaksi hänen opettajaltaan, joka oli jakanut oman tietonsa hänelle.
              </p>

              <p>
                Nyt koitti yksi asia, jota hän ei olisi halunnut kohdata: hänen olisi mentävä sotaan. Hänen isänsä kanssa ja hänen oli tehtävä niin kuin käskettiin epätoivoisella tavalla ja ehkä se olisi ollut parempi elämä, jos hän olisi kuollut tälle sotaretkelle.
              </p>

              <p>
                Mutta hänen mieleensä tuli hänen sisaruksensa ja äitinsä ja hänen isosiskonsa, joka suojeli heitä kaikkia.
              </p>

              <p>
                Mikäli joni kuolisi, kuka olisi heidän puskurinaan? Kuka olisi heitä suojelemassa? Kuka olisi hoitamassa heitä? He kaikki olivat hänen mielestään niin vajavaisessa tilassa, että heidän itsenäinen selviytymisensä ei olisi mahdollista.
              </p>

              <p>
                Hänen isänsä saattoi olla paha mies, mutta hänen auktoriteettiasemansa ja arvonsa mahdollistivat perheelle sen, että he saivat tarpeeksi ruokaa, he saivat pitää telttansa ja he saivat olla edes jotenkin turvassa.
              </p>

              {/* ==================== OSA 3: ENSIMMÄINEN TAISTELU ==================== */}
              <div className="my-16 text-center">
                <div className="w-full h-px bg-border mb-12"></div>
                <span className="text-6xl font-display font-bold text-primary/20">III</span>
                <h2 id="osa-3" className="font-display text-3xl font-bold mt-2 scroll-mt-20">Ensimmäinen Taistelu</h2>
                <p className="text-muted-foreground mt-2">Sivut 101-150</p>
              </div>

              <h3 className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Sotaretken Alku</h3>

              <p>
                Nyt tuli aika lähteä sotaretkelle. Ensimmäistä kertaa jonille tuli tilaisuus nähdä omin silmin, mitä sota todellisuudessa oli.
              </p>

              <p>
                Vaikka hän oli kokenut äärimmäistä tuskaa lapsuudessaan, tämä kokemus tulisi olemaan jotain aivan erilaista. Hän tulisi näkemään kuolemaa ja kärsimystä mittakaavassa, jota hän ei ollut koskaan voinut kuvitella.
              </p>

              <p>
                Joukot kokoontuivat aamunkoitteessa. Hevosia valmisteltiin ja aseita tarkistettiin. Jonin isä seisoi joukkojen edessä, antaen käskyjä kovalla äänellä.
              </p>

              <p>
                Joni katsoi häntä vihaisen silmien läpi. Hän tiesi, että hänen oli toteltava tätä miestä, mutta sisällään hän vannoi, että jonain päivänä asiat olisivat toisin.
              </p>

              <p>
                Marssi kesti useita päiviä. He kulkivat läpi arojen, ylittivät jokia ja kiipesivät vuoria. Joka ilta leiri pystytettiin ja joka aamu se purettiin.
              </p>

              <p>
                Rutiini oli kova, mutta joni oli tottunut kovuuteen. Hän teki työnsä valittamatta ja ansaitsi pikku hiljaa muiden sotilaiden kunnioituksen.
              </p>

              <div className="my-8 p-6 bg-primary/5 border-l-4 border-primary rounded-r-sm">
                <p className="italic text-muted-foreground">
                  Ensimmäinen taistelu tuli yllättäen. Vihollisen joukot hyökkäsivät aamunkoitteessa, kun monet vielä nukkuivat. Kaaos oli täydellinen, mutta jotenkin joni pysyi rauhallisena.
                </p>
              </div>

              <h3 className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Taistelun Kaaos</h3>

              <p>
                Hän tarttui miekkaansa ja asettui taisteluasentoon. Ympärillään hän näki miehiä kaatuvan, mutta hän keskittyi vain siihen, mitä hänen piti tehdä.
              </p>

              <p>
                Ensimmäinen vihollinen tuli häntä kohti miekka koholla. Joni väisti iskun ja löi takaisin. Hänen miekkansa osui ja vihollinen kaatui.
              </p>

              <p>
                Se oli hänen ensimmäinen tappamisensa. Hän tunsi oudon tyhjyyden sisällään. Ei voitonriemua, ei katumusta - vain tyhjyyttä.
              </p>

              <p>
                Taistelu kesti tunteja. Kun se viimein päättyi, joni seisoi verisen kentän keskellä, tuijottaen kaatuneiden ruumiita.
              </p>

              <p>
                Hän oli selvinnyt. Mutta osa hänestä oli kuollut sinä päivänä - se viaton osa, joka oli vielä uskonut, että maailma voisi olla hyvä.
              </p>

              {/* ==================== OSA 4: USKOMUSTEN KIRJA ==================== */}
              <div className="my-16 text-center">
                <div className="w-full h-px bg-border mb-12"></div>
                <span className="text-6xl font-display font-bold text-accent/20">IV</span>
                <h2 id="osa-4" className="font-display text-3xl font-bold mt-2 scroll-mt-20">Uskomusten Kirja</h2>
                <p className="text-muted-foreground mt-2">Sivut 151-250</p>
              </div>

              <h3 className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Shamaanin Opetukset</h3>

              <p>
                Taistelun jälkeen shamaani kutsui jonin luokseen. Hän oli vanha mies, jonka silmät näyttivät näkevän asioita, joita muut eivät nähneet.
              </p>

              <p>
                "Sinussa on voimaa," shamaani sanoi. "Näen sen. Kosmiset olennot ovat sinun puolellasi."
              </p>

              <p>
                Shamaani alkoi kertoa tarinaa maailman synnystä. Se oli tarina, joka oli kulkenut sukupolvelta toiselle, ja nyt se kerrottiin jonille.
              </p>

              <div className="my-8 p-6 bg-secondary/30 border-l-4 border-accent rounded-r-sm">
                <p className="italic text-muted-foreground">
                  "Alussa ei ollut mitään. Vain tyhjyys ja hiljaisuus. Mutta tyhjyydessä oli siemen - kipinä, joka odotti heräämistään."
                </p>
              </div>

              <h3 className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Luomistarina</h3>

              <p>
                Shamaani kertoi, miten kosmiset olennot olivat syntyneet tyhjyydestä. He olivat puhdasta energiaa, valoa ja pimeyttä yhdessä.
              </p>

              <p>
                Hirvi ja susi olivat ensimmäiset hahmot. He taistelivat keskenään, mutta heidän taistelunsa ei ollut vihamielistä - se oli tanssia, joka loi maailman.
              </p>

              <p>
                Heidän liikkeensä loivat vuoret ja joet, metsät ja arot. Jokainen askel jätti jäljen, joka muuttui maaperään.
              </p>

              <p>
                "Nämä kosmiset olennot eivät ole jumalia sanan tavallisessa merkityksessä," shamaani selitti. "He ovat voimia, energioita, jotka virtaavat kaiken läpi."
              </p>

              <p>
                "Kun katsot aurinkoa, näet valon olennon. Kun tunnet tuulen, tunnet heidän hengityksensä. Olemme kaikki osa tätä suurta tanssia."
              </p>

              <h3 className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Tasapaino ja Rakkaus</h3>

              <p>
                Shamaanin opetuksen ydin oli tasapaino. Ei ollut puhdasta hyvää eikä puhdasta pahaa - oli vain tasapaino ja epätasapaino.
              </p>

              <p>
                "Valo tarvitsee pimeyttä," shamaani sanoi. "Ilman yötä päivä ei olisi arvokas. Ilman surua emme tuntisi iloa."
              </p>

              <p>
                Rakkaus oli voima, joka piti kaiken koossa. Se ei ollut vain tunne kahden ihmisen välillä - se oli kosminen voima, joka yhdisti kaiken.
              </p>

              <p>
                "Kun rakastat, olet osa suurta kokonaisuutta. Kun vihaat, erotat itsesi siitä. Mutta kumpikin on tarpeen. Kumpikin opettaa."
              </p>

              <div className="my-8 p-6 bg-primary/5 border-l-4 border-primary rounded-r-sm">
                <p className="italic text-muted-foreground">
                  "Sinä, joni, olet valittu. En tiedä mihin, mutta näen sen. Kosmiset voimat ovat asettaneet sinut polulle, jota et vielä ymmärrä. Mutta ymmärrät. Aikanaan ymmärrät."
                </p>
              </div>

              <h3 className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Shamaanin Tehtävä</h3>

              <p>
                Shamaani kertoi omasta tehtävästään. Hän oli sanansaattaja, silta näkyvän ja näkymättömän maailman välillä.
              </p>

              <p>
                Hänen työnsä oli tulkita merkkejä, parantaa sairaita, johdattaa kuolleiden sielut tuonpuoleiseen ja pitää yhteisön henkinen tasapaino.
              </p>

              <p>
                "Jokainen heimokansa tarvitsee shamaanin," hän sanoi. "Ilman meitä yhteys kosmisiin voimiin katkeaisi. Ihmiset unohtaisivat, mistä he tulevat ja minne he menevät."
              </p>

              <p>
                Shamaanin työ oli raskasta. Hän kantoi muitten taakkoja, kuuli heidän huolensa ja näki heidän sielunsa pimeät puolet.
              </p>

              <p>
                "Mutta se on myös siunaus," hän sanoi hymyillen. "Näen myös kauneuden. Näen rakkauden ja uhrauksen ja rohkeuden. Näen ihmisyyden parhaimmillaan."
              </p>

              {/* ==================== TOINEN KIRJA ==================== */}
              <div className="my-16 text-center">
                <div className="w-full h-px bg-border mb-12"></div>
                <span className="text-6xl font-display font-bold text-primary/20">V</span>
                <h2 id="osa-5" className="font-display text-3xl font-bold mt-2 scroll-mt-20">Toinen Kirja</h2>
                <p className="text-muted-foreground mt-2">Jonin ja Isän Taistelu - Sivut 251-300</p>
              </div>

              <h3 className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Shamaanin Haaste</h3>

              <p>
                Shamaanilla olisi tänään edessään pitkä päivä, koska hänen pitäisi suorittaa loppuun todella monta erilaista rituaalia liittyen eri asioihin, kuten henkien miellyttämiseen, synninpäästöön, ruumiiden hautaamiseen ja taistelukentän puhdistamiseen kaikesta pahasta hengestä.
              </p>

              <p>
                Seuraavaksi shamaanin tehtävänä olisi kävellä taistelukentän halki joukon kanssa, jotka identifioisivat kaatuneet. Jos he olivat johtajia, heidät haudattaisiin eri tavalla.
              </p>

              <p>
                Johtajat tultaisiin hautaamaan erikseen, kun taas tavalliset rivimiehet tultaisiin kaivamaan johonkin samaan kuoppaan. Tämä ei johtunut niinkään siitä, että heidän henkensä ja elämänsä olisivat vähemmän arvoisia, mutta tämä johtui siitä, että heitä oli niin paljon.
              </p>

              <p>
                Tämä rituaali tehtäisiin laulamalla perinteistä kurkkulaulua, minkä lisäksi erilaisia suitsukkeita tultaisiin levittämään. Tässä kulttuurissa hautaamisessa oli tärkeää se, että se tehtiin puhtaasti ympäristöön vahingoittamatta.
              </p>

              <p>
                Nyt shamaani törmäsi erääseen nuoreen poikaan, tarinamme päähenkilöön joniin, joka oli osallistunut myös taistelun perästä.
              </p>

              <div className="my-8 p-6 bg-secondary/30 border-l-4 border-accent rounded-r-sm">
                <p className="italic text-muted-foreground">
                  Hän oli tappanut ensimmäisen miehen, joka oli selvästi ottanut koville. Hän itki ja panikoi, kun shamaani katsoi häntä lukkiutuneena.
                </p>
              </div>

              <p>
                Shamaani sanoi: "Nuori mies, itke vain. Se helpottaa. Olet kärsinyt kovia, kuten me kaikki, mutta sinuun tämä ottaa paljon kovemmin kuin muihin, koska tämä oli ensimmäinen kertasi. Huomaan myös, että olet syvällinen ja herkkä sielu. Taistelukenttä ei ole kaltaisillesi tehty."
              </p>

              <h3 className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Isän Kohtaaminen</h3>

              <p>
                Jonin isä oli kuunnellut tätä keskustelua viereisen teltan takana. Hän tuli jonin viereen, otti jonia niskasta kiinni puristaen häntä niin, että se sattui.
              </p>

              <p>
                Hän katsoi shamaania vihaisesti. Shamaani katsoi jonin isää kuin hän ei olisi moksiskaan ja hän näkisi hänen sieluunsa.
              </p>

              <p>
                Jonin isä oli valmis vetämään miekkaansa ulos, kunnes shamaani sanoi: "Jos olisin sinä, en tekisi tuota. Jos haluat pitää oman pääsi ja kunniasi tämän jälkeen, koska shamaanin tappaminen oli niin ankarasti kielletty, että koko yhteisö, suku ja perhe tultaisiin teloittamaan."
              </p>

              <p>
                Jonin isä sanoi jonille: "Älä kuuntele tuota miestä. Hän on syönyt liikaa sieniä metsästä. Se on sekoittanut hänen aivonsa ja psyykkeensä."
              </p>

              <p>
                Joni vastasi: "Mutta isä, hän vain kertoi minulle, että minun pitäisi käyttää lahjoja, jotka minulla on myönnetty. Minä en sovi taistelukentälle. Minä tapoin ensimmäisen kerran tänään. Minun käteni ovat tahritut toisen ihmisen verellä enkä ikinä pysty antamaan itselleni anteeksi."
              </p>

              <p>
                Isä nosti kätensä ja löi rystysillään poikaansa kovasti. "Jos sinä vielä puhut tuollaisia asioita, takaan, että tulen rankaisemaan teitä kovemmin kuin ketään koskaan. Pieksän sinut henkihieveriin, koska minua ei kiinnosta sinun tuskasi."
              </p>

              <h3 className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Shamaanin Profetia</h3>

              <p>
                Isän lähdettyä shamaani sanoi jonille: "Kuule poika, sinulla ei ole mitään muuta mahdollisuutta tämän miehen kanssa kuin elää hänen alaisuudessaan ikuisesti alentuen, tai sinun on kohdattava hänet taistelussa, jossa jompikumpi tulee kuolemaan."
              </p>

              <p>
                "Sinä olet jo joni. Tulet jonain päivänä olemaan suurmies, joka tulee viemään yhteisömme takaisin sen entiseen loistoonsa yhdistäen kaikki heimot keskenään. Sinä olet se, mitä maailmamme tarvitsee."
              </p>

              <p>
                "Niitä isäsi kaltaisia miehiä riittää silmänkantamattomiin. He painavat saappaitaan meidän kaikkien niskaan. Mutta sinun on haastettava isäsi julkisesti kaksintaisteluun ja tapettava hänet. Minä tulen seisomaan sinun takanasi."
              </p>

              <div className="my-8 p-6 bg-primary/5 border-l-4 border-primary rounded-r-sm">
                <p className="italic text-muted-foreground">
                  "Minä näen sen, miten hirvi, joka loi tämän kaiken, tekee ääniä ja yrittää kutsua sinua urotöihin. Minä näen, miten susi on nälkäinen ja hän haluaa syödä tuon miehen voimat omakseen. Minä olen heidän sanansaattajansa."
                </p>
              </div>

              <h3 className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Kaksintaistelu</h3>

              <p>
                Iltaa oli koittanut ja leiritykset olivat nyt purettu. Kaikki olivat väsyneitä, valmiina palaamaan takaisin kotiin pitkän taistelun jälkeen.
              </p>

              <p>
                Joni näki isänsä odottavan vihaisen näköisenä. Hän oli ristinyt kätensä uhkaavan näköisesti. Joni käveli isänsä luokse, mutta ennen tätä hän kävelisi miekkatelineen ohi. Hän otti siitä kaksi miekkaa ja heitti toisen isänsä jalkojensa eteen.
              </p>

              <p>
                Tämä tarkoittaisi sitä, että hänen olisi otettava haaste vastaan tai elettävä elämä ilman kunniaa ja auktoriteettia. Heimossa ei kyennyt elämään ilman kunniaa.
              </p>

              <p>
                Isä sanoi: "Siinä tyhmä poika olet. Tiedätkö yhtään mitä sinä olet tehnyt? Minä olen isäsi, minä olen kasvattanut sinut. Opetin sinut hyvin, poika."
              </p>

              <p>
                Shamaani tuli johtamaan taistelun seremoniat. Hän teki perinteen mukaisesti hiekkaan ympyrän. Sitten hän teki suitsukkeella puhdistuksen kentästä.
              </p>

              <p>
                Taistelu alkoi. Isä löi ensimmäisen iskun jonin kypärää, mutta joni oli kovettunut aikaisemmista taisteluistaan. Hän ei kaatunut. Joni keräsi tasapainonsa ja korotti kilpänsä, torjuen iskun.
              </p>

              <p>
                Isä menetti tasapainonsa. Joni löi horjahtanutta isäänsä, jonka miekka lensi pois hänen kädestään. Taistelu jatkui raivokkaana, molemmat antoivat ja ottivat iskuja.
              </p>

              <p>
                Lopulta molemmat olivat maassa, liian väsyneitä jatkamaan. Mutta joni oli nuorempi ja resilientimpi. Hän toipui nopeammin.
              </p>

              <p>
                Joni haki miekkansa. Hän laittoi ne isän kurkulle viistoon ja odotti hetken. Isä sanoi viimeiseksi: "Opetin sinut hyvin, poika."
              </p>

              <p>
                Joni viilsi molemmilla käsillään. Isän pää irtosi nopeasti. Tuli hetken hiljaisuus ennen kuin joukot alkoivat hurraamaan ja huutamaan jonin nimeä.
              </p>

              <h3 className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Uusi Alku</h3>

              <p>
                Shamaani nosti jonin käden ylös merkaten hänet voittajaksi. Hän kertoi kaikille, miten jonin perheessä koettaisiin nyt uusi aika. Heidät ylennettäisiin 100-pään johtajaksi. Heille annettaisiin paremmat jurtat.
              </p>

              <p>
                Jonin äiti näytti hyvin ristiriitaiselta. Hänen aviomiehensä oli juuri kuollut, mutta hänen kärsimyksensä oli loppunut. Hän ei enää joutuisi kärsimään juopuneelta mieheltä.
              </p>

              <p>
                Näin joskus pystyi käymään arojen yhteiskunnassa tarpeeksi onnekkaille ja vahvoille ihmisille. He olivat selvinneet sortavalta mieheltä, vähävaraisuudesta ja sodasta.
              </p>

              {/* ==================== OSA 6: VALLOITUSRETKET ==================== */}
              <div className="my-16 text-center">
                <div className="w-full h-px bg-border mb-12"></div>
                <span className="text-6xl font-display font-bold text-accent/20">VI</span>
                <h2 id="osa-6" className="font-display text-3xl font-bold mt-2 scroll-mt-20">Valloitusretket</h2>
                <p className="text-muted-foreground mt-2">Sivut 301-350</p>
              </div>

              <h3 className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Shokin Jälkeen</h3>

              <p>
                Taistelu oli käyty. Joni tärisi ja hän oli jonkinnäköisessä shokkitilassa. Hänen käsivartensa olivat heikot. Hän ei pystynyt ottamaan mistään kiinni.
              </p>

              <p>
                Hänen mielessään meni nyt viime päivien tapahtumat. Hän mietti tätä shamaania, joka oli hänet sysännyt tälle tielle ilman, että hän oli ikinä edes jutellut jonille. Ihan kuin hän olisi kuitenkin jollain tavalla pitänyt häntä silmällä kaiken tämän aikaa.
              </p>

              <p>
                Nyt joni mietti sitä, miten hän tulisi nostamaan perheensä ylös nykyisestä sosiaalisesta luokastaan. Hänellä olisi paljon töitä järjestettävänä. Miten hän tulisi hallitsemaan 100 miestään?
              </p>

              <p>
                Hän meni hetkeksi viereiseen metsään ja päästi huudahduksen niin kovaa, että koko metsä kaiku ja raikui. Joni oli toisaalta ylpeä itsestään, että hän oli päättänyt tuon hirveän pedon iän. Toisaalta hän oli adrenaliinin kyllästyttämä.
              </p>

              <div className="my-8 p-6 bg-secondary/30 border-l-4 border-accent rounded-r-sm">
                <p className="italic text-muted-foreground">
                  Olikohan se niin kuin vanha sanonta menee, että kuinka ihmiset oppivat rakastamaan omia kahleitaan. Oliko joni tällainen koira? Tulisiko hänestä täysin samanlainen kuin hänen isästään?
                </p>
              </div>

              <h3 className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Joukkojen Komentaja</h3>

              <p>
                Teltassa hänen äitinsä sanoi: "Rakas poikani, sinä teit urhoallisen teon, mutta nyt sinulla on vielä pidempi tie edessäsi. Nyt sinulla on oikea vastuuta muistakin kuin itsestäsi. Nyt sinä olet aikuinen mies."
              </p>

              <p>
                Joukot olivat odottaneet häntä teltan ulkopuolella järjestäytyneenä täydellisesti. Joni alkoi määrätä käskyjä. Hän määräsi yhden partion vartioimaan perhettään ja auttamaan heitä maataloustöissä.
              </p>

              <p>
                12 partiota hän määräsi huoltojoukoiksi. Vaatteet oli pestävä. Toisen partion hän määräsi hakemaan ruokaa koko joukolle. Logistista rumpua jatkui, kunnes enää jäi 10 miestä jäljelle.
              </p>

              <p>
                Hän pyysi heitä muodostamaan marssijonon, joka tulisi hänen mukaansa puhumaan heimojohtajille.
              </p>

              <h3 className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Vallankaappaus</h3>

              <p>
                Heimojohtajien teltassa joni marssi suoraan johtajien pöytään. Henkivartijat laittoivat miekkaansa hänen poskilleen. Joni sanoi: "Lopettakaa tämä heti. Minulla on parempi idea teille."
              </p>

              <p>
                Heimojohtajat nauroivat: "Sinä tyhmä pikkupoika, mitä sinä mahdollisesti voisit tietää sodankäynnistä ja politiikasta?"
              </p>

              <p>
                Joni sanoi: "Me emme voi perääntyä niin kuin aina. Me olemme voittaneet ja meidän on jatkettava hyökkäystä." Yksi heimon johtajista näytti hämmästyneeltä ja pelokkaalta - hänestä tuli mieleen, että olisiko hän jonkinlainen vakooja.
              </p>

              <p>
                "Minä olen tullut johtamaan meidät voittamaan vihollisen heimon viimeistä kertaa." He antoivat välittömästi käskyn: "Tappakaa tuo toisinajattelija."
              </p>

              <p>
                Joni veti miekkansa esiin ja perääntyi joukkoonsa taakse. Heitä oli 10 ja henkivartijoita teltassa vain 2. Kaikki johtajat surmattiin armotta.
              </p>

              <p>
                Joni oli nyt ainoa johtaja jäljellä. Shamaani huusi kaikkialle ympärille: "Meillä on uusi heimon johtaja!" Joni antoi välittömästi käskyn kääntää suunta kohti vihollisia.
              </p>

              <h3 className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Voittoisa Sotaretki</h3>

              <p>
                Kaupunkeja otettiin haltuun piirityskoneilla. Marssiminen ei ikinä näyttänyt loppuvan. Vihollisen kaikki vastarinta oli tuhottu.
              </p>

              <p>
                Heidän virkakoneistonsa oli ollut täysin korruptoitunut johtajien tasolla. Tämän sotaretken jälkeen tehtiin suuria uudistuksia: lukuisia virkamiehiä teloitettiin ja korvattiin uusilla ja nuoremmilla.
              </p>

              <p>
                Kun vihollisheimo oli täysin kukistettu ja heidän johtajansa päät roikkuivat seipään kärjessä, oli iso armeija pidettävä yllä. Nuorempia sotureita koulutettiin lisää.
              </p>

              <p>
                Joni määräsi ensimmäisen oikean kaupungin rakennettavaksi. Kaupunki tultaisiin rakennuttamaan idän ja lännen välille - ensimmäinen hallinnollinen keskus, jossa alettaisiin pitämään kirjaa asioista.
              </p>

              <p>
                Nyt alettaisiin tekemään ensimmäisiä väestönlaskuja ja verotusta. Oli aika, jolloin verikostosta ja veriperinnöstä luovuttaisiin ja siirryttäisiin pätevyyteen.
              </p>

              <div className="my-8 p-6 bg-primary/5 border-l-4 border-primary rounded-r-sm">
                <p className="italic text-muted-foreground">
                  Pätevät ihmiset valittaisiin oikeisiin tehtäviin. Tavallisesta ihmisestäkin pystyi tulemaan jotakin armeijan kautta - eikä vain sellaisesta, joka oli sen aseman perinyt.
                </p>
              </div>

              <h3 className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Aleksanterin Taktiikka</h3>

              <p>
                Edessä oli vielä 8 heimoa. Joni keksi loistavan suunnitelman. Hän muisti lukeneensa ulkomaalaisten kääröistä Aleksanterista, joka oli voittanut persialaisia täysin epäreiluissa taisteluissa.
              </p>

              <p>
                Aleksanteri oli yksinkertaisesti marssittanut hevosensa vihollisen muodostelmasta läpi pienistä väleistä, murtautunut sisään ja tappanut vihollisen päällikön.
              </p>

              <p>
                Vihollisella oli käytössään musketteja. Ratsuväen täytyisi tehdä väistöliikettä ottaakseen vihollisten tuliaseiden huomion itseensä.
              </p>

              <p>
                Kun vihollinen keskittyisi ratsuväen häirintään, Joni ja hänen eliittijoukkonsa ryntäisivät vihollisen kolonnojen väleistä suoraan päällikköä kohti.
              </p>

              <p>
                Suunnitelma toimi. Vihollisen heimopäällikön pää leikattiin irti. Taistelu oli voitettu. Viimeiset kaksi heimoa luovuttivat tämän jälkeen ilman taistelua.
              </p>

              {/* ==================== KOLMAS KIRJA ==================== */}
              <div className="my-16 text-center">
                <div className="w-full h-px bg-border mb-12"></div>
                <span className="text-6xl font-display font-bold text-primary/20">VII</span>
                <h2 id="osa-7" className="font-display text-3xl font-bold mt-2 scroll-mt-20">Kolmas Kirja</h2>
                <p className="text-muted-foreground mt-2">Suuri Sota - Sivut 351-360</p>
              </div>

              <h3 className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Etelän Uhka</h3>

              <p>
                Viestin viejä saapui saliin. Hänellä oli vaaleampi iho ja hän näytti sivistyneeltä. Hän kertoi jonille, miten heidän hallintojärjestelmänsä olisi parempi ja että heidän pitäisi luovuttaa välittömästi.
              </p>

              <p>
                "Älkää huoliko, teidät palkitaan ruhtinaallisesti luovuttamisesta, senkin vallananastaaja. Meillä on miljoonapäinen joukko, jolle varmasti häviätte. Teillä ei ole meidän teknologiaamme tai älyämme, te senkin barbaari."
              </p>

              <p>
                Joni näytti tyyneltä. Hän tiesi mihin tämä johtaisi. Aina oli luultu seuraavan taistelun olevan viimeinen taistelu, mutta seuraava konflikti johti vain syvempään konfliktiin.
              </p>

              <p>
                Hän ei enää ajatellut voittamista tai häviämistä. Hän vain tekisi sen, mitä täytyisi tehdä. Hän painaisi eteenpäin.
              </p>

              <h3 className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Viimeinen Taistelu</h3>

              <p>
                Porteesta marssittiin ulos. Tunnelma oli riemukkaampi kuin aikaisemmissa konflikteissa. Nyt oli muurit ja järjestystä ja turvaa. Naiset hurrasivat kun lapsensa lähtivät sotaan.
              </p>

              <p>
                Partisaanit aiheuttivat tappioita, mutta ratsuväki hoiti heidät. Viikon marssin jälkeen oli menetetty noin 100 miestä, mutta vihollinen oli menettänyt kolminkertaisesti.
              </p>

              <p>
                Joella heitä odotti muuri, joka oli rakennettu laivoista. Laivat oli sidottu rautaketjuilla toisiinsa. Eliittisoturit miehittivät ne.
              </p>

              <p>
                Piirityskoneet murskasivat laivat. Osa upposi pohjaan. Vihollinen perääntyi. Mutta edessä oli vielä miljoonan miehen armeija.
              </p>

              <div className="my-8 p-6 bg-secondary/30 border-l-4 border-accent rounded-r-sm">
                <p className="italic text-muted-foreground">
                  Miten miten he pystyisivät lyömään sellaisen joukon? He luottivat siihen, että heidän armeijansa olisi paljon ketterämpi. Eteläisten mentaliteetti oli se, että ylemmät upseerit komentavat ja alemmat tottelevat orjallisesti.
                </p>
              </div>

              <p>
                Joni käytti samaa taktiikkaa kuin aina. Sillat rakennettiin, vihollinen houkuteltiin ansaan, ja ratsuväki iskeytyi heidän selustansa.
              </p>

              <p>
                Vihollisen keisari perääntyi muuriensa taakse. Muurit olivat liian vahvat murrettavaksi nykyisellä teknologialla. Sota päättyi pattitilanteeseen.
              </p>

              <p>
                Mutta se oli merkittävä voitto: eteläheimolaisille oli opetettu, että on turha lähettää joukkoja avoimeen sotaan arokansoja vastaan.
              </p>

              {/* ==================== EPILOGI ==================== */}
              <div className="my-16 text-center">
                <div className="w-full h-px bg-border mb-12"></div>
                <span className="text-6xl font-display font-bold text-accent/20">VIII</span>
                <h2 id="osa-8" className="font-display text-3xl font-bold mt-2 scroll-mt-20">Epilogi</h2>
                <p className="text-muted-foreground mt-2">Sivut 361-368</p>
              </div>

              <h3 className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Ulanbaatar</h3>

              <p>
                Kun heimot olivat viimein yhdistetty, rakennettiin suuri linna Ulanbataariin. Jonin perhe sijoitettiin sinne. Joni saapuisi voittajana, joka oli rikastuttanut valtion kirstun.
              </p>

              <p>
                Hänellä oli kiire nähdä perheensä ja rauhoittua. Hän oli unohtanut sen, miten pahalta tappaminen tuntui. Hän alkoi tuntea niitä tunteita, joita hän oli tukahduttanut.
              </p>

              <p>
                Hänen äitinsä sanoi: "Vihdoinkin olet saapunut." Hänen sisaruksensa olivat jo kasvaneet. He kertoivat hänelle kaikista asioista, mitä oli tapahtunut.
              </p>

              <h3 className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Vuorella</h3>

              <p>
                Ennen paluutaan hän teki retken vuorille. Hän leiriytyisi huipulla yön. Hän näki henkiä, hirviä ja susia. Hänen oli nukuttava puussa susilaumalta piilossa.
              </p>

              <p>
                Hän tunsi ensimmäistä kertaa olevansa rauhassa. Unissaan hevoset puhuivat hänelle: "Etsi meidät. Sinun täytyy löytää meidät taas. Sinä et saa unohtaa sitä, kuka sinä oikeasti olet."
              </p>

              <div className="my-8 p-6 bg-primary/5 border-l-4 border-primary rounded-r-sm">
                <p className="italic text-muted-foreground">
                  "Sinä olet se poika, joka oli vuosia sitten. Se poika, joka kuunteli, joka oli lojaali loppuun asti. Nyt sinusta on tullut mies, joka pystyy vuodattamaan toisen miehen verta. Mutta sinun täytyy muistaa se, kuka olit."
                </p>
              </div>

              <h3 className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Hallitsijan Vastuu</h3>

              <p>
                Palattuaan Ulanbataariin portit avattiin hänelle. Valtaistuinsalissa häntä odotti sotaneuvosto. Seuraava kokous kesti kolme tuntia.
              </p>

              <p>
                Keskusteltiin maakaupoista, oikeudellisista asioista, verotuksesta, armeijan hajauttamisesta. Nämä olivat kaikki vaikeita kysymyksiä, jotka eivät koskaan loppuisi.
              </p>

              <p>
                Mutta hän oli oppinut jotain tärkeää: heidän oli opittava rakentamaan asioita ryöstämisen sijaan. Maatalous oli alistettava yhteiskuntaan. Ja mikä tärkeintä, valtakunta oli yhdistettävä.
              </p>

              <h3 className="font-display text-2xl font-bold mt-12 mb-4 scroll-mt-20">Tarinan Loppu</h3>

              <p>
                Jonille löydettiin vaimo. Hän oli täsmälleen jonin mittainen, sisäänpäin kääntynyt ja herkkä. Hän tulisi istumaan toisella valtaistuimella hänen vieressään.
              </p>

              <p>
                Asiat tulisivat olemaan rauhallisesti vielä monta vuosikymmentä. Mutta tämä ei missään nimessä merkannyt loppua tarinalle.
              </p>

              <div className="my-8 p-6 bg-secondary/30 border-l-4 border-accent rounded-r-sm">
                <p className="italic text-muted-foreground">
                  Historiassa mikään armeija ei ole voittamaton. Mikään dynastia tai valtakunta ei tule kestämään ikuisesti. Ihmisten välille syntyy konflikteja ja eksistentiaalisia kriisejä, joita ei pystytä selittämään sanoin.
                </p>
              </div>

              <p>
                Sota on elinehto jokaiselle valtiolle, joka on ikinä ollut olemassa. Niitä tullaan käymään resurssien pulan ja ajatusten taisteluiden takia. Ihminen on tribaalinen ja väkivaltainen olento.
              </p>

              <p>
                Mutta ihminen on myös sosiaalinen ja poliittinen. Se pystyy empatiaan ja sympatiaan. Se pystyy ylittämään itsensä sukupolvien välillä. Jokainen sukupolvi voi olla edellistä parempi.
              </p>

              <p>
                Meitä ihmisiä eivät yhdistä yksinkertaisesti ne asiat, voitammeko vai häviämmekö. Meitä yhdistävät tarinat, jotka me jaamme. Nämä tarinat kertovat rakkaudesta ja menetyksestä, sodasta ja rauhasta.
              </p>

              <p>
                Ne kertovat kirjoitettuna meidän yhteisön historiamme, joka kuuluu kaikille.
              </p>

              <div className="my-16 text-center">
                <div className="w-full h-px bg-border mb-8"></div>
                <p className="text-2xl font-display font-bold text-primary">LOPPU</p>
              </div>

            </div>
          </article>
        </div>
      </section>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all z-50"
          aria-label="Takaisin ylös"
        >
          <ChevronUp className="w-6 h-6" />
        </button>
      )}

      {/* Bottom Navigation */}
      <section className="py-12 bg-secondary/30 border-t-2 border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-muted-foreground mb-6">
              Olet lukenut koko romaanin "Arojen Tarina" (368 sivua)
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/romaani">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Takaisin romaaniin
                </Button>
              </Link>
              <Link to="/lautapeli">
                <Button className="gap-2">
                  Tutustu lautapeliin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default KokoKirja;

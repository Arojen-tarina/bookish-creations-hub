/**
 * LukuOsa3.tsx — Romaanin kolmas osa: "Koettelemus"
 *
 * Luvut 11–15: Naisten rooli, ulkomaalaiset, johtajat,
 * verot ja korruptio, kultainen aika.
 */
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
              Kolmas kirja — Johtajuus, valta ja yhteiskunnan haasteet
            </p>
          </div>
        </div>
      </section>

      {/* Reading Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <article className="max-w-3xl mx-auto">
            <div className="font-body text-foreground leading-relaxed space-y-6">
              
              <h2 className="font-display text-2xl font-bold mt-8 mb-4">Luku 11: Naisten Rooli</h2>
              
              <p className="first-letter:text-5xl first-letter:font-display first-letter:font-bold first-letter:mr-2 first-letter:float-left">
                Usein naisten asema ylenkatsotaan tämän ajan maailmassa pois, koska se on nimenomaisesti miehet, jotka ovat kirjoittaneet historian. Mutta se on naiset, jotka ovat antaneet kyvyn miehille lähteä pois leiristä, kun heidän omaisuudesta ja läheisistä pidetään huolta.
              </p>

              <p>
                Kun miehet olivat pois sotaretkillä, solmittiin myös usein sisäpiirikauppoja toisten heimojen ja toisten ulkomaalaisten kanssa, koska kukaan ei ollut kotona metsästämässä ja tuomassa ruokaa ja kotitalouden pyörittämiselle välttämättömiä tarvikkeita kotiin.
              </p>

              <p>
                Myös paljon historiallista tutkimusta tehtiin silloin, kun miehet olivat sotaretkillä, koska nyt ulkomaalaisillakin saattoi olla pääsy leireihin, joissa heidät olisi todennäköisesti vain teloitettu, jos miehet olisivat olleet paikalla.
              </p>

              <h2 className="font-display text-2xl font-bold mt-12 mb-4">Luku 12: Ulkomaalaiset</h2>

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

              <h2 className="font-display text-2xl font-bold mt-12 mb-4">Luku 13: Johtajat</h2>

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

              <h2 className="font-display text-2xl font-bold mt-12 mb-4">Luku 14: Verot ja Korruptio</h2>

              <p>
                He suhtautuivat veron maksamiseen todella tiukasti ja todella hierarkkisesti. Jos kuului yhteiskunnan ylempiin kasteihin, veroa ei tarvinnut maksaa, kun taas tavalliset ihmiset maksoivat veron, tekivät kaikki ei-halutut työt ja kontribuoivat heimojen kirstoihin.
              </p>

              <p>
                Tällä tavalla tämä loi katkeruutta. Tämä loi riitoja riveissä. Tämä sai aikaan usein jopa kapinoita heimojen sisällä, mikä saattoi olla oiva hetki vihollisille hyökätä myös ulkopuolelta ja napata ainakin osa heimon alueesta itsellensä.
              </p>

              <p>
                Korruptio oli valitettavan yleistä näihin aikoihin. Korruptio sai aikaan maaseudulla, jossa armeijat eivät pystyneet valvomaan järjestystä samalla tavalla: hevosvarkaat, maa-alueiden näkymättömät pienet kaappaukset, laitonta metsästystä, vesistöjen käyttämistä viljelysalueena, vaikka uskonnot ja pyhät lait kielsivätkin.
              </p>

              <h2 className="font-display text-2xl font-bold mt-12 mb-4">Luku 15: Kultainen Aika</h2>

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

              <div className="my-12 p-8 bg-card border-2 border-border rounded-sm text-center">
                <p className="font-display text-lg text-muted-foreground italic">
                  — Ensimmäisen osan loppu —
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                  Tarina jatkuu...
                </p>
              </div>

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

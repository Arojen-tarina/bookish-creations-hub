/**
 * Projektisuunnitelma.tsx — Liiketoimintasuunnitelma-sivu
 *
 * Esittelee "Arojen Tarina" -projektin kokonaisuudessaan:
 * tiivistelmä, romaanin suunnitelma (teemat, mytologia),
 * tuotteet ja palvelut, liiketoimintasuunnitelma (talous, markkinointi)
 * ja riskianalyysi. Välilehtinä (Tabs) toteutettu.
 */
import { Layout } from "@/components/Layout";
import { ComicPanel } from "@/components/ComicPanel";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Gamepad2, 
  Palette, 
  Globe, 
  Target, 
  Users, 
  TrendingUp, 
  ShieldAlert,
  Building2,
  Lightbulb,
  Calendar,
  FileText,
  Coins,
  Store
} from "lucide-react";

const Projektisuunnitelma = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Arojen Tarina — Projektisuunnitelma
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              Kattava suunnitelma romaanille, lautapelille ja liiketoiminnalle.
            </p>
            <p className="text-sm text-muted-foreground">
              Yrityksen nimi: Arojen tarina • Y-tunnus: 12345678–9 • Joensuu
            </p>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="tiivistelma" className="max-w-5xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto gap-2">
              <TabsTrigger value="tiivistelma" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Tiivistelmä
              </TabsTrigger>
              <TabsTrigger value="romaani" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Romaani
              </TabsTrigger>
              <TabsTrigger value="tuotteet" className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4" />
                Tuotteet
              </TabsTrigger>
              <TabsTrigger value="liiketoiminta" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Liiketoiminta
              </TabsTrigger>
              <TabsTrigger value="riskit" className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                Riskit
              </TabsTrigger>
            </TabsList>

            {/* Tiivistelmä */}
            <TabsContent value="tiivistelma" className="mt-8">
              <div className="space-y-8">
                <ComicPanel variant="primary" className="p-6">
                  <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
                    <Target className="w-6 h-6" />
                    Tiivistelmä
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Olen tekemässä liiketoimintasuunnitelmaa kirjani perusteella, josta aion luoda erilaisia 
                    oheistuotteita. Näitä oheistuotteita ovat lautapelit ja digipelit. Yrityksen suunnitelma 
                    on käyttää pääosin omistamaani nettitunnusta, sekä hyödyntää tekoälyllä toimivaa 
                    nettisivua nimeltä Lovable.
                  </p>
                </ComicPanel>

                <div className="grid md:grid-cols-2 gap-6">
                  <ComicPanel>
                    <h3 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-primary" />
                      Yrityksen Taustatiedot
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Olen joensuulainen opiskelija, jolla on y-tunnus ja luotettava joukko takanani 
                      kehittämässä ja arvioimassa tuotettani. Yrityksellä ei ole liiketiloja, koska 
                      se on luova idea ja perustuu vahvasti siihen, miten saan markkinoitua sitä 
                      yksityisille kuluttajille.
                    </p>
                  </ComicPanel>

                  <ComicPanel>
                    <h3 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-accent" />
                      Visio ja Päätavoitteet
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Visiomme on tarjota kuluttajille hauskaa ajanvietettä, joka haastaa mentaalisesti 
                      ja on kehittävää kaikenikäisille. Haluamme saada ihmiset kiinnostumaan erilaisista 
                      asioista, joista ei olla kauhean tietoisia.
                    </p>
                  </ComicPanel>
                </div>

                <ComicPanel variant="accent">
                  <h3 className="font-display text-lg font-semibold mb-3">Toiminta-ajatus ja Liikeidea</h3>
                  <p className="text-muted-foreground text-sm">
                    Aion harjoittaa toimintaani käyttämällä kouluani mainostusalustana, erilaisia nettisivuja, 
                    ja myöhemmin joukkorahoituskampanjaa. Aion tehdä sopimuksia kauppojen kanssa tuotteideni 
                    myymisestä ja tuottojen jakamisesta. Aion tehdä verkkokaupan, jossa on mahdollista 
                    esikatsella ja ostaa tuotteitani.
                  </p>
                </ComicPanel>
              </div>
            </TabsContent>

            {/* Romaani */}
            <TabsContent value="romaani" className="mt-8">
              <div className="space-y-8">
                <h2 className="font-display text-2xl font-bold mb-6">Romaanin Suunnitelma</h2>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <ComicPanel variant="primary">
                    <h3 className="font-display text-lg font-semibold mb-3">
                      Trilogian Päävaiheet
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Romaanin visio rakentuu kolmesta vaiheesta: yhdistyminen, valloitus
                      ja koettelemus, jotka muodostavat eheän kokonaisuuden.
                    </p>
                  </ComicPanel>

                  <ComicPanel variant="accent">
                    <h3 className="font-display text-lg font-semibold mb-3">
                      Tyylilaji
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Historiallis-fantastinen eeppinen draama yhdistää sotaretket ja
                      mytologian rakenteellisesti läpinäkyväksi tarinaksi.
                    </p>
                  </ComicPanel>
                </div>

                <h3 className="font-display text-xl font-bold mb-4">Keskeiset Teemat</h3>
                <Accordion type="single" collapsible className="space-y-3">
                  <AccordionItem value="kunnia" className="border-2 border-border rounded-sm px-4">
                    <AccordionTrigger className="font-display">Kunnia & Resilienssi</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      Teemat käsittelevät soturin kunniakoodia ja kykyä kestää vastoinkäymisiä.
                      Paimentolaiskulttuurissa kunnia on keskeisin arvo.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="rakkaus" className="border-2 border-border rounded-sm px-4">
                    <AccordionTrigger className="font-display">Kielletty Rakkaus</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      Rakkaus, joka ylittää heimojen rajat ja kyseenalaistaa perinteiset
                      normit. Tunteiden ja velvollisuuden välinen konflikti.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="meritokratia" className="border-2 border-border rounded-sm px-4">
                    <AccordionTrigger className="font-display">Meritokratia</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      Yhteiskunta, jossa asema ansaitaan teoilla, ei syntymällä.
                      Tämä luo mahdollisuuksia mutta myös jännitteitä.
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="trauma" className="border-2 border-border rounded-sm px-4">
                    <AccordionTrigger className="font-display">Trauman Käsittely</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      Sodan ja menetyksen jälkeiset haavat. Kuinka hahmot käsittelevät
                      kokemuksiaan ja löytävät tien eteenpäin.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <h3 className="font-display text-xl font-bold mt-8 mb-4">Maailma ja Yhteiskunta</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <ComicPanel>
                    <h4 className="font-display font-semibold mb-2">Paimentolaiskulttuuri</h4>
                    <p className="text-muted-foreground text-sm">
                      Arojen paimentolaiskulttuuri korostaa ratsuväkeä ja karjanhoitoa
                      yhteiskunnan keskeisinä toimintoina.
                    </p>
                  </ComicPanel>

                  <ComicPanel>
                    <h4 className="font-display font-semibold mb-2">Lainsäädäntö ja Kunnia</h4>
                    <p className="text-muted-foreground text-sm">
                      Yhteiskunnan tiukka lainsäädäntö painottaa kunniaa ja vastuuta
                      sesonkien rytmissä toimivassa yhteisössä.
                    </p>
                  </ComicPanel>

                  <ComicPanel>
                    <h4 className="font-display font-semibold mb-2">Ulkosuhteet ja Diplomatia</h4>
                    <p className="text-muted-foreground text-sm">
                      Ryöstöretket, salakaupat ja Silkkitien diplomatia muovaavat
                      maailman ulkosuhteita.
                    </p>
                  </ComicPanel>

                  <ComicPanel>
                    <h4 className="font-display font-semibold mb-2">Uskonto ja Symboliikka</h4>
                    <p className="text-muted-foreground text-sm">
                      Shamanismi ja myyttiset eläimet — hirvi, susi, kotka, karhu ja
                      pöllö — ohjaavat kohtaloa.
                    </p>
                  </ComicPanel>
                </div>

                <h3 className="font-display text-xl font-bold mt-8 mb-4">Mytologia</h3>
                <div className="space-y-4">
                  <ComicPanel variant="primary">
                    <h4 className="font-display font-semibold mb-2">Dengri Hangin ja Luominen</h4>
                    <p className="text-muted-foreground text-sm">
                      Dengri Hangin, Hirvi, loi maan laulullaan. Tämä on mytologian
                      keskeinen luomiskertomus, joka yhdistää hahmot maahan.
                    </p>
                  </ComicPanel>

                  <ComicPanel variant="accent">
                    <h4 className="font-display font-semibold mb-2">Valon ja Pimeyden Tasapaino</h4>
                    <p className="text-muted-foreground text-sm">
                      Tasapaino valon ja pimeyden välillä korostaa, että ulkoisesti
                      pimeä voima voi sisältää valoa — ja päinvastoin.
                    </p>
                  </ComicPanel>
                </div>
              </div>
            </TabsContent>

            {/* Tuotteet */}
            <TabsContent value="tuotteet" className="mt-8">
              <div className="space-y-8">
                <h2 className="font-display text-2xl font-bold mb-6">Tuotteet ja Palvelut</h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <ComicPanel className="text-center">
                    <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="font-display text-lg font-semibold mb-2">Romaanit</h3>
                    <p className="text-muted-foreground text-sm">
                      Kolmen kirjan trilogia painettuna ja e-kirjana.
                    </p>
                  </ComicPanel>

                  <ComicPanel className="text-center">
                    <Gamepad2 className="w-12 h-12 text-accent mx-auto mb-4" />
                    <h3 className="font-display text-lg font-semibold mb-2">Lautapeli</h3>
                    <p className="text-muted-foreground text-sm">
                      Strateginen lautapeli keräilylaatikossa.
                    </p>
                  </ComicPanel>

                  <ComicPanel className="text-center">
                    <Palette className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="font-display text-lg font-semibold mb-2">Taideteokset</h3>
                    <p className="text-muted-foreground text-sm">
                      Sarjakuvataideprintit ja konseptitaide.
                    </p>
                  </ComicPanel>

                  <ComicPanel className="text-center">
                    <Globe className="w-12 h-12 text-accent mx-auto mb-4" />
                    <h3 className="font-display text-lg font-semibold mb-2">Digitaalinen</h3>
                    <p className="text-muted-foreground text-sm">
                      Äänikirjat ja digitaalinen peli.
                    </p>
                  </ComicPanel>
                </div>

                <ComicPanel>
                  <h3 className="font-display text-lg font-semibold mb-3">Palvelut</h3>
                  <p className="text-muted-foreground text-sm">
                    Yritykseni voi järjestää tapahtumia, joissa pelataan yrityksen tai muiden yritysten 
                    lautapelejä. On myös tärkeää järjestää ihmisille mahdollisuuksia kommentoida ja ottaa 
                    yhteyttä. Palvelut voivat olla myös konseptien ja kuvitteellisen maailman avaamista 
                    ihmisille ja asiakkaille.
                  </p>
                </ComicPanel>

                <h3 className="font-display text-xl font-bold mt-8 mb-4">Kohdemarkkina</h3>
                <div className="space-y-4">
                  <ComicPanel>
                    <h4 className="font-display font-semibold mb-2">Historiallisen Fiktion Lukijat</h4>
                    <p className="text-muted-foreground text-sm">
                      Aikuiset lukijat, jotka nauttivat eeppisistä tarinoista,
                      historiallisista kulttuureiden kuvauksista ja mytologiasta.
                    </p>
                  </ComicPanel>

                  <ComicPanel>
                    <h4 className="font-display font-semibold mb-2">Strategiapelaajat</h4>
                    <p className="text-muted-foreground text-sm">
                      Lautapeliharrastajat, jotka arvostavat syvällistä strategiaa,
                      historiallista teemaa ja kaunista komponenttien laatua.
                    </p>
                  </ComicPanel>

                  <ComicPanel>
                    <h4 className="font-display font-semibold mb-2">Taiteen Keräilijät</h4>
                    <p className="text-muted-foreground text-sm">
                      Sarjakuva- ja fantasiataiteen ystävät, jotka arvostavat
                      alkuperäistä taidetta ja rajoitettuja painoksia.
                    </p>
                  </ComicPanel>
                </div>

                <h3 className="font-display text-xl font-bold mt-8 mb-4">Tulovirrat</h3>
                <div className="grid md:grid-cols-3 gap-6">
                  <ComicPanel variant="primary">
                    <span className="text-3xl font-display font-bold text-primary/30">1</span>
                    <h4 className="font-display font-semibold mt-2 mb-2">Kirjamyynti</h4>
                    <ul className="text-muted-foreground text-sm space-y-1">
                      <li>• Painetut kirjat</li>
                      <li>• E-kirjat</li>
                      <li>• Äänikirjat</li>
                      <li>• Keräilyversiot</li>
                    </ul>
                  </ComicPanel>

                  <ComicPanel variant="accent">
                    <span className="text-3xl font-display font-bold text-accent/30">2</span>
                    <h4 className="font-display font-semibold mt-2 mb-2">Pelimyynti</h4>
                    <ul className="text-muted-foreground text-sm space-y-1">
                      <li>• Lautapeli</li>
                      <li>• Laajennukset</li>
                      <li>• Digitaalinen versio</li>
                      <li>• Lisensointi</li>
                    </ul>
                  </ComicPanel>

                  <ComicPanel>
                    <span className="text-3xl font-display font-bold text-muted-foreground/30">3</span>
                    <h4 className="font-display font-semibold mt-2 mb-2">Oheistuotteet</h4>
                    <ul className="text-muted-foreground text-sm space-y-1">
                      <li>• Taideprintit</li>
                      <li>• Hahmofiguurit</li>
                      <li>• Kartat ja julisteet</li>
                      <li>• Teemavaatteet</li>
                    </ul>
                  </ComicPanel>
                </div>
              </div>
            </TabsContent>

            {/* Liiketoiminta */}
            <TabsContent value="liiketoiminta" className="mt-8">
              <div className="space-y-8">
                <h2 className="font-display text-2xl font-bold mb-6">Liiketoimintasuunnitelma</h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <ComicPanel variant="primary">
                    <h3 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
                      <Store className="w-5 h-5" />
                      Markkinointi ja Myynti
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Aion myydä tuotettani nettisivujen, erilaisten kauppojen ja Google-hakukoneoptimoinnin 
                      avulla. Ensimmäinen ajatus olisi viedä tuote näytille Joensuulaiseen fantasiapelit-kauppaan. 
                      On myös mahdollista palkata vaikuttajia kertomaan tuotteesta.
                    </p>
                  </ComicPanel>

                  <ComicPanel variant="accent">
                    <h3 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
                      <Coins className="w-5 h-5" />
                      Taloussuunnitelma
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Yrityksen konseptin voi toteuttaa matalalla budjetilla alkuun, mutta tämän jälkeen 
                      laadittaisiin joukkorahoituskampanja kiinnostuneille asiakkaille. Painamisesta ja 
                      tullaamisesta koituvat kustannukset on otettava huomioon.
                    </p>
                  </ComicPanel>
                </div>

                <ComicPanel>
                  <h3 className="font-display text-lg font-semibold mb-3">Operatiivinen Suunnitelma</h3>
                  <p className="text-muted-foreground text-sm">
                    Aion tehdä tuotteen valmiiksi, jonka jälkeen alan kehittelemään oheistuotteita yhteistyössä 
                    amerikkalaisten yritysten kanssa (esim. Boardgamemaker.com). Minun on varmistettava tuotteen 
                    laatu testaamalla sitä tuttavillani. Täytyy oikolukea kirja, saada digipeli valmiiksi, ja 
                    lautapeli tuotto- ja markkinointikelpoiseksi.
                  </p>
                </ComicPanel>

                <h3 className="font-display text-xl font-bold mt-8 mb-4">Toimintaympäristöanalyysi</h3>
                <ComicPanel>
                  <p className="text-muted-foreground text-sm">
                    Lähteiden tutkimuksen mukaisesti kaunokirjallisuuden myynti on ollut kasvussa monen vuoden ajan. 
                    On kuitenkin otettava huomioon, että suomalaisten kuluttaminen on ollut talouden laskusuhdanteen 
                    vuoksi kielteinen. Kirjallisuuden ja fantasialautapelien kuluttaminen on tiettyjen ihmisten markkina.
                  </p>
                </ComicPanel>

                <h3 className="font-display text-xl font-bold mt-8 mb-4">Kilpailija-analyysi</h3>
                <div className="space-y-4">
                  <ComicPanel>
                    <h4 className="font-display font-semibold mb-2">Suuret Ketjut</h4>
                    <p className="text-muted-foreground text-sm">
                      Suomalainen, Kirja.fi tarjoavat kirjojen rinnalla lisätuotteita, 
                      mutta eivät erityisesti räätälöi kirjamerchiä.
                    </p>
                  </ComicPanel>

                  <ComicPanel>
                    <h4 className="font-display font-semibold mb-2">Handmade-yrittäjät</h4>
                    <p className="text-muted-foreground text-sm">
                      Bookie, Paperiaarre tuovat brändätyn käsityön perspektiivin — 
                      uniikkeja tuotteita kirjallisuuteen liittyvillä teemoilla.
                    </p>
                  </ComicPanel>

                  <ComicPanel>
                    <h4 className="font-display font-semibold mb-2">Yhteistyökumppanit</h4>
                    <p className="text-muted-foreground text-sm">
                      Yhteistyökumppaneitamme ovat pienemmät ketjut, kuten joensuulainen 
                      Fantasiapelit-kauppa.
                    </p>
                  </ComicPanel>
                </div>

                <h3 className="font-display text-xl font-bold mt-8 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Aikataulu
                </h3>
                <div className="space-y-3">
                  {[
                    { phase: "Vaihe 1", title: "Ensimmäisen kirjan julkaisu", time: "2026" },
                    { phase: "Vaihe 2", title: "Lautapelin prototyyppi", time: "2026-2027" },
                    { phase: "Vaihe 3", title: "Joukkorahoituskampanja", time: "2027" },
                    { phase: "Vaihe 4", title: "Toisen kirjan julkaisu", time: "2027" },
                    { phase: "Vaihe 5", title: "Lautapelin tuotanto", time: "2028" },
                  ].map((item) => (
                    <div
                      key={item.phase}
                      className="flex items-center gap-4 p-4 bg-card border-2 border-border rounded-sm"
                    >
                      <span className="font-display text-sm font-semibold text-primary uppercase">
                        {item.phase}
                      </span>
                      <span className="flex-1 font-body">{item.title}</span>
                      <span className="text-muted-foreground text-sm">{item.time}</span>
                    </div>
                  ))}
                </div>

                <h3 className="font-display text-xl font-bold mt-8 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Henkilöstösuunnitelma
                </h3>
                <ComicPanel>
                  <p className="text-muted-foreground text-sm">
                    Henkilöstö on tärkeää vasta silloin, kun tuotteen markkina-asema on varmistunut. 
                    Tarvitaan: nettisivujen kehittäjä ja ylläpitäjä, myynnin ammattilainen, kustantaja/julkaisija 
                    kirjalle, ja ohjelmistoinsinööri digipelin kehittämiseen. Lähtökohtaisesti tuotteesta 
                    vastaan itse, mutta asiakaspalvelu voidaan ulkoistaa tarvittaessa.
                  </p>
                </ComicPanel>

                <h3 className="font-display text-xl font-bold mt-8 mb-4">Tuotekehityssuunnitelma</h3>
                <ComicPanel variant="accent">
                  <p className="text-muted-foreground text-sm">
                    Tuotteenkehittäminen on ensimmäinen askel lanseeraamisessa. Tuotteet kehitetään järjestyksessä: 
                    ensin kirja, sitten lautapelin fyysinen muoto, ja lopuksi digipeli. Digipelin on oltava 
                    mielenkiintoinen, viihdyttävä, ja sen on lisättävä tuotteiden näkyvyyttä ja tuotettava rahaa.
                  </p>
                </ComicPanel>
              </div>
            </TabsContent>

            {/* Riskit */}
            <TabsContent value="riskit" className="mt-8">
              <div className="space-y-8">
                <h2 className="font-display text-2xl font-bold mb-6">Riskit ja Ratkaisut</h2>

                <div className="space-y-4">
                  <ComicPanel variant="primary">
                    <h3 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5" />
                      Kysynnän Puute
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Jos tuotteelle ei ole kysyntää, ratkaisuna olisi tuotteen monipuolistaminen 
                      esimerkiksi digipeleihin tai leluihin, jos tutkimuksissa näille ilmenisi kysyntää.
                    </p>
                  </ComicPanel>

                  <ComicPanel>
                    <h3 className="font-display text-lg font-semibold mb-3">Tuotekehityksen Viivästyminen</h3>
                    <p className="text-muted-foreground text-sm">
                      Jos tuotekehittelyä ei saada valmiiksi, joukkorahoituskampanjan tukijat vetävät 
                      rahoituksensa pois ja olemassa oleva asiakaskunta katoaa.
                    </p>
                  </ComicPanel>

                  <ComicPanel variant="accent">
                    <h3 className="font-display text-lg font-semibold mb-3">Mainehaitta</h3>
                    <p className="text-muted-foreground text-sm">
                      Konsepti käsittelee aasialaista kulttuuria, ja Aasiassa kunnioitus ja kohteliaat 
                      käytöstavat otetaan hyvin tosissaan. Kulttuuria on edustettava kunnioitettavasti 
                      ja asianmukaisesti.
                    </p>
                  </ComicPanel>

                  <ComicPanel>
                    <h3 className="font-display text-lg font-semibold mb-3">Kilpailukyvyttömyys</h3>
                    <p className="text-muted-foreground text-sm">
                      Riski kilpailukyvyttömyydestä isojen yritysten ja studioiden kanssa. 
                      Väärän henkilöstön palkkaaminen voi kehittää tuotteen sellaiseksi, 
                      että se ei enää vetoa asiakaskuntaan.
                    </p>
                  </ComicPanel>

                  <ComicPanel>
                    <h3 className="font-display text-lg font-semibold mb-3">Suunnitelman Puutteellisuus</h3>
                    <p className="text-muted-foreground text-sm">
                      Jos suunnitelma on puutteellinen, tuotekehittäjät tai rahoittajat eivät näe 
                      tuotetta sellaisena, että sitä voitaisiin kehittää.
                    </p>
                  </ComicPanel>
                </div>

                <h3 className="font-display text-xl font-bold mt-8 mb-4">Yrittäjän Henkilökuvaus</h3>
                <ComicPanel variant="primary">
                  <p className="text-muted-foreground text-sm">
                    Olen yrityksessä yksin, ja tavoitteeni on saada tuotteelle myyntiä sen jälkeen, 
                    kun se on kehitetty loppuun. Luonteeltani olen innokas, tunnollinen ja mietiskelevä 
                    ihminen, joka on valmis näkemään vaivaa menestyäkseen. Kehitettävä kohde: tarkkuus 
                    ja huolellisuus — minulla on tapana innostua monista asioista, mutta en aina saa 
                    ideoitani tehtyä riittävällä tavalla loppuun asti.
                  </p>
                </ComicPanel>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <ComicPanel className="max-w-2xl mx-auto text-center" variant="primary">
            <h2 className="font-display text-2xl font-bold mb-4">
              Kiinnostaako Yhteistyö?
            </h2>
            <p className="text-muted-foreground mb-6">
              Jos olet kiinnostunut kustannusyhteistyöstä, pelijulkaisusta tai
              muista liiketoimintamahdollisuuksista, ota yhteyttä.
            </p>
            <a 
              href="/ota-yhteytta" 
              className="inline-block px-6 py-3 bg-primary text-primary-foreground font-display font-semibold rounded-sm hover:bg-primary/90 transition-colors"
            >
              Ota Yhteyttä
            </a>
          </ComicPanel>
        </div>
      </section>
    </Layout>
  );
};

export default Projektisuunnitelma;

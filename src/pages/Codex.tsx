/**
 * Codex.tsx — Rajaseudun Kronikka: maailmankirja ja pelaajan kodeksi
 *
 * Immersiivinen, kirjamainen esitys pelin maailmasta, jumalista, kansoista
 * ja hahmoista. Rakennettu pelaajan toimittamien lore-muistiinpanojen pohjalta.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.tsx';
import { ArrowLeft, BookOpen, Feather } from 'lucide-react';

interface Chapter {
  id: string;
  numeral: string;
  title: string;
  subtitle: string;
}

const chapters: Chapter[] = [
  { id: 'laulu', numeral: 'I', title: 'Kosminen laulu', subtitle: 'Suuri Hirvas ja maailman synty' },
  { id: 'laki', numeral: 'II', title: 'Vastoinkäymisten laki', subtitle: 'Kärsimys on tuli joka karkaisee' },
  { id: 'pantheon', numeral: 'III', title: 'Eläinten pantheon', subtitle: 'Jumalat pyhien eläinten hahmossa' },
  { id: 'kahtiajako', numeral: 'IV', title: 'Suuri kahtiajako', subtitle: 'Aro ja kivi Suuren joen kahta puolta' },
  { id: 'saannot', numeral: 'V', title: 'Selviytymisen säännöt', subtitle: 'Arojen lait ja erikoisroolit' },
  { id: 'mahtajat', numeral: 'VI', title: 'Rajaseudun mahtajat', subtitle: 'Ganbataar, Bolormaa ja Temüü' },
  { id: 'aikakaudet', numeral: 'VII', title: 'Aikakaudet', subtitle: 'Maailma ennen sotaa' },
  { id: 'alueet', numeral: 'VIII', title: 'Strategiset alueet', subtitle: 'Kartta aseena' },
  { id: 'vaijytys', numeral: 'IX', title: 'Väijytys', subtitle: 'Metsän ansa ja piirityksen oppitunti' },
  { id: 'susi', numeral: 'X', title: 'Suden tarina', subtitle: 'Pimeän kesyttäjä ja tasapaino' },
  { id: 'seremonia', numeral: 'XI', title: 'Seremonia ja sankaruus', subtitle: 'Kurkkulaulu, hauta ja Temüün vala' },
  { id: 'perheriita', numeral: 'XII', title: 'Perheriita', subtitle: 'Kaksintaistelu ja vallan nousu' },
  { id: 'vallanvaihto', numeral: 'XIII', title: 'Vallanvaihto', subtitle: 'Yhdistämissodat ja uusi taktiikka' },
  { id: 'jalleenrakennus', numeral: 'XIV', title: 'Jälleenrakennus', subtitle: 'Ulanbataar ja etelän uhka' },
  { id: 'uusielama', numeral: 'XV', title: 'Uusi elämä, samat tottumukset', subtitle: 'Marssi etelän miljoona-armeijaa vastaan' },
  { id: 'loputonsota', numeral: 'XVI', title: 'Loputon sota', subtitle: 'Sillat, joki ja pattitilanne' },
  { id: 'aamu', numeral: 'XVII', title: 'Kaikki yöt loppuvat aamuun', subtitle: 'Rauha, paluu ja dynastia' },
  { id: 'loppusanat', numeral: 'XVIII', title: 'Loppusanat', subtitle: 'Tarinat jotka meitä yhdistävät' },
  { id: 'heimot', numeral: 'Liite A', title: 'Heimot ja kansat', subtitle: 'Kronikan valtakunnat ja heimot' },
  { id: 'henkilot', numeral: 'Liite B', title: 'Henkilögalleria', subtitle: 'Kirjan keskeiset hahmot' },
];

// Kertovat luvut (Qorchin kronikan tarinat) — samassa hengessä kuin aiemmat luvut,
// tiivistettyinä pelin loren tyyliin.
const tales: { id: string; numeral: string; title: string; paras: string[] }[] = [
  {
    id: 'vaijytys', numeral: 'IX', title: 'Väijytys — metsän ansa',
    paras: [
      'Vihollisen marssiessa kohti metsää arolaiset ratsujousiampujat odottivat sen siimeksessä kärsivällisinä. Vuosikymmenten sota oli opettanut molemmat osapuolet lukemaan toisiaan: eteläiset aavistivat ansan, ja arolaiset tiesivät heidän aavistavan. Niinpä eteläiset etenivät kilvet edessä ja keihäät pystyssä, muodostivat torjuntalinjan koko metsän reunaan ja huusivat toisilleen tahtimerkkejä.',
      'Komentaja Batu ei epäröinyt. Fanfaarin soidessa hän ratsasti linjojen halki ja antoi perääntymismerkin — näennäisen paon kohti kolmen kilometrin päässä olevaa leiritystä. Kun eteläiset seurasivat, metsän perälle jätetty reservi syöksyi esiin ja ampui tervalla sytytettyjä nuolia heidän sivustoihinsa. Isku ei ollut tuhoisa, mutta se hämmensi; molemmat vetäytyivät, ja raskaammat tappiot jäivät etelälle.',
      'Yö kuului juonille. Arolaiset vakoojat soluttautuivat linnakkeeseen levittämään harhatietoa; ryömittyään kilometrejä havujen alla parikymmentä soturia kiipesi köysillä muurien yli, piirsi tarkat kuvat sisätiloista ja sytytti puolet muonavarastoista. Kymmenen heistä jäi kilpirinkiin suojaamaan pakoa — he löivät miekkojaan kilpiin, huusivat rytmisesti ja kaatuivat mieheen, jotta tiedustelutieto pääsisi perille.',
      'Aamulla pioneerit heittivät rautaiset lassot vihollisen heikoimpiin paaluihin ja vetivät ulkomuurit alas. Eteläiset perääntyivät sisemmille muureilleen kaataen kuumaa tervaa ja palavia nuolia — muurit murtuivat, mutta linnake kesti. Tuntikausien tulinuolisade poltatti puolustajilta kahden viikon vesivarastot yhdessä päivässä.',
      '«Antakaa heidän korjata muurinsa», heimopäällikkö sanoi. «He vain väsyttävät itsensä nopeammin.» Vihollinen tiesi hävinneensä: se pystytti muureille soihtuja pitäviä olkiukkoja ja pakeni yön turvin. Viikkoa myöhemmin arolaiset palasivat vahvistuksin ja valtasivat tyhjän linnakkeen. Voitto oli vain torjuntavoitto — ja oppitunti: kevyt ratsuväki murskaa avomaastossa, mutta pitkä piiritys vaatii kuria ja oikeita piirityskoneita, joita heimolta vielä puuttui.',
    ],
  },
  {
    id: 'susi', numeral: 'X', title: 'Suden tarina — pimeän kesyttäjä',
    paras: [
      'Qorchin toinen tarina kertoo sudesta. Alkuaikoina harva tiesi toisesta kosmisesta voimasta: universumin madonreikien läpi oli kulkenut olento, jonka energia oli ulospäin pimeää. Se oli menettänyt kotinsa, ja magneettinen vetovoima palautti sen aina samalle planeetalle.',
      'Vaikka se säteili ulospäin tuhoa — söi maasta kuolleen ja saastuttavan — sen sisin oli puhdasta valoa, joka ei päässyt tuikkimaan ulos. Se sytytti sotia, mutta ajoi lopulta kaiken elollisen yhteistä hyvää ja luonnon tasapainoa. Kotia etsittyään se valitsi olomuodokseen suden; suden silmät vaihtuivat vihreästä siniseksi — väriksi, joka merkitsee tasapainoa valon ja pimeyden välillä.',
      'Sudet metsästivät nälästä, eivät huvin vuoksi, ja laumana ne kaatoivat karhunkin. Kun Suuren Hirven kansa löysi ne keitaalta, hirvet saartoivat sudet — mutta viekkaina nämä hyppäsivät kiven päältä saartorenkaan yli ja pakenivat. Niin alkoi ikuinen takaa-ajo maapallon ympäri, ja molempien kannat kasvoivat.',
      'Kun ajo kiihtyi rajuimmilleen, olennon sisin irtosi eläimestä puhtaaksi energiaksi, joka pyöri niin voimallisesti, että se antoi maailmalle fyysisen olomuodon — sellaisen, joka ei enää tarvinnut kosmisia voimia ylläpitäjäkseen. Vihdoin väsyneet olennot saivat levätä maailman ympärillä, symbioosissa kesyttämiensä lajien kanssa. Sillä valoa ei ole ilman pimeyttä eikä pimeyttä ilman valoa; rakkaus aloittaa, mutta vasta tasapaino ylläpitää.',
    ],
  },
  {
    id: 'seremonia', numeral: 'XI', title: 'Seremonia ja sankaruus',
    paras: [
      'Torjuntavoiton jälkeen shamaanilla oli edessään pitkä päivä: henkien lepyttäminen, synninpäästö, taistelukentän puhdistaminen ja kaatuneiden hautaaminen. Johtajat haudattiin erikseen, rivimiehet yhdessä — ei arvon vuoksi vaan lukumäärän, ja aina nimettömiin, tuntemattomiin hautoihin, ympäristöä säästäen. Rituaali laulettiin perinteisenä kurkkulauluna suitsukkeiden savussa.',
      'Shamaani johti myös parantajia. Hoito oli alkeellista — haavoja poltettiin desinfioinniksi, raajoja amputoitiin, käytettiin yrttejä, alkoholia ja soiden iilimatoja. Parantajat olivat naisia, ainoita joita sotaleireihin päästettiin: kovettuneita, hajuaistinsa menettäneitä, työssään miehiä taitavampia. Kurkkulaulullaan shamaani rauhoitti niin parantajat kuin kuolevatkin.',
      'Tässä taistelussa oli sankarinsa: vartija, joka leikkasi henkivartijoiden lähipiiriin soluttautuneen salamurhaajan kurkun auki juuri ennen kuin tikari löysi heimopäällikön selän. Mutta shamaanin katse kääntyi nuoreen poikaan — Temüühün, joka itki tapettuaan ensimmäisen miehensä.',
      '«Itke vain, se helpottaa», shamaani sanoi. «Olet syvällinen ja herkkä sielu — taistelukenttä ei ole kaltaisillesi tehty.» Silloin Temüün isä Ganbataar tarttui poikaansa niskasta ja tavoitteli miekkaansa. «En sinuna tekisi tuota», shamaani sanoi tyynenä; hengellisen miehen surmasta koko suku teloitettaisiin. Ganbataar poistui uhaten poikaansa pieksennällä.',
      'Kahden kesken shamaani asetti kätensä pojan olalle ja puhui kuin sanansaattaja: Temüün oli haastettava isänsä julkisesti kaksintaisteluun ja surmattava tämä — vain niin hän vapauttaisi äitinsä ja sisaruksensa tyrannin vallasta ja nousisi mieheksi, joka jonain päivänä yhdistäisi kaikki heimot. Se oli manipulaatiota, mutta shamaani uskoi tekevänsä oikein. Pelokkaana mutta päättäväisenä Temüü vastasi: «Tulkoon kosmisten olentojen tahto maan päälle.» Se oli ensimmäinen askel polulle, jolta ei ollut paluuta.',
    ],
  },
  {
    id: 'perheriita', numeral: 'XII', title: 'Perheriita — kaksintaistelu',
    paras: [
      'Leiritykset oli purettu ja armeija väsynyt, kun Temüü käveli miekkatelineen ohi ja otti kaksi teroitettua terää. Toisen hän heitti isänsä Ganbataarin jalkojen juureen — ikivanha haaste, jonka torjuminen tarkoitti elämää ilman kunniaa, arolaiselle orjuuttakin alhaisempaa. Äiti aneli häntä lopettamaan; Temüü ei katsonut häneen. Shamaani Qorchin manipuloimana, katkeruutensa peittäen, hän oli valmis kohtaamaan tyranninsa.',
      'Ganbataar pilkkasi poikaansa — «tiedätkö kuka minä olen?» — mutta otti haasteen vastaan häijy hymy huulillaan. Nuoret soturit katsoivat Temüüta ihaillen, ja moni heimolainen nyökkäsi hiljaa hyväksyen, sillä he tiesivät miten tämä mies oli perhettään kohdellut. Shamaani veti hiekkaan seremoniaympyrän, puhdisti kentän suitsukkein ja asetti neljä henkivartijaa valvomaan taistelun rehellisyyttä.',
      'Ennen aloitusmerkkiä Ganbataar löi kunniattomasti Temüün kypärää. Taistelusta tuli raaka: miekka, kilpi ja paini vuorottelivat, molemmat kaatuivat ja nousivat. Nuorempana Temüü toipui nopeammin. Hän vei isänsä maahan, haki molemmat miekat ja asetti ne tämän kurkulle. «Opetin sinut hyvin, poika», Ganbataar sanoi viimeiset sanansa. Temüü katkaisi hänen kaulansa kuin teloituksessa, ja hiljaisuuden jälkeen joukot alkoivat hurrata hänen nimeään.',
      'Shamaani julisti Temüün voittajaksi ja hänen perheensä sadanpäämiehen sukuun: paremmat jurtat, paikka sotaneuvostossa, vuosien kärsimyksen loppu. Äiti itki yhtä aikaa surusta ja helpotuksesta. Silti Temüü horjui kahden vaiheilla — hän pakeni metsään ja huusi niin että metsä kaikui, ylpeänä mutta shokissa, aavistellen mitä motiiveja Qorchilla oli hänen varalleen.',
      'Vetäytymisen sijaan Temüü käänsi armeijan länteen lyömään perääntynyttä vihollista. Kun heimojohtajat pilkkasivat häntä neuvostoteltassa, hänen kymmenen uskollistaan surmasivat heidät, ja Temüü jäi ainoaksi johtajaksi. Hän hylkäsi veren ja koston pätevyyden hyväksi: kelvollinen ihminen nostettaisiin ansioidensa mukaan, ja idän ja lännen väliin määrättiin rakennettavaksi ensimmäinen hallinnollinen kaupunki, jossa alettaisiin pitää kirjaa.',
    ],
  },
  {
    id: 'vallanvaihto', numeral: 'XIII', title: 'Vallanvaihto — yhdistämissodat',
    paras: [
      'Temüü lähetti jäljellä oleville heimoille sodanjulistukset. Vastaukset olivat raivokkaita: «minä syljen päällesi», «ripustan pääsi seipääseen, sinä nulikka». Kuukauden kuluessa hän kokosi kymmentuhatpäisen armeijan oikeine keittäjineen, metsästäjineen ja parantajineen — sekä rengashaarniskat ja piirityskoneet, jotka oli opittu viholliselta.',
      'Taisteluissa hänen kurinalaiset kilpimuurinsa kestivät nuolisateet, hevosjousiampujat kiusasivat selustoja, ja tuoreiden rivien kierto ratkaisi väsymyksen, jonka hän oli edellisistä taisteluista oppinut. Voitot olivat kurin voittoja lukumäärästä.',
      'Ratkaiseva koitos käytiin koalitiota vastaan, jolla oli kolminkertainen ylivoima ja alkeelliset tuliaseet — «ihmeaseet». Temüü muisti isänsä kääröistä lukemansa Aleksanterin, joka mursi persialaiset ratsastamalla muodostelman raoista suoraan kohti kuningasta. Hän houkutteli ratsuväellä musketit tuleen, ohensi rivinsä syötiksi ja iski sitten 3000 hevosen kärkimuodostelmalla heikkoon keskustaan. Keskusta murtui, ja Temüü katkaisi ylikomentajan kaulan. Sota oli voitettu.',
      'Nyt oli aika hajauttaa monet armeijat ja kouluttaa yksi yhtenäinen. Ryöstöretkistä siirryttiin «valloitusretkeen» ja oikeusvaltioon: otettiin mallia halveksituilta ulkomaalaisilta, annettiin mahdollisuus kauppiaille ja rakentajille sotureiden rinnalla, sallittiin kansalaisille omat jumalat ja pukeutuminen — mutta armeijaan ja virkakoneistoon luotiin kova kuri ja yksi keskushallinnollinen pääkaupunki.',
    ],
  },
  {
    id: 'jalleenrakennus', numeral: 'XIV', title: 'Jälleenrakennus — Ulanbataar',
    paras: [
      'Yhdistetyn valtakunnan hallinnollinen keskus rakennettiin Ulanbataariin. Temüü saapui voittajana, mutta väsyneenä ja haavoittuneena — kasvoissa ja selässä miekan viiltoja, mielessä pelko että hän oli muuttumassa isänsä kaltaiseksi: vihaiseksi ja pettyneeksi, pakotetuksi tielle jota ei ollut valinnut.',
      'Ensimmäistä kertaa vuosiin hän näki unta. Lapsuutensa hevoset puhuivat hänelle: «Temüü, etsi meidät. Älä unohda kuka oikeasti olet.» Ne muistuttivat herkästä pojasta, joka ei kyennyt satuttamaan kärpästäkään ja josta oli tullut mies joka määrää ihmisiä kuolemaan — ja kehottivat häntä muistamaan aron hevosen, joka kulki tuulen mukana.',
      'Valtaistuinsalissa alaiset tulivat ja menivät. Uskollisen soturin hän palkitsi sotasaaliskirstulla ja palvelijoilla; ryöstetylle maanviljelijälle hän antoi uuden tilan. Kun vallanhimoinen Qorchi vihdoin tuli perimään palkkiotaan ja uhkasi häntä, Temüü käski kaartinsa riisua shamaanin aseista ja heittää tämä tyrmään — vieraat taputtivat.',
      'Sotajoukot palkittiin ruhtinaallisesti, jotteivät ne nousisi kapinaan; maatiloja säädeltiin lailla, ja Bolormaan tahdosta kaikki väkivalta naisia ja lapsia kohtaan kiellettiin. Yhteiskunta alkoi palkita muitakin kuin autokraattisia miestenmiehiä.',
      'Mutta etelästä saapui uusi uhka: vaaleaihoinen, hienosti pukeutunut sanansaattaja ovelalla äänellään. Hän vaati Temüüta luovuttamaan heti — muuten eteläheimot ottaisivat kaiken. «Meillä on miljoonapäinen joukko, teillä ei mitään meidän teknologiaamme tai älyämme vastaavaa, senkin barbaarit.» Uuden ajan raja oli piirretty.',
    ],
  },
  {
    id: 'uusielama', numeral: 'XV', title: 'Uusi elämä, samat tottumukset',
    paras: [
      'Kun sanansaattaja saapui saliin, Temüü oli tyyni — hän tiesi jo mihin tämä johtaisi. Aina oli luultu seuraavan taistelun olevan viimeinen, mutta jokainen konflikti johti vain syvempään. Häntä eivät enää painaneet voitto tai häviö; hän tekisi vain sen mitä miehen hänen asemassaan oli tehtävä: varustaisi joukot ja päättäisi sodan, jos vain voisi — vaikka epäili sitä.',
      'Keisarilliselta parvekkeelta hän puhui kansalle, joka ei halunnut uuteen sotaan mutta tiesi lähtevänsä. Vanhat veteraanit eivät olleet ehtineet nauttia rauhasta päivääkään; nyt oli uuden sukupolven vuoro todistaa itsensä. Temüü vannoi johtavansa edestä ja uhraavansa henkensä kansansa puolesta. Sepät teroittivat miekkoja — mutta tällä kertaa tunnelma oli riemukas: oli muurit, järjestys ja turva, ja paraatimarssi soi uutta sävellystä.',
      'Marssi oli pitkä. Luontoon naamioituneet partisaanit ampuivat putkista nuolia ja sabotoivat huoltolinjoja; ratsuväki menetti ensimmäisenä päivänä kymmenen kallista ratsua. Viikossa kaatui sata miestä, vihollinen kolme kertaa enemmän. Vastassa oli miljoona-armeija — kymmenkertainen — mutta hidas ja maaorjiin nojaava. Arojen oppi kuului: armeija on yhtä vahva kuin heikoin lenkkinsä.',
      'Vihollisen propaganda sai jopa arolaiskylät uskomaan, että on parempi kuolla taivaallisen keisarin puolesta kuin alistua. Kapea vuorisola oli ilmeinen ansapaikka, mutta sen kiertäminen olisi vienyt päivän jota heillä ei ollut — heidän oli astuttava ansaan ja lyötävä partisaanit siinä ja nyt. Päällikkö saatiin kiinni ja päästettiin vapaaksi; partisaanit murtuivat, mutta jättivät tiedon siitä mikä odotti joella.',
      'Jokea ei sulkenut kivimuuri vaan laivat, jotka oli rautaketjuin sidottu toisiinsa ja miehitetty levy- ja rengashaarniskoin varustetuin eliittisoturein. Sitä ei voinut lävistää suoralla hyökkäyksellä eikä kiertää eikä paeta. Leiri pystytettiin ampumaetäisyyden ulkopuolelle, viesti lähetettiin Ulanbataariin, ja piirityskoneet alkoivat murjoa laivoja raskain kivin — jotka eivät helpolla syttyneet tai murtuneet.',
    ],
  },
  {
    id: 'loputonsota', numeral: 'XVI', title: 'Loputon sota',
    paras: [
      'Seuraavana päivänä laivalinja murtui; alukset purjehtivat takaisin merelle, osa upposi. Silti jokea ei ylitetty väsyneenä. Insinöörit esittivät uuden keinon: rakentaa omalle puolelle puista sillat ja pudottaa ne joen yli — kaksi päivää työtä, mutta varma ylitys. Uiminen olisi ollut kuolema jousiampujien alla.',
      'Sillat pudotettiin strategisiin kohtiin ja tulinuolet sammutettiin pitkin tikuin. Sitten seurasi arolaisille ominainen juoni: nuoret rivimiehet hyökkäsivät sillan yli, taistelivat viisi minuuttia ja vetäytyivät nopeasti. Kurittomat viholliset ryntäsivät perässä — komentajan «pysähtykää!» hukkui meluun — ja saivat nuolet niskaansa. Ratsuväki valtasi vastarannan, katkaisi upseerin kaulan ja piiritti kolonnan, joka teloitettiin taistelun vimmassa.',
      'Ratsuväki poltti vihollisen tarvikekärryt. Taivaallinen keisari perääntyi eliittiratsuväkineen jättäen pakotetut talonpojat oman onnensa nojaan; nämä antautuivat perääntymällä. Sanansaattaja tarjosi tuhat miljoonaa kultaharkkoa, jos suuri valloittaja poistuisi — Temüü nauroi ja teloitti hänet, vaikkei viestinviejää saanut koskaan surmata.',
      'Kolmen päivän marssin päästä etelässä kohosivat rannikon muurit, niin paksut ettei mikään teknologia niitä murtaisi. Syntyi pattitilanne: arokansa oli lyömätön avomaalla, etelä lyömätön piirityksessä — molemmat haavoittumattomia toisilleen. Opetus oli annettu: turha lähettää armeijoita avoimeen sotaan aroja vastaan.',
      'Neuvostossa väiteltiin, miten hallita eteläisiä kauppaheimoja. Sotapäälliköt vaativat raskaita varuskuntia, yöpartioita ja vanhojen jumalten kaatamista; poliittiset neuvonantajat halusivat säilyttää heidän merkantiiliyhteiskuntansa, uskontonsa ja autonomiansa ja oppia heidän ylivertaisista arkistoistaan, muureistaan ja kaupastaan. Temüü valitsi molemmat: ensin näyttää sotavoima paraatein ja fanfaarein, sitten antaa liberaali, autonominen hallinto ja sulauttaa järjestelmät yhteen.',
    ],
  },
  {
    id: 'aamu', numeral: 'XVII', title: 'Kaikki yöt loppuvat aamuun',
    paras: [
      '«Kokous on päättynyt, minä palaan Ulanbataariin.» Temüüllä oli sotureita palkittavana ja maanviljelijöitä autettavana, ja kansa oli kyllästynyt loputtomaan sotaan. Ennen paluutaan hän teki päivän retken vuorelle ja leiriytyi sen huipulle.',
      'Yöllä vuorella hän näki henkiä, hirven ja susia — kerran hänen oli kiivettävä puuhun susilaumaa piiloon ja nukuttava siellä. Ensi kertaa vuosiin hän tunsi rauhaa ja oli vihdoin valmis muuttumaan siksi mieheksi, joksi hänen oli tarkoitus tulla.',
      'Hän päätti vetäytyä Ulanbataarin lämpimien muurien taakse, kohdella ihmisiä lämmöllä ja antaa nuoremmille upseereille vastuuta rintamasta. Tavoitteena oli pitää valtakunta poissa sodista lopun hallintonsa ajan, antaa väestön kasvaa ja rakentaa maatalousyhteiskunta — sillä hajanainen suuri valtakunta on heikko; parempi olla yhtenäinen ja vahva kuten kiinalaisilta oli opittu.',
      'Aamun sarastaessa hän ratsasti viikon takaisin pääkaupunkiin. Portteja ei avattu — hänen tulostaan ei ollut tietoa — ennen kuin muurin vartijat tunnistivat päällikkönsä. Sisällä sotaneuvosto kiisteli siitä missä hallitsija on, pöytä täynnä kääröjä eikä mitään tehtynä. «Hiljaisuus — olenko ollut poissa niin kauan, että valtakunta on jo kaatunut?» Seurasi kolmituntinen kokous maakaupoista, laista, verotuksesta ja armeijoiden hajauttamisesta — hallinnoijan loputon työ.',
      'Hän tapasi väsyneen äitinsä ja käveli tämän kanssa puutarhassa puhuen vuosista ja tulevasta rauhasta; sisarukset kertoivat hyviä uutisia, avioliittoja oli järjestetty. Lopulta saliin oli kutsuttu tusina hienostunutta naista, joista hovi etsi hallitsijalle vaimon ja jalkavaimot dynastian jatkoksi. Yksi heistä oli täsmälleen Temüün mittainen ja kasvoiltaan hänen kaltaisensa, mutta sisäänpäin kääntynyt ja herkkä siinä missä Temüü oli ulospäinsuuntautunut — juuri se viehätti häntä. Elämä olisi rauhallista vielä monta vuosikymmentä.',
    ],
  },
  {
    id: 'loppusanat', numeral: 'XVIII', title: 'Loppusanat',
    paras: [
      'Tämä ei silti ollut tarinamme loppu. Mikään armeija ei ole voittamaton, mikään dynastia ei kestä ikuisesti. Sota on jokaisen valtion elinehto — sitä käydään resurssien niukkuudesta ja ajatusten törmätessä, sillä ihminen pitää luonnostaan omaa sisäryhmäänsä muita parempana.',
      'Ihminen on tribaalinen ja väkivaltainen, mutta myös sosiaalinen ja poliittinen eläin, joka kykenee empatiaan ja itsensä ylittämiseen. Jokainen sukupolvi voi olla edellistä parempi, oppia historiasta ja kääntää heikkoutensa vahvuudeksi — kun järki ei pelaa, pelaa luovuus. Suurten kärsimysten jälkeen ovat aina koittaneet kulta-ajat: keksittiin rengas, tiet, tuli ja koneet jotka käyvät höyryllä.',
      'Meitä ei yhdistä se, voitammeko vai häviämme, vaan tarinat jotka jaamme — rakkaudesta ja menetyksestä, sodasta ja rauhasta. Ne on kirjoitettu yhteiseen historiaamme, joka kuuluu kaikille eikä vain niille jotka luulevat omistavansa sen.',
      'Sukupolvien välillä on oltava tasapaino: nuorten on kuunneltava vanhempiaan ja myös kaadettava heidän varjonsa, ettei ne kaatuisi heidän päälleen; vanhempien on jaettava osaamisensa paremman maailman puolesta eikä takerruttava valtaan voimiensa ehtyessä. Ihmisen on laajennettava ymmärrystään, elettävä sovussa ympäristönsä kanssa ja nähtävä kaikki elämän arvoisina — ja luovuttava tribaalisesta katseesta ennen kuin ydin-, vety- ja antimateriapommit hävittävät kaiken elämän rakkaalta maapalloltamme.',
    ],
  },
];

// Liite: heimot ja kansat, jotka esiintyvät kronikassa.
const tribes: { emoji: string; name: string; text: string }[] = [
  { emoji: '🐎', name: 'Arokansat (pohjoiset heimot)', text: 'Temüün kansa. Paimentolaisia, joiden voima on kevyessä ratsuväessä ja hevosjousiampujissa. Ankara arojen laki, kunnia ja radikaali tasa-arvo pitävät heidät koossa. Aiemmin hajanaisia, keskenään sotivia heimoja — Temüün yhdistäminä lyömättömiä avomaalla. Heidän oppinsa: armeija on yhtä vahva kuin heikoin lenkkinsä.' },
  { emoji: '🛡️', name: 'Eteläiset heimot', text: 'Rajaseudun perivihollinen. Konventionaalista raskasta keihäsjalkaväkeä, joka taistelee kilpimuuri- ja testudo-muodostelmissa kehittyneiden muurien takana. Kärsivällisiä pitkässä sodassa, mutta kurittomia riveissään ja avuttomia kevyttä ratsuväkeä vastaan avoimella kentällä.' },
  { emoji: '🏗️', name: 'Läntinen heimo', text: 'Rajaseudun rakentajat, joilla oli vahva insinööritekniikka. He osasivat pystyttää muureja, siltoja ja piirityskoneita muita taitavammin. Juuri heiltä arokansat oppivat rakentamisen ja saivat haltuunsa piirityskoneet, joilla vihollisten linnakkeet lopulta murrettiin — sekä rengashaarniskoiden valmistuksen.' },
  { emoji: '💥', name: 'Itäinen heimo', text: 'Ruudin haltijat. Heillä oli tuliaseet ja «ihmeaseet» — alkeelliset musketit, jotka pystyivät murtamaan ratsuväen syöksyn. Tämä tulivoima teki heistä pelättyjä avoimessakin taistelussa, kunnes arokansat oppivat kiertämään sen nopeudella ja harhautuksella.' },
  { emoji: '⚔️', name: 'Läntinen koalitio', text: 'Luoteis-, lounais- ja läntisten heimojen liitto, joka yhdisti läntisen insinööritaidon ja itäisen ruudin. Kolminkertainen ylivoima, koulutetut joukot ja tuliaseet — murrettiin silti Aleksanterilta lainatulla kärkihyökkäyksellä suoraan heikkoon keskustaan ja komentajan kimppuun.' },
  { emoji: '🏯', name: 'Eteläinen keisarikunta', text: 'Merkantiili suursivistys «taivaallisen keisarin» alla: miljoona-armeija, maaorjat, laivoista rautaketjuin sidotut jokimuurit ja läpäisemättömät rannikkomuurit. Lyömätön piirityksessä mutta heikko avomaalla. Käy partisaanisotaa ja propagandaa — ja pitää arkistoja, muureja, tuliaseita ja kauppaa aroja paremmin.' },
  { emoji: '👑', name: 'Vuoden 1206 valtakunnat', text: 'Pelissä maailma kiteytyy neljäksi mahdiksi: mongolit (arojen perilliset), Song-Kiina (kauppias-sivistys), Venäjän ruhtinaskunnat (metsien puolustajat) ja Khwarezm (karavaanireittien valtias). Ne kantavat kronikan aro–kivi-jännitettä pelilaudalle.' },
];

// Liite: kronikan keskeiset henkilöt.
const characters: { emoji: string; name: string; role: string; text: string }[] = [
  { emoji: '🗡️', name: 'Temüü', role: 'Päähenkilö · yhdistäjä', text: 'Herkkä, älykäs poika, jonka shamaani Qorchi ohjaa sotapolulle. Surmaa tyranni-isänsä kaksintaistelussa, yhdistää heimot ja perustaa Ulanbataarin. Kantaa läpi elämänsä sisäistä ristiriitaa herkkyyden ja väkivallan välillä.' },
  { emoji: '🪓', name: 'Ganbataar', role: 'Temüün isä · tyranni', text: 'Juopunut, väkivaltainen sadanpäämies, joka alisti perheensä. Kunniaton myös taistelussa — löi ennen aloitusmerkkiä. Kaatui Temüün kädestä kaksintaistelussa, mutta sai silti soturin hautajaiset.' },
  { emoji: '🕯️', name: 'Qorchi', role: 'Shamaani · sanansaattaja', text: 'Kosmisten voimien tulkki ja suden sekä hirven tarinoiden kertoja. Manipuloi Temüün kohtalonsa tielle ja kasvatti samalla omaa valtaansa — kunnes Temüü lopulta vangitsi hänet vallanhimosta.' },
  { emoji: '🐦', name: 'Bolormaa', role: 'Tiedon tuoja · uudistaja', text: 'Toi aroille tiedon ja kirjoitetun sanan. Uudistaja, jonka tahdosta kiellettiin kaikki väkivalta naisia ja lapsia kohtaan — arolaisyhteiskunnan hiljainen kääntöpiste.' },
  { emoji: '🏇', name: 'Batu', role: 'Komentaja', text: 'Kokenut kenttäkomentaja metsäväijytyksessä. Määräsi fanfaarilla teeskennellyn perääntymisen ja tulinuoli-väijytyksen vihollisen sivustaan — arolaisen harhautustaktiikan mestari.' },
  { emoji: '🌾', name: 'Temüün äiti', role: 'Perheen suojelija', text: 'Kesti tyranni-aviomiehen vuodet ja ruokki lapsensa juureksilla ankarana talvena. Miehen kuoltua vapautunut ja viisas neuvonantaja, joka vetäytyi maaseudulle poikansa vapauttamaan rauhaan.' },
  { emoji: '👥', name: 'Temüün sisarukset', role: 'Kuusi sisarusta', text: 'Perhe, josta Temüü kantoi vastuun jo lapsena. Kasvoivat vainojen keskellä aikuisiksi; rauhan tultua heille järjestettiin avioliittoja ja turvattu elämä sadanpäämiehen suvun jäseninä.' },
  { emoji: '🐉', name: 'Taivaallinen keisari', role: 'Etelän hallitsija', text: 'Eteläisen keisarikunnan ylimielinen hallitsija. Perääntyi eliittiratsuväkineen jättäen pakotetut talonpojat kuolemaan, ja hymyili ivallisesti läpäisemättömien muuriensa takaa — lyömätön piirityksessä, voitettu avomaalla.' },
  { emoji: '💜', name: 'Ensimmäinen vaimo', role: 'Hallitsijatar', text: 'Temüün mittainen nainen, kasvoiltaan hänen kaltaisensa mutta sisäänpäin kääntynyt ja herkkä. Juuri tämä viehätti Temüüta yli muiden; hän istuisi toisella valtaistuimella ja jatkaisi dynastiaa.' },
];

const pantheon = [
  { icon: '🦌', name: 'Handgai — Suuri Hirvas', text: 'Ylin luoja. Ilmestyy harvoin, mutta valituille — muuttaakseen heidän kohtalonsa täysin. Rakastaa ihmisen luovuutta, mutta pelkää salaa sitä, mitä ihminen kykenee tuhoamaan.' },
  { icon: '🦅', name: 'Kotka — Jumalallinen omatunto', text: 'Taivaiden silmät, jotka valvovat aina. Toimi kunniattomasti kotkan katseen alla, ja henkinen mielesi romahtaa.' },
  { icon: '🐻', name: 'Karhu — Suojelija', text: 'Raaka voima tasapainossa ehdottoman pidättyväisyyden kanssa. Karhun metsästys on harvinaista, mutta sen lihalla uskotaan olevan mystisiä parantavia voimia.' },
  { icon: '🦉', name: 'Pöllö — Ehdoton tabu', text: 'Kiivaasti suojeltu. Pöllön metsästys tai vahingoittaminen on valtava henkinen rikos — teosta yhteisö karkottaa sinut.' },
  { icon: '🦊', name: 'Kettu — Onnettomuuden enne', text: 'Jos kettu ylittää polkusi ennen retkeä tai taistelua, se on kauhea enne. Sinun on pysähdyttävä ja käytävä läpi puhdistautumisrituaali, tai kohtaat tuhon.' },
  { icon: '🐀', name: 'Rotta — Ehdoton vihollinen', text: 'Tautia, mätää ja petosta. Kerran vuodessa kaikki heimot julistavat aselevon ja käyvät viikon ajan yhteistä, koordinoitua sotaa rottien hävittämiseksi.' },
];

const leaders = [
  {
    emoji: '⚔️',
    name: 'Ganbataar',
    epithet: 'Rautatyranni',
    accent: 'from-red-950/60 to-slate-950/80 border-red-800/40',
    text: 'Pohjoisen karismaattinen, laajentumishaluinen johtaja. Nousi orjuudesta ja tuhosta — kärsimys teki hänestä Vastoinkäymisten lain ruumiillistuman. Loistava pitkän tähtäimen strategi, mutta kasvavan ylimielinen, vainoharhainen ja julma. Hallitsee pelolla, kollektiivisella rangaistuksella ja vihollistensa kaupunkien täydellisellä tuholla. Uskoo, että vain kärsimys tekee kansasta vahvan.',
  },
  {
    emoji: '🧭',
    name: 'Bolormaa',
    epithet: 'Vieras kompassi',
    accent: 'from-sky-950/50 to-slate-950/80 border-sky-800/40',
    text: 'Vieraassa maassa syntynyt prinsessa, naitettu Ganbataarille. Korkeasti koulutettu ja loistava — miehensä raa\'an voiman älyllinen vastapaino. Ajaa hiljaa diplomatiaa, strategiaa sekä naisten oikeuksien ja koulutuksen laajentamista leireissä. Toi aroille tiedon kaukaisista kauppareiteistä, akateemisesta strategiasta, linnoista, piiritystaidosta ja tuliaseista.',
  },
  {
    emoji: '🗡️',
    name: 'Temüü',
    epithet: 'Kapinallinen perillinen',
    accent: 'from-amber-950/50 to-slate-950/80 border-amber-800/40',
    text: 'Ganbataarin vanhin poika ja valtakunnan muuttuvan politiikan päähenkilö. Taistelun mestari, joka käyttää tekniikkaa raa\'an voiman sijaan. Halveksii salaa isänsä julmuutta ja rakentaa hiljaa maanalaista vastarintaliikettä leirien halki — meritokratiaa, joka perustuisi yhteisiin etuihin ja diplomatiaan.',
  },
];

const eras = [
  { era: 'Aikakausi I', title: 'Myyttinen aamunkoitto', text: 'Alussa elämä oli yksinkertaista, koska raja kuolevaisten maailman ja henkimaailman välillä ei ollut olemassa. Oli vain yksi ihmisrotu Suuren Hirven valppaan katseen alla. Kaikki kuulivat Kosmisen laulun, joten kirjoitettuja lakeja tai hallitsijoita ei tarvittu — jos joku otti luonnosta liikaa, laulu vääristyi ja aiheutti fyysistä sairautta.' },
  { era: 'Aikakausi II', title: 'Suuri unohdus ja skisma', text: 'Musiikki katosi ihmismielistä — shamaanit syyttävät kollektiivista ylpeyttä, etelän historioitsijat kosmista katastrofia. Pakokauhu jakoi ihmiskunnan. Etelään paenneet hylkäsivät Handgain lain, keksivät maanviljelyn, sitoivat itsensä kivirakennuksiin ja loivat byrokratian korvaamaan unohtuneen moraalin. Aroille jääneet omaksuivat kylmyyden ja niukkuuden opettajikseen.' },
  { era: 'Aikakausi III', title: 'Kiven ja taljan aika', text: 'Lähes viisi vuosisataa maailma eli ennustettavassa rytmissä. Etelä yhdistyi yhden keisarin alle, kasvoi ylimieliseksi 100 000 miehen armeijoineen ja unohti yhteisen historiansa pohjoisen kanssa. Pohjoisessa elämä oli kaoottista ja veristä: heimot sotivat keskenään, verikostot kestivät sukupolvia, ja karkotus aroille tarkoitti varmaa kuolemaa.' },
  { era: 'Aikakausi IV', title: 'Nyrkin takominen', text: 'Kolmekymmentä vuotta sitten Ganbataar nousi. Hän ei pyytänyt heimoja liittymään — hän pakotti ne. Ensimmäistä kertaa historiassa itsenäiset paimentolaiset alistettiin sotilaskuriin, ja heidän verraton ratsastustaitonsa yhdistettiin synkronoituihin muodostelmiin, tiedusteluverkostoihin ja siltoja rakentaviin insinööriyksiköihin. Bolormaan myötä aroille saapui tieto — ja ruutitynnyri oli valmis.' },
];

const assets = [
  { icon: '🌉', name: 'Suuren joen ylityspaikat', text: 'Lopullisia taktisia solmukohtia. Hallitse siltoja turvataksesi kauppareitit tai iskeäksesi nopeilla ratsuretkillä etelään.' },
  { icon: '⛰️', name: 'Korkeat vuorisolat', text: 'Luonnon linnoitusmuurit, jotka pysäyttävät etelän armeijoiden liikekannallepanon.' },
  { icon: '🌿', name: 'Kosteikot', text: 'Arojen hedelmällisintä maata, mutta jatkuvasti kiistelty vyöhyke, jossa kilpailevat heimot väijyttävät toisiaan juurikasvien keruusta.' },
];

const Codex = () => {
  const [active, setActive] = useState(chapters[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-30% 0px -60% 0px' },
    );
    chapters.forEach((c) => {
      const el = document.getElementById(c.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1206] via-slate-950 to-black text-amber-50 font-body">
      {/* subtle texture / vignette */}
      <div
        className="pointer-events-none fixed inset-0 opacity-40"
        style={{
          background:
            'radial-gradient(ellipse at 20% 0%, rgba(201,162,39,0.10) 0%, transparent 45%), radial-gradient(ellipse at 100% 100%, rgba(120,53,15,0.12) 0%, transparent 40%)',
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 py-8 lg:py-14">
        {/* Top bar */}
        <div className="mb-8 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="w-4 h-4" /> Palaa peliin
            </Button>
          </Link>
          <Link to="/ohjekirja" className="inline-flex items-center gap-2">
            <Button variant="secondary" size="sm">
              <BookOpen className="w-4 h-4" /> Ohjekirja
            </Button>
          </Link>
        </div>

        {/* Cover */}
        <header className="relative mb-14 overflow-hidden rounded-3xl border border-amber-800/40 bg-gradient-to-b from-amber-950/40 to-slate-950/70 px-6 py-14 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-amber-600/40 bg-amber-500/10 text-amber-300">
            <Feather className="h-8 w-8" />
          </div>
          <p className="font-display text-xs uppercase tracking-[0.5em] text-amber-500/70">Arojen Tarinat</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-wide text-amber-100 sm:text-5xl">
            Rajaseudun Kronikka
          </h1>
          <p className="mt-2 font-display text-lg text-amber-300/80">Maailmankirja &amp; Pelaajan Kodeksi</p>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-amber-100/70 italic">
            Tämä kirja sisältää kaiken, mitä sinun tulee tietää maailmasta, jumalista, heimoista ja
            selviytymisen raaoista laeista. Se, kuinka navigoit henkimaailmaa ja poliittista maisemaa,
            ratkaisee menestyykö hahmosi vai kuoleeko hän aroille.
          </p>
        </header>

        <div className="lg:flex lg:gap-10">
          {/* Sticky chapter nav */}
          <aside className="mb-10 lg:sticky lg:top-8 lg:mb-0 lg:h-fit lg:w-64 lg:flex-shrink-0">
            <p className="mb-3 font-display text-xs uppercase tracking-[0.3em] text-amber-500/60">Sisällys</p>
            <nav className="space-y-1">
              {chapters.map((c) => (
                <a
                  key={c.id}
                  href={`#${c.id}`}
                  className={`block rounded-lg border px-3 py-2 transition-colors ${
                    active === c.id
                      ? 'border-amber-600/50 bg-amber-900/25 text-amber-100'
                      : 'border-transparent text-amber-200/50 hover:border-amber-800/30 hover:bg-amber-950/20 hover:text-amber-100'
                  }`}
                >
                  <span className="font-display text-sm">
                    <span className="text-amber-500/70">{c.numeral}.</span> {c.title}
                  </span>
                  <span className="block text-[11px] text-amber-200/40">{c.subtitle}</span>
                </a>
              ))}
            </nav>
          </aside>

          {/* Chapters */}
          <main className="min-w-0 flex-1 space-y-16">
            {/* I — Cosmic Song */}
            <ChapterHeading numeral="I" id="laulu" title="Kosminen laulu ja Suuri Hirvas" />
            <div className="space-y-4 text-[15px] leading-relaxed text-amber-100/85">
              <p>
                <span className="float-left mr-3 mt-1 font-display text-6xl font-bold leading-[0.8] text-amber-400">E</span>
                nnen kaikkea oli vain ääretön, loputon meri. Sitten tuli <strong className="text-amber-200">Handgai</strong>,
                Suuri Hirvas. Hän käveli alkuvesien päällä, loi ensimmäisen kiinteän maan — Dengin — heitti taivaan
                korkeuksiin ja veisti loputtomat arot. Handgai ei napsauttanut sormiaan luodakseen ihmisen; hän ohjasi
                elämän hidasta kehitystä mikroskooppisista meren eliöistä siksi, mitä se nyt on.
              </p>
              <p>
                Universumi kirjaimellisesti <em>laulettiin</em> olemassaoloon. Jokainen kivi, eläin ja ihminen on
                yhdistetty tähän jumalalliseen sävelmään. Jumalat laulavat sitä yhä pitääkseen maailman putoamasta
                kaaokseen, mutta ihmiskunta on unohtanut sanat. Todellinen onni tässä maailmassa syntyy siitä, että
                hahmo yrittää löytää uudelleen oman osansa Laulusta.
              </p>
            </div>

            {/* II — Law of Adversity */}
            <ChapterHeading numeral="II" id="laki" title="Vastoinkäymisten laki" />
            <div className="space-y-4 text-[15px] leading-relaxed text-amber-100/85">
              <p>
                Mukavuus on ansa. Uskon ytimen mukaan edistys syntyy vain vaikeuksien kautta. Helpot elämät tuottavat
                pehmeitä, pysähtyneitä yhteiskuntia. Kärsimys, nälkä ja alkuvoimien selättäminen nähdään
                kirjaimellisena tulena, joka karkaisee ihmisen voiman.
              </p>
              <blockquote className="border-l-2 border-amber-600/50 bg-amber-950/20 px-5 py-3 font-display text-lg italic text-amber-200/90">
                «Luonto on juokseva, raaka ja itseään korjaava — kun yksi laji kuolee, toinen täyttää tyhjiön
                aggressiivisesti.»
              </blockquote>
            </div>

            {/* III — Pantheon */}
            <ChapterHeading numeral="III" id="pantheon" title="Eläinten pantheon ja henkien lait" />
            <p className="text-[15px] leading-relaxed text-amber-100/85">
              Jumalat kulkevat maan päällä ottamalla pyhien eläinten fyysiset hahmot. Niiden vahingoittamisella tai
              enteiden sivuuttamisella on valtavat seuraukset hahmollesi.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {pantheon.map((p) => (
                <div key={p.name} className="rounded-2xl border border-amber-800/30 bg-slate-950/60 p-5">
                  <div className="mb-2 flex items-center gap-3">
                    <span className="text-3xl">{p.icon}</span>
                    <h3 className="font-display text-base font-semibold text-amber-200">{p.name}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-amber-100/75">{p.text}</p>
                </div>
              ))}
            </div>

            {/* IV — Great Divide */}
            <ChapterHeading numeral="IV" id="kahtiajako" title="Suuri kahtiajako" />
            <p className="text-[15px] leading-relaxed text-amber-100/85">
              Maailma on väkivaltaisesti halkaistu keskeltä valtavalla maantieteellisellä rajalla: <strong className="text-amber-200">Suurella joella</strong>.
            </p>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-red-800/30 bg-gradient-to-b from-red-950/30 to-slate-950/70 p-6">
                <h3 className="font-display text-lg font-semibold text-amber-100">Pohjoisen aroheimot</h3>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-amber-500/60">Aron valtiaat</p>
                <p className="mt-3 text-sm leading-relaxed text-amber-100/75">
                  Kiivaasti itsenäinen paimentolaiskulttuuri. He eivät rakenna kivitaloja — pysyvät muurit ovat
                  heille outoja, luonnottomia vankiloita. He matkaavat kausiluontoisten laidunten halki jättimäisissä,
                  kauniisti insinöörityönä rakennetuissa jurtissa. Sotaan lähtiessä koko yhteisö liikkuu vierivänä
                  kaupunkina: omat sektorinsa asesepille, parantajille, hevoskatraille ja liikkuville pyhäköille.
                </p>
              </div>
              <div className="rounded-2xl border border-sky-800/30 bg-gradient-to-b from-sky-950/30 to-slate-950/70 p-6">
                <h3 className="font-display text-lg font-semibold text-amber-100">Etelän kuningaskunnat</h3>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-amber-500/60">Kiven ja lain keisarikunta</p>
                <p className="mt-3 text-sm leading-relaxed text-amber-100/75">
                  Valtava, paikallaan pysyvä ja hyperbyrokraattinen koneisto, jota hallitsee itsevaltias keisari.
                  Kaikki rakentuu kivelle, laille ja paperityölle. He komentavat ammattiarmeijaa, joka voi mobilisoida
                  jopa 100 000 sotilasta: raskasta jalkaväkeä, lukittuja kilpimuureja, pysyviä kasarmeja ja valtavia
                  linnoituksia. Käskyt kulkevat vahasinetöityinä ratsulähettien verkostossa.
                </p>
              </div>
            </div>

            {/* V — Rules of Survival */}
            <ChapterHeading numeral="V" id="saannot" title="Selviytymisen säännöt ja erikoisroolit" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Rule title="Metsästystabu" text="Et voi metsästää mitä tahansa. Metsästyksen on oltava täysin kestävää, ettei Handgai vihastu. Siksi talous rakentuu juurikasvien keräilylle ja ruoan etsimiselle." />
              <Rule title="Eläinrasvasuojaus" text="Ilmasto tappaa ennen vihollista. Purevaa kylmyyttä vastaan kaikki kyllästävät vaatteensa ja haarniskansa paksuilla eläinrasvakerroksilla sulkeakseen ulos tuulen ja kosteuden." />
              <Rule title="Radikaali tasa-arvo" text="Ahneus on sosiaalinen kuolemantuomio. Kaikki ruoka ja resurssit jaetaan tasan klaanin sisällä. Vaurauden tai ruoan panttaaminen johtaa yhteisön täydelliseen hylkäämiseen." />
              <Rule title="Karkotuksen uhka" text="Kunniaa vaalitaan kiivaasti. Jos rikot heimolakia, perimmäinen rangaistus on karkotus — maailmassa, jossa selviytyminen vaatii ehdotonta yhteistyötä, se merkitsee hidasta, varmaa kuolemaa erämaassa." />
              <Rule title="Tiedustelukillat" text="Vakoojat eivät ole matalan tason lähettejä vaan yhteiskunnan arvostettuja, eliittijäseniä. He kartoittavat tuntemattomia maita ja suojaavat piilotettuja kauppareittejä. Vakoojan kenttäraportti voi muuttaa kruununperimyksen tai pysäyttää sodan." />
              <Rule title="Shamaanit" text="Henkien jo ennen syntymää valitsemat shamaanit ovat maailman lääkäreitä, unientulkitsijoita ja poliittisia neuvonantajia. Päälliköt hoitavat sotilaat, mutta shamaanit hoitavat henkiset lait — jännite on ikuinen." />
            </div>

            {/* VI — Leaders */}
            <ChapterHeading numeral="VI" id="mahtajat" title="Rajaseudun mahtajat" />
            <p className="text-[15px] leading-relaxed text-amber-100/85">
              Matkallasi hahmosi kohtaavat voimakkaan suvun, joka tällä hetkellä ohjaa rajaseudun kohtaloa.
            </p>
            <div className="space-y-5">
              {leaders.map((l) => (
                <div key={l.name} className={`rounded-2xl border bg-gradient-to-r ${l.accent} p-6`}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full border border-amber-600/30 bg-black/30 text-3xl">
                      {l.emoji}
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold text-amber-100">{l.name}</h3>
                      <p className="text-xs uppercase tracking-[0.25em] text-amber-500/70">{l.epithet}</p>
                      <p className="mt-3 text-sm leading-relaxed text-amber-100/80">{l.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* VII — Eras */}
            <ChapterHeading numeral="VII" id="aikakaudet" title="Aikakaudet — maailma ennen sotaa" />
            <ol className="relative space-y-6 border-l-2 border-amber-800/40 pl-6">
              {eras.map((e) => (
                <li key={e.era} className="relative">
                  <span className="absolute -left-[31px] flex h-4 w-4 items-center justify-center rounded-full border-2 border-amber-600 bg-slate-950" />
                  <p className="font-display text-xs uppercase tracking-[0.25em] text-amber-500/70">{e.era}</p>
                  <h3 className="font-display text-lg font-semibold text-amber-100">{e.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-amber-100/80">{e.text}</p>
                </li>
              ))}
            </ol>

            {/* VIII — Strategic Assets */}
            <ChapterHeading numeral="VIII" id="alueet" title="Strategiset alueet — kartta aseena" />
            <div className="grid gap-4 sm:grid-cols-3">
              {assets.map((a) => (
                <div key={a.name} className="rounded-2xl border border-amber-800/30 bg-slate-950/60 p-5 text-center">
                  <div className="text-4xl">{a.icon}</div>
                  <h3 className="mt-3 font-display text-base font-semibold text-amber-200">{a.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-amber-100/75">{a.text}</p>
                </div>
              ))}
            </div>

            {/* IX–XVIII — Kronikan tarinat */}
            {tales.map((tale) => (
              <Story key={tale.id} numeral={tale.numeral} id={tale.id} title={tale.title} paras={tale.paras} />
            ))}

            {/* Liite A — Heimot ja kansat */}
            <ChapterHeading numeral="Liite A" id="heimot" title="Heimot ja kansat" />
            <div className="grid gap-4 sm:grid-cols-2">
              {tribes.map((t) => (
                <div key={t.name} className="rounded-2xl border border-amber-800/30 bg-slate-950/60 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-amber-600/30 bg-black/30 text-2xl">{t.emoji}</div>
                    <h3 className="font-display text-base font-semibold text-amber-200">{t.name}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-amber-100/80">{t.text}</p>
                </div>
              ))}
            </div>

            {/* Liite B — Henkilögalleria */}
            <ChapterHeading numeral="Liite B" id="henkilot" title="Henkilögalleria" />
            <div className="grid gap-4 sm:grid-cols-2">
              {characters.map((c) => (
                <div key={c.name} className="rounded-2xl border border-amber-800/30 bg-slate-950/60 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border border-amber-600/30 bg-black/30 text-2xl">{c.emoji}</div>
                    <div>
                      <h3 className="font-display text-base font-semibold text-amber-100">{c.name}</h3>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-amber-500/70">{c.role}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-amber-100/80">{c.text}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-amber-800/30 pt-8 text-center">
              <p className="font-display italic text-amber-300/70">
                «Suuri Hirvas lauloi tämän maailman olemaan — nyt sen kohtalo lauletaan teräksellä, kullalla ja liitoilla.»
              </p>
              <Link to="/" className="mt-6 inline-flex items-center gap-2">
                <Button className="bg-amber-600 hover:bg-amber-500 text-white font-bold">
                  <ArrowLeft className="w-4 h-4" /> Takaisin peliin
                </Button>
              </Link>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

const ChapterHeading = ({ numeral, id, title }: { numeral: string; id: string; title: string }) => (
  <div id={id} className="scroll-mt-8">
    <div className="flex items-center gap-4">
      <span className="font-display text-5xl font-bold text-amber-500/30">{numeral}</span>
      <div className="flex-1">
        <div className="h-px w-full bg-gradient-to-r from-amber-600/50 to-transparent" />
        <h2 className="mt-2 font-display text-2xl font-bold text-amber-100">{title}</h2>
      </div>
    </div>
  </div>
);

const Rule = ({ title, text }: { title: string; text: string }) => (
  <div className="rounded-2xl border border-amber-800/30 bg-slate-950/60 p-5">
    <h3 className="font-display text-base font-semibold text-amber-200">{title}</h3>
    <p className="mt-2 text-sm leading-relaxed text-amber-100/75">{text}</p>
  </div>
);

const Story = ({ numeral, id, title, paras }: { numeral: string; id: string; title: string; paras: string[] }) => (
  <div>
    <ChapterHeading numeral={numeral} id={id} title={title} />
    <div className="space-y-4">
      {paras.map((p, i) => (
        <p
          key={i}
          className={`text-[15px] leading-relaxed text-amber-100/85 ${i === 0 ? 'first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-5xl first-letter:font-bold first-letter:text-amber-400/80' : ''}`}
        >
          {p}
        </p>
      ))}
    </div>
  </div>
);

export default Codex;

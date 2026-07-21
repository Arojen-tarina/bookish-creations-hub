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

export default Codex;

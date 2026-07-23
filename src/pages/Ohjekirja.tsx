import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.tsx';
import { ArrowLeft, ScrollText, Printer } from 'lucide-react';

/**
 * Ohjekirja.tsx — Arojen Tarinat / Story of the Steppe (1206)
 *
 * Pelin virallinen sääntökirja, kirjoitettu lakikirjan tapaan pykälittäin (§).
 * Jokainen luku vastaa pelin osajärjestelmää ja pykälät kuvaavat säännöt
 * tarkasti niin kuin ne on koodissa toteutettu.
 *
 * HUOM navigaatiosta: käytämme onClick + scrollIntoView -menetelmää emmekä
 * href="#id"-ankkureita, koska yksitiedostoversio (HashRouter) käyttää
 * URL:n hash-osaa reititykseen. Näin sisältönavigaatio toimii kaikissa
 * julkaisumuodoissa (normaali, GitHub Pages, yksitiedosto/file://).
 */

const CHAPTERS: { id: string; num: string; label: string }[] = [
  { id: 'johdanto',    num: 'I',     label: 'Johdanto ja pelin idea' },
  { id: 'kasitteet',   num: 'II',    label: 'Peruskäsitteet ja termistö' },
  { id: 'voitto',      num: 'III',   label: 'Voittoehdot — viisi tietä' },
  { id: 'fraktiot',    num: 'IV',    label: 'Fraktiot ja aloitusasetelma' },
  { id: 'kartta',      num: 'V',     label: 'Kartta, provinssit ja maasto' },
  { id: 'vuoro',       num: 'VI',    label: 'Vuoron rakenne (6 vaihetta)' },
  { id: 'talous',      num: 'VII',   label: 'Resurssit ja talous' },
  { id: 'silkkitie',   num: 'VIII',  label: 'Silkkitie ja kauppasolmut' },
  { id: 'rakennukset', num: 'IX',    label: 'Rakennukset' },
  { id: 'armeijat',    num: 'X',     label: 'Armeijat, rekrytointi ja liike' },
  { id: 'taistelu',    num: 'XI',    label: 'Taistelujärjestelmä' },
  { id: 'piiritys',    num: 'XII',   label: 'Piiritys ja pääkaupungit' },
  { id: 'paallikko',   num: 'XIII',  label: 'Heimopäällikkö' },
  { id: 'kortit',      num: 'XIV',   label: 'Korttijärjestelmä' },
  { id: 'diplomatia',  num: 'XV',    label: 'Diplomatia' },
  { id: 'kauppa',      num: 'XVI',   label: 'Kauppatavarat' },
  { id: 'tekoaly',     num: 'XVII',  label: 'Tekoäly (AI)' },
  { id: 'strategia',   num: 'XVIII', label: 'Strategiavinkkejä' },
];

const goTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/* ---------- pienet apukomponentit ---------- */

const Chapter = ({ id, num, title, children }: { id: string; num: string; title: string; children: React.ReactNode }) => (
  <section id={id} className="scroll-mt-24 border-t border-amber-800/30 pt-8 mt-10 first:mt-0 first:border-t-0 first:pt-0">
    <h2 className="text-2xl sm:text-3xl font-semibold text-amber-200 mb-1">
      <span className="text-amber-500/70 mr-2 font-serif">Luku {num}.</span>{title}
    </h2>
    <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-slate-300">{children}</div>
  </section>
);

const Para = ({ n, children }: { n: string; children: React.ReactNode }) => (
  <p className="pl-12 -indent-12">
    <span className="inline-block w-10 text-amber-400/90 font-semibold font-serif tabular-nums mr-2">§ {n}</span>
    {children}
  </p>
);

const Table = ({ head, rows }: { head: string[]; rows: (string | number)[][] }) => (
  <div className="overflow-x-auto my-4 rounded-lg border border-slate-700/60">
    <table className="w-full text-sm">
      <thead className="bg-slate-800/80 text-amber-200">
        <tr>{head.map((h, i) => <th key={i} className="text-left font-semibold px-3 py-2 whitespace-nowrap">{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className={i % 2 ? 'bg-slate-900/40' : 'bg-slate-950/40'}>
            {r.map((c, j) => <td key={j} className="px-3 py-2 align-top border-t border-slate-800/60">{c}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const Ohjekirja = () => {
  const [q, setQ] = useState('');
  const filtered = CHAPTERS.filter(c => c.label.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Yläpalkki */}
      <header className="sticky top-0 z-20 border-b border-amber-800/30 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ScrollText className="w-6 h-6 text-amber-300" />
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-amber-200 leading-tight">Arojen Tarinat — Sääntökirja</h1>
              <p className="text-[11px] text-slate-400 leading-tight">Story of the Steppe · vuosi 1206 · pykälittäin</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => window.print()} className="hidden sm:inline-flex">
              <Printer className="w-4 h-4 mr-1" /> Tulosta
            </Button>
            <Link to="/">
              <Button variant="secondary" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Peliin</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Sisällysluettelo */}
        <aside className="lg:sticky lg:top-[76px] lg:self-start">
          <div className="rounded-2xl border border-slate-700/60 bg-slate-900/70 p-4">
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Etsi lukua…"
              className="w-full mb-3 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <nav className="space-y-1 max-h-[70vh] overflow-y-auto pr-1">
              {filtered.map(c => (
                <button
                  key={c.id}
                  onClick={() => goTo(c.id)}
                  className="w-full text-left text-sm px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-amber-200 transition-colors"
                >
                  <span className="text-amber-500/70 font-serif mr-2">{c.num}.</span>{c.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Sisältö */}
        <main className="min-w-0">

          <Chapter id="johdanto" num="I" title="Johdanto ja pelin idea">
            <Para n="1.1">Arojen Tarinat (Story of the Steppe) on vuoropohjainen strategiapeli, joka sijoittuu vuoteen 1206 jKr. — hetkeen, jolloin Temüjin julistettiin Tšingis-kaaniksi ja arojen kansat mullistivat maailman. Pelaaja johtaa yhtä neljästä suurvallasta ja pyrkii voittoon jotakin viidestä eri voittotiestä pitkin (Luku III).</Para>
            <Para n="1.2">Peli on yhden pelaajan peli tekoälyvastustajia vastaan. Jokainen vuosi on yksi vuoro, joka jakautuu kuuteen vaiheeseen (Luku VI). Pelaaja hallitsee provinsseja (kyliä), kerää resursseja, rakentaa rakennuksia, rekrytoi armeijoita, pelaa kortteja, käy diplomatiaa ja sotaa.</Para>
            <Para n="1.3">Tämä sääntökirja kuvaa pelin säännöt sellaisina kuin ne on toteutettu. Numeroarvot (kustannukset, bonukset, kynnykset) ovat sitovia ja vastaavat pelin logiikkaa. Ristiriitatilanteessa peli itse ratkaisee, mutta tavoite on, että tämä kirja ja peli ovat yhtäpitävät.</Para>
          </Chapter>

          <Chapter id="kasitteet" num="II" title="Peruskäsitteet ja termistö">
            <Para n="2.1"><b>Provinssi (kylä):</b> yksi heksaruutu kartalla. Jokaisella provinssilla on omistaja (fraktio tai neutraali), maasto, peruskehitys, mahdollinen kauppatavara ja linnoitustaso.</Para>
            <Para n="2.2"><b>Fraktio:</b> pelattava valtakunta. Käytössä on neljä fraktiota: mongolit, Song (Kiina), Venäjän ruhtinaskunnat ja Khwarezm (Persia).</Para>
            <Para n="2.3"><b>Resurssit:</b> kulta, ruoka, hevoset, miesvoima (manpower), käsityöläiset (artisans). Lisäksi kaksi arvomittaria: vaikutusvalta ja arvovalta.</Para>
            <Para n="2.4"><b>Vaikutusvalta:</b> diplomaattinen paino, jota syntyy kauppasolmuista, pidetystä pääkaupungista, liitoista ja ihmeistä. Diplomatiavoiton mittari.</Para>
            <Para n="2.5"><b>Arvovalta:</b> kulttuurinen maine, jota syntyy vain Ihmeistä (rakennus). Kulttuurivoiton mittari.</Para>
            <Para n="2.6"><b>Armeija:</b> yksikköjoukko, jolla on ratsuväkeä, jalkaväkeä ja mahdollisesti piiritysyksiköitä, sekä moraali ja tarjonta.</Para>
            <Para n="2.7"><b>Silkkitie:</b> kartan poikki kulkeva kauppareitti; sen varren provinssit ovat kauppasolmuja, jotka tuottavat lisätuloa ja vaikutusvaltaa (Luku VIII).</Para>
          </Chapter>

          <Chapter id="voitto" num="III" title="Voittoehdot — viisi tietä">
            <Para n="3.1">Peli päättyy voittoon, kun mikä tahansa seuraavista viidestä ehdosta täyttyy pelaajan vuoron lopussa. Ehdot tarkistetaan joka vuoron lopussa.</Para>
            <Para n="3.2"><b>Sotilasvoitto:</b> valtaa jokaisen vihollisfraktion pääkaupunki — TAI hallitse vähintään <b>30 provinssia</b> (noin 40 % kartasta).</Para>
            <Para n="3.3"><b>Talousvoitto:</b> kolme ehtoa yhtä aikaa: (a) valtion kassassa vähintään <b>500 kultaa</b>, (b) hallitset <b>enemmistöä silkkitien kauppasolmuista</b> (yli puolet), ja (c) pidät kultarajan <b>vähintään 3 peräkkäistä vuoroa</b> (peräkkäisyyslaskuri nollautuu, jos kulta laskee alle 500:n).</Para>
            <Para n="3.4"><b>Teknologiavoitto:</b> pelaa <b>vähintään 5 teknologiakorttia</b> (pysyvät tek-kortit).</Para>
            <Para n="3.5"><b>Diplomatiavoitto:</b> saavuta <b>vaikutusvaltaa vähintään 100</b> — TAI solmi liitto jokaisen elossa olevan vihollisfraktion kanssa (vähintään 2 liittolaista).</Para>
            <Para n="3.6"><b>Kulttuurivoitto:</b> kerää <b>arvovaltaa vähintään 60</b> rakentamalla Ihmeitä pääkaupunkiin.</Para>
            <Para n="3.7"><b>Tappio:</b> pelaaja häviää, jos menettää kaikki provinssinsa ja kaikki armeijansa. Myös tekoäly voi voittaa sotilas- tai talousvoitolla, jolloin peli päättyy.</Para>
          </Chapter>

          <Chapter id="fraktiot" num="IV" title="Fraktiot ja aloitusasetelma">
            <Para n="4.1">Pelissä on neljä fraktiota, jotka sijoittuvat laudan kulmiin: rus vasempaan yläkulmaan, mongolit oikeaan yläkulmaan, Song oikeaan alakulmaan ja Khwarezm vasempaan alakulmaan. Kartan keskusta on neutraalia.</Para>
            <Para n="4.2">Jokainen fraktio aloittaa 12 provinssilla, pääkaupungilla ja yhdellä perustaja-armeijalla, jota johtaa Heimopäällikkö (Luku XIII). Aloitusresurssit ja erikoisbonukset alla.</Para>
            <Table
              head={['Fraktio', 'Väri', 'Hallitsija', 'Pääkaupunki', 'Kulta', 'Miesvoima', 'Hevoset', 'Erikoisbonukset']}
              rows={[
                ['Mongolien valtakunta', '🟡 keltainen', 'Tšingis-kaani', 'Karakorum', 50, 80, 100, 'Ratsuväki +30 %, piiritys +20 % · aggressiivinen'],
                ['Song-dynastia', '🟢 vihreä', 'Keisari Ningzong', "Lin'an (Hangzhou)", 200, 150, 20, 'Verotus +30 %, ratsuväki −10 %, piiritys −10 % · kauppias'],
                ['Venäjän ruhtinaskunnat', '⚪ harmaa', 'Suuriruhtinas', 'Novgorod', 80, 80, 25, 'Verotus +10 %, piiritys +10 % · puolustava'],
                ['Khwarezmin valtakunta', '🟣 purppura', 'Šaahi Muhammad II', 'Samarkand', 120, 100, 50, 'Ratsuväki +10 %, verotus +20 %, piiritys +10 % · laajentuva'],
              ]}
            />
            <Para n="4.3">Aloitussuhteet: kaikki fraktiot alkavat neutraaleina toisiinsa (suhde 0, luottamus 50, uhka 30). Poikkeus: mongoleja kohtaan muilla on lähtökohtainen epäluulo (suhde −20, uhka 60), koska mongolit ovat aggressiivinen laajentuja.</Para>
            <Para n="4.4">Aloitusvarat (yhteiset pelaajalle): ruokaa 10, käsityöläisiä 3, vaikutusvalta 0, arvovalta 0. Aloituskäsi: 5 korttia (Luku XIV).</Para>
          </Chapter>

          <Chapter id="kartta" num="V" title="Kartta, provinssit ja maasto">
            <Para n="5.1">Kartta on heksaruudukko, jonka jokaisessa kokonaisessa heksissä on yksi kylä. Kylät jakautuvat fraktioiden (reunat/kulmat) ja neutraalien (keskusta) kesken. Naapuruus lasketaan odd-r-heksalayoutilla: kukin ruutu rajautuu enintään kuuteen naapuriin.</Para>
            <Para n="5.2">Maasto vaikuttaa liikkumisen hintaan, puolustukseen, tarjontarajaan ja verotukseen. Liikekustannus riippuu yksikkötyypistä (jalka/ratsu/piiritys). Puolustusbonus lisätään puolustajan taisteluvoimaan (Luku XI).</Para>
            <Table
              head={['Maasto', 'Jalka', 'Ratsu', 'Piiritys', 'Puolustus', 'Tarjonta', 'Verokerroin']}
              rows={[
                ['🌾 Steppi', 1, 1, 2, 0, 3, '0.8×'],
                ['🌿 Ruohomaa', 1, 1, 2, 0, 5, '1.0×'],
                ['🌾 Viljelymaa', 1, 1, 2, 0, 8, '1.5×'],
                ['🌲 Metsä', 2, 1, 3, '+1', 4, '0.9×'],
                ['⛰️ Kukkulat', 2, 2, 3, '+2', 4, '0.8×'],
                ['⛰️ Vuoristo', 3, 3, 4, '+3', 2, '0.5×'],
                ['🏜️ Aavikko', 2, 2, 3, 0, 1, '0.3×'],
                ['🌿 Suo', 3, 3, 4, '+1', 2, '0.4×'],
                ['🌲 Taiga', 2, 2, 3, '+1', 2, '0.6×'],
                ['❄️ Tundra', 2, 2, 3, 0, 1, '0.2×'],
              ]}
            />
            <Para n="5.3">Viljelymaa ja ruohomaa tuottavat ruokaa; steppi ja hevos-provinssit tuottavat hevosia; viljelymaa ja kukkulat tuottavat käsityöläisiä (Luku VII). Vuoristo ja kukkulat antavat parhaan puolustuksen mutta hidastavat liikettä.</Para>
          </Chapter>

          <Chapter id="vuoro" num="VI" title="Vuoron rakenne (6 vaihetta)">
            <Para n="6.1">Jokainen vuoro (vuosi) etenee kuuden vaiheen läpi kiinteässä järjestyksessä. Vaiheesta toiseen siirrytään "Seuraava"-painikkeella.</Para>
            <Para n="6.2"><b>1. Resurssit:</b> kerää tulot hallituista provinsseista (kulta, miesvoima, ruoka, hevoset, käsityöläiset) sekä vaikutus- ja arvovalta. Tulot lasketaan Luvun VII kaavoilla.</Para>
            <Para n="6.3"><b>2. Kortit:</b> nosta 1 kortti pakasta (aloituskäsi on 5) ja pelaa haluamasi kortit kädestäsi. Korttien vaikutukset Luvussa XIV.</Para>
            <Para n="6.4"><b>3. Liike:</b> siirrä armeijoita naapuriprovinsseihin maaston liikekustannuksen mukaan.</Para>
            <Para n="6.5"><b>4. Taistelu:</b> ratkaise hyökkäykset vihollisen tai neutraalin hallitsemiin provinsseihin (Luku XI).</Para>
            <Para n="6.6"><b>5. Rakenna:</b> rakenna rakennuksia omiin provinsseihisi ja rekrytoi joukkoja (Luvut IX–X).</Para>
            <Para n="6.7"><b>6. Lopeta vuoro:</b> tekoälyvastustajat tekevät siirtonsa, piiritykset etenevät, pysyvät bonukset päivittyvät, voittoehdot tarkistetaan ja uusi vuosi alkaa.</Para>
          </Chapter>

          <Chapter id="talous" num="VII" title="Resurssit ja talous">
            <Para n="7.1"><b>Kultatulo</b> = (provinssien perusvero + silkkitiebonus + markkinabonus + siltabonus) × pääkaupunkikerroin. Markkina tuottaa +3 kultaa/kpl, silkkitien silta +2 kultaa/kpl. Jos pääkaupunki on menetetty, kerroin on 0.5 (tulo puolittuu), muutoin 1.0.</Para>
            <Para n="7.2"><b>Alkupelin piristys:</b> vuoroilla 1–4 kultatuloon lisätään +4 rakentamisen vauhdittamiseksi.</Para>
            <Para n="7.3"><b>Miesvoima</b> = 30 % provinssien yhteenlasketusta perusmiesvoimasta (pyöristetään alas).</Para>
            <Para n="7.4"><b>Ruoka</b> = −1 per armeija (ylläpito) + 0.5 × viljely-/ruohomaaprovinssit + 2 × leirit. Ruoka voi olla negatiivista muutosta; se kuluu joukkojen ylläpitoon.</Para>
            <Para n="7.5"><b>Hevoset</b> = steppi-/hevosprovinssien lukumäärä + hevostallien lukumäärä (1 per talli).</Para>
            <Para n="7.6"><b>Käsityöläiset</b> = 0.5 × (viljelymaa- ja kukkulaprovinssit) + pajojen lukumäärä. Jos hallitset vähintään 3 provinssia, saat vähintään 1 käsityöläisen/vuoro.</Para>
            <Para n="7.7"><b>Vaikutusvalta/vuoro</b> = kauppasolmut (1/kpl) + pidetty pääkaupunki (2) + liitot (2/kpl) + ihmeet (2/kpl).</Para>
            <Para n="7.8"><b>Arvovalta/vuoro</b> = 3 × ihmeiden lukumäärä.</Para>
          </Chapter>

          <Chapter id="silkkitie" num="VIII" title="Silkkitie ja kauppasolmut">
            <Para n="8.1">Silkkitie on kartan keskirivin poikki kulkeva kauppareitti. Sen varren provinssit ovat kauppasolmuja (silkkitie-lippu).</Para>
            <Para n="8.2"><b>Silkkitiebonus</b> = kauppasolmujen perusvero + 2 × silkki-kauppatavaraa tuottavat solmut + <b>ketjubonus</b>. Ketjubonus palkitsee yhtenäisten solmujaksojen hallinnasta: kukin toisiinsa kytketty klusteri (koko &gt; 1) antaa noin <span className="whitespace-nowrap">1.6 × (klusterikoko^1.45)</span> lisäkultaa. Yhtenäinen pätkä silkkitietä on siis paljon arvokkaampi kuin hajanaiset pysäkit.</Para>
            <Para n="8.3">Silkkitien enemmistön hallinta (yli puolet kaikista solmuista) on talousvoiton edellytys (§ 3.3) ja tuottaa merkittävää vaikutusvaltaa (§ 7.7).</Para>
          </Chapter>

          <Chapter id="rakennukset" num="IX" title="Rakennukset">
            <Para n="9.1">Rakennukset pystytetään Rakenna-vaiheessa omiin provinsseihin. Ne maksavat kultaa ja usein käsityöläisiä. Jokainen rakennus antaa pysyvän edun.</Para>
            <Table
              head={['Rakennus', 'Kulta', 'Käsityöl.', 'Vaikutus']}
              rows={[
                ['⛺ Leiri', 15, '—', '+2 ruokaa/vuoro; jalkaväen rekrytointipiste'],
                ['🏪 Markkina', 25, 1, '+3 kultaa/vuoro'],
                ['🌉 Silta', 20, 1, '+2 kultaa/vuoro silkkitiellä; karavaanien ylityspaikka'],
                ['🔨 Paja', 30, 1, '+1 käsityöläinen/vuoro; rekrytoidut joukot +10 moraalia'],
                ['🐎 Hevostalli', 40, 1, '+1 hevonen/vuoro; ratsuväen rekrytointipiste'],
                ['🏯 Linnoitus', 50, 2, '+3 puolustus (nostaa linnoitustasoa)'],
                ['🏛️ Ihme', 80, 3, 'Vain pääkaupungissa: +arvovaltaa ja +vaikutusvaltaa/vuoro'],
              ]}
            />
            <Para n="9.2"><b>Rakennusten roolit rekrytoinnissa:</b> Leiri avaa jalkaväen rekrytoinnin, Hevostalli avaa ratsuväen rekrytoinnin. Pääkaupungissa voi rekrytoida kumpaakin ilman erillistä rakennusta (Luku X).</Para>
            <Para n="9.3"><b>Ihme</b> on ainoa arvovallan lähde ja siten kulttuurivoiton avain. Sen voi rakentaa vain pääkaupunkiin.</Para>
          </Chapter>

          <Chapter id="armeijat" num="X" title="Armeijat, rekrytointi ja liike">
            <Para n="10.1"><b>Rekrytointikustannukset:</b> Jalkaväki maksaa <b>10 kultaa ja 5 ruokaa</b>. Ratsuväki maksaa <b>20 kultaa, 5 hevosta ja 10 ruokaa</b>.</Para>
            <Para n="10.2"><b>Rekrytoinnin ehdot:</b> jalkaväkeä voi rekrytoida provinssista, jossa on Leiri (tai pääkaupungista); ratsuväkeä provinssista, jossa on Hevostalli (tai pääkaupungista). Jos pääkaupunki on menetetty, rekrytointi on keskeytetty, kunnes se vallataan takaisin.</Para>
            <Para n="10.3"><b>Joukon kokoonpano:</b> Jalkaväkirekry tuottaa 5 jalkaväkeä (+enintään 2 ratsua käytettävissä olevien hevosten mukaan). Ratsuväkirekry tuottaa ratsuväkeä <span className="whitespace-nowrap">min(4 + tallit, hevoset/2)</span> ja loput jalkaväkenä (vähintään 2). Paja antaa uusille joukoille +10 moraalia (perusmoraali 70, pajalla 80).</Para>
            <Para n="10.4"><b>Liike:</b> armeija siirtyy naapuriprovinssiin maksamalla maaston liikekustannuksen (Luku V). Piiritysyksiköt käyttävät piirityskustannusta; muuten ratsuvaltaisella joukolla (ratsu ≥ jalka) käytetään ratsukustannusta, muutoin jalkakustannusta.</Para>
            <Para n="10.5"><b>Moraali ja tarjonta:</b> jokaisella armeijalla on moraali (0–100) ja tarjonta. Voitokas taistelu nostaa moraalia (+5). Heimopäällikön läheisyys nostaa moraalia (Luku XIII).</Para>
          </Chapter>

          <Chapter id="taistelu" num="XI" title="Taistelujärjestelmä">
            <Para n="11.1"><b>Taisteluvoima:</b> Hyökkääjän voima = 2 × ratsuväki + jalkaväki + piiritys + hyökkäysbonukset. Puolustajan voima = 2 × ratsuväki + jalkaväki. Ratsuväki on siis kaksinkertaisen arvoista raakavoimassa.</Para>
            <Para n="11.2"><b>Nopanheitto:</b> molemmat heittävät 1d6. Hyökkääjän pistemäärä = voima + noppa. Puolustajan pistemäärä = voima + noppa + 2 × maaston puolustusbonus + 3 × tehollinen linnoitustaso.</Para>
            <Para n="11.3"><b>Piiritys heikentää muureja:</b> tehollinen linnoitustaso = linnoitustaso − 0.5 × piiritysyksiköt (ei alle 0). Piiritysyksiköt siis murtavat puolustusta.</Para>
            <Para n="11.4"><b>Ratkaisu:</b> suuremman pistemäärän saanut voittaa. Jos hyökkääjä voittaa, puolustaja kärsii vahinkoa (hyökkääjän voima − puolustusbonukset); jos häviää, hyökkääjä kärsii vahinkoa puolustajan voiman verran.</Para>
            <Para n="11.5"><b>Tappioiden jako:</b> vahinko osuu ensin jalkaväkeen; ylijäävä vahinko poistaa ratsuväkeä puolella teholla (ratsuväki kestää paremmin). Puolustaja tuhoutuu, jos menettää kaiken sekä ratsu- että jalkaväkensä.</Para>
            <Para n="11.6"><b>Korttien vaikutus:</b> pelatut strategiakortit voivat antaa hyökkäys-, puolustus- tai liikebonuksia, jotka lisätään voimalaskuun (Luku XIV).</Para>
          </Chapter>

          <Chapter id="piiritys" num="XII" title="Piiritys ja pääkaupungit">
            <Para n="12.1"><b>Saarto:</b> jos provinssi on kokonaan vihollisten hallitsemien naapureiden ympäröimä, se joutuu piiritykseen ja piiritysmittari kasvaa vuoro vuorolta.</Para>
            <Para n="12.2"><b>Piirityksen vaikutus:</b> jos provinssissa on linnoitus, sen taso laskee −1/vuoro piirityksessä. Jos linnoitusta ei ole, omistaja menettää 5 kultaa/vuoro (tarjonnan katkeaminen). Piiritysmittari nollautuu, kun saarto puretaan.</Para>
            <Para n="12.3"><b>Menetetty pääkaupunki:</b> jos oma pääkaupunki on vihollisen hallussa, (a) kaikki kultatulo puolittuu (§ 7.1) ja (b) rekrytointi on keskeytetty (§ 10.2), kunnes pääkaupunki vallataan takaisin.</Para>
            <Para n="12.4"><b>Vihollisen pääkaupungit</b> ovat sotilasvoiton avain: kaikkien vihollispääkaupunkien valtaaminen päättää pelin voittoon (§ 3.2).</Para>
          </Chapter>

          <Chapter id="paallikko" num="XIII" title="Heimopäällikkö">
            <Para n="13.1">Jokaisen fraktion perustaja-armeija ("main"-armeija) kantaa Heimopäällikköä. Päällikkö on sekä johtaja että moraalin lähde.</Para>
            <Para n="13.2"><b>Moraalibonus:</b> päällikön kanssa samassa provinssissa olevat armeijat saavat +5 moraalia, ja viereisissä provinsseissa olevat armeijat pienemmän bonuksen. Bonukset päivittyvät vuoron lopussa.</Para>
            <Para n="13.3"><b>Päällikön kaatuminen:</b> jos pelaajan perustaja-armeija tuhoutuu, seuraa kertaluontoinen rangaistus: <b>−30 kultaa</b>, <b>−15 vaikutusvaltaa</b> ja kaikkien pelaajan joukkojen moraali laskee (−10). Tämä tapahtuu vain kerran.</Para>
            <Para n="13.4">Päällikön suojeleminen on siis strategisesti tärkeää: älä lähetä perustaja-armeijaa turhiin riskeihin varhaisessa vaiheessa.</Para>
          </Chapter>

          <Chapter id="kortit" num="XIV" title="Korttijärjestelmä">
            <Para n="14.1"><b>Kortin nosto:</b> peli alkaa 5 kortin kädellä; Kortit-vaiheessa nostat 1 uuden kortin/vuoro. Pelatut kortit menevät poistopakkaan (paitsi pysyvät teknologiakortit).</Para>
            <Para n="14.2"><b>Korttityypit:</b> strategia (taistelubonukset), teknologia (pysyvät bonukset; 5 pelattua = teknologiavoitto), diplomatia (suhteet) ja resurssi (kulta/ruoka/hevoset/käsityöläiset).</Para>
            <Para n="14.3"><b>Harvinaisuudet:</b> tavallinen, epätavallinen, harvinainen, legendaarinen. Harvinaisemmat kortit ovat voimakkaampia mutta esiintyvät harvemmin.</Para>
            <Para n="14.4"><b>Vaikutusten kesto:</b> resurssikortit vaikuttavat heti (kulta/ruoka/hevoset/käsityöläiset lisätään varastoihin). Hyökkäys-/puolustusbonukset ovat voimassa määrätyn keston (usein tämän vuoron); liikebonus lisää joukkojen liikepisteitä heti. Pysyvät hyökkäys-/puolustuskortit (teknologia) jäävät voimaan koko pelin.</Para>
            <Para n="14.5">Kortit näkyvät pelinäkymän alalaidan korttipaneelissa kuvitettuina. Paneelia voi suurentaa ja pienentää raahaamalla sen yläreunaa; kortit skaalautuvat aina näkyviin kokonaan.</Para>
          </Chapter>

          <Chapter id="diplomatia" num="XV" title="Diplomatia">
            <Para n="15.1"><b>Suhteet:</b> jokaisella fraktioparilla on suhdeluku, luottamus, uhka ja rajakitka. Sopimukset (treaties) muuttavat näitä.</Para>
            <Para n="15.2"><b>Sopimustyypit:</b> rauhanomaiset — hyökkäämättömyys (non_aggression), rauha, aselepo (truce) ja liitto (alliance); sekä sotaan liittyvät — muodollinen sota (war_formal) ja yllätyshyökkäys (war_surprise).</Para>
            <Para n="15.3"><b>Liitto</b> tuottaa +2 vaikutusvaltaa/vuoro (§ 7.7). Liitto jokaisen elossa olevan vihollisen kanssa (väh. 2) on yksi diplomatiavoiton reitti (§ 3.5).</Para>
            <Para n="15.4"><b>Sodanjulistus:</b> muodollinen sota aktivoituu määrätyllä vuorolla ja romahduttaa suhteen (−90), luottamuksen (0) ja nostaa uhkaa (+30). Mongoleihin kohdistuu jo alusta korkeampi uhka (§ 4.3).</Para>
          </Chapter>

          <Chapter id="kauppa" num="XVI" title="Kauppatavarat">
            <Para n="16.1">Osa provinsseista tuottaa kauppatavaraa, joka antaa pysyvän edun sen omistajalle. Arvo (value) kuvaa tavaran suhteellista arvokkuutta kaupassa.</Para>
            <Table
              head={['Tavara', 'Arvo', 'Vaikutus']}
              rows={[
                ['🪙 Kulta', 6, '+3 kultaa/vuoro'],
                ['🧣 Silkki', 5, '+3 kultaa/vuoro (vahvistaa silkkitietä)'],
                ['💎 Jalokivet', 5, '+2 kultaa/vuoro ja +1 moraali'],
                ['🌶️ Mausteet', 4, '+2 kultaa/vuoro'],
                ['🧥 Turkikset', 4, '+1 tarjonta ja +1 moraali'],
                ['🐴 Hevoset', 3, '+2 ratsuväen rekrytointi'],
                ['⚔️ Rauta', 3, '−20 % yksiköiden kustannus'],
                ['🧂 Suola', 3, '+1 tarjonta'],
                ['🌾 Vilja', 2, '+2 miesvoimaa'],
                ['🐄 Karja', 2, '+1 miesvoimaa, +1 tarjonta'],
              ]}
            />
          </Chapter>

          <Chapter id="tekoaly" num="XVII" title="Tekoäly (AI)">
            <Para n="17.1">Vuoron lopussa jokainen tekoälyfraktio tekee siirtonsa persoonallisuutensa mukaan: aggressiivinen (mongolit) laajentaa ja hyökkää, kauppias (Song) keskittyy talouteen, puolustava (rus) linnoittautuu ja laajentuva (Khwarezm) valtaa neutraaleja.</Para>
            <Para n="17.2">Tekoäly voi voittaa sotilas- tai talousvoitolla samoin ehdoin kuin pelaaja. Tekoälyn siirrot näkyvät vuoronvaihdon ilmoituksissa.</Para>
            <Para n="17.3">Tekoäly ottaa huomioon uhka- ja suhdeluvut: korkea uhka lisää hyökkäysalttiutta. Mongolien korkea lähtöuhka tekee niistä todennäköisen aggressorin.</Para>
          </Chapter>

          <Chapter id="strategia" num="XVIII" title="Strategiavinkkejä">
            <Para n="18.1"><b>Käytä alkupelin piristys:</b> vuoroilla 1–4 saat +4 kultaa/vuoro. Rakenna aikaisin markkinoita ja leirejä talouden ja rekrytoinnin pohjaksi.</Para>
            <Para n="18.2"><b>Hallitse silkkitietä yhtenäisesti:</b> ketjubonus (§ 8.2) palkitsee vierekkäisistä kauppasolmuista epäsuhtaisen paljon — kokoa yhtenäinen jakso hajanaisten pysäkkien sijaan.</Para>
            <Para n="18.3"><b>Suojele pääkaupunkia ja päällikköä:</b> menetetty pääkaupunki puolittaa tulon ja pysäyttää rekrytoinnin; päällikön kaatuminen maksaa 30 kultaa ja 15 vaikutusvaltaa.</Para>
            <Para n="18.4"><b>Valitse voittotie ajoissa:</b> mongoleilla sotilastie on luontevin (ratsuväki +30 %), Songilla talous- ja kulttuuritie (verotus +30 %), Khwarezmilla laajentuminen ja Venäjällä puolustava kulutussota.</Para>
            <Para n="18.5"><b>Käytä maastoa:</b> puolusta vuoristossa ja kukkuloilla (+3/+2 puolustus), hyökkää ratsuväellä avomaastossa, missä liike on halpaa.</Para>
            <Para n="18.6"><b>Piiritysyksiköt muureja vastaan:</b> linnoitettuja provinsseja vastaan tuo piiritysyksiköitä — ne heikentävät tehollista linnoitustasoa (§ 11.3).</Para>
          </Chapter>

          <footer className="mt-14 pt-6 border-t border-amber-800/30 text-center text-sm text-slate-500">
            <p>Arojen Tarinat — Story of the Steppe · Sääntökirja · vuosi 1206</p>
            <div className="mt-3 flex justify-center gap-2">
              <button onClick={() => goTo('johdanto')} className="text-amber-300 hover:text-amber-100 text-sm">↑ Takaisin alkuun</button>
              <span className="text-slate-600">·</span>
              <Link to="/" className="text-amber-300 hover:text-amber-100 text-sm">Palaa peliin</Link>
            </div>
          </footer>

        </main>
      </div>
    </div>
  );
};

export default Ohjekirja;

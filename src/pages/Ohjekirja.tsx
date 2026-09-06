import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.tsx';
import { ArrowLeft, ScrollText, Printer } from 'lucide-react';
import { useLanguage } from '@/lib/i18n.tsx';

/**
 * Ohjekirja.tsx — Arojen Tarinat / Story of the Steppe (1206)
 *
 * Pelin virallinen sääntökirja, kirjoitettu lakikirjan tapaan pykälittäin (§).
 * Jokainen luku vastaa pelin osajärjestelmää ja pykälät kuvaavat säännöt
 * tarkasti niin kuin ne on koodissa toteutettu. Kaksikielinen (fi/en) — ks. i18n.tsx.
 *
 * HUOM navigaatiosta: käytämme onClick + scrollIntoView -menetelmää emmekä
 * href="#id"-ankkureita, koska yksitiedostoversio (HashRouter) käyttää
 * URL:n hash-osaa reititykseen. Näin sisältönavigaatio toimii kaikissa
 * julkaisumuodoissa (normaali, GitHub Pages, yksitiedosto/file://).
 */

type Bi = { fi: string; en: string };

const CHAPTERS: { id: string; num: string; label: Bi }[] = [
  { id: 'johdanto',    num: 'I',     label: { fi: 'Johdanto ja pelin idea', en: 'Introduction and game concept' } },
  { id: 'kasitteet',   num: 'II',    label: { fi: 'Peruskäsitteet ja termistö', en: 'Basic concepts and terminology' } },
  { id: 'voitto',      num: 'III',   label: { fi: 'Voittoehdot — viisi tietä', en: 'Victory conditions — five paths' } },
  { id: 'fraktiot',    num: 'IV',    label: { fi: 'Fraktiot ja aloitusasetelma', en: 'Factions and starting setup' } },
  { id: 'kartta',      num: 'V',     label: { fi: 'Kartta, provinssit ja maasto', en: 'Map, provinces and terrain' } },
  { id: 'vuoro',       num: 'VI',    label: { fi: 'Vuoron rakenne (6 vaihetta)', en: 'Turn structure (6 phases)' } },
  { id: 'talous',      num: 'VII',   label: { fi: 'Resurssit ja talous', en: 'Resources and economy' } },
  { id: 'silkkitie',   num: 'VIII',  label: { fi: 'Silkkitie ja kauppasolmut', en: 'The Silk Road and trade nodes' } },
  { id: 'rakennukset', num: 'IX',    label: { fi: 'Rakennukset', en: 'Buildings' } },
  { id: 'armeijat',    num: 'X',     label: { fi: 'Armeijat, rekrytointi ja liike', en: 'Armies, recruitment and movement' } },
  { id: 'taistelu',    num: 'XI',    label: { fi: 'Taistelujärjestelmä', en: 'Battle system' } },
  { id: 'piiritys',    num: 'XII',   label: { fi: 'Piiritys ja pääkaupungit', en: 'Siege and capitals' } },
  { id: 'paallikko',   num: 'XIII',  label: { fi: 'Heimopäällikkö', en: 'Tribal Chief' } },
  { id: 'kortit',      num: 'XIV',   label: { fi: 'Korttijärjestelmä', en: 'Card system' } },
  { id: 'diplomatia',  num: 'XV',    label: { fi: 'Diplomatia', en: 'Diplomacy' } },
  { id: 'kauppa',      num: 'XVI',   label: { fi: 'Kauppatavarat', en: 'Trade goods' } },
  { id: 'tekoaly',     num: 'XVII',  label: { fi: 'Tekoäly (AI)', en: 'Artificial intelligence (AI)' } },
  { id: 'strategia',   num: 'XVIII', label: { fi: 'Strategiavinkkejä', en: 'Strategy tips' } },
];

const goTo = (id: string) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

/* ---------- pienet apukomponentit ---------- */

// Yksinkertainen **lihavointi**-merkintä tekstin sisällä, jotta § -kappaleet
// voidaan tallentaa yhtenä kaksikielisenä merkkijonona JSX-puun sijaan.
const formatBold = (text: string) =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <b key={i}>{part.slice(2, -2)}</b>
      : <span key={i}>{part}</span>
  );

const Chapter = ({ id, num, title, children }: { id: string; num: string; title: Bi; children: React.ReactNode }) => {
  const { lang } = useLanguage();
  return (
    <section id={id} className="scroll-mt-24 border-t border-amber-800/30 pt-8 mt-10 first:mt-0 first:border-t-0 first:pt-0">
      <h2 className="text-2xl sm:text-3xl font-semibold text-amber-200 mb-1">
        <span className="text-amber-500/70 mr-2 font-serif">{lang === 'fi' ? 'Luku' : 'Chapter'} {num}.</span>{title[lang]}
      </h2>
      <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-slate-300">{children}</div>
    </section>
  );
};

const Para = ({ n, fi, en }: { n: string; fi: string; en: string }) => {
  const { lang } = useLanguage();
  return (
    <p className="pl-12 -indent-12">
      <span className="inline-block w-10 text-amber-400/90 font-semibold font-serif tabular-nums mr-2">§ {n}</span>
      {formatBold(lang === 'fi' ? fi : en)}
    </p>
  );
};

const Table = ({ head, rows }: { head: Bi[]; rows: { fi: (string | number)[]; en: (string | number)[] }[] }) => {
  const { lang } = useLanguage();
  return (
    <div className="overflow-x-auto my-4 rounded-lg border border-slate-700/60">
      <table className="w-full text-sm">
        <thead className="bg-slate-800/80 text-amber-200">
          <tr>{head.map((h, i) => <th key={i} className="text-left font-semibold px-3 py-2 whitespace-nowrap">{h[lang]}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={i % 2 ? 'bg-slate-900/40' : 'bg-slate-950/40'}>
              {r[lang].map((c, j) => <td key={j} className="px-3 py-2 align-top border-t border-slate-800/60">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Ohjekirja = () => {
  const { lang } = useLanguage();
  const [q, setQ] = useState('');
  const filtered = CHAPTERS.filter(c => c.label[lang].toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Yläpalkki */}
      <header className="sticky top-0 z-20 border-b border-amber-800/30 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ScrollText className="w-6 h-6 text-amber-300" />
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-amber-200 leading-tight">{lang === 'fi' ? 'Arojen Tarinat — Sääntökirja' : 'Tales of the Steppe — Rulebook'}</h1>
              <p className="text-[11px] text-slate-400 leading-tight">{lang === 'fi' ? 'Story of the Steppe · vuosi 1206 · pykälittäin' : 'Story of the Steppe · year 1206 · by article'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => window.print()} className="hidden sm:inline-flex">
              <Printer className="w-4 h-4 mr-1" /> {lang === 'fi' ? 'Tulosta' : 'Print'}
            </Button>
            <Link to="/">
              <Button variant="secondary" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> {lang === 'fi' ? 'Peliin' : 'To game'}</Button>
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
              placeholder={lang === 'fi' ? 'Etsi lukua…' : 'Search chapters…'}
              className="w-full mb-3 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <nav className="space-y-1 max-h-[70vh] overflow-y-auto pr-1">
              {filtered.map(c => (
                <button
                  key={c.id}
                  onClick={() => goTo(c.id)}
                  className="w-full text-left text-sm px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-amber-200 transition-colors"
                >
                  <span className="text-amber-500/70 font-serif mr-2">{c.num}.</span>{c.label[lang]}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Sisältö */}
        <main className="min-w-0">

          <Chapter id="johdanto" num="I" title={{ fi: 'Johdanto ja pelin idea', en: 'Introduction and game concept' }}>
            <Para n="1.1"
              fi="Arojen Tarinat (Story of the Steppe) on vuoropohjainen strategiapeli, joka sijoittuu vuoteen 1206 jKr. — hetkeen, jolloin Temüjin julistettiin Tšingis-kaaniksi ja arojen kansat mullistivat maailman. Pelaaja johtaa yhtä neljästä suurvallasta ja pyrkii voittoon jotakin viidestä eri voittotiestä pitkin (Luku III)."
              en="Tales of the Steppe (Story of the Steppe) is a turn-based strategy game set in 1206 AD — the moment Temüjin was proclaimed Genghis Khan and the peoples of the steppe upended the world. The player leads one of four great powers and seeks victory along one of five different paths (Chapter III)."
            />
            <Para n="1.2"
              fi="Peli on yhden pelaajan peli tekoälyvastustajia vastaan. Jokainen vuosi on yksi vuoro, joka jakautuu kuuteen vaiheeseen (Luku VI). Pelaaja hallitsee provinsseja (kyliä), kerää resursseja, rakentaa rakennuksia, rekrytoi armeijoita, pelaa kortteja, käy diplomatiaa ja sotaa."
              en="It is a single-player game against AI opponents. Each year is one turn, divided into six phases (Chapter VI). The player controls provinces (villages), gathers resources, constructs buildings, recruits armies, plays cards, and conducts diplomacy and war."
            />
            <Para n="1.3"
              fi="Tämä sääntökirja kuvaa pelin säännöt sellaisina kuin ne on toteutettu. Numeroarvot (kustannukset, bonukset, kynnykset) ovat sitovia ja vastaavat pelin logiikkaa. Ristiriitatilanteessa peli itse ratkaisee, mutta tavoite on, että tämä kirja ja peli ovat yhtäpitävät."
              en="This rulebook describes the game's rules exactly as implemented. Numeric values (costs, bonuses, thresholds) are binding and match the game's logic. In case of conflict the game itself is authoritative, but the goal is for this book and the game to agree."
            />
          </Chapter>

          <Chapter id="kasitteet" num="II" title={{ fi: 'Peruskäsitteet ja termistö', en: 'Basic concepts and terminology' }}>
            <Para n="2.1" fi="**Provinssi (kylä):** yksi heksaruutu kartalla. Jokaisella provinssilla on omistaja (fraktio tai neutraali), maasto, peruskehitys, mahdollinen kauppatavara ja linnoitustaso."
              en="**Province (village):** one hex tile on the map. Each province has an owner (a faction or neutral), terrain, base development, a possible trade good, and a fortification level." />
            <Para n="2.2" fi="**Fraktio:** pelattava valtakunta. Käytössä on neljä fraktiota: mongolit, Song (Kiina), Venäjän ruhtinaskunnat ja Khwarezm (Persia)."
              en="**Faction:** a playable realm. Four factions are available: the Mongols, Song (China), the Rus principalities, and Khwarezm (Persia)." />
            <Para n="2.3" fi="**Resurssit:** kulta, ruoka, hevoset, miesvoima (manpower), käsityöläiset (artisans). Lisäksi kaksi arvomittaria: vaikutusvalta ja arvovalta."
              en="**Resources:** gold, food, horses, manpower, and artisans. Plus two prestige-like meters: influence and prestige." />
            <Para n="2.4" fi="**Vaikutusvalta:** diplomaattinen paino, jota syntyy kauppasolmuista, pidetystä pääkaupungista, liitoista ja ihmeistä. Diplomatiavoiton mittari."
              en="**Influence:** diplomatic weight, generated by trade nodes, holding your capital, alliances, and Wonders. The Diplomatic Victory meter." />
            <Para n="2.5" fi="**Arvovalta:** kulttuurinen maine, jota syntyy vain Ihmeistä (rakennus). Kulttuurivoiton mittari."
              en="**Prestige:** cultural renown, generated only by Wonders (a building). The Cultural Victory meter." />
            <Para n="2.6" fi="**Armeija:** yksikköjoukko, jolla on ratsuväkeä, jalkaväkeä ja mahdollisesti piiritysyksiköitä, sekä moraali ja tarjonta."
              en="**Army:** a unit stack with cavalry, infantry, and possibly siege units, plus morale and supply." />
            <Para n="2.7" fi="**Silkkitie:** kartan poikki kulkeva kauppareitti; sen varren provinssit ovat kauppasolmuja, jotka tuottavat lisätuloa ja vaikutusvaltaa (Luku VIII)."
              en="**Silk Road:** a trade route running across the map; the provinces along it are trade nodes that generate extra income and influence (Chapter VIII)." />
          </Chapter>

          <Chapter id="voitto" num="III" title={{ fi: 'Voittoehdot — viisi tietä', en: 'Victory conditions — five paths' }}>
            <Para n="3.1" fi="Peli päättyy voittoon, kun mikä tahansa seuraavista viidestä ehdosta täyttyy pelaajan vuoron lopussa. Ehdot tarkistetaan joka vuoron lopussa."
              en="The game ends in victory when any of the following five conditions is met at the end of a player's turn. Conditions are checked at the end of every turn." />
            <Para n="3.2" fi="**Sotilasvoitto:** valtaa jokaisen vihollisfraktion pääkaupunki — TAI hallitse vähintään **30 provinssia** (noin 40 % kartasta)."
              en="**Military Victory:** capture every enemy faction's capital — OR control at least **30 provinces** (about 40% of the map)." />
            <Para n="3.3" fi="**Talousvoitto:** kolme ehtoa yhtä aikaa: (a) valtion kassassa vähintään **500 kultaa**, (b) hallitset **enemmistöä silkkitien kauppasolmuista** (yli puolet), ja (c) pidät kultarajan **vähintään 3 peräkkäistä vuoroa** (peräkkäisyyslaskuri nollautuu, jos kulta laskee alle 500:n)."
              en="**Economic Victory:** three conditions at once: (a) at least **500 gold** in the treasury, (b) you control a **majority of the Silk Road's trade nodes** (more than half), and (c) you hold the gold threshold for **at least 3 consecutive turns** (the streak resets if gold drops below 500)." />
            <Para n="3.4" fi="**Teknologiavoitto:** pelaa **vähintään 5 teknologiakorttia** (pysyvät tek-kortit)."
              en="**Technology Victory:** play **at least 5 technology cards** (permanent tech cards)." />
            <Para n="3.5" fi="**Diplomatiavoitto:** saavuta **vaikutusvaltaa vähintään 100** — TAI solmi liitto jokaisen elossa olevan vihollisfraktion kanssa (vähintään 2 liittolaista)."
              en="**Diplomatic Victory:** reach **at least 100 influence** — OR form an alliance with every surviving enemy faction (at least 2 allies)." />
            <Para n="3.6" fi="**Kulttuurivoitto:** kerää **arvovaltaa vähintään 60** rakentamalla Ihmeitä pääkaupunkiin."
              en="**Cultural Victory:** accumulate **at least 60 prestige** by building Wonders in your capital." />
            <Para n="3.7" fi="**Tappio:** pelaaja häviää, jos menettää kaikki provinssinsa ja kaikki armeijansa. Myös tekoäly voi voittaa sotilas- tai talousvoitolla, jolloin peli päättyy."
              en="**Defeat:** the player loses if they lose all their provinces and all their armies. The AI can also win by military or economic victory, which ends the game." />
          </Chapter>

          <Chapter id="fraktiot" num="IV" title={{ fi: 'Fraktiot ja aloitusasetelma', en: 'Factions and starting setup' }}>
            <Para n="4.1" fi="Pelissä on neljä fraktiota, jotka sijoittuvat laudan kulmiin: rus vasempaan yläkulmaan, mongolit oikeaan yläkulmaan, Song oikeaan alakulmaan ja Khwarezm vasempaan alakulmaan. Kartan keskusta on neutraalia."
              en="The game has four factions positioned in the corners of the board: the Rus in the upper-left, the Mongols in the upper-right, Song in the lower-right, and Khwarezm in the lower-left. The center of the map is neutral." />
            <Para n="4.2" fi="Jokainen fraktio aloittaa 12 provinssilla, pääkaupungilla ja yhdellä perustaja-armeijalla, jota johtaa Heimopäällikkö (Luku XIII). Aloitusresurssit ja erikoisbonukset alla."
              en="Each faction starts with 12 provinces, a capital, and one founder army led by the Tribal Chief (Chapter XIII). Starting resources and special bonuses are listed below." />
            <Table
              head={[{ fi: 'Fraktio', en: 'Faction' }, { fi: 'Väri', en: 'Color' }, { fi: 'Hallitsija', en: 'Ruler' }, { fi: 'Pääkaupunki', en: 'Capital' }, { fi: 'Kulta', en: 'Gold' }, { fi: 'Miesvoima', en: 'Manpower' }, { fi: 'Hevoset', en: 'Horses' }, { fi: 'Erikoisbonukset', en: 'Special bonuses' }]}
              rows={[
                { fi: ['Mongolien valtakunta', '🟡 keltainen', 'Tšingis-kaani', 'Karakorum', 50, 80, 100, 'Ratsuväki +30 %, piiritys +20 % · aggressiivinen'], en: ['Mongol Empire', '🟡 yellow', 'Genghis Khan', 'Karakorum', 50, 80, 100, 'Cavalry +30%, siege +20% · aggressive'] },
                { fi: ['Song-dynastia', '🟢 vihreä', 'Keisari Ningzong', "Lin'an (Hangzhou)", 200, 150, 20, 'Verotus +30 %, ratsuväki −10 %, piiritys −10 % · kauppias'], en: ['Song Dynasty', '🟢 green', 'Emperor Ningzong', "Lin'an (Hangzhou)", 200, 150, 20, 'Taxation +30%, cavalry −10%, siege −10% · merchant'] },
                { fi: ['Venäjän ruhtinaskunnat', '⚪ harmaa', 'Suuriruhtinas', 'Novgorod', 80, 80, 25, 'Verotus +10 %, piiritys +10 % · puolustava'], en: ['Rus Principalities', '⚪ grey', 'Grand Prince', 'Novgorod', 80, 80, 25, 'Taxation +10%, siege +10% · defensive'] },
                { fi: ['Khwarezmin valtakunta', '🟣 purppura', 'Šaahi Muhammad II', 'Samarkand', 120, 100, 50, 'Ratsuväki +10 %, verotus +20 %, piiritys +10 % · laajentuva'], en: ['Khwarezmian Empire', '🟣 purple', 'Shah Muhammad II', 'Samarkand', 120, 100, 50, 'Cavalry +10%, taxation +20%, siege +10% · expansionist'] },
              ]}
            />
            <Para n="4.3" fi="Aloitussuhteet: kaikki fraktiot alkavat neutraaleina toisiinsa (suhde 0, luottamus 50, uhka 30). Poikkeus: mongoleja kohtaan muilla on lähtökohtainen epäluulo (suhde −20, uhka 60), koska mongolit ovat aggressiivinen laajentuja."
              en="Starting relations: all factions begin neutral toward each other (relation 0, trust 50, threat 30). Exception: the others start with inherent suspicion toward the Mongols (relation −20, threat 60), since the Mongols are an aggressive expansionist power." />
            <Para n="4.4" fi="Aloitusvarat (yhteiset pelaajalle): ruokaa 10, käsityöläisiä 3, vaikutusvalta 0, arvovalta 0. Aloituskäsi: 5 korttia (Luku XIV)."
              en="Starting stockpile (shared by all players): 10 food, 3 artisans, 0 influence, 0 prestige. Starting hand: 5 cards (Chapter XIV)." />
          </Chapter>

          <Chapter id="kartta" num="V" title={{ fi: 'Kartta, provinssit ja maasto', en: 'Map, provinces and terrain' }}>
            <Para n="5.1" fi="Kartta on heksaruudukko, jonka jokaisessa kokonaisessa heksissä on yksi kylä. Kylät jakautuvat fraktioiden (reunat/kulmat) ja neutraalien (keskusta) kesken. Naapuruus lasketaan odd-r-heksalayoutilla: kukin ruutu rajautuu enintään kuuteen naapuriin."
              en="The map is a hex grid where every full hex contains one village. Villages are divided among the factions (edges/corners) and neutrals (center). Adjacency is computed with an odd-r hex layout: each tile borders at most six neighbors." />
            <Para n="5.2" fi="Maasto vaikuttaa liikkumisen hintaan, puolustukseen, tarjontarajaan ja verotukseen. Liikekustannus riippuu yksikkötyypistä (jalka/ratsu/piiritys). Puolustusbonus lisätään puolustajan taisteluvoimaan (Luku XI)."
              en="Terrain affects movement cost, defense, supply limit, and taxation. Movement cost depends on unit type (infantry/cavalry/siege). The defense bonus is added to the defender's combat power (Chapter XI)." />
            <Table
              head={[{ fi: 'Maasto', en: 'Terrain' }, { fi: 'Jalka', en: 'Infantry' }, { fi: 'Ratsu', en: 'Cavalry' }, { fi: 'Piiritys', en: 'Siege' }, { fi: 'Puolustus', en: 'Defense' }, { fi: 'Tarjonta', en: 'Supply' }, { fi: 'Verokerroin', en: 'Tax multiplier' }]}
              rows={[
                { fi: ['🌾 Steppi', 1, 1, 2, 0, 3, '0.8×'], en: ['🌾 Steppe', 1, 1, 2, 0, 3, '0.8×'] },
                { fi: ['🌿 Ruohomaa', 1, 1, 2, 0, 5, '1.0×'], en: ['🌿 Grassland', 1, 1, 2, 0, 5, '1.0×'] },
                { fi: ['🌾 Viljelymaa', 1, 1, 2, 0, 8, '1.5×'], en: ['🌾 Farmland', 1, 1, 2, 0, 8, '1.5×'] },
                { fi: ['🌲 Metsä', 2, 1, 3, '+1', 4, '0.9×'], en: ['🌲 Forest', 2, 1, 3, '+1', 4, '0.9×'] },
                { fi: ['⛰️ Kukkulat', 2, 2, 3, '+2', 4, '0.8×'], en: ['⛰️ Hills', 2, 2, 3, '+2', 4, '0.8×'] },
                { fi: ['⛰️ Vuoristo', 3, 3, 4, '+3', 2, '0.5×'], en: ['⛰️ Mountains', 3, 3, 4, '+3', 2, '0.5×'] },
                { fi: ['🏜️ Aavikko', 2, 2, 3, 0, 1, '0.3×'], en: ['🏜️ Desert', 2, 2, 3, 0, 1, '0.3×'] },
                { fi: ['🌿 Suo', 3, 3, 4, '+1', 2, '0.4×'], en: ['🌿 Marsh', 3, 3, 4, '+1', 2, '0.4×'] },
                { fi: ['🌲 Taiga', 2, 2, 3, '+1', 2, '0.6×'], en: ['🌲 Taiga', 2, 2, 3, '+1', 2, '0.6×'] },
                { fi: ['❄️ Tundra', 2, 2, 3, 0, 1, '0.2×'], en: ['❄️ Tundra', 2, 2, 3, 0, 1, '0.2×'] },
              ]}
            />
            <Para n="5.3" fi="Viljelymaa ja ruohomaa tuottavat ruokaa; steppi ja hevos-provinssit tuottavat hevosia; viljelymaa ja kukkulat tuottavat käsityöläisiä (Luku VII). Vuoristo ja kukkulat antavat parhaan puolustuksen mutta hidastavat liikettä."
              en="Farmland and grassland produce food; steppe and horse provinces produce horses; farmland and hills produce artisans (Chapter VII). Mountains and hills give the best defense but slow movement." />
          </Chapter>

          <Chapter id="vuoro" num="VI" title={{ fi: 'Vuoron rakenne (6 vaihetta)', en: 'Turn structure (6 phases)' }}>
            <Para n="6.1" fi='Jokainen vuoro (vuosi) etenee kuuden vaiheen läpi kiinteässä järjestyksessä. Vaiheesta toiseen siirrytään "Seuraava"-painikkeella.'
              en='Each turn (year) proceeds through six phases in a fixed order. Move from one phase to the next with the "Next" button.' />
            <Para n="6.2" fi="**1. Resurssit:** kerää tulot hallituista provinsseista (kulta, miesvoima, ruoka, hevoset, käsityöläiset) sekä vaikutus- ja arvovalta. Tulot lasketaan Luvun VII kaavoilla."
              en="**1. Resources:** collect income from controlled provinces (gold, manpower, food, horses, artisans) plus influence and prestige. Income is calculated with the formulas in Chapter VII." />
            <Para n="6.3" fi="**2. Kortit:** nosta 1 kortti pakasta (aloituskäsi on 5) ja pelaa haluamasi kortit kädestäsi. Korttien vaikutukset Luvussa XIV."
              en="**2. Cards:** draw 1 card from the deck (the starting hand is 5) and play whichever cards you like from your hand. Card effects are in Chapter XIV." />
            <Para n="6.4" fi="**3. Liike:** siirrä armeijoita naapuriprovinsseihin maaston liikekustannuksen mukaan."
              en="**3. Move:** move armies into neighboring provinces according to the terrain's movement cost." />
            <Para n="6.5" fi="**4. Taistelu:** ratkaise hyökkäykset vihollisen tai neutraalin hallitsemiin provinsseihin (Luku XI)."
              en="**4. Battle:** resolve attacks against enemy- or neutral-controlled provinces (Chapter XI)." />
            <Para n="6.6" fi="**5. Rakenna:** rakenna rakennuksia omiin provinsseihisi ja rekrytoi joukkoja (Luvut IX–X)."
              en="**5. Build:** construct buildings in your own provinces and recruit troops (Chapters IX–X)." />
            <Para n="6.7" fi="**6. Lopeta vuoro:** tekoälyvastustajat tekevät siirtonsa, piiritykset etenevät, pysyvät bonukset päivittyvät, voittoehdot tarkistetaan ja uusi vuosi alkaa."
              en="**6. End turn:** the AI opponents make their moves, sieges advance, permanent bonuses update, victory conditions are checked, and a new year begins." />
          </Chapter>

          <Chapter id="talous" num="VII" title={{ fi: 'Resurssit ja talous', en: 'Resources and economy' }}>
            <Para n="7.1" fi="**Kultatulo** = (provinssien perusvero + silkkitiebonus + markkinabonus + siltabonus) × pääkaupunkikerroin. Markkina tuottaa +3 kultaa/kpl, silkkitien silta +2 kultaa/kpl. Jos pääkaupunki on menetetty, kerroin on 0.5 (tulo puolittuu), muutoin 1.0."
              en="**Gold income** = (provinces' base tax + Silk Road bonus + market bonus + bridge bonus) × capital multiplier. A market yields +3 gold each, a Silk Road bridge +2 gold each. If the capital is lost, the multiplier is 0.5 (income halved), otherwise 1.0." />
            <Para n="7.2" fi="**Alkupelin piristys:** vuoroilla 1–4 kultatuloon lisätään +4 rakentamisen vauhdittamiseksi."
              en="**Early-game boost:** on turns 1–4, +4 is added to gold income to speed up early construction." />
            <Para n="7.3" fi="**Miesvoima** = 30 % provinssien yhteenlasketusta perusmiesvoimasta (pyöristetään alas)."
              en="**Manpower** = 30% of the provinces' combined base manpower (rounded down)." />
            <Para n="7.4" fi="**Ruoka** = −1 per armeija (ylläpito) + 0.5 × viljely-/ruohomaaprovinssit + 2 × leirit. Ruoka voi olla negatiivista muutosta; se kuluu joukkojen ylläpitoon."
              en="**Food** = −1 per army (upkeep) + 0.5 × farmland/grassland provinces + 2 × camps. Food can be a negative change; it is consumed by troop upkeep." />
            <Para n="7.5" fi="**Hevoset** = steppi-/hevosprovinssien lukumäärä + hevostallien lukumäärä (1 per talli)."
              en="**Horses** = number of steppe/horse provinces + number of stables (1 per stable)." />
            <Para n="7.6" fi="**Käsityöläiset** = 0.5 × (viljelymaa- ja kukkulaprovinssit) + pajojen lukumäärä. Jos hallitset vähintään 3 provinssia, saat vähintään 1 käsityöläisen/vuoro."
              en="**Artisans** = 0.5 × (farmland and hill provinces) + number of workshops. If you control at least 3 provinces, you get at least 1 artisan per turn." />
            <Para n="7.7" fi="**Vaikutusvalta/vuoro** = kauppasolmut (1/kpl) + pidetty pääkaupunki (2) + liitot (2/kpl) + ihmeet (2/kpl)."
              en="**Influence/turn** = trade nodes (1 each) + held capital (2) + alliances (2 each) + Wonders (2 each)." />
            <Para n="7.8" fi="**Arvovalta/vuoro** = 3 × ihmeiden lukumäärä."
              en="**Prestige/turn** = 3 × number of Wonders." />
          </Chapter>

          <Chapter id="silkkitie" num="VIII" title={{ fi: 'Silkkitie ja kauppasolmut', en: 'The Silk Road and trade nodes' }}>
            <Para n="8.1" fi="Silkkitie on kartan keskirivin poikki kulkeva kauppareitti. Sen varren provinssit ovat kauppasolmuja (silkkitie-lippu)."
              en="The Silk Road is a trade route running across the map's central row. The provinces along it are trade nodes (marked with a Silk Road flag)." />
            <Para n="8.2" fi="**Silkkitiebonus** = kauppasolmujen perusvero + 2 × silkki-kauppatavaraa tuottavat solmut + **ketjubonus**. Ketjubonus palkitsee yhtenäisten solmujaksojen hallinnasta: kukin toisiinsa kytketty klusteri (koko > 1) antaa noin 1.6 × (klusterikoko^1.45) lisäkultaa. Yhtenäinen pätkä silkkitietä on siis paljon arvokkaampi kuin hajanaiset pysäkit."
              en="**Silk Road bonus** = trade nodes' base tax + 2 × nodes producing the silk trade good + **chain bonus**. The chain bonus rewards controlling unbroken runs of nodes: each connected cluster (size > 1) grants roughly 1.6 × (cluster size^1.45) extra gold. A single unbroken stretch of the Silk Road is therefore far more valuable than scattered stops." />
            <Para n="8.3" fi="Silkkitien enemmistön hallinta (yli puolet kaikista solmuista) on talousvoiton edellytys (§ 3.3) ja tuottaa merkittävää vaikutusvaltaa (§ 7.7)."
              en="Holding a majority of the Silk Road (more than half of all nodes) is a requirement for Economic Victory (§ 3.3) and generates significant influence (§ 7.7)." />
          </Chapter>

          <Chapter id="rakennukset" num="IX" title={{ fi: 'Rakennukset', en: 'Buildings' }}>
            <Para n="9.1" fi="Rakennukset pystytetään Rakenna-vaiheessa omiin provinsseihin. Ne maksavat kultaa ja usein käsityöläisiä. Jokainen rakennus antaa pysyvän edun."
              en="Buildings are constructed during the Build phase in your own provinces. They cost gold and often artisans. Each building grants a permanent benefit." />
            <Table
              head={[{ fi: 'Rakennus', en: 'Building' }, { fi: 'Kulta', en: 'Gold' }, { fi: 'Käsityöl.', en: 'Artisans' }, { fi: 'Vaikutus', en: 'Effect' }]}
              rows={[
                { fi: ['⛺ Leiri', 15, '—', '+2 ruokaa/vuoro; jalkaväen rekrytointipiste'], en: ['⛺ Camp', 15, '—', '+2 food/turn; infantry recruitment point'] },
                { fi: ['🏪 Markkina', 25, 1, '+3 kultaa/vuoro'], en: ['🏪 Market', 25, 1, '+3 gold/turn'] },
                { fi: ['🌉 Silta', 20, 1, '+2 kultaa/vuoro silkkitiellä; karavaanien ylityspaikka'], en: ['🌉 Bridge', 20, 1, '+2 gold/turn on the Silk Road; caravan crossing point'] },
                { fi: ['🔨 Paja', 30, 1, '+1 käsityöläinen/vuoro; rekrytoidut joukot +10 moraalia'], en: ['🔨 Workshop', 30, 1, '+1 artisan/turn; recruited troops get +10 morale'] },
                { fi: ['🐎 Hevostalli', 40, 1, '+1 hevonen/vuoro; ratsuväen rekrytointipiste'], en: ['🐎 Stable', 40, 1, '+1 horse/turn; cavalry recruitment point'] },
                { fi: ['🏯 Linnoitus', 50, 2, '+3 puolustus (nostaa linnoitustasoa)'], en: ['🏯 Fortress', 50, 2, '+3 defense (raises fortification level)'] },
                { fi: ['🏛️ Ihme', 80, 3, 'Vain pääkaupungissa: +arvovaltaa ja +vaikutusvaltaa/vuoro'], en: ['🏛️ Wonder', 80, 3, 'Capital only: +prestige and +influence/turn'] },
              ]}
            />
            <Para n="9.2" fi="**Rakennusten roolit rekrytoinnissa:** Leiri avaa jalkaväen rekrytoinnin, Hevostalli avaa ratsuväen rekrytoinnin. Pääkaupungissa voi rekrytoida kumpaakin ilman erillistä rakennusta (Luku X)."
              en="**Buildings' role in recruitment:** a Camp unlocks infantry recruitment, a Stable unlocks cavalry recruitment. In the capital, both can be recruited without a dedicated building (Chapter X)." />
            <Para n="9.3" fi="**Ihme** on ainoa arvovallan lähde ja siten kulttuurivoiton avain. Sen voi rakentaa vain pääkaupunkiin."
              en="**Wonder** is the only source of prestige and thus the key to Cultural Victory. It can only be built in the capital." />
          </Chapter>

          <Chapter id="armeijat" num="X" title={{ fi: 'Armeijat, rekrytointi ja liike', en: 'Armies, recruitment and movement' }}>
            <Para n="10.1" fi="**Rekrytointikustannukset:** Jalkaväki maksaa **10 kultaa ja 5 ruokaa**. Ratsuväki maksaa **20 kultaa, 5 hevosta ja 10 ruokaa**."
              en="**Recruitment costs:** Infantry costs **10 gold and 5 food**. Cavalry costs **20 gold, 5 horses, and 10 food**." />
            <Para n="10.2" fi="**Rekrytoinnin ehdot:** jalkaväkeä voi rekrytoida provinssista, jossa on Leiri (tai pääkaupungista); ratsuväkeä provinssista, jossa on Hevostalli (tai pääkaupungista). Jos pääkaupunki on menetetty, rekrytointi on keskeytetty, kunnes se vallataan takaisin."
              en="**Recruitment requirements:** infantry can be recruited from a province with a Camp (or the capital); cavalry from a province with a Stable (or the capital). If the capital is lost, recruitment is suspended until it is recaptured." />
            <Para n="10.3" fi="**Joukon kokoonpano:** Jalkaväkirekry tuottaa 5 jalkaväkeä (+enintään 2 ratsua käytettävissä olevien hevosten mukaan). Ratsuväkirekry tuottaa ratsuväkeä min(4 + tallit, hevoset/2) ja loput jalkaväkenä (vähintään 2). Paja antaa uusille joukoille +10 moraalia (perusmoraali 70, pajalla 80)."
              en="**Stack composition:** an infantry recruitment produces 5 infantry (+ up to 2 cavalry depending on available horses). A cavalry recruitment produces cavalry equal to min(4 + stables, horses/2), with the remainder as infantry (at least 2). A Workshop grants new troops +10 morale (base morale 70, 80 with a Workshop)." />
            <Para n="10.4" fi="**Liike:** armeija siirtyy naapuriprovinssiin maksamalla maaston liikekustannuksen (Luku V). Piiritysyksiköt käyttävät piirityskustannusta; muuten ratsuvaltaisella joukolla (ratsu ≥ jalka) käytetään ratsukustannusta, muutoin jalkakustannusta."
              en="**Movement:** an army moves into a neighboring province by paying the terrain's movement cost (Chapter V). Siege units use the siege cost; otherwise a cavalry-heavy stack (cavalry ≥ infantry) uses the cavalry cost, and infantry-heavy stacks use the infantry cost." />
            <Para n="10.5" fi="**Moraali ja tarjonta:** jokaisella armeijalla on moraali (0–100) ja tarjonta. Voitokas taistelu nostaa moraalia (+5). Heimopäällikön läheisyys nostaa moraalia (Luku XIII)."
              en="**Morale and supply:** every army has morale (0–100) and supply. A victorious battle raises morale (+5). Proximity to the Tribal Chief raises morale (Chapter XIII)." />
          </Chapter>

          <Chapter id="taistelu" num="XI" title={{ fi: 'Taistelujärjestelmä', en: 'Battle system' }}>
            <Para n="11.1" fi="**Taisteluvoima:** Hyökkääjän voima = 2 × ratsuväki + jalkaväki + piiritys + hyökkäysbonukset. Puolustajan voima = 2 × ratsuväki + jalkaväki. Ratsuväki on siis kaksinkertaisen arvoista raakavoimassa."
              en="**Combat power:** Attacker power = 2 × cavalry + infantry + siege + attack bonuses. Defender power = 2 × cavalry + infantry. Cavalry is thus worth double in raw power." />
            <Para n="11.2" fi="**Nopanheitto:** molemmat heittävät 1d6. Hyökkääjän pistemäärä = voima + noppa. Puolustajan pistemäärä = voima + noppa + 2 × maaston puolustusbonus + 3 × tehollinen linnoitustaso."
              en="**Dice roll:** both sides roll 1d6. Attacker score = power + die. Defender score = power + die + 2 × terrain defense bonus + 3 × effective fortification level." />
            <Para n="11.3" fi="**Piiritys heikentää muureja:** tehollinen linnoitustaso = linnoitustaso − 0.5 × piiritysyksiköt (ei alle 0). Piiritysyksiköt siis murtavat puolustusta."
              en="**Siege weakens walls:** effective fortification level = fortification level − 0.5 × siege units (not below 0). Siege units thus erode the defense." />
            <Para n="11.4" fi="**Ratkaisu:** suuremman pistemäärän saanut voittaa. Jos hyökkääjä voittaa, puolustaja kärsii vahinkoa (hyökkääjän voima − puolustusbonukset); jos häviää, hyökkääjä kärsii vahinkoa puolustajan voiman verran."
              en="**Resolution:** whoever scores higher wins. If the attacker wins, the defender takes damage (attacker power − defense bonuses); if the attacker loses, the attacker takes damage equal to the defender's power." />
            <Para n="11.5" fi="**Tappioiden jako:** vahinko osuu ensin jalkaväkeen; ylijäävä vahinko poistaa ratsuväkeä puolella teholla (ratsuväki kestää paremmin). Puolustaja tuhoutuu, jos menettää kaiken sekä ratsu- että jalkaväkensä."
              en="**Casualty allocation:** damage first hits infantry; any remaining damage removes cavalry at half effectiveness (cavalry is tougher). The defender is destroyed if it loses all its cavalry and infantry." />
            <Para n="11.6" fi="**Korttien vaikutus:** pelatut strategiakortit voivat antaa hyökkäys-, puolustus- tai liikebonuksia, jotka lisätään voimalaskuun (Luku XIV)."
              en="**Card effects:** played strategy cards can grant attack, defense, or movement bonuses, which are added to the power calculation (Chapter XIV)." />
          </Chapter>

          <Chapter id="piiritys" num="XII" title={{ fi: 'Piiritys ja pääkaupungit', en: 'Siege and capitals' }}>
            <Para n="12.1" fi="**Saarto:** jos provinssi on kokonaan vihollisten hallitsemien naapureiden ympäröimä, se joutuu piiritykseen ja piiritysmittari kasvaa vuoro vuorolta."
              en="**Blockade:** if a province is completely surrounded by enemy-controlled neighbors, it becomes besieged and the siege gauge grows turn by turn." />
            <Para n="12.2" fi="**Piirityksen vaikutus:** jos provinssissa on linnoitus, sen taso laskee −1/vuoro piirityksessä. Jos linnoitusta ei ole, omistaja menettää 5 kultaa/vuoro (tarjonnan katkeaminen). Piiritysmittari nollautuu, kun saarto puretaan."
              en="**Effect of siege:** if the province has a fortress, its level drops by −1/turn under siege. If there is no fortress, the owner loses 5 gold/turn (supply is cut off). The siege gauge resets once the blockade is lifted." />
            <Para n="12.3" fi="**Menetetty pääkaupunki:** jos oma pääkaupunki on vihollisen hallussa, (a) kaikki kultatulo puolittuu (§ 7.1) ja (b) rekrytointi on keskeytetty (§ 10.2), kunnes pääkaupunki vallataan takaisin."
              en="**Lost capital:** if your own capital is in enemy hands, (a) all gold income is halved (§ 7.1) and (b) recruitment is suspended (§ 10.2) until the capital is recaptured." />
            <Para n="12.4" fi="**Vihollisen pääkaupungit** ovat sotilasvoiton avain: kaikkien vihollispääkaupunkien valtaaminen päättää pelin voittoon (§ 3.2)."
              en="**Enemy capitals** are the key to Military Victory: capturing every enemy capital ends the game in victory (§ 3.2)." />
          </Chapter>

          <Chapter id="paallikko" num="XIII" title={{ fi: 'Heimopäällikkö', en: 'Tribal Chief' }}>
            <Para n="13.1" fi='Jokaisen fraktion perustaja-armeija ("main"-armeija) kantaa Heimopäällikköä. Päällikkö on sekä johtaja että moraalin lähde.'
              en={'Every faction\'s founder army (the "main" army) carries the Tribal Chief. The Chief is both a leader and a source of morale.'} />
            <Para n="13.2" fi="**Moraalibonus:** päällikön kanssa samassa provinssissa olevat armeijat saavat +5 moraalia, ja viereisissä provinsseissa olevat armeijat pienemmän bonuksen. Bonukset päivittyvät vuoron lopussa."
              en="**Morale bonus:** armies in the same province as the Chief gain +5 morale, and armies in neighboring provinces get a smaller bonus. Bonuses update at the end of the turn." />
            <Para n="13.3" fi="**Päällikön kaatuminen:** jos pelaajan perustaja-armeija tuhoutuu, seuraa kertaluontoinen rangaistus: **−30 kultaa**, **−15 vaikutusvaltaa** ja kaikkien pelaajan joukkojen moraali laskee (−10). Tämä tapahtuu vain kerran."
              en="**Death of the Chief:** if the player's founder army is destroyed, a one-time penalty follows: **−30 gold**, **−15 influence**, and the morale of all the player's troops drops (−10). This happens only once." />
            <Para n="13.4" fi="Päällikön suojeleminen on siis strategisesti tärkeää: älä lähetä perustaja-armeijaa turhiin riskeihin varhaisessa vaiheessa."
              en="Protecting the Chief is therefore strategically important: don't send the founder army into needless risks early on." />
          </Chapter>

          <Chapter id="kortit" num="XIV" title={{ fi: 'Korttijärjestelmä', en: 'Card system' }}>
            <Para n="14.1" fi="**Kortin nosto:** peli alkaa 5 kortin kädellä; Kortit-vaiheessa nostat 1 uuden kortin/vuoro. Pelatut kortit menevät poistopakkaan (paitsi pysyvät teknologiakortit)."
              en="**Drawing cards:** the game starts with a 5-card hand; during the Cards phase you draw 1 new card per turn. Played cards go to the discard pile (except permanent technology cards)." />
            <Para n="14.2" fi="**Korttityypit:** strategia (taistelubonukset), teknologia (pysyvät bonukset; 5 pelattua = teknologiavoitto), diplomatia (suhteet) ja resurssi (kulta/ruoka/hevoset/käsityöläiset)."
              en="**Card types:** strategy (combat bonuses), technology (permanent bonuses; 5 played = Technology Victory), diplomacy (relations), and resource (gold/food/horses/artisans)." />
            <Para n="14.3" fi="**Harvinaisuudet:** tavallinen, epätavallinen, harvinainen, legendaarinen. Harvinaisemmat kortit ovat voimakkaampia mutta esiintyvät harvemmin."
              en="**Rarities:** common, uncommon, rare, legendary. Rarer cards are more powerful but appear less often." />
            <Para n="14.4" fi="**Vaikutusten kesto:** resurssikortit vaikuttavat heti (kulta/ruoka/hevoset/käsityöläiset lisätään varastoihin). Hyökkäys-/puolustusbonukset ovat voimassa määrätyn keston (usein tämän vuoron); liikebonus lisää joukkojen liikepisteitä heti. Pysyvät hyökkäys-/puolustuskortit (teknologia) jäävät voimaan koko pelin."
              en="**Duration of effects:** resource cards take effect immediately (gold/food/horses/artisans are added to stockpiles). Attack/defense bonuses last a set duration (often just this turn); a movement bonus adds movement points immediately. Permanent attack/defense cards (technology) remain in effect for the rest of the game." />
            <Para n="14.5" fi="Kortit näkyvät pelinäkymän alalaidan korttipaneelissa kuvitettuina. Paneelia voi suurentaa ja pienentää raahaamalla sen yläreunaa; kortit skaalautuvat aina näkyviin kokonaan."
              en="Cards appear illustrated in the card panel at the bottom of the game view. The panel can be enlarged or shrunk by dragging its top edge; cards always scale to stay fully visible." />
          </Chapter>

          <Chapter id="diplomatia" num="XV" title={{ fi: 'Diplomatia', en: 'Diplomacy' }}>
            <Para n="15.1" fi="**Suhteet:** jokaisella fraktioparilla on suhdeluku, luottamus, uhka ja rajakitka. Sopimukset (treaties) muuttavat näitä."
              en="**Relations:** every pair of factions has a relation score, trust, threat, and border friction. Treaties change these values." />
            <Para n="15.2" fi="**Sopimustyypit:** rauhanomaiset — hyökkäämättömyys (non_aggression), rauha, aselepo (truce) ja liitto (alliance); sekä sotaan liittyvät — muodollinen sota (war_formal) ja yllätyshyökkäys (war_surprise)."
              en="**Treaty types:** peaceful — non-aggression, peace, truce, and alliance; and war-related — formal war (war_formal) and surprise attack (war_surprise)." />
            <Para n="15.3" fi="**Liitto** tuottaa +2 vaikutusvaltaa/vuoro (§ 7.7). Liitto jokaisen elossa olevan vihollisen kanssa (väh. 2) on yksi diplomatiavoiton reitti (§ 3.5)."
              en="**Alliance** generates +2 influence/turn (§ 7.7). An alliance with every surviving enemy (at least 2) is one path to Diplomatic Victory (§ 3.5)." />
            <Para n="15.4" fi="**Sodanjulistus:** muodollinen sota aktivoituu määrätyllä vuorolla ja romahduttaa suhteen (−90), luottamuksen (0) ja nostaa uhkaa (+30). Mongoleihin kohdistuu jo alusta korkeampi uhka (§ 4.3)."
              en="**Declaration of war:** a formal war activates on a set turn and crashes relations (−90) and trust (0), and raises threat (+30). The Mongols already carry a higher starting threat from the outset (§ 4.3)." />
          </Chapter>

          <Chapter id="kauppa" num="XVI" title={{ fi: 'Kauppatavarat', en: 'Trade goods' }}>
            <Para n="16.1" fi="Osa provinsseista tuottaa kauppatavaraa, joka antaa pysyvän edun sen omistajalle. Arvo (value) kuvaa tavaran suhteellista arvokkuutta kaupassa."
              en="Some provinces produce a trade good, which grants a permanent benefit to its owner. Value describes the good's relative worth in trade." />
            <Table
              head={[{ fi: 'Tavara', en: 'Good' }, { fi: 'Arvo', en: 'Value' }, { fi: 'Vaikutus', en: 'Effect' }]}
              rows={[
                { fi: ['🪙 Kulta', 6, '+3 kultaa/vuoro'], en: ['🪙 Gold', 6, '+3 gold/turn'] },
                { fi: ['🧣 Silkki', 5, '+3 kultaa/vuoro (vahvistaa silkkitietä)'], en: ['🧣 Silk', 5, '+3 gold/turn (strengthens the Silk Road)'] },
                { fi: ['💎 Jalokivet', 5, '+2 kultaa/vuoro ja +1 moraali'], en: ['💎 Gems', 5, '+2 gold/turn and +1 morale'] },
                { fi: ['🌶️ Mausteet', 4, '+2 kultaa/vuoro'], en: ['🌶️ Spices', 4, '+2 gold/turn'] },
                { fi: ['🧥 Turkikset', 4, '+1 tarjonta ja +1 moraali'], en: ['🧥 Furs', 4, '+1 supply and +1 morale'] },
                { fi: ['🐴 Hevoset', 3, '+2 ratsuväen rekrytointi'], en: ['🐴 Horses', 3, '+2 cavalry recruitment'] },
                { fi: ['⚔️ Rauta', 3, '−20 % yksiköiden kustannus'], en: ['⚔️ Iron', 3, '−20% unit cost'] },
                { fi: ['🧂 Suola', 3, '+1 tarjonta'], en: ['🧂 Salt', 3, '+1 supply'] },
                { fi: ['🌾 Vilja', 2, '+2 miesvoimaa'], en: ['🌾 Grain', 2, '+2 manpower'] },
                { fi: ['🐄 Karja', 2, '+1 miesvoimaa, +1 tarjonta'], en: ['🐄 Cattle', 2, '+1 manpower, +1 supply'] },
              ]}
            />
          </Chapter>

          <Chapter id="tekoaly" num="XVII" title={{ fi: 'Tekoäly (AI)', en: 'Artificial intelligence (AI)' }}>
            <Para n="17.1" fi="Vuoron lopussa jokainen tekoälyfraktio tekee siirtonsa persoonallisuutensa mukaan: aggressiivinen (mongolit) laajentaa ja hyökkää, kauppias (Song) keskittyy talouteen, puolustava (rus) linnoittautuu ja laajentuva (Khwarezm) valtaa neutraaleja."
              en="At the end of a turn, each AI faction acts according to its personality: the aggressive one (Mongols) expands and attacks, the merchant (Song) focuses on the economy, the defensive one (Rus) fortifies, and the expansionist (Khwarezm) takes neutral provinces." />
            <Para n="17.2" fi="Tekoäly voi voittaa sotilas- tai talousvoitolla samoin ehdoin kuin pelaaja. Tekoälyn siirrot näkyvät vuoronvaihdon ilmoituksissa."
              en="The AI can win by military or economic victory under the same conditions as the player. AI moves are shown in the end-of-turn notifications." />
            <Para n="17.3" fi="Tekoäly ottaa huomioon uhka- ja suhdeluvut: korkea uhka lisää hyökkäysalttiutta. Mongolien korkea lähtöuhka tekee niistä todennäköisen aggressorin."
              en="The AI takes threat and relation scores into account: high threat increases the likelihood of attack. The Mongols' high starting threat makes them a likely aggressor." />
          </Chapter>

          <Chapter id="strategia" num="XVIII" title={{ fi: 'Strategiavinkkejä', en: 'Strategy tips' }}>
            <Para n="18.1" fi="**Käytä alkupelin piristys:** vuoroilla 1–4 saat +4 kultaa/vuoro. Rakenna aikaisin markkinoita ja leirejä talouden ja rekrytoinnin pohjaksi."
              en="**Use the early-game boost:** on turns 1–4 you get +4 gold/turn. Build markets and camps early as the foundation for your economy and recruitment." />
            <Para n="18.2" fi="**Hallitse silkkitietä yhtenäisesti:** ketjubonus (§ 8.2) palkitsee vierekkäisistä kauppasolmuista epäsuhtaisen paljon — kokoa yhtenäinen jakso hajanaisten pysäkkien sijaan."
              en="**Hold the Silk Road in one unbroken stretch:** the chain bonus (§ 8.2) rewards adjacent trade nodes disproportionately — build one unbroken run instead of scattered stops." />
            <Para n="18.3" fi="**Suojele pääkaupunkia ja päällikköä:** menetetty pääkaupunki puolittaa tulon ja pysäyttää rekrytoinnin; päällikön kaatuminen maksaa 30 kultaa ja 15 vaikutusvaltaa."
              en="**Protect your capital and your Chief:** a lost capital halves income and halts recruitment; the death of the Chief costs 30 gold and 15 influence." />
            <Para n="18.4" fi="**Valitse voittotie ajoissa:** mongoleilla sotilastie on luontevin (ratsuväki +30 %), Songilla talous- ja kulttuuritie (verotus +30 %), Khwarezmilla laajentuminen ja Venäjällä puolustava kulutussota."
              en="**Choose your victory path early:** for the Mongols the military path is natural (cavalry +30%), for Song the economic and cultural path (taxation +30%), for Khwarezm expansion, and for the Rus a defensive war of attrition." />
            <Para n="18.5" fi="**Käytä maastoa:** puolusta vuoristossa ja kukkuloilla (+3/+2 puolustus), hyökkää ratsuväellä avomaastossa, missä liike on halpaa."
              en="**Use terrain:** defend in mountains and hills (+3/+2 defense), attack with cavalry in open terrain where movement is cheap." />
            <Para n="18.6" fi="**Piiritysyksiköt muureja vastaan:** linnoitettuja provinsseja vastaan tuo piiritysyksiköitä — ne heikentävät tehollista linnoitustasoa (§ 11.3)."
              en="**Siege units against walls:** bring siege units against fortified provinces — they weaken the effective fortification level (§ 11.3)." />
          </Chapter>

          <footer className="mt-14 pt-6 border-t border-amber-800/30 text-center text-sm text-slate-500">
            <p>{lang === 'fi' ? 'Arojen Tarinat — Story of the Steppe · Sääntökirja · vuosi 1206' : 'Tales of the Steppe — Story of the Steppe · Rulebook · year 1206'}</p>
            <div className="mt-3 flex justify-center gap-2">
              <button onClick={() => goTo('johdanto')} className="text-amber-300 hover:text-amber-100 text-sm">{lang === 'fi' ? '↑ Takaisin alkuun' : '↑ Back to top'}</button>
              <span className="text-slate-600">·</span>
              <Link to="/" className="text-amber-300 hover:text-amber-100 text-sm">{lang === 'fi' ? 'Palaa peliin' : 'Return to game'}</Link>
            </div>
          </footer>

        </main>
      </div>
    </div>
  );
};

export default Ohjekirja;

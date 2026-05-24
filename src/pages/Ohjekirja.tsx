import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent } from '@/components/ui/card.tsx';
import { BookOpen, ArrowLeft, Play } from 'lucide-react';

const sections = [
  { id: 'johdanto', label: 'Johdanto' },
  { id: 'tavoite', label: 'Pelin tavoite ja voittoehdot' },
  { id: 'fraktiot', label: 'Fraktiot' },
  { id: 'vuoron-rakenne', label: 'Vuoron rakenne' },
  { id: 'resurssit', label: 'Resurssit ja talous' },
  { id: 'armeijat', label: 'Armeijat ja liikkuminen' },
  { id: 'taistelu', label: 'Taistelujärjestelmä' },
  { id: 'rakentaminen', label: 'Rakentaminen' },
  { id: 'kortit', label: 'Korttijärjestelmä' },
  { id: 'diplomatia', label: 'Diplomatiajärjestelmä' },
  { id: 'kartta', label: 'Kartta ja maastot' },
  { id: 'kauppatavarat', label: 'Kauppatavarat' },
  { id: 'tekoaly', label: 'Tekoäly (AI)' },
  { id: 'strategia', label: 'Strategiavinkkejä' },
];

const Ohjekirja = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-4xl font-semibold text-amber-200">Mongolien Valtakunta — Ohjekirja</h1>
            <p className="mt-3 text-slate-400 max-w-3xl">
              Valloituksen aika — 1206 jKr. Strateginen vuoropohjainen peli, jossa johdat yhtä historian suurimmista imperiumeista tai puolustat omaa valtakuntaasi sen edessä.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <Link to="/" className="inline-flex items-center gap-2">
              <Button variant="secondary" size="sm">
                <ArrowLeft className="w-4 h-4" /> Palaa peliin
              </Button>
            </Link>
            <Button variant="secondary" size="sm" onClick={() => window.print()}>
              Tulosta ohjekirja
            </Button>
          </div>
        </div>

        <Card className="bg-slate-900/90 border border-amber-700/30 shadow-2xl">
          <CardContent className="space-y-6 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3 text-amber-200">
                <BookOpen className="w-6 h-6" />
                <div>
                  <h2 className="text-2xl font-semibold">Sisältö</h2>
                  <p className="text-sm text-slate-400">Verkkopelin ja lautapelin ohjeet löytyvät omista osioistaan.</p>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                <a href="#digipeli" className="rounded-2xl border border-amber-600/30 bg-slate-900/80 px-4 py-3 text-center text-sm text-amber-200 hover:bg-slate-800 transition-colors">Verkkopelin ohjeet</a>
                <a href="#lautapeli" className="rounded-2xl border border-amber-600/30 bg-slate-900/80 px-4 py-3 text-center text-sm text-amber-200 hover:bg-slate-800 transition-colors">Lautapelin ohjeet</a>
                <a href="#video" className="rounded-2xl border border-amber-600/30 bg-slate-900/80 px-4 py-3 text-center text-sm text-amber-200 hover:bg-slate-800 transition-colors">Yhden vuoron video</a>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_0.55fr]">
              <div className="rounded-3xl border border-slate-700/50 bg-slate-950/80 p-5">
                <h3 className="text-xl font-semibold text-amber-100">Sisällysluettelo</h3>
                <ol className="mt-4 space-y-3 text-sm text-slate-300">
                  {sections.map((section) => (
                    <li key={section.id}>
                      <a href={`#${section.id}`} className="text-amber-200 hover:text-amber-100 transition-colors">
                        {section.label}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="rounded-3xl border border-slate-700/50 bg-slate-950/80 p-5">
                <h3 className="text-xl font-semibold text-amber-100">Versio 1.0</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  Tämä verkkoversio sisältää koko ohjekirjan. Sivu on rakennettu siten, että tärkeimmät aiheet löytyvät nopeasti eri osioista.
                </p>
                <div className="mt-5 grid gap-3">
                  <div className="rounded-2xl border border-slate-700/40 bg-slate-900/80 p-4">
                    <p className="text-sm text-slate-400">Pelin tavoite ja voittoehdot</p>
                    <p className="mt-2 text-amber-100 font-semibold">Sotilaallinen, taloudellinen, teknologinen</p>
                  </div>
                  <div className="rounded-2xl border border-slate-700/40 bg-slate-900/80 p-4">
                    <p className="text-sm text-slate-400">Fraktiot</p>
                    <p className="mt-2 text-amber-100 font-semibold">Seitsemän historiallista valintaa</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 space-y-6">
          <section id="video" className="rounded-3xl border border-amber-700/30 bg-slate-900/90 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-amber-100">Yhden vuoron videokatsaus</h2>
                <p className="mt-2 text-sm text-slate-300">
                  Tiivis lisäosio näyttää yhden vuoron kulun selkeästi, vaiheittain. Tämä ei ole oikea video, mutta tarjoaa visualisoidun katsauksen vuoron etenemiseen.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-amber-600/30 bg-slate-950/80 px-4 py-3 text-sm text-amber-200">
                <Play className="w-4 h-4" /> Yhden vuoron läpikäynti
              </div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-3xl border border-slate-700/50 bg-slate-950/80 p-5">
                <ol className="space-y-4 text-sm text-slate-300">
                  <li>
                    <strong>1. Resurssit:</strong> Kerää verot, miesvoima, ruokaa, hevosia ja käsityöläisiä hallitsemistasi provinsseista.
                  </li>
                  <li>
                    <strong>2. Kortit:</strong> Nosta kortti ja käytä se oikeassa hetkessä. Kortit antavat esimerkiksi verotuloja, taistelubonuksia ja teknologiaa.
                  </li>
                  <li>
                    <strong>3. Liikkuminen:</strong> Siirrä armeijasi viereisiin provinssiin. Muista maaston kohina ja liikkumispisteiden määrä.
                  </li>
                  <li>
                    <strong>4. Taistelu:</strong> Hyökkää vihollista vastaan. Taistelut ratkaistaan automaattisesti, mutta taktiset valinnat vaikuttavat lopputulokseen.
                  </li>
                  <li>
                    <strong>5. Rakentaminen:</strong> Rakenna leirejä, markkinoita, linnoituksia ja pajoja. Ne kasvattavat tuotantoa ja puolustusta.
                  </li>
                  <li>
                    <strong>6. Vuoron lopetus:</strong> Vahvista asemat ja anna tekoälyn toimia. Seuraa tilannetta seuraavalla kierroksella.
                  </li>
                </ol>
              </div>
              <div className="rounded-3xl border border-slate-700/50 bg-slate-950/80 p-5">
                <div className="aspect-[16/9] overflow-hidden rounded-3xl bg-slate-900/90 shadow-inner">
                  <div className="relative h-full w-full bg-[radial-gradient(circle_at_top_left,_rgba(248,211,113,0.15),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.12),_transparent_30%)]">
                    <div className="absolute inset-0 flex flex-col justify-center items-center gap-3 p-4 text-slate-300">
                      <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/20 text-amber-300">
                        <Play className="w-6 h-6" />
                      </div>
                      <p className="text-center text-sm leading-relaxed">
                        Videokatsauksen paikka: tässä kuvataan yhden vuoron kulku pelissä.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="johdanto" className="rounded-3xl border border-slate-700/50 bg-slate-950/80 p-6">
            <h2 className="text-2xl font-semibold text-amber-100">1. Johdanto</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Mongolien Valtakunta on strateginen vuoropohjainen peli, jossa pelaaja asettuu yhden seitsemästä historiallisesta fraktiosta johtoon vuonna 1206 jKr. — samana vuonna, kun Tšingis-kaani yhdisti mongoliheimojen liittokunnan.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Peli sijoittuu laajalle alueelle Itä-Aasiasta Keski-Aasiaan ja Venäjälle. Kartta koostuu noin 70 provinssista, joista kukin on yksilöllinen maastonsa, resurssiensa ja strategisen sijaintinsa osalta.
            </p>
          </section>

          <section id="tavoite" className="rounded-3xl border border-slate-700/50 bg-slate-950/80 p-6">
            <h2 className="text-2xl font-semibold text-amber-100">2. Pelin tavoite ja voittoehdot</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Peli voidaan voittaa kolmella tavalla: sotilaallisella, taloudellisella ja teknologisella voitolla. Vastustajat voivat myös voittaa omia ehtojaan täyttäessään.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-700/40 bg-slate-950/90 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Sotilaallinen</p>
                <p className="mt-2 text-amber-100 font-semibold">30 provinssia</p>
                <p className="mt-1 text-sm text-slate-300">Hallitse vähintään 30 provinssia (~40% kartasta).</p>
              </div>
              <div className="rounded-2xl border border-slate-700/40 bg-slate-950/90 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Taloudellinen</p>
                <p className="mt-2 text-amber-100 font-semibold">500 kultaa</p>
                <p className="mt-1 text-sm text-slate-300">Kerää valtakuntaasi vähintään 500 kultaa.</p>
              </div>
              <div className="rounded-2xl border border-slate-700/40 bg-slate-950/90 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Teknologinen</p>
                <p className="mt-2 text-amber-100 font-semibold">5 teknologiakorttia</p>
                <p className="mt-1 text-sm text-slate-300">Pelaa 5 pysyvää teknologiakorttia.</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              Häviö saavutetaan, jos menetät kaikki armeijasi ja provinssisi. Myös tekoälyfraktiot voivat voittaa: jos jokin AI-fraktio hallitsee 30+ provinssia, se voittaa pelin.
            </p>
          </section>

          <section id="fraktiot" className="rounded-3xl border border-slate-700/50 bg-slate-950/80 p-6">
            <h2 className="text-2xl font-semibold text-amber-100">3. Fraktiot</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Valittavana on seitsemän fraktiota. Jokaisella on omat vahvuutensa, aloitusresurssinsa ja strategiset erityispiirteensä.
            </p>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {[
                { name: 'Mongolien valtakunta', leader: 'Tšingis-kaani', bonus: '+30% ratsuväki, +20% piiritys', resources: '50 kultaa, 80 miehiä, 100 hevosta', tip: 'Paras ensimmäiselle pelikerralle' },
                { name: 'Jin-dynastia', leader: 'Keisari Xuanzong', bonus: '+20% verot, vahvat linnoitukset', resources: '150 kultaa, 200 miehiä, 30 hevosta' },
                { name: 'Song-dynastia', leader: 'Keisari Ningzong', bonus: '+30% verot, -10% ratsuväki', resources: '200 kultaa, 150 miehiä, 20 hevosta' },
                { name: 'Länsi-Xia', leader: 'Keisari Xiangzong', bonus: '+10% ratsuväki, +10% verot', resources: '60 kultaa, 60 miehiä, 40 hevosta' },
                { name: 'Khwarezmin valtakunta', leader: 'Šaahi Muhammad II', bonus: '+10% ratsuväki/verot/piiritys', resources: '120 kultaa, 100 miehiä, 50 hevosta' },
                { name: 'Venäjän ruhtinaskunta', leader: 'Suuriruhtinas', bonus: '+10% verot/piiritys', resources: '80 kultaa, 80 miehiä, 25 hevosta' },
                { name: 'Kipnakit', leader: 'Kaani Köten', bonus: '+20% ratsuväki, -10% verot/piiritys', resources: '30 kultaa, 50 miehiä, 70 hevosta' },
              ].map((faction) => (
                <div key={faction.name} className="rounded-3xl border border-slate-700/40 bg-slate-950/90 p-5">
                  <h3 className="text-lg font-semibold text-amber-100">{faction.name}</h3>
                  <p className="text-sm text-slate-300">Johtaja: {faction.leader}</p>
                  <p className="mt-2 text-sm text-slate-300">Bonukset: {faction.bonus}</p>
                  <p className="mt-1 text-sm text-slate-300">Aloitusresurssit: {faction.resources}</p>
                  {faction.tip && <p className="mt-2 text-sm text-amber-200">Vinkki: {faction.tip}</p>}
                </div>
              ))}
            </div>
          </section>

          <section id="vuoron-rakenne" className="rounded-3xl border border-slate-700/50 bg-slate-950/80 p-6">
            <h2 className="text-2xl font-semibold text-amber-100">4. Vuoron rakenne</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Jokainen vuoro koostuu kuudesta vaiheesta, jotka suoritetaan järjestyksessä. Voit siirtyä vaiheiden välillä painamalla vaihepalkin seuraavaa vaihetta.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {[
                { step: 'Resurssit', desc: 'Kerää verot, miesvoima, ruoka, hevoset ja käsityöläiset hallitsemistasi provinsseista.' },
                { step: 'Kortit', desc: 'Nosta yksi kortti pakasta. Pelaa kortteja saadaksesi hetkellisiä tai pysyviä bonuksia.' },
                { step: 'Liikkuminen', desc: 'Siirrä armeijojasi naapuriprovinsseihin. Maasto vaikuttaa liikkumiskustannukseen.' },
                { step: 'Taistelu', desc: 'Taistelut ratkaistaan automaattisesti kun armeijasi liikkuu vihollisen alueelle.' },
                { step: 'Rakentaminen', desc: 'Rakenna rakennuksia hallitsemiisi provinsseihin. Vaatii kultaa ja käsityöläisiä.' },
                { step: 'Vuoron lopetus', desc: 'Lopeta vuorosi. AI-fraktiot toimivat, liikkumispisteet palautuvat, vuosi etenee.' },
              ].map((item) => (
                <div key={item.step} className="rounded-3xl border border-slate-700/40 bg-slate-950/90 p-4">
                  <p className="text-sm uppercase tracking-[0.12em] text-slate-400">{item.step}</p>
                  <p className="mt-2 text-sm text-slate-300">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="resurssit" className="rounded-3xl border border-slate-700/50 bg-slate-950/80 p-6">
            <h2 className="text-2xl font-semibold text-amber-100">5. Resurssit ja talous</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Pelissä on viisi pääresurssia: kulta, miesvoima, ruoka, hevoset ja käsityöläiset. Ne ovat välttämättömiä armeijan ylläpitoon, rakentamiseen ja laajentumiseen.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[
                { title: 'Kulta', desc: 'Yleisin resurssi. Käytetään rakentamiseen ja armeijan rekrytointiin. Provinssien verot ja markkinat tuottavat kultaa.' },
                { title: 'Miesvoima', desc: 'Tarvitaan armeijan rekrytointiin. Tuotanto perustuu provinssien väestöön ja leireihin.' },
                { title: 'Ruoka', desc: 'Armeijan ylläpito. Jokainen armeija kuluttaa ruokaa vuorolla. Viljelyalueet ja leirit kasvattavat tuotantoa.' },
                { title: 'Hevoset', desc: 'Tarvitaan ratsuväen rekrytointiin. Steppiprovinssit ja hevoskauppaprovinssit tuottavat yleensä enemmän.' },
                { title: 'Käsityöläiset', desc: 'Tarvitaan rakennuksiin. Pajat ja tietyt provinsseilla toimivat resurssit lisäävät käsityöläisten määrää.' },
              ].map((item) => (
                <div key={item.title} className="rounded-3xl border border-slate-700/40 bg-slate-950/90 p-4">
                  <h3 className="text-base font-semibold text-amber-100">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-amber-200">Vinkki: Rakenna pajoja aikaisin — ilman käsityöläisiä et voi rakentaa linnoituksia puolustukseen.</p>
          </section>

          <section id="armeijat" className="rounded-3xl border border-slate-700/50 bg-slate-950/80 p-6">
            <h2 className="text-2xl font-semibold text-amber-100">6. Armeijat ja liikkuminen</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Armeijan rekrytointi vaatii kultaa, miesvoimaa ja ruokaa. Uusia joukkoja ei voi siirtää rekrytointivuorollaan.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-700/40 bg-slate-950/90 p-4">
                <h3 className="text-base font-semibold text-amber-100">Rekrytointi</h3>
                <p className="mt-2 text-sm text-slate-300">Uusi armeija tarvitsee noin 20 kultaa, 5 miesvoimaa ja 2 ruokaa. Protoyyppi sisältää ratsuväkeä, jalkaväkeä ja moraalia.</p>
              </div>
              <div className="rounded-3xl border border-slate-700/40 bg-slate-950/90 p-4">
                <h3 className="text-base font-semibold text-amber-100">Liikkuminen</h3>
                <p className="mt-2 text-sm text-slate-300">Jokaisella armeijalla on 3 liikkumispistettä vuorolla. Maasto vaikuttaa kustannukseen: steppi ja ruohomaa maksavat 1, vuoristo ja suo 3.</p>
              </div>
            </div>
          </section>

          <section id="taistelu" className="rounded-3xl border border-slate-700/50 bg-slate-950/80 p-6">
            <h2 className="text-2xl font-semibold text-amber-100">7. Taistelujärjestelmä</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Taistelu käynnistyy automaattisesti, kun armeijasi liikkuu vihollisen alueelle tai linnoitettuun provinssiin.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-700/40 bg-slate-950/90 p-4">
                <h3 className="text-base font-semibold text-amber-100">Laskenta</h3>
                <p className="mt-2 text-sm text-slate-300">Hyökkääjän voima perustuu ratsuväkeen, jalkaväkeen, moraaliin ja mahdollisiin piirityslaitteisiin. Puolustajalla linnoitukset ja maasto tuovat lisäbonuksia.</p>
              </div>
              <div className="rounded-3xl border border-slate-700/40 bg-slate-950/90 p-4">
                <h3 className="text-base font-semibold text-amber-100">Tuloksen kriteerit</h3>
                <p className="mt-2 text-sm text-slate-300">Molemmat osapuolet heittävät noppaa. Suhdeluvun mukaan määrätään voittaja ja tappiot.</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-amber-200">Vinkki: Linnoitetut kaupungit ovat vaikeita valloittaa — tarvitset vahvan armeijan murtamaan ne.</p>
          </section>

          <section id="rakentaminen" className="rounded-3xl border border-slate-700/50 bg-slate-950/80 p-6">
            <h2 className="text-2xl font-semibold text-amber-100">8. Rakentaminen</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Rakentaminen tapahtuu rakennusvaiheessa. Jokainen rakennus voidaan rakentaa vain kerran per provinssi.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {[
                { title: 'Leiri', cost: '15 kultaa', labor: '0', effect: '+2 ruokaa/vuoro, mahdollistaa armeijan rekrytoinnin' },
                { title: 'Markkina', cost: '25 kultaa', labor: '1 käsityöläinen', effect: '+3 kultaa/vuoro' },
                { title: 'Linnoitus', cost: '50 kultaa', labor: '2 käsityöläistä', effect: '+3 puolustus, garnisooni, linnoitustaso +1 (max 3)' },
                { title: 'Paja', cost: '30 kultaa', labor: '1 käsityöläinen', effect: '+1 käsityöläinen/vuoro' },
                { title: 'Hevostalli', cost: '40 kultaa', labor: '1 käsityöläinen', effect: '+1 hevonen/vuoro' },
              ].map((building) => (
                <div key={building.title} className="rounded-3xl border border-slate-700/40 bg-slate-950/90 p-4">
                  <h3 className="text-base font-semibold text-amber-100">{building.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">Hinta: {building.cost}, {building.labor}</p>
                  <p className="mt-1 text-sm text-slate-300">Vaikutus: {building.effect}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-amber-200">Vinkki: Rakenna ensin paja, sitten markkinat — näin saat sekä käsityöläisiä että kultaa kasvavalla tahdilla.</p>
          </section>

          <section id="kortit" className="rounded-3xl border border-slate-700/50 bg-slate-950/80 p-6">
            <h2 className="text-2xl font-semibold text-amber-100">9. Korttijärjestelmä</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Peli sisältää korttipakan, josta nostat yhden kortin korttivaiheessa. Kortteja voi pelata käyttäen käsiäsi saadakseen erilaisia etuja.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[
                { title: 'Strategia', desc: 'Taistelubonuksia: hyökkäys, puolustus, liikkuminen. Hetkellinen vaikutus.' },
                { title: 'Diplomatia', desc: 'Kultaa, puolustusta ja diplomaattisia etuja. Voivat kestää 1–3 vuoroa.' },
                { title: 'Teknologia', desc: 'Pysyviä bonuksia hyökkäykseen, puolustukseen tai liikkeeseen.' },
                { title: 'Resurssit', desc: 'Välittömiä resursseja kuten hevosia, kultaa, ruokaa tai käsityöläisiä.' },
              ].map((card) => (
                <div key={card.title} className="rounded-3xl border border-slate-700/40 bg-slate-950/90 p-4">
                  <h3 className="text-base font-semibold text-amber-100">{card.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{card.desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-slate-300">Kun pakka loppuu, poistopakan kortit sekoitetaan uudeksi pakaksi.</p>
          </section>

          <section id="diplomatia" className="rounded-3xl border border-slate-700/50 bg-slate-950/80 p-6">
            <h2 className="text-2xl font-semibold text-amber-100">10. Diplomatiajärjestelmä</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Voit tehdä sopimuksia muiden fraktioiden kanssa. Hyväksyminen riippuu suhteesta, luottamuksesta ja fraktion tavoitteista.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {[
                { title: 'Hyökkäämättömyys', desc: 'Estää hyökkäykset fraktioiden välillä.' },
                { title: 'Kauppasopimus', desc: 'Lisää molempien kauppatuloja.' },
                { title: 'Liittosopimus', desc: 'Vahva yhteistyö ja mahdollinen yhteinen puolustus.' },
                { title: 'Aselepo', desc: 'Väliaikainen rauhan tila.' },
                { title: 'Vasallisuus', desc: 'Heikompi fraktio maksaa veroja vahvemmalle.' },
                { title: 'Rauha', desc: 'Muodollinen rauhansopimus.' },
                { title: 'Yllättävä sota', desc: 'Sota alkaa heti ja kaikki muut fraktiot julistavat sinulle sodan.' },
                { title: 'Formaalinen sota', desc: 'Sota ilmoitetaan, mutta alkaa vasta seuraavan vuoron lopussa.' },
              ].map((item) => (
                <div key={item.title} className="rounded-3xl border border-slate-700/40 bg-slate-950/90 p-4">
                  <h3 className="text-base font-semibold text-amber-100">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-amber-200">Vinkki: Älä riko sopimuksia kevyesti — luottamus palautuu hitaasti.</p>
          </section>

          <section id="faq" className="rounded-3xl border border-slate-700/50 bg-slate-950/80 p-6">
            <h2 className="text-2xl font-semibold text-amber-100">11. Usein kysytyt kysymykset</h2>
            <div className="mt-4 space-y-4 text-sm text-slate-300">
              <div>
                <h3 className="text-base font-semibold text-amber-100">Paljonko ruokaa antaa leiri?</h3>
                <p className="mt-2">Leiri antaa +2 ruokaa per vuoro omassa provinssissaan. Se myös mahdollistaa armeijan rekrytoinnin kyseisestä provinssista, jos omistat sen.</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-amber-100">Onko pelissä maatilarakennusta?</h3>
                <p className="mt-2">Käytössä ei ole erillistä maatilarakennusta. Viljelymaaprovinsseilla on parempi tukituotanto ja leirit lisäävät ruokaa.</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-amber-100">Paljonko ruokaa kuluu hevosesta tai sotilaasta?</h3>
                <p className="mt-2">Rekrytointi kuluttaa heti 2 ruokaa. Jokainen armeija kuluttaa yhden ruoan per vuoro kaupungin ruokatuotannon vähentyessä sen mukaan, kuinka monta armeijaa omistat.</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-amber-100">Mistä hevoset tulevat ja kuinka paljon ne tuottavat?</h3>
                <p className="mt-2">Hevosia saa steppe- ja hevoskauppatavara-provinssien kautta sekä hevos­tallista. Hevoset eivät suoraan anna kultaa, mutta ne mahdollistavat ratsuväen rekrytoinnin.</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-amber-100">Miten yksiköt toimivat — onko yksi sotilas yksi armeija?</h3>
                <p className="mt-2">Pelissä armeija on joukko, joka voi sisältää useita ratsuväen ja jalkaväen yksiköitä. Yksittäistä sotilasta ei pelata erillisenä kappaleena, vaan armeijoiden vahvuus lasketaan näiden joukkojen summana.</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-amber-100">Monta korttia voi käyttää ja milloin?</h3>
                <p className="mt-2">Aloitat viidellä kortilla ja saat kortin lisäyksen korttivaiheessa. Kortteja voi pelata silloin kun ne ovat kädessäsi, eli käytännössä useita per vuoro, kunnes kätesi loppuu. Kortteja ei voi pelata vuoron lopetusvaiheessa.</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-amber-100">Vaikuttaako maasto, kun tulen tai lähden kaupungista?</h3>
                <p className="mt-2">Kyllä, maasto vaikuttaa sekä liikkeeseen että puolustukseen. Liikkuminen kohdeprovinssiin käyttää sen liikkumiskustannuksen, ja puolustus bonukset lasketaan, kun omaisuus puolustaa kyseisessä maastossa.</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-amber-100">Voiko paimentolais- tai neutraalissa kaupungissa olla rakennuksia?</h3>
                <p className="mt-2">Rakennuksia voi rakentaa vain omissa provinssissasi. Neutraalit tai nomadit-provinssit eivät rakenna automaattisesti, eikä niissä voi lisätä omia rakennuksia ennen niiden valtaamista.</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-amber-100">Mitä maasto tekee pelissä?</h3>
                <p className="mt-2">Maasto määrittää liikkumiskustannuksen ja puolustusbonuksen. Esimerkiksi metsä ja kukkulat antavat puolustusbonusta ja nostavat liikkumiskustannusta. Vuoristo on hitainta liikkumista ja antaa parhaan puolustusbonuksen. Joen yli hyökkääminen ei ole erikseen simuloitu tässä versiossa.</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-amber-100">Monta kultaa saa per vuoro?</h3>
                <p className="mt-2">Kultaa kertyy verotuloista, markkinoista ja kauppatavaroista. Markkina antaa +3 kultaa per vuoro, Silkkitie kaksinkertaistaa verotulot niissä provinsseissa ja kauppatavaroilla voi olla lisätuotot.</p>
              </div>
            </div>
          </section>

          <section id="kartta" className="rounded-3xl border border-slate-700/50 bg-slate-950/80 p-6">
            <h2 className="text-2xl font-semibold text-amber-100">12. Kartta ja maastot</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Kartta koostuu noin 70 provinssista. Liikkuminen tapahtuu naapuriprovinsseihin, ja maasto vaikuttaa sekä liikkeeseen että puolustukseen.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[
                { terrain: 'Steppi / Ruohomaa / Viljelymaa', move: '1', defense: '0', supply: '5–8', tax: '×1.0' },
                { terrain: 'Metsä / Taiga / Aavikko / Kukkulat', move: '2', defense: '1–2', supply: '2–4', tax: '×0.9–0.8' },
                { terrain: 'Vuoristo / Suo', move: '3', defense: '3 / 1', supply: '1–2', tax: '×0.5–0.4' },
              ].map((item) => (
                <div key={item.terrain} className="rounded-3xl border border-slate-700/40 bg-slate-950/90 p-4">
                  <h3 className="text-base font-semibold text-amber-100">{item.terrain}</h3>
                  <p className="mt-2 text-sm text-slate-300">Liike: {item.move}, Puolustus: {item.defense}, Tarjonta: {item.supply}, Verokerroin: {item.tax}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-slate-200">Silkkitie kulkee kartan läpi ja tarjoaa erityisiä kauppatuloja niille provinsseille, joissa se kulkee.</p>
          </section>

          <section id="kauppatavarat" className="rounded-3xl border border-slate-700/50 bg-slate-950/80 p-6">
            <h2 className="text-2xl font-semibold text-amber-100">13. Kauppatavarat</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Monet provinsseista tuottavat erityisiä kauppatavaroita, jotka tarjoavat lisäetuja talouteen ja diplomatiaan.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {[
                { name: 'Hevoset', value: '3', effect: '+2 ratsuväen rekrytointi' },
                { name: 'Silkki', value: '5', effect: '+50% kauppaverot' },
                { name: 'Mausteet', value: '4', effect: '+25% kauppaverot' },
                { name: 'Kulta', value: '6', effect: '+3 kultaa/vuoro' },
                { name: 'Rauta', value: '3', effect: '-20% yksiköiden kustannus' },
                { name: 'Turkikset', value: '4', effect: '+30% diplomaattinen arvo' },
                { name: 'Vilja', value: '2', effect: '+2 miesvoimaa' },
                { name: 'Suola', value: '3', effect: '+1 tarjonta' },
                { name: 'Karja', value: '2', effect: '+1 miesvoima, +1 tarjonta' },
                { name: 'Jalokivet', value: '5', effect: '+2 diplomaattinen arvo' },
              ].map((item) => (
                <div key={item.name} className="rounded-3xl border border-slate-700/40 bg-slate-950/90 p-4">
                  <h3 className="text-base font-semibold text-amber-100">{item.name}</h3>
                  <p className="mt-2 text-sm text-slate-300">Arvo: {item.value}</p>
                  <p className="mt-1 text-sm text-slate-300">Vaikutus: {item.effect}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="tekoaly" className="rounded-3xl border border-slate-700/50 bg-slate-950/80 p-6">
            <h2 className="text-2xl font-semibold text-amber-100">14. Tekoäly (AI)</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              AI-vastustajat toimivat vuoron lopussa automaattisesti. Ne keräävät resursseja, arvioivat uhkia ja tekevät siirtoja oman strategiansa mukaisesti.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {[
                { title: 'Aggressiivinen', desc: 'Hyökkäilee usein ja etsii heikkoja kohteita.' },
                { title: 'Puolustava', desc: 'Rakentaa linnoituksia ja suojelee rajaprovinsseja.' },
                { title: 'Kauppias', desc: 'Panostaa talouteen ja välttää turhia sotiakin.' },
                { title: 'Laajentava', desc: 'Etsii uusia alueita ja pyrkii kasvuun.' },
                { title: 'Varovainen', desc: 'Hyökkää vain, jos ylivoima on selvästi omalla puolella.' },
              ].map((item) => (
                <div key={item.title} className="rounded-3xl border border-slate-700/40 bg-slate-950/90 p-4">
                  <h3 className="text-base font-semibold text-amber-100">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-300">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="strategia" className="rounded-3xl border border-slate-700/50 bg-slate-950/80 p-6">
            <h2 className="text-2xl font-semibold text-amber-100">14. Strategiavinkkejä</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-slate-700/40 bg-slate-950/90 p-4">
                <h3 className="text-base font-semibold text-amber-100">Aloittelijan vinkit</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
                  <li>Kerää ensin resursseja rakentamalla leirejä ja markkinoita lähiprovinsseihin.</li>
                  <li>Älä yritä valloittaa liian montaa rintamaa yhtä aikaa — keskitä voimasi.</li>
                  <li>Rakenna paja aikaisin saadaksesi käsityöläisiä tuleviin rakennusprojekteihin.</li>
                  <li>Pidä huoli ruokahuollosta — armeijat ilman ruokaa heikentyvät.</li>
                  <li>Käytä diplomatiakortteja kultaresurssien keräämiseen alkupelissä.</li>
                </ul>
              </div>
              <div className="rounded-3xl border border-slate-700/40 bg-slate-950/90 p-4">
                <h3 className="text-base font-semibold text-amber-100">Edistyneet strategiat</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-300">
                  <li>Linnoita pääkaupunkisi ja tärkeimmät rajaprovinssit ennen laajentumista.</li>
                  <li>Valloita provinsseja, joissa on arvokkaita kauppatavaroita kuten silkki ja kulta.</li>
                  <li>Teknologiakortit antavat pysyviä bonuksia ja laskevat voittoehtoon — pelaa ne mahdollisimman aikaisin.</li>
                  <li>Hyödynnä steppimaastoa nopeaan liikkumiseen — ratsuarmeija voi yllättää vihollisen.</li>
                  <li>Tarkkaile AI-fraktioiden laajenemista — älä anna kenenkään kasvaa liian suureksi.</li>
                </ul>
              </div>
            </div>
            <p className="mt-4 text-sm text-amber-200">Hyvää peliä ja onnea valloituksen tiellä!</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Ohjekirja;

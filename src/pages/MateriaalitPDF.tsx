/**
 * MateriaalitPDF.tsx — Sääntökirja + pelilauta PDF-tulostussivu
 *
 * Tulostettava A4-kokoinen sääntökirja (10 osiota) ja pelilautakuva.
 * Sisältää korttien referenssitaulukot ja peliohjeet.
 */
import { useEffect } from "react";
import gameBoardImage from "@/assets/game-board-map.png";
import {
  strategyCards,
  diplomacyCards,
  technologyCards,
  resourceCards,
  allCards,
  GameCard,
} from "@/data/gameCards";

const rarityDot: Record<string, string> = {
  common: 'bg-gray-500',
  uncommon: 'bg-green-500',
  rare: 'bg-blue-500',
  legendary: 'bg-purple-500',
};

const CardReferenceSection = ({ title, subtitle, cards }: {
  title: string;
  subtitle: string;
  cards: GameCard[];
}) => (
  <div className="mb-6 break-inside-avoid-page">
    <h3 className="font-bold text-amber-800 mb-1 text-sm">{title} ({cards.length} kpl)</h3>
    <p className="text-xs text-gray-600 mb-2 italic">{subtitle}</p>
    <table className="w-full border-collapse text-xs mb-2">
      <thead>
        <tr className="bg-gray-100">
          <th className="border p-1 text-left w-12">ID</th>
          <th className="border p-1 text-left">Nimi</th>
          <th className="border p-1 text-left">Kuvaus</th>
          <th className="border p-1 text-left">Vaikutus</th>
          {cards.some(c => c.cost) && <th className="border p-1 text-left w-28">Hinta</th>}
          <th className="border p-1 text-center w-10">⭐</th>
        </tr>
      </thead>
      <tbody>
        {cards.map((card) => (
          <tr key={card.id}>
            <td className="border p-1 font-mono text-gray-500">{card.id}</td>
            <td className="border p-1 font-bold">{card.name}</td>
            <td className="border p-1 text-gray-700">{card.description}</td>
            <td className="border p-1">{card.effect}</td>
            {cards.some(c => c.cost) && <td className="border p-1 text-gray-600">{card.cost || '—'}</td>}
            <td className="border p-1 text-center">
              <span className={`inline-block w-2 h-2 rounded-full ${rarityDot[card.rarity || 'common']}`}></span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const MateriaalitPDF = () => {
  useEffect(() => {
    document.title = "Mongolien Valtakunta — Sääntökirja & Pelilauta (PDF)";
  }, []);

  return (
    <div className="bg-white min-h-screen text-black">
      {/* Print controls */}
      <div className="print:hidden sticky top-0 z-50 bg-amber-800 text-white p-4 flex items-center justify-between shadow-lg">
        <div>
          <h1 className="font-bold text-lg">Mongolien Valtakunta — Sääntökirja & Pelilauta</h1>
          <p className="text-amber-200 text-sm">Tulostettava PDF — sääntökirja + pelilauta</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="bg-white text-amber-900 font-bold px-6 py-2 rounded-lg hover:bg-amber-100 transition-colors"
          >
            🖨️ Tulosta / Tallenna PDF
          </button>
          <button
            onClick={() => window.history.back()}
            className="border border-amber-400 text-amber-200 px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors"
          >
            ← Takaisin
          </button>
        </div>
      </div>

      {/* ===== KANSILEHTI ===== */}
      <div className="w-[210mm] min-h-[297mm] mx-auto p-8 flex flex-col items-center justify-center break-after-page">
        <div className="text-center">
          <div className="text-8xl mb-6">🏇</div>
          <h1 className="text-4xl font-bold text-amber-800 mb-2" style={{ fontFamily: 'Cinzel, serif' }}>
            MONGOLIEN VALTAKUNTA
          </h1>
          <p className="text-xl text-amber-600 mb-2">Strategialautapeli 2–4 pelaajalle</p>
          <div className="flex justify-center gap-8 text-sm text-gray-600 mb-8">
            <span>⏱️ 3–5 tuntia</span>
            <span>👥 2–4 pelaajaa</span>
            <span>🎯 12+ vuotta</span>
          </div>
          <p className="text-gray-500 text-sm italic">Pelisuunnitteludokumentti v1.0 — Sääntökirja & Pelilauta</p>
        </div>
      </div>

      {/* ===== PELILAUTA ===== */}
      <div className="w-[210mm] min-h-[297mm] mx-auto p-4 flex flex-col items-center justify-center break-after-page">
        <h2 className="text-2xl font-bold text-amber-800 mb-2 text-center" style={{ fontFamily: 'Cinzel, serif' }}>
          PELILAUTA
        </h2>
        <p className="text-sm text-gray-500 mb-4 text-center">Tulosta A3-kokoiselle paperille vaakasuuntaan parhaan tuloksen saamiseksi</p>
        <img
          src={gameBoardImage}
          alt="Mongolien Valtakunta - pelilauta"
          className="w-full h-auto max-h-[250mm] object-contain"
          crossOrigin="anonymous"
        />
        <p className="text-xs text-center text-gray-400 mt-2">Mongolien Valtakunta — Pelilauta 60×80 cm</p>
      </div>

      {/* ===== SÄÄNTÖKIRJA ===== */}
      <div className="w-[210mm] mx-auto bg-white p-8">

        {/* Sisällysluettelo */}
        <div className="mb-8 break-after-page">
          <h2 className="text-2xl font-bold text-amber-800 mb-4" style={{ fontFamily: 'Cinzel, serif' }}>Sisällysluettelo</h2>
          <ol className="space-y-2 text-sm">
            {[
              'Pelin tavoite', 'Pelin valmistelu', 'Heimot ja niiden erikoiskyvyt',
              'Vuoron kulku', 'Taistelujärjestelmä', 'Resurssit ja kaupankäynti',
              'Diplomatiajärjestelmä', 'Voittoehdot', 'Korttien selitykset', 'Pikaohje'
            ].map((title, i) => (
              <li key={i} className="flex justify-between border-b border-dotted border-gray-300 pb-1">
                <span>{i + 1}. {title}</span><span>{i + 2}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* 1. Pelin tavoite */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-amber-800 mb-3 flex items-center gap-2">
            <span className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm">1</span>
            Pelin tavoite
          </h2>
          <p className="text-sm leading-relaxed mb-3">
            <strong>Mongolien Valtakunta</strong> sijoittuu 1200-luvun Aasiaan, aikakauteen jolloin Genghis Khan 
            ja hänen seuraajansa rakensivat historian suurimman maavallan. Pelaajat johtavat yhtä neljästä 
            suurvallasta kamppaillessaan Aasian herruudesta.
          </p>
          <p className="text-sm leading-relaxed">Voita peli saavuttamalla <strong>yksi neljästä voittotavasta</strong>:</p>
          <ul className="text-sm mt-2 space-y-1 ml-4">
            <li>🏆 <strong>Sotilaallinen voitto:</strong> Hallitse 60% kaupungeista</li>
            <li>💰 <strong>Ekonominen voitto:</strong> Kerää 50 voittopistettä kaupasta</li>
            <li>🎭 <strong>Kulttuurinen voitto:</strong> Rakenna 8 kulttuurirakennusta + diplomatia kaikkien kanssa</li>
            <li>⚙️ <strong>Teknologinen voitto:</strong> Kehitä 12 teknologiakorttia</li>
          </ul>
        </section>

        {/* 2. Pelin valmistelu */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-amber-800 mb-3 flex items-center gap-2">
            <span className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm">2</span>
            Pelin valmistelu
          </h2>
          <ol className="text-sm space-y-2 ml-4 list-decimal">
            <li>Levitä pelilauta pöydälle</li>
            <li>Jokainen pelaaja valitsee heimon ja ottaa sen yksiköt</li>
            <li>Sekoita korttipakat erikseen (strategia, diplomatia, teknologia, resurssi)</li>
            <li>Jaa jokaiselle pelaajalle:
              <ul className="ml-4 mt-1">
                <li>• 5 satunnaista resurssikorttia</li>
                <li>• 2 strategiakorttia</li>
              </ul>
            </li>
            <li>Aseta yksiköt heimon aloitusalueille (ks. heimojen kuvaukset)</li>
            <li>Määritä ensimmäinen pelaaja arpomalla</li>
          </ol>
        </section>

        {/* 3. Heimot */}
        <section className="mb-8 break-before-page">
          <h2 className="text-xl font-bold text-amber-800 mb-3 flex items-center gap-2">
            <span className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm">3</span>
            Heimot ja niiden erikoiskyvyt
          </h2>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="border-2 border-amber-500 rounded p-3">
              <h3 className="font-bold text-amber-700 mb-2">🟡 MONGOLI-HEIMO</h3>
              <p className="mb-2">Nopeat ratsuväkitaktiikat</p>
              <ul className="space-y-1">
                <li>✓ Ratsuväki liikkuu +1</li>
                <li>✓ +1 hyökkäys avoimessa maastossa</li>
                <li>✓ Vetäytyminen ilman rangaistusta</li>
                <li>✗ -1 puolustus linnoituksissa</li>
              </ul>
              <p className="mt-2 italic">Erikoiskyky: Khuriltai-kokous</p>
            </div>
            <div className="border-2 border-red-500 rounded p-3">
              <h3 className="font-bold text-red-700 mb-2">🔴 KIINAN DYNASTIA</h3>
              <p className="mb-2">Puolustus ja teknologia</p>
              <ul className="space-y-1">
                <li>✓ +2 puolustus linnoituksissa</li>
                <li>✓ Aloittaa teknologiakortilla</li>
                <li>✓ Kaupungit +1 kulta</li>
                <li>✗ Ratsuväki -1 liike</li>
              </ul>
              <p className="mt-2 italic">Erikoiskyky: Ruutikeksintö</p>
            </div>
            <div className="border-2 border-cyan-500 rounded p-3">
              <h3 className="font-bold text-cyan-700 mb-2">🔵 PERSIALAINEN VALTAKUNTA</h3>
              <p className="mb-2">Kauppa ja diplomatia</p>
              <ul className="space-y-1">
                <li>✓ Kauppasopimusten arvo x2</li>
                <li>✓ +1 diplomatiakortti alussa</li>
                <li>✓ 2 liittosopimusta yhtä aikaa</li>
                <li>✗ -1 jalkaväkiyksikkö alussa</li>
              </ul>
              <p className="mt-2 italic">Erikoiskyky: Silkkitien Monopoli</p>
            </div>
            <div className="border-2 border-green-500 rounded p-3">
              <h3 className="font-bold text-green-700 mb-2">🟢 VENÄLÄISET RUHTINAAT</h3>
              <p className="mb-2">Talvi ja sitkeys</p>
              <ul className="space-y-1">
                <li>✓ Talvella +2 puolustus</li>
                <li>✓ Metsäalueilla +1 hyökkäys/puolustus</li>
                <li>✓ Halvempi jalkaväki</li>
                <li>✗ -1 ratsuväen liike kesällä</li>
              </ul>
              <p className="mt-2 italic">Erikoiskyky: Poltetun Maan Taktiikka</p>
            </div>
          </div>
        </section>

        {/* 4. Vuoron kulku */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-amber-800 mb-3 flex items-center gap-2">
            <span className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm">4</span>
            Vuoron kulku
          </h2>
          <p className="text-sm mb-3">Jokainen vuoro koostuu neljästä vaiheesta:</p>
          <div className="space-y-3 text-sm">
            <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
              <h3 className="font-bold text-blue-800">1. SUUNNITTELUVAIHE (Kurultai)</h3>
              <ul className="mt-1 ml-4">
                <li>• Vedä 1 kortti valitsemastasi pakasta</li>
                <li>• Valitse käytettävät taktiikkakortit tälle vuorolle</li>
                <li>• Määritä vuoron painopiste: Valloitus, Kauppa tai Diplomatia</li>
              </ul>
            </div>
            <div className="bg-red-50 p-3 rounded border-l-4 border-red-500">
              <h3 className="font-bold text-red-800">2. TOIMINTAVAIHE</h3>
              <ul className="mt-1 ml-4">
                <li>• <strong>Liikkuminen:</strong> Ratsuväki 3 aluetta, jalkaväki 2 aluetta</li>
                <li>• <strong>Hyökkääminen:</strong> Aloita taistelut vihollisalueilla</li>
                <li>• <strong>Rakentaminen:</strong> Linnoitukset ja kauppareitit</li>
                <li>• <strong>Kaupankäynti:</strong> Vaihda resursseja pelaajien kanssa</li>
              </ul>
            </div>
            <div className="bg-green-50 p-3 rounded border-l-4 border-green-500">
              <h3 className="font-bold text-green-800">3. HALLINTOVAIHE</h3>
              <ul className="mt-1 ml-4">
                <li>• Kerää resurssit hallitsemistasi alueista</li>
                <li>• Maksa armeijan ylläpitokustannukset (1 ruoka / 3 yksikköä)</li>
                <li>• Toteuta diplomaattisten sopimusten vaikutukset</li>
              </ul>
            </div>
            <div className="bg-purple-50 p-3 rounded border-l-4 border-purple-500">
              <h3 className="font-bold text-purple-800">4. TAPAHTUMAVAIHE</h3>
              <ul className="mt-1 ml-4">
                <li>• Vedä satunnainen tapahtumakortti strategiapakasta</li>
                <li>• Sovella sen vaikutukset kaikkiin pelaajiin</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 5. Taistelujärjestelmä */}
        <section className="mb-8 break-before-page">
          <h2 className="text-xl font-bold text-amber-800 mb-3 flex items-center gap-2">
            <span className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm">5</span>
            Taistelujärjestelmä
          </h2>
          <div className="text-sm space-y-4">
            <div>
              <h3 className="font-bold mb-2">Taistelun vaiheet:</h3>
              <ol className="ml-4 list-decimal space-y-1">
                <li>Laske molempien osapuolten <strong>taisteluvoima</strong> (yksiköiden määrä + modifikaattorit)</li>
                <li>Lisää <strong>maastomodifikaattorit</strong> (vuoristo +2 puolustajalle, steppi +1 ratsuväelle)</li>
                <li>Heitä noppaa: 1 noppa per taisteluvoima (max 6 noppaa)</li>
                <li>Osumat: 4+ on osuma (5+ jos linnoitusta vastaan)</li>
                <li>Jokainen osuma poistaa yhden vihollisyksikön</li>
                <li>Vähemmän yksiköitä jäljellä oleva häviää ja vetäytyy</li>
              </ol>
            </div>
            <div className="bg-gray-100 p-3 rounded">
              <h3 className="font-bold mb-2">Taistelumodifikaattorit:</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-green-700">✓ Avoin maasto (ratsuväki): +2</p>
                  <p className="text-green-700">✓ Linnoitus (puolustaja): +3</p>
                  <p className="text-green-700">✓ Ylivoima 2:1: +1</p>
                  <p className="text-green-700">✓ Heimopäällikkö läsnä: +1</p>
                </div>
                <div>
                  <p className="text-red-700">✗ Vuoristohyökkäys: -2</p>
                  <p className="text-red-700">✗ Talvihyökkäys: -1</p>
                  <p className="text-red-700">✗ Huoltoreitti katkaistu: -1</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Resurssit */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-amber-800 mb-3 flex items-center gap-2">
            <span className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm">6</span>
            Resurssit ja kaupankäynti
          </h2>
          <div className="grid grid-cols-5 gap-2 text-xs mb-4">
            <div className="text-center p-2 bg-amber-100 rounded">
              <p className="text-2xl">🐎</p><p className="font-bold">Hevoset</p><p className="text-gray-600">Ratsuväen rekrytointi</p>
            </div>
            <div className="text-center p-2 bg-yellow-100 rounded">
              <p className="text-2xl">🪙</p><p className="font-bold">Kulta</p><p className="text-gray-600">Kaupankäynti</p>
            </div>
            <div className="text-center p-2 bg-green-100 rounded">
              <p className="text-2xl">🌾</p><p className="font-bold">Ruoka</p><p className="text-gray-600">Armeijan ylläpito</p>
            </div>
            <div className="text-center p-2 bg-gray-100 rounded">
              <p className="text-2xl">🛠️</p><p className="font-bold">Käsityöl.</p><p className="text-gray-600">Teknologia</p>
            </div>
            <div className="text-center p-2 bg-orange-100 rounded">
              <p className="text-2xl">🐄</p><p className="font-bold">Karja</p><p className="text-gray-600">Perustarpeet</p>
            </div>
          </div>
          <div className="text-sm">
            <p><strong>Vaihtokurssi:</strong> 3:1 pankkiin, 2:1 kauppiaalla, 1:1 sopimuksella</p>
            <p><strong>Rekrytointi:</strong> 2 hevosta = 1 ratsuväki, 2 ruokaa = 1 jalkaväki</p>
          </div>
        </section>

        {/* 7. Diplomatiajärjestelmä */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-amber-800 mb-3 flex items-center gap-2">
            <span className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm">7</span>
            Diplomatiajärjestelmä
          </h2>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-amber-100">
                <th className="border p-1 text-left">Sopimus</th>
                <th className="border p-1 text-left">Kesto</th>
                <th className="border p-1 text-left">Vaikutus</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border p-1">Rauhansopimus</td><td className="border p-1">3 vuoroa</td><td className="border p-1">Ei hyökkäyksiä osapuolten välillä</td></tr>
              <tr><td className="border p-1">Kauppasopimus</td><td className="border p-1">5 vuoroa</td><td className="border p-1">+1 kulta molemmille per vuoro</td></tr>
              <tr><td className="border p-1">Dynastinen liitto</td><td className="border p-1">Pysyvä</td><td className="border p-1">Jaettu puolustus, ei hyökkäyksiä</td></tr>
              <tr><td className="border p-1">Vasallisuhde</td><td className="border p-1">Kunnes puretaan</td><td className="border p-1">2 resurssia/vuoro → suojelu</td></tr>
            </tbody>
          </table>
          <p className="mt-2 text-sm text-red-700">
            <strong>⚠️ Petturimerkit:</strong> Sopimuksen rikkominen antaa petturimerkin. 3 merkkiä = kaikki pelaajat vihollisia.
          </p>
        </section>

        {/* 8. Voittoehdot */}
        <section className="mb-8 break-before-page">
          <h2 className="text-xl font-bold text-amber-800 mb-3 flex items-center gap-2">
            <span className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm">8</span>
            Voittoehdot
          </h2>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="border-2 border-red-500 rounded p-3">
              <h3 className="font-bold text-red-700 mb-2">🏆 SOTILAALLINEN VOITTO</h3>
              <ul className="space-y-1"><li>✓ Hallitse 60% kaupungeista</li><li>✓ Eliminoi 2+ heimopäällikköä</li><li>✓ Säilytä hallinto 3 vuoroa</li></ul>
            </div>
            <div className="border-2 border-amber-500 rounded p-3">
              <h3 className="font-bold text-amber-700 mb-2">💰 EKONOMINEN VOITTO</h3>
              <ul className="space-y-1"><li>✓ 50 voittopistettä kaupasta</li><li>✓ Hallitse 5+ kauppareittiä</li><li>✓ Hegemonia 2 vuoroa</li></ul>
            </div>
            <div className="border-2 border-blue-500 rounded p-3">
              <h3 className="font-bold text-blue-700 mb-2">🎭 KULTTUURINEN VOITTO</h3>
              <ul className="space-y-1"><li>✓ Diplomatia kaikkien kanssa</li><li>✓ 8 kulttuurirakennusta</li><li>✓ 5 kulttuurievoluutiokorttia</li></ul>
            </div>
            <div className="border-2 border-green-500 rounded p-3">
              <h3 className="font-bold text-green-700 mb-2">⚙️ TEKNOLOGINEN VOITTO</h3>
              <ul className="space-y-1"><li>✓ 12 teknologiakorttia</li><li>✓ 6 edistynyttä linnoitusta</li><li>✓ Etumatka 3 vuoroa</li></ul>
            </div>
          </div>
        </section>

        {/* 9. Korttien selitykset */}
        <section className="mb-8 break-before-page">
          <h2 className="text-xl font-bold text-amber-800 mb-3 flex items-center gap-2">
            <span className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm">9</span>
            Korttien selitykset — Täydellinen korttiluettelo
          </h2>
          <div className="mt-3 mb-4 text-xs">
            <h3 className="font-bold mb-1">Harvinaisuudet:</h3>
            <div className="flex gap-4">
              <span><span className="inline-block w-2 h-2 rounded-full bg-gray-500"></span> Yleinen</span>
              <span><span className="inline-block w-2 h-2 rounded-full bg-green-500"></span> Epätavallinen</span>
              <span><span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span> Harvinainen</span>
              <span><span className="inline-block w-2 h-2 rounded-full bg-purple-500"></span> Legendaarinen</span>
            </div>
          </div>

          <CardReferenceSection title="⚔️ STRATEGIAKORTIT" subtitle="Taistelutaktiikat, erikoisliikkeet ja historialliset tapahtumat." cards={strategyCards} />
          <CardReferenceSection title="🤝 DIPLOMATIAKORTIT" subtitle="Sopimukset, liitot ja painostus." cards={diplomacyCards} />
          <CardReferenceSection title="⚙️ TEKNOLOGIAKORTIT" subtitle="Pysyvät parannukset. Maksa käsityöläisillä hallintovaiheessa." cards={technologyCards} />
          <CardReferenceSection title="📦 RESURSSIKORTIT" subtitle="Hevoset, kulta, ruoka, käsityöläiset, karja." cards={resourceCards} />
        </section>

        {/* 10. Pikaohje */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-amber-800 mb-3 flex items-center gap-2">
            <span className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm">10</span>
            Pikaohje — Ensimmäinen peli
          </h2>
          <div className="bg-amber-50 p-4 rounded border border-amber-200 text-sm">
            <ol className="list-decimal ml-4 space-y-2">
              <li><strong>Valitse heimo.</strong> Aloittelijoille suositellaan Mongoli-heimoa tai Persialaista valtakuntaa.</li>
              <li><strong>Opi resurssit.</strong> Ensimmäisissä peleissä keskity keräämään resursseja ja rakentamaan talous.</li>
              <li><strong>Käytä kortteja.</strong> Älä hamstraa — korttien käyttö on avain voittoon.</li>
              <li><strong>Älä hyökkää kaikkia.</strong> Valitse yksi vastustaja ja keskity.</li>
              <li><strong>Muista diplomatia.</strong> Edes väliaikainen rauha antaa aikaa kehittyä.</li>
            </ol>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 pt-4 border-t">
          <p>Mongolien Valtakunta © 2024 — Pelisuunnitteludokumentti v1.0</p>
        </div>
      </div>
    </div>
  );
};

export default MateriaalitPDF;

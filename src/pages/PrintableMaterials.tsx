import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PrintableCardSheet } from "@/components/game/printable/PrintableCard";
import { CardImageGenerator } from "@/components/game/printable/CardImageGenerator";
import { PrintableGameBoard } from "@/components/game/printable/PrintableGameBoard";
import { 
  strategyCards, 
  diplomacyCards, 
  technologyCards, 
  resourceCards,
  allCards,
  cardTypeInfo 
} from "@/data/gameCards";
import { Printer, FileText, Wand2, Map } from "lucide-react";

const PrintableMaterials = () => {
  const [showRulebook, setShowRulebook] = useState(true);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header - piilotettu tulostuksessa */}
        <div className="text-center mb-8 print:hidden">
          <h1 className="font-display text-4xl font-bold mb-4">
            Tulostettavat Materiaalit
          </h1>
          <p className="text-muted-foreground mb-6">
            Tulosta kaikki pelikortit ja sääntökirja kotiversiona peliä varten
          </p>
          <Button onClick={handlePrint} size="lg" className="gap-2">
            <Printer className="w-5 h-5" />
            Tulosta Kaikki
          </Button>
        </div>

        {/* Statistiikat */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 print:hidden">
          <div className="p-4 bg-card border rounded-lg text-center">
            <p className="text-3xl font-display font-bold text-primary">{allCards.length}</p>
            <p className="text-sm text-muted-foreground">Korttia yhteensä</p>
          </div>
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
            <p className="text-3xl font-display font-bold text-red-600">{strategyCards.length}</p>
            <p className="text-sm text-muted-foreground">Strategiakorttia</p>
          </div>
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-center">
            <p className="text-3xl font-display font-bold text-blue-600">{diplomacyCards.length}</p>
            <p className="text-sm text-muted-foreground">Diplomatiakorttia</p>
          </div>
          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
            <p className="text-3xl font-display font-bold text-green-600">{technologyCards.length}</p>
            <p className="text-sm text-muted-foreground">Teknologiakorttia</p>
          </div>
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-center">
            <p className="text-3xl font-display font-bold text-amber-600">{resourceCards.length}</p>
            <p className="text-sm text-muted-foreground">Resurssikorttia</p>
          </div>
        </div>

        <Tabs defaultValue="gameboard" className="print:hidden">
          <TabsList className="grid w-full grid-cols-7 mb-6">
            <TabsTrigger value="gameboard" className="gap-2">
              <Map className="w-4 h-4" />
              Pelilauta
            </TabsTrigger>
            <TabsTrigger value="ai-generator" className="gap-2">
              <Wand2 className="w-4 h-4" />
              AI-Kuvat
            </TabsTrigger>
            <TabsTrigger value="rulebook" className="gap-2">
              <FileText className="w-4 h-4" />
              Sääntökirja
            </TabsTrigger>
            <TabsTrigger value="strategy" className="gap-2">
              <span className="text-lg">⚔️</span>
              Strategia
            </TabsTrigger>
            <TabsTrigger value="diplomacy" className="gap-2">
              <span className="text-lg">🤝</span>
              Diplomatia
            </TabsTrigger>
            <TabsTrigger value="technology" className="gap-2">
              <span className="text-lg">⚙️</span>
              Teknologia
            </TabsTrigger>
            <TabsTrigger value="resource" className="gap-2">
              <span className="text-lg">📦</span>
              Resurssit
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gameboard">
            <PrintableGameBoard />
          </TabsContent>

          <TabsContent value="ai-generator">
            <CardImageGenerator />
          </TabsContent>

          <TabsContent value="rulebook">
            <PrintableRulebook />
          </TabsContent>

          <TabsContent value="strategy">
            <PrintableCardSheet cards={strategyCards} title="Strategiakortit" />
          </TabsContent>

          <TabsContent value="diplomacy">
            <PrintableCardSheet cards={diplomacyCards} title="Diplomatiakortit" />
          </TabsContent>

          <TabsContent value="technology">
            <PrintableCardSheet cards={technologyCards} title="Teknologiakortit" />
          </TabsContent>

          <TabsContent value="resource">
            <PrintableCardSheet cards={resourceCards} title="Resurssikortit" />
          </TabsContent>
        </Tabs>

        {/* Tulostettava versio - näkyy vain tulostuksessa */}
        <div className="hidden print:block">
          <PrintableRulebook />
          <PrintableCardSheet cards={strategyCards} title="Strategiakortit" />
          <PrintableCardSheet cards={diplomacyCards} title="Diplomatiakortit" />
          <PrintableCardSheet cards={technologyCards} title="Teknologiakortit" />
          <PrintableCardSheet cards={resourceCards} title="Resurssikortit" />
        </div>
      </div>
    </Layout>
  );
};

const PrintableRulebook = () => {
  return (
    <div className="max-w-[210mm] mx-auto bg-white text-black p-8 print:p-4 rounded-lg shadow-lg print:shadow-none">
      {/* Kansilehti */}
      <div className="text-center mb-12 pb-8 border-b-4 border-amber-600 print:break-after-page">
        <div className="text-6xl mb-4">🏇</div>
        <h1 className="font-display text-4xl font-bold text-amber-800 mb-2">
          MONGOLIEN VALTAKUNTA
        </h1>
        <p className="text-xl text-amber-600 font-medium mb-4">
          Strategialautapeli 2–4 pelaajalle
        </p>
        <div className="flex justify-center gap-8 text-sm text-gray-600">
          <span>⏱️ 3–5 tuntia</span>
          <span>👥 2–4 pelaajaa</span>
          <span>🎯 12+ vuotta</span>
        </div>
        <p className="mt-6 text-gray-500 italic">
          Versio 1.0 — Pelisuunnitteludokumentti
        </p>
      </div>

      {/* Sisällysluettelo */}
      <div className="mb-8 print:break-after-page">
        <h2 className="font-display text-2xl font-bold text-amber-800 mb-4">Sisällysluettelo</h2>
        <ol className="space-y-2 text-sm">
          <li className="flex justify-between border-b border-dotted border-gray-300 pb-1">
            <span>1. Pelin tavoite</span><span>2</span>
          </li>
          <li className="flex justify-between border-b border-dotted border-gray-300 pb-1">
            <span>2. Pelin valmistelu</span><span>2</span>
          </li>
          <li className="flex justify-between border-b border-dotted border-gray-300 pb-1">
            <span>3. Heimot ja niiden erikoiskyvyt</span><span>3</span>
          </li>
          <li className="flex justify-between border-b border-dotted border-gray-300 pb-1">
            <span>4. Vuoron kulku</span><span>4</span>
          </li>
          <li className="flex justify-between border-b border-dotted border-gray-300 pb-1">
            <span>5. Taistelujärjestelmä</span><span>5</span>
          </li>
          <li className="flex justify-between border-b border-dotted border-gray-300 pb-1">
            <span>6. Resurssit ja kaupankäynti</span><span>6</span>
          </li>
          <li className="flex justify-between border-b border-dotted border-gray-300 pb-1">
            <span>7. Diplomatiajärjestelmä</span><span>7</span>
          </li>
          <li className="flex justify-between border-b border-dotted border-gray-300 pb-1">
            <span>8. Voittoehdot</span><span>8</span>
          </li>
          <li className="flex justify-between border-b border-dotted border-gray-300 pb-1">
            <span>9. Korttien selitykset</span><span>9</span>
          </li>
          <li className="flex justify-between border-b border-dotted border-gray-300 pb-1">
            <span>10. Pikaohje</span><span>10</span>
          </li>
        </ol>
      </div>

      {/* 1. Pelin tavoite */}
      <section className="mb-8">
        <h2 className="font-display text-xl font-bold text-amber-800 mb-3 flex items-center gap-2">
          <span className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm">1</span>
          Pelin tavoite
        </h2>
        <p className="text-sm leading-relaxed mb-3">
          <strong>Mongolien Valtakunta</strong> sijoittuu 1200-luvun Aasiaan, aikakauteen jolloin Genghis Khan 
          ja hänen seuraajansa rakensivat historian suurimman maavallan. Pelaajat johtavat yhtä neljästä 
          suurvallasta kamppaillessaan Aasian herruudesta.
        </p>
        <p className="text-sm leading-relaxed">
          Voita peli saavuttamalla <strong>yksi neljästä voittotavasta</strong>:
        </p>
        <ul className="text-sm mt-2 space-y-1 ml-4">
          <li>🏆 <strong>Sotilaallinen voitto:</strong> Hallitse 60% kaupungeista</li>
          <li>💰 <strong>Ekonominen voitto:</strong> Kerää 50 voittopistettä kaupasta</li>
          <li>🎭 <strong>Kulttuurinen voitto:</strong> Rakenna 8 kulttuurirakennusta + diplomatia kaikkien kanssa</li>
          <li>⚙️ <strong>Teknologinen voitto:</strong> Kehitä 12 teknologiakorttia</li>
        </ul>
      </section>

      {/* 2. Pelin valmistelu */}
      <section className="mb-8">
        <h2 className="font-display text-xl font-bold text-amber-800 mb-3 flex items-center gap-2">
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
      <section className="mb-8 print:break-before-page">
        <h2 className="font-display text-xl font-bold text-amber-800 mb-3 flex items-center gap-2">
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
        <h2 className="font-display text-xl font-bold text-amber-800 mb-3 flex items-center gap-2">
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
      <section className="mb-8 print:break-before-page">
        <h2 className="font-display text-xl font-bold text-amber-800 mb-3 flex items-center gap-2">
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
        <h2 className="font-display text-xl font-bold text-amber-800 mb-3 flex items-center gap-2">
          <span className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm">6</span>
          Resurssit ja kaupankäynti
        </h2>
        
        <div className="grid grid-cols-5 gap-2 text-xs mb-4">
          <div className="text-center p-2 bg-amber-100 rounded">
            <p className="text-2xl">🐎</p>
            <p className="font-bold">Hevoset</p>
            <p className="text-gray-600">Ratsuväen rekrytointi</p>
          </div>
          <div className="text-center p-2 bg-yellow-100 rounded">
            <p className="text-2xl">🪙</p>
            <p className="font-bold">Kulta</p>
            <p className="text-gray-600">Kaupankäynti</p>
          </div>
          <div className="text-center p-2 bg-green-100 rounded">
            <p className="text-2xl">🌾</p>
            <p className="font-bold">Ruoka</p>
            <p className="text-gray-600">Armeijan ylläpito</p>
          </div>
          <div className="text-center p-2 bg-gray-100 rounded">
            <p className="text-2xl">🛠️</p>
            <p className="font-bold">Käsityöl.</p>
            <p className="text-gray-600">Teknologia</p>
          </div>
          <div className="text-center p-2 bg-orange-100 rounded">
            <p className="text-2xl">🐄</p>
            <p className="font-bold">Karja</p>
            <p className="text-gray-600">Perustarpeet</p>
          </div>
        </div>
        
        <div className="text-sm">
          <p><strong>Vaihtokurssi:</strong> 3:1 pankkiin, 2:1 kauppiaalla, 1:1 sopimuksella</p>
          <p><strong>Rekrytointi:</strong> 2 hevosta = 1 ratsuväki, 2 ruokaa = 1 jalkaväki</p>
        </div>
      </section>

      {/* 7. Diplomatiajärjestelmä */}
      <section className="mb-8">
        <h2 className="font-display text-xl font-bold text-amber-800 mb-3 flex items-center gap-2">
          <span className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm">7</span>
          Diplomatiajärjestelmä
        </h2>
        
        <div className="text-sm">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-amber-100">
                <th className="border p-1 text-left">Sopimus</th>
                <th className="border p-1 text-left">Kesto</th>
                <th className="border p-1 text-left">Vaikutus</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-1">Rauhansopimus</td>
                <td className="border p-1">3 vuoroa</td>
                <td className="border p-1">Ei hyökkäyksiä osapuolten välillä</td>
              </tr>
              <tr>
                <td className="border p-1">Kauppasopimus</td>
                <td className="border p-1">5 vuoroa</td>
                <td className="border p-1">+1 kulta molemmille per vuoro</td>
              </tr>
              <tr>
                <td className="border p-1">Dynastinen liitto</td>
                <td className="border p-1">Pysyvä</td>
                <td className="border p-1">Jaettu puolustus, ei hyökkäyksiä</td>
              </tr>
              <tr>
                <td className="border p-1">Vasallisuhde</td>
                <td className="border p-1">Kunnes puretaan</td>
                <td className="border p-1">2 resurssia/vuoro → suojelu</td>
              </tr>
            </tbody>
          </table>
          
          <p className="mt-2 text-red-700">
            <strong>⚠️ Petturimerkit:</strong> Sopimuksen rikkominen antaa petturimerkin. 
            3 merkkiä = kaikki pelaajat vihollisia.
          </p>
        </div>
      </section>

      {/* 8. Voittoehdot */}
      <section className="mb-8 print:break-before-page">
        <h2 className="font-display text-xl font-bold text-amber-800 mb-3 flex items-center gap-2">
          <span className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm">8</span>
          Voittoehdot
        </h2>
        
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="border-2 border-red-500 rounded p-3">
            <h3 className="font-bold text-red-700 mb-2">🏆 SOTILAALLINEN VOITTO</h3>
            <ul className="space-y-1">
              <li>✓ Hallitse 60% kaupungeista</li>
              <li>✓ Eliminoi 2+ heimopäällikköä</li>
              <li>✓ Säilytä hallinto 3 vuoroa</li>
            </ul>
          </div>
          
          <div className="border-2 border-amber-500 rounded p-3">
            <h3 className="font-bold text-amber-700 mb-2">💰 EKONOMINEN VOITTO</h3>
            <ul className="space-y-1">
              <li>✓ 50 voittopistettä kaupasta</li>
              <li>✓ Hallitse 5+ kauppareittiä</li>
              <li>✓ Hegemonia 2 vuoroa</li>
            </ul>
          </div>
          
          <div className="border-2 border-blue-500 rounded p-3">
            <h3 className="font-bold text-blue-700 mb-2">🎭 KULTTUURINEN VOITTO</h3>
            <ul className="space-y-1">
              <li>✓ Diplomatia kaikkien kanssa</li>
              <li>✓ 8 kulttuurirakennusta</li>
              <li>✓ 5 kulttuurievoluutiokorttia</li>
            </ul>
          </div>
          
          <div className="border-2 border-green-500 rounded p-3">
            <h3 className="font-bold text-green-700 mb-2">⚙️ TEKNOLOGINEN VOITTO</h3>
            <ul className="space-y-1">
              <li>✓ 12 teknologiakorttia</li>
              <li>✓ 6 edistynyttä linnoitusta</li>
              <li>✓ Etumatka 3 vuoroa</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 9. Korttien selitykset */}
      <section className="mb-8">
        <h2 className="font-display text-xl font-bold text-amber-800 mb-3 flex items-center gap-2">
          <span className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm">9</span>
          Korttien selitykset
        </h2>
        
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <h3 className="font-bold text-red-700 mb-1">⚔️ STRATEGIAKORTIT (60 kpl)</h3>
            <p>Taistelutaktiikat, erikoisliikkeet, historialliset tapahtumat. Pelaa toimintavaiheessa.</p>
          </div>
          <div>
            <h3 className="font-bold text-blue-700 mb-1">🤝 DIPLOMATIAKORTIT (40 kpl)</h3>
            <p>Sopimukset, liitot, painostus. Pelaa milloin tahansa neuvotteluissa.</p>
          </div>
          <div>
            <h3 className="font-bold text-green-700 mb-1">⚙️ TEKNOLOGIAKORTIT (30 kpl)</h3>
            <p>Pysyvät parannukset. Maksa käsityöläisillä hallintovaiheessa.</p>
          </div>
          <div>
            <h3 className="font-bold text-amber-700 mb-1">📦 RESURSSIKORTIT (50 kpl)</h3>
            <p>Hevoset, kulta, ruoka, käsityöläiset, karja. Käytä tarpeen mukaan.</p>
          </div>
        </div>
        
        <div className="mt-3 text-xs">
          <h3 className="font-bold mb-1">Harvinaisuudet:</h3>
          <div className="flex gap-4">
            <span><span className="inline-block w-2 h-2 rounded-full bg-gray-500"></span> Yleinen</span>
            <span><span className="inline-block w-2 h-2 rounded-full bg-green-500"></span> Epätavallinen</span>
            <span><span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span> Harvinainen</span>
            <span><span className="inline-block w-2 h-2 rounded-full bg-purple-500"></span> Legendaarinen</span>
          </div>
        </div>
      </section>

      {/* 10. Pikaohje */}
      <section className="mb-8">
        <h2 className="font-display text-xl font-bold text-amber-800 mb-3 flex items-center gap-2">
          <span className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm">10</span>
          Pikaohje — Ensimmäinen peli
        </h2>
        
        <div className="bg-amber-50 p-4 rounded border border-amber-200 text-sm">
          <ol className="list-decimal ml-4 space-y-2">
            <li><strong>Valitse heimo.</strong> Aloittelijoille suositellaan Mongoli-heimoa (helpoin) tai Persialaista valtakuntaa (diplomaattinen).</li>
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
        <p className="mt-1">Tämä on prototyyppi. Lopullinen versio voi sisältää muutoksia.</p>
      </div>
    </div>
  );
};

export default PrintableMaterials;

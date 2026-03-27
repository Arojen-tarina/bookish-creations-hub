/**
 * Ohjekirja.tsx — Interaktiivinen verkkosivuohjekirja
 *
 * Kattava sääntökirja Mongolien Valtakunta -pelille.
 * Sisältää kaikki pelin mekaniikat selitettynä ja navigoitavissa.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Crown, Map, Coins, Sword, Shield, Hammer, ScrollText, Trophy,
  ChevronRight, ArrowLeft, Package, Users, Wheat, Zap, Search,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { PROVINCE_TERRAIN_INFO } from "@/types/province";
import { BUILDING_INFO, VICTORY_TARGETS } from "@/hooks/useProvinceGameState";

/** Yksittäinen sääntöosio */
interface RuleSection {
  id: string;
  title: string;
  icon: typeof Crown;
  content: React.ReactNode;
}

/** Maastotaulukko-komponentti */
const TerrainTable = () => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-amber-700/30">
          <th className="text-left p-2 text-amber-200">Maasto</th>
          <th className="text-center p-2 text-amber-200">Liike</th>
          <th className="text-center p-2 text-amber-200">Puolustus</th>
          <th className="text-center p-2 text-amber-200">Tarjonta</th>
          <th className="text-center p-2 text-amber-200">Vero</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(PROVINCE_TERRAIN_INFO).map(([key, t]) => (
          <tr key={key} className="border-b border-slate-700/50 hover:bg-slate-800/30">
            <td className="p-2">{t.emoji} {t.name}</td>
            <td className="text-center p-2">{t.movementCost}</td>
            <td className="text-center p-2 text-green-400">+{t.defenseBonus}</td>
            <td className="text-center p-2 text-purple-400">{t.supplyLimit}</td>
            <td className="text-center p-2 text-yellow-400">x{t.taxModifier}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

/** Vinkkiboksi */
const Tip = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg p-3 my-3 flex gap-2">
    <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
    <span className="text-amber-100/90 text-sm">{children}</span>
  </div>
);

/** Kaava-näyttö */
const Formula = ({ children }: { children: string }) => (
  <div className="bg-slate-900/80 border border-slate-700 rounded px-3 py-2 font-mono text-xs text-amber-200 my-2 overflow-x-auto">
    {children}
  </div>
);

/** Sääntöosiot — kaikki sisältö */
const createSections = (): RuleSection[] => [
  {
    id: "intro",
    title: "Johdanto",
    icon: Crown,
    content: (
      <div className="space-y-3 text-amber-100/80">
        <p>
          <strong>Mongolien Valtakunta</strong> on vuoropohjainen strategiapeli, jossa rakennat historian suurimman imperiumin.
          Peli alkaa vuodesta 1206, jolloin Temüjin yhdisti mongoliheimot.
        </p>
        <p>Pelissä on ~70 provinssia, 6 pelattavaa heimoa ja kolme voittotapaa.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <Card className="bg-slate-800/50 border-amber-700/30">
            <CardContent className="p-3 text-center">
              <Trophy className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <div className="font-bold text-amber-200">Sotilaallinen</div>
              <div className="text-xs text-amber-200/60">{VICTORY_TARGETS.provinces}+ provinssia</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-amber-700/30">
            <CardContent className="p-3 text-center">
              <Coins className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="font-bold text-amber-200">Taloudellinen</div>
              <div className="text-xs text-amber-200/60">{VICTORY_TARGETS.gold}+ kultaa</div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-amber-700/30">
            <CardContent className="p-3 text-center">
              <ScrollText className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <div className="font-bold text-amber-200">Teknologinen</div>
              <div className="text-xs text-amber-200/60">{VICTORY_TARGETS.tech}+ tekniikkakorttia</div>
            </CardContent>
          </Card>
        </div>
      </div>
    ),
  },
  {
    id: "phases",
    title: "Vuoron vaiheet",
    icon: ScrollText,
    content: (
      <div className="space-y-4 text-amber-100/80">
        <p>Jokainen vuoro koostuu kuudesta vaiheesta:</p>
        {[
          { num: 1, name: "Resurssit", desc: "Kerää verot, ruoka, hevoset ja käsityöläiset provinsseiltasi.", emoji: "💰" },
          { num: 2, name: "Kortit", desc: "Nosta 2 korttia pakasta. Pelaa kortteja kädestäsi.", emoji: "🃏" },
          { num: 3, name: "Liikkuminen", desc: "Siirrä armeijoitasi naapuriprovinsseihin.", emoji: "🏇" },
          { num: 4, name: "Taistelu", desc: "Taistelut ratkaistaan automaattisesti liikkuessa vihollisalueelle.", emoji: "⚔️" },
          { num: 5, name: "Rakentaminen", desc: "Rakenna leirejä, markkinoita, linnoituksia ja pajoja.", emoji: "🏗️" },
          { num: 6, name: "Vuoron lopetus", desc: "AI-heimot toimivat, tarjonta tarkistetaan, vuosi etenee.", emoji: "⏭️" },
        ].map((phase) => (
          <div key={phase.num} className="flex items-start gap-3 bg-slate-800/40 rounded-lg p-3">
            <span className="flex-shrink-0 w-8 h-8 bg-amber-900/50 rounded-full flex items-center justify-center text-amber-400 font-bold text-sm">
              {phase.num}
            </span>
            <div>
              <div className="font-bold text-amber-200">{phase.emoji} {phase.name}</div>
              <div className="text-sm text-amber-100/60">{phase.desc}</div>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "resources",
    title: "Resurssit",
    icon: Coins,
    content: (
      <div className="space-y-4 text-amber-100/80">
        <p>Pelissä on neljä pääresurssia:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { name: "Kulta", emoji: "💰", desc: "Armeijat, rakennukset, rekrytointi. Kerätään veroista ja markkinoilta." },
            { name: "Ruoka", emoji: "🌾", desc: "Armeijoiden ylläpito. -1/armeija/vuoro. Viljelymaa ja leirit tuottavat." },
            { name: "Hevoset", emoji: "🐴", desc: "Ratsuväen rekrytointi. Steppi- ja hevosprovinssit tuottavat." },
            { name: "Käsityöläiset", emoji: "🔨", desc: "Rakentamiseen tarvitaan. Viljelymaa, kukkulat ja pajat tuottavat." },
          ].map((r) => (
            <div key={r.name} className="bg-slate-800/40 rounded-lg p-3">
              <div className="font-bold text-amber-200 text-lg">{r.emoji} {r.name}</div>
              <div className="text-sm text-amber-100/60">{r.desc}</div>
            </div>
          ))}
        </div>
        <Tip>Rakenna ensin paja, sitten markkina — näin saat sekä käsityöläisiä että kultaa!</Tip>
      </div>
    ),
  },
  {
    id: "terrain",
    title: "Kartta ja maasto",
    icon: Map,
    content: (
      <div className="space-y-4 text-amber-100/80">
        <p>Jokaisella provinssilla on maasto, joka vaikuttaa liikkumiseen, puolustukseen, tarjontaan ja verotukseen.</p>
        <TerrainTable />
        <Tip>Vuoristot ovat lähes valloittamattomia suoralla hyökkäyksellä — kiertoreitti on viisaampi!</Tip>
      </div>
    ),
  },
  {
    id: "combat",
    title: "Taistelujärjestelmä",
    icon: Sword,
    content: (
      <div className="space-y-4 text-amber-100/80">
        <p>Taistelu käynnistyy automaattisesti kun armeijasi liikkuu vihollisprovinssiin.</p>
        <h4 className="font-bold text-amber-200 mt-4">Hyökkääjän voima:</h4>
        <Formula>
          (Ratsuväki × 3 + Jalkaväki × 1.5 + Piirityslaiteet) × (1 + johtajabonus) × (moraali / 100) + hyökkäysbonus
        </Formula>
        <h4 className="font-bold text-amber-200">Puolustajan voima:</h4>
        <Formula>
          (Ratsuväki × 2 + Jalkaväki × 2 + Piirityslaiteet) × (1 + maastobonus × 0.2) × (1 + linnoitus × 0.35) × (moraali / 100) + puolustusbonus
        </Formula>
        <h4 className="font-bold text-amber-200">Ratkaisu:</h4>
        <ul className="space-y-1 text-sm list-disc list-inside">
          <li>Molemmat heittävät noppaa (1–6)</li>
          <li>Suhde = (hyökkääjän voima + noppa×2) / (puolustajan voima + noppa×2)</li>
          <li>Jos suhde {">"} 0.95 → hyökkääjä voittaa</li>
          <li>Voittaja menettää ~14%, häviäjä ~32–42% joukoistaan</li>
        </ul>
        <h4 className="font-bold text-amber-200 mt-4">Garnisooni:</h4>
        <p className="text-sm">
          Jos provinssilla on linnoitus ilman armeijaa, se puolustautuu garnisoonijoukoin:
          jalkaväki = linnoitustaso×3 + kehitystaso/2, moraali = 55 + linnoitustaso×10 + kehitystaso×2.
        </p>
        <Tip>Kiistelty provinssi: jos vastustajan armeija on samassa ruudussa, kumpikaan ei voi toimia — tilanne ratkaistaan taistelussa tai vetäytymisellä!</Tip>
      </div>
    ),
  },
  {
    id: "defense",
    title: "Puolustus",
    icon: Shield,
    content: (
      <div className="space-y-4 text-amber-100/80">
        <p>Puolustus koostuu kolmesta osasta ja vaikuttaa suoraan puolustajan taisteluvoiman laskentaan.</p>
        
        <h4 className="font-bold text-amber-200">1. Maastobonus</h4>
        <p className="text-sm">Kaava: voima × (1 + maastobonus × 0.2). Vuoristossa (+3) puolustaja saa +60% voimaa.</p>
        
        <h4 className="font-bold text-amber-200">2. Linnoitusbonus</h4>
        <p className="text-sm">Kaava: voima × (1 + linnoitustaso × 0.35). Taso 3 antaa +105% voimaa!</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-amber-700/30">
                <th className="text-left p-2 text-amber-200">Taso</th>
                <th className="text-center p-2 text-amber-200">Bonus</th>
                <th className="text-center p-2 text-amber-200">Garnisooni</th>
              </tr>
            </thead>
            <tbody>
              {[
                { level: 1, bonus: "+35%", garrison: "3 jalkaväkeä, moraali 65" },
                { level: 2, bonus: "+70%", garrison: "6 jalkaväkeä, moraali 75" },
                { level: 3, bonus: "+105%", garrison: "9 jalkaväkeä, moraali 85" },
              ].map((row) => (
                <tr key={row.level} className="border-b border-slate-700/50">
                  <td className="p-2">Taso {row.level}</td>
                  <td className="text-center p-2 text-green-400">{row.bonus}</td>
                  <td className="text-center p-2 text-amber-200/60">{row.garrison}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <h4 className="font-bold text-amber-200">3. Korttibonukset</h4>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li>Vahvistettu Linja: +3 puolustus (tämä vuoro)</li>
          <li>Rauhansopimus: +2 puolustus (3 vuoroa)</li>
          <li>Aselepo: +1 puolustus (1 vuoro)</li>
          <li>Teräshaarniska: +1 puolustus (pysyvä)</li>
        </ul>
        
        <h4 className="font-bold text-amber-200 mt-4">Esimerkki</h4>
        <p className="text-sm">5 ratsuväkeä + 10 jalkaväkeä (perusvoima = 30), moraali 80%, vuoristo (+3), linnoitus (taso 2), kortti +3:</p>
        <Formula>30 × 1.6 × 1.7 × 0.8 + 3 = 68.28 (vs. 24 ilman puolustusta!)</Formula>
        <Tip>Puolustus lähes kolminkertaistaa voiman — hyökkääjä tarvitsee paljon suuremman armeijan!</Tip>
      </div>
    ),
  },
  {
    id: "supply",
    title: "Tarjonta",
    icon: Package,
    content: (
      <div className="space-y-4 text-amber-100/80">
        <p>
          <strong>Tarjonta (supply)</strong> määrää kuinka suuren armeijan provinssi pystyy ylläpitämään.
          Jos armeijasi on liian suuri provinssin tarjontaan nähden, se kärsii kulumisesta ja moraalin laskusta.
        </p>
        
        <h4 className="font-bold text-amber-200">Tarjontaraja</h4>
        <p className="text-sm">
          Jokaisen provinssin tarjontaraja = provinssin oma tarjonta-arvo + maaston tarjontaraja.
          Esim. viljelymaan tarjontaraja on korkea (8), kun taas aavikon (1) on matala.
        </p>
        
        <h4 className="font-bold text-amber-200 mt-3">Ylitarjonnan seuraukset</h4>
        <p className="text-sm">Jos armeijan koko (ratsuväki + jalkaväki + piirityslaiteet) ylittää tarjontarajan:</p>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li><strong>Moraalin lasku:</strong> -3 moraalia per ylittävä yksikkö (max -15/vuoro)</li>
          <li><strong>Kuluminen:</strong> 8% mahdollisuus per ylittävä yksikkö menettää 10% joukoista</li>
          <li><strong>Varastot vähenevät:</strong> armeijan omat varastot pienenevät</li>
        </ul>

        <h4 className="font-bold text-amber-200 mt-3">Tarjontataulukko maastoittain</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-amber-700/30">
                <th className="text-left p-2 text-amber-200">Maasto</th>
                <th className="text-center p-2 text-amber-200">Tarjontaraja</th>
                <th className="text-left p-2 text-amber-200">Suositeltu armeija</th>
              </tr>
            </thead>
            <tbody>
              {[
                { terrain: "🌾 Viljelymaa", limit: 8, rec: "Iso armeija turvallinen" },
                { terrain: "🌿 Ruohomaa", limit: 5, rec: "Keskikokoinen armeija" },
                { terrain: "🌲 Metsä", limit: 4, rec: "Pienet partiot parhaita" },
                { terrain: "⛰️ Kukkulat", limit: 4, rec: "Keskikokoinen puolustus" },
                { terrain: "🌾 Steppi", limit: 3, rec: "Kevyt ratsuväki" },
                { terrain: "🌲 Taiga", limit: 2, rec: "Pienet joukot" },
                { terrain: "⛰️ Vuoristo", limit: 2, rec: "Vain pienet joukot" },
                { terrain: "🌿 Suo", limit: 2, rec: "Varovainen eteneminen" },
                { terrain: "🏜️ Aavikko", limit: 1, rec: "Erittäin pienet joukot!" },
                { terrain: "❄️ Tundra", limit: 1, rec: "Erittäin pienet joukot!" },
              ].map((row) => (
                <tr key={row.terrain} className="border-b border-slate-700/50">
                  <td className="p-2">{row.terrain}</td>
                  <td className="text-center p-2 text-purple-400">{row.limit}</td>
                  <td className="p-2 text-amber-200/60">{row.rec}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h4 className="font-bold text-amber-200 mt-3">Ystävällinen alue</h4>
        <p className="text-sm">
          Jos armeija on omalla alueellasi eikä ylitä tarjontaa, se saa +5 moraalia ja täydennystä varastoon joka vuoro.
          Vieraalla alueella armeija menettää hitaasti varastoja (-2/vuoro).
        </p>

        <Tip>
          Älä yritä marssia 20 yksikön armeijaa aavikon läpi — hajota se pienempiin osiin ja käytä eri reittejä!
        </Tip>
      </div>
    ),
  },
  {
    id: "buildings",
    title: "Rakentaminen",
    icon: Hammer,
    content: (
      <div className="space-y-4 text-amber-100/80">
        <p>Kukin rakennus voidaan rakentaa kerran per provinssi.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(BUILDING_INFO).map(([key, b]) => (
            <div key={key} className="bg-slate-800/40 rounded-lg p-3">
              <div className="font-bold text-amber-200">{b.emoji} {b.name}</div>
              <div className="text-xs text-amber-200/60">
                Hinta: {b.cost.gold} kultaa{b.cost.artisans ? ` + ${b.cost.artisans} käsityöläistä` : ""}
              </div>
              <div className="text-sm mt-1">{b.effect}</div>
            </div>
          ))}
        </div>
        <Tip>Linnoitus antaa +3 puolustusta JA garnisoonin — se on paras investointi raja-alueilla!</Tip>
      </div>
    ),
  },
  {
    id: "cards",
    title: "Korttijärjestelmä",
    icon: ScrollText,
    content: (
      <div className="space-y-4 text-amber-100/80">
        <p>Pelissä on 20 kortin pakka (5/tyyppi). Nosta 2 korttia/vuoro, pelaa korttivaiheessa.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { type: "Strategia", desc: "Taistelubonuksia: hyökkäys, puolustus, liike", color: "text-red-400" },
            { type: "Teknologia", desc: "Pysyviä bonuksia (voittoehto: 5 kpl)", color: "text-blue-400" },
            { type: "Resurssit", desc: "Kultaa, ruokaa, hevosia, käsityöläisiä", color: "text-yellow-400" },
            { type: "Diplomatia", desc: "Puolustus- ja kultabonuksia", color: "text-green-400" },
          ].map((c) => (
            <div key={c.type} className="bg-slate-800/40 rounded-lg p-3">
              <div className={`font-bold ${c.color}`}>{c.type}</div>
              <div className="text-sm text-amber-100/60">{c.desc}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "factions",
    title: "Heimot",
    icon: Users,
    content: (
      <div className="space-y-4 text-amber-100/80">
        <p>Pelissä on 6 pelattavaa heimoa. Valitse heimosi pelin alussa.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { name: "Mongolit", bonus: "Johtajabonus +30%, ratsuväki erinomainen", color: "bg-blue-900/30" },
            { name: "Naimaanit", bonus: "Vahva talous ja diplomatia", color: "bg-purple-900/30" },
            { name: "Merkitit", bonus: "Tasapainoinen, vahva jalkaväki", color: "bg-green-900/30" },
            { name: "Keraatit", bonus: "Diplomatia ja veronkeruu", color: "bg-yellow-900/30" },
            { name: "Tataarit", bonus: "Aggressiivinen, sotilasbonus", color: "bg-red-900/30" },
            { name: "Tangutit", bonus: "Linnoitusten mestari, puolustus", color: "bg-orange-900/30" },
          ].map((f) => (
            <div key={f.name} className={`${f.color} rounded-lg p-3 border border-amber-700/20`}>
              <div className="font-bold text-amber-200">{f.name}</div>
              <div className="text-sm text-amber-100/60">{f.bonus}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "strategy",
    title: "Strategiavinkit",
    icon: Trophy,
    content: (
      <div className="space-y-4 text-amber-100/80">
        <h4 className="font-bold text-amber-200">Aloitusstrategia</h4>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li>Rakenna ensin leiri pääkaupunkiin (rekrytointipiste)</li>
          <li>Vallaa viereisiä tyhjiä provinsseja ensin</li>
          <li>Rakenna markkina kultapulaan</li>
          <li>Linnoita raja-alueet</li>
        </ul>
        <h4 className="font-bold text-amber-200 mt-3">Tarjontastrategia</h4>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li>Älä kasaa valtavia armeijoita — hajota ne useampaan osaan</li>
          <li>Vältä pitkiä marsseja aavikon tai tundran läpi suurilla joukoilla</li>
          <li>Omalla alueella armeijat toipuvat — vetäydy lepäämään kun moraali on matala</li>
          <li>Hyödynnä viljelymaita tukikohtina — niillä on paras tarjonta</li>
        </ul>
        <h4 className="font-bold text-amber-200 mt-3">Taistelustrategia</h4>
        <ul className="text-sm space-y-1 list-disc list-inside">
          <li>Ratsuväki on 2x tehokkaampi hyökkäyksessä kuin jalkaväki</li>
          <li>Puolustajan maastoetu on valtava — valitse taistelupaikka viisaasti</li>
          <li>Pelaa strategiakortteja juuri ennen hyökkäystä</li>
        </ul>
        <Tip>Paras strategia on yhdistelmä: valloita nopeasti viljelymaat, linnoita ne, ja kerää resurssit voittoon!</Tip>
      </div>
    ),
  },
];

const Ohjekirja = () => {
  const [activeSection, setActiveSection] = useState("intro");
  const [searchQuery, setSearchQuery] = useState("");
  const sections = createSections();

  const filteredSections = searchQuery
    ? sections.filter(
        (s) =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sections;

  const currentSection = sections.find((s) => s.id === activeSection) || sections[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900 text-amber-100">
      {/* Header */}
      <header className="border-b border-amber-700/30 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/" className="text-amber-400 hover:text-amber-300 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Takaisin peliin</span>
          </Link>
          <Separator orientation="vertical" className="h-6 bg-amber-700/30" />
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h1 className="text-lg font-bold text-amber-200">Ohjekirja</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 flex gap-6 max-w-6xl">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <div className="sticky top-16 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/50" />
              <Input
                placeholder="Hae ohjeista..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-slate-800/50 border-amber-700/30 text-amber-100 placeholder:text-amber-200/30"
              />
            </div>
            <ScrollArea className="h-[calc(100vh-10rem)]">
              <nav className="space-y-1">
                {filteredSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                        activeSection === section.id
                          ? "bg-amber-900/40 text-amber-200 font-bold"
                          : "text-amber-100/60 hover:bg-slate-800/40 hover:text-amber-200"
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      {section.title}
                    </button>
                  );
                })}
              </nav>
            </ScrollArea>
          </div>
        </aside>

        {/* Mobile tabs */}
        <div className="md:hidden w-full">
          <Tabs value={activeSection} onValueChange={setActiveSection}>
            <ScrollArea className="w-full">
              <TabsList className="bg-slate-800/50 border border-amber-700/30 w-max mb-4">
                {sections.map((s) => (
                  <TabsTrigger
                    key={s.id}
                    value={s.id}
                    className="text-xs data-[state=active]:bg-amber-900/50 data-[state=active]:text-amber-200"
                  >
                    {s.title}
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollArea>
            {sections.map((s) => (
              <TabsContent key={s.id} value={s.id}>
                <Card className="bg-slate-800/30 border-amber-700/30">
                  <CardHeader>
                    <CardTitle className="text-amber-200 flex items-center gap-2">
                      <s.icon className="w-5 h-5 text-amber-400" />
                      {s.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>{s.content}</CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Desktop main content */}
        <main className="hidden md:block flex-1 min-w-0">
          <Card className="bg-slate-800/30 border-amber-700/30">
            <CardHeader>
              <CardTitle className="text-2xl text-amber-200 flex items-center gap-3">
                <currentSection.icon className="w-7 h-7 text-amber-400" />
                {currentSection.title}
              </CardTitle>
            </CardHeader>
            <CardContent>{currentSection.content}</CardContent>
          </Card>

          {/* Next/prev navigation */}
          <div className="flex justify-between mt-4">
            {sections.findIndex((s) => s.id === activeSection) > 0 && (
              <button
                onClick={() => {
                  const idx = sections.findIndex((s) => s.id === activeSection);
                  setActiveSection(sections[idx - 1].id);
                }}
                className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" /> Edellinen
              </button>
            )}
            <div />
            {sections.findIndex((s) => s.id === activeSection) < sections.length - 1 && (
              <button
                onClick={() => {
                  const idx = sections.findIndex((s) => s.id === activeSection);
                  setActiveSection(sections[idx + 1].id);
                }}
                className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                Seuraava <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Ohjekirja;

/**
 * ProvinceFactionSelect.tsx — Valtakunnanvalinta (provinssipeli, vuosi 1206)
 *
 * Näyttää 7 pelattavaa valtakuntaa (mongoli, Jin, Song, Xixia, Khwarezm, Rus, Kipchak)
 * tilastoineen (ratsuväki, talous, puolustus) ja vaikeustasoineen.
 */
import { FactionId, FACTION_DATA_1206 } from '@/types/province.ts';
import { ACTIVE_FACTIONS } from '@/hooks/useProvinceGameState.ts';
import { Card, CardContent } from '@/components/ui/card.tsx';
import { Badge } from '@/components/ui/badge.tsx';
// import { AdManager } from '@/components/ui/AdManager.tsx';
import { Sword, Coins, Shield, BookOpen, ScrollText, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

// Faktioiden johtajakuvat (kulttuurikohtaiset sprite-assetit)
import leaderMongol from '@/assets/sprites/leader_mongol.png';
import leaderChinese from '@/assets/sprites/leader_chinese.png';
import leaderNovgorod from '@/assets/sprites/leader_novgorod.png';
import leaderPersian from '@/assets/sprites/leader_persian.png';
// Resurssikuvakkeet
import resGold from '@/assets/sprites/res_gold.png';
import resHorse from '@/assets/sprites/res_horse.png';
// Tunnelmallinen taustakuva (maailmankartta, pehmennetty & tummennettu)
import menuBg from '@/assets/menu-bg.jpg';

const LEADER_ART: Record<string, string> = {
  mongol: leaderMongol,
  song: leaderChinese,
  rus: leaderNovgorod,
  khwarezm: leaderPersian,
};

// Faktioiden tarinalliset kuvaukset (lore-tunnelma)
const FLAVOR: Record<string, string> = {
  mongol: 'Aroilta nousee myrsky: Temüjin on yhdistänyt heimot, ja maailma vavahtaa kavioiden alla.',
  song: 'Silkin ja ruudin sivistys, jonka aarteet ja oppineisuus houkuttelevat susia porteille.',
  rus: 'Metsien ja jokien ruhtinaat vartioivat pyhiä kaupunkejaan pohjoisen kalvakassa valossa.',
  khwarezm: 'Karavaanireittien valtias, jonka minareetit hohtavat Samarkandin yllä — ylväs mutta altis.',
};

interface ProvinceFactionSelectProps {
  onSelect: (factionId: FactionId) => void;
}

export const ProvinceFactionSelect = ({ onSelect }: ProvinceFactionSelectProps) => {
  // Vain 4 aktiivista faktiota (Kiina=song, mongolit, rus, persia=khwarezm)
  const factions = ACTIVE_FACTIONS.map(id => FACTION_DATA_1206[id]);
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-slate-950 p-4 overflow-auto">
      {/* Tunnelmallinen taustakuva: maailmankartta */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${menuBg})` }}
      />
      {/* Kevyt tummennus & lämmin sävy luettavuutta varten */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, rgba(2,6,23,0.50) 0%, rgba(2,6,23,0.32) 40%, rgba(2,6,23,0.62) 100%),
                       radial-gradient(ellipse at 50% 0%, rgba(251,191,36,0.12) 0%, transparent 55%)`,
        }}
      />

      <div className="relative z-10 max-w-5xl w-full">
        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-amber-100 mb-2">
            Arojen Tarinat
          </h1>
          <p className="text-amber-200/60 text-lg">
            Vuosi 1206 — Valitse valtakuntasi
          </p>
          <p className="text-amber-200/40 text-sm mt-1 italic max-w-2xl mx-auto">
            Suuri Hirvas lauloi tämän maailman olemaan — nyt sen kohtalo lauletaan teräksellä, kullalla ja liitoilla.
          </p>
          <div className="mt-4 flex justify-center">
            <Link
              to="/codex"
              className="inline-flex items-center gap-2 rounded-full border border-amber-600/40 bg-amber-950/40 px-5 py-2.5 text-sm font-semibold text-amber-200 hover:bg-amber-900/50 hover:border-amber-500/60 transition-colors"
            >
              <ScrollText className="w-4 h-4" />
              Avaa Rajaseudun Kronikka — maailmankirja &amp; kodeksi
            </Link>
          </div>
        </div>

        {/* How to play guide */}
        <div className="bg-slate-800/60 border border-amber-700/30 rounded-2xl p-5 mb-6 max-w-4xl mx-auto">
          <h2 className="text-amber-200 font-bold text-lg mb-1 text-center">📜 Näin pelaat</h2>
          <p className="text-stone-400 text-xs text-center mb-4">Joka vuoro käyt läpi 6 vaihetta järjestyksessä. Paina "Seuraava" siirtyäksesi vaiheesta toiseen.</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              { num: '1', icon: '🪙', title: 'Resurssit', desc: 'Saat automaattisesti kultaa ja miehiä omilta alueilta.', color: 'border-amber-700/40 bg-amber-900/10' },
              { num: '2', icon: '🃏', title: 'Kortit', desc: 'Nosta kortti pakasta. Pelaa kortteja kädestäsi bonusten saamiseksi.', color: 'border-purple-700/40 bg-purple-900/10' },
              { num: '3', icon: '🐴', title: 'Liikuta', desc: 'Klikkaa omaa aluettasi → valitse armeija → klikkaa viereistä aluetta.', color: 'border-green-700/40 bg-green-900/10' },
              { num: '4', icon: '⚔️', title: 'Taistelu', desc: 'Liiku vihollisen alueelle hyökätäksesi. Nopat ratkaisevat voittajan.', color: 'border-red-700/40 bg-red-900/10' },
              { num: '5', icon: '🏗️', title: 'Rakenna', desc: 'Rakenna leiri, markkina tai linnoitus omille alueilIesi.', color: 'border-blue-700/40 bg-blue-900/10' },
              { num: '6', icon: '🏁', title: 'Lopeta vuoro', desc: 'AI-vastustajat tekevät omat siirtonsa. Uusi vuoro alkaa.', color: 'border-stone-600/40 bg-stone-800/20' },
            ].map(step => (
              <div key={step.num} className={`rounded-xl border p-3 ${step.color}`}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xl leading-none">{step.icon}</span>
                  <span className="text-amber-100 font-bold text-sm">{step.num}. {step.title}</span>
                </div>
                <p className="text-stone-300 text-[11px] leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-700/50 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-center">
            <div className="bg-amber-900/20 rounded-lg p-2">
              <div className="text-base">🗺️</div>
              <div className="text-[10px] text-amber-200 font-bold">Valtaa pääkaupungit</div>
              <div className="text-[9px] text-stone-500">Sotilasvoitto</div>
            </div>
            <div className="bg-amber-900/20 rounded-lg p-2">
              <div className="text-base">💰</div>
              <div className="text-[10px] text-amber-200 font-bold">500 kultaa + Silkkitie</div>
              <div className="text-[9px] text-stone-500">Talousvoitto</div>
            </div>
            <div className="bg-amber-900/20 rounded-lg p-2">
              <div className="text-base">🔬</div>
              <div className="text-[10px] text-amber-200 font-bold">5 teknologiaa</div>
              <div className="text-[9px] text-stone-500">Teknologiavoitto</div>
            </div>
            <div className="bg-amber-900/20 rounded-lg p-2">
              <div className="text-base">🕊️</div>
              <div className="text-[10px] text-amber-200 font-bold">100 vaikutusvaltaa</div>
              <div className="text-[9px] text-stone-500">Diplomatiavoitto</div>
            </div>
            <div className="bg-amber-900/20 rounded-lg p-2">
              <div className="text-base">🏛️</div>
              <div className="text-[10px] text-amber-200 font-bold">60 arvovaltaa (Ihmeet)</div>
              <div className="text-[9px] text-stone-500">Kulttuurivoitto</div>
            </div>
          </div>
          
          {/* Ohjekirja link — reititinystävällinen (toimii myös HashRouterissa) */}
          <div className="mt-4 pt-3 border-t border-slate-700/50 grid gap-2 sm:grid-cols-2">
            <Link
              to="/ohjekirja"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-600/30 bg-slate-900/80 px-4 py-3 text-amber-200 hover:bg-slate-800 transition-colors text-sm"
            >
              <BookOpen className="w-4 h-4" />
              Sääntökirja (ohjeet)
            </Link>
            <Link
              to="/codex"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-amber-600/30 bg-slate-900/80 px-4 py-3 text-amber-200 hover:bg-slate-800 transition-colors text-sm"
            >
              <ScrollText className="w-4 h-4" />
              Maailman kronikka
            </Link>
          </div>
        </div>

        
        {/* Faction grid */}
        <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
          {factions.map(faction => {
            // Faction-specific stats
            const stats = {
              mongol: { cavalry: 5, economy: 2, defense: 2 },
              jin: { cavalry: 2, economy: 4, defense: 5 },
              song: { cavalry: 1, economy: 5, defense: 3 },
              xixia: { cavalry: 3, economy: 3, defense: 3 },
              khwarezm: { cavalry: 3, economy: 4, defense: 3 },
              rus: { cavalry: 2, economy: 3, defense: 4 },
              kipchak: { cavalry: 4, economy: 2, defense: 2 },
            }[faction.id];
            
            const difficulty = {
              mongol: 'Keskitaso',
              jin: 'Helppo',
              song: 'Helppo',
              xixia: 'Vaikea',
              khwarezm: 'Keskitaso',
              rus: 'Vaikea',
              kipchak: 'Erittäin vaikea',
            }[faction.id];
            
            const difficultyColor = {
              mongol: 'bg-amber-600',
              jin: 'bg-green-600',
              song: 'bg-green-600',
              xixia: 'bg-orange-600',
              khwarezm: 'bg-amber-600',
              rus: 'bg-orange-600',
              kipchak: 'bg-red-600',
            }[faction.id];
            
            return (
              <Card
                key={faction.id}
                className="relative overflow-hidden border-2 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer group"
                style={{
                  borderColor: `${faction.color}55`,
                  background: `linear-gradient(160deg, ${faction.color}22 0%, rgba(15,23,42,0.92) 45%, rgba(2,6,23,0.96) 100%)`,
                  boxShadow: `0 10px 30px -12px ${faction.color}55`,
                }}
                onClick={() => onSelect(faction.id)}
              >
                {/* Faktion värihehku hoverissa */}
                <div
                  className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full opacity-40 blur-2xl transition-opacity duration-300 group-hover:opacity-70"
                  style={{ backgroundColor: faction.color }}
                />
                <CardContent className="relative p-4">
                  {/* Header: johtajakuva + nimi */}
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl shadow-lg ring-2 transition-transform group-hover:scale-105"
                      style={{ ['--tw-ring-color' as string]: `${faction.color}`, boxShadow: `0 0 22px ${faction.color}55` }}
                    >
                      <img
                        src={LEADER_ART[faction.id]}
                        alt={faction.ruler}
                        draggable={false}
                        className="h-full w-full object-cover object-top select-none pointer-events-none"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-amber-100 leading-tight truncate">{faction.name}</h3>
                      <p className="text-sm text-stone-400 truncate">{faction.ruler}</p>
                    </div>
                    <Badge className={difficultyColor}>{difficulty}</Badge>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-stone-800/50 rounded-lg p-2 text-center">
                      <Sword className="w-4 h-4 text-red-400 mx-auto mb-1" />
                      <div className="flex justify-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <div 
                            key={i}
                            className={`w-2 h-2 rounded-full ${i < stats.cavalry ? 'bg-red-400' : 'bg-stone-700'}`}
                          />
                        ))}
                      </div>
                      <div className="text-[10px] text-stone-500 mt-1">Ratsuväki</div>
                    </div>
                    <div className="bg-stone-800/50 rounded-lg p-2 text-center">
                      <Coins className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                      <div className="flex justify-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <div 
                            key={i}
                            className={`w-2 h-2 rounded-full ${i < stats.economy ? 'bg-amber-400' : 'bg-stone-700'}`}
                          />
                        ))}
                      </div>
                      <div className="text-[10px] text-stone-500 mt-1">Talous</div>
                    </div>
                    <div className="bg-stone-800/50 rounded-lg p-2 text-center">
                      <Shield className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                      <div className="flex justify-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <div 
                            key={i}
                            className={`w-2 h-2 rounded-full ${i < stats.defense ? 'bg-blue-400' : 'bg-stone-700'}`}
                          />
                        ))}
                      </div>
                      <div className="text-[10px] text-stone-500 mt-1">Puolustus</div>
                    </div>
                  </div>
                  
                  {/* Bonus */}
                  <div className="bg-stone-800/30 rounded-lg p-3 text-sm">
                    <div className="text-amber-400 font-semibold mb-1">Erityiskyky:</div>
                    <div className="text-stone-300 text-xs">
                      {faction.id === 'mongol' && '🐴 +30% ratsuväen hyökkäys, nopea liike'}
                      {faction.id === 'jin' && '🏯 +20% verot, vahvat linnoitukset'}
                      {faction.id === 'song' && '💰 +30% verot, vahva talous'}
                      {faction.id === 'xixia' && '⚖️ Tasapainoinen, +10% kaikki'}
                      {faction.id === 'khwarezm' && '🛤️ +20% Silkkitien tulot'}
                      {faction.id === 'rus' && '❄️ +10% puolustus, metsäbonus'}
                      {faction.id === 'kipchak' && '🐎 +20% ratsuväki, nopea liike'}
                    </div>
                  </div>

                  {/* Tarinallinen kuvaus */}
                  {FLAVOR[faction.id] && (
                    <p className="mt-3 border-l-2 pl-3 text-xs italic leading-relaxed text-stone-300/80"
                       style={{ borderColor: `${faction.color}88` }}>
                      {FLAVOR[faction.id]}
                    </p>
                  )}
                  
                  {/* Starting resources — kuvakkeilla */}
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-950/50 py-1.5 ring-1 ring-slate-700/50">
                      <img src={resGold} alt="kulta" className="h-5 w-4 object-contain" draggable={false} />
                      <span className="text-sm font-semibold text-amber-200 tabular-nums">{faction.treasury}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-950/50 py-1.5 ring-1 ring-slate-700/50">
                      <Users className="h-4 w-4 text-sky-300" />
                      <span className="text-sm font-semibold text-sky-100 tabular-nums">{faction.manpower}</span>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-950/50 py-1.5 ring-1 ring-slate-700/50">
                      <img src={resHorse} alt="hevoset" className="h-5 w-4 object-contain" draggable={false} />
                      <span className="text-sm font-semibold text-orange-200 tabular-nums">{faction.horses}</span>
                    </div>
                  </div>

                  {/* Valitse-kehote */}
                  <div
                    className="mt-4 rounded-xl py-2 text-center text-sm font-bold text-slate-900 opacity-90 transition-all group-hover:opacity-100"
                    style={{ backgroundColor: faction.color }}
                  >
                    Johda {faction.name.split(' ')[0]} ▶
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Info */}
        <div className="text-center mt-8 text-stone-500 text-sm">
          <p>Klikkaa valtakuntaa aloittaaksesi pelin</p>
        </div>
      </div>
    </div>
  );
};

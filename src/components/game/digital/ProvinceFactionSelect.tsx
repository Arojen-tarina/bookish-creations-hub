/**
 * ProvinceFactionSelect.tsx — Valtakunnanvalinta (provinssipeli, vuosi 1206)
 *
 * Näyttää 7 pelattavaa valtakuntaa (mongoli, Jin, Song, Xixia, Khwarezm, Rus, Kipchak)
 * tilastoineen (ratsuväki, talous, puolustus) ja vaikeustasoineen.
 */
import { FactionId, FACTION_DATA_1206 } from '@/types/province';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Sword, Coins, Shield, Users } from 'lucide-react';

interface ProvinceFactionSelectProps {
  onSelect: (factionId: FactionId) => void;
}

export const ProvinceFactionSelect = ({ onSelect }: ProvinceFactionSelectProps) => {
  const factions = Object.values(FACTION_DATA_1206);
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-950 via-amber-950/20 to-slate-950 p-4 overflow-auto">
      {/* Background effects */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(ellipse at 30% 20%, rgba(251, 191, 36, 0.15) 0%, transparent 50%),
                       radial-gradient(ellipse at 70% 80%, rgba(180, 83, 9, 0.1) 0%, transparent 50%)`,
        }}
      />
      
      <div className="relative z-10 max-w-5xl w-full">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-amber-100 mb-2">
            Mongolien Valtakunta
          </h1>
          <p className="text-amber-200/60 text-lg">
            Vuosi 1206 — Valitse valtakuntasi
          </p>
        </div>
        
        {/* Faction grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                className="bg-slate-900/80 border-2 transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
                style={{ borderColor: `${faction.color}40` }}
                onClick={() => onSelect(faction.id)}
              >
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                      style={{ 
                        backgroundColor: faction.color,
                        boxShadow: `0 0 20px ${faction.color}50`,
                      }}
                    >
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-amber-100">{faction.name}</h3>
                      <p className="text-sm text-stone-400">{faction.ruler}</p>
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
                  
                  {/* Starting resources */}
                  <div className="flex justify-center gap-4 mt-4 text-xs text-stone-400">
                    <span>💰 {faction.treasury}</span>
                    <span>👥 {faction.manpower}</span>
                    <span>🐴 {faction.horses}</span>
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

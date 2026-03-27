/**
 * FactionSelect.tsx — Heimonvalintanäkymä (vanha heksilauta-versio)
 *
 * Näyttää 4 heimoa (mongoli, Kiina, Persia, Venäjä) kortteina
 * aloitusjoukkoineen ja voittoehtojen kera. Käytetään MongolianGame-komponentissa.
 */
import { FactionId, FACTIONS, AI_PERSONALITIES } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Swords, Shield, Users, Coins, TreePine, Castle, Compass } from 'lucide-react';

interface FactionSelectProps {
  onSelect: (faction: FactionId) => void;
}

const factionIcons: Record<FactionId, React.ReactNode> = {
  mongol: <Compass className="w-10 h-10" />,
  china: <Castle className="w-10 h-10" />,
  persia: <Coins className="w-10 h-10" />,
  russia: <TreePine className="w-10 h-10" />,
};

const factionBackgrounds: Record<FactionId, string> = {
  mongol: 'from-amber-900/90 to-amber-950/90',
  china: 'from-red-900/90 to-red-950/90',
  persia: 'from-blue-900/90 to-blue-950/90',
  russia: 'from-green-900/90 to-green-950/90',
};

export const FactionSelect = ({ onSelect }: FactionSelectProps) => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      {/* Title with dramatic styling */}
      <div className="text-center mb-12">
        <div className="relative inline-block">
          <h1 className="text-5xl md:text-7xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 mb-2">
            Mongolien Valtakunta
          </h1>
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-600/20 via-transparent to-amber-600/20 blur-xl -z-10" />
        </div>
        <p className="text-xl text-amber-200/80 max-w-2xl mx-auto mt-4">
          Valitse heimosi ja johda sitä valloittamaan Silkkitie
        </p>
        <div className="flex items-center justify-center gap-4 mt-4 text-amber-300/60 text-sm">
          <span>⚔️ Strategiapeli</span>
          <span>•</span>
          <span>🎲 30 vuoroa</span>
          <span>•</span>
          <span>🏆 4 voittotietä</span>
        </div>
      </div>
      
      {/* Faction cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl w-full">
        {(Object.entries(FACTIONS) as [FactionId, typeof FACTIONS[FactionId]][]).map(([id, faction]) => {
          const personality = AI_PERSONALITIES[id === 'mongol' ? 'aggressive' : id === 'china' ? 'defensive' : id === 'persia' ? 'economic' : 'balanced'];
          
          return (
            <Card 
              key={id}
              className={`relative overflow-hidden bg-gradient-to-br ${factionBackgrounds[id]} border-2 hover:scale-105 transition-all duration-300 cursor-pointer group`}
              style={{ borderColor: `${faction.color}66` }}
              onClick={() => onSelect(id)}
            >
              {/* Glow effect on hover */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ 
                  background: `radial-gradient(ellipse at center, ${faction.color}22 0%, transparent 70%)`,
                }}
              />
              
              {/* Top color bar */}
              <div 
                className="absolute top-0 left-0 right-0 h-1 group-hover:h-2 transition-all"
                style={{ backgroundColor: faction.color }}
              />
              
              <CardHeader className="text-center pt-8 relative">
                {/* Faction icon */}
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform"
                  style={{ 
                    backgroundColor: faction.color,
                    boxShadow: `0 0 30px ${faction.color}66`,
                  }}
                >
                  <span className="text-white">{factionIcons[id]}</span>
                </div>
                
                <CardTitle className="text-2xl text-white">{faction.name}</CardTitle>
                <CardDescription className="text-lg" style={{ color: `${faction.color}cc` }}>
                  {faction.bonus}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="text-center pb-8 relative">
                <p className="text-sm text-white/60 mb-6 min-h-[3rem]">
                  {faction.bonusDescription}
                </p>
                
                {/* Starting info */}
                <div className="border-t border-white/10 pt-4 mb-6">
                  <p className="text-xs text-white/40 mb-3 uppercase tracking-wide">Aloitusjoukot</p>
                  <div className="flex justify-center gap-4 text-white/70">
                    <div className="text-center">
                      <span className="text-2xl">🐎</span>
                      <p className="text-xs">×3</p>
                    </div>
                    <div className="text-center">
                      <span className="text-2xl">⚔️</span>
                      <p className="text-xs">×2</p>
                    </div>
                    <div className="text-center">
                      <span className="text-2xl">👑</span>
                      <p className="text-xs">×1</p>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full font-bold text-lg py-6 shadow-xl group-hover:shadow-2xl transition-all"
                  style={{ 
                    backgroundColor: faction.color,
                    color: 'white',
                  }}
                >
                  <Crown className="w-5 h-5 mr-2" />
                  Valitse
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Instructions */}
      <div className="mt-12 text-center text-amber-200/50 text-sm max-w-2xl">
        <p className="mb-2">
          <strong>Voittoehdot:</strong> Valloita 60% alueista (sotilaallinen), kerää 50 pistettä ja 5 Silkkitien provinssia (taloudellinen), tai eliminoi kaikki vastustajat.
        </p>
        <p>
          Peli on vuoropohjainen strategiapeli jossa johdat heimoasi valloittamaan Aasian stepin.
        </p>
      </div>
    </div>
  );
};

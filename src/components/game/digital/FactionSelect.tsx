import { FactionId, FACTIONS } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Swords, Shield, Users } from 'lucide-react';

interface FactionSelectProps {
  onSelect: (faction: FactionId) => void;
}

const factionIcons: Record<FactionId, React.ReactNode> = {
  mongol: <Crown className="w-8 h-8" />,
  china: <Shield className="w-8 h-8" />,
  persia: <Swords className="w-8 h-8" />,
  russia: <Users className="w-8 h-8" />,
};

export const FactionSelect = ({ onSelect }: FactionSelectProps) => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-display font-bold text-amber-100 mb-4">
          Mongolien Valtakunta
        </h1>
        <p className="text-xl text-amber-200/80 max-w-2xl mx-auto">
          Valitse heimosi ja johda sitä kohti voittoa
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl w-full">
        {(Object.entries(FACTIONS) as [FactionId, typeof FACTIONS[FactionId]][]).map(([id, faction]) => (
          <Card 
            key={id}
            className="relative overflow-hidden bg-gradient-to-br from-amber-900/40 to-amber-950/60 border-amber-700/50 hover:border-amber-500 transition-all cursor-pointer group"
            onClick={() => onSelect(id)}
          >
            <div 
              className="absolute top-0 left-0 right-0 h-2 transition-all group-hover:h-3"
              style={{ backgroundColor: faction.color }}
            />
            
            <CardHeader className="text-center pt-6">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 transition-transform group-hover:scale-110"
                style={{ backgroundColor: faction.color }}
              >
                <span className="text-white">{factionIcons[id]}</span>
              </div>
              <CardTitle className="text-amber-100">{faction.name}</CardTitle>
              <CardDescription className="text-amber-200/70">{faction.bonus}</CardDescription>
            </CardHeader>
            
            <CardContent className="text-center pb-6">
              <p className="text-sm text-amber-100/60 mb-4">
                {faction.bonusDescription}
              </p>
              
              <div className="border-t border-amber-700/30 pt-4 mt-4">
                <p className="text-xs text-amber-200/50 mb-2">ALKUSETUP:</p>
                <ul className="text-xs text-amber-100/60 space-y-1">
                  <li>🐎 3 ratsuväkiyksikköä</li>
                  <li>⚔️ 2 jalkaväkiyksikköä</li>
                  <li>👑 1 heimopäällikkö</li>
                </ul>
              </div>
              
              <Button 
                className="mt-4 w-full"
                style={{ 
                  backgroundColor: faction.color,
                  color: 'white',
                }}
              >
                Valitse {faction.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

import { GameState, FACTIONS, RESOURCE_INFO, TERRAIN_INFO, GamePhase } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ScrollText, 
  Swords, 
  Building, 
  Sparkles, 
  ArrowRight,
  Trophy,
  Map,
  Users,
  RotateCcw
} from 'lucide-react';

interface GameUIProps {
  gameState: GameState;
  onEndPhase: () => void;
  onReset: () => void;
}

const PHASE_INFO: Record<GamePhase, { name: string; icon: React.ReactNode; description: string }> = {
  planning: { 
    name: 'Suunnitteluvaihe', 
    icon: <ScrollText className="w-5 h-5" />,
    description: 'Valitse strategiasi tälle vuorolle',
  },
  action: { 
    name: 'Toimintavaihe', 
    icon: <Swords className="w-5 h-5" />,
    description: 'Liikuta yksiköitä ja hyökkää',
  },
  management: { 
    name: 'Hallintovaihe', 
    icon: <Building className="w-5 h-5" />,
    description: 'Kerää resurssit alueiltasi',
  },
  event: { 
    name: 'Tapahtumavaihe', 
    icon: <Sparkles className="w-5 h-5" />,
    description: 'Satunnaiset tapahtumat',
  },
};

export const GameUI = ({ gameState, onEndPhase, onReset }: GameUIProps) => {
  const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
  if (!currentPlayer) return null;
  
  const faction = FACTIONS[currentPlayer.factionId];
  const phaseInfo = PHASE_INFO[gameState.currentPhase];
  
  const selectedHex = gameState.hexes.find(h => h.id === gameState.selectedHexId);
  const selectedUnit = gameState.units.find(u => u.id === gameState.selectedUnitId);
  
  return (
    <div className="space-y-4">
      {/* Victory screen */}
      {gameState.gameOver && (
        <Card className="bg-gradient-to-br from-amber-600/90 to-amber-800/90 border-amber-400 text-white">
          <CardHeader className="text-center">
            <Trophy className="w-16 h-16 mx-auto mb-2 text-amber-200" />
            <CardTitle className="text-2xl">Peli päättyi!</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-xl mb-4">{gameState.winCondition}</p>
            <Button onClick={onReset} variant="secondary" className="mt-2">
              <RotateCcw className="w-4 h-4 mr-2" />
              Pelaa uudestaan
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Turn and Phase indicator */}
      <Card className="bg-amber-950/50 border-amber-700/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Badge 
                variant="outline" 
                className="text-amber-200 border-amber-500"
              >
                Vuoro {gameState.turn}
              </Badge>
              <span 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: faction.color }}
              />
              <span className="text-amber-100 font-semibold">{faction.name}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-amber-200 mb-2">
            {phaseInfo.icon}
            <span className="font-bold">{phaseInfo.name}</span>
          </div>
          <p className="text-sm text-amber-200/60 mb-3">{phaseInfo.description}</p>
          
          <Button 
            onClick={onEndPhase}
            className="w-full bg-amber-600 hover:bg-amber-500 text-white"
            disabled={gameState.gameOver}
          >
            Seuraava vaihe
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
      
      {/* Resources */}
      <Card className="bg-amber-950/50 border-amber-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-amber-100 text-lg flex items-center gap-2">
            <Building className="w-5 h-5" />
            Resurssit
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {(Object.entries(currentPlayer.resources) as [keyof typeof RESOURCE_INFO, number][]).map(([key, value]) => (
              <div key={key} className="text-center">
                <span className="text-2xl">{RESOURCE_INFO[key].emoji}</span>
                <p className="text-lg font-bold text-amber-100">{value}</p>
                <p className="text-xs text-amber-200/60">{RESOURCE_INFO[key].name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Stats */}
      <Card className="bg-amber-950/50 border-amber-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-amber-100 text-lg flex items-center gap-2">
            <Map className="w-5 h-5" />
            Tilastot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-amber-200/70">Alueet:</span>
              <span className="text-amber-100 font-bold">{currentPlayer.territoriesControlled}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-200/70">Kaupungit:</span>
              <span className="text-amber-100 font-bold">{currentPlayer.citiesControlled}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-200/70">Kauppareitit:</span>
              <span className="text-amber-100 font-bold">{currentPlayer.tradeRoutes}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-amber-200/70">Voittopisteet:</span>
              <span className="text-amber-100 font-bold">{currentPlayer.victoryPoints}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Selected hex info */}
      {selectedHex && (
        <Card className="bg-amber-950/50 border-amber-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-100 text-lg">
              {TERRAIN_INFO[selectedHex.terrain].emoji} {selectedHex.regionName}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-amber-200/70">
            <p>Maasto: {TERRAIN_INFO[selectedHex.terrain].name}</p>
            <p>Omistaja: {selectedHex.ownerId ? FACTIONS[selectedHex.ownerId].name : 'Ei omistajaa'}</p>
            {selectedHex.hasCity && <p>🏰 Kaupunki</p>}
            {selectedHex.hasFortress && <p>🏯 Linnoitus</p>}
            {selectedHex.hasTradeRoute && <p>🛤️ Kauppareitti</p>}
            
            {selectedUnit && (
              <div className="mt-2 pt-2 border-t border-amber-700/30">
                <p className="text-amber-100 font-semibold">Valittu yksikkö:</p>
                <p>{selectedUnit.type} (HP: {selectedUnit.health}/{selectedUnit.maxHealth})</p>
                <p>Liikkumista jäljellä: {selectedUnit.movementLeft}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Combat log */}
      {gameState.combatLog.length > 0 && (
        <Card className="bg-amber-950/50 border-amber-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-amber-100 text-lg flex items-center gap-2">
              <Swords className="w-5 h-5" />
              Taisteluloki
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {gameState.combatLog.slice(-5).reverse().map(entry => (
                  <div key={entry.id} className="text-xs text-amber-200/70 border-b border-amber-700/30 pb-2">
                    <p className="text-amber-100">
                      Vuoro {entry.turn}: {FACTIONS[entry.attackerId].name} vs {FACTIONS[entry.defenderId].name}
                    </p>
                    <p>Nopat: [{entry.attackerRolls.join(', ')}] vs [{entry.defenderRolls.join(', ')}]</p>
                    <p>Tulos: {entry.result === 'attacker_wins' ? 'Hyökkääjä voitti' : entry.result === 'defender_wins' ? 'Puolustaja voitti' : 'Tasapeli'}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
      
      {/* Players list */}
      <Card className="bg-amber-950/50 border-amber-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-amber-100 text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Pelaajat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {gameState.players.map(player => {
              const playerFaction = FACTIONS[player.factionId];
              const isCurrentPlayer = player.id === gameState.currentPlayerId;
              const unitCount = gameState.units.filter(u => u.factionId === player.factionId).length;
              
              return (
                <div 
                  key={player.id}
                  className={`flex items-center justify-between p-2 rounded ${isCurrentPlayer ? 'bg-amber-800/30' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: playerFaction.color }}
                    />
                    <span className={`text-sm ${isCurrentPlayer ? 'text-amber-100 font-bold' : 'text-amber-200/70'}`}>
                      {playerFaction.name}
                    </span>
                    {player.isAI && (
                      <Badge variant="outline" className="text-xs border-amber-600/50 text-amber-300">AI</Badge>
                    )}
                  </div>
                  <span className="text-xs text-amber-200/60">
                    {unitCount} yksiköitä
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      <Button 
        onClick={onReset}
        variant="outline"
        className="w-full border-amber-700/50 text-amber-200 hover:bg-amber-900/30"
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Aloita alusta
      </Button>
    </div>
  );
};

import { useGameState } from '@/hooks/useGameState';
import { FactionSelect } from './FactionSelect';
import { HexGrid } from './HexGrid';
import { GameUI } from './GameUI';

export const MongolianGame = () => {
  const { 
    gameStarted, 
    playerFaction, 
    gameState, 
    startGame, 
    selectHex, 
    endPhase,
    resetGame,
  } = useGameState();

  if (!gameStarted || !playerFaction) {
    return <FactionSelect onSelect={startGame} />;
  }

  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-amber-200">Ladataan peliä...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-[1fr_350px] gap-6">
        {/* Game board */}
        <div>
          <div className="mb-4">
            <h2 className="text-2xl font-display font-bold text-amber-100 mb-2">
              Pelilauta
            </h2>
            <p className="text-sm text-amber-200/70">
              Klikkaa heksagonia valitaksesi sen. Valitse yksikkö ja klikkaa vihreää heksagonia liikkuaksesi.
            </p>
          </div>
          
          <HexGrid
            hexes={gameState.hexes}
            units={gameState.units}
            selectedHexId={gameState.selectedHexId}
            availableMoves={gameState.availableMoves}
            onHexClick={selectHex}
            playerFaction={playerFaction}
          />
          
          {/* Legend */}
          <div className="mt-4 p-4 bg-amber-950/30 rounded-lg border border-amber-700/30">
            <h3 className="text-sm font-semibold text-amber-100 mb-2">Selite:</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-xs text-amber-200/70">
              <div>🌾 Steppi</div>
              <div>⛰️ Vuoristo</div>
              <div>🌲 Metsä</div>
              <div>🏜️ Autiomaa</div>
              <div>🏞️ Jokilaakso</div>
              <div>🏰 Kaupunki</div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs text-amber-200/70 mt-2">
              <div>🐎 Ratsuväki</div>
              <div>⚔️ Jalkaväki</div>
              <div>👑 Johtaja</div>
            </div>
          </div>
        </div>
        
        {/* Game UI sidebar */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <GameUI 
            gameState={gameState} 
            onEndPhase={endPhase}
            onReset={resetGame}
          />
        </div>
      </div>
    </div>
  );
};

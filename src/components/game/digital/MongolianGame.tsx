import { useGameState } from '@/hooks/useGameState';
import { FactionSelect } from './FactionSelect';
import { TabletopBoard } from './TabletopBoard';
import { GameUI } from './GameUI';
import { TERRAIN_INFO, FACTIONS } from '@/types/game';

export const MongolianGame = () => {
  const { 
    gameStarted, 
    playerFaction, 
    gameState, 
    startGame, 
    selectHex, 
    endPhase,
    resetGame,
    buildStructure,
    recruitUnit,
    resolveEvent,
    rotateCameraLeft,
    rotateCameraRight,
  } = useGameState();

  if (!gameStarted || !playerFaction) {
    return <FactionSelect onSelect={startGame} />;
  }

  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-amber-200">Ladataan peliä...</p>
        </div>
      </div>
    );
  }

  const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
  const faction = currentPlayer ? FACTIONS[currentPlayer.factionId] : FACTIONS.mongol;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Game header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-3 bg-amber-950/50 px-6 py-3 rounded-full border border-amber-700/50">
          <span 
            className="w-4 h-4 rounded-full animate-pulse"
            style={{ backgroundColor: faction.color, boxShadow: `0 0 10px ${faction.color}` }}
          />
          <h2 className="text-xl font-display font-bold text-amber-100">
            {faction.name}n vuoro
          </h2>
          <span className="text-amber-300/70">|</span>
          <span className="text-amber-200/70">Vuoro {gameState.turn}/{gameState.maxTurns}</span>
        </div>
      </div>
      
      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* Game board */}
        <div>
          <TabletopBoard
            hexes={gameState.hexes}
            units={gameState.units}
            buildings={gameState.buildings}
            selectedHexId={gameState.selectedHexId}
            availableMoves={gameState.availableMoves}
            onHexClick={selectHex}
            playerFaction={playerFaction}
            cameraAngle={gameState.cameraAngle}
          />
          
          {/* Legend */}
          <div className="mt-4 p-4 bg-gradient-to-r from-amber-950/50 to-stone-950/50 rounded-xl border border-amber-700/30">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-amber-100 mb-2">Maastot:</h3>
                <div className="flex flex-wrap gap-3 text-xs text-amber-200/70">
                  {Object.entries(TERRAIN_INFO).map(([key, info]) => (
                    <div key={key} className="flex items-center gap-1">
                      <span 
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: info.color }}
                      />
                      <span>{info.emoji} {info.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-amber-100 mb-2">Heimot:</h3>
                <div className="flex flex-wrap gap-3 text-xs text-amber-200/70">
                  {Object.entries(FACTIONS).map(([key, info]) => (
                    <div key={key} className="flex items-center gap-1">
                      <span 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: info.color }}
                      />
                      <span>{info.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Instructions based on phase */}
          <div className="mt-4 p-3 bg-stone-900/50 rounded-lg border border-stone-700/50 text-sm text-stone-300">
            {gameState.currentPhase === 'planning' && (
              <p>📜 <strong>Suunnitteluvaihe:</strong> Tarkastele tilannetta ja suunnittele seuraavat siirtosi. Klikkaa "Seuraava vaihe" jatkaaksesi.</p>
            )}
            {gameState.currentPhase === 'action' && (
              <p>⚔️ <strong>Toimintavaihe:</strong> Klikkaa omaa yksikköäsi valitaksesi sen, sitten klikkaa vihreää heksagonia liikkuaksesi tai hyökätäksesi. Voit myös rekrytoida uusia yksiköitä.</p>
            )}
            {gameState.currentPhase === 'building' && (
              <p>🔨 <strong>Rakennusvaihe:</strong> Klikkaa hallitsemaasi aluetta nähdäksesi rakennusvaihtoehdot. Rakennukset tuottavat resursseja ja puolustusta.</p>
            )}
            {gameState.currentPhase === 'event' && (
              <p>✨ <strong>Tapahtumavaihe:</strong> Satunnainen tapahtuma vaikuttaa peliin. Suorita tapahtuma jatkaaksesi.</p>
            )}
            {gameState.currentPhase === 'management' && (
              <p>🏛️ <strong>Hallintovaihe:</strong> Resurssit kerätään automaattisesti hallitsemiltasi alueilta.</p>
            )}
          </div>
        </div>
        
        {/* Game UI sidebar */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <GameUI 
            gameState={gameState} 
            onEndPhase={endPhase}
            onReset={resetGame}
            onBuild={buildStructure}
            onRecruit={recruitUnit}
            onResolveEvent={resolveEvent}
            onRotateLeft={rotateCameraLeft}
            onRotateRight={rotateCameraRight}
          />
        </div>
      </div>
    </div>
  );
};

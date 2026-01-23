import { useState, useRef, useCallback, useEffect } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useSaveManager } from '@/hooks/useSaveManager';
import { FactionSelect } from './FactionSelect';
import { TabletopBoard } from './TabletopBoard';
import { GameUI } from './GameUI';
import { GameHUD } from './GameHUD';
import { SaveLoadMenu } from './SaveLoadMenu';
import { TERRAIN_INFO, FACTIONS } from '@/types/game';
import { Maximize2, Minimize2, Menu, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

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
  
  // Save manager
  const {
    saves,
    autosave,
    saveGame,
    loadGame,
    loadAutosave,
    deleteGame,
    autoSave,
    exportSave,
    importSave,
    hasContinueGame,
    continueGame,
  } = useSaveManager();
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showLegend, setShowLegend] = useState(false);
  const [showSaveMenu, setShowSaveMenu] = useState(false);
  const [showLoadMenu, setShowLoadMenu] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-save when turn changes
  useEffect(() => {
    if (gameState && gameState.turn > 1 && !gameState.gameOver) {
      // Convert to ProvinceGameState format for save (simplified for now)
      // In production, would need proper state conversion
    }
  }, [gameState?.turn]);

  // Fullscreen API handlers
  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
    }
  }, []);

  // Listen for fullscreen changes (ESC key exits)
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!gameStarted || !playerFaction) {
    return <FactionSelect onSelect={startGame} />;
  }

  if (!gameState) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-950 via-amber-950/30 to-slate-950">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-amber-500/30" />
            <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
            <div className="absolute inset-2 rounded-full border-2 border-amber-400/50 border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <p className="text-xl text-amber-200 font-display animate-pulse">Ladataan peliä...</p>
        </div>
      </div>
    );
  }

  const currentPlayer = gameState.players.find(p => p.id === gameState.currentPlayerId);
  const faction = currentPlayer ? FACTIONS[currentPlayer.factionId] : FACTIONS.mongol;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 w-screen min-h-[100dvh] overflow-hidden bg-slate-950"
      style={{ height: '100dvh' }}
    >
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-amber-950/20 to-slate-950" />
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(ellipse at 30% 20%, rgba(251, 191, 36, 0.15) 0%, transparent 50%),
                       radial-gradient(ellipse at 70% 80%, rgba(180, 83, 9, 0.1) 0%, transparent 50%),
                       radial-gradient(ellipse at 50% 50%, rgba(30, 41, 59, 0.8) 0%, transparent 100%)`,
        }}
      />
      
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 200px 60px rgba(0,0,0,0.7)',
        }}
      />

      {/* Top HUD bar */}
      <GameHUD 
        gameState={gameState}
        faction={faction}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
        onToggleLegend={() => setShowLegend(!showLegend)}
        onOpenSaveMenu={() => setShowSaveMenu(true)}
        onOpenLoadMenu={() => setShowLoadMenu(true)}
        showSidebar={showSidebar}
      />

      {/* Main game area */}
      <div className="relative h-full pt-16 pb-4 flex">
        {/* Game board - centered */}
        <div className={`flex-1 relative transition-all duration-300 ${showSidebar ? 'lg:mr-[360px]' : ''}`}>
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl h-full flex flex-col">
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
            </div>
          </div>
          
          {/* Phase instruction toast */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
            <div className="bg-slate-900/90 backdrop-blur-md border border-amber-700/30 rounded-xl px-6 py-3 shadow-2xl">
              {gameState.currentPhase === 'planning' && (
                <p className="text-amber-100/90 text-sm">📜 <strong>Suunnitteluvaihe</strong> — Tarkastele tilannetta</p>
              )}
              {gameState.currentPhase === 'action' && (
                <p className="text-amber-100/90 text-sm">⚔️ <strong>Toimintavaihe</strong> — Liikuta yksiköitä tai hyökkää</p>
              )}
              {gameState.currentPhase === 'building' && (
                <p className="text-amber-100/90 text-sm">🔨 <strong>Rakennusvaihe</strong> — Rakenna linnoituksia</p>
              )}
              {gameState.currentPhase === 'event' && (
                <p className="text-amber-100/90 text-sm">✨ <strong>Tapahtumavaihe</strong> — Satunnainen tapahtuma</p>
              )}
              {gameState.currentPhase === 'management' && (
                <p className="text-amber-100/90 text-sm">🏛️ <strong>Hallintovaihe</strong> — Resurssit kerätään</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Sidebar panel */}
        <div 
          className={`fixed top-16 right-0 bottom-0 w-[360px] bg-slate-900/95 backdrop-blur-xl border-l border-amber-700/20 shadow-2xl transition-transform duration-300 z-20 overflow-hidden ${
            showSidebar ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="h-full overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-amber-700/30 scrollbar-track-transparent">
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

      {/* Legend overlay */}
      {showLegend && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900/95 border border-amber-700/30 rounded-2xl p-6 max-w-2xl w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-display font-bold text-amber-100">Pelin selitykset</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowLegend(false)} className="text-amber-200 hover:bg-amber-900/30">
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-amber-100 mb-3">Maastot</h4>
                <div className="space-y-2">
                  {Object.entries(TERRAIN_INFO).map(([key, info]) => (
                    <div key={key} className="flex items-center gap-3 bg-slate-800/50 rounded-lg px-3 py-2">
                      <span 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: info.color }}
                      />
                      <span className="text-lg">{info.emoji}</span>
                      <span className="text-amber-200/80 text-sm">{info.name}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-semibold text-amber-100 mb-3">Heimot</h4>
                <div className="space-y-2">
                  {Object.entries(FACTIONS).map(([key, info]) => (
                    <div key={key} className="flex items-center gap-3 bg-slate-800/50 rounded-lg px-3 py-2">
                      <span 
                        className="w-4 h-4 rounded-full shadow-lg"
                        style={{ backgroundColor: info.color, boxShadow: `0 0 10px ${info.color}40` }}
                      />
                      <span className="text-amber-200/80 text-sm">{info.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-amber-700/20 text-center">
              <p className="text-amber-200/60 text-xs">Paina ESC poistuaksesi koko näytön tilasta</p>
            </div>
          </div>
        </div>
      )}

      {/* Save/Load Menus - disabled for now since we need to convert state format */}
      {/* TODO: Implement proper state conversion for province-based game */}

      {/* Back to home link - subtle */}
      <Link 
        to="/"
        className="fixed bottom-4 left-4 z-30 flex items-center gap-2 text-amber-200/50 hover:text-amber-200 transition-colors text-sm group"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span className="opacity-0 group-hover:opacity-100 transition-opacity">Etusivulle</span>
      </Link>
    </div>
  );
};

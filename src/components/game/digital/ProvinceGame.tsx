/**
 * ProvinceGame.tsx — Digipelin pääkomponentti (provinssipohjainen)
 *
 * Kokoaa koko digitaalisen strategiapelin:
 * - Valtakunnanvalinta (ProvinceFactionSelect)
 * - 3D-kartta (GameBoard3D) + GeoJSON-kartta (GeoProvinceMap)
 * - HUD: resurssit, vuoro, vaihe, kontrollit
 * - Sivupaneeli: provinssitiedot, diplomatia, ääni, loki
 * - Taistelunäkymä (BattleDisplay), tapahtumat (EventCard)
 * - Vuoronvaihtoanimaatiot (TurnTransition), tutoriaali (Tutorial)
 * - Tekoälydiplomatia (useDiplomacyAI), ääniefektit (useElevenLabsSFX)
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { useProvinceGameState } from '@/hooks/useProvinceGameState';
import { useAudioManager } from '@/hooks/useAudioManager';
import { useSaveManager } from '@/hooks/useSaveManager';
import { useDiplomacyAI } from '@/hooks/useDiplomacyAI';
import { useElevenLabsSFX, GAME_SFX, GameSFXKey } from '@/hooks/useElevenLabsSFX';
import { useTurnLog, createLogMessage } from '@/hooks/useTurnLog';
import { ProvinceFactionSelect } from './ProvinceFactionSelect';
import { GameBoard3D } from './GameBoard3D';
import { ProvinceInfoPanel } from './ProvinceInfoPanel';
import { DiplomacyPanel } from './DiplomacyPanel';
import { AudioSettings } from './AudioSettings';
import { BattleDisplay, BattleResult } from './BattleDisplay';
import { EventCard, getRandomEvent, GAME_EVENTS } from './EventCard';
import { Tutorial, TutorialButton } from './Tutorial';
import { TurnTransition, TurnLog, TurnSummary } from './TurnTransition';
import { FACTION_DATA_1206, ActiveGameEvent, GamePhase } from '@/types/province';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Maximize2, 
  Minimize2, 
  ArrowLeft,
  Map,
  Handshake,
  Settings,
  ArrowRight,
  Clock,
  Crown,
  Coins,
  Users,
  Sword,
  RotateCcw,
  Trophy,
  Volume2,
  ScrollText,
  Target,
  Crosshair,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

export const ProvinceGame = () => {
  const {
    gameStarted,
    playerFaction,
    gameState,
    pendingBattle,
    clearBattle,
    startGame,
    selectProvince,
    selectArmy,
    moveArmy,
    endPhase,
    resetGame,
    proposeTreaty,
    breakTreaty,
    buildFort,
    recruitArmy,
    getArmiesInProvince,
    getPlayerFaction,
    canMoveTo,
  } = useProvinceGameState();
  
  const audio = useAudioManager();
  const { playGameSFX, isLoading: sfxLoading, preloadSounds } = useElevenLabsSFX({ 
    volume: audio.settings.sfxVolume * audio.settings.masterVolume,
    cacheEnabled: true 
  });
  const { calculateAIDiplomacy, evaluateTreatyProposal } = useDiplomacyAI();
  const { entries: logEntries, addEntry: addLogEntry, getEntriesForTurn } = useTurnLog();
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState('province');
  const [sfxEnabled, setSfxEnabled] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [activeEvent, setActiveEvent] = useState<ActiveGameEvent | null>(null);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(() => {
    return localStorage.getItem('mongolian_game_tutorial_seen') === 'true';
  });
  const [attackMode, setAttackMode] = useState(false);
  
  // Turn transition state
  const [showTurnTransition, setShowTurnTransition] = useState(false);
  const [showTurnSummary, setShowTurnSummary] = useState(false);
  const [isNewTurn, setIsNewTurn] = useState(false);
  const [lastTurnIncome, setLastTurnIncome] = useState(0);
  const [lastManpowerGain, setLastManpowerGain] = useState(0);
  
  const lastPhaseRef = useRef<string | null>(null);
  const lastTurnRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Show tutorial on first game start
  useEffect(() => {
    if (gameStarted && gameState && !hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, [gameStarted, hasSeenTutorial]);
  
  // Handle tutorial completion
  const handleTutorialComplete = useCallback(() => {
    setHasSeenTutorial(true);
    localStorage.setItem('mongolian_game_tutorial_seen', 'true');
    setShowTutorial(false);
  }, []);
  
  // Trigger random event in event phase
  useEffect(() => {
    if (!gameState || !playerFaction) return;
    
    if (gameState.phase === 'event' && !activeEvent) {
      // 40% chance for an event each turn
      if (Math.random() < 0.4) {
        const newEvent = getRandomEvent(playerFaction, gameState.turn);
        setActiveEvent(newEvent);
        if (sfxEnabled) {
          playGameSFX('turn_start');
        }
      }
    }
  }, [gameState?.phase, gameState?.turn]);
  
  // Handle event resolution
  const handleEventResolve = useCallback((choiceIndex: number) => {
    if (!activeEvent || !playerFaction) return;
    
    const choice = activeEvent.event.choices?.[choiceIndex];
    if (choice) {
      toast.success(`Valitsit: ${choice.text}`, {
        description: choice.effect,
      });
    }
    
    setActiveEvent(null);
  }, [activeEvent, playerFaction]);

  // Start ambient on game start + preload SFX
  useEffect(() => {
    if (gameStarted && gameState) {
      audio.playAmbient();
      // Preload commonly used sounds
      if (sfxEnabled) {
        preloadSounds(['steppe_wind', 'cavalry_charge', 'battle_win']);
      }
    }
    return () => audio.stopAmbient();
  }, [gameStarted, sfxEnabled]);
  
  // Turn and phase transition detection
  useEffect(() => {
    if (!gameState || !playerFaction) return;
    
    const currentPhase = gameState.phase;
    const currentTurn = gameState.turn;
    const prevPhase = lastPhaseRef.current;
    const prevTurn = lastTurnRef.current;
    
    // Detect new turn
    if (currentTurn > prevTurn && prevTurn > 0) {
      // Calculate income for summary
      const playerFactionData = gameState.factions.find(f => f.id === playerFaction);
      const ownedProvinces = gameState.provinces.filter(p => p.ownerId === playerFaction);
      const income = ownedProvinces.reduce((sum, p) => sum + p.baseTax, 0);
      const manpower = Math.floor(ownedProvinces.reduce((sum, p) => sum + p.baseManpower, 0) * 0.5);
      
      setLastTurnIncome(income);
      setLastManpowerGain(manpower);
      setIsNewTurn(true);
      setShowTurnTransition(true);
      
      // Log income
      addLogEntry({
        turn: currentTurn,
        phase: 'economy',
        type: 'income',
        message: createLogMessage.incomeCollected(income),
        details: `+${manpower} miesvoimaa kerätty`,
        factionId: playerFaction,
      });
    } else if (prevPhase && prevPhase !== currentPhase) {
      // Phase change within same turn
      setIsNewTurn(false);
      setShowTurnTransition(true);
    }
    
    lastPhaseRef.current = currentPhase;
    lastTurnRef.current = currentTurn;
    
    // AI Diplomacy processing at turn end (when phase changes from 'event' back to 'planning')
    if (prevPhase === 'event' && currentPhase === 'planning') {
      // Process each AI faction's diplomatic decisions
      gameState.factions.forEach(faction => {
        if (faction.id === playerFaction || faction.isPlayer) return;
        
        const aiDecisions = calculateAIDiplomacy(
          faction,
          gameState.factions,
          gameState.relations,
          gameState.provinces,
          gameState.turn
        );
        
        // Execute AI diplomatic decisions
        aiDecisions.forEach(decision => {
          if (decision.type === 'propose_treaty' && decision.targetFactionId && decision.treatyType) {
            // AI proposing treaty to player
            if (decision.targetFactionId === playerFaction) {
              const factionData = FACTION_DATA_1206[faction.id];
              toast.info(`${factionData.name} ehdottaa: ${decision.treatyType}`, {
                description: decision.reason,
                action: {
                  label: 'Hyväksy',
                  onClick: () => proposeTreaty(faction.id, decision.treatyType!),
                },
              });
              
              addLogEntry({
                turn: gameState.turn,
                phase: 'diplomacy',
                type: 'treaty',
                message: `${factionData.name} ehdotti sopimusta`,
                factionId: faction.id,
              });
            }
          } else if (decision.type === 'break_treaty' && decision.targetFactionId && decision.treatyType) {
            // AI breaking treaty
            if (decision.targetFactionId === playerFaction) {
              const factionData = FACTION_DATA_1206[faction.id];
              toast.warning(`${factionData.name} rikkoi sopimuksen: ${decision.treatyType}`, {
                description: decision.reason,
              });
              breakTreaty(faction.id, decision.treatyType!);
              
              addLogEntry({
                turn: gameState.turn,
                phase: 'diplomacy',
                type: 'treaty',
                message: createLogMessage.treatyBroken(decision.treatyType, factionData.name),
                factionId: faction.id,
              });
            }
          }
        });
      });
    }
  }, [gameState?.phase, gameState?.turn, addLogEntry]);
  
  // Play phase-specific sounds
  useEffect(() => {
    if (!sfxEnabled || !gameState) return;
    
    const phaseSFX: Record<string, GameSFXKey> = {
      military: 'battle_start',
      diplomacy: 'treaty_signed',
      event: 'turn_start',
    };
    
    const sfxKey = phaseSFX[gameState.phase];
    if (sfxKey) {
      playGameSFX(sfxKey);
    }
  }, [gameState?.phase, sfxEnabled]);

  // Fullscreen handlers
  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;
    audio.playClick();
    
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
  }, [audio]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle province click
  const handleProvinceClick = useCallback((provinceId: string) => {
    audio.playSelect();
    
    if (gameState?.selectedArmyId) {
      // Try to move selected army
      const canMove = canMoveTo(gameState.selectedArmyId, provinceId);
      if (canMove) {
        const army = gameState.armies.find(a => a.id === gameState.selectedArmyId);
        const fromProvince = gameState.provinces.find(p => p.id === army?.provinceId);
        const toProvince = gameState.provinces.find(p => p.id === provinceId);
        
        moveArmy(gameState.selectedArmyId, provinceId);
        audio.playConfirm();
        if (sfxEnabled) playGameSFX('cavalry_charge');
        
        // Log the movement
        if (army && fromProvince && toProvince) {
          addLogEntry({
            turn: gameState.turn,
            phase: gameState.phase,
            type: 'move',
            message: createLogMessage.armyMoved('Armeija', fromProvince.name, toProvince.name),
            factionId: playerFaction!,
          });
        }
        return;
      }
    }
    
    selectProvince(provinceId);
  }, [audio, gameState, canMoveTo, moveArmy, selectProvince, sfxEnabled, playGameSFX, addLogEntry, playerFaction]);

  // Handle end phase
  const handleEndPhase = useCallback(() => {
    audio.playTurnEnd();
    if (sfxEnabled) playGameSFX('turn_end');
    endPhase();
  }, [audio, endPhase, sfxEnabled, playGameSFX]);

  // Handle game start
  const handleStartGame = useCallback((factionId: typeof playerFaction) => {
    if (factionId) {
      audio.playConfirm();
      startGame(factionId);
    }
  }, [audio, startGame]);

  // Handle reset
  const handleReset = useCallback(() => {
    audio.stopAmbient();
    resetGame();
  }, [audio, resetGame]);

  // Faction select screen
  if (!gameStarted || !playerFaction) {
    return <ProvinceFactionSelect onSelect={handleStartGame} />;
  }

  // Loading
  if (!gameState) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-950 via-amber-950/30 to-slate-950">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-amber-500/30" />
            <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-xl text-amber-200 font-display animate-pulse">Ladataan karttaa...</p>
        </div>
      </div>
    );
  }

  const playerFactionData = getPlayerFaction();
  const selectedProvince = gameState.provinces.find(p => p.id === gameState.selectedProvinceId);
  const selectedProvinceArmies = selectedProvince ? getArmiesInProvince(selectedProvince.id) : [];
  
  // Get available moves for selected army - separate peaceful moves from attacks
  const selectedArmy = gameState.armies.find(a => a.id === gameState.selectedArmyId);
  
  // Calculate which provinces can be moved to (peaceful) vs attacked (has enemy)
  const { availableMoves, attackableProvinces } = (() => {
    if (!selectedArmy) return { availableMoves: [], attackableProvinces: [] };
    
    const moveable = gameState.provinces.filter(p => canMoveTo(selectedArmy.id, p.id));
    const peaceful: string[] = [];
    const attacks: string[] = [];
    
    moveable.forEach(province => {
      const hasEnemyArmy = gameState.armies.some(
        a => a.provinceId === province.id && a.ownerId !== selectedArmy.ownerId
      );
      const isEnemyTerritory = province.ownerId !== null && 
        province.ownerId !== selectedArmy.ownerId;
      
      if (hasEnemyArmy) {
        attacks.push(province.id);
      } else if (isEnemyTerritory) {
        // Enemy territory but no army - can capture peacefully
        attacks.push(province.id);
      } else {
        peaceful.push(province.id);
      }
    });
    
    return { availableMoves: peaceful, attackableProvinces: attacks };
  })();

  const phaseNames: Record<string, string> = {
    planning: 'Suunnittelu',
    military: 'Sotilaalliset',
    diplomacy: 'Diplomatia',
    economy: 'Talous',
    event: 'Tapahtumat',
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 w-screen min-h-[100dvh] overflow-hidden bg-slate-950"
      style={{ height: '100dvh' }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-amber-950/20 to-slate-950" />
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(ellipse at 30% 20%, rgba(251, 191, 36, 0.15) 0%, transparent 50%),
                       radial-gradient(ellipse at 70% 80%, rgba(180, 83, 9, 0.1) 0%, transparent 50%)`,
        }}
      />
      
      {/* Vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: 'inset 0 0 200px 60px rgba(0,0,0,0.7)' }}
      />

      {/* Top HUD */}
      <div className="fixed top-0 left-0 right-0 h-14 z-30">
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl border-b border-amber-700/20" />
        <div className="relative h-full flex items-center justify-between px-4">
          {/* Left - Faction & Year */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-800/50 rounded-xl px-3 py-1.5 border border-amber-700/20">
              <span 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: playerFactionData?.color }}
              />
              <span className="text-amber-100 font-bold hidden sm:block">
                {playerFactionData?.name}
              </span>
            </div>
            
            <div className="flex items-center gap-2 bg-slate-800/50 rounded-xl px-3 py-1.5 border border-amber-700/20">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-amber-200 font-mono">{gameState.year}</span>
              <span className="text-amber-200/50 text-sm">Vuoro {gameState.turn}</span>
            </div>
            
            <Badge className="bg-amber-600">{phaseNames[gameState.phase]}</Badge>
          </div>
          
          {/* Center - Resources */}
          {playerFactionData && (
            <div className="hidden md:flex items-center gap-3 bg-slate-800/30 rounded-xl px-3 py-1.5">
              <div className="flex items-center gap-1.5" title="Valtionkassa">
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="text-amber-100 font-bold">{playerFactionData.treasury}</span>
              </div>
              <div className="flex items-center gap-1.5" title="Miesvoima">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-blue-100 font-bold">{playerFactionData.manpower}</span>
              </div>
              <div className="flex items-center gap-1.5" title="Hevoset">
                <span className="text-lg">🐴</span>
                <span className="text-green-100 font-bold">{playerFactionData.horses}</span>
              </div>
            </div>
          )}
          
          {/* Right - Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="text-amber-200/70 hover:text-amber-200 hover:bg-amber-900/30"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </Button>
            
            <Button
              onClick={handleEndPhase}
              className="bg-amber-600 hover:bg-amber-500"
              disabled={gameState.gameOver}
            >
              Seuraava
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main game area */}
      <div className="relative h-full pt-14 flex">
        {/* Map */}
        <div className={`flex-1 relative transition-all duration-300 ${showSidebar ? 'lg:mr-[400px]' : ''}`}>
          <div className="absolute inset-0 p-2">
            <GameBoard3D
              provinces={gameState.provinces}
              armies={gameState.armies}
              selectedProvinceId={gameState.selectedProvinceId}
              selectedArmyId={gameState.selectedArmyId}
              onProvinceClick={handleProvinceClick}
              onArmyClick={selectArmy}
              playerFaction={playerFaction}
              highlightedProvinces={attackMode ? [] : availableMoves}
              attackableProvinces={attackableProvinces}
              attackModeActive={attackMode}
            />
          </div>
        </div>
        
        {/* Sidebar */}
        <div 
          className={`fixed top-14 right-0 bottom-0 w-[400px] bg-slate-900/95 backdrop-blur-xl border-l border-amber-700/20 shadow-2xl transition-transform duration-300 z-20 overflow-hidden ${
            showSidebar ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="h-full overflow-y-auto p-4 scrollbar-thin">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full bg-slate-800/50 mb-4 grid grid-cols-4">
                <TabsTrigger value="province" className="text-xs px-2">
                  <Map className="w-3.5 h-3.5 mr-1" />
                  Alue
                </TabsTrigger>
                <TabsTrigger value="log" className="text-xs px-2">
                  <ScrollText className="w-3.5 h-3.5 mr-1" />
                  Loki
                </TabsTrigger>
                <TabsTrigger value="diplomacy" className="text-xs px-2">
                  <Handshake className="w-3.5 h-3.5 mr-1" />
                  Dipl.
                </TabsTrigger>
                <TabsTrigger value="settings" className="text-xs px-2">
                  <Settings className="w-3.5 h-3.5 mr-1" />
                  Aset.
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="province" className="space-y-4">
                {selectedProvince ? (
                  <ProvinceInfoPanel
                    province={selectedProvince}
                    armies={selectedProvinceArmies}
                    playerFaction={playerFaction}
                    onBuildFort={() => {
                      audio.playConfirm();
                      buildFort(selectedProvince.id);
                    }}
                    onRecruitArmy={() => {
                      audio.playConfirm();
                      recruitArmy(selectedProvince.id);
                    }}
                    canBuildFort={playerFactionData ? playerFactionData.treasury >= 50 : false}
                    canRecruit={playerFactionData ? playerFactionData.treasury >= 30 && playerFactionData.manpower >= 10 : false}
                  />
                ) : (
                  <Card className="bg-stone-800/50 border-stone-700/50">
                    <CardContent className="p-6 text-center text-stone-400">
                      <Map className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Valitse provinssi kartalta</p>
                    </CardContent>
                  </Card>
                )}
                
                {/* Army selection with attack info */}
                {selectedProvinceArmies.filter(a => a.ownerId === playerFaction).length > 0 && (
                  <Card className={`border transition-all duration-300 ${
                    attackMode 
                      ? 'bg-red-900/50 border-red-500/50 shadow-lg shadow-red-500/20' 
                      : 'bg-green-900/30 border-green-700/30'
                  }`}>
                    <CardContent className="p-4">
                      <h4 className={`font-semibold mb-2 flex items-center gap-2 ${
                        attackMode ? 'text-red-200' : 'text-green-200'
                      }`}>
                        {attackMode ? (
                          <>
                            <Crosshair className="w-4 h-4 animate-pulse" />
                            Valitse hyökkäyskohde kartalta!
                          </>
                        ) : (
                          <>
                            <Sword className="w-4 h-4" />
                            Valitse armeija
                          </>
                        )}
                      </h4>
                      
                      <div className="space-y-2">
                        {selectedProvinceArmies
                          .filter(a => a.ownerId === playerFaction)
                          .map(army => (
                            <Button
                              key={army.id}
                              variant={gameState.selectedArmyId === army.id ? 'default' : 'outline'}
                              className={`w-full justify-start ${
                                gameState.selectedArmyId === army.id 
                                  ? attackMode ? 'bg-red-600' : 'bg-green-600' 
                                  : attackMode ? 'border-red-600 text-red-200' : 'border-green-600 text-green-200'
                              }`}
                              onClick={() => {
                                audio.playSelect();
                                selectArmy(army.id);
                                setAttackMode(false);
                              }}
                              disabled={army.movementLeft <= 0}
                            >
                              🐴 {army.cavalry} ⚔️ {army.infantry}
                              <span className="ml-auto text-xs">
                                {army.movementLeft > 0 ? `👟 ${army.movementLeft}` : 'Ei liikettä'}
                              </span>
                            </Button>
                          ))}
                      </div>
                      
                      {/* Attack button when army selected */}
                      {gameState.selectedArmyId && attackableProvinces.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <Button
                            variant={attackMode ? 'destructive' : 'outline'}
                            className={`w-full font-bold ${
                              attackMode 
                                ? 'bg-red-600 hover:bg-red-500 animate-pulse' 
                                : 'border-red-500 text-red-300 hover:bg-red-900/50'
                            }`}
                            onClick={() => {
                              setAttackMode(!attackMode);
                              if (!attackMode && sfxEnabled) {
                                playGameSFX('battle_start');
                              }
                            }}
                          >
                            <Target className="w-4 h-4 mr-2" />
                            {attackMode ? 'Peruuta hyökkäys' : `Hyökkää! (${attackableProvinces.length} kohdetta)`}
                          </Button>
                          
                          {attackMode && (
                            <p className="text-xs text-red-200 text-center animate-pulse">
                              🔴 Klikkaa punaista provinssia kartalta hyökätäksesi
                            </p>
                          )}
                        </div>
                      )}
                      
                      {/* Move/Attack legend */}
                      {gameState.selectedArmyId && !attackMode && (availableMoves.length > 0 || attackableProvinces.length > 0) && (
                        <div className="mt-4 pt-3 border-t border-green-700/30">
                          <p className="text-xs text-green-200/70 mb-2">Vaihtoehdot:</p>
                          <div className="flex gap-4 text-xs">
                            {availableMoves.length > 0 && (
                              <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded border-2 border-green-500 bg-green-500/30" />
                                <span className="text-green-300">Liiku ({availableMoves.length})</span>
                              </div>
                            )}
                            {attackableProvinces.length > 0 && (
                              <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded border-2 border-red-500 bg-red-500/30" />
                                <span className="text-red-300">Hyökkäys ({attackableProvinces.length})</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              <TabsContent value="log" className="space-y-4">
                <Card className="bg-slate-800/50 border-amber-700/30">
                  <CardContent className="p-4">
                    <h4 className="text-amber-100 font-semibold mb-3 flex items-center gap-2">
                      <ScrollText className="w-4 h-4 text-amber-400" />
                      Tapahtumaloki - Vuoro {gameState.turn}
                    </h4>
                    <ScrollArea className="h-[400px]">
                      <TurnLog entries={logEntries} maxVisible={50} />
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="diplomacy">
                <DiplomacyPanel
                  factions={gameState.factions}
                  relations={gameState.relations}
                  playerFaction={playerFaction}
                  onProposeTreaty={(target, type) => {
                    audio.playConfirm();
                    proposeTreaty(target, type);
                  }}
                  onBreakTreaty={(target, type) => {
                    audio.playError();
                    breakTreaty(target, type);
                  }}
                />
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-4">
                <AudioSettings
                  settings={audio.settings}
                  onMasterVolumeChange={audio.setMasterVolume}
                  onMusicVolumeChange={audio.setMusicVolume}
                  onSfxVolumeChange={audio.setSfxVolume}
                  onToggleMute={audio.toggleMute}
                />
                
                {/* ElevenLabs SFX Toggle */}
                <Card className="bg-slate-800/50 border-amber-700/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-amber-400" />
                        <span className="text-amber-100 text-sm">AI-äänitehosteet</span>
                      </div>
                      <Button
                        variant={sfxEnabled ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSfxEnabled(!sfxEnabled)}
                        disabled={!!sfxLoading}
                        className={sfxEnabled ? "bg-green-600 hover:bg-green-500" : "border-amber-600"}
                      >
                        {sfxLoading ? 'Ladataan...' : sfxEnabled ? 'Päällä' : 'Pois'}
                      </Button>
                    </div>
                    <p className="text-xs text-amber-200/60 mt-2">
                      Käyttää ElevenLabs AI:ta generoimaan realistisia ääniefektejä
                    </p>
                  </CardContent>
                </Card>
                
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleReset}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Aloita alusta
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Victory dialog */}
      <Dialog open={gameState.gameOver}>
        <DialogContent className="bg-gradient-to-br from-amber-900 to-amber-950 border-amber-600 text-white">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <Trophy className="w-20 h-20 text-amber-400 animate-pulse" />
            </div>
            <DialogTitle className="text-3xl text-center text-amber-100">Voitto!</DialogTitle>
            <DialogDescription className="text-center text-amber-200 text-lg">
              Olet valloittanut tarpeeksi provinsseja hallitaksesi Euraasian!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="justify-center">
            <Button onClick={handleReset} size="lg" className="bg-amber-600 hover:bg-amber-500">
              <RotateCcw className="w-5 h-5 mr-2" />
              Pelaa uudestaan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tutorial */}
      <Tutorial
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onComplete={handleTutorialComplete}
      />
      
      {/* Battle Display */}
      <BattleDisplay
        battle={pendingBattle}
        onClose={clearBattle}
        onPlaySound={sfxEnabled ? (sound) => playGameSFX(sound as GameSFXKey) : undefined}
      />
      
      {/* Event Card */}
      <EventCard
        activeEvent={activeEvent}
        playerFaction={playerFaction}
        onResolve={handleEventResolve}
        onClose={() => setActiveEvent(null)}
      />
      
      {/* Turn Transition Animation */}
      {showTurnTransition && (
        <TurnTransition
          turn={gameState.turn}
          year={gameState.year}
          phase={gameState.phase}
          factionId={playerFaction}
          isNewTurn={isNewTurn}
          onComplete={() => setShowTurnTransition(false)}
        />
      )}
      
      {/* Turn Summary Modal (show after new turn transition) */}
      {showTurnSummary && playerFactionData && (
        <TurnSummary
          turn={gameState.turn - 1}
          year={gameState.year - 1}
          factionId={playerFaction}
          income={lastTurnIncome}
          manpowerGain={lastManpowerGain}
          provincesOwned={gameState.provinces.filter(p => p.ownerId === playerFaction).length}
          armiesCount={gameState.armies.filter(a => a.ownerId === playerFaction).length}
          onClose={() => setShowTurnSummary(false)}
        />
      )}
      
      {/* Tutorial help button */}
      <TutorialButton onClick={() => setShowTutorial(true)} />

      {/* Back link */}
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

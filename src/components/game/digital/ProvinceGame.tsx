import { useState, useRef, useCallback, useEffect } from 'react';
import { useProvinceGameState } from '@/hooks/useProvinceGameState';
import { useAudioManager } from '@/hooks/useAudioManager';
import { useSaveManager } from '@/hooks/useSaveManager';
import { useDiplomacyAI } from '@/hooks/useDiplomacyAI';
import { useElevenLabsSFX, GAME_SFX, GameSFXKey } from '@/hooks/useElevenLabsSFX';
import { ProvinceFactionSelect } from './ProvinceFactionSelect';
import { ProvinceMap } from './ProvinceMap';
import { ProvinceInfoPanel } from './ProvinceInfoPanel';
import { DiplomacyPanel } from './DiplomacyPanel';
import { AudioSettings } from './AudioSettings';
import { BattleDisplay, BattleResult } from './BattleDisplay';
import { EventCard, getRandomEvent, GAME_EVENTS } from './EventCard';
import { Tutorial, TutorialButton } from './Tutorial';
import { FACTION_DATA_1206, ActiveGameEvent } from '@/types/province';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
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
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

export const ProvinceGame = () => {
  const {
    gameStarted,
    playerFaction,
    gameState,
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
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState('province');
  const [sfxEnabled, setSfxEnabled] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [activeBattle, setActiveBattle] = useState<BattleResult | null>(null);
  const [activeEvent, setActiveEvent] = useState<ActiveGameEvent | null>(null);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(() => {
    return localStorage.getItem('mongolian_game_tutorial_seen') === 'true';
  });
  const lastPhaseRef = useRef<string | null>(null);
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
  
  // AI Diplomacy processing at turn end (when phase changes from 'event' back to 'planning')
  useEffect(() => {
    if (!gameState || !playerFaction) return;
    
    const currentPhase = gameState.phase;
    const prevPhase = lastPhaseRef.current;
    lastPhaseRef.current = currentPhase;
    
    // Process AI diplomacy when new turn starts (planning phase after event phase)
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
            }
          } else if (decision.type === 'break_treaty' && decision.targetFactionId && decision.treatyType) {
            // AI breaking treaty
            if (decision.targetFactionId === playerFaction) {
              const factionData = FACTION_DATA_1206[faction.id];
              toast.warning(`${factionData.name} rikkoi sopimuksen: ${decision.treatyType}`, {
                description: decision.reason,
              });
              breakTreaty(faction.id, decision.treatyType!);
            }
          }
        });
      });
    }
  }, [gameState?.phase, gameState?.turn]);
  
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
        moveArmy(gameState.selectedArmyId, provinceId);
        audio.playConfirm();
        if (sfxEnabled) playGameSFX('cavalry_charge');
        return;
      }
    }
    
    selectProvince(provinceId);
  }, [audio, gameState?.selectedArmyId, canMoveTo, moveArmy, selectProvince, sfxEnabled, playGameSFX]);

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
  
  // Get available moves for selected army
  const selectedArmy = gameState.armies.find(a => a.id === gameState.selectedArmyId);
  const availableMoves = selectedArmy 
    ? gameState.provinces
        .filter(p => canMoveTo(selectedArmy.id, p.id))
        .map(p => p.id)
    : [];

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
          <div className="absolute inset-0 p-4">
            <ProvinceMap
              provinces={gameState.provinces}
              selectedProvinceId={gameState.selectedProvinceId}
              onProvinceClick={handleProvinceClick}
              playerFaction={playerFaction}
              highlightedProvinces={availableMoves}
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
              <TabsList className="w-full bg-slate-800/50 mb-4">
                <TabsTrigger value="province" className="flex-1">
                  <Map className="w-4 h-4 mr-1" />
                  Provinssi
                </TabsTrigger>
                <TabsTrigger value="diplomacy" className="flex-1">
                  <Handshake className="w-4 h-4 mr-1" />
                  Diplomatia
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex-1">
                  <Settings className="w-4 h-4 mr-1" />
                  Asetukset
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
                
                {/* Army selection */}
                {selectedProvinceArmies.filter(a => a.ownerId === playerFaction).length > 0 && (
                  <Card className="bg-green-900/30 border-green-700/30">
                    <CardContent className="p-4">
                      <h4 className="text-green-200 font-semibold mb-2 flex items-center gap-2">
                        <Sword className="w-4 h-4" />
                        Valitse armeija liikutettavaksi
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
                                  ? 'bg-green-600' 
                                  : 'border-green-600 text-green-200'
                              }`}
                              onClick={() => {
                                audio.playSelect();
                                selectArmy(army.id);
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
                    </CardContent>
                  </Card>
                )}
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
        battle={activeBattle}
        onClose={() => setActiveBattle(null)}
        onPlaySound={sfxEnabled ? (sound) => playGameSFX(sound as GameSFXKey) : undefined}
      />
      
      {/* Event Card */}
      <EventCard
        activeEvent={activeEvent}
        playerFaction={playerFaction}
        onResolve={handleEventResolve}
        onClose={() => setActiveEvent(null)}
      />
      
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

/**
 * ProvinceGame.tsx — Pelattava MVP-strategiapeli
 *
 * Kokonainen vuoropohjainen pelilooppi:
 * Resurssit → Kortit → Liike → Taistelu → Rakentaminen → Vuoron lopetus
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { useAudioManager } from '@/hooks/useAudioManager.ts';
import { useProvinceGameState, BUILDING_INFO, MVPBuildingType, VICTORY_TARGETS } from '@/hooks/useProvinceGameState.ts';
import { AITurnOverlay } from './AITurnOverlay.tsx';
import { ProvinceFactionSelect } from './ProvinceFactionSelect.tsx';
import { ProvinceMap } from './ProvinceMap.tsx';
import { ProvinceInfoPanel } from './ProvinceInfoPanel.tsx';
import { DiplomacyPanel } from './DiplomacyPanel.tsx';
import { BattleDisplay } from './BattleDisplay.tsx';
import { CardHand } from './CardHand.tsx';
import { PhaseBar } from './PhaseBar.tsx';
import { VictoryGoals } from './VictoryGoals.tsx';
import { GameOverScreen } from './GameOverScreen.tsx';
import { CreditsIntro } from './CreditsIntro.tsx';
import { EngagementLayer } from './EngagementLayer.tsx';
import { FACTION_DATA_1206 } from '@/types/province.ts';
import { Button } from '@/components/ui/button.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { Card, CardContent } from '@/components/ui/card.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { 
  Maximize2, Minimize2, ArrowLeft, Map, Handshake, Settings,
  Clock, Coins, Users, Sword, RotateCcw, Trophy, ScrollText,
  Target, Crosshair, Wheat, Wrench, HelpCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export const ProvinceGame = () => {
  const {
    gameStarted, playerFaction, gameState,
    pendingBattle, clearBattle,
    startGame, selectProvince, selectArmy, moveArmy,
    nextPhase, endTurn, resetGame,
    playCard, buildStructure, recruitArmy,
    proposeTreaty, breakTreaty,
    getArmiesInProvince, getPlayerFaction, canMoveTo,
    collectResources,
  } = useProvinceGameState();

  const { playAmbient, stopAmbient } = useAudioManager();
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState('province');
  const [attackMode, setAttackMode] = useState(false);
  const [showAIOverlay, setShowAIOverlay] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fullscreen
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
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', h);
    return () => document.removeEventListener('fullscreenchange', h);
  }, []);

  useEffect(() => {
    if (gameStarted) {
      playAmbient();
    } else {
      stopAmbient();
    }
    return () => stopAmbient();
  }, [gameStarted, playAmbient, stopAmbient]);

  // Auto-collect resources when entering resource phase
  useEffect(() => {
    if (gameState?.phase === 'resource' && !gameState.resourcesCollected) {
      collectResources();
    }
  }, [gameState?.phase, gameState?.resourcesCollected, collectResources]);

  // Show AI overlay after turn end
  useEffect(() => {
    if (gameState?.aiActionLog && gameState.aiActionLog.length > 0) {
      setShowAIOverlay(true);
    }
  }, [gameState?.turn, gameState?.aiActionLog]);

  // Province click handler
  const handleProvinceClick = useCallback((provinceId: string) => {
    if (!gameState) return;
    
    if (gameState.selectedArmyId && (gameState.phase === 'move' || gameState.phase === 'battle')) {
      if (canMoveTo(gameState.selectedArmyId, provinceId)) {
        moveArmy(gameState.selectedArmyId, provinceId);
        setAttackMode(false);
        return;
      }
    }
    selectProvince(provinceId);
  }, [gameState, canMoveTo, moveArmy, selectProvince]);

  // Show credits intro before everything else
  if (!introDone) {
    return <CreditsIntro onDone={() => setIntroDone(true)} />;
  }

  // Faction select
  if (!gameStarted || !playerFaction) {
    return <ProvinceFactionSelect onSelect={(f) => f && startGame(f)} />;
  }
  if (!gameState) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-950 via-amber-950/30 to-slate-950">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-amber-500/30" />
            <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-xl text-amber-200 animate-pulse">Ladataan...</p>
        </div>
      </div>
    );
  }

  const playerFactionData = getPlayerFaction();
  const selectedProvince = gameState.provinces.find(p => p.id === gameState.selectedProvinceId);
  const selectedProvinceArmies = selectedProvince ? getArmiesInProvince(selectedProvince.id) : [];
  const selectedArmy = gameState.armies.find(a => a.id === gameState.selectedArmyId);
  
  // Compute available moves/attacks for selected army
  const { availableMoves, attackableProvinces } = (() => {
    if (!selectedArmy) return { availableMoves: [] as string[], attackableProvinces: [] as string[] };
    const moveable = gameState.provinces.filter(p => canMoveTo(selectedArmy.id, p.id));
    const peaceful: string[] = [];
    const attacks: string[] = [];
    moveable.forEach(p => {
      const hasEnemy = gameState.armies.some(a => a.provinceId === p.id && a.ownerId !== selectedArmy.ownerId);
      const isEnemyTerritory = p.ownerId !== null && p.ownerId !== selectedArmy.ownerId;
      if (hasEnemy || isEnemyTerritory) attacks.push(p.id);
      else peaceful.push(p.id);
    });
    return { availableMoves: peaceful, attackableProvinces: attacks };
  })();

  const isVictory = gameState.gameOver && gameState.winnerId === playerFaction;
  const isDefeat = gameState.gameOver && gameState.winnerId !== playerFaction;

  return (
    <div ref={containerRef} className="fixed inset-0 w-screen min-h-[100dvh] overflow-hidden bg-slate-950" style={{ height: '100dvh' }}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-amber-950/20 to-slate-950" />
      
      {/* ============= TOP HUD ============= */}
      <div className="fixed top-0 left-0 right-0 h-12 z-30">
        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl border-b border-amber-700/20" />
        <div className="relative h-full flex items-center justify-between px-3">
          {/* Left: Faction + Year */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-2.5 py-1 border border-amber-700/20">
              <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: playerFactionData?.color }} />
              <span className="text-amber-100 font-bold text-sm hidden sm:block">{playerFactionData?.name}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/50 rounded-lg px-2.5 py-1 border border-amber-700/20">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-200 font-mono text-sm">{gameState.year}</span>
              <span className="text-amber-200/40 text-xs">V{gameState.turn}</span>
            </div>
          </div>
          
          {/* Center: Resources */}
          {playerFactionData && (
            <div className="flex items-center gap-3 bg-slate-800/30 rounded-lg px-3 py-1">
              <div className="flex items-center gap-1" title="Kulta">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-100 font-bold text-sm">{playerFactionData.treasury}</span>
              </div>
              <div className="flex items-center gap-1" title="Ruoka">
                <Wheat className="w-3.5 h-3.5 text-green-400" />
                <span className="text-green-100 font-bold text-sm">{gameState.food}</span>
              </div>
              <div className="flex items-center gap-1" title="Hevoset">
                <span className="text-sm">🐴</span>
                <span className="text-blue-100 font-bold text-sm">{playerFactionData.horses}</span>
              </div>
              <div className="flex items-center gap-1" title="Miesvoima">
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-blue-100 font-bold text-sm">{playerFactionData.manpower}</span>
              </div>
              <div className="flex items-center gap-1" title="Käsityöläiset">
                <Wrench className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-orange-100 font-bold text-sm">{gameState.artisans}</span>
              </div>
            </div>
          )}
          
          {/* Right: Controls */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-amber-200/70 hover:text-amber-200 hover:bg-amber-900/30 h-8 w-8">
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowSidebar(!showSidebar)} className="text-amber-200/70 hover:text-amber-200 hover:bg-amber-900/30 text-xs h-8">
              {showSidebar ? '◀ Piilota' : '▶ Valikko'}
            </Button>
          </div>
        </div>
      </div>

      {/* ============= PHASE BAR ============= */}
      <div className="fixed top-12 left-0 right-0 z-40 px-3 py-1.5">
        <PhaseBar
          currentPhase={gameState.phase}
          onNextPhase={nextPhase}
          onEndTurn={endTurn}
          disabled={showAIOverlay}
        />
      </div>


      {/* ============= RESOURCE COLLECTION RESULT ============= */}
      {gameState.phase === 'resource' && gameState.resourcesCollected && gameState.lastCollection && (
        <div className="fixed top-[160px] left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <Card className="bg-green-950/95 backdrop-blur-xl border-green-600/50 shadow-2xl animate-fade-in">
            <CardContent className="p-4 text-center">
              <h3 className="text-green-100 font-bold text-lg mb-2">✅ Resurssit kerätty!</h3>
              <div className="flex items-center justify-center gap-4 text-sm flex-wrap">
                <span className="text-amber-300">🪙 +{gameState.lastCollection.taxIncome} kultaa</span>
                <span className="text-blue-300">👥 +{gameState.lastCollection.manpowerGain} miehiä</span>
                <span className="text-green-300">🌾 {gameState.lastCollection.foodChange >= 0 ? '+' : ''}{gameState.lastCollection.foodChange} ruokaa</span>
              </div>
              {(gameState.lastCollection.silkRoadBonus > 0 || gameState.lastCollection.marketBonus > 0) && (
                <div className="flex items-center justify-center gap-3 text-xs text-stone-400 mt-1">
                  {gameState.lastCollection.silkRoadBonus > 0 && (
                    <span className="text-amber-400">🛤️ Silkkitie +{gameState.lastCollection.silkRoadBonus}</span>
                  )}
                  {gameState.lastCollection.marketBonus > 0 && (
                    <span className="text-amber-400">🏪 Markkinat +{gameState.lastCollection.marketBonus}</span>
                  )}
                </div>
              )}
              <p className="text-green-200/60 text-xs mt-2">Jatka seuraavaan vaiheeseen →</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="relative h-full pt-[88px] flex">
        {/* Map */}
        <div className={`flex-1 relative transition-all duration-300 ${showSidebar ? 'lg:mr-[380px]' : ''}`}>
          <div className="absolute inset-0 p-1">
            <ProvinceMap
              provinces={gameState.provinces}
              armies={gameState.armies}
              selectedProvinceId={gameState.selectedProvinceId}
              selectedArmyId={gameState.selectedArmyId}
              onProvinceClick={handleProvinceClick}
              onArmyClick={selectArmy}
              playerFaction={playerFaction}
              highlightedProvinces={attackMode ? attackableProvinces : [...availableMoves, ...attackableProvinces]}
            />
          </div>
          
          {/* Army indicators on map */}
          {gameState.armies.filter(a => a.ownerId === playerFaction).length > 0 && selectedArmy && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10">
              <div className="bg-green-900/90 backdrop-blur-sm text-green-100 text-xs px-4 py-2 rounded-full border border-green-500/30">
                Armeija valittu: 🐴{selectedArmy.cavalry} ⚔️{selectedArmy.infantry} • Liikettä: {selectedArmy.movementLeft} • Klikkaa kohdealuetta kartalla
              </div>
            </div>
          )}
        </div>
        
        {/* ============= SIDEBAR ============= */}
        <div className={`fixed top-[88px] right-0 bottom-0 w-[380px] bg-slate-900/95 backdrop-blur-xl border-l border-amber-700/20 shadow-2xl transition-transform duration-300 z-20 overflow-hidden ${
          showSidebar ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="h-full overflow-y-auto p-3 scrollbar-thin">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full bg-slate-800/50 mb-3 grid grid-cols-4">
                <TabsTrigger value="province" className="text-xs px-1.5">
                  <Map className="w-3 h-3 mr-1" />Alue
                </TabsTrigger>
                <TabsTrigger value="goals" className="text-xs px-1.5">
                  <Trophy className="w-3 h-3 mr-1" />Tavoite
                </TabsTrigger>
                <TabsTrigger value="log" className="text-xs px-1.5">
                  <ScrollText className="w-3 h-3 mr-1" />Loki
                </TabsTrigger>
                <TabsTrigger value="diplomacy" className="text-xs px-1.5">
                  <Handshake className="w-3 h-3 mr-1" />Dipl.
                </TabsTrigger>
              </TabsList>
              
              {/* ============= PROVINCE TAB ============= */}
              <TabsContent value="province" className="space-y-3">
                {selectedProvince ? (
                  <>
                    <ProvinceInfoPanel
                      province={selectedProvince}
                      armies={selectedProvinceArmies}
                      playerFaction={playerFaction}
                      onBuildFort={() => buildStructure(selectedProvince.id, 'fortress')}
                      onRecruitArmy={() => recruitArmy(selectedProvince.id)}
                      canBuildFort={!!playerFactionData && gameState.phase === 'build' && playerFactionData.treasury >= 50 && gameState.artisans >= 2}
                      canRecruit={(() => {
                        if (!playerFactionData || !selectedProvince || selectedProvince.ownerId !== playerFaction) return false;
                        if (playerFactionData.treasury < 20 || playerFactionData.manpower < 5) return false;
                        const hasCamp = (gameState.buildings[selectedProvince.id] || []).includes('camp');
                        const isCapital = selectedProvince.id === playerFactionData.capitalId;
                        return hasCamp || isCapital;
                      })()}
                    />
                    
                    {/* Buildings */}
                    {selectedProvince.ownerId === playerFaction && gameState.phase === 'build' && (
                      <Card className="bg-gradient-to-b from-amber-950/40 to-slate-800/50 border-amber-600/40">
                        <CardContent className="p-4">
                          <h4 className="text-amber-100 font-bold text-base mb-3 flex items-center gap-2">
                            🏗️ Rakenna — {selectedProvince.name}
                          </h4>
                          
                          <div className="space-y-2.5">
                            {(Object.entries(BUILDING_INFO) as [MVPBuildingType, typeof BUILDING_INFO[MVPBuildingType]][]).map(([type, info]) => {
                              const existing = gameState.buildings[selectedProvince.id] || [];
                              const alreadyBuilt = existing.includes(type);
                              const hasGold = playerFactionData ? playerFactionData.treasury >= info.cost.gold : false;
                              const hasArtisans = info.cost.artisans ? gameState.artisans >= info.cost.artisans : true;
                              const canAfford = hasGold && hasArtisans;
                              
                              // Fortress special: can upgrade up to level 3
                              const isFortress = type === 'fortress';
                              const fortLevel = selectedProvince.fortLevel;
                              const fortMaxed = isFortress && fortLevel >= 3;
                              const fortCanUpgrade = isFortress && !fortMaxed;
                              const showAsBuilt = isFortress ? fortMaxed : alreadyBuilt;
                              const showBuildButton = isFortress ? fortCanUpgrade : !alreadyBuilt;
                              
                              return (
                                <div
                                  key={type}
                                  className={`rounded-xl border-2 overflow-hidden transition-all ${
                                    showAsBuilt
                                      ? 'border-green-700/40 bg-green-900/20 opacity-70'
                                      : canAfford
                                      ? 'border-amber-500/40 bg-slate-800/60 hover:border-amber-400/60 hover:bg-slate-800/80'
                                      : 'border-slate-700/30 bg-slate-800/30 opacity-50'
                                  }`}
                                >
                                  <div className="flex items-center gap-3 p-3">
                                    {/* Emoji icon */}
                                    <div className={`w-11 h-11 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 ${
                                      showAsBuilt ? 'bg-green-800/40' : 'bg-slate-700/50'
                                    }`}>
                                      {info.emoji}
                                    </div>
                                    
                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-amber-100 font-bold text-sm">{info.name}</span>
                                        {isFortress && fortLevel > 0 && (
                                          <span className="text-[10px] bg-amber-700/50 text-amber-200 px-1.5 py-0.5 rounded-full">
                                            Taso {fortLevel}{fortMaxed ? ' (MAX)' : ''}
                                          </span>
                                        )}
                                        {!isFortress && alreadyBuilt && (
                                          <span className="text-[10px] bg-green-700/50 text-green-200 px-1.5 py-0.5 rounded-full">✓ Rakennettu</span>
                                        )}
                                      </div>
                                      <p className="text-amber-200/60 text-xs mt-0.5">
                                        {isFortress
                                          ? `+${Math.min(3, (fortLevel + 1))} puolustus (taso ${Math.min(3, fortLevel + 1)}), garnisooni, +${Math.round(Math.min(3, (fortLevel + 1)) * 35)}% puolustusvoima`
                                          : info.effect}
                                      </p>
                                      
                                      {/* Cost */}
                                      {showBuildButton && (
                                        <div className="flex items-center gap-2 mt-1.5">
                                          <span className={`text-xs px-1.5 py-0.5 rounded ${hasGold ? 'bg-amber-800/40 text-amber-300' : 'bg-red-900/40 text-red-300'}`}>
                                            🪙 {info.cost.gold}
                                          </span>
                                          {info.cost.artisans && (
                                            <span className={`text-xs px-1.5 py-0.5 rounded ${hasArtisans ? 'bg-slate-700/50 text-slate-300' : 'bg-red-900/40 text-red-300'}`}>
                                              🔧 {info.cost.artisans}
                                            </span>
                                          )}
                                          {!canAfford && (
                                            <span className="text-red-400/70 text-[10px]">— resurssit eivät riitä</span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    
                                    {/* Build button */}
                                    {showBuildButton && (
                                      <Button
                                        size="sm"
                                        disabled={!canAfford}
                                        onClick={() => {
                                          buildStructure(selectedProvince.id, type);
                                          toast.success(`${info.emoji} ${info.name} ${isFortress && fortLevel > 0 ? 'päivitetty' : 'rakennettu'}!`, { 
                                            description: isFortress ? `Linnoitustaso ${Math.min(3, fortLevel + 1)} — +${Math.round(Math.min(3, fortLevel + 1) * 35)}% puolustus` : info.effect 
                                          });
                                        }}
                                        className="bg-amber-600 hover:bg-amber-500 text-white font-bold h-9 px-4 rounded-lg flex-shrink-0 disabled:opacity-30"
                                      >
                                        {isFortress && fortLevel > 0 ? 'Päivitä' : 'Rakenna'}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Player resources summary */}
                          {playerFactionData && (
                            <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center gap-3 text-xs text-amber-200/60">
                              <span>Sinulla: 🪙 {playerFactionData.treasury}</span>
                              <span>🔧 {gameState.artisans}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {/* Existing buildings (outside build phase) */}
                    {selectedProvince.ownerId === playerFaction && gameState.phase !== 'build' && (gameState.buildings[selectedProvince.id] || []).length > 0 && (
                      <div className="flex gap-1.5 flex-wrap px-1">
                        {(gameState.buildings[selectedProvince.id] || []).map(b => (
                          <Badge key={b} className="text-xs bg-slate-800/60 border-amber-700/30">{BUILDING_INFO[b].emoji} {BUILDING_INFO[b].name}</Badge>
                        ))}
                      </div>
                    )}
                    
                    {/* Army selection */}
                    {selectedProvinceArmies.filter(a => a.ownerId === playerFaction).length > 0 && (gameState.phase === 'move' || gameState.phase === 'battle') && (
                      <Card className="bg-green-900/30 border-green-700/30">
                        <CardContent className="p-3">
                          <h4 className="text-green-200 text-sm font-semibold mb-2 flex items-center gap-1">
                            <Sword className="w-3.5 h-3.5" /> Armeijat
                          </h4>
                          <div className="space-y-1.5">
                            {selectedProvinceArmies.filter(a => a.ownerId === playerFaction).map(army => (
                              <Button
                                key={army.id}
                                variant={gameState.selectedArmyId === army.id ? 'default' : 'outline'}
                                className={`w-full justify-start text-xs ${
                                  gameState.selectedArmyId === army.id ? 'bg-green-600' : 'border-green-600 text-green-200'
                                }`}
                                onClick={() => { selectArmy(army.id); setAttackMode(false); }}
                                disabled={army.movementLeft <= 0}
                              >
                                🐴 {army.cavalry} ⚔️ {army.infantry} 🏗 {army.siege}
                                <span className="ml-auto">{army.movementLeft > 0 ? `👟${army.movementLeft}` : '⏳'}</span>
                              </Button>
                            ))}
                          </div>
                          
                          {gameState.selectedArmyId && (
                            <div className="mt-2 pt-2 border-t border-green-700/30 flex gap-3 text-[10px]">
                              {availableMoves.length > 0 && (
                                <span className="text-green-300">🟢 Liiku ({availableMoves.length})</span>
                              )}
                              {attackableProvinces.length > 0 && (
                                <span className="text-red-300">🔴 Hyökkää ({attackableProvinces.length})</span>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : (
                  <Card className="bg-stone-800/50 border-stone-700/50">
                    <CardContent className="p-6 text-center text-stone-400">
                      <Map className="w-10 h-10 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Valitse provinssi kartalta</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
              
              {/* ============= GOALS TAB ============= */}
              <TabsContent value="goals" className="space-y-3">
                <Card className="bg-slate-800/50 border-amber-700/30">
                  <CardContent className="p-3">
                    <VictoryGoals
                      provincesOwned={gameState.provinces.filter(p => p.ownerId === playerFaction).length}
                      totalProvinces={gameState.provinces.length}
                      treasury={playerFactionData?.treasury || 0}
                      techCount={gameState.playedTechCards?.length || 0}
                      targetProvinces={VICTORY_TARGETS.provinces}
                      targetGold={VICTORY_TARGETS.gold}
                      targetTech={VICTORY_TARGETS.tech}
                    />
                  </CardContent>
                </Card>
                
                {/* Active bonuses */}
                {(gameState.attackBonus > 0 || gameState.defenseBonus > 0 || gameState.movementBonus > 0) && (
                  <Card className="bg-purple-900/30 border-purple-700/30">
                    <CardContent className="p-3">
                      <h4 className="text-purple-200 text-xs font-bold mb-1">✨ Aktiiviset bonukset</h4>
                      {gameState.attackBonus > 0 && <p className="text-xs text-red-300">⚔️ +{gameState.attackBonus} hyökkäys</p>}
                      {gameState.defenseBonus > 0 && <p className="text-xs text-blue-300">🛡️ +{gameState.defenseBonus} puolustus</p>}
                      {gameState.movementBonus > 0 && <p className="text-xs text-green-300">🐴 +{gameState.movementBonus} liike</p>}
                    </CardContent>
                  </Card>
                )}
                
                {/* Played tech cards */}
                {(gameState.playedTechCards?.length || 0) > 0 && (
                  <Card className="bg-green-900/30 border-green-700/30">
                    <CardContent className="p-3">
                      <h4 className="text-green-200 text-xs font-bold mb-1">🔬 Teknologiat ({gameState.playedTechCards.length}/{VICTORY_TARGETS.tech})</h4>
                      {gameState.playedTechCards.map(c => (
                        <p key={c.id} className="text-xs text-green-300">• {c.name}: {c.parsedEffect.description}</p>
                      ))}
                    </CardContent>
                  </Card>
                )}
                
                {/* Game stats */}
                <Card className="bg-slate-800/50 border-slate-700/30">
                  <CardContent className="p-3 space-y-1">
                    <h4 className="text-amber-100 text-xs font-bold">📊 Tilastot</h4>
                    <p className="text-xs text-slate-300">Alueet: {gameState.provinces.filter(p => p.ownerId === playerFaction).length}/{gameState.provinces.length}</p>
                    <p className="text-xs text-slate-300">Armeijat: {gameState.armies.filter(a => a.ownerId === playerFaction).length}</p>
                    <p className="text-xs text-slate-300">Kortit kädessä: {gameState.hand?.length || 0}</p>
                    <p className="text-xs text-slate-300">Rakennukset: {Object.values(gameState.buildings).flat().length}</p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* ============= LOG TAB ============= */}
              <TabsContent value="log" className="space-y-3">
                <Card className="bg-slate-800/50 border-amber-700/30">
                  <CardContent className="p-3">
                    <h4 className="text-amber-100 text-sm font-semibold mb-2 flex items-center gap-2">
                      <ScrollText className="w-4 h-4 text-amber-400" />
                      AI-tapahtumaloki
                    </h4>
                    <ScrollArea className="h-[400px]">
                      {gameState.aiLog && gameState.aiLog.length > 0 ? (
                        <div className="space-y-1">
                          {gameState.aiLog.map((msg, i) => (
                            <p key={i} className="text-xs text-slate-300 border-l-2 border-amber-600/30 pl-2 py-0.5">{msg}</p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500">Ei tapahtumia vielä. Lopeta vuoro nähdäksesi AI:n toiminnot.</p>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* ============= DIPLOMACY TAB ============= */}
              <TabsContent value="diplomacy">
                <DiplomacyPanel
                  factions={gameState.factions}
                  relations={gameState.relations}
                  playerFaction={playerFaction}
                  onProposeTreaty={proposeTreaty}
                  onBreakTreaty={breakTreaty}
                />
              </TabsContent>
            </Tabs>
            
            {/* Reset button at bottom */}
            <div className="mt-4 pt-3 border-t border-slate-700/30">
              <Button variant="destructive" size="sm" className="w-full text-xs" onClick={resetGame}>
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Aloita alusta
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ============= BOTTOM PANEL: Cards + Minimap ============= */}
      <div className={`fixed bottom-0 left-0 z-40 transition-all ${
        showSidebar ? 'right-[380px]' : 'right-0'
      }`}>
        <div className="bg-slate-900/98 backdrop-blur-xl border-t-2 border-amber-500/30">
          <div className="flex items-stretch">
            {/* Minimap */}
            <div className="w-[180px] flex-shrink-0 border-r border-slate-700/50 p-1.5">
              <div className="w-full h-full rounded-lg overflow-hidden border border-slate-600/30 bg-slate-800/50" style={{ minHeight: '100px' }}>
                <ProvinceMap
                  provinces={gameState.provinces}
                  armies={gameState.armies}
                  selectedProvinceId={gameState.selectedProvinceId}
                  onProvinceClick={selectProvince}
                  playerFaction={playerFaction}
                  highlightedProvinces={[]}
                  isMinimap
                />
              </div>
            </div>

            {/* Cards */}
            <div className="flex-1 p-3 overflow-hidden">
              {gameState.hand && gameState.hand.length > 0 ? (
                <CardHand
                  cards={gameState.hand}
                  onPlayCard={(card) => {
                    playCard(card);
                    const eff = card.parsedEffect;
                    toast.success(`🃏 ${card.name}`, { description: eff.description });
                  }}
                  canPlay={gameState.phase !== 'end'}
                  currentPhase={gameState.phase}
                  deckSize={gameState.deck?.length || 0}
                  discardSize={gameState.discard?.length || 0}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-amber-200/40 text-sm">
                  Ei kortteja kädessä • 📦 {gameState.deck?.length || 0} pakassa
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============= ENGAGEMENT (juice) ============= */}
      <EngagementLayer gameState={gameState} playerFaction={playerFaction} />

      {/* ============= OVERLAYS ============= */}
      <AITurnOverlay
        actions={gameState.aiActionLog || []}
        isVisible={showAIOverlay}
        onComplete={() => setShowAIOverlay(false)}
      />

      <GameOverScreen
        isOpen={gameState.gameOver}
        isVictory={isVictory}
        winCondition={gameState.winCondition}
        turn={gameState.turn}
        year={gameState.year}
        onRestart={resetGame}
      />
      
      <BattleDisplay
        battle={pendingBattle}
        onClose={clearBattle}
      />

      {/* Back link */}
      <Link 
        to="/"
        className="fixed bottom-2 left-2 z-30 flex items-center gap-1.5 text-amber-200/40 hover:text-amber-200 transition-colors text-xs group"
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
        <span className="opacity-0 group-hover:opacity-100 transition-opacity">Etusivulle</span>
      </Link>
    </div>
  );
};

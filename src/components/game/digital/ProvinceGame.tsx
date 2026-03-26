/**
 * ProvinceGame.tsx — Pelattava MVP-strategiapeli
 *
 * Kokonainen vuoropohjainen pelilooppi:
 * Resurssit → Kortit → Liike → Taistelu → Rakentaminen → Vuoron lopetus
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { useProvinceGameState, BUILDING_INFO, MVPBuildingType, VICTORY_TARGETS } from '@/hooks/useProvinceGameState';
import { ProvinceFactionSelect } from './ProvinceFactionSelect';
import { ProvinceMap } from './ProvinceMap';
import { ProvinceInfoPanel } from './ProvinceInfoPanel';
import { DiplomacyPanel } from './DiplomacyPanel';
import { BattleDisplay } from './BattleDisplay';
import { CardHand } from './CardHand';
import { PhaseBar } from './PhaseBar';
import { VictoryGoals } from './VictoryGoals';
import { GameOverScreen } from './GameOverScreen';
import { FACTION_DATA_1206 } from '@/types/province';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  } = useProvinceGameState();
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeTab, setActiveTab] = useState('province');
  const [attackMode, setAttackMode] = useState(false);
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

  // Show AI log after turn end
  useEffect(() => {
    if (gameState?.aiLog && gameState.aiLog.length > 0) {
      gameState.aiLog.forEach((msg, i) => {
        setTimeout(() => toast.info(msg, { duration: 3000 }), i * 500);
      });
    }
  }, [gameState?.turn]);

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
      <div className="fixed top-12 left-0 right-0 z-20 px-3 py-1.5">
        <PhaseBar
          currentPhase={gameState.phase}
          onNextPhase={nextPhase}
          onEndTurn={endTurn}
        />
      </div>

      {/* ============= MAIN GAME AREA ============= */}
      <div className="relative h-full pt-[88px] flex">
        {/* Map */}
        <div className={`flex-1 relative transition-all duration-300 ${showSidebar ? 'lg:mr-[380px]' : ''}`}>
          <div className="absolute inset-0 p-1">
            <ProvinceMap
              provinces={gameState.provinces}
              selectedProvinceId={gameState.selectedProvinceId}
              onProvinceClick={handleProvinceClick}
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
                      canBuildFort={playerFactionData ? playerFactionData.treasury >= 50 : false}
                      canRecruit={playerFactionData ? playerFactionData.treasury >= 20 && playerFactionData.manpower >= 5 : false}
                    />
                    
                    {/* Buildings */}
                    {selectedProvince.ownerId === playerFaction && gameState.phase === 'build' && (
                      <Card className="bg-slate-800/50 border-amber-700/30">
                        <CardContent className="p-3">
                          <h4 className="text-amber-100 text-sm font-semibold mb-2">🏗️ Rakenna</h4>
                          <div className="space-y-2">
                            {(Object.entries(BUILDING_INFO) as [MVPBuildingType, typeof BUILDING_INFO[MVPBuildingType]][]).map(([type, info]) => {
                              const existing = gameState.buildings[selectedProvince.id] || [];
                              const alreadyBuilt = existing.includes(type);
                              const canAfford = playerFactionData && playerFactionData.treasury >= info.cost.gold && gameState.artisans >= (info.cost.artisans || 0);
                              
                              return (
                                <Button
                                  key={type}
                                  variant="outline"
                                  className={`w-full justify-start text-xs ${alreadyBuilt ? 'opacity-50' : ''}`}
                                  disabled={alreadyBuilt || !canAfford}
                                  onClick={() => buildStructure(selectedProvince.id, type)}
                                >
                                  <span className="mr-2">{info.emoji}</span>
                                  {info.name} ({info.cost.gold}🪙{info.cost.artisans ? ` ${info.cost.artisans}🔧` : ''})
                                  <span className="ml-auto text-amber-200/60">{info.effect}</span>
                                </Button>
                              );
                            })}
                          </div>
                          
                          {/* Existing buildings */}
                          {(gameState.buildings[selectedProvince.id] || []).length > 0 && (
                            <div className="mt-2 pt-2 border-t border-slate-700">
                              <p className="text-amber-200/60 text-xs mb-1">Rakennettu:</p>
                              <div className="flex gap-1">
                                {(gameState.buildings[selectedProvince.id] || []).map(b => (
                                  <Badge key={b} className="text-xs">{BUILDING_INFO[b].emoji} {BUILDING_INFO[b].name}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
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

      {/* ============= CARD HAND (bottom) ============= */}
      {gameState.hand && (
        <div className={`fixed bottom-0 left-0 z-20 bg-slate-900/95 backdrop-blur-xl border-t border-amber-700/20 p-2 transition-all ${
          showSidebar ? 'right-[380px]' : 'right-0'
        }`}>
          <CardHand
            cards={gameState.hand}
            onPlayCard={playCard}
            canPlay={gameState.phase === 'cards'}
            deckSize={gameState.deck?.length || 0}
            discardSize={gameState.discard?.length || 0}
          />
        </div>
      )}

      {/* ============= OVERLAYS ============= */}
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

/**
 * ProvinceGame.tsx — Pelattava MVP-strategiapeli
 *
 * Kokonainen vuoropohjainen pelilooppi:
 * Resurssit → Kortit → Liike → Taistelu → Rakentaminen → Vuoron lopetus
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { useAudioManager } from '@/hooks/useAudioManager.ts';
import { useProvinceGameState, BUILDING_INFO, MVPBuildingType, VICTORY_TARGETS, WONDER_MAX } from '@/hooks/useProvinceGameState.ts';
import type { RecruitType, MVPGameState } from '@/hooks/useProvinceGameState.ts';
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
import { EngagementLayer } from './EngagementLayer.tsx';
// import { AdManager } from '@/components/ui/AdManager.tsx';
import { FACTION_DATA_1206 } from '@/types/province.ts';
import type { ProvinceGameState } from '@/types/province.ts';
import { Button } from '@/components/ui/button.tsx';
import { Badge } from '@/components/ui/badge.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { Card, CardContent } from '@/components/ui/card.tsx';
import { ScrollArea } from '@/components/ui/scroll-area.tsx';
import { 
  Maximize2, Minimize2, ArrowLeft, Map, Handshake, Settings,
  Clock, Users, Sword, RotateCcw, Trophy, ScrollText,
  Target, Crosshair, Wrench, HelpCircle, Volume2, VolumeX, X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useLanguage } from '@/lib/i18n.tsx';
import { localizeCard, localizeEffectDescription } from '@/data/gameCardsTranslations.ts';
import { useDeviceMode } from '@/lib/deviceMode.tsx';
import { SettingsMenu } from './SettingsMenu.tsx';
import { SaveLoadMenu } from './SaveLoadMenu.tsx';
import { useSaveManager } from '@/hooks/useSaveManager.ts';

// Resurssikuvakkeet (sprite-assetit) HUD:iin
import resGoldIcon from '@/assets/sprites/res_gold.png';
import resFoodIcon from '@/assets/sprites/res_food.png';
import resHorseIcon from '@/assets/sprites/res_horse.png';



export const ProvinceGame = () => {
  const { t, lang } = useLanguage();
  const {
    gameStarted, playerFaction, gameState,
    pendingBattle, clearBattle,
    startGame, loadGameState, selectProvince, selectArmy, moveArmy, mergeArmies,
    nextPhase, endTurn, resetGame,
    playCard, buildStructure, recruitArmy,
    proposeTreaty, breakTreaty,
    declareWar, repairFort,
    getArmiesInProvince, getPlayerFaction, canMoveTo,
    collectResources,
  } = useProvinceGameState();

  const { playAmbient, stopAmbient, settings: audioSettings, toggleMute, musicTracks, currentTrack, selectTrack } = useAudioManager();
  const { autoSave, hasContinueGame, autosave: autosaveMeta, continueGame, saves } = useSaveManager();
  const { deviceMode } = useDeviceMode();
  const isMobileMode = deviceMode === 'mobile';
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Mobile mode opens as a bottom sheet on demand — desktop keeps the sidebar open by default.
  const [showSidebar, setShowSidebar] = useState(() => !isMobileMode);
  const [activeTab, setActiveTab] = useState('province');
  const [attackMode, setAttackMode] = useState(false);
  const [showAIOverlay, setShowAIOverlay] = useState(false);
  const [resourceNoticeDismissed, setResourceNoticeDismissed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mittaa yläpalkin ja vaihepalkin todellinen korkeus, jotta alla oleva
  // sisältö osataan sijoittaa oikein riippumatta siitä montako riviä
  // yläpalkki tarvitsee (mobiilissa resurssit siirtyvät omalle rivilleen,
  // jotta ne eivät koskaan jää painikkeiden alle).
  const hudRef = useRef<HTMLDivElement>(null);
  const phaseBarWrapRef = useRef<HTMLDivElement>(null);
  const [hudHeight, setHudHeight] = useState(48);
  const [phaseBarWrapHeight, setPhaseBarWrapHeight] = useState(40);
  useEffect(() => {
    const hudEl = hudRef.current;
    const phaseEl = phaseBarWrapRef.current;
    if (!hudEl || !phaseEl) return;
    const roHud = new ResizeObserver(() => setHudHeight(hudEl.offsetHeight));
    const roPhase = new ResizeObserver(() => setPhaseBarWrapHeight(phaseEl.offsetHeight));
    roHud.observe(hudEl);
    roPhase.observe(phaseEl);
    setHudHeight(hudEl.offsetHeight);
    setPhaseBarWrapHeight(phaseEl.offsetHeight);
    return () => { roHud.disconnect(); roPhase.disconnect(); };
  }, [isMobileMode]);
  const headerTotalH = hudHeight + phaseBarWrapHeight;

  // Korttipaneelin raahattava korkeus (pienennä/laajenna hiirellä)
  const HAND_BASE_H = 168;
  const [handHeight, setHandHeight] = useState<number>(HAND_BASE_H);
  const handDragRef = useRef<{ startY: number; startH: number } | null>(null);
  const onHandResizeStart = useCallback((clientY: number) => {
    handDragRef.current = { startY: clientY, startH: handHeight };
    const move = (y: number) => {
      if (!handDragRef.current) return;
      const dy = handDragRef.current.startY - y; // ylös = suurempi
      const next = Math.max(64, Math.min(360, handDragRef.current.startH + dy));
      setHandHeight(next);
    };
    const onMouseMove = (e: MouseEvent) => move(e.clientY);
    const onTouchMove = (e: TouchEvent) => { if (e.touches[0]) move(e.touches[0].clientY); };
    const end = () => {
      handDragRef.current = null;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', end);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', end);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', end);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', end);
  }, [handHeight]);
  // Mittaa korttien luonnollinen (skaalaamaton) korkeus, jotta ne mahtuvat
  // aina paneeliin kokonaan riippumatta tekstin määrästä.
  const handContentRef = useRef<HTMLDivElement>(null);
  const [handNaturalH, setHandNaturalH] = useState<number>(HAND_BASE_H);
  useEffect(() => {
    const el = handContentRef.current;
    if (!el) return;
    const measure = () => setHandNaturalH(Math.max(el.scrollHeight, 1));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [gameState?.hand]);
  // Skaalaa niin, että sisältö täyttää paneelin korkeuden mutta ei koskaan ylitä sitä.
  const handScale = Math.min(handHeight / Math.max(handNaturalH, 1), 1.6);

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
    if (!gameStarted) {
      stopAmbient();
      return;
    }

    playAmbient();
    const resumeMusic = () => playAmbient();
    document.addEventListener('pointerdown', resumeMusic, { once: true });
    document.addEventListener('keydown', resumeMusic, { once: true });

    return () => {
      document.removeEventListener('pointerdown', resumeMusic);
      document.removeEventListener('keydown', resumeMusic);
      stopAmbient();
    };
  }, [gameStarted, playAmbient, stopAmbient]);

  // Auto-collect resources when entering resource phase
  useEffect(() => {
    if (gameState?.phase === 'resource' && !gameState.resourcesCollected) {
      collectResources();
    }
  }, [gameState?.phase, gameState?.resourcesCollected, collectResources]);

  // Autosave once per turn so "Continue" on the start screen always has a recent game
  useEffect(() => {
    if (gameState && gameState.turn > 0) {
      autoSave(gameState as unknown as ProvinceGameState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState?.turn]);

  // Reset the dismissible resource-collection notice each time a new one appears
  useEffect(() => {
    setResourceNoticeDismissed(false);
  }, [gameState?.turn, gameState?.resourcesCollected]);

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

  // Faction select
  if (!gameStarted || !playerFaction) {
    const continueMeta = autosaveMeta ?? (saves.length > 0 ? [...saves].sort((a, b) => b.timestamp - a.timestamp)[0] : null);
    return (
      <ProvinceFactionSelect
        onSelect={(f, difficulty) => f && startGame(f, difficulty)}
        continueSave={hasContinueGame ? continueMeta : null}
        onContinue={() => {
          const state = continueGame();
          if (state) loadGameState(state as unknown as MVPGameState);
        }}
      />
    );
  }
  if (!gameState) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-950 via-amber-950/30 to-slate-950">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-amber-500/30" />
            <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
          </div>
          <p className="text-xl text-amber-200 animate-pulse">{t('common.loading')}</p>
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
      <div ref={hudRef} className="fixed top-0 left-0 right-0 z-30">
        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl border-b border-amber-700/20" />
        <div className={`relative flex px-2 sm:px-3 gap-1.5 ${isMobileMode ? 'flex-wrap items-center py-1.5' : 'h-12 items-center justify-between'}`}>
          {/* Left: Faction + Year */}
          <div className={`flex items-center gap-3 flex-shrink-0 ${isMobileMode ? 'order-1' : ''}`}>
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
          
          {/* Center: Resources — own full-width row on mobile so it can never be squeezed to nothing behind the control buttons */}
          {playerFactionData && (
            <div className={`flex items-center gap-1.5 sm:gap-3 rounded-lg border border-amber-800/25 bg-slate-800/40 px-2 sm:px-3 py-1 shadow-inner overflow-x-auto min-w-0 scrollbar-thin ${
              isMobileMode ? 'order-2 w-full basis-full max-w-none min-h-8' : 'max-w-[46vw] sm:max-w-none'
            }`}>
              <div className="flex items-center gap-1 flex-shrink-0" title={t('hud.gold')}>
                <img src={resGoldIcon} alt="" className="h-5 w-4 object-contain flex-shrink-0" draggable={false} />
                <span className="text-amber-100 font-bold text-sm tabular-nums">{playerFactionData.treasury}</span>
              </div>
              <div className="flex items-center gap-1" title={t('hud.food')}>
                <img src={resFoodIcon} alt="" className="h-5 w-4 object-contain" draggable={false} />
                <span className="text-green-100 font-bold text-sm tabular-nums">{gameState.food}</span>
              </div>
              <div className="flex items-center gap-1" title={t('hud.horses')}>
                <img src={resHorseIcon} alt="" className="h-5 w-4 object-contain" draggable={false} />
                <span className="text-blue-100 font-bold text-sm tabular-nums">{playerFactionData.horses}</span>
              </div>
              <div className="flex items-center gap-1" title={t('hud.manpower')}>
                <Users className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-blue-100 font-bold text-sm">{playerFactionData.manpower}</span>
              </div>
              <div className="flex items-center gap-1" title={t('hud.artisans')}>
                <Wrench className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-orange-100 font-bold text-sm">{gameState.artisans}</span>
              </div>
              <div className="flex items-center gap-1" title={t('hud.influence')}>
                <span className="text-sm">🕊️</span>
                <span className="text-sky-100 font-bold text-sm">{gameState.influence ?? 0}</span>
              </div>
              <div className="flex items-center gap-1" title={t('hud.prestige')}>
                <span className="text-sm">🏛️</span>
                <span className="text-purple-100 font-bold text-sm">{gameState.prestige ?? 0}</span>
              </div>
            </div>
          )}
          
          {/* Right: Controls */}
          <div className={`flex items-center gap-2 flex-shrink-0 ${isMobileMode ? 'order-3 ml-auto' : ''}`}>
            <SettingsMenu musicTracks={musicTracks} currentTrack={currentTrack} onSelectTrack={selectTrack} />
            <SaveLoadMenu gameState={gameState} onLoad={loadGameState} />
            <Button
              variant="ghost" size="icon"
              onClick={() => { setShowSidebar(true); setActiveTab('goals'); }}
              title={t('hud.goalsButton')}
              className={`text-amber-200/70 hover:text-amber-200 hover:bg-amber-900/30 ${isMobileMode ? 'h-11 w-11' : 'h-8 w-8'}`}
            >
              <Trophy className={isMobileMode ? 'w-5 h-5' : 'w-4 h-4'} />
            </Button>
            <Button
              variant="ghost" size="icon"
              onClick={toggleMute}
              title={audioSettings.muted ? t('hud.muteOn') : t('hud.muteOff')}
              className={`text-amber-200/70 hover:text-amber-200 hover:bg-amber-900/30 ${isMobileMode ? 'h-11 w-11' : 'h-8 w-8'}`}
            >
              {audioSettings.muted ? <VolumeX className={isMobileMode ? 'w-5 h-5' : 'w-4 h-4'} /> : <Volume2 className={isMobileMode ? 'w-5 h-5' : 'w-4 h-4'} />}
            </Button>
            {/* Simplified mobile HUD: hide the less-used codex/fullscreen shortcuts to save space */}
            {!isMobileMode && (
              <>
                <Link to="/codex" title={t('hud.codex')}>
                  <Button variant="ghost" size="icon" className="text-amber-200/70 hover:text-amber-200 hover:bg-amber-900/30 h-8 w-8">
                    <ScrollText className="w-4 h-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-amber-200/70 hover:text-amber-200 hover:bg-amber-900/30 h-8 w-8">
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
              </>
            )}
            <Button
              variant="ghost" size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
              className={`text-amber-200/70 hover:text-amber-200 hover:bg-amber-900/30 ${isMobileMode ? 'text-sm h-11 px-3' : 'text-xs h-8'}`}
            >
              {showSidebar ? t('hud.hide') : t('hud.menu')}
            </Button>
          </div>
        </div>
      </div>

      {/* ============= PHASE BAR ============= */}
      <div ref={phaseBarWrapRef} className="fixed left-0 right-0 z-40 px-3 py-1.5" style={{ top: hudHeight }}>
        <PhaseBar
          currentPhase={gameState.phase}
          onNextPhase={nextPhase}
          onEndTurn={endTurn}
          disabled={showAIOverlay}
          compact={!isMobileMode}
        />
      </div>


      {/* ============= RESOURCE COLLECTION RESULT ============= */}
      {gameState.phase === 'resource' && gameState.resourcesCollected && gameState.lastCollection && !resourceNoticeDismissed && (
        <div className="fixed left-1/2 -translate-x-1/2 z-10" style={{ top: headerTotalH + 20 }}>
          <Card className="relative bg-green-950/95 backdrop-blur-xl border-green-600/50 shadow-2xl animate-fade-in">
            <button
              type="button"
              onClick={() => setResourceNoticeDismissed(true)}
              aria-label={t('resource.close')}
              title={t('resource.close')}
              className="absolute top-1.5 right-1.5 p-1 rounded-md text-green-300/70 hover:text-green-100 hover:bg-green-800/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <CardContent className="p-4 text-center">
              <h3 className="text-green-100 font-bold text-lg mb-2">{t('resource.collected')}</h3>
              <div className="flex items-center justify-center gap-4 text-sm flex-wrap">
                <span className="text-amber-300">🪙 +{gameState.lastCollection.taxIncome} {t('resource.gold')}</span>
                <span className="text-blue-300">👥 +{gameState.lastCollection.manpowerGain} {t('resource.men')}</span>
                <span className="text-green-300">🌾 {gameState.lastCollection.foodChange >= 0 ? '+' : ''}{gameState.lastCollection.foodChange} {t('resource.food')}</span>
              </div>
              {(gameState.lastCollection.silkRoadBonus > 0 || gameState.lastCollection.marketBonus > 0 || gameState.lastCollection.influenceGain > 0 || gameState.lastCollection.prestigeGain > 0) && (
                <div className="flex items-center justify-center gap-3 text-xs text-stone-400 mt-1">
                  {gameState.lastCollection.silkRoadBonus > 0 && (
                    <span className="text-amber-400">🛤️ {t('resource.silkRoad')} +{gameState.lastCollection.silkRoadBonus}</span>
                  )}
                  {gameState.lastCollection.marketBonus > 0 && (
                    <span className="text-amber-400">🏪 {t('resource.market')} +{gameState.lastCollection.marketBonus}</span>
                  )}
                  {gameState.lastCollection.influenceGain > 0 && (
                    <span className="text-sky-300">🕊️ {t('resource.influence')} +{gameState.lastCollection.influenceGain}</span>
                  )}
                  {gameState.lastCollection.prestigeGain > 0 && (
                    <span className="text-purple-300">🏛️ {t('resource.prestige')} +{gameState.lastCollection.prestigeGain}</span>
                  )}
                </div>
              )}
              <p className="text-green-200/60 text-xs mt-2">{t('resource.continue')}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="relative h-full flex" style={{ paddingTop: headerTotalH }}>
        {/* Map */}
        <div className={`flex-1 relative transition-all duration-300 ${!isMobileMode && showSidebar ? 'lg:mr-[380px]' : ''}`}>
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
              defenseBonus={gameState.defenseBonus}
              buildingsMap={gameState.buildings || {}}
            />
          </div>
          
          {/* Army indicators on map */}
          {gameState.armies.filter(a => a.ownerId === playerFaction).length > 0 && selectedArmy && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10">
              <div className="bg-green-900/90 backdrop-blur-sm text-green-100 text-xs px-4 py-2 rounded-full border border-green-500/30">
                {t('hud.armySelected')}: 🐴{selectedArmy.cavalry} ⚔️{selectedArmy.infantry} • {t('hud.movement')}: {selectedArmy.movementLeft} • {t('hud.clickTarget')}
              </div>
            </div>
          )}
        </div>
        
        {/* ============= SIDEBAR (side panel on desktop, bottom sheet on mobile) ============= */}
        <div
          className={`fixed bg-slate-900/95 backdrop-blur-xl shadow-2xl transition-transform duration-300 overflow-hidden ${
            isMobileMode
              ? `left-0 right-0 bottom-0 top-auto h-[78vh] rounded-t-3xl border-t border-amber-700/30 z-50 ${showSidebar ? 'translate-y-0' : 'translate-y-full'}`
              : `right-0 bottom-0 w-full sm:w-[380px] border-l border-amber-700/20 z-20 ${showSidebar ? 'translate-x-0' : 'translate-x-full'}`
          }`}
          style={!isMobileMode ? { top: headerTotalH } : undefined}
        >
          <div className="h-full overflow-y-auto p-3 scrollbar-thin">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className={`w-full bg-slate-800/50 mb-3 grid grid-cols-4 ${isMobileMode ? 'h-12' : ''}`}>
                <TabsTrigger value="province" className={isMobileMode ? 'text-sm h-10' : 'text-xs px-1.5'}>
                  <Map className="w-3 h-3 mr-1" />{t('sidebar.tab.province')}
                </TabsTrigger>
                <TabsTrigger value="goals" className={isMobileMode ? 'text-sm h-10' : 'text-xs px-1.5'}>
                  <Trophy className="w-3 h-3 mr-1" />{t('sidebar.tab.goals')}
                </TabsTrigger>
                <TabsTrigger value="log" className={isMobileMode ? 'text-sm h-10' : 'text-xs px-1.5'}>
                  <ScrollText className="w-3 h-3 mr-1" />{t('sidebar.tab.log')}
                </TabsTrigger>
                <TabsTrigger value="diplomacy" className={isMobileMode ? 'text-sm h-10' : 'text-xs px-1.5'}>
                  <Handshake className="w-3 h-3 mr-1" />{t('sidebar.tab.diplomacy')}
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
                      onRecruitArmy={(type?: RecruitType) => recruitArmy(selectedProvince.id, type)}
                      onRepairFort={(useArtisan?: boolean) => repairFort(selectedProvince.id, !!useArtisan)}
                      canRepairGold={!!playerFactionData && playerFactionData.treasury >= 10}
                      canRepairArtisan={gameState.artisans >= 1}
                      canBuildFort={!!playerFactionData && gameState.phase === 'build' && playerFactionData.treasury >= 50 && gameState.artisans >= 2}
                      canRecruit={(() => {
                        if (!playerFactionData || !selectedProvince || selectedProvince.ownerId !== playerFaction) return false;
                        if (playerFactionData.treasury < 20 || playerFactionData.manpower < 5) return false;
                        const hasCamp = (gameState.buildings[selectedProvince.id] || []).includes('camp');
                        const isCapital = selectedProvince.id === playerFactionData.capitalId;
                        return hasCamp || isCapital;
                      })()}
                      attackBonus={gameState.attackBonus}
                      defenseBonus={gameState.defenseBonus}
                    />
                    
                    {/* Buildings */}
                    {selectedProvince.ownerId === playerFaction && gameState.phase === 'build' && (
                      <Card className="bg-gradient-to-b from-amber-950/40 to-slate-800/50 border-amber-600/40">
                        <CardContent className="p-4">
                          <h4 className="text-amber-100 font-bold text-base mb-3 flex items-center gap-2">
                            🏗️ Rakenna — {selectedProvince.name}
                          </h4>
                          
                          <div className="space-y-2.5">
                            {(Object.entries(BUILDING_INFO) as [MVPBuildingType, typeof BUILDING_INFO[MVPBuildingType]][])
                              .filter(([type]) => type !== 'wonder' || selectedProvince.id === playerFactionData?.capitalId)
                              .map(([type, info]) => {
                              const existing = gameState.buildings[selectedProvince.id] || [];
                              // Fortress: upgrades to level 3. Wonder: capped at WONDER_MAX. Others: once each.
                              const alreadyBuilt = type !== 'wonder' && existing.includes(type);
                              const hasGold = playerFactionData ? playerFactionData.treasury >= info.cost.gold : false;
                              const hasArtisans = info.cost.artisans ? gameState.artisans >= info.cost.artisans : true;
                              const canAfford = hasGold && hasArtisans;
                              
                              // Fortress special: can upgrade up to level 3
                              const isFortress = type === 'fortress';
                              const fortLevel = selectedProvince.fortLevel;
                              const fortMaxed = isFortress && fortLevel >= 3;
                              const fortCanUpgrade = isFortress && !fortMaxed;

                              // Wonder special: capped at WONDER_MAX per capital
                              const isWonder = type === 'wonder';
                              const wonderCount = isWonder ? existing.filter(b => b === 'wonder').length : 0;
                              const wonderMaxed = isWonder && wonderCount >= WONDER_MAX;
                              const wonderCanBuild = isWonder && !wonderMaxed;

                              const showAsBuilt = isFortress ? fortMaxed : isWonder ? wonderMaxed : alreadyBuilt;
                              const showBuildButton = isFortress ? fortCanUpgrade : isWonder ? wonderCanBuild : !alreadyBuilt;
                              
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
                                        {isWonder && wonderCount > 0 && (
                                          <span className="text-[10px] bg-amber-700/50 text-amber-200 px-1.5 py-0.5 rounded-full">
                                            {wonderCount}/{WONDER_MAX}{wonderMaxed ? ' (MAX)' : ''}
                                          </span>
                                        )}
                                        {!isFortress && !isWonder && alreadyBuilt && (
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
                            {selectedProvinceArmies.filter(a => a.ownerId === playerFaction).map(army => {
                              // Calculate attack power breakdown
                              const baseAttack = army.cavalry * 3 + army.infantry * 1.5 + army.siege;
                              const leaderBonus = army.leaderBonus || 0;
                              const moraleMultiplier = army.morale / 100;
                              const cardBonus = gameState.attackBonus;
                              
                              const totalAttack = Math.round(
                                baseAttack * (1 + leaderBonus) * moraleMultiplier + cardBonus
                              );
                              const baseDisplay = Math.round(baseAttack * (1 + leaderBonus) * moraleMultiplier);
                              
                              return (
                                <Button
                                  key={army.id}
                                  variant={gameState.selectedArmyId === army.id ? 'default' : 'outline'}
                                  className={`w-full justify-start text-xs ${
                                    gameState.selectedArmyId === army.id
                                      ? 'bg-green-600 hover:bg-green-500 text-white border-green-600'
                                      : 'bg-slate-700 text-slate-100 border-slate-600 hover:bg-slate-600'
                                  }`}
                                  onClick={() => { selectArmy(army.id); setAttackMode(false); }}
                                  disabled={army.movementLeft <= 0}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <span>🐴 {army.cavalry} ⚔️ {army.infantry} 🏗 {army.siege}</span>
                                    <div className="flex items-center gap-1">
                                      <span className="text-yellow-300 font-bold">
                                        ⚔️ {totalAttack}
                                        {cardBonus > 0 && (
                                          <span className="text-stone-300 text-[10px] ml-1">
                                            ({baseDisplay}+{cardBonus})
                                          </span>
                                        )}
                                      </span>
                                      <span>{army.movementLeft > 0 ? `👟${army.movementLeft}` : '⏳'}</span>
                                    </div>
                                  </div>
                                </Button>
                              );
                            })}
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

                          {gameState.selectedArmyId && selectedProvinceArmies.filter(a => a.ownerId === playerFaction).length > 1 && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full mt-2 text-xs border-amber-600 text-amber-200 hover:bg-amber-900/40"
                              onClick={() => {
                                const others = selectedProvinceArmies.filter(a => a.ownerId === playerFaction && a.id !== gameState.selectedArmyId);
                                if (others[0]) mergeArmies(gameState.selectedArmyId!, others[0].id);
                              }}
                            >
                              🔗 Yhdistä armeijat
                            </Button>
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
                      targetProvinces={VICTORY_TARGETS.provinces}
                      gold={getPlayerFaction()?.treasury || 0}
                      targetGold={VICTORY_TARGETS.gold}
                      techCount={gameState.playedTechCards.length}
                      targetTech={VICTORY_TARGETS.tech}
                    />
                  </CardContent>
                </Card>

                {/* Valtakuntien tilanne — läpinäkyvyys siitä miten lähellä kukin on voittoa */}
                <Card className="bg-slate-800/50 border-amber-700/30">
                  <CardContent className="p-3">
                    <h4 className="text-amber-100 text-xs font-bold mb-2">👑 Valtakuntien tilanne</h4>
                    <div className="space-y-1.5">
                      {(() => {
                        const totalSilkHubs = gameState.provinces.filter(p => p.hasSilkRoad).length;
                        return gameState.factions.map(f => {
                          const provinceCount = gameState.provinces.filter(p => p.ownerId === f.id).length;
                          const silkOwned = gameState.provinces.filter(p => p.hasSilkRoad && p.ownerId === f.id).length;
                          const hasSilkMajority = totalSilkHubs > 0 && silkOwned * 2 > totalSilkHubs;
                          const streak = f.id === playerFaction
                            ? (gameState.treasuryStreak || 0)
                            : (gameState.aiTreasuryStreaks?.[f.id] || 0);
                          const nearEconomicVictory = f.treasury >= VICTORY_TARGETS.gold && hasSilkMajority;
                          return (
                            <div key={f.id} className="flex items-center gap-2 text-xs bg-slate-900/40 rounded-lg px-2 py-1.5">
                              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: f.color }} />
                              <span className={`font-semibold flex-shrink-0 ${f.id === playerFaction ? 'text-amber-200' : 'text-slate-300'}`}>
                                {f.name}{f.id === playerFaction ? ' (sinä)' : ''}
                              </span>
                              <span className="text-slate-400 ml-auto">🗺️ {provinceCount}/{VICTORY_TARGETS.provinces}</span>
                              <span className="text-amber-300">💰 {f.treasury}/{VICTORY_TARGETS.gold}</span>
                              <span className={hasSilkMajority ? 'text-orange-300' : 'text-slate-500'}>🛤️ {silkOwned}/{totalSilkHubs}</span>
                              {nearEconomicVictory && (
                                <span className="text-red-300 font-bold" title="Talousvoiton ehdot täyttyvät — streak käynnissä">
                                  ⏳ {streak}/{VICTORY_TARGETS.treasuryStreak}
                                </span>
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </CardContent>
                </Card>

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
                      <h4 className="text-green-200 text-xs font-bold mb-1">🔬 Teknologiat ({gameState.playedTechCards.length})</h4>
                      {gameState.playedTechCards.map(c => {
                        const localized = localizeCard(c, lang);
                        const effectText = localizeEffectDescription(c.id, c.parsedEffect.description, lang);
                        return <p key={c.id} className="text-xs text-green-300">• {localized.name}: {effectText}</p>;
                      })}
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
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> {t('sidebar.reset')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ============= BOTTOM PANEL: Cards + Minimap ============= */}
      <div className={`fixed bottom-0 left-0 z-40 transition-all right-0 ${
        !isMobileMode && showSidebar ? 'sm:right-[380px]' : ''
      }`}>
        <div className="bg-slate-900/98 backdrop-blur-xl border-t-2 border-amber-500/30">
          {/* Vetokahva: raahaa ylös/alas suurentaaksesi tai pienentääksesi korttinäkymää */}
          <div
            className={`group relative cursor-ns-resize flex items-center justify-center touch-none select-none ${isMobileMode ? 'h-6' : 'h-3'}`}
            onMouseDown={(e) => { e.preventDefault(); onHandResizeStart(e.clientY); }}
            onTouchStart={(e) => { if (e.touches[0]) onHandResizeStart(e.touches[0].clientY); }}
            onDoubleClick={() => setHandHeight(HAND_BASE_H)}
            title={t('cards.dragHint')}
          >
            <div className="w-16 h-1 rounded-full bg-amber-500/40 group-hover:bg-amber-400/80 transition-colors" />
          </div>
          <div className="flex items-stretch" style={{ height: handHeight }}>
            {/* Minimap — hidden in mobile mode to keep the simplified view uncluttered */}
            {!isMobileMode && (
              <div className="w-[180px] flex-shrink-0 border-r border-slate-700/50 p-1.5">
                <div className="w-full h-full rounded-lg overflow-hidden border border-slate-600/30 bg-slate-800/50" style={{ minHeight: '60px' }}>
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
            )}


            {/* Cards — skaalautuu raahatun korkeuden mukaan, aina kokonaan näkyvissä */}
            <div className="flex-1 overflow-hidden">
              {gameState.hand && gameState.hand.length > 0 ? (
                <div
                  ref={handContentRef}
                  style={{
                    transform: `scale(${handScale})`,
                    transformOrigin: 'left top',
                    width: `${100 / handScale}%`,
                  }}
                  className="p-3"
                >
                  <CardHand
                    cards={gameState.hand}
                    onPlayCard={(card) => {
                      playCard(card);
                      const eff = card.parsedEffect;
                      const localized = localizeCard(card, lang);
                      const effectText = localizeEffectDescription(card.id, eff.description, lang);
                      toast.success(`🃏 ${localized.name}`, { description: effectText });
                    }}
                    canPlay={gameState.phase !== 'end'}
                    currentPhase={gameState.phase}
                    deckSize={gameState.deck?.length || 0}
                    discardSize={gameState.discard?.length || 0}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-amber-200/40 text-sm">
                  {t('cards.none')} • 📦 {gameState.deck?.length || 0} {t('cards.deckLabel')}
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
        <span className="opacity-0 group-hover:opacity-100 transition-opacity">{t('hud.backToHome')}</span>
      </Link>
    </div>
  );
};

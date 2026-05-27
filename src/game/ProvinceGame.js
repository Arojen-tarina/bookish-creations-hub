"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProvinceGame = void 0;
/**
 * ProvinceGame.tsx — Pelattava MVP-strategiapeli
 *
 * Kokonainen vuoropohjainen pelilooppi:
 * Resurssit → Kortit → Liike → Taistelu → Rakentaminen → Vuoron lopetus
 */
var react_1 = require("react");
var useAudioManager_ts_1 = require("@/hooks/useAudioManager.ts");
var useProvinceGameState_ts_1 = require("@/hooks/useProvinceGameState.ts");
var AITurnOverlay_tsx_1 = require("./AITurnOverlay.tsx");
var ProvinceFactionSelect_tsx_1 = require("./ProvinceFactionSelect.tsx");
var ProvinceMap_tsx_1 = require("./ProvinceMap.tsx");
var ProvinceInfoPanel_tsx_1 = require("./ProvinceInfoPanel.tsx");
var DiplomacyPanel_tsx_1 = require("./DiplomacyPanel.tsx");
var BattleDisplay_tsx_1 = require("./BattleDisplay.tsx");
var CardHand_tsx_1 = require("./CardHand.tsx");
var PhaseBar_tsx_1 = require("./PhaseBar.tsx");
var VictoryGoals_tsx_1 = require("./VictoryGoals.tsx");
var GameOverScreen_tsx_1 = require("./GameOverScreen.tsx");
var CreditsIntro_tsx_1 = require("./CreditsIntro.tsx");
var EngagementLayer_tsx_1 = require("./EngagementLayer.tsx");
var button_tsx_1 = require("@/components/ui/button.tsx");
var badge_tsx_1 = require("@/components/ui/badge.tsx");
var tabs_tsx_1 = require("@/components/ui/tabs.tsx");
var card_tsx_1 = require("@/components/ui/card.tsx");
var scroll_area_tsx_1 = require("@/components/ui/scroll-area.tsx");
var lucide_react_1 = require("lucide-react");
var react_router_dom_1 = require("react-router-dom");
var sonner_1 = require("sonner");
var ProvinceGame = function () {
    var _a, _b, _c, _d, _e, _f;
    var _g = (0, useProvinceGameState_ts_1.useProvinceGameState)(), gameStarted = _g.gameStarted, playerFaction = _g.playerFaction, gameState = _g.gameState, pendingBattle = _g.pendingBattle, clearBattle = _g.clearBattle, startGame = _g.startGame, selectProvince = _g.selectProvince, selectArmy = _g.selectArmy, moveArmy = _g.moveArmy, nextPhase = _g.nextPhase, endTurn = _g.endTurn, resetGame = _g.resetGame, playCard = _g.playCard, buildStructure = _g.buildStructure, recruitArmy = _g.recruitArmy, proposeTreaty = _g.proposeTreaty, breakTreaty = _g.breakTreaty, declareWar = _g.declareWar, repairFort = _g.repairFort, getArmiesInProvince = _g.getArmiesInProvince, getPlayerFaction = _g.getPlayerFaction, canMoveTo = _g.canMoveTo, collectResources = _g.collectResources;
    var _h = (0, useAudioManager_ts_1.useAudioManager)(), playAmbient = _h.playAmbient, stopAmbient = _h.stopAmbient;
    var _j = (0, react_1.useState)(false), isFullscreen = _j[0], setIsFullscreen = _j[1];
    var _k = (0, react_1.useState)(true), showSidebar = _k[0], setShowSidebar = _k[1];
    var _l = (0, react_1.useState)('province'), activeTab = _l[0], setActiveTab = _l[1];
    var _m = (0, react_1.useState)(false), attackMode = _m[0], setAttackMode = _m[1];
    var _o = (0, react_1.useState)(false), showAIOverlay = _o[0], setShowAIOverlay = _o[1];
    var _p = (0, react_1.useState)(false), introDone = _p[0], setIntroDone = _p[1];
    var containerRef = (0, react_1.useRef)(null);
    // Fullscreen
    var toggleFullscreen = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!containerRef.current)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    if (!!document.fullscreenElement) return [3 /*break*/, 3];
                    return [4 /*yield*/, containerRef.current.requestFullscreen()];
                case 2:
                    _a.sent();
                    setIsFullscreen(true);
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, document.exitFullscreen()];
                case 4:
                    _a.sent();
                    setIsFullscreen(false);
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    err_1 = _a.sent();
                    console.error(err_1);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); }, []);
    (0, react_1.useEffect)(function () {
        var h = function () { return setIsFullscreen(!!document.fullscreenElement); };
        document.addEventListener('fullscreenchange', h);
        return function () { return document.removeEventListener('fullscreenchange', h); };
    }, []);
    (0, react_1.useEffect)(function () {
        if (gameStarted) {
            playAmbient();
        }
        else {
            stopAmbient();
        }
        return function () { return stopAmbient(); };
    }, [gameStarted, playAmbient, stopAmbient]);
    // Auto-collect resources when entering resource phase
    (0, react_1.useEffect)(function () {
        if ((gameState === null || gameState === void 0 ? void 0 : gameState.phase) === 'resource' && !gameState.resourcesCollected) {
            collectResources();
        }
    }, [gameState === null || gameState === void 0 ? void 0 : gameState.phase, gameState === null || gameState === void 0 ? void 0 : gameState.resourcesCollected, collectResources]);
    // Show AI overlay after turn end
    (0, react_1.useEffect)(function () {
        if ((gameState === null || gameState === void 0 ? void 0 : gameState.aiActionLog) && gameState.aiActionLog.length > 0) {
            setShowAIOverlay(true);
        }
    }, [gameState === null || gameState === void 0 ? void 0 : gameState.turn, gameState === null || gameState === void 0 ? void 0 : gameState.aiActionLog]);
    // Province click handler
    var handleProvinceClick = (0, react_1.useCallback)(function (provinceId) {
        if (!gameState)
            return;
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
        return <CreditsIntro_tsx_1.CreditsIntro onDone={function () { return setIntroDone(true); }}/>;
    }
    // Faction select
    if (!gameStarted || !playerFaction) {
        return <ProvinceFactionSelect_tsx_1.ProvinceFactionSelect onSelect={function (f) { return f && startGame(f); }}/>;
    }
    if (!gameState) {
        return (<div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-slate-950 via-amber-950/30 to-slate-950">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-amber-500/30"/>
            <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin"/>
          </div>
          <p className="text-xl text-amber-200 animate-pulse">Ladataan...</p>
        </div>
      </div>);
    }
    var playerFactionData = getPlayerFaction();
    var selectedProvince = gameState.provinces.find(function (p) { return p.id === gameState.selectedProvinceId; });
    var selectedProvinceArmies = selectedProvince ? getArmiesInProvince(selectedProvince.id) : [];
    var selectedArmy = gameState.armies.find(function (a) { return a.id === gameState.selectedArmyId; });
    // Compute available moves/attacks for selected army
    var _q = (function () {
        if (!selectedArmy)
            return { availableMoves: [], attackableProvinces: [] };
        var moveable = gameState.provinces.filter(function (p) { return canMoveTo(selectedArmy.id, p.id); });
        var peaceful = [];
        var attacks = [];
        moveable.forEach(function (p) {
            var hasEnemy = gameState.armies.some(function (a) { return a.provinceId === p.id && a.ownerId !== selectedArmy.ownerId; });
            var isEnemyTerritory = p.ownerId !== null && p.ownerId !== selectedArmy.ownerId;
            if (hasEnemy || isEnemyTerritory)
                attacks.push(p.id);
            else
                peaceful.push(p.id);
        });
        return { availableMoves: peaceful, attackableProvinces: attacks };
    })(), availableMoves = _q.availableMoves, attackableProvinces = _q.attackableProvinces;
    var isVictory = gameState.gameOver && gameState.winnerId === playerFaction;
    var isDefeat = gameState.gameOver && gameState.winnerId !== playerFaction;
    return (<div ref={containerRef} className="fixed inset-0 w-screen min-h-[100dvh] overflow-hidden bg-slate-950" style={{ height: '100dvh' }}>
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-amber-950/20 to-slate-950"/>
      
      {/* ============= TOP HUD ============= */}
      <div className="fixed top-0 left-0 right-0 h-12 z-30">
        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl border-b border-amber-700/20"/>
        <div className="relative h-full flex items-center justify-between px-3">
          {/* Left: Faction + Year */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-2.5 py-1 border border-amber-700/20">
              <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: playerFactionData === null || playerFactionData === void 0 ? void 0 : playerFactionData.color }}/>
              <span className="text-amber-100 font-bold text-sm hidden sm:block">{playerFactionData === null || playerFactionData === void 0 ? void 0 : playerFactionData.name}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-800/50 rounded-lg px-2.5 py-1 border border-amber-700/20">
              <lucide_react_1.Clock className="w-3.5 h-3.5 text-amber-400"/>
              <span className="text-amber-200 font-mono text-sm">{gameState.year}</span>
              <span className="text-amber-200/40 text-xs">V{gameState.turn}</span>
            </div>
          </div>
          
          {/* Center: Resources */}
          {playerFactionData && (<div className="flex items-center gap-3 bg-slate-800/30 rounded-lg px-3 py-1">
              <div className="flex items-center gap-1" title="Kulta">
                <lucide_react_1.Coins className="w-3.5 h-3.5 text-amber-400"/>
                <span className="text-amber-100 font-bold text-sm">{playerFactionData.treasury}</span>
              </div>
              <div className="flex items-center gap-1" title="Ruoka">
                <lucide_react_1.Wheat className="w-3.5 h-3.5 text-green-400"/>
                <span className="text-green-100 font-bold text-sm">{gameState.food}</span>
              </div>
              <div className="flex items-center gap-1" title="Hevoset">
                <span className="text-sm">🐴</span>
                <span className="text-blue-100 font-bold text-sm">{playerFactionData.horses}</span>
              </div>
              <div className="flex items-center gap-1" title="Miesvoima">
                <lucide_react_1.Users className="w-3.5 h-3.5 text-blue-400"/>
                <span className="text-blue-100 font-bold text-sm">{playerFactionData.manpower}</span>
              </div>
              <div className="flex items-center gap-1" title="Käsityöläiset">
                <lucide_react_1.Wrench className="w-3.5 h-3.5 text-orange-400"/>
                <span className="text-orange-100 font-bold text-sm">{gameState.artisans}</span>
              </div>
            </div>)}
          
          {/* Right: Controls */}
          <div className="flex items-center gap-2">
            <button_tsx_1.Button variant="ghost" size="icon" onClick={toggleFullscreen} className="text-amber-200/70 hover:text-amber-200 hover:bg-amber-900/30 h-8 w-8">
              {isFullscreen ? <lucide_react_1.Minimize2 className="w-4 h-4"/> : <lucide_react_1.Maximize2 className="w-4 h-4"/>}
            </button_tsx_1.Button>
            <button_tsx_1.Button variant="ghost" size="sm" onClick={function () { return setShowSidebar(!showSidebar); }} className="text-amber-200/70 hover:text-amber-200 hover:bg-amber-900/30 text-xs h-8">
              {showSidebar ? '◀ Piilota' : '▶ Valikko'}
            </button_tsx_1.Button>
          </div>
        </div>
      </div>

      {/* ============= PHASE BAR ============= */}
      <div className="fixed top-12 left-0 right-0 z-40 px-3 py-1.5">
        <PhaseBar_tsx_1.PhaseBar currentPhase={gameState.phase} onNextPhase={nextPhase} onEndTurn={endTurn} disabled={showAIOverlay}/>
      </div>


      {/* ============= RESOURCE COLLECTION RESULT ============= */}
      {gameState.phase === 'resource' && gameState.resourcesCollected && gameState.lastCollection && (<div className="fixed top-[160px] left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <card_tsx_1.Card className="bg-green-950/95 backdrop-blur-xl border-green-600/50 shadow-2xl animate-fade-in">
            <card_tsx_1.CardContent className="p-4 text-center">
              <h3 className="text-green-100 font-bold text-lg mb-2">✅ Resurssit kerätty!</h3>
              <div className="flex items-center justify-center gap-4 text-sm flex-wrap">
                <span className="text-amber-300">🪙 +{gameState.lastCollection.taxIncome} kultaa</span>
                <span className="text-blue-300">👥 +{gameState.lastCollection.manpowerGain} miehiä</span>
                <span className="text-green-300">🌾 {gameState.lastCollection.foodChange >= 0 ? '+' : ''}{gameState.lastCollection.foodChange} ruokaa</span>
              </div>
              {(gameState.lastCollection.silkRoadBonus > 0 || gameState.lastCollection.marketBonus > 0) && (<div className="flex items-center justify-center gap-3 text-xs text-stone-400 mt-1">
                  {gameState.lastCollection.silkRoadBonus > 0 && (<span className="text-amber-400">🛤️ Silkkitie +{gameState.lastCollection.silkRoadBonus}</span>)}
                  {gameState.lastCollection.marketBonus > 0 && (<span className="text-amber-400">🏪 Markkinat +{gameState.lastCollection.marketBonus}</span>)}
                </div>)}
              <p className="text-green-200/60 text-xs mt-2">Jatka seuraavaan vaiheeseen →</p>
            </card_tsx_1.CardContent>
          </card_tsx_1.Card>
        </div>)}

      <div className="relative h-full pt-[88px] flex">
        {/* Map */}
        <div className={"flex-1 relative transition-all duration-300 ".concat(showSidebar ? 'lg:mr-[380px]' : '')}>
          <div className="absolute inset-0 p-1">
            <ProvinceMap_tsx_1.ProvinceMap provinces={gameState.provinces} armies={gameState.armies} selectedProvinceId={gameState.selectedProvinceId} selectedArmyId={gameState.selectedArmyId} onProvinceClick={handleProvinceClick} onArmyClick={selectArmy} playerFaction={playerFaction} highlightedProvinces={attackMode ? attackableProvinces : __spreadArray(__spreadArray([], availableMoves, true), attackableProvinces, true)} defenseBonus={gameState.defenseBonus}/>
          </div>
          
          {/* Army indicators on map */}
          {gameState.armies.filter(function (a) { return a.ownerId === playerFaction; }).length > 0 && selectedArmy && (<div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10">
              <div className="bg-green-900/90 backdrop-blur-sm text-green-100 text-xs px-4 py-2 rounded-full border border-green-500/30">
                Armeija valittu: 🐴{selectedArmy.cavalry} ⚔️{selectedArmy.infantry} • Liikettä: {selectedArmy.movementLeft} • Klikkaa kohdealuetta kartalla
              </div>
            </div>)}
        </div>
        
        {/* ============= SIDEBAR ============= */}
        <div className={"fixed top-[88px] right-0 bottom-0 w-[380px] bg-slate-900/95 backdrop-blur-xl border-l border-amber-700/20 shadow-2xl transition-transform duration-300 z-20 overflow-hidden ".concat(showSidebar ? 'translate-x-0' : 'translate-x-full')}>
          <div className="h-full overflow-y-auto p-3 scrollbar-thin">
            <tabs_tsx_1.Tabs value={activeTab} onValueChange={setActiveTab}>
              <tabs_tsx_1.TabsList className="w-full bg-slate-800/50 mb-3 grid grid-cols-4">
                <tabs_tsx_1.TabsTrigger value="province" className="text-xs px-1.5">
                  <lucide_react_1.Map className="w-3 h-3 mr-1"/>Alue
                </tabs_tsx_1.TabsTrigger>
                <tabs_tsx_1.TabsTrigger value="goals" className="text-xs px-1.5">
                  <lucide_react_1.Trophy className="w-3 h-3 mr-1"/>Tavoite
                </tabs_tsx_1.TabsTrigger>
                <tabs_tsx_1.TabsTrigger value="log" className="text-xs px-1.5">
                  <lucide_react_1.ScrollText className="w-3 h-3 mr-1"/>Loki
                </tabs_tsx_1.TabsTrigger>
                <tabs_tsx_1.TabsTrigger value="diplomacy" className="text-xs px-1.5">
                  <lucide_react_1.Handshake className="w-3 h-3 mr-1"/>Dipl.
                </tabs_tsx_1.TabsTrigger>
              </tabs_tsx_1.TabsList>
              
              {/* ============= PROVINCE TAB ============= */}
              <tabs_tsx_1.TabsContent value="province" className="space-y-3">
                {selectedProvince ? (<>
                    <ProvinceInfoPanel_tsx_1.ProvinceInfoPanel province={selectedProvince} armies={selectedProvinceArmies} playerFaction={playerFaction} onBuildFort={function () { return buildStructure(selectedProvince.id, 'fortress'); }} onRecruitArmy={function (type) { return recruitArmy(selectedProvince.id, type); }} onRepairFort={function (useArtisan) { return repairFort(selectedProvince.id, !!useArtisan); }} canRepairGold={!!playerFactionData && playerFactionData.treasury >= 10} canRepairArtisan={gameState.artisans >= 1} canBuildFort={!!playerFactionData && gameState.phase === 'build' && playerFactionData.treasury >= 50 && gameState.artisans >= 2} canRecruit={(function () {
                if (!playerFactionData || !selectedProvince || selectedProvince.ownerId !== playerFaction)
                    return false;
                if (playerFactionData.treasury < 20 || playerFactionData.manpower < 5)
                    return false;
                var hasCamp = (gameState.buildings[selectedProvince.id] || []).includes('camp');
                var isCapital = selectedProvince.id === playerFactionData.capitalId;
                return hasCamp || isCapital;
            })()} attackBonus={gameState.attackBonus} defenseBonus={gameState.defenseBonus}/>
                    
                    {/* Buildings */}
                    {selectedProvince.ownerId === playerFaction && gameState.phase === 'build' && (<card_tsx_1.Card className="bg-gradient-to-b from-amber-950/40 to-slate-800/50 border-amber-600/40">
                        <card_tsx_1.CardContent className="p-4">
                          <h4 className="text-amber-100 font-bold text-base mb-3 flex items-center gap-2">
                            🏗️ Rakenna — {selectedProvince.name}
                          </h4>
                          
                          <div className="space-y-2.5">
                            {Object.entries(useProvinceGameState_ts_1.BUILDING_INFO).map(function (_a) {
                    var type = _a[0], info = _a[1];
                    var existing = gameState.buildings[selectedProvince.id] || [];
                    var alreadyBuilt = existing.includes(type);
                    var hasGold = playerFactionData ? playerFactionData.treasury >= info.cost.gold : false;
                    var hasArtisans = info.cost.artisans ? gameState.artisans >= info.cost.artisans : true;
                    var canAfford = hasGold && hasArtisans;
                    // Fortress special: can upgrade up to level 3
                    var isFortress = type === 'fortress';
                    var fortLevel = selectedProvince.fortLevel;
                    var fortMaxed = isFortress && fortLevel >= 3;
                    var fortCanUpgrade = isFortress && !fortMaxed;
                    var showAsBuilt = isFortress ? fortMaxed : alreadyBuilt;
                    var showBuildButton = isFortress ? fortCanUpgrade : !alreadyBuilt;
                    return (<div key={type} className={"rounded-xl border-2 overflow-hidden transition-all ".concat(showAsBuilt
                            ? 'border-green-700/40 bg-green-900/20 opacity-70'
                            : canAfford
                                ? 'border-amber-500/40 bg-slate-800/60 hover:border-amber-400/60 hover:bg-slate-800/80'
                                : 'border-slate-700/30 bg-slate-800/30 opacity-50')}>
                                  <div className="flex items-center gap-3 p-3">
                                    {/* Emoji icon */}
                                    <div className={"w-11 h-11 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 ".concat(showAsBuilt ? 'bg-green-800/40' : 'bg-slate-700/50')}>
                                      {info.emoji}
                                    </div>
                                    
                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-amber-100 font-bold text-sm">{info.name}</span>
                                        {isFortress && fortLevel > 0 && (<span className="text-[10px] bg-amber-700/50 text-amber-200 px-1.5 py-0.5 rounded-full">
                                            Taso {fortLevel}{fortMaxed ? ' (MAX)' : ''}
                                          </span>)}
                                        {!isFortress && alreadyBuilt && (<span className="text-[10px] bg-green-700/50 text-green-200 px-1.5 py-0.5 rounded-full">✓ Rakennettu</span>)}
                                      </div>
                                      <p className="text-amber-200/60 text-xs mt-0.5">
                                        {isFortress
                            ? "+".concat(Math.min(3, (fortLevel + 1)), " puolustus (taso ").concat(Math.min(3, fortLevel + 1), "), garnisooni, +").concat(Math.round(Math.min(3, (fortLevel + 1)) * 35), "% puolustusvoima")
                            : info.effect}
                                      </p>
                                      
                                      {/* Cost */}
                                      {showBuildButton && (<div className="flex items-center gap-2 mt-1.5">
                                          <span className={"text-xs px-1.5 py-0.5 rounded ".concat(hasGold ? 'bg-amber-800/40 text-amber-300' : 'bg-red-900/40 text-red-300')}>
                                            🪙 {info.cost.gold}
                                          </span>
                                          {info.cost.artisans && (<span className={"text-xs px-1.5 py-0.5 rounded ".concat(hasArtisans ? 'bg-slate-700/50 text-slate-300' : 'bg-red-900/40 text-red-300')}>
                                              🔧 {info.cost.artisans}
                                            </span>)}
                                          {!canAfford && (<span className="text-red-400/70 text-[10px]">— resurssit eivät riitä</span>)}
                                        </div>)}
                                    </div>
                                    
                                    {/* Build button */}
                                    {showBuildButton && (<button_tsx_1.Button size="sm" disabled={!canAfford} onClick={function () {
                                buildStructure(selectedProvince.id, type);
                                sonner_1.toast.success("".concat(info.emoji, " ").concat(info.name, " ").concat(isFortress && fortLevel > 0 ? 'päivitetty' : 'rakennettu', "!"), {
                                    description: isFortress ? "Linnoitustaso ".concat(Math.min(3, fortLevel + 1), " \u2014 +").concat(Math.round(Math.min(3, fortLevel + 1) * 35), "% puolustus") : info.effect
                                });
                            }} className="bg-amber-600 hover:bg-amber-500 text-white font-bold h-9 px-4 rounded-lg flex-shrink-0 disabled:opacity-30">
                                        {isFortress && fortLevel > 0 ? 'Päivitä' : 'Rakenna'}
                                      </button_tsx_1.Button>)}
                                  </div>
                                </div>);
                })}
                          </div>

                          {/* Player resources summary */}
                          {playerFactionData && (<div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center gap-3 text-xs text-amber-200/60">
                              <span>Sinulla: 🪙 {playerFactionData.treasury}</span>
                              <span>🔧 {gameState.artisans}</span>
                            </div>)}
                        </card_tsx_1.CardContent>
                      </card_tsx_1.Card>)}

                    {/* Existing buildings (outside build phase) */}
                    {selectedProvince.ownerId === playerFaction && gameState.phase !== 'build' && (gameState.buildings[selectedProvince.id] || []).length > 0 && (<div className="flex gap-1.5 flex-wrap px-1">
                        {(gameState.buildings[selectedProvince.id] || []).map(function (b) { return (<badge_tsx_1.Badge key={b} className="text-xs bg-slate-800/60 border-amber-700/30">{useProvinceGameState_ts_1.BUILDING_INFO[b].emoji} {useProvinceGameState_ts_1.BUILDING_INFO[b].name}</badge_tsx_1.Badge>); })}
                      </div>)}
                    
                    {/* Army selection */}
                    {selectedProvinceArmies.filter(function (a) { return a.ownerId === playerFaction; }).length > 0 && (gameState.phase === 'move' || gameState.phase === 'battle') && (<card_tsx_1.Card className="bg-green-900/30 border-green-700/30">
                        <card_tsx_1.CardContent className="p-3">
                          <h4 className="text-green-200 text-sm font-semibold mb-2 flex items-center gap-1">
                            <lucide_react_1.Sword className="w-3.5 h-3.5"/> Armeijat
                          </h4>
                          <div className="space-y-1.5">
                            {selectedProvinceArmies.filter(function (a) { return a.ownerId === playerFaction; }).map(function (army) {
                    // Calculate attack power breakdown
                    var baseAttack = army.cavalry * 3 + army.infantry * 1.5 + army.siege;
                    var leaderBonus = army.leaderBonus || 0;
                    var moraleMultiplier = army.morale / 100;
                    var cardBonus = gameState.attackBonus;
                    var totalAttack = Math.round(baseAttack * (1 + leaderBonus) * moraleMultiplier + cardBonus);
                    var baseDisplay = Math.round(baseAttack * (1 + leaderBonus) * moraleMultiplier);
                    return (<button_tsx_1.Button key={army.id} variant={gameState.selectedArmyId === army.id ? 'default' : 'outline'} className={"w-full justify-start text-xs ".concat(gameState.selectedArmyId === army.id ? 'bg-green-600' : 'border-green-600 text-green-200')} onClick={function () { selectArmy(army.id); setAttackMode(false); }} disabled={army.movementLeft <= 0}>
                                  <div className="flex items-center justify-between w-full">
                                    <span>🐴 {army.cavalry} ⚔️ {army.infantry} 🏗 {army.siege}</span>
                                    <div className="flex items-center gap-1">
                                      <span className="text-yellow-300 font-bold">
                                        ⚔️ {totalAttack}
                                        {cardBonus > 0 && (<span className="text-stone-300 text-[10px] ml-1">
                                            ({baseDisplay}+{cardBonus})
                                          </span>)}
                                      </span>
                                      <span>{army.movementLeft > 0 ? "\uD83D\uDC5F".concat(army.movementLeft) : '⏳'}</span>
                                    </div>
                                  </div>
                                </button_tsx_1.Button>);
                })}
                          </div>
                          
                          {gameState.selectedArmyId && (<div className="mt-2 pt-2 border-t border-green-700/30 flex gap-3 text-[10px]">
                              {availableMoves.length > 0 && (<span className="text-green-300">🟢 Liiku ({availableMoves.length})</span>)}
                              {attackableProvinces.length > 0 && (<span className="text-red-300">🔴 Hyökkää ({attackableProvinces.length})</span>)}
                            </div>)}
                        </card_tsx_1.CardContent>
                      </card_tsx_1.Card>)}
                  </>) : (<card_tsx_1.Card className="bg-stone-800/50 border-stone-700/50">
                    <card_tsx_1.CardContent className="p-6 text-center text-stone-400">
                      <lucide_react_1.Map className="w-10 h-10 mx-auto mb-2 opacity-50"/>
                      <p className="text-sm">Valitse provinssi kartalta</p>
                    </card_tsx_1.CardContent>
                  </card_tsx_1.Card>)}
              </tabs_tsx_1.TabsContent>
              
              {/* ============= GOALS TAB ============= */}
              <tabs_tsx_1.TabsContent value="goals" className="space-y-3">
                <card_tsx_1.Card className="bg-slate-800/50 border-amber-700/30">
                  <card_tsx_1.CardContent className="p-3">
                    <VictoryGoals_tsx_1.VictoryGoals provincesOwned={gameState.provinces.filter(function (p) { return p.ownerId === playerFaction; }).length} targetProvinces={useProvinceGameState_ts_1.VICTORY_TARGETS.provinces} gold={((_a = getPlayerFaction()) === null || _a === void 0 ? void 0 : _a.treasury) || 0} targetGold={useProvinceGameState_ts_1.VICTORY_TARGETS.gold} techCount={gameState.playedTechCards.length} targetTech={useProvinceGameState_ts_1.VICTORY_TARGETS.tech}/>
                  </card_tsx_1.CardContent>
                </card_tsx_1.Card>
                
                {/* Active bonuses */}
                {(gameState.attackBonus > 0 || gameState.defenseBonus > 0 || gameState.movementBonus > 0) && (<card_tsx_1.Card className="bg-purple-900/30 border-purple-700/30">
                    <card_tsx_1.CardContent className="p-3">
                      <h4 className="text-purple-200 text-xs font-bold mb-1">✨ Aktiiviset bonukset</h4>
                      {gameState.attackBonus > 0 && <p className="text-xs text-red-300">⚔️ +{gameState.attackBonus} hyökkäys</p>}
                      {gameState.defenseBonus > 0 && <p className="text-xs text-blue-300">🛡️ +{gameState.defenseBonus} puolustus</p>}
                      {gameState.movementBonus > 0 && <p className="text-xs text-green-300">🐴 +{gameState.movementBonus} liike</p>}
                    </card_tsx_1.CardContent>
                  </card_tsx_1.Card>)}
                
                {/* Played tech cards */}
                {(((_b = gameState.playedTechCards) === null || _b === void 0 ? void 0 : _b.length) || 0) > 0 && (<card_tsx_1.Card className="bg-green-900/30 border-green-700/30">
                    <card_tsx_1.CardContent className="p-3">
                      <h4 className="text-green-200 text-xs font-bold mb-1">🔬 Teknologiat ({gameState.playedTechCards.length})</h4>
                      {gameState.playedTechCards.map(function (c) { return (<p key={c.id} className="text-xs text-green-300">• {c.name}: {c.parsedEffect.description}</p>); })}
                    </card_tsx_1.CardContent>
                  </card_tsx_1.Card>)}
                
                {/* Game stats */}
                <card_tsx_1.Card className="bg-slate-800/50 border-slate-700/30">
                  <card_tsx_1.CardContent className="p-3 space-y-1">
                    <h4 className="text-amber-100 text-xs font-bold">📊 Tilastot</h4>
                    <p className="text-xs text-slate-300">Alueet: {gameState.provinces.filter(function (p) { return p.ownerId === playerFaction; }).length}/{gameState.provinces.length}</p>
                    <p className="text-xs text-slate-300">Armeijat: {gameState.armies.filter(function (a) { return a.ownerId === playerFaction; }).length}</p>
                    <p className="text-xs text-slate-300">Kortit kädessä: {((_c = gameState.hand) === null || _c === void 0 ? void 0 : _c.length) || 0}</p>
                    <p className="text-xs text-slate-300">Rakennukset: {Object.values(gameState.buildings).flat().length}</p>
                  </card_tsx_1.CardContent>
                </card_tsx_1.Card>
              </tabs_tsx_1.TabsContent>
              
              {/* ============= LOG TAB ============= */}
              <tabs_tsx_1.TabsContent value="log" className="space-y-3">
                <card_tsx_1.Card className="bg-slate-800/50 border-amber-700/30">
                  <card_tsx_1.CardContent className="p-3">
                    <h4 className="text-amber-100 text-sm font-semibold mb-2 flex items-center gap-2">
                      <lucide_react_1.ScrollText className="w-4 h-4 text-amber-400"/>
                      AI-tapahtumaloki
                    </h4>
                    <scroll_area_tsx_1.ScrollArea className="h-[400px]">
                      {gameState.aiLog && gameState.aiLog.length > 0 ? (<div className="space-y-1">
                          {gameState.aiLog.map(function (msg, i) { return (<p key={i} className="text-xs text-slate-300 border-l-2 border-amber-600/30 pl-2 py-0.5">{msg}</p>); })}
                        </div>) : (<p className="text-xs text-slate-500">Ei tapahtumia vielä. Lopeta vuoro nähdäksesi AI:n toiminnot.</p>)}
                    </scroll_area_tsx_1.ScrollArea>
                  </card_tsx_1.CardContent>
                </card_tsx_1.Card>
              </tabs_tsx_1.TabsContent>
              
              {/* ============= DIPLOMACY TAB ============= */}
              <tabs_tsx_1.TabsContent value="diplomacy">
                <DiplomacyPanel_tsx_1.DiplomacyPanel factions={gameState.factions} relations={gameState.relations} playerFaction={playerFaction} onProposeTreaty={proposeTreaty} onBreakTreaty={breakTreaty}/>
              </tabs_tsx_1.TabsContent>
            </tabs_tsx_1.Tabs>
            

            {/* Reset button at bottom */}
            <div className="mt-4 pt-3 border-t border-slate-700/30">
              <button_tsx_1.Button variant="destructive" size="sm" className="w-full text-xs" onClick={resetGame}>
                <lucide_react_1.RotateCcw className="w-3.5 h-3.5 mr-1"/> Aloita alusta
              </button_tsx_1.Button>
            </div>
          </div>
        </div>
      </div>

      {/* ============= BOTTOM PANEL: Cards + Minimap ============= */}
      <div className={"fixed bottom-0 left-0 z-40 transition-all ".concat(showSidebar ? 'right-[380px]' : 'right-0')}>
        <div className="bg-slate-900/98 backdrop-blur-xl border-t-2 border-amber-500/30">
          <div className="flex items-stretch">
            {/* Minimap */}
            <div className="w-[180px] flex-shrink-0 border-r border-slate-700/50 p-1.5">
              <div className="w-full h-full rounded-lg overflow-hidden border border-slate-600/30 bg-slate-800/50" style={{ minHeight: '100px' }}>
                <ProvinceMap_tsx_1.ProvinceMap provinces={gameState.provinces} armies={gameState.armies} selectedProvinceId={gameState.selectedProvinceId} onProvinceClick={selectProvince} playerFaction={playerFaction} highlightedProvinces={[]} isMinimap/>
              </div>
            </div>


            {/* Cards */}
            <div className="flex-1 p-3 overflow-hidden">
              {gameState.hand && gameState.hand.length > 0 ? (<CardHand_tsx_1.CardHand cards={gameState.hand} onPlayCard={function (card) {
                playCard(card);
                var eff = card.parsedEffect;
                sonner_1.toast.success("\uD83C\uDCCF ".concat(card.name), { description: eff.description });
            }} canPlay={gameState.phase !== 'end'} currentPhase={gameState.phase} deckSize={((_d = gameState.deck) === null || _d === void 0 ? void 0 : _d.length) || 0} discardSize={((_e = gameState.discard) === null || _e === void 0 ? void 0 : _e.length) || 0}/>) : (<div className="flex items-center justify-center h-full text-amber-200/40 text-sm">
                  Ei kortteja kädessä • 📦 {((_f = gameState.deck) === null || _f === void 0 ? void 0 : _f.length) || 0} pakassa
                </div>)}
            </div>
          </div>
        </div>
      </div>

      {/* ============= ENGAGEMENT (juice) ============= */}
      <EngagementLayer_tsx_1.EngagementLayer gameState={gameState} playerFaction={playerFaction}/>

      {/* ============= OVERLAYS ============= */}
      <AITurnOverlay_tsx_1.AITurnOverlay actions={gameState.aiActionLog || []} isVisible={showAIOverlay} onComplete={function () { return setShowAIOverlay(false); }}/>

      <GameOverScreen_tsx_1.GameOverScreen isOpen={gameState.gameOver} isVictory={isVictory} winCondition={gameState.winCondition} turn={gameState.turn} year={gameState.year} onRestart={resetGame}/>
      
      <BattleDisplay_tsx_1.BattleDisplay battle={pendingBattle} onClose={clearBattle}/>

      {/* Back link */}
      <react_router_dom_1.Link to="/" className="fixed bottom-2 left-2 z-30 flex items-center gap-1.5 text-amber-200/40 hover:text-amber-200 transition-colors text-xs group">
        <lucide_react_1.ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1"/>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity">Etusivulle</span>
      </react_router_dom_1.Link>
    </div>);
};
exports.ProvinceGame = ProvinceGame;

"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
exports.useProvinceGameState = exports.BUILDING_INFO = exports.VICTORY_TARGETS = void 0;
ii; /**
 * useProvinceGameState.ts — Pelattavan MVP:n tilan hallinta
 *
 * Kokonainen vuoropohjainen pelilooppi:
 * Resurssit → Kortit → Liike → Taistelu → Rakentaminen → Vuoron lopetus
 * Sisältää: korttikäsi, AI-vuorot, rakennukset, voitto/häviöehdot.
 */
var react_1 = require("react");
var province_1 = require("@/types/province");
var ProvinceData_ts_1 = require("@/data/ProvinceData.ts");
var cards_1 = require("@/game/cards");
var ai_1 = require("@/game/ai");
var generateId = function () { return Math.random().toString(36).substr(2, 9); };
// ============= VICTORY TARGETS =============
exports.VICTORY_TARGETS = {
    provinces: 30, // ~40% of map
    gold: 500,
    tech: 5,
};
var PHASE_ORDER = ['resource', 'cards', 'move', 'battle', 'build', 'end'];
exports.BUILDING_INFO = {
    camp: { name: 'Leiri', emoji: '⛺', cost: { gold: 15 }, effect: '+2 ruokaa/vuoro, spawn-piste' },
    market: { name: 'Markkina', emoji: '🏪', cost: { gold: 25, artisans: 1 }, effect: '+3 kultaa/vuoro' },
    fortress: { name: 'Linnoitus', emoji: '🏯', cost: { gold: 50, artisans: 2 }, effect: '+3 puolustus' },
    workshop: { name: 'Paja', emoji: '🔨', cost: { gold: 30, artisans: 1 }, effect: '+1 käsityöläinen/vuoro' },
    stable: { name: 'Hevostalli', emoji: '🐎', cost: { gold: 40, artisans: 1 }, effect: '+1 hevonen/vuoro' },
};
// ============= INIT =============
var createFactions = function (playerFactionId) {
    return Object.keys(province_1.FACTION_DATA_1206).map(function (id) { return (__assign(__assign({}, province_1.FACTION_DATA_1206[id]), { isPlayer: id === playerFactionId })); });
};
var createDiplomaticRelations = function (factions) {
    var relations = [];
    for (var i = 0; i < factions.length; i++) {
        for (var j = i + 1; j < factions.length; j++) {
            var relation = 0;
            var threat = 30;
            if (factions[i].id === 'mongol' || factions[j].id === 'mongol') {
                relation = -20;
                threat = 60;
            }
            relations.push({
                factionA: factions[i].id,
                factionB: factions[j].id,
                relation: relation,
                trust: 50,
                threat: threat,
                treaties: [], borderFriction: 0, claims: [],
            });
        }
    }
    return relations;
};
var createStartingArmies = function (factions, provinces) {
    var armies = [];
    factions.forEach(function (faction) {
        var capital = provinces.find(function (p) { return p.id === faction.capitalId; });
        if (!capital)
            return;
        armies.push({
            id: "army-".concat(faction.id, "-main"),
            ownerId: faction.id,
            provinceId: capital.id,
            cavalry: faction.id === 'mongol' ? 12 : 5,
            infantry: faction.id === 'song' ? 15 : 8,
            siege: 1,
            morale: 80,
            supply: 30,
            movementLeft: 3,
            leaderBonus: faction.id === 'mongol' ? 0.3 : 0.1,
        });
    });
    return armies;
};
var calculateProvinceCenterDistance = function (a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
};
var equalizeStartingProvinceOwnership = function (provinces, factions) {
    var factionIds = factions.map(function (f) { return f.id; });
    var targetCount = Math.floor(provinces.length / factionIds.length);
    var currentCounts = factionIds.reduce(function (acc, factionId) {
        var _a;
        return (__assign(__assign({}, acc), (_a = {}, _a[factionId] = 0, _a)));
    }, {});
    var updatedProvinces = provinces.map(function (province) { return (__assign({}, province)); });
    var provinceById = new Map(updatedProvinces.map(function (p) { return [p.id, p]; }));
    updatedProvinces.forEach(function (province) {
        if (province.ownerId && currentCounts[province.ownerId] !== undefined) {
            currentCounts[province.ownerId] += 1;
        }
    });
    var getProvinceValue = function (province) { return province.baseTax + province.baseManpower + province.developmentLevel; };
    var releaseSurplusProvinces = function (factionId, surplus) {
        var faction = factions.find(function (f) { return f.id === factionId; });
        var capital = faction ? provinceById.get(faction.capitalId) : undefined;
        if (!capital)
            return;
        var owned = updatedProvinces
            .filter(function (p) { return p.ownerId === factionId && !p.isCapital; })
            .sort(function (a, b) {
            var aDist = calculateProvinceCenterDistance(a.center, capital.center);
            var bDist = calculateProvinceCenterDistance(b.center, capital.center);
            var aValue = getProvinceValue(a);
            var bValue = getProvinceValue(b);
            return aDist === bDist ? aValue - bValue : bDist - aDist;
        });
        for (var i = 0; i < surplus && i < owned.length; i += 1) {
            owned[i].ownerId = null;
            currentCounts[factionId] -= 1;
        }
    };
    factionIds.forEach(function (factionId) {
        var surplus = currentCounts[factionId] - targetCount;
        if (surplus > 0)
            releaseSurplusProvinces(factionId, surplus);
    });
    var getNeutralNeighbors = function (factionId) {
        var ownedIds = new Set(updatedProvinces.filter(function (p) { return p.ownerId === factionId; }).map(function (p) { return p.id; }));
        var neighbors = [];
        updatedProvinces.forEach(function (province) {
            if (province.ownerId !== null)
                return;
            if (province.neighbors.some(function (neighborId) { return ownedIds.has(neighborId); })) {
                neighbors.push(province);
            }
        });
        return neighbors.sort(function (a, b) {
            var faction = factions.find(function (f) { return f.id === factionId; });
            var capital = faction ? provinceById.get(faction.capitalId) : undefined;
            if (!capital)
                return 0;
            var aDist = calculateProvinceCenterDistance(a.center, capital.center);
            var bDist = calculateProvinceCenterDistance(b.center, capital.center);
            return aDist - bDist;
        });
    };
    var neutralPool = new Set(updatedProvinces.filter(function (p) { return p.ownerId === null; }).map(function (p) { return p.id; }));
    var changed = true;
    while (changed) {
        changed = false;
        for (var _i = 0, factionIds_1 = factionIds; _i < factionIds_1.length; _i++) {
            var factionId = factionIds_1[_i];
            var need = targetCount - currentCounts[factionId];
            if (need <= 0)
                continue;
            var adjacentNeutrals = getNeutralNeighbors(factionId).filter(function (p) { return neutralPool.has(p.id); });
            if (adjacentNeutrals.length === 0)
                continue;
            var chosen = adjacentNeutrals[0];
            chosen.ownerId = factionId;
            neutralPool.delete(chosen.id);
            currentCounts[factionId] += 1;
            changed = true;
        }
    }
    var remainingNeutrals = Array.from(neutralPool).map(function (id) { return provinceById.get(id); }).filter(Boolean);
    remainingNeutrals.forEach(function (province) {
        var closestFaction = factions
            .map(function (faction) {
            var _a, _b;
            return ({
                factionId: faction.id,
                distance: calculateProvinceCenterDistance(province.center, (_b = (_a = provinceById.get(faction.capitalId)) === null || _a === void 0 ? void 0 : _a.center) !== null && _b !== void 0 ? _b : { x: 0, y: 0 }),
            });
        })
            .sort(function (a, b) { return a.distance - b.distance; })[0];
        if (!closestFaction)
            return;
        var factionId = closestFaction.factionId;
        if (currentCounts[factionId] < targetCount) {
            province.ownerId = factionId;
            currentCounts[factionId] += 1;
            neutralPool.delete(province.id);
        }
    });
    return updatedProvinces;
};
var calculateSilkRoadBonus = function (ownedProvinces) {
    var silkRoadProvinces = ownedProvinces.filter(function (p) { return p.hasSilkRoad; });
    if (silkRoadProvinces.length === 0)
        return 0;
    var baseSilkIncome = silkRoadProvinces.reduce(function (sum, province) { return sum + province.baseTax; }, 0);
    var silkTradeBonus = silkRoadProvinces.filter(function (p) { return p.tradeGood === 'silk'; }).length * 2;
    var provinceMap = new Map(silkRoadProvinces.map(function (province) { return [province.id, province]; }));
    var visited = new Set();
    var chainBonus = 0;
    silkRoadProvinces.forEach(function (province) {
        if (visited.has(province.id))
            return;
        var queue = [province.id];
        visited.add(province.id);
        var clusterSize = 0;
        while (queue.length > 0) {
            var currentId = queue.shift();
            clusterSize += 1;
            var currentProvince = provinceMap.get(currentId);
            if (!currentProvince)
                continue;
            currentProvince.neighbors.forEach(function (neighborId) {
                if (visited.has(neighborId) || !provinceMap.has(neighborId))
                    return;
                visited.add(neighborId);
                queue.push(neighborId);
            });
        }
        if (clusterSize > 1) {
            chainBonus += (clusterSize - 1) * 2;
        }
    });
    return baseSilkIncome + silkTradeBonus + chainBonus;
};
var calculateResourceCollection = function (state, factionId) {
    var ownedProvinces = state.provinces.filter(function (p) { return p.ownerId === factionId; });
    var baseTaxIncome = ownedProvinces.reduce(function (sum, p) { return sum + p.baseTax; }, 0);
    var manpowerGain = Math.floor(ownedProvinces.reduce(function (sum, p) { return sum + p.baseManpower; }, 0) * 0.3);
    var silkRoadBonus = calculateSilkRoadBonus(ownedProvinces);
    var marketCount = Object.entries(state.buildings).filter(function (_a) {
        var pid = _a[0], buildings = _a[1];
        var p = state.provinces.find(function (pr) { return pr.id === pid; });
        return (p === null || p === void 0 ? void 0 : p.ownerId) === factionId && buildings.includes('market');
    }).length;
    var marketBonus = marketCount * 3;
    var taxIncome = baseTaxIncome + silkRoadBonus + marketBonus;
    var playerArmyCount = state.armies.filter(function (a) { return a.ownerId === factionId; }).length;
    var foodUpkeep = -playerArmyCount;
    var farmland = state.provinces.filter(function (p) { return p.ownerId === factionId && (p.terrain === 'farmland' || p.terrain === 'grassland'); }).length;
    var campCount = Object.entries(state.buildings).filter(function (_a) {
        var pid = _a[0], buildings = _a[1];
        var p = state.provinces.find(function (pr) { return pr.id === pid; });
        return (p === null || p === void 0 ? void 0 : p.ownerId) === factionId && buildings.includes('camp');
    }).length;
    var foodChange = foodUpkeep + Math.floor(farmland * 0.5) + campCount * 2;
    var horseProvinces = ownedProvinces.filter(function (p) { return p.terrain === 'steppe' || p.tradeGood === 'horses'; });
    var stableCount = Object.entries(state.buildings).filter(function (_a) {
        var pid = _a[0], buildings = _a[1];
        var p = state.provinces.find(function (pr) { return pr.id === pid; });
        return (p === null || p === void 0 ? void 0 : p.ownerId) === factionId && buildings.includes('stable');
    }).length;
    var horsesGain = horseProvinces.length + stableCount;
    var artisanProvinces = ownedProvinces.filter(function (p) { return p.terrain === 'farmland' || p.terrain === 'hills'; });
    var workshopCount = Object.entries(state.buildings).filter(function (_a) {
        var pid = _a[0], buildings = _a[1];
        var p = state.provinces.find(function (pr) { return pr.id === pid; });
        return (p === null || p === void 0 ? void 0 : p.ownerId) === factionId && buildings.includes('workshop');
    }).length;
    var artisansGain = Math.floor(artisanProvinces.length * 0.5) + workshopCount;
    if (ownedProvinces.length >= 3) {
        artisansGain = Math.max(1, artisansGain);
    }
    return { taxIncome: taxIncome, manpowerGain: manpowerGain, marketBonus: marketBonus, silkRoadBonus: silkRoadBonus, foodChange: foodChange, artisansGain: artisansGain, horsesGain: horsesGain };
};
// ============= COMBAT =============
var createProvinceGarrison = function (province) {
    if (!province.ownerId)
        return null;
    var infantry = Math.max(province.garrison, province.fortLevel > 0 ? province.fortLevel * 3 + Math.max(1, Math.floor(province.developmentLevel / 2)) : 0);
    if (infantry <= 0)
        return null;
    return {
        id: "garrison-".concat(province.id),
        ownerId: province.ownerId,
        provinceId: province.id,
        cavalry: 0,
        infantry: infantry,
        siege: 0,
        morale: Math.min(95, 55 + province.fortLevel * 10 + province.developmentLevel * 2),
        supply: 20,
        movementLeft: 0,
        leaderBonus: 0,
    };
};
var isWarTreaty = function (t) { return t.type === 'war_surprise' || t.type === 'war_formal'; };
var isWarActive = function (t, currentTurn) {
    return t.type === 'war_surprise' || (t.type === 'war_formal' && t.startTurn <= currentTurn);
};
var isPeacefulTreaty = function (t) {
    return ['non_aggression', 'peace', 'truce', 'alliance'].includes(t.type);
};
var getArmyTerrainMoveCost = function (terrainInfo, army) {
    if (army.siege > 0)
        return terrainInfo.movementCostSiege;
    if (army.cavalry >= army.infantry)
        return terrainInfo.movementCostCavalry;
    return terrainInfo.movementCostInfantry;
};
var activatePendingWars = function (state) {
    var updatedRelations = state.relations.map(function (rel) {
        if (!rel.treaties.some(function (t) { return t.type === 'war_formal' && t.startTurn <= state.turn; })) {
            return rel;
        }
        return __assign(__assign({}, rel), { relation: -90, trust: 0, threat: Math.min(100, rel.threat + 30) });
    });
    return __assign(__assign({}, state), { relations: updatedRelations });
};
var resolveCombat = function (attacker, defender, terrain, attackBonus, defenseBonus) {
    if (attackBonus === void 0) { attackBonus = 0; }
    if (defenseBonus === void 0) { defenseBonus = 0; }
    var terrainInfo = province_1.PROVINCE_TERRAIN_INFO[terrain.terrain];
    var calculateLoss = function (units, ratio) {
        return units <= 0 ? 0 : Math.max(1, Math.round(units * ratio * (0.6 + Math.random() * 0.4)));
    };
    var attackerPower = (attacker.cavalry * 3 +
        attacker.infantry * 1.5 +
        attacker.siege) * (1 + attacker.leaderBonus) * (attacker.morale / 100) + attackBonus;
    var defenderPower = (defender.cavalry * 2 +
        defender.infantry * 2 +
        defender.siege) * (1 + terrainInfo.defenseBonus * 0.2) * (1 + terrain.fortLevel * 0.35) * (defender.morale / 100) + defenseBonus;
    var attackRoll = Math.floor(Math.random() * 6) + 1;
    var defenseRoll = Math.floor(Math.random() * 6) + 1;
    var ratio = (attackerPower + attackRoll * 2) / Math.max(1, defenderPower + defenseRoll * 2);
    // Defender wins ties — hyökkääjän pitää oikeasti olla puolustajaa vahvempi
    var attackerWins = ratio > 1.1;
    var attackerLossRatio = attackerWins ? 0.14 : 0.32;
    var defenderLossRatio = attackerWins ? 0.42 : 0.16;
    var defenderRemaining = defender.cavalry + defender.infantry -
        calculateLoss(defender.cavalry, defenderLossRatio) -
        calculateLoss(defender.infantry, defenderLossRatio);
    return {
        attackerWins: attackerWins,
        defenderDestroyed: attackerWins && defenderRemaining <= 0,
        attackerCavalryLoss: calculateLoss(attacker.cavalry, attackerLossRatio),
        attackerInfantryLoss: calculateLoss(attacker.infantry, attackerLossRatio),
        defenderCavalryLoss: calculateLoss(defender.cavalry, defenderLossRatio),
        defenderInfantryLoss: calculateLoss(defender.infantry, defenderLossRatio),
        attackRoll: attackRoll,
        defenseRoll: defenseRoll,
    };
};
var useProvinceGameState = function () {
    var _a = (0, react_1.useState)(false), gameStarted = _a[0], setGameStarted = _a[1];
    var _b = (0, react_1.useState)(null), playerFaction = _b[0], setPlayerFaction = _b[1];
    var _c = (0, react_1.useState)(null), gameState = _c[0], setGameState = _c[1];
    var _d = (0, react_1.useState)(null), pendingBattle = _d[0], setPendingBattle = _d[1];
    // ============= START GAME =============
    var startGame = (0, react_1.useCallback)(function (selectedFaction) {
        var initialFactions = createFactions(selectedFaction);
        var rawProvinces = (0, ProvinceData_ts_1.getProvincesWithAdjacency)();
        var provinces = equalizeStartingProvinceOwnership(rawProvinces, initialFactions);
        // Filter factions to those that actually have presence on the map (or are the selected player)
        var visibleFactions = initialFactions.filter(function (f) {
            return f.id === selectedFaction || provinces.some(function (p) { return p.ownerId === f.id; });
        });
        var relations = createDiplomaticRelations(visibleFactions);
        var armies = createStartingArmies(visibleFactions, provinces);
        var deck = (0, cards_1.createPlayableDeck)();
        var _a = (0, cards_1.drawCards)(deck, 5), drawn = _a.drawn, remaining = _a.remaining; // Starting hand
        var initialState = {
            turn: 1,
            year: 1206,
            currentPlayerId: selectedFaction,
            phase: 'resource',
            provinces: provinces,
            factions: visibleFactions,
            relations: relations,
            armies: armies,
            activeEvents: [],
            eventDeck: [],
            selectedProvinceId: null,
            selectedArmyId: null,
            gameOver: false,
            winnerId: null,
            gameSpeed: 'normal',
            difficulty: 'normal',
            // Cards
            deck: remaining,
            hand: drawn,
            discard: [],
            playedTechCards: [],
            attackBonus: 0,
            defenseBonus: 0,
            movementBonus: 0,
            // Buildings
            buildings: {},
            // Resources
            food: 10,
            artisans: 3,
            // AI
            aiLog: [],
            aiActionLog: [],
            resourcesCollected: false,
            lastCollection: null,
            winCondition: null,
        };
        setPlayerFaction(selectedFaction);
        setGameState(initialState);
        setGameStarted(true);
    }, []);
    // ============= PROVINCE SELECTION =============
    var selectProvince = (0, react_1.useCallback)(function (provinceId) {
        setGameState(function (prev) { return prev ? __assign(__assign({}, prev), { selectedProvinceId: provinceId, selectedArmyId: null }) : null; });
    }, []);
    // ============= ARMY SELECTION =============
    var selectArmy = (0, react_1.useCallback)(function (armyId) {
        setGameState(function (prev) {
            if (!prev)
                return null;
            var army = prev.armies.find(function (a) { return a.id === armyId; });
            // Don't allow selecting AI armies
            if (army && army.ownerId !== playerFaction)
                return prev;
            return __assign(__assign({}, prev), { selectedArmyId: armyId, selectedProvinceId: (army === null || army === void 0 ? void 0 : army.provinceId) || prev.selectedProvinceId });
        });
    }, [playerFaction]);
    // ============= CAN MOVE =============
    var canMoveTo = (0, react_1.useCallback)(function (armyId, targetProvinceId) {
        if (!gameState)
            return false;
        var army = gameState.armies.find(function (a) { return a.id === armyId; });
        if (!army || army.movementLeft <= 0)
            return false;
        var currentProvince = gameState.provinces.find(function (p) { return p.id === army.provinceId; });
        var targetProvince = gameState.provinces.find(function (p) { return p.id === targetProvinceId; });
        if (!currentProvince || !targetProvince)
            return false;
        if (!currentProvince.neighbors.includes(targetProvinceId))
            return false;
        if (targetProvince.ownerId && targetProvince.ownerId !== army.ownerId) {
            var relation = gameState.relations.find(function (r) {
                return (r.factionA === army.ownerId && r.factionB === targetProvince.ownerId) ||
                    (r.factionB === army.ownerId && r.factionA === targetProvince.ownerId);
            });
            if (relation) {
                var warActive = relation.treaties.some(function (t) { return isWarActive(t, gameState.turn); });
                var peaceTreaty = relation.treaties.some(isPeacefulTreaty);
                if (peaceTreaty && !warActive)
                    return false;
            }
        }
        var terrainInfo = province_1.PROVINCE_TERRAIN_INFO[targetProvince.terrain];
        var moveCost = Math.max(1, getArmyTerrainMoveCost(terrainInfo, army) - (gameState.movementBonus > 0 ? 1 : 0));
        if (army.movementLeft < moveCost)
            return false;
        return true;
    }, [gameState]);
    // ============= MOVE ARMY =============
    var moveArmy = (0, react_1.useCallback)(function (armyId, targetProvinceId) {
        if (!canMoveTo(armyId, targetProvinceId))
            return;
        setGameState(function (prev) {
            try {
                if (!prev)
                    return null;
                var armyIndex = prev.armies.findIndex(function (a) { return a.id === armyId; });
                if (armyIndex === -1)
                    return prev;
                var army_1 = prev.armies[armyIndex];
                var targetProvince_1 = prev.provinces.find(function (p) { return p.id === targetProvinceId; });
                if (!targetProvince_1)
                    return prev;
                var terrainInfo = province_1.PROVINCE_TERRAIN_INFO[targetProvince_1.terrain];
                var moveCost = Math.max(1, getArmyTerrainMoveCost(terrainInfo, army_1) - (prev.movementBonus > 0 ? 1 : 0));
                // Check for combat (enemy army OR fortified/garrisoned enemy province)
                var enemyArmies_1 = prev.armies.filter(function (a) { return a.provinceId === targetProvinceId && a.ownerId !== army_1.ownerId; });
                var provinceGarrison = targetProvince_1.ownerId && targetProvince_1.ownerId !== army_1.ownerId
                    ? createProvinceGarrison(targetProvince_1)
                    : null;
                // Combine defending army with the province garrison so that fortifications
                // actually contribute their soldiers to the defending force.
                var defender = enemyArmies_1[0] || provinceGarrison;
                if (enemyArmies_1[0] && provinceGarrison) {
                    defender = __assign(__assign({}, enemyArmies_1[0]), { infantry: enemyArmies_1[0].infantry + provinceGarrison.infantry, morale: Math.max(enemyArmies_1[0].morale, provinceGarrison.morale) });
                }
                var newArmies = __spreadArray([], prev.armies, true);
                var newProvinces = __spreadArray([], prev.provinces, true);
                if (defender) {
                    var result = resolveCombat(army_1, defender, targetProvince_1, prev.attackBonus, prev.defenseBonus);
                    var battleResult_1 = {
                        attacker: __assign({}, army_1),
                        defender: __assign({}, defender),
                        attackerFaction: army_1.ownerId,
                        defenderFaction: defender.ownerId,
                        provinceName: targetProvince_1.name,
                        winner: result.attackerWins ? 'attacker' : 'defender',
                        attackerLosses: { cavalry: result.attackerCavalryLoss, infantry: result.attackerInfantryLoss },
                        defenderLosses: { cavalry: result.defenderCavalryLoss, infantry: result.defenderInfantryLoss },
                        attackerMoraleLoss: result.attackerWins ? 10 : 20,
                        defenderMoraleLoss: result.attackerWins ? 20 : 10,
                        attackRoll: result.attackRoll,
                        defenseRoll: result.defenseRoll,
                    };
                    setTimeout(function () { return setPendingBattle(battleResult_1); }, 50);
                    if (result.attackerWins) {
                        // If the province has fortifications, damage them first.
                        var pIdx = newProvinces.findIndex(function (p) { return p.id === targetProvinceId; });
                        var targetFortLevel = pIdx !== -1 ? newProvinces[pIdx].fortLevel : 0;
                        if (targetFortLevel > 0) {
                            // Successful attacker reduces fort level instead of immediately capturing
                            var newFortLevel = Math.max(0, targetFortLevel - 1);
                            if (pIdx !== -1) {
                                newProvinces[pIdx] = __assign(__assign({}, newProvinces[pIdx]), { fortLevel: newFortLevel });
                            }
                            // Attacker still loses some units from the assault
                            newArmies[armyIndex] = __assign(__assign({}, army_1), { movementLeft: 0, cavalry: Math.max(0, army_1.cavalry - result.attackerCavalryLoss), infantry: Math.max(0, army_1.infantry - result.attackerInfantryLoss), morale: Math.max(20, army_1.morale - 10) });
                            // If defending field army exists, reduce its units
                            if (enemyArmies_1[0]) {
                                var defIdx = newArmies.findIndex(function (a) { return a.id === enemyArmies_1[0].id; });
                                if (defIdx !== -1) {
                                    newArmies[defIdx] = __assign(__assign({}, enemyArmies_1[0]), { cavalry: Math.max(0, enemyArmies_1[0].cavalry - result.defenderCavalryLoss), infantry: Math.max(0, enemyArmies_1[0].infantry - result.defenderInfantryLoss), morale: Math.max(20, enemyArmies_1[0].morale - 20) });
                                }
                            }
                            // Province not captured until fortLevel == 0
                        }
                        else {
                            // No fortifications: normal capture behaviour
                            newArmies[armyIndex] = __assign(__assign({}, army_1), { provinceId: targetProvinceId, movementLeft: 0, cavalry: Math.max(0, army_1.cavalry - result.attackerCavalryLoss), infantry: Math.max(0, army_1.infantry - result.attackerInfantryLoss), morale: Math.max(20, army_1.morale - 10) });
                            if (enemyArmies_1[0]) {
                                if (result.defenderDestroyed) {
                                    newArmies = newArmies.filter(function (a) { return a.id !== enemyArmies_1[0].id; });
                                }
                                else {
                                    var defIdx = newArmies.findIndex(function (a) { return a.id === enemyArmies_1[0].id; });
                                    newArmies[defIdx] = __assign(__assign({}, enemyArmies_1[0]), { cavalry: Math.max(0, enemyArmies_1[0].cavalry - result.defenderCavalryLoss), infantry: Math.max(0, enemyArmies_1[0].infantry - result.defenderInfantryLoss), morale: Math.max(20, enemyArmies_1[0].morale - 20) });
                                }
                            }
                            if (pIdx !== -1) {
                                newProvinces[pIdx] = __assign(__assign({}, newProvinces[pIdx]), { ownerId: army_1.ownerId, unrest: 30, garrison: provinceGarrison ? Math.max(0, defender.infantry - result.defenderInfantryLoss) : newProvinces[pIdx].garrison });
                            }
                        }
                    }
                    else {
                        newArmies[armyIndex] = __assign(__assign({}, army_1), { movementLeft: 0, cavalry: Math.max(0, army_1.cavalry - result.attackerCavalryLoss), infantry: Math.max(0, army_1.infantry - result.attackerInfantryLoss), morale: Math.max(20, army_1.morale - 20) });
                    }
                }
                else {
                    // Peaceful movement
                    newArmies[armyIndex] = __assign(__assign({}, army_1), { provinceId: targetProvinceId, movementLeft: army_1.movementLeft - moveCost });
                    if (targetProvince_1.ownerId === null || (targetProvince_1.ownerId !== army_1.ownerId && !prev.armies.some(function (a) { return a.provinceId === targetProvinceId && a.ownerId === targetProvince_1.ownerId; }))) {
                        var pIdx = newProvinces.findIndex(function (p) { return p.id === targetProvinceId; });
                        if (pIdx !== -1)
                            newProvinces[pIdx] = __assign(__assign({}, newProvinces[pIdx]), { ownerId: army_1.ownerId });
                    }
                }
                newArmies = newArmies.filter(function (a) { return a.cavalry + a.infantry > 0; });
                return __assign(__assign({}, prev), { armies: newArmies, provinces: newProvinces, selectedArmyId: null, attackBonus: 0 });
            }
            catch (err) {
                // Defensive: log and skip state mutation to avoid runtime crash
                // eslint-disable-next-line no-console
                console.error('moveArmy error:', err);
                return prev;
            }
        });
    }, [canMoveTo]);
    // ============= WAR DECLARATIONS =============
    // (declareWar moved below after `proposeTreaty` definition to avoid TDZ)
    // ============= REPAIR FORT =============
    var repairFort = (0, react_1.useCallback)(function (provinceId, useArtisan) {
        setGameState(function (prev) {
            if (!prev || !playerFaction)
                return prev;
            var province = prev.provinces.find(function (p) { return p.id === provinceId; });
            if (!province || province.ownerId !== playerFaction)
                return prev;
            if (province.fortLevel <= 0)
                return prev;
            var faction = prev.factions.find(function (f) { return f.id === playerFaction; });
            if (!faction)
                return prev;
            var goldCost = 10;
            var artisanCost = 1;
            if (faction.treasury < goldCost)
                return prev;
            if (useArtisan && prev.artisans < artisanCost)
                return prev;
            var newFactions = prev.factions.map(function (f) { return f.id === playerFaction ? __assign(__assign({}, f), { treasury: f.treasury - goldCost }) : f; });
            var newArtisans = useArtisan ? prev.artisans - artisanCost : prev.artisans;
            var newProvinces = prev.provinces.map(function (p) { return p.id === provinceId ? __assign(__assign({}, p), { fortLevel: Math.min(3, p.fortLevel + 1) }) : p; });
            return __assign(__assign({}, prev), { factions: newFactions, artisans: newArtisans, provinces: newProvinces });
        });
    }, [playerFaction]);
    // ============= PLAY CARD =============
    var playCard = (0, react_1.useCallback)(function (card) {
        setGameState(function (prev) {
            if (!prev || !playerFaction)
                return prev;
            var newHand = prev.hand.filter(function (c) { return c.id !== card.id; });
            var newDiscard = __spreadArray(__spreadArray([], prev.discard, true), [card], false);
            var faction = prev.factions.find(function (f) { return f.id === playerFaction; });
            if (!faction)
                return prev;
            var newState = __assign(__assign({}, prev), { hand: newHand, discard: newDiscard });
            var effect = card.parsedEffect;
            switch (effect.type) {
                case 'gold':
                    newState.factions = prev.factions.map(function (f) { return f.id === playerFaction ? __assign(__assign({}, f), { treasury: f.treasury + effect.value }) : f; });
                    break;
                case 'food':
                    newState.food = prev.food + effect.value;
                    break;
                case 'horses':
                    newState.factions = prev.factions.map(function (f) { return f.id === playerFaction ? __assign(__assign({}, f), { horses: f.horses + effect.value }) : f; });
                    break;
                case 'artisans':
                    newState.artisans = prev.artisans + effect.value;
                    break;
                case 'attack_bonus':
                    newState.attackBonus = prev.attackBonus + effect.value;
                    break;
                case 'defense_bonus':
                    newState.defenseBonus = prev.defenseBonus + effect.value;
                    break;
                case 'movement_bonus':
                    newState.movementBonus = prev.movementBonus + effect.value;
                    // Apply to all player armies
                    newState.armies = prev.armies.map(function (a) { return a.ownerId === playerFaction ? __assign(__assign({}, a), { movementLeft: a.movementLeft + effect.value }) : a; });
                    break;
                case 'permanent_attack':
                case 'permanent_defense':
                    newState.playedTechCards = __spreadArray(__spreadArray([], prev.playedTechCards, true), [card], false);
                    break;
                case 'terrain_ignore':
                    newState.movementBonus = prev.movementBonus + 1;
                    break;
            }
            return newState;
        });
    }, [playerFaction]);
    // ============= BUILD STRUCTURE =============
    var buildStructure = (0, react_1.useCallback)(function (provinceId, type) {
        setGameState(function (prev) {
            var _a;
            if (!prev || !playerFaction || prev.phase !== 'build')
                return prev;
            var province = prev.provinces.find(function (p) { return p.id === provinceId; });
            if (!province || province.ownerId !== playerFaction)
                return prev;
            var info = exports.BUILDING_INFO[type];
            var faction = prev.factions.find(function (f) { return f.id === playerFaction; });
            if (!faction || faction.treasury < info.cost.gold)
                return prev;
            if (info.cost.artisans && prev.artisans < info.cost.artisans)
                return prev;
            var existing = prev.buildings[provinceId] || [];
            // Fortress can be built multiple times (upgrades fortLevel up to 3)
            if (type === 'fortress') {
                var currentFortLevel = province.fortLevel;
                if (currentFortLevel >= 3)
                    return prev; // Max level reached
            }
            else {
                if (existing.includes(type))
                    return prev; // Other buildings only once
            }
            var newFactions = prev.factions.map(function (f) { return f.id === playerFaction ? __assign(__assign({}, f), { treasury: f.treasury - info.cost.gold }) : f; });
            var newArtisans = prev.artisans - (info.cost.artisans || 0);
            var newBuildings = __assign(__assign({}, prev.buildings), (_a = {}, _a[provinceId] = __spreadArray(__spreadArray([], existing, true), [type], false), _a));
            var newProvinces = prev.provinces;
            if (type === 'fortress') {
                newProvinces = prev.provinces.map(function (p) { return p.id === provinceId
                    ? __assign(__assign({}, p), { fortLevel: Math.min(3, p.fortLevel + 1), garrison: Math.max(p.garrison, 2 + Math.min(4, p.fortLevel + 1)) }) : p; });
            }
            return __assign(__assign({}, prev), { factions: newFactions, artisans: newArtisans, buildings: newBuildings, provinces: newProvinces });
        });
    }, [playerFaction]);
    // ============= RECRUIT ARMY =============
    var recruitArmy = (0, react_1.useCallback)(function (provinceId, type) {
        if (type === void 0) { type = 'infantry'; }
        setGameState(function (prev) {
            if (!prev || !playerFaction)
                return prev;
            var province = prev.provinces.find(function (p) { return p.id === provinceId; });
            if (!province || province.ownerId !== playerFaction)
                return prev;
            var faction = prev.factions.find(function (f) { return f.id === playerFaction; });
            if (!faction)
                return prev;
            // Recruitment costs per new rules
            // Infantry: 10 gold, 5 food
            // Cavalry: 20 gold, 5 horses, 10 food
            if (type === 'infantry') {
                if (faction.treasury < 10 || prev.food < 5)
                    return prev;
            }
            else if (type === 'cavalry') {
                if (faction.treasury < 20 || faction.horses < 5 || prev.food < 10)
                    return prev;
            }
            // Check if province has a camp or is capital
            var hasCamp = (prev.buildings[provinceId] || []).includes('camp');
            var isCapital = province.id === faction.capitalId;
            if (!hasCamp && !isCapital)
                return prev;
            var stableCount = (prev.buildings[provinceId] || []).includes('stable') ? 1 : 0;
            var cavalryCount = type === 'cavalry' ? Math.min(4 + stableCount, Math.floor(faction.horses / 2)) : Math.min(2, Math.floor(faction.horses / 2));
            var infantryCount = type === 'cavalry' ? Math.max(2, 6 - cavalryCount) : 5;
            var newArmy = {
                id: generateId(),
                ownerId: playerFaction,
                provinceId: provinceId,
                cavalry: cavalryCount,
                infantry: infantryCount,
                siege: 0,
                morale: 70,
                supply: 20,
                movementLeft: 0,
                leaderBonus: 0,
            };
            // Deduct recruitment costs according to type
            var newFactions = prev.factions;
            var newFood = prev.food;
            if (type === 'infantry') {
                newFactions = prev.factions.map(function (f) { return f.id === playerFaction ? __assign(__assign({}, f), { treasury: f.treasury - 10, manpower: Math.max(0, f.manpower - 0) }) : f; });
                newFood = Math.max(0, prev.food - 5);
            }
            else {
                var horsesUsed_1 = 5; // fixed per new rule
                newFactions = prev.factions.map(function (f) { return f.id === playerFaction ? __assign(__assign({}, f), { treasury: f.treasury - 20, manpower: Math.max(0, f.manpower - 0), horses: Math.max(0, f.horses - horsesUsed_1) }) : f; });
                newFood = Math.max(0, prev.food - 10);
            }
            return __assign(__assign({}, prev), { armies: __spreadArray(__spreadArray([], prev.armies, true), [newArmy], false), factions: newFactions, food: Math.max(0, newFood) });
        });
    }, [playerFaction]);
    // ============= COLLECT RESOURCES =============
    var collectResources = (0, react_1.useCallback)(function () {
        setGameState(function (prev) {
            if (!prev || !playerFaction || prev.resourcesCollected)
                return prev;
            var faction = prev.factions.find(function (f) { return f.id === playerFaction; });
            if (!faction)
                return prev;
            var collection = calculateResourceCollection(prev, playerFaction);
            var newFactions = prev.factions.map(function (f) {
                return f.id === playerFaction ? __assign(__assign({}, f), { treasury: f.treasury + collection.taxIncome, manpower: f.manpower + collection.manpowerGain, horses: f.horses + collection.horsesGain }) : f;
            });
            return __assign(__assign({}, prev), { factions: newFactions, food: Math.max(0, prev.food + collection.foodChange), artisans: prev.artisans + collection.artisansGain, resourcesCollected: true, lastCollection: collection });
        });
    }, [playerFaction]);
    var nextPhase = (0, react_1.useCallback)(function () {
        setGameState(function (prev) {
            if (!prev)
                return null;
            // Auto-collect resources if skipping resource phase
            var state = __assign({}, prev);
            if (state.phase === 'resource' && !state.resourcesCollected && playerFaction) {
                var faction = state.factions.find(function (f) { return f.id === playerFaction; });
                if (faction) {
                    var collection_1 = calculateResourceCollection(state, playerFaction);
                    state = __assign(__assign({}, state), { factions: state.factions.map(function (f) {
                            return f.id === playerFaction ? __assign(__assign({}, f), { treasury: f.treasury + collection_1.taxIncome, manpower: f.manpower + collection_1.manpowerGain, horses: f.horses + collection_1.horsesGain }) : f;
                        }), food: Math.max(0, state.food + collection_1.foodChange), artisans: state.artisans + collection_1.artisansGain, resourcesCollected: true, lastCollection: collection_1 });
                }
            }
            var currentIndex = PHASE_ORDER.indexOf(state.phase);
            if (currentIndex < PHASE_ORDER.length - 1) {
                var next = PHASE_ORDER[currentIndex + 1];
                // Auto-actions per phase
                if (next === 'cards') {
                    if (state.deck.length > 0) {
                        var _a = (0, cards_1.drawCards)(state.deck, 1), drawn = _a.drawn, remaining = _a.remaining;
                        return __assign(__assign({}, state), { phase: next, hand: __spreadArray(__spreadArray([], state.hand, true), drawn, true), deck: remaining });
                    }
                    else if (state.discard.length > 0) {
                        var newDeck = (0, cards_1.shuffleDeck)(state.discard);
                        var _b = (0, cards_1.drawCards)(newDeck, 1), drawn = _b.drawn, remaining = _b.remaining;
                        return __assign(__assign({}, state), { phase: next, hand: __spreadArray(__spreadArray([], state.hand, true), drawn, true), deck: remaining, discard: [] });
                    }
                }
                return __assign(__assign({}, state), { phase: next });
            }
            return state;
        });
    }, [playerFaction]);
    // ============= END TURN =============
    var endTurn = (0, react_1.useCallback)(function () {
        setGameState(function (prev) {
            if (!prev || !playerFaction)
                return null;
            var newState = __assign({}, prev);
            var aiLog = [];
            var aiActionLog = [];
            // 1. Collect resources for AI factions only (player collects in resource phase)
            var newFactions = newState.factions.map(function (faction) {
                if (faction.id === playerFaction)
                    return faction; // Player already collected
                var collection = calculateResourceCollection(newState, faction.id);
                return __assign(__assign({}, faction), { treasury: faction.treasury + collection.taxIncome, manpower: faction.manpower + collection.manpowerGain });
            });
            // 2. Food: skip player (already handled in collectResources), just track for state
            var newFood = newState.food;
            // 3. AI turns
            var newArmies = __spreadArray([], newState.armies, true);
            var newProvinces = __spreadArray([], newState.provinces, true);
            var _loop_1 = function (faction) {
                if (faction.id === playerFaction)
                    return "continue";
                var aiActions = (0, ai_1.calculateAIActions)(faction, newArmies, newProvinces, newArmies, newState.relations);
                var _loop_6 = function (action) {
                    if (action.type === 'merge' && action.armyId && action.mergeIntoId) {
                        var sourceIdx = newArmies.findIndex(function (a) { return a.id === action.armyId; });
                        var targetIdx = newArmies.findIndex(function (a) { return a.id === action.mergeIntoId; });
                        if (sourceIdx !== -1 && targetIdx !== -1) {
                            var source = newArmies[sourceIdx];
                            var target = newArmies[targetIdx];
                            newArmies[targetIdx] = __assign(__assign({}, target), { cavalry: target.cavalry + source.cavalry, infantry: target.infantry + source.infantry, siege: target.siege + source.siege, morale: Math.round((target.morale + source.morale) / 2) });
                            newArmies = newArmies.filter(function (a) { return a.id !== action.armyId; });
                            aiLog.push("".concat(faction.name, ": Yhdisti armeijat"));
                        }
                    }
                    else if (action.type === 'move' && action.armyId && action.targetProvinceId) {
                        var armyIdx = newArmies.findIndex(function (a) { return a.id === action.armyId; });
                        if (armyIdx !== -1) {
                            var army = newArmies[armyIdx];
                            var target = newProvinces.find(function (p) { return p.id === action.targetProvinceId; });
                            if (target) {
                                newArmies[armyIdx] = __assign(__assign({}, army), { provinceId: action.targetProvinceId, movementLeft: 0 });
                                if (target.ownerId === null) {
                                    var pIdx = newProvinces.findIndex(function (p) { return p.id === action.targetProvinceId; });
                                    newProvinces[pIdx] = __assign(__assign({}, newProvinces[pIdx]), { ownerId: faction.id });
                                }
                                aiLog.push("".concat(faction.name, ": ").concat(action.description));
                            }
                        }
                    }
                    else if (action.type === 'attack' && action.armyId && action.targetProvinceId) {
                        var armyIdx = newArmies.findIndex(function (a) { return a.id === action.armyId; });
                        if (armyIdx === -1)
                            return "continue";
                        var army = newArmies[armyIdx];
                        var target = newProvinces.find(function (p) { return p.id === action.targetProvinceId; });
                        if (!target)
                            return "continue";
                        var defenders_1 = newArmies.filter(function (a) { return a.provinceId === action.targetProvinceId && a.ownerId !== faction.id; });
                        // Combine field defenders with garrison so that fortifications add their soldiers
                        var garrison = target.ownerId && target.ownerId !== faction.id
                            ? createProvinceGarrison(target)
                            : null;
                        var defender = defenders_1[0] || garrison;
                        if (defenders_1[0] && garrison) {
                            defender = __assign(__assign({}, defenders_1[0]), { infantry: defenders_1[0].infantry + garrison.infantry, morale: Math.max(defenders_1[0].morale, garrison.morale) });
                        }
                        if (defender) {
                            var result = resolveCombat(army, defender, target);
                            if (result.attackerWins) {
                                newArmies[armyIdx] = __assign(__assign({}, army), { provinceId: action.targetProvinceId, movementLeft: 0, cavalry: Math.max(0, army.cavalry - result.attackerCavalryLoss), infantry: Math.max(0, army.infantry - result.attackerInfantryLoss) });
                                if (defenders_1[0]) {
                                    if (result.defenderDestroyed) {
                                        newArmies = newArmies.filter(function (a) { return a.id !== defenders_1[0].id; });
                                    }
                                    else {
                                        var dIdx = newArmies.findIndex(function (a) { return a.id === defenders_1[0].id; });
                                        newArmies[dIdx] = __assign(__assign({}, defenders_1[0]), { cavalry: Math.max(0, defenders_1[0].cavalry - result.defenderCavalryLoss), infantry: Math.max(0, defenders_1[0].infantry - result.defenderInfantryLoss) });
                                    }
                                }
                                var pIdx = newProvinces.findIndex(function (p) { return p.id === action.targetProvinceId; });
                                newProvinces[pIdx] = __assign(__assign({}, newProvinces[pIdx]), { ownerId: faction.id });
                                aiLog.push("".concat(faction.name, ": Voitti taistelun - ").concat(target.name, "!"));
                            }
                            else {
                                newArmies[armyIdx] = __assign(__assign({}, army), { movementLeft: 0, cavalry: Math.max(0, army.cavalry - result.attackerCavalryLoss), infantry: Math.max(0, army.infantry - result.attackerInfantryLoss) });
                                aiLog.push("".concat(faction.name, ": Hy\u00F6kk\u00E4ys ep\u00E4onnistui - ").concat(target.name));
                            }
                        }
                        else {
                            // No defenders and no garrison, just take it
                            newArmies[armyIdx] = __assign(__assign({}, army), { provinceId: action.targetProvinceId, movementLeft: 0 });
                            var pIdx = newProvinces.findIndex(function (p) { return p.id === action.targetProvinceId; });
                            newProvinces[pIdx] = __assign(__assign({}, newProvinces[pIdx]), { ownerId: faction.id });
                            aiLog.push("".concat(faction.name, ": Valloitti ").concat(target.name));
                        }
                    }
                    else if (action.type === 'build_fort' && action.targetProvinceId) {
                        var fIdx = newFactions.findIndex(function (f) { return f.id === faction.id; });
                        if (newFactions[fIdx].treasury >= 50) {
                            newFactions[fIdx] = __assign(__assign({}, newFactions[fIdx]), { treasury: newFactions[fIdx].treasury - 50 });
                            var pIdx = newProvinces.findIndex(function (p) { return p.id === action.targetProvinceId; });
                            if (pIdx !== -1) {
                                newProvinces[pIdx] = __assign(__assign({}, newProvinces[pIdx]), { fortLevel: Math.min(3, newProvinces[pIdx].fortLevel + 1) });
                            }
                            aiLog.push("".concat(faction.name, ": ").concat(action.description));
                        }
                    }
                    else if (action.type === 'build_market' && action.targetProvinceId) {
                        var fIdx = newFactions.findIndex(function (f) { return f.id === faction.id; });
                        if (newFactions[fIdx].treasury >= 25) {
                            newFactions[fIdx] = __assign(__assign({}, newFactions[fIdx]), { treasury: newFactions[fIdx].treasury - 25 });
                            aiLog.push("".concat(faction.name, ": ").concat(action.description));
                        }
                    }
                    else if (action.type === 'recruit' && action.targetProvinceId) {
                        var fIdx = newFactions.findIndex(function (f) { return f.id === faction.id; });
                        if (newFactions[fIdx].treasury >= 30 && newFactions[fIdx].manpower >= 10) {
                            newFactions[fIdx] = __assign(__assign({}, newFactions[fIdx]), { treasury: newFactions[fIdx].treasury - 30, manpower: newFactions[fIdx].manpower - 10 });
                            var horsesAvail = newFactions[fIdx].horses || 0;
                            var cavCount = Math.min(4, Math.floor(horsesAvail / 2));
                            newFactions[fIdx] = __assign(__assign({}, newFactions[fIdx]), { horses: newFactions[fIdx].horses - cavCount * 2 });
                            newArmies.push({
                                id: generateId(),
                                ownerId: faction.id,
                                provinceId: action.targetProvinceId,
                                cavalry: cavCount, infantry: 6, siege: 0,
                                morale: 70, supply: 20, movementLeft: 0, leaderBonus: 0,
                            });
                            aiLog.push("".concat(faction.name, ": Rekrytoi armeijan"));
                        }
                    }
                };
                for (var _c = 0, aiActions_1 = aiActions; _c < aiActions_1.length; _c++) {
                    var action = aiActions_1[_c];
                    _loop_6(action);
                }
            };
            for (var _i = 0, newFactions_1 = newFactions; _i < newFactions_1.length; _i++) {
                var faction = newFactions_1[_i];
                _loop_1(faction);
            }
            var _loop_2 = function (msg) {
                var colonIdx = msg.indexOf(':');
                if (colonIdx > 0) {
                    var fName_1 = msg.substring(0, colonIdx).trim();
                    var desc = msg.substring(colonIdx + 1).trim();
                    var fData = newFactions.find(function (f) { return f.name === fName_1; });
                    aiActionLog.push({
                        factionName: fName_1,
                        factionColor: (fData === null || fData === void 0 ? void 0 : fData.color) || '#888',
                        description: "".concat(fName_1, ": ").concat(desc),
                    });
                }
            };
            // Build structured AI action log from aiLog strings
            // Parse "FactionName: description" format
            for (var _a = 0, aiLog_1 = aiLog; _a < aiLog_1.length; _a++) {
                var msg = aiLog_1[_a];
                _loop_2(msg);
            }
            // Remove destroyed armies
            newArmies = newArmies.filter(function (a) { return a.cavalry + a.infantry > 0; });
            // ============= SUPPLY (TARJONTA) ATTRITION =============
            // Each army consumes supply based on its size vs province supply limit
            newArmies = newArmies.map(function (army) {
                var province = newProvinces.find(function (p) { return p.id === army.provinceId; });
                if (!province)
                    return army;
                var terrainInfo = province_1.PROVINCE_TERRAIN_INFO[province.terrain];
                var armySize = army.cavalry + army.infantry + army.siege;
                var supplyLimit = province.supply + terrainInfo.supplyLimit;
                // If army exceeds supply, lose morale and take attrition
                if (armySize > supplyLimit) {
                    var overSupply = armySize - supplyLimit;
                    var moraleLoss = Math.min(15, overSupply * 3);
                    var attritionChance = Math.min(0.5, overSupply * 0.08);
                    var cavLoss = Math.random() < attritionChance ? Math.max(1, Math.floor(army.cavalry * 0.1)) : 0;
                    var infLoss = Math.random() < attritionChance ? Math.max(1, Math.floor(army.infantry * 0.1)) : 0;
                    return __assign(__assign({}, army), { morale: Math.max(10, army.morale - moraleLoss), cavalry: Math.max(0, army.cavalry - cavLoss), infantry: Math.max(0, army.infantry - infLoss), supply: Math.max(0, army.supply - overSupply) });
                }
                // Friendly territory restores supply and morale
                if (province.ownerId === army.ownerId) {
                    return __assign(__assign({}, army), { morale: Math.min(100, army.morale + 5), supply: Math.min(30, army.supply + supplyLimit) });
                }
                return __assign(__assign({}, army), { supply: Math.max(0, army.supply - 2) });
            });
            // Remove armies destroyed by attrition
            newArmies = newArmies.filter(function (a) { return a.cavalry + a.infantry > 0; });
            // Reset movement for next turn
            newArmies = newArmies.map(function (a) { return (__assign(__assign({}, a), { movementLeft: 3 })); });
            // ============= SIEGE / FRONTLINE PROCESSING =============
            // For each province, check if it is fully surrounded by enemy-controlled neighbors.
            // If so, increase siegeProgress and apply modest attrition to the owning faction's treasury
            // (represents supply loss). If fortress exists, it will be drained by assaults elsewhere,
            // but here we reduce fortLevel slowly if siegeProgress grows.
            var siegeProvinces = newProvinces.map(function (p) { return (__assign({}, p)); });
            var factionMap = new Map();
            var _loop_3 = function (i) {
                var p = siegeProvinces[i];
                if (!p.ownerId)
                    return "continue";
                // If province has no neighbors, skip
                if (!p.neighbors || p.neighbors.length === 0)
                    return "continue";
                var allNeighborsEnemy = p.neighbors.every(function (nid) {
                    var nb = siegeProvinces.find(function (x) { return x.id === nid; });
                    return nb && nb.ownerId && nb.ownerId !== p.ownerId;
                });
                if (allNeighborsEnemy) {
                    // increase siege progress
                    var cur = typeof p.siegeProgress === 'number' ? p.siegeProgress : 0;
                    siegeProvinces[i].siegeProgress = cur + 1;
                    // If fort exists, reduce fortLevel first
                    if (siegeProvinces[i].fortLevel && siegeProvinces[i].fortLevel > 0) {
                        siegeProvinces[i].fortLevel = Math.max(0, siegeProvinces[i].fortLevel - 1);
                    }
                    else {
                        // Penalize owner's treasury slightly per turn under siege
                        factionMap.set(p.ownerId, (factionMap.get(p.ownerId) || 0) + 5);
                    }
                }
                else {
                    siegeProvinces[i].siegeProgress = 0;
                }
            };
            for (var i = 0; i < siegeProvinces.length; i++) {
                _loop_3(i);
            }
            // Apply treasury penalties
            if (factionMap.size > 0) {
                newFactions = newFactions.map(function (f) {
                    var penalty = factionMap.get(f.id) || 0;
                    if (penalty > 0)
                        return __assign(__assign({}, f), { treasury: Math.max(0, f.treasury - penalty) });
                    return f;
                });
            }
            var _loop_4 = function (i) {
                var updated = siegeProvinces.find(function (sp) { return sp.id === newProvinces[i].id; });
                if (updated)
                    newProvinces[i] = updated;
            };
            // Replace provinces with siege-processed array
            for (var i = 0; i < newProvinces.length; i++) {
                _loop_4(i);
            }
            // 4. Check victory/defeat
            var playerProvinces = newProvinces.filter(function (p) { return p.ownerId === playerFaction; }).length;
            var playerArmies = newArmies.filter(function (a) { return a.ownerId === playerFaction; });
            var playerFactionData = newFactions.find(function (f) { return f.id === playerFaction; });
            var playerGold = playerFactionData.treasury;
            var playerTechCount = newState.playedTechCards.length;
            var gameOver = false;
            var winnerId = null;
            var winCondition = null;
            // Military victory: control enough provinces
            if (playerProvinces >= exports.VICTORY_TARGETS.provinces) {
                gameOver = true;
                winnerId = playerFaction;
                winCondition = 'military';
            }
            // Economic victory: amass enough gold
            if (!gameOver && playerGold >= exports.VICTORY_TARGETS.gold) {
                gameOver = true;
                winnerId = playerFaction;
                winCondition = 'economic';
            }
            // Technology victory: play enough tech cards
            if (!gameOver && playerTechCount >= exports.VICTORY_TARGETS.tech) {
                gameOver = true;
                winnerId = playerFaction;
                winCondition = 'technology';
            }
            // Defeat if player has lost all provinces and armies
            if (!gameOver && playerArmies.length === 0 && playerProvinces === 0) {
                gameOver = true;
                winnerId = null;
                winCondition = null;
            }
            var _loop_5 = function (faction) {
                if (faction.id === playerFaction)
                    return "continue";
                var aiProvinces = newProvinces.filter(function (p) { return p.ownerId === faction.id; }).length;
                var aiGold = faction.treasury;
                var aiTechCount = 0; // AI tech victory not implemented yet
                var enemyOwned = newProvinces.filter(function (p) { return p.ownerId && p.ownerId !== faction.id; }).length;
                if (enemyOwned === 0 && aiProvinces > 0) {
                    gameOver = true;
                    winnerId = faction.id;
                    winCondition = 'military';
                }
                else if (!gameOver && aiGold >= exports.VICTORY_TARGETS.gold) {
                    gameOver = true;
                    winnerId = faction.id;
                    winCondition = 'economic';
                }
                else if (!gameOver && aiTechCount >= exports.VICTORY_TARGETS.tech) {
                    gameOver = true;
                    winnerId = faction.id;
                    winCondition = 'technology';
                }
            };
            // Check AI victory too
            for (var _b = 0, newFactions_2 = newFactions; _b < newFactions_2.length; _b++) {
                var faction = newFactions_2[_b];
                _loop_5(faction);
            }
            return activatePendingWars(__assign(__assign({}, newState), { turn: newState.turn + 1, year: newState.year + 1, phase: 'resource', factions: newFactions, armies: newArmies, provinces: newProvinces, food: Math.max(0, newFood), gameOver: gameOver, winnerId: winnerId, winCondition: winCondition, aiLog: aiLog, aiActionLog: aiActionLog, resourcesCollected: false, lastCollection: null, attackBonus: 0, defenseBonus: 0, movementBonus: 0, selectedArmyId: null, selectedProvinceId: null }));
        });
    }, [playerFaction]);
    // ============= TREATY =============
    var proposeTreaty = (0, react_1.useCallback)(function (targetFaction, treatyType) {
        setGameState(function (prev) {
            if (!prev || !playerFaction)
                return prev;
            var relIdx = prev.relations.findIndex(function (r) {
                return (r.factionA === playerFaction && r.factionB === targetFaction) ||
                    (r.factionB === playerFaction && r.factionA === targetFaction);
            });
            if (relIdx === -1)
                return prev;
            var rel = prev.relations[relIdx];
            var isWar = treatyType === 'war_surprise' || treatyType === 'war_formal';
            var accepts = isWar ? true : Math.random() < ((rel.relation + 100) / 200) * (rel.trust / 100) + 0.2;
            if (!accepts)
                return prev;
            var newRels = prev.relations.map(function (r) {
                var involvesPlayer = r.factionA === playerFaction || r.factionB === playerFaction;
                var involvesTarget = r.factionA === targetFaction || r.factionB === targetFaction;
                if (treatyType === 'war_surprise' && involvesPlayer) {
                    var filteredTreaties = r.treaties.filter(function (t) { return !['non_aggression', 'peace', 'truce', 'alliance'].includes(t.type); });
                    var newTreaty = {
                        type: treatyType,
                        startTurn: prev.turn,
                        duration: -1,
                    };
                    return __assign(__assign({}, r), { treaties: __spreadArray(__spreadArray([], filteredTreaties, true), [newTreaty], false), relation: -100, trust: 0, threat: Math.min(100, r.threat + 30) });
                }
                if (involvesTarget && involvesPlayer) {
                    var newTreaty = {
                        type: treatyType,
                        startTurn: treatyType === 'war_formal' ? prev.turn + 1 : prev.turn,
                        duration: -1,
                    };
                    return __assign(__assign({}, r), { treaties: __spreadArray(__spreadArray([], r.treaties, true), [newTreaty], false), relation: isWar ? (treatyType === 'war_surprise' ? -100 : Math.max(-100, r.relation - 40)) : Math.min(100, r.relation + 10), trust: isWar ? 0 : Math.min(100, r.trust + 5), threat: isWar ? Math.min(100, r.threat + 30) : r.threat });
                }
                return r;
            });
            return __assign(__assign({}, prev), { relations: newRels });
        });
    }, [playerFaction]);
    // ============= WAR DECLARATIONS =============
    var declareWar = (0, react_1.useCallback)(function (targetFaction, surprise) {
        if (surprise === void 0) { surprise = false; }
        var treatyType = surprise ? 'war_surprise' : 'war_formal';
        proposeTreaty(targetFaction, treatyType);
    }, [proposeTreaty]);
    var breakTreaty = (0, react_1.useCallback)(function (targetFaction, treatyType) {
        setGameState(function (prev) {
            if (!prev || !playerFaction)
                return prev;
            var relIdx = prev.relations.findIndex(function (r) {
                return (r.factionA === playerFaction && r.factionB === targetFaction) ||
                    (r.factionB === playerFaction && r.factionA === targetFaction);
            });
            if (relIdx === -1)
                return prev;
            var rel = prev.relations[relIdx];
            var newRels = __spreadArray([], prev.relations, true);
            newRels[relIdx] = __assign(__assign({}, rel), { treaties: rel.treaties.filter(function (t) { return t.type !== treatyType; }), relation: rel.relation - 30, trust: Math.max(0, rel.trust - 20) });
            return __assign(__assign({}, prev), { relations: newRels });
        });
    }, [playerFaction]);
    var buildFort = (0, react_1.useCallback)(function (provinceId) {
        buildStructure(provinceId, 'fortress');
    }, [buildStructure]);
    var resolveEvent = (0, react_1.useCallback)(function (_choiceIndex) { }, []);
    var resetGame = (0, react_1.useCallback)(function () {
        setGameStarted(false);
        setPlayerFaction(null);
        setGameState(null);
    }, []);
    var clearBattle = (0, react_1.useCallback)(function () { return setPendingBattle(null); }, []);
    var getRelation = (0, react_1.useCallback)(function (factionA, factionB) {
        if (!gameState)
            return null;
        return gameState.relations.find(function (r) {
            return (r.factionA === factionA && r.factionB === factionB) ||
                (r.factionB === factionA && r.factionA === factionB);
        }) || null;
    }, [gameState]);
    var getPlayerFaction = (0, react_1.useCallback)(function () {
        if (!gameState || !playerFaction)
            return null;
        return gameState.factions.find(function (f) { return f.id === playerFaction; }) || null;
    }, [gameState, playerFaction]);
    var getArmiesInProvince = (0, react_1.useCallback)(function (provinceId) {
        if (!gameState)
            return [];
        return gameState.armies.filter(function (a) { return a.provinceId === provinceId; });
    }, [gameState]);
    // endPhase is alias for nextPhase (backward compat)
    var endPhase = nextPhase;
    return {
        gameStarted: gameStarted,
        playerFaction: playerFaction,
        gameState: gameState,
        pendingBattle: pendingBattle,
        clearBattle: clearBattle,
        startGame: startGame,
        selectProvince: selectProvince,
        selectArmy: selectArmy,
        moveArmy: moveArmy,
        nextPhase: nextPhase,
        endTurn: endTurn,
        resetGame: resetGame,
        playCard: playCard,
        buildStructure: buildStructure,
        recruitArmy: recruitArmy,
        proposeTreaty: proposeTreaty,
        breakTreaty: breakTreaty,
        buildFort: buildFort,
        resolveEvent: resolveEvent,
        declareWar: declareWar,
        repairFort: repairFort,
        getRelation: getRelation,
        getPlayerFaction: getPlayerFaction,
        getArmiesInProvince: getArmiesInProvince,
        canMoveTo: canMoveTo,
        endPhase: endPhase,
        collectResources: collectResources,
    };
};
exports.useProvinceGameState = useProvinceGameState;

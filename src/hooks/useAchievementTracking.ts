/**
 * useAchievementTracking.ts — Kytkee saavutukset ja elinikäiset tilastot pelitapahtumiin
 *
 * Tarkkailee pelitilaa reaktiivisesti (ei muutoksia
 * useProvinceGameState.ts:ään): vertaa jokaisella gameState-muutoksella
 * edellistä tilannekuvaa nykyiseen ja päivittää PlayerStats-tilastoja
 * (playerStats.ts) sen mukaan mitä muuttui (uudet provinssit, rakennukset,
 * pelatut kortit, diplomatia, rekrytoinnit). Taistelut tulevat pendingBattle-
 * propin kautta, voitot/tappiot pelin gameOver-tilasta. Jokaisen päivityksen
 * jälkeen käydään läpi kaikki ACHIEVEMENT_DEFINITIONS ja avataan ne, joiden
 * `check(stats)` täyttyy — täysin datavetoinen, uusi saavutus ei vaadi
 * muutoksia tähän tiedostoon.
 */
import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { achievementManager } from '@/game/achievements.ts';
import { ACHIEVEMENT_DEFINITIONS } from '@/game/achievementDefinitions.ts';
import { getPlayerStats, updatePlayerStats, addUniqueToStat } from '@/game/playerStats.ts';
import { PLAYER_STATS_UPDATED_EVENT } from '@/game/playerStats.ts';
import type { PlayerStats } from '@/game/achievementTypes.ts';
import { logSecurityEvent } from '@/lib/securityLog.ts';
import { useLanguage } from '@/lib/i18n.tsx';

// Generous per-tick ceilings for stat deltas — normal play never gets close to
// these in a single render tick, so hitting one means a save was loaded with a
// huge jump, or live game state was edited via devtools/console. Clamping (and
// logging) instead of trusting the raw delta keeps a single anomalous tick from
// flooding lifetime stats and instant-unlocking achievements.
const MAX_PER_TICK = {
  provinces: 20,
  gold: 500,
  buildings: 5,
  units: 5,
  cards: 10,
  treaties: 5,
} as const;

const clampDelta = (value: number, max: number, key: string): number => {
  if (value <= max) return value;
  logSecurityEvent('stat_anomaly', { key, value, max });
  return max;
};
import type { MVPGameState } from '@/hooks/useProvinceGameState.ts';
import type { BattleResult } from '@/game/BattleDisplay.tsx';
import type { FactionId } from '@/types/province.ts';

const VICTORY_STAT_BY_CONDITION: Partial<Record<string, keyof PlayerStats>> = {
  military: 'militaryVictories',
  economic: 'economicVictories',
  technology: 'technologyVictories',
  diplomatic: 'diplomaticVictories',
  cultural: 'culturalVictories',
};

const todayString = () => new Date().toISOString().slice(0, 10);

export const useAchievementTracking = (
  gameState: MVPGameState | null,
  playerFaction: FactionId | null,
  pendingBattle: BattleResult | null,
) => {
  const { lang } = useLanguage();
  const prevStateRef = useRef<MVPGameState | null>(null);
  const gameOverHandledRef = useRef(false);
  const seenBattleKeysRef = useRef<Set<string>>(new Set());
  const dailyTickDoneRef = useRef(false);

  const checkAndUnlock = useCallback(async (stats: PlayerStats) => {
    for (const def of ACHIEVEMENT_DEFINITIONS) {
      if (!def.check(stats)) continue;
      const unlockedNow = await achievementManager.unlockAchievement(def.id);
      if (!unlockedNow) continue;
      const rewardSuffix = def.reward ? ` · ${def.reward.icon} ${def.reward.name[lang]}` : '';
      toast.success(`${def.legendary ? '🏅' : '🏆'} ${def.name[lang]} (+${def.points})`, {
        description: `${def.description[lang]}${rewardSuffix}`,
      });
    }
  }, [lang]);

  // Once per app session: daily login streak (distinct calendar days played in a row).
  useEffect(() => {
    if (dailyTickDoneRef.current) return;
    dailyTickDoneRef.current = true;
    const today = todayString();
    const updated = updatePlayerStats(current => {
      if (current.lastPlayedDate === today) return {};
      let loginStreak = 1;
      if (current.lastPlayedDate) {
        const diffDays = Math.round(
          (new Date(today).getTime() - new Date(current.lastPlayedDate).getTime()) / 86_400_000,
        );
        loginStreak = diffDays === 1 ? current.loginStreak + 1 : 1;
      }
      return { lastPlayedDate: today, loginStreak, distinctPlayDays: current.distinctPlayDays + 1 };
    });
    checkAndUnlock(updated);
  }, [checkAndUnlock]);

  // Main diff loop: compares the previous game-state snapshot to the current
  // one to derive lifetime stat deltas, without touching the game reducer.
  useEffect(() => {
    if (!gameState || !playerFaction) {
      prevStateRef.current = gameState;
      return;
    }

    const prev = prevStateRef.current;

    // A turn counter that jumps by more than one (backwards OR forwards) means
    // a save was loaded or a new game started, not organic turn-by-turn play.
    // Diffing across that seam would credit the player for the save's entire
    // pre-existing progress in a single tick (a real exploit: edit/load a save
    // with 100 provinces and 9999 gold to instant-unlock most achievements) —
    // resync the baseline instead and skip this tick's diff entirely.
    if (prev && Math.abs(gameState.turn - prev.turn) > 1) {
      logSecurityEvent('save_resync', { fromTurn: prev.turn, toTurn: gameState.turn });
      prevStateRef.current = gameState;
      gameOverHandledRef.current = false;
      return;
    }

    const ownedProvinces = gameState.provinces.filter(p => p.ownerId === playerFaction);
    const ownedIds = new Set(ownedProvinces.map(p => p.id));
    const regionsControlled = new Set(ownedProvinces.map(p => p.region)).size;
    const silkHubs = ownedProvinces.filter(p => p.hasSilkRoad).length;
    const faction = gameState.factions.find(f => f.id === playerFaction);
    const treasury = faction?.treasury ?? 0;

    const buildingLists = Object.values(gameState.buildings);
    const buildingTotal = buildingLists.reduce((sum, list) => sum + list.length, 0);
    const wonderTotal = buildingLists.reduce((sum, list) => sum + list.filter(b => b === 'wonder').length, 0);
    const buildingTypesNow = new Set(buildingLists.flat());

    const playerArmyIds = new Set(gameState.armies.filter(a => a.ownerId === playerFaction).map(a => a.id));

    updatePlayerStats(current => {
      const patch: Partial<PlayerStats> = {
        totalTurnsPlayed: Math.max(current.totalTurnsPlayed, gameState.turn),
        maxProvincesOwnedInRun: Math.max(current.maxProvincesOwnedInRun, ownedIds.size),
        regionsControlledPeak: Math.max(current.regionsControlledPeak, regionsControlled),
        silkRoadHubsPeak: Math.max(current.silkRoadHubsPeak, silkHubs),
        peakTreasury: Math.max(current.peakTreasury, treasury),
      };

      let buildingTypesBuilt = current.buildingTypesBuilt;
      for (const type of buildingTypesNow) {
        buildingTypesBuilt = addUniqueToStat({ ...current, buildingTypesBuilt }, 'buildingTypesBuilt', type);
      }
      patch.buildingTypesBuilt = buildingTypesBuilt;

      if (prev) {
        const prevOwnedIds = new Set(prev.provinces.filter(p => p.ownerId === playerFaction).map(p => p.id));
        const captured = clampDelta([...ownedIds].filter(id => !prevOwnedIds.has(id)).length, MAX_PER_TICK.provinces, 'provincesCaptured');
        const lost = clampDelta([...prevOwnedIds].filter(id => !ownedIds.has(id)).length, MAX_PER_TICK.provinces, 'provincesLost');
        patch.provincesCaptured = current.provincesCaptured + captured;
        patch.provincesLost = current.provincesLost + lost;

        const ownCapitalId = faction?.capitalId;
        const capitalsCapturedNow = [...ownedIds].filter(id => !prevOwnedIds.has(id)).filter(id => {
          const province = gameState.provinces.find(p => p.id === id);
          return province?.isCapital && id !== ownCapitalId;
        }).length;
        if (capitalsCapturedNow > 0) patch.capitalsCaptured = current.capitalsCaptured + clampDelta(capitalsCapturedNow, 4, 'capitalsCaptured');

        const prevTreasury = prev.factions.find(f => f.id === playerFaction)?.treasury ?? 0;
        const goldDelta = clampDelta(Math.max(0, treasury - prevTreasury), MAX_PER_TICK.gold, 'goldEarnedTotal');
        patch.goldEarnedTotal = current.goldEarnedTotal + goldDelta;

        const prevBuildingLists = Object.values(prev.buildings);
        const prevBuildingTotal = prevBuildingLists.reduce((sum, list) => sum + list.length, 0);
        const prevWonderTotal = prevBuildingLists.reduce((sum, list) => sum + list.filter(b => b === 'wonder').length, 0);
        patch.buildingsBuilt = current.buildingsBuilt + clampDelta(Math.max(0, buildingTotal - prevBuildingTotal), MAX_PER_TICK.buildings, 'buildingsBuilt');
        patch.wondersBuilt = current.wondersBuilt + clampDelta(Math.max(0, wonderTotal - prevWonderTotal), MAX_PER_TICK.buildings, 'wondersBuilt');

        const prevPlayerArmyIds = new Set(prev.armies.filter(a => a.ownerId === playerFaction).map(a => a.id));
        const newArmiesCount = [...playerArmyIds].filter(id => !prevPlayerArmyIds.has(id)).length;
        patch.unitsRecruited = current.unitsRecruited + clampDelta(newArmiesCount, MAX_PER_TICK.units, 'unitsRecruited');

        // A played card (any type) always lands in `discard`; it gets flushed
        // back to [] when a fresh hand is drawn. Catching that reset is the
        // only place we can see the full list of what was actually played.
        if (gameState.discard.length < prev.discard.length && prev.discard.length > 0) {
          const playedCards = prev.discard.slice(0, clampDelta(prev.discard.length, MAX_PER_TICK.cards, 'cardsPlayedTotal'));
          let uniqueCardIdsPlayed = current.uniqueCardIdsPlayed;
          let cardsPlayedTotal = current.cardsPlayedTotal;
          let techCardsPlayedTotal = current.techCardsPlayedTotal;
          let legendaryCardsPlayed = current.legendaryCardsPlayed;
          for (const card of playedCards) {
            cardsPlayedTotal += 1;
            if (card.type === 'technology') techCardsPlayedTotal += 1;
            if (card.rarity === 'legendary') legendaryCardsPlayed += 1;
            uniqueCardIdsPlayed = addUniqueToStat({ ...current, uniqueCardIdsPlayed }, 'uniqueCardIdsPlayed', card.id);
          }
          patch.cardsPlayedTotal = cardsPlayedTotal;
          patch.techCardsPlayedTotal = techCardsPlayedTotal;
          patch.legendaryCardsPlayed = legendaryCardsPlayed;
          patch.uniqueCardIdsPlayed = uniqueCardIdsPlayed;
        }

        // Diplomacy: alliances/wars newly present on the player's relations, plus a
        // rough "any treaty signed" counter (all treaty types, including peace/trade).
        let alliancesFormed = current.alliancesFormed;
        let warsDeclared = current.warsDeclared;
        let treatiesSigned = current.treatiesSigned;
        for (const relation of gameState.relations) {
          if (relation.factionA !== playerFaction && relation.factionB !== playerFaction) continue;
          const prevRelation = prev.relations.find(r =>
            (r.factionA === relation.factionA && r.factionB === relation.factionB) ||
            (r.factionA === relation.factionB && r.factionB === relation.factionA));
          const prevTypes = new Set(prevRelation?.treaties.map(t => t.type) ?? []);
          const newTreatyCount = relation.treaties.length - (prevRelation?.treaties.length ?? 0);
          if (newTreatyCount > 0) treatiesSigned += clampDelta(newTreatyCount, MAX_PER_TICK.treaties, 'treatiesSigned');
          for (const treaty of relation.treaties) {
            if (prevTypes.has(treaty.type)) continue;
            if (treaty.type === 'alliance') alliancesFormed += 1;
            if (treaty.type === 'war_surprise' || treaty.type === 'war_formal') warsDeclared += 1;
          }
        }
        patch.alliancesFormed = alliancesFormed;
        patch.warsDeclared = warsDeclared;
        patch.treatiesSigned = treatiesSigned;
      }

      return patch;
    });

    prevStateRef.current = gameState;
  }, [gameState, playerFaction]);

  // Run achievement checks whenever the underlying stats change (own event, decoupled from render).
  useEffect(() => {
    const onStatsUpdated = () => { checkAndUnlock(getPlayerStats()); };
    window.addEventListener(PLAYER_STATS_UPDATED_EVENT, onStatsUpdated);
    return () => window.removeEventListener(PLAYER_STATS_UPDATED_EVENT, onStatsUpdated);
  }, [checkAndUnlock]);

  // Combat: perfect/streak tracking per battle the player was involved in.
  useEffect(() => {
    if (!pendingBattle || !playerFaction) return;
    const isAttacker = pendingBattle.attackerFaction === playerFaction;
    const isDefender = pendingBattle.defenderFaction === playerFaction;
    if (!isAttacker && !isDefender) return;

    const key = `${pendingBattle.attacker.id}-${pendingBattle.defender.id}-${gameState?.turn ?? ''}`;
    if (seenBattleKeysRef.current.has(key)) return;
    seenBattleKeysRef.current.add(key);

    const won = (isAttacker && pendingBattle.winner === 'attacker') || (isDefender && pendingBattle.winner === 'defender');
    const losses = isAttacker ? pendingBattle.attackerLosses : pendingBattle.defenderLosses;
    const isPerfect = won && losses.cavalry === 0 && losses.infantry === 0;

    updatePlayerStats(current => {
      if (!won) {
        return { battlesLost: current.battlesLost + 1, currentWinStreakBattles: 0 };
      }
      const currentWinStreakBattles = current.currentWinStreakBattles + 1;
      return {
        battlesWon: current.battlesWon + 1,
        perfectBattlesWon: current.perfectBattlesWon + (isPerfect ? 1 : 0),
        currentWinStreakBattles,
        longestWinStreakBattles: Math.max(current.longestWinStreakBattles, currentWinStreakBattles),
      };
    });
  }, [pendingBattle, playerFaction, gameState?.turn]);

  // Game-over: victory type, faction, streak and difficulty stats (once per game).
  useEffect(() => {
    if (!gameState?.gameOver || gameOverHandledRef.current) return;
    gameOverHandledRef.current = true;

    const playerWon = gameState.winnerId === playerFaction && !!playerFaction;
    updatePlayerStats(current => {
      const patch: Partial<PlayerStats> = { gamesPlayed: current.gamesPlayed + 1 };
      if (!playerWon) {
        patch.currentGameWinStreak = 0;
        return patch;
      }

      patch.gamesWon = current.gamesWon + 1;
      const currentGameWinStreak = current.currentGameWinStreak + 1;
      patch.currentGameWinStreak = currentGameWinStreak;
      patch.longestGameWinStreak = Math.max(current.longestGameWinStreak, currentGameWinStreak);
      patch.fastestVictoryTurn = current.fastestVictoryTurn === null
        ? gameState.turn
        : Math.min(current.fastestVictoryTurn, gameState.turn);
      if (gameState.difficulty === 'hard') patch.hardDifficultyWins = current.hardDifficultyWins + 1;
      if (playerFaction) {
        patch.victoriesByFaction = {
          ...current.victoriesByFaction,
          [playerFaction]: (current.victoriesByFaction[playerFaction] ?? 0) + 1,
        };
      }
      const victoryStatKey = gameState.winCondition ? VICTORY_STAT_BY_CONDITION[gameState.winCondition] : undefined;
      if (victoryStatKey) {
        (patch as Record<string, number>)[victoryStatKey] = ((current[victoryStatKey] as number) ?? 0) + 1;
      }

      return patch;
    });
  }, [gameState, playerFaction]);
};


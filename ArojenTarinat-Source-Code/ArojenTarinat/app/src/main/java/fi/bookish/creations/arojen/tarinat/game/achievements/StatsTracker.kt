package fi.bookish.creations.arojen.tarinat.game.achievements

import fi.bookish.creations.arojen.tarinat.game.model.BattleReport
import fi.bookish.creations.arojen.tarinat.game.model.BuildingType
import fi.bookish.creations.arojen.tarinat.game.model.CardType
import fi.bookish.creations.arojen.tarinat.game.model.Difficulty
import fi.bookish.creations.arojen.tarinat.game.model.FactionId
import fi.bookish.creations.arojen.tarinat.game.model.GameState
import fi.bookish.creations.arojen.tarinat.game.model.Rarity
import fi.bookish.creations.arojen.tarinat.game.model.TreatyType
import fi.bookish.creations.arojen.tarinat.game.model.WinCondition
import java.time.LocalDate
import java.time.temporal.ChronoUnit
import kotlin.math.abs

/**
 * Pure functions that fold game events into lifetime [PlayerStats]
 * (a port of the original useAchievementTracking hook).
 *
 * Differences from the original, on purpose:
 * - Cards played are counted when they reach the discard pile. The original
 *   compared the pile shrinking, so card achievements almost never unlocked.
 */
object StatsTracker {

    /** Caps per state change, so a corrupt diff can never award a huge jump. */
    private const val MAX_PROVINCES = 20
    private const val MAX_GOLD = 500
    private const val MAX_BUILDINGS = 5
    private const val MAX_UNITS = 5
    private const val MAX_CARDS = 10
    private const val MAX_TREATIES = 5

    /** Records today's visit: distinct play days and the consecutive-day streak. */
    fun onAppOpened(s: PlayerStats, today: LocalDate): PlayerStats {
        val todayText = today.toString()
        if (s.lastPlayedDate == todayText) return s
        val last = s.lastPlayedDate?.let { runCatching { LocalDate.parse(it) }.getOrNull() }
        val streak = if (last != null && ChronoUnit.DAYS.between(last, today) == 1L) s.loginStreak + 1 else 1
        return s.copy(lastPlayedDate = todayText, loginStreak = streak, distinctPlayDays = s.distinctPlayDays + 1)
    }

    /**
     * Folds the change from [prev] to [next] into [s]. With [prev] null (first
     * state after loading) only peaks are updated, never counters.
     */
    fun onStateChanged(s: PlayerStats, prev: GameState?, next: GameState): PlayerStats {
        val player = next.playerFactionId
        val owned = next.provinces.filter { it.ownerId == player }
        val ownedIds = owned.map { it.id }.toSet()
        val treasury = next.player.treasury
        val allBuildings = next.buildings.values.flatten()

        var out = s.copy(
            // Turns completed (the original counted the turn number, so "First steps: you ended
            // your first turn" unlocked the moment a campaign began).
            totalTurnsPlayed = maxOf(s.totalTurnsPlayed, next.turn - 1),
            maxProvincesOwnedInRun = maxOf(s.maxProvincesOwnedInRun, ownedIds.size),
            regionsControlledPeak = maxOf(s.regionsControlledPeak, owned.map { it.region }.distinct().size),
            silkRoadHubsPeak = maxOf(s.silkRoadHubsPeak, owned.count { it.hasSilkRoad }),
            peakTreasury = maxOf(s.peakTreasury, treasury),
            buildingTypesBuilt = s.buildingTypesBuilt + allBuildings.map { it.name.lowercase() },
        )
        // A save loaded from another point in time is not a sequence of real events.
        if (prev == null || prev.playerFactionId != player || abs(next.turn - prev.turn) > 1) return out

        val prevOwned = prev.provinces.filter { it.ownerId == player }.map { it.id }.toSet()
        val captured = ownedIds - prevOwned
        val lost = prevOwned - ownedIds
        val capitalsTaken = captured.count { id -> next.province(id)?.isCapital == true && id != next.player.capitalId }
        val prevTreasury = prev.player.treasury
        val prevAllBuildings = prev.buildings.values.flatten()
        val prevArmyIds = prev.armies.filter { it.ownerId == player }.map { it.id }.toSet()
        val newArmies = next.armies.count { it.ownerId == player && it.id !in prevArmyIds }

        out = out.copy(
            provincesCaptured = out.provincesCaptured + captured.size.coerceAtMost(MAX_PROVINCES),
            provincesLost = out.provincesLost + lost.size.coerceAtMost(MAX_PROVINCES),
            capitalsCaptured = out.capitalsCaptured + capitalsTaken.coerceAtMost(4),
            goldEarnedTotal = out.goldEarnedTotal + (treasury - prevTreasury).coerceIn(0, MAX_GOLD),
            buildingsBuilt = out.buildingsBuilt + (allBuildings.size - prevAllBuildings.size).coerceIn(0, MAX_BUILDINGS),
            wondersBuilt = out.wondersBuilt + (allBuildings.count { it == BuildingType.WONDER } - prevAllBuildings.count { it == BuildingType.WONDER }).coerceIn(0, MAX_BUILDINGS),
            unitsRecruited = out.unitsRecruited + newArmies.coerceAtMost(MAX_UNITS),
        )

        // Cards played this step are the ones that just landed on the discard pile.
        if (next.discard.size > prev.discard.size) {
            val played = next.discard.drop(prev.discard.size).take(MAX_CARDS)
            out = out.copy(
                cardsPlayedTotal = out.cardsPlayedTotal + played.size,
                techCardsPlayedTotal = out.techCardsPlayedTotal + played.count { it.type == CardType.TECHNOLOGY },
                legendaryCardsPlayed = out.legendaryCardsPlayed + played.count { it.rarity == Rarity.LEGENDARY },
                uniqueCardIdsPlayed = out.uniqueCardIdsPlayed + played.map { it.id },
            )
        }

        var alliances = 0
        var wars = 0
        var treaties = 0
        for (rel in next.relations) {
            if (!rel.involves(player)) continue
            val prevRel = prev.relations.firstOrNull { it.isBetween(rel.factionA, rel.factionB) }
            val prevTypes = prevRel?.treaties.orEmpty().map { it.type }.toSet()
            val added = rel.treaties.size - (prevRel?.treaties?.size ?: 0)
            if (added > 0) treaties += added.coerceAtMost(MAX_TREATIES)
            for (t in rel.treaties) {
                if (t.type in prevTypes) continue
                if (t.type == TreatyType.ALLIANCE) alliances++
                if (t.type.isWar) wars++
            }
        }
        return out.copy(
            alliancesFormed = out.alliancesFormed + alliances,
            warsDeclared = out.warsDeclared + wars,
            treatiesSigned = out.treatiesSigned + treaties,
        )
    }

    /** A battle the player fought, as attacker or defender. */
    fun onBattle(s: PlayerStats, battle: BattleReport, player: FactionId): PlayerStats {
        val attacking = battle.attackerFaction == player
        if (!attacking && battle.defenderFaction != player) return s
        val won = attacking == battle.attackerWon
        if (!won) return s.copy(battlesLost = s.battlesLost + 1, currentWinStreakBattles = 0)
        val losses = if (attacking) battle.attackerLosses else battle.defenderLosses
        val streak = s.currentWinStreakBattles + 1
        return s.copy(
            battlesWon = s.battlesWon + 1,
            perfectBattlesWon = s.perfectBattlesWon + if (losses.cavalry + losses.infantry == 0) 1 else 0,
            currentWinStreakBattles = streak,
            longestWinStreakBattles = maxOf(s.longestWinStreakBattles, streak),
        )
    }

    /** A finished campaign. */
    fun onGameOver(s: PlayerStats, game: GameState): PlayerStats {
        val player = game.playerFactionId
        if (game.winnerId != player) return s.copy(gamesPlayed = s.gamesPlayed + 1, currentGameWinStreak = 0)
        val streak = s.currentGameWinStreak + 1
        var out = s.copy(
            gamesPlayed = s.gamesPlayed + 1,
            gamesWon = s.gamesWon + 1,
            currentGameWinStreak = streak,
            longestGameWinStreak = maxOf(s.longestGameWinStreak, streak),
            fastestVictoryTurn = s.fastestVictoryTurn?.let { minOf(it, game.turn) } ?: game.turn,
            hardDifficultyWins = s.hardDifficultyWins + if (game.difficulty == Difficulty.HARD) 1 else 0,
            victoriesByFaction = s.victoriesByFaction + (player to (s.victoriesByFaction[player] ?: 0) + 1),
        )
        out = when (game.winCondition) {
            WinCondition.MILITARY -> out.copy(militaryVictories = out.militaryVictories + 1)
            WinCondition.ECONOMIC -> out.copy(economicVictories = out.economicVictories + 1)
            WinCondition.TECHNOLOGY -> out.copy(technologyVictories = out.technologyVictories + 1)
            WinCondition.DIPLOMATIC -> out.copy(diplomaticVictories = out.diplomaticVictories + 1)
            WinCondition.CULTURAL -> out.copy(culturalVictories = out.culturalVictories + 1)
            null -> out
        }
        return out
    }

    /** Achievements whose rule is met by [s] and that are not yet unlocked. */
    fun newlyMet(s: PlayerStats, unlocked: Set<String>): List<AchievementDef> =
        ACHIEVEMENTS.filter { it.id !in unlocked && it.check.isMet(s) }
}

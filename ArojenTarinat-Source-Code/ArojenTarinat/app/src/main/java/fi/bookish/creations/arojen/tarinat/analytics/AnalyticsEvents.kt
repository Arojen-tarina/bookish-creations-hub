package fi.bookish.creations.arojen.tarinat.analytics

import fi.bookish.creations.arojen.tarinat.game.achievements.AchievementDef
import fi.bookish.creations.arojen.tarinat.game.model.BattleReport
import fi.bookish.creations.arojen.tarinat.game.model.GameState
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonObjectBuilder
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.encodeToJsonElement
import kotlinx.serialization.json.put

/** One analytics event: its name and payload, as the original's types.ts defined them. */
@Serializable
data class AnalyticsEvent(val name: String, val payload: JsonObject)

/**
 * The original game's analytics events (src/lib/analytics/types.ts), with the
 * same names and payload keys, so the client's Supabase views keep working.
 * [ALLOWED] mirrors the CHECK constraint on analytics_events.event_name: an
 * event outside it would make the database reject its whole batch.
 */
object Events {
    val ALLOWED = setOf(
        "session_start", "session_end",
        "onboarding_step",
        "game_start", "game_over", "campaign_restart", "game_saved", "game_loaded",
        "progression_snapshot",
        "battle_outcome",
        "building_constructed", "army_recruited",
        "card_played",
        "treaty_proposed", "treaty_broken", "war_declared",
        "achievement_unlocked",
        "menu_interaction", "settings_changed",
        "experiment_assigned",
    )

    private fun event(name: String, body: JsonObjectBuilder.() -> Unit) = AnalyticsEvent(name, buildJsonObject(body))

    /** An enum's wire name ("alliance", "song"...), as the original wrote it. */
    private inline fun <reified T> wire(value: T): JsonElement = Json.encodeToJsonElement(value)

    fun sessionStart(clientId: String, sessionId: String, daysSinceFirstOpen: Int, isNewPlayer: Boolean) = event("session_start") {
        put("clientId", clientId)
        put("sessionId", sessionId)
        put("daysSinceFirstOpen", daysSinceFirstOpen)
        put("isNewPlayer", isNewPlayer)
    }

    fun sessionEnd(sessionId: String, durationMs: Long, turnsThisSession: Int) = event("session_end") {
        put("sessionId", sessionId)
        put("durationMs", durationMs)
        put("turnsThisSession", turnsThisSession)
    }

    enum class Onboarding(val wire: String) {
        FACTION_SELECT_VIEWED("faction_select_viewed"),
        FACTION_CHOSEN("faction_chosen"),
        TURN_1_COMPLETED("turn_1_completed"),
        TURN_5_COMPLETED("turn_5_completed"),
        FIRST_BATTLE("first_battle"),
        FIRST_BUILDING("first_building"),
    }

    fun onboarding(step: Onboarding) = event("onboarding_step") { put("step", step.wire) }

    fun gameStart(state: GameState, isContinue: Boolean) = event("game_start") {
        put("faction", wire(state.playerFactionId))
        put("difficulty", wire(state.difficulty))
        put("isContinue", isContinue)
    }

    fun gameOver(state: GameState, sessionTurns: Int) = event("game_over") {
        put("faction", wire(state.playerFactionId))
        put("won", state.winnerId == state.playerFactionId)
        put("winCondition", state.winCondition?.let { wire(it) } ?: JsonNull)
        put("turn", state.turn)
        put("year", state.year)
        put("sessionTurns", sessionTurns)
    }

    fun campaignRestart(state: GameState) = event("campaign_restart") {
        put("faction", wire(state.playerFactionId))
        put("turnAtRestart", state.turn)
        put("midGame", !state.gameOver)
    }

    /** Slot 0 is the autosave, written "auto" as the original did. */
    private fun JsonObjectBuilder.putSlot(slot: Int) = if (slot == 0) put("slot", "auto") else put("slot", slot)

    fun gameSaved(slot: Int) = event("game_saved") { putSlot(slot) }

    fun gameLoaded(slot: Int) = event("game_loaded") { putSlot(slot) }

    fun battleOutcome(report: BattleReport, player: GameState) = event("battle_outcome") {
        val attacking = report.attackerFaction == player.playerFactionId
        val losses = if (attacking) report.attackerLosses else report.defenderLosses
        put("faction", wire(player.playerFactionId))
        put("won", report.attackerWon == attacking)
        put("isAttacker", attacking)
        put("turn", player.turn)
        put("attackerPower", report.attackerPower)
        put("defenderPower", report.defenderPower)
        put("unitsLost", losses.cavalry + losses.infantry)
    }

    fun achievementUnlocked(def: AchievementDef, sessionsSinceFirstOpen: Int) = event("achievement_unlocked") {
        put("id", def.id)
        put("category", def.category.name.lowercase())
        put("difficulty", def.difficulty.name.lowercase())
        put("points", def.points)
        put("sessionsSinceFirstOpen", sessionsSinceFirstOpen)
    }

    fun menuInteraction(target: String) = event("menu_interaction") { put("target", target) }

    fun settingsChanged(setting: String, value: String) = event("settings_changed") {
        put("setting", setting)
        put("value", value)
    }

    /**
     * Events a change of the campaign implies, worked out from the state before
     * and after, as the original's useAchievementTracking.ts did: recruits,
     * buildings, played cards, treaties, the per-turn progression snapshot with
     * its onboarding steps, and the end of the campaign. A new game or a loaded
     * save (no [prev], or another campaign) implies nothing.
     */
    fun fromStateChange(prev: GameState, next: GameState, sessionTurns: Int): List<AnalyticsEvent> {
        if (prev.playerFactionId != next.playerFactionId || next.turn < prev.turn) return emptyList()
        val player = next.playerFactionId
        val turn = next.turn
        val events = mutableListOf<AnalyticsEvent>()

        val oldArmies = prev.armies.filter { it.ownerId == player }.map { it.id }.toSet()
        for (army in next.armies) {
            if (army.ownerId != player || army.id in oldArmies) continue
            events += event("army_recruited") {
                put("type", if (army.cavalry > army.infantry) "cavalry" else "infantry")
                put("turn", turn)
            }
        }

        for (province in next.provinces) {
            if (province.ownerId != player) continue
            val now = next.buildingsIn(province.id)
            val before = prev.buildingsIn(province.id)
            for (type in now.drop(before.size)) {
                events += event("building_constructed") {
                    put("type", wire(type))
                    put("turn", turn)
                    put("goldCost", type.goldCost)
                }
            }
        }

        // Cards that left the hand were played (counted, as one card may be held twice).
        val remaining = next.hand.groupingBy { it.id }.eachCount().toMutableMap()
        for (card in prev.hand) {
            val left = remaining[card.id] ?: 0
            if (left > 0) {
                remaining[card.id] = left - 1
                continue
            }
            events += event("card_played") {
                put("cardId", card.id)
                put("cardType", wire(card.type))
                put("rarity", card.rarity?.let { wire(it) } ?: JsonNull)
                put("turn", turn)
            }
        }

        for (relation in next.relations) {
            if (!relation.involves(player)) continue
            val target = if (relation.factionA == player) relation.factionB else relation.factionA
            val before = prev.relation(relation.factionA, relation.factionB)?.treaties.orEmpty().map { it.type }.toSet()
            val after = relation.treaties.map { it.type }.toSet()
            for (type in after - before) {
                events += if (type.isWar) {
                    event("war_declared") {
                        put("targetFaction", wire(target))
                        put("turn", turn)
                    }
                } else {
                    event("treaty_proposed") {
                        put("targetFaction", wire(target))
                        put("treatyType", wire(type))
                        put("turn", turn)
                    }
                }
            }
            for (type in before - after) {
                events += event("treaty_broken") {
                    put("targetFaction", wire(target))
                    put("treatyType", wire(type))
                    put("turn", turn)
                }
            }
        }

        if (next.turn == prev.turn + 1) {
            val owned = next.provinces.filter { it.ownerId == player }
            events += event("progression_snapshot") {
                put("turn", turn)
                put("faction", wire(player))
                put("difficulty", wire(next.difficulty))
                put("provincesOwned", owned.size)
                put("treasury", next.player.treasury)
                put("armiesOwned", next.armies.count { it.ownerId == player })
                put("buildingsOwned", owned.sumOf { next.buildingsIn(it.id).size })
            }
            if (prev.turn == 1) events += onboarding(Onboarding.TURN_1_COMPLETED)
            if (prev.turn == 5) events += onboarding(Onboarding.TURN_5_COMPLETED)
        }

        if (next.gameOver && !prev.gameOver) events += gameOver(next, sessionTurns)
        return events
    }
}

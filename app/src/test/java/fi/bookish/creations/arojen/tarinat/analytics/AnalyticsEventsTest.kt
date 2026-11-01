package fi.bookish.creations.arojen.tarinat.analytics

import fi.bookish.creations.arojen.tarinat.game.engine.Mulberry32
import fi.bookish.creations.arojen.tarinat.game.engine.endTurn
import fi.bookish.creations.arojen.tarinat.game.engine.startGame
import fi.bookish.creations.arojen.tarinat.game.model.BuildingType
import fi.bookish.creations.arojen.tarinat.game.model.Difficulty
import fi.bookish.creations.arojen.tarinat.game.model.FactionId
import fi.bookish.creations.arojen.tarinat.game.model.Treaty
import fi.bookish.creations.arojen.tarinat.game.model.TreatyType
import fi.bookish.creations.arojen.tarinat.game.model.WinCondition
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/** The events must match the original's names and payload keys, or the client's Supabase views break. */
class AnalyticsEventsTest {
    private val start = startGame(FactionId.MONGOL, Difficulty.HARD, Mulberry32(11))
    private val player = start.playerFactionId

    private fun names(events: List<AnalyticsEvent>) = events.map { it.name }

    @Test
    fun `recruits, buildings and played cards are found by comparing states`() {
        val home = start.provinces.first { it.ownerId == player }
        val recruit = start.armies.first { it.ownerId == player }.copy(id = "army-new", cavalry = 5, infantry = 1)
        val card = start.hand.first()
        val next = start.copy(
            armies = start.armies + recruit,
            buildings = start.buildings + (home.id to start.buildingsIn(home.id) + BuildingType.MARKET),
            hand = start.hand.drop(1),
            discard = start.discard + card,
        )
        val events = Events.fromStateChange(start, next, sessionTurns = 0)
        assertEquals(listOf("army_recruited", "building_constructed", "card_played"), names(events))
        assertEquals("cavalry", events[0].payload["type"]!!.jsonPrimitive.content)
        assertEquals("market", events[1].payload["type"]!!.jsonPrimitive.content)
        assertEquals(BuildingType.MARKET.goldCost, events[1].payload["goldCost"]!!.jsonPrimitive.content.toInt())
        assertEquals(card.id, events[2].payload["cardId"]!!.jsonPrimitive.content)
        assertEquals(setOf("cardId", "cardType", "rarity", "turn"), events[2].payload.keys)
    }

    @Test
    fun `treaties signed, wars declared and treaties broken`() {
        val relation = start.relations.first { it.involves(player) }
        val rival = if (relation.factionA == player) relation.factionB else relation.factionA
        fun withTreaties(vararg types: TreatyType) = start.copy(
            relations = start.relations.map { r -> if (r == relation) r.copy(treaties = types.map { Treaty(it, start.turn, -1) }) else r },
        )
        val trade = withTreaties(TreatyType.TRADE_AGREEMENT)
        val signed = Events.fromStateChange(start, trade, 0).single()
        assertEquals("treaty_proposed", signed.name)
        assertEquals("trade_agreement", signed.payload["treatyType"]!!.jsonPrimitive.content)
        assertEquals(rival.key, signed.payload["targetFaction"]!!.jsonPrimitive.content)

        val war = Events.fromStateChange(trade, withTreaties(TreatyType.WAR_FORMAL), 0)
        assertEquals(listOf("war_declared", "treaty_broken"), names(war))
    }

    @Test
    fun `a new turn sends the progression snapshot and the onboarding step`() {
        val turn2 = endTurn(start, Mulberry32(12))
        val events = Events.fromStateChange(start, turn2, 1)
        val snapshot = events.first { it.name == "progression_snapshot" }
        assertEquals(
            setOf("turn", "faction", "difficulty", "provincesOwned", "treasury", "armiesOwned", "buildingsOwned"),
            snapshot.payload.keys,
        )
        assertEquals("hard", snapshot.payload["difficulty"]!!.jsonPrimitive.content)
        val step = events.first { it.name == "onboarding_step" }
        assertEquals("turn_1_completed", step.payload["step"]!!.jsonPrimitive.content)
        // Loading another campaign is not a change of this one.
        assertTrue(Events.fromStateChange(turn2, start, 0).isEmpty())
    }

    @Test
    fun `the end of a campaign`() {
        val won = start.copy(gameOver = true, winnerId = player, winCondition = WinCondition.ECONOMIC)
        val over = Events.fromStateChange(start, won, sessionTurns = 7).single()
        assertEquals("game_over", over.name)
        assertEquals(JsonPrimitive(true), over.payload["won"])
        assertEquals("economic", over.payload["winCondition"]!!.jsonPrimitive.content)
        assertEquals(7, over.payload["sessionTurns"]!!.jsonPrimitive.content.toInt())
    }

    @Test
    fun `every event the game sends is one the database accepts`() {
        val all = listOf(
            Events.sessionStart("c", "s", 0, true),
            Events.sessionEnd("s", 1000, 3),
            Events.onboarding(Events.Onboarding.FIRST_BUILDING),
            Events.gameStart(start, isContinue = false),
            Events.gameOver(start, 0),
            Events.campaignRestart(start),
            Events.gameSaved(0),
            Events.gameLoaded(2),
            Events.menuInteraction("codex"),
            Events.settingsChanged("language", "fi"),
        )
        for (event in all) assertTrue(event.name, event.name in Events.ALLOWED)
        assertEquals(JsonPrimitive("auto"), Events.gameSaved(0).payload["slot"])
        assertEquals(JsonPrimitive(2), Events.gameLoaded(2).payload["slot"])
    }

    @Test
    fun `rows use the table's column names`() {
        val row = AnalyticsRow("client", "session", "game_saved", buildJsonObject { }, "android", "2.0.0")
        val json = Json.parseToJsonElement(Json.encodeToString(ListSerializer(AnalyticsRow.serializer()), listOf(row)))
        assertEquals(
            // No created_at: the database sets it, so a phone's wrong clock cannot date rows into the future.
            setOf("client_id", "session_id", "event_name", "payload", "platform", "app_version"),
            json.jsonArray.single().jsonObject.keys,
        )
    }
}

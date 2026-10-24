package fi.bookish.creations.arojen.tarinat.game

import fi.bookish.creations.arojen.tarinat.game.data.ACTIVE_FACTIONS
import fi.bookish.creations.arojen.tarinat.game.data.CARD_CATALOG
import fi.bookish.creations.arojen.tarinat.game.data.PROVINCES_1206
import fi.bookish.creations.arojen.tarinat.game.engine.BuildBlock
import fi.bookish.creations.arojen.tarinat.game.engine.GameRandom
import fi.bookish.creations.arojen.tarinat.game.engine.Mulberry32
import fi.bookish.creations.arojen.tarinat.game.engine.buildBlocker
import fi.bookish.creations.arojen.tarinat.game.engine.buildStructure
import fi.bookish.creations.arojen.tarinat.game.engine.attackPower
import fi.bookish.creations.arojen.tarinat.game.engine.canMoveTo
import fi.bookish.creations.arojen.tarinat.game.engine.endTurn
import fi.bookish.creations.arojen.tarinat.game.engine.moveArmy
import fi.bookish.creations.arojen.tarinat.game.engine.playCard
import fi.bookish.creations.arojen.tarinat.game.engine.recruitArmy
import fi.bookish.creations.arojen.tarinat.game.engine.startGame
import fi.bookish.creations.arojen.tarinat.game.model.Army
import fi.bookish.creations.arojen.tarinat.game.model.BuildingType
import fi.bookish.creations.arojen.tarinat.game.model.Difficulty
import fi.bookish.creations.arojen.tarinat.game.model.FactionId
import fi.bookish.creations.arojen.tarinat.game.model.GameState
import fi.bookish.creations.arojen.tarinat.game.model.RecruitType
import fi.bookish.creations.arojen.tarinat.game.model.Treaty
import fi.bookish.creations.arojen.tarinat.game.model.TreatyType
import fi.bookish.creations.arojen.tarinat.game.model.TurnLogKind
import fi.bookish.creations.arojen.tarinat.game.model.WinCondition
import kotlinx.serialization.json.Json
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File

class GameRulesTest {

    private fun newGame(faction: FactionId = FactionId.MONGOL, seed: Int = 7) =
        startGame(faction, Difficulty.NORMAL, Mulberry32(seed))

    @Test
    fun `static data is consistent`() {
        assertEquals(221, PROVINCES_1206.size)
        val ids = PROVINCES_1206.map { it.id }.toSet()
        assertEquals(221, ids.size)
        PROVINCES_1206.forEach { p ->
            p.neighbors.forEach { n ->
                assertTrue("${p.id} -> $n missing", n in ids)
                assertTrue("${p.id} <-> $n not symmetric", p.id in PROVINCES_1206.first { it.id == n }.neighbors)
            }
        }
        assertEquals(85, CARD_CATALOG.map { it.id }.toSet().size)
    }

    @Test
    fun `card artwork exists except for the ten livestock and trade cards`() {
        // The original game never shipped art for res-041..res-050; the UI draws a fallback face for them.
        val dir = File("src/main/assets/cards")
        val missing = CARD_CATALOG.map { it.id }.filterNot { File(dir, "$it.jpg").exists() }.toSet()
        assertEquals((41..50).map { "res-%03d".format(it) }.toSet(), missing)
    }

    @Test
    fun `new game starts balanced`() {
        for (faction in ACTIVE_FACTIONS) {
            val s = newGame(faction)
            assertEquals(4, s.factions.size)
            assertEquals(6, s.relations.size)
            assertEquals(5, s.hand.size)
            assertEquals(80, s.deck.size)
            val counts = s.factions.map { f -> s.provinces.count { it.ownerId == f.id } }
            assertEquals("equal starting land for $faction: $counts", 1, counts.toSet().size)
            s.factions.forEach { f -> assertEquals(f.id, s.province(f.capitalId)!!.ownerId) }
            assertTrue(s.resourcesCollected)
            assertEquals(1, s.armies.count { it.ownerId == faction && it.isChief })
        }
    }

    @Test
    fun `attack power includes units siege and active bonus`() {
        val army = Army("test", FactionId.MONGOL, "test", cavalry = 3, infantry = 4, siege = 2, morale = 80, supply = 20, movementLeft = 3)
        assertEquals(17, army.attackPower(5))
    }

    @Test
    fun `cultural victory at prestige target`() {
        val s = endTurn(newGame().copy(prestige = 60), Mulberry32(1))
        assertTrue(s.gameOver)
        assertEquals(FactionId.MONGOL, s.winnerId)
        assertEquals(WinCondition.CULTURAL, s.winCondition)
    }

    @Test
    fun `military victory by taking every rival capital`() {
        val s0 = newGame()
        val capitals = s0.factions.filter { it.id != s0.playerFactionId }.map { it.capitalId }.toSet()
        val s = endTurn(
            s0.copy(provinces = s0.provinces.map { if (it.id in capitals) it.copy(ownerId = s0.playerFactionId) else it }),
            Mulberry32(1),
        )
        assertTrue(s.gameOver)
        assertEquals(WinCondition.MILITARY, s.winCondition)
    }

    @Test
    fun `defeat when no land and no armies remain`() {
        val s0 = newGame()
        val player = s0.playerFactionId
        val s = endTurn(
            s0.copy(
                provinces = s0.provinces.map { if (it.ownerId == player) it.copy(ownerId = null) else it },
                armies = s0.armies.filter { it.ownerId != player },
            ),
            Mulberry32(1),
        )
        assertTrue(s.gameOver)
        assertNull(s.winnerId)
    }

    @Test
    fun `chief slain during the AI turn costs influence once`() {
        // Song player; a lone, weakened Chief stands next to a huge Mongol army that can only attack him.
        val s0 = newGame(FactionId.SONG).copy(influence = 40)
        val player = s0.playerFactionId
        val chiefLand = s0.provinces.first { it.ownerId == null && it.terrain.movementCost <= 3 }
        val mongolLand = s0.province(chiefLand.neighbors.first())!!
        val provinces = s0.provinces.map {
            when (it.id) {
                chiefLand.id -> it.copy(ownerId = player, fortLevel = 0, garrison = 0)
                mongolLand.id -> it.copy(ownerId = FactionId.MONGOL)
                in mongolLand.neighbors -> it.copy(ownerId = null)
                else -> it
            }
        }
        val horde = Army("horde", FactionId.MONGOL, mongolLand.id, cavalry = 50, infantry = 50, siege = 0, morale = 90, supply = 30, movementLeft = 3)
        val armies = s0.armies.map {
            if (it.id == Army.chiefArmyId(player)) it.copy(provinceId = chiefLand.id, cavalry = 0, infantry = 1, siege = 0) else it
        } + horde

        val s1 = endTurn(s0.copy(provinces = provinces, armies = armies), Mulberry32(3))
        assertTrue(s1.armies.none { it.id == Army.chiefArmyId(player) })
        assertTrue(s1.chiefLost)
        assertTrue(s1.turnLog.any { it.kind == TurnLogKind.PLAYER_CHIEF_FELL })
        assertTrue(s1.influence < 40 + s1.lastCollection!!.influenceGain)
        // The penalty does not repeat on later turns.
        val s2 = endTurn(s1, Mulberry32(4))
        assertFalse(s2.turnLog.any { it.kind == TurnLogKind.PLAYER_CHIEF_FELL })
    }

    @Test
    fun `peace treaty blocks entering a rival's land`() {
        val s0 = newGame()
        val player = s0.playerFactionId
        // A siege-free, cavalry-heavy army with full movement standing next to rival land
        // (cavalry never pays more than 3 movement for any terrain).
        val target = s0.provinces.first { it.ownerId != null && it.ownerId != player }
        val army = s0.armies.first { it.ownerId == player }
            .copy(provinceId = target.neighbors.first(), siege = 0, cavalry = 10, infantry = 5, movementLeft = 3)
        val base = s0.copy(armies = s0.armies.map { if (it.id == army.id) army else it })
        val rival = target.ownerId!!
        fun withTreaties(vararg treaties: Treaty) = base.copy(relations = base.relations.map {
            if (it.isBetween(player, rival)) it.copy(treaties = treaties.toList()) else it
        })
        assertTrue(canMoveTo(withTreaties(), army.id, target.id))
        assertFalse(canMoveTo(withTreaties(Treaty(TreatyType.PEACE, 1, -1)), army.id, target.id))
        assertTrue(canMoveTo(withTreaties(Treaty(TreatyType.PEACE, 1, -1), Treaty(TreatyType.WAR_SURPRISE, 1, -1)), army.id, target.id))
    }

    @Test
    fun `wonders only in the capital, fortress capped at three`() {
        val s0 = newGame().let { s -> s.copy(artisans = 50, factions = s.factions.map { it.copy(treasury = 5000) }) }
        val player = s0.player
        val otherOwned = s0.provinces.first { it.ownerId == player.id && it.id != player.capitalId }
        assertEquals(BuildBlock.CAPITAL_ONLY, buildBlocker(s0, otherOwned.id, BuildingType.WONDER))
        var s = s0
        repeat(5) { s = buildStructure(s, player.capitalId, BuildingType.FORTRESS) }
        assertEquals(3, s.province(player.capitalId)!!.fortLevel)
        assertEquals(BuildBlock.MAX_LEVEL, buildBlocker(s, player.capitalId, BuildingType.FORTRESS))
        repeat(5) { s = buildStructure(s, player.capitalId, BuildingType.WONDER) }
        assertEquals(3, s.buildingsIn(player.capitalId).count { it == BuildingType.WONDER })
    }

    @Test
    fun `save round trip keeps the whole state`() {
        var s = newGame(FactionId.SONG, 11)
        val rng = Mulberry32(99)
        repeat(6) { s = endTurn(recruitArmy(playCard(s, s.hand.first().id), s.player.capitalId, RecruitType.INFANTRY), rng) }
        val json = Json.encodeToString(GameState.serializer(), s)
        assertEquals(s, Json.decodeFromString(GameState.serializer(), json))
    }

    /** Random play across many seeds: no crashes and core invariants always hold. */
    @Test
    fun `random games keep invariants`() {
        for (seed in 1..40) {
            val rng: GameRandom = Mulberry32(seed)
            val faction = ACTIVE_FACTIONS[seed % ACTIVE_FACTIONS.size]
            var s = startGame(faction, Difficulty.entries[seed % 3], rng)
            for (turn in 1..60) {
                if (s.gameOver) break
                val player = s.playerFactionId
                if (s.hand.isNotEmpty() && rng.nextDouble() < 0.7) s = playCard(s, s.hand.random(kotlin.random.Random(seed + turn)).id)
                val owned = s.provinces.filter { it.ownerId == player }
                if (owned.isNotEmpty()) {
                    val where = owned[(rng.nextDouble() * owned.size).toInt()].id
                    s = buildStructure(s, where, BuildingType.entries[(rng.nextDouble() * BuildingType.entries.size).toInt()])
                    s = recruitArmy(s, s.player.capitalId, if (rng.nextDouble() < 0.5) RecruitType.INFANTRY else RecruitType.CAVALRY)
                }
                for (id in s.armies.filter { it.ownerId == player }.map { it.id }) {
                    val army = s.armies.firstOrNull { it.id == id } ?: continue
                    val options = s.province(army.provinceId)!!.neighbors.filter { canMoveTo(s, id, it) }
                    if (options.isNotEmpty()) s = moveArmy(s, id, options[(rng.nextDouble() * options.size).toInt()], rng).state
                }
                s = endTurn(s, rng)
                assertInvariants(s, "seed $seed turn $turn")
            }
        }
    }

    private fun assertInvariants(s: GameState, where: String) {
        val provinceIds = s.provinces.map { it.id }.toSet()
        val factionIds = s.factions.map { it.id }.toSet()
        s.armies.forEach {
            assertTrue("$where: empty army ${it.id}", it.cavalry + it.infantry > 0)
            assertTrue("$where: army ${it.id} in unknown province", it.provinceId in provinceIds)
            assertTrue("$where: army ${it.id} morale ${it.morale}", it.morale in 10..100)
        }
        assertEquals("$where: duplicate army ids", s.armies.size, s.armies.map { it.id }.toSet().size)
        s.provinces.forEach { p ->
            assertTrue("$where: ${p.id} owned by inactive realm", p.ownerId == null || p.ownerId in factionIds)
            assertTrue("$where: ${p.id} fort ${p.fortLevel}", p.fortLevel in 0..3)
        }
        assertTrue("$where: player treasury negative", s.player.treasury >= 0)
        assertTrue("$where: food negative", s.food >= 0)
        assertEquals("$where: card count", 85, s.deck.size + s.hand.size + s.discard.size)
    }
}

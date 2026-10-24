package fi.bookish.creations.arojen.tarinat.game

import fi.bookish.creations.arojen.tarinat.game.engine.GameRandom
import fi.bookish.creations.arojen.tarinat.game.engine.Mulberry32
import fi.bookish.creations.arojen.tarinat.game.engine.buildStructure
import fi.bookish.creations.arojen.tarinat.game.engine.canMoveTo
import fi.bookish.creations.arojen.tarinat.game.engine.declareWar
import fi.bookish.creations.arojen.tarinat.game.engine.breakTreaty
import fi.bookish.creations.arojen.tarinat.game.engine.endTurn
import fi.bookish.creations.arojen.tarinat.game.engine.isFortDamaged
import fi.bookish.creations.arojen.tarinat.game.engine.mergeArmies
import fi.bookish.creations.arojen.tarinat.game.engine.moveArmy
import fi.bookish.creations.arojen.tarinat.game.engine.playCard
import fi.bookish.creations.arojen.tarinat.game.engine.proposeTreaty
import fi.bookish.creations.arojen.tarinat.game.engine.recruitArmy
import fi.bookish.creations.arojen.tarinat.game.engine.repairFort
import fi.bookish.creations.arojen.tarinat.game.engine.startGame
import fi.bookish.creations.arojen.tarinat.game.model.BuildingType
import fi.bookish.creations.arojen.tarinat.game.model.Difficulty
import fi.bookish.creations.arojen.tarinat.game.model.FactionId
import fi.bookish.creations.arojen.tarinat.game.model.GameState
import fi.bookish.creations.arojen.tarinat.game.model.RecruitType
import fi.bookish.creations.arojen.tarinat.game.model.TreatyType
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.int
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.junit.Assert.assertEquals
import org.junit.Assert.fail
import org.junit.Test
import java.io.File
import java.security.MessageDigest

/**
 * Replays scripted games on the Kotlin engine and compares a canonical snapshot
 * after every step with golden digests recorded from the ORIGINAL TypeScript
 * engine (same seed, same mulberry32 RNG, same scripted player).
 *
 * Golden files: src/test/resources/parity/<faction>_seed<n>.json
 */
class EngineParityTest {

    @Test fun mongol() = runFaction("mongol")
    @Test fun song() = runFaction("song")
    @Test fun rus() = runFaction("rus")
    @Test fun khwarezm() = runFaction("khwarezm")

    private fun runFaction(faction: String) {
        for (seed in 1..3) {
            val name = "${faction}_seed$seed"
            val golden = Json.parseToJsonElement(readResource("parity/$name.json")).jsonObject
            val goldenSteps = golden.getValue("steps").jsonArray.map {
                it.jsonObject.getValue("label").jsonPrimitive.content to it.jsonObject.getValue("sha").jsonPrimitive.content
            }
            val steps = playScripted(
                faction = FactionId.valueOf(faction.uppercase()),
                difficulty = Difficulty.valueOf(golden.getValue("difficulty").jsonPrimitive.content.uppercase()),
                rng = Mulberry32(golden.getValue("seed").jsonPrimitive.int),
                maxTurns = golden.getValue("maxTurns").jsonPrimitive.int,
            )
            dumpTrace(name, steps)
            for ((i, expected) in goldenSteps.withIndex()) {
                val actual = steps.getOrNull(i) ?: throw AssertionError("$name: Kotlin game ended early at step $i (${expected.first})")
                if (sha256(actual.second) != expected.second) {
                    fail("$name: first divergence at step $i '${expected.first}'. Kotlin trace: build/parity-debug/$name.json")
                }
            }
            assertEquals("$name: step count", goldenSteps.size, steps.size)
        }
    }

    /** Must mirror the scripted player in the parity harness (run.ts) exactly. */
    private fun playScripted(faction: FactionId, difficulty: Difficulty, rng: GameRandom, maxTurns: Int): List<Pair<String, String>> {
        val steps = mutableListOf<Pair<String, String>>()
        var s = startGame(faction, difficulty, rng)
        steps += "start" to snapshot(s)
        val buildOrder = listOf(
            BuildingType.MARKET, BuildingType.CAMP, BuildingType.WORKSHOP,
            BuildingType.STABLE, BuildingType.BRIDGE, BuildingType.FORTRESS,
        )
        for (i in 0 until maxTurns) {
            if (s.gameOver) break
            val player = s.playerFactionId
            val turn = s.turn
            if (s.hand.isNotEmpty()) s = playCard(s, s.hand[0].id)

            val capital = s.player.capitalId
            for (b in buildOrder) s = buildStructure(s, capital, b)
            if (turn >= 10) s = buildStructure(s, capital, BuildingType.WONDER)

            s = recruitArmy(s, capital, RecruitType.INFANTRY)
            if (turn % 3 == 0) s = recruitArmy(s, capital, RecruitType.CAVALRY)

            val groups = LinkedHashMap<String, MutableList<String>>()
            s.armies.filter { it.ownerId == player }.forEach { groups.getOrPut(it.provinceId) { mutableListOf() }.add(it.id) }
            for (list in groups.values) for (k in 1 until list.size) s = mergeArmies(s, list[k], list[0])

            for (id in s.armies.filter { it.ownerId == player }.map { it.id }) {
                val army = s.armies.firstOrNull { it.id == id } ?: continue
                val province = s.province(army.provinceId)!!
                for (n in province.neighbors) {
                    if (s.province(n)!!.ownerId != player && canMoveTo(s, id, n)) {
                        s = moveArmy(s, id, n, rng).state
                        break
                    }
                }
            }

            val rivals = s.factions.filter { it.id != player }.map { it.id }
            if (turn == 3) rivals.getOrNull(0)?.let { s = proposeTreaty(s, it, TreatyType.TRADE_AGREEMENT, rng).state }
            if (turn == 5) rivals.getOrNull(1)?.let { s = proposeTreaty(s, it, TreatyType.ALLIANCE, rng).state }
            if (turn == 8) rivals.getOrNull(2)?.let { s = proposeTreaty(s, it, TreatyType.NON_AGGRESSION, rng).state }
            if (turn == 12) rivals.getOrNull(2)?.let { s = declareWar(s, it, surprise = false, rng = rng) }
            if (turn == 16) rivals.getOrNull(0)?.let { s = breakTreaty(s, it, TreatyType.TRADE_AGREEMENT) }
            if (turn == 20) rivals.getOrNull(1)?.let { s = declareWar(s, it, surprise = true, rng = rng) }

            for (p in s.provinces) if (p.ownerId == player && p.isFortDamaged) s = repairFort(s, p.id, useArtisan = false)

            steps += "t$turn-actions" to snapshot(s)
            s = endTurn(s, rng)
            steps += "t$turn-end" to snapshot(s)
        }
        return steps
    }

    // ---------- canonical snapshot (byte-identical to run.ts) ----------

    private fun Enum<*>.key() = JsonPrimitive(name.lowercase())
    private fun arr(vararg items: Any?): JsonArray = JsonArray(items.map { it.toJson() })
    private fun Any?.toJson(): JsonElement = when (this) {
        null -> JsonNull
        is JsonElement -> this
        is Int -> JsonPrimitive(this)
        is Boolean -> JsonPrimitive(this)
        is String -> JsonPrimitive(this)
        is Enum<*> -> key()
        is List<*> -> JsonArray(map { it.toJson() })
        else -> error("unsupported ${this::class}")
    }

    private fun snapshot(s: GameState): String {
        val lc = s.lastCollection
        return arr(
            s.turn, s.year, s.food, s.artisans, s.influence, s.prestige, s.treasuryStreak,
            s.aiTreasuryStreaks.entries.sortedBy { it.key.key }.map { listOf(it.key, it.value) },
            s.gameOver, s.winnerId, s.winCondition, s.chiefLost,
            s.attackBonus, s.defenseBonus, s.movementBonus,
            s.factions.map { listOf(it.id, it.treasury, it.manpower, it.horses) },
            s.provinces.map { listOf(it.id, it.ownerId, it.fortLevel, it.fortDurability, it.garrison, it.unrest, it.siegeProgress) },
            s.armies.map { listOf(it.id, it.ownerId, it.provinceId, it.cavalry, it.infantry, it.movementLeft) },
            s.hand.map { it.id }, s.deck.map { it.id }, s.discard.map { it.id }, s.playedTechCards.map { it.id },
            s.activeEffects.map { listOf(it.cardId, it.type, it.value, it.remainingTurns) },
            s.buildings.keys.sorted().map { listOf(it, s.buildings.getValue(it)) },
            s.relations.map { r ->
                listOf(r.factionA, r.factionB, r.relation, r.trust, r.threat, r.lastProposalTurn, r.treaties.map { listOf(it.type, it.startTurn, it.duration) })
            },
            s.turnLog.size,
            lc?.let {
                listOf(it.taxIncome, it.manpowerGain, it.marketBonus, it.silkRoadBonus, it.foodChange, it.artisansGain, it.horsesGain, it.influenceGain, it.prestigeGain)
            },
            s.resourcesCollected,
        ).toString()
    }

    private fun sha256(s: String): String =
        MessageDigest.getInstance("SHA-256").digest(s.toByteArray()).joinToString("") { "%02x".format(it) }

    private fun readResource(path: String): String =
        requireNotNull(javaClass.classLoader?.getResource(path)) { "missing test resource $path" }.readText()

    /** Full Kotlin trace for diffing against the harness's full trace when a step diverges. */
    private fun dumpTrace(name: String, steps: List<Pair<String, String>>) {
        val dir = File("build/parity-debug").apply { mkdirs() }
        File(dir, "$name.json").writeText(
            steps.joinToString(",", "[", "]") { (label, snap) -> "{\"label\":\"$label\",\"snap\":${JsonPrimitive(snap)}}" },
        )
    }
}

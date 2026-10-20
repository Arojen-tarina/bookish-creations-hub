package fi.bookish.creations.arojen.tarinat.data

import fi.bookish.creations.arojen.tarinat.game.engine.Mulberry32
import fi.bookish.creations.arojen.tarinat.game.engine.buildBlocker
import fi.bookish.creations.arojen.tarinat.game.engine.buildStructure
import fi.bookish.creations.arojen.tarinat.game.engine.canMoveTo
import fi.bookish.creations.arojen.tarinat.game.engine.endTurn
import fi.bookish.creations.arojen.tarinat.game.engine.moveArmy
import fi.bookish.creations.arojen.tarinat.game.engine.playCard
import fi.bookish.creations.arojen.tarinat.game.engine.proposeTreaty
import fi.bookish.creations.arojen.tarinat.game.engine.recruitArmy
import fi.bookish.creations.arojen.tarinat.game.engine.recruitBlocker
import fi.bookish.creations.arojen.tarinat.game.engine.startGame
import fi.bookish.creations.arojen.tarinat.game.model.BuildingType
import fi.bookish.creations.arojen.tarinat.game.model.Difficulty
import fi.bookish.creations.arojen.tarinat.game.model.FactionId
import fi.bookish.creations.arojen.tarinat.game.model.GameState
import fi.bookish.creations.arojen.tarinat.game.model.RecruitType
import fi.bookish.creations.arojen.tarinat.game.model.TreatyType
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.test.runTest
import org.junit.Test
import java.io.File

/**
 * Store screenshots: plays the Mongol realm for 13 turns with the real engine and writes the
 * campaign as an autosave, so the screenshots show a believable mid-game (see BUILD.md).
 * Runs only with the AROJEN_SCREENSHOT_STATE environment variable set to an output folder.
 */
class StoreScreenshotStateGen {
    @Test
    fun `generate a mid-game autosave for store screenshots`() = runTest {
        val outDir = System.getenv("AROJEN_SCREENSHOT_STATE") ?: return@runTest
        val rng = Mulberry32(1206)
        var game = startGame(FactionId.MONGOL, Difficulty.NORMAL, rng)
        val player = game.playerFactionId
        repeat(13) { turn ->
            // March every army into reachable unclaimed land, as far as its movement allows.
            for (armyId in game.armies.filter { it.ownerId == player }.map { it.id }) {
                repeat(3) {
                    val army = game.armies.firstOrNull { it.id == armyId } ?: return@repeat
                    if (army.movementLeft <= 0) return@repeat
                    // Unclaimed land first, then undefended provinces of the minor realms, then any undefended one.
                    val target = game.province(army.provinceId)?.neighbors.orEmpty()
                        .filter { id -> canMoveTo(game, armyId, id) && game.armies.none { it.provinceId == id && it.ownerId != player } }
                        .sortedBy { id ->
                            when (game.province(id)?.ownerId) {
                                null -> 0
                                player -> 9
                                FactionId.JIN, FactionId.XIXIA, FactionId.KIPCHAK -> 1
                                else -> 2
                            }
                        }
                        .let { options ->
                            // Inland armies first walk to a border province.
                            options.firstOrNull { id -> game.province(id)?.ownerId != player }
                                ?: options.firstOrNull { id -> game.province(id)?.neighbors.orEmpty().any { game.province(it)?.ownerId != player } }
                        }
                        ?: return@repeat
                    game = moveArmy(game, armyId, target, rng).state
                }
            }
            val capital = game.player.capitalId
            if (recruitBlocker(game, capital, RecruitType.CAVALRY) == null) game = recruitArmy(game, capital, RecruitType.CAVALRY)
            val owned = game.provinces.filter { it.ownerId == player }
            for (type in listOf(BuildingType.MARKET, BuildingType.CAMP, BuildingType.STABLE, BuildingType.WORKSHOP)) {
                owned.firstOrNull { p -> type !in game.buildingsIn(p.id) && buildBlocker(game, p.id, type) == null }
                    ?.let { game = buildStructure(game, it.id, type) }
            }
            if (turn % 3 == 1) game.hand.firstOrNull()?.let { game = playCard(game, it.id) }
            if (turn == 4) game = proposeTreaty(game, FactionId.KHWAREZM, TreatyType.TRADE_AGREEMENT, rng).state
            if (turn == 6) game = proposeTreaty(game, FactionId.SONG, TreatyType.NON_AGGRESSION, rng).state
            game = endTurn(game, rng)
            check(!game.gameOver) { "campaign ended on turn ${game.turn}" }
        }
        val repo = SaveRepository(File(outDir), io = Dispatchers.Unconfined)
        check(repo.autosave(game))
        println("screenshot state: turn ${game.turn}, ${game.provinces.count { it.ownerId == player }} provinces, " +
            "${game.armies.count { it.ownerId == player }} armies, gold ${game.player.treasury}")
        println(summary(game))
    }

    private fun summary(game: GameState) = game.factions.joinToString { f -> "${f.id}=${game.provinces.count { it.ownerId == f.id }}" }
}

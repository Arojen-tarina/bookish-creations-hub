package fi.bookish.creations.arojen.tarinat.game.engine

import fi.bookish.creations.arojen.tarinat.game.model.GameState

/**
 * The second chance: after a defeat the player may watch an ad and play the lost
 * turn again from its start. Not part of the original rules; offered once per
 * campaign, so a defeat still means something.
 */
fun canTakeSecondChance(state: GameState): Boolean =
    state.gameOver && state.winnerId != state.playerFactionId && !state.secondChanceUsed

/**
 * The campaign as it stood when the lost turn began ([turnStart]), marked so the
 * offer is not made again. The rival realms will move differently this time.
 */
fun takeSecondChance(turnStart: GameState): GameState = turnStart.copy(secondChanceUsed = true)

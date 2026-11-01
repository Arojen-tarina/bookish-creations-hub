package fi.bookish.creations.arojen.tarinat.game.engine

import fi.bookish.creations.arojen.tarinat.game.model.FactionId
import fi.bookish.creations.arojen.tarinat.game.model.GameState
import fi.bookish.creations.arojen.tarinat.game.model.Treaty
import fi.bookish.creations.arojen.tarinat.game.model.TreatyType
import kotlin.math.max
import kotlin.math.min

/** A surprise war is active at once; a formal declaration takes effect the following turn. */
fun Treaty.isActiveWar(currentTurn: Int): Boolean =
    type == TreatyType.WAR_SURPRISE || (type == TreatyType.WAR_FORMAL && startTurn <= currentTurn)

data class TreatyResult(val state: GameState, val accepted: Boolean)

/**
 * The player offers [treatyType] to [target]. Wars are always "accepted";
 * other offers succeed with a chance driven by relation and trust, and only
 * one non-war offer per rival per turn is allowed.
 */
fun proposeTreaty(state: GameState, target: FactionId, treatyType: TreatyType, rng: GameRandom): TreatyResult {
    val player = state.playerFactionId
    val rel = state.relation(player, target) ?: return TreatyResult(state, false)
    val isWar = treatyType.isWar
    if (!isWar && rel.lastProposalTurn == state.turn) return TreatyResult(state, false)

    val accepts = isWar || rng.nextDouble() < ((rel.relation + 100) / 200.0) * (rel.trust / 100.0) + 0.2
    if (!accepts) {
        val rejected = rel.copy(
            lastProposalTurn = state.turn,
            relation = max(-100, rel.relation - 3),
            trust = max(0, rel.trust - 2),
        )
        return TreatyResult(state.copy(relations = state.relations.map { if (it === rel) rejected else it }), false)
    }

    val relations = state.relations.map { r ->
        val involvesPlayer = r.involves(player)
        when {
            // A surprise attack shatters every peaceful treaty the player holds.
            treatyType == TreatyType.WAR_SURPRISE && involvesPlayer -> r.copy(
                treaties = r.treaties.filter { !it.type.isPeaceful } + Treaty(treatyType, state.turn, -1),
                relation = -100,
                trust = 0,
                threat = min(100, r.threat + 30),
            )
            involvesPlayer && r.involves(target) -> r.copy(
                treaties = r.treaties + Treaty(treatyType, if (treatyType == TreatyType.WAR_FORMAL) state.turn + 1 else state.turn, -1),
                relation = when {
                    !isWar -> min(100, r.relation + 10)
                    treatyType == TreatyType.WAR_SURPRISE -> -100
                    else -> max(-100, r.relation - 40)
                },
                trust = if (isWar) 0 else min(100, r.trust + 5),
                threat = if (isWar) min(100, r.threat + 30) else r.threat,
                lastProposalTurn = if (isWar) r.lastProposalTurn else state.turn,
            )
            else -> r
        }
    }
    return TreatyResult(state.copy(relations = relations), true)
}

fun declareWar(state: GameState, target: FactionId, surprise: Boolean, rng: GameRandom): GameState =
    proposeTreaty(state, target, if (surprise) TreatyType.WAR_SURPRISE else TreatyType.WAR_FORMAL, rng).state

fun breakTreaty(state: GameState, target: FactionId, treatyType: TreatyType): GameState {
    val rel = state.relation(state.playerFactionId, target) ?: return state
    val broken = rel.copy(
        treaties = rel.treaties.filter { it.type != treatyType },
        relation = rel.relation - 30,
        trust = max(0, rel.trust - 20),
    )
    return state.copy(relations = state.relations.map { if (it === rel) broken else it })
}

/** Formal wars whose start turn has arrived poison the relation every turn they last. */
internal fun activatePendingWars(state: GameState): GameState = state.copy(
    relations = state.relations.map { rel ->
        if (rel.treaties.none { it.type == TreatyType.WAR_FORMAL && it.startTurn <= state.turn }) {
            rel
        } else {
            rel.copy(relation = -90, trust = 0, threat = min(100, rel.threat + 30))
        }
    },
)

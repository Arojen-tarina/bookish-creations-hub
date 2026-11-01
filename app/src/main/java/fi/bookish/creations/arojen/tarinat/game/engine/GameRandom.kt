package fi.bookish.creations.arojen.tarinat.game.engine

import kotlin.math.floor
import kotlin.random.Random

/**
 * Source of randomness for the rules. Every rule consumes values in the same
 * order as the original TypeScript (Math.random), which lets tests replay a
 * game turn-for-turn against the original engine with a shared seed.
 */
fun interface GameRandom {
    /** Uniform value in [0, 1). */
    fun nextDouble(): Double

    companion object {
        val System: GameRandom = GameRandom { Random.Default.nextDouble() }
    }
}

/** Six-sided die: 1..6. */
internal fun GameRandom.d6(): Int = floor(nextDouble() * 6).toInt() + 1

/** Fisher-Yates from the end, identical to the original shuffleDeck. */
internal fun <T> GameRandom.shuffled(list: List<T>): List<T> {
    val a = list.toMutableList()
    for (i in a.lastIndex downTo 1) {
        val j = floor(nextDouble() * (i + 1)).toInt()
        val tmp = a[i]
        a[i] = a[j]
        a[j] = tmp
    }
    return a
}

/** Small, fast, seedable PRNG (mulberry32) for deterministic replays and tests. */
class Mulberry32(seed: Int) : GameRandom {
    private var state = seed

    override fun nextDouble(): Double {
        state += 0x6D2B79F5
        var t = state
        t = (t xor (t ushr 15)) * (1 or t)
        t = (t + ((t xor (t ushr 7)) * (61 or t))) xor t
        return ((t xor (t ushr 14)).toLong() and 0xFFFFFFFFL).toDouble() / 4294967296.0
    }
}

/** JavaScript Math.round semantics (halves round towards +infinity). */
internal fun Double.roundJs(): Int = floor(this + 0.5).toInt()

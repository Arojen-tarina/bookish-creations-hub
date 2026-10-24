package fi.bookish.creations.arojen.tarinat.ui.game.map

import androidx.compose.ui.geometry.Offset
import fi.bookish.creations.arojen.tarinat.game.model.Army
import fi.bookish.creations.arojen.tarinat.game.model.FactionId
import fi.bookish.creations.arojen.tarinat.game.model.Province
import kotlin.math.cos
import kotlin.math.sin

/** Sizes in board units, matching the original board (SCALE_FACTOR = 1.15). */
internal object MapMetrics {
    const val S = 1.15f
    const val TOKEN_RADIUS = 1.45f * S

    fun tokenRadius(p: Province) = TOKEN_RADIUS + if (p.isCapital) 0.5f * S else 0f

    /** Tap radius around a province centre (about half the grid spacing). */
    const val PROVINCE_HIT_RADIUS = 3.6f
}

internal enum class BadgeKind { LEADER, CAVALRY, INFANTRY }
internal enum class MoveState { FULL, PARTIAL, NONE }

/** One army stack marker beside a province token: the player's top-right, everyone else's bottom-left. */
internal class ArmyBadge(
    val provinceId: String,
    val armies: List<Army>,
    val isPlayer: Boolean,
    /** Board-space centre of the sprite. */
    val center: Offset,
    val kind: BadgeKind,
    val spriteWidth: Float,
    val spriteHeight: Float,
) {
    val owner: FactionId get() = armies.first().ownerId
    val cavalry = armies.sumOf { it.cavalry }
    val infantry = armies.sumOf { it.infantry }
    val hasChief = armies.any { it.isChief }
    val moveState: MoveState = when (armies.count { it.movementLeft <= 0 }) {
        0 -> MoveState.FULL
        armies.size -> MoveState.NONE
        else -> MoveState.PARTIAL
    }
    val hitRadius: Float get() = maxOf(spriteWidth, spriteHeight) * 0.65f
}

internal fun buildArmyBadges(armies: List<Army>, provincesById: Map<String, Province>, player: FactionId): List<ArmyBadge> {
    val byProvince = LinkedHashMap<String, MutableList<Army>>()
    for (a in armies) byProvince.getOrPut(a.provinceId) { mutableListOf() }.add(a)

    val badges = mutableListOf<ArmyBadge>()
    for ((provinceId, list) in byProvince) {
        val province = provincesById[provinceId] ?: continue
        val r = MapMetrics.TOKEN_RADIUS + if (province.isCapital) 0.5f else 0f
        fun add(group: List<Army>, isPlayer: Boolean, angleDeg: Float) {
            if (group.isEmpty()) return
            val cav = group.sumOf { it.cavalry }
            val inf = group.sumOf { it.infantry }
            val kind = when {
                group.any { it.isChief } -> BadgeKind.LEADER
                cav >= inf && cav > 0 -> BadgeKind.CAVALRY
                else -> BadgeKind.INFANTRY
            }
            val w = (if (kind == BadgeKind.LEADER) 3.6f else 5.4f) * MapMetrics.S
            val h = (if (kind == BadgeKind.LEADER) 3.3f else 3.9f) * MapMetrics.S
            val rad = Math.toRadians(angleDeg.toDouble())
            val dist = r + h * 0.5f + 0.2f * MapMetrics.S
            val c = Offset(province.center.x.toFloat() + cos(rad).toFloat() * dist, province.center.y.toFloat() + sin(rad).toFloat() * dist)
            badges += ArmyBadge(provinceId, group, isPlayer, c, kind, w, h)
        }
        add(list.filter { it.ownerId == player }, isPlayer = true, angleDeg = 315f)
        add(list.filter { it.ownerId != player }, isPlayer = false, angleDeg = 135f)
    }
    return badges
}

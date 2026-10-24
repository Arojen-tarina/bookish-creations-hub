package fi.bookish.creations.arojen.tarinat.ui.icons

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.graphics.vector.PathBuilder
import androidx.compose.ui.graphics.vector.path
import androidx.compose.ui.unit.dp

/**
 * The game's own line icons (24 x 24 grid, 2 px round strokes). Drawn as vectors
 * so they stay crisp and consistent on every device; tint them via Icon(tint = ...).
 */
object GameIcons {

    private fun icon(name: String, autoMirror: Boolean = false, block: ImageVector.Builder.() -> Unit): ImageVector =
        ImageVector.Builder(name, 24.dp, 24.dp, 24f, 24f, autoMirror = autoMirror).apply(block).build()

    private fun ImageVector.Builder.stroke(width: Float = 2f, block: PathBuilder.() -> Unit) =
        path(
            stroke = SolidColor(Color.Black),
            strokeLineWidth = width,
            strokeLineCap = StrokeCap.Round,
            strokeLineJoin = StrokeJoin.Round,
            pathBuilder = block,
        )

    private fun ImageVector.Builder.fill(block: PathBuilder.() -> Unit) =
        path(fill = SolidColor(Color.Black), pathBuilder = block)

    private fun PathBuilder.circle(cx: Float, cy: Float, r: Float) {
        moveTo(cx - r, cy)
        arcTo(r, r, 0f, isMoreThanHalf = true, isPositiveArc = true, x1 = cx + r, y1 = cy)
        arcTo(r, r, 0f, isMoreThanHalf = true, isPositiveArc = true, x1 = cx - r, y1 = cy)
        close()
    }

    // ---------- map controls & navigation ----------

    val ZoomIn: ImageVector by lazy {
        icon("ZoomIn") { stroke { moveTo(12f, 5f); lineTo(12f, 19f); moveTo(5f, 12f); lineTo(19f, 12f) } }
    }

    val ZoomOut: ImageVector by lazy { icon("ZoomOut") { stroke { moveTo(5f, 12f); lineTo(19f, 12f) } } }

    /** Four corner brackets: show the whole map. */
    val FitMap: ImageVector by lazy {
        icon("FitMap") {
            stroke {
                moveTo(4f, 9f); lineTo(4f, 4f); lineTo(9f, 4f)
                moveTo(15f, 4f); lineTo(20f, 4f); lineTo(20f, 9f)
                moveTo(20f, 15f); lineTo(20f, 20f); lineTo(15f, 20f)
                moveTo(9f, 20f); lineTo(4f, 20f); lineTo(4f, 15f)
            }
        }
    }

    val Back: ImageVector by lazy {
        icon("Back", autoMirror = true) { stroke { moveTo(19f, 12f); lineTo(5f, 12f); moveTo(11f, 6f); lineTo(5f, 12f); lineTo(11f, 18f) } }
    }

    val Close: ImageVector by lazy {
        icon("Close") { stroke { moveTo(6f, 6f); lineTo(18f, 18f); moveTo(18f, 6f); lineTo(6f, 18f) } }
    }

    val Menu: ImageVector by lazy {
        icon("Menu") { stroke { moveTo(4f, 7f); lineTo(20f, 7f); moveTo(4f, 12f); lineTo(20f, 12f); moveTo(4f, 17f); lineTo(20f, 17f) } }
    }

    val Check: ImageVector by lazy { icon("Check") { stroke { moveTo(5f, 12.5f); lineTo(10f, 17.5f); lineTo(19f, 7f) } } }

    val Lock: ImageVector by lazy {
        icon("Lock") {
            stroke {
                moveTo(5f, 11f); lineTo(19f, 11f); lineTo(19f, 20.5f); lineTo(5f, 20.5f); close()
                moveTo(8f, 11f); lineTo(8f, 7.5f); curveTo(8f, 2.5f, 16f, 2.5f, 16f, 7.5f); lineTo(16f, 11f)
                moveTo(12f, 15f); lineTo(12f, 17f)
            }
        }
    }

    val Trash: ImageVector by lazy {
        icon("Trash") {
            stroke {
                moveTo(4f, 7f); lineTo(20f, 7f)
                moveTo(9f, 7f); lineTo(9.5f, 4f); lineTo(14.5f, 4f); lineTo(15f, 7f)
                moveTo(6f, 7f); lineTo(7f, 20f); lineTo(17f, 20f); lineTo(18f, 7f)
                moveTo(10f, 11f); lineTo(10f, 16.5f); moveTo(14f, 11f); lineTo(14f, 16.5f)
            }
        }
    }

    /** Save: an arrow dropping into a chest. */
    val Save: ImageVector by lazy {
        icon("Save") {
            stroke {
                moveTo(12f, 3f); lineTo(12f, 13f); moveTo(8f, 9.5f); lineTo(12f, 13.5f); lineTo(16f, 9.5f)
                moveTo(4f, 14f); lineTo(4f, 20f); lineTo(20f, 20f); lineTo(20f, 14f)
                moveTo(4f, 14f); lineTo(8.5f, 14f); moveTo(15.5f, 14f); lineTo(20f, 14f)
            }
        }
    }

    /** Load: an arrow rising out of a chest. */
    val Load: ImageVector by lazy {
        icon("Load") {
            stroke {
                moveTo(12f, 14f); lineTo(12f, 3.5f); moveTo(8f, 7.5f); lineTo(12f, 3.5f); lineTo(16f, 7.5f)
                moveTo(4f, 14f); lineTo(4f, 20f); lineTo(20f, 20f); lineTo(20f, 14f)
                moveTo(4f, 14f); lineTo(8.5f, 14f); moveTo(15.5f, 14f); lineTo(20f, 14f)
            }
        }
    }

    /** Hourglass: end the turn. */
    val EndTurn: ImageVector by lazy {
        icon("EndTurn") {
            stroke {
                moveTo(6f, 3f); lineTo(18f, 3f)
                moveTo(6f, 21f); lineTo(18f, 21f)
                moveTo(7f, 3f); curveTo(7f, 8f, 12f, 10f, 12f, 12f); curveTo(12f, 14f, 7f, 16f, 7f, 21f)
                moveTo(17f, 3f); curveTo(17f, 8f, 12f, 10f, 12f, 12f); curveTo(12f, 14f, 17f, 16f, 17f, 21f)
            }
        }
    }

    // ---------- resources ----------

    /** Manpower: two figures. */
    val People: ImageVector by lazy {
        icon("People") {
            stroke {
                circle(9f, 8f, 3.2f)
                moveTo(3f, 20f); curveTo(3f, 15.5f, 6f, 13.5f, 9f, 13.5f); curveTo(12f, 13.5f, 15f, 15.5f, 15f, 20f)
                moveTo(16f, 5.2f); curveTo(18f, 5.4f, 19.2f, 7f, 19f, 8.8f); curveTo(18.8f, 10.4f, 17.6f, 11.4f, 16.2f, 11.5f)
                moveTo(17.5f, 14f); curveTo(19.8f, 14.6f, 21f, 16.6f, 21f, 20f)
            }
        }
    }

    /** Artisans: hammer. */
    val Hammer: ImageVector by lazy {
        icon("Hammer") {
            stroke {
                moveTo(13f, 11f); lineTo(5f, 19f)
                moveTo(10f, 5f); lineTo(15f, 4f); lineTo(20f, 9f); lineTo(16f, 13f); lineTo(11f, 8f); close()
            }
        }
    }

    /** Influence: wax seal on a ribbon. */
    val Seal: ImageVector by lazy {
        icon("Seal") {
            stroke {
                circle(12f, 9f, 5.5f)
                moveTo(9f, 13.8f); lineTo(7.5f, 21f); lineTo(10.5f, 19.5f); lineTo(12f, 21.5f)
                moveTo(15f, 13.8f); lineTo(16.5f, 21f); lineTo(13.5f, 19.5f); lineTo(12f, 21.5f)
            }
            fill { circle(12f, 9f, 2.2f) }
        }
    }

    /** Prestige and wonders: a temple. */
    val Temple: ImageVector by lazy {
        icon("Temple") {
            stroke {
                moveTo(3f, 9f); lineTo(12f, 3.5f); lineTo(21f, 9f); close()
                moveTo(6f, 11f); lineTo(6f, 18f)
                moveTo(10f, 11f); lineTo(10f, 18f)
                moveTo(14f, 11f); lineTo(14f, 18f)
                moveTo(18f, 11f); lineTo(18f, 18f)
                moveTo(3f, 20.5f); lineTo(21f, 20.5f)
            }
        }
    }

    // ---------- panels ----------

    val Crown: ImageVector by lazy {
        icon("Crown") {
            stroke {
                moveTo(3f, 7f); lineTo(7.5f, 12f); lineTo(12f, 5f); lineTo(16.5f, 12f); lineTo(21f, 7f)
                lineTo(19f, 18f); lineTo(5f, 18f); close()
                moveTo(5f, 21f); lineTo(19f, 21f)
            }
        }
    }

    /** Realm status and victory goals. */
    val Trophy: ImageVector by lazy {
        icon("Trophy") {
            stroke {
                moveTo(7f, 4f); lineTo(17f, 4f); lineTo(17f, 10f)
                curveTo(17f, 13f, 14.8f, 15f, 12f, 15f); curveTo(9.2f, 15f, 7f, 13f, 7f, 10f); close()
                moveTo(7f, 6f); curveTo(4f, 6f, 3.5f, 9.5f, 7.2f, 11f)
                moveTo(17f, 6f); curveTo(20f, 6f, 20.5f, 9.5f, 16.8f, 11f)
                moveTo(12f, 15f); lineTo(12f, 18.5f)
                moveTo(8f, 20.5f); lineTo(16f, 20.5f)
            }
        }
    }

    /** Chronicle (turn log). */
    val Scroll: ImageVector by lazy {
        icon("Scroll") {
            stroke {
                moveTo(7f, 4f); lineTo(18f, 4f); curveTo(19.7f, 4f, 20f, 7f, 18f, 7f); lineTo(17f, 7f)
                moveTo(7f, 4f); curveTo(5f, 4f, 5f, 7f, 7f, 7f); lineTo(7f, 18f)
                curveTo(7f, 20f, 9f, 20.5f, 10f, 20f); lineTo(17f, 20f); lineTo(17f, 7f)
                moveTo(10f, 10f); lineTo(14f, 10f)
                moveTo(10f, 13.5f); lineTo(14f, 13.5f)
            }
        }
    }

    /** Diplomacy: balance scales. */
    val Scales: ImageVector by lazy {
        icon("Scales") {
            stroke {
                moveTo(12f, 3f); lineTo(12f, 20f)
                moveTo(8f, 20.5f); lineTo(16f, 20.5f)
                moveTo(4.5f, 6.5f); lineTo(19.5f, 6.5f)
                moveTo(4.5f, 6.5f); lineTo(2f, 13f); curveTo(3f, 15f, 6f, 15f, 7f, 13f); close()
                moveTo(19.5f, 6.5f); lineTo(17f, 13f); curveTo(18f, 15f, 21f, 15f, 22f, 13f); close()
            }
        }
    }

    /** Province / map. */
    val MapPin: ImageVector by lazy {
        icon("MapPin") {
            stroke {
                moveTo(12f, 21f); curveTo(12f, 21f, 5f, 14f, 5f, 9.5f); curveTo(5f, 5.5f, 8.2f, 3f, 12f, 3f)
                curveTo(15.8f, 3f, 19f, 5.5f, 19f, 9.5f); curveTo(19f, 14f, 12f, 21f, 12f, 21f); close()
                circle(12f, 9.5f, 2.5f)
            }
        }
    }

    /** Card hand. */
    val Cards: ImageVector by lazy {
        icon("Cards") {
            stroke {
                moveTo(4f, 7.5f); lineTo(11.5f, 5.5f); lineTo(15f, 18.5f); lineTo(7.5f, 20.5f); close()
                moveTo(13f, 4.5f); lineTo(19f, 4.5f); lineTo(19f, 17f)
            }
        }
    }

    // ---------- military ----------

    val Swords: ImageVector by lazy {
        icon("Swords") {
            stroke {
                moveTo(4f, 4f); lineTo(15f, 15f); moveTo(13f, 17f); lineTo(17f, 13f); moveTo(16f, 16f); lineTo(20f, 20f)
                moveTo(20f, 4f); lineTo(9f, 15f); moveTo(11f, 17f); lineTo(7f, 13f); moveTo(8f, 16f); lineTo(4f, 20f)
            }
        }
    }

    val Shield: ImageVector by lazy {
        icon("Shield") {
            stroke {
                moveTo(12f, 3f); lineTo(19.5f, 6f); lineTo(19f, 12f)
                curveTo(18.5f, 16.5f, 15.5f, 19.5f, 12f, 21f)
                curveTo(8.5f, 19.5f, 5.5f, 16.5f, 5f, 12f); lineTo(4.5f, 6f); close()
            }
        }
    }

    /** Cavalry: horseshoe. */
    val Horseshoe: ImageVector by lazy {
        icon("Horseshoe") {
            stroke(2.4f) {
                moveTo(6.5f, 20f); lineTo(6f, 11f); curveTo(5.6f, 6f, 8.4f, 3.5f, 12f, 3.5f)
                curveTo(15.6f, 3.5f, 18.4f, 6f, 18f, 11f); lineTo(17.5f, 20f)
            }
            fill { circle(7.6f, 13.5f, 0.9f); circle(16.4f, 13.5f, 0.9f); circle(8.3f, 8f, 0.9f); circle(15.7f, 8f, 0.9f) }
        }
    }

    /** Infantry: a single sword. */
    val Sword: ImageVector by lazy {
        icon("Sword") {
            stroke {
                moveTo(19.5f, 4.5f); lineTo(9.5f, 14.5f)
                moveTo(19.5f, 4.5f); lineTo(19.5f, 8f); moveTo(19.5f, 4.5f); lineTo(16f, 4.5f)
                moveTo(6.5f, 11.5f); lineTo(12.5f, 17.5f)
                moveTo(9f, 15f); lineTo(4.5f, 19.5f)
            }
        }
    }

    /** Siege engines: a catapult. */
    val Catapult: ImageVector by lazy {
        icon("Catapult") {
            stroke {
                moveTo(3f, 17f); lineTo(21f, 17f)
                moveTo(9f, 17f); lineTo(16f, 6f)
                circle(17.5f, 4.8f, 1.6f)
                moveTo(12f, 17f); lineTo(14f, 11f)
            }
            stroke { circle(6.5f, 19f, 1.8f); circle(17.5f, 19f, 1.8f) }
        }
    }

    /** Movement points. */
    val Boot: ImageVector by lazy {
        icon("Boot") {
            stroke {
                moveTo(7f, 3.5f); lineTo(12f, 3.5f); lineTo(12f, 12f); lineTo(19f, 14.5f)
                curveTo(20.5f, 15f, 21f, 16.5f, 21f, 18f); lineTo(21f, 19.5f); lineTo(5f, 19.5f); lineTo(6f, 12f); close()
            }
        }
    }

    /** Flag. */
    val Flag: ImageVector by lazy {
        icon("Flag") {
            stroke {
                moveTo(5f, 21f); lineTo(5f, 4f)
                moveTo(5f, 4.5f); curveTo(9f, 2.5f, 12f, 6.5f, 19f, 4.5f); lineTo(19f, 13f)
                curveTo(12f, 15f, 9f, 11f, 5f, 13f)
            }
        }
    }

    /** Merge two stacks. */
    val Merge: ImageVector by lazy {
        icon("Merge") {
            stroke {
                moveTo(6f, 4f); lineTo(6f, 9f); curveTo(6f, 12f, 12f, 12f, 12f, 15f); lineTo(12f, 20f)
                moveTo(18f, 4f); lineTo(18f, 9f); curveTo(18f, 12f, 12f, 12f, 12f, 15f)
                moveTo(9f, 17f); lineTo(12f, 20f); lineTo(15f, 17f)
            }
        }
    }

    /** Repair walls. */
    val Wrench: ImageVector by lazy {
        icon("Wrench") {
            stroke {
                moveTo(14.5f, 6f); curveTo(13.2f, 8.5f, 14f, 10.5f, 15.5f, 11f); lineTo(5f, 21f); lineTo(3f, 19f); lineTo(13f, 8.5f)
                moveTo(14.5f, 6f); curveTo(15.5f, 3.5f, 18.5f, 2.5f, 21f, 4f); lineTo(18f, 7f); lineTo(19f, 9f); lineTo(21f, 9.5f)
                curveTo(21.5f, 12f, 18.5f, 13.5f, 15.5f, 11f)
            }
        }
    }

    // ---------- buildings ----------

    val Tent: ImageVector by lazy {
        icon("Tent") {
            stroke {
                moveTo(2.5f, 20f); lineTo(12f, 4f); lineTo(21.5f, 20f); close()
                moveTo(12f, 20f); lineTo(9f, 14f); moveTo(12f, 20f); lineTo(15f, 14f)
                moveTo(12f, 4f); lineTo(12f, 1.8f)
            }
        }
    }

    val Market: ImageVector by lazy {
        icon("Market") {
            stroke {
                moveTo(3f, 9f); lineTo(5f, 4f); lineTo(19f, 4f); lineTo(21f, 9f)
                curveTo(21f, 11f, 17.5f, 11f, 17.5f, 9f); curveTo(17.5f, 11f, 14f, 11f, 14f, 9f)
                curveTo(14f, 11f, 10f, 11f, 10f, 9f); curveTo(10f, 11f, 6.5f, 11f, 6.5f, 9f)
                curveTo(6.5f, 11f, 3f, 11f, 3f, 9f)
                moveTo(5f, 11f); lineTo(5f, 20f); lineTo(19f, 20f); lineTo(19f, 11f)
                moveTo(10f, 20f); lineTo(10f, 15f); lineTo(14f, 15f); lineTo(14f, 20f)
            }
        }
    }

    val Castle: ImageVector by lazy {
        icon("Castle") {
            stroke {
                moveTo(4f, 20f); lineTo(4f, 6f); lineTo(7f, 6f); lineTo(7f, 8.5f); lineTo(10f, 8.5f); lineTo(10f, 6f)
                lineTo(14f, 6f); lineTo(14f, 8.5f); lineTo(17f, 8.5f); lineTo(17f, 6f); lineTo(20f, 6f); lineTo(20f, 20f); close()
                moveTo(10f, 20f); lineTo(10f, 15f); curveTo(10f, 13f, 14f, 13f, 14f, 15f); lineTo(14f, 20f)
            }
        }
    }

    val Anvil: ImageVector by lazy {
        icon("Anvil") {
            stroke {
                moveTo(3f, 7f); lineTo(19f, 7f); curveTo(21f, 7f, 21f, 10f, 19f, 10f); lineTo(15f, 10f)
                curveTo(15f, 13f, 16f, 14f, 17f, 15f); lineTo(7f, 15f); curveTo(8f, 14f, 9f, 13f, 9f, 10f)
                curveTo(5f, 10f, 3f, 9f, 3f, 7f); close()
                moveTo(6f, 19.5f); lineTo(18f, 19.5f); moveTo(9f, 15f); lineTo(8f, 19.5f); moveTo(15f, 15f); lineTo(16f, 19.5f)
            }
        }
    }

    val Bridge: ImageVector by lazy {
        icon("Bridge") {
            stroke {
                moveTo(2f, 10f); lineTo(22f, 10f)
                moveTo(2f, 18f); lineTo(2f, 10f); moveTo(22f, 18f); lineTo(22f, 10f)
                moveTo(5f, 18f); curveTo(5f, 13f, 10f, 13f, 10f, 18f)
                moveTo(14f, 18f); curveTo(14f, 13f, 19f, 13f, 19f, 18f)
                moveTo(2f, 6.5f); lineTo(22f, 6.5f)
            }
        }
    }

    // ---------- books ----------

    val Search: ImageVector by lazy {
        icon("Search") { stroke { circle(10.5f, 10.5f, 6f); moveTo(15f, 15f); lineTo(20f, 20f) } }
    }

    /** Quill feather: the world chronicle. */
    val Feather: ImageVector by lazy {
        icon("Feather") {
            stroke {
                moveTo(20f, 4f); curveTo(13f, 4f, 7f, 9f, 6.5f, 16f); lineTo(8f, 17.5f)
                curveTo(15f, 17f, 20f, 11f, 20f, 4f); close()
                moveTo(4f, 20f); lineTo(15f, 9f)
                moveTo(9.5f, 14.5f); lineTo(14.5f, 14.5f)
            }
        }
    }

    /** Animal track, for the sacred animals of the pantheon. */
    val Paw: ImageVector by lazy {
        icon("Paw") {
            fill {
                moveTo(12f, 12f)
                curveTo(9f, 12f, 6.5f, 15.5f, 6.5f, 17.5f)
                curveTo(6.5f, 19.5f, 8.5f, 20.5f, 10f, 20f)
                curveTo(11f, 19.7f, 13f, 19.7f, 14f, 20f)
                curveTo(15.5f, 20.5f, 17.5f, 19.5f, 17.5f, 17.5f)
                curveTo(17.5f, 15.5f, 15f, 12f, 12f, 12f)
                close()
                circle(4.8f, 10.5f, 2f)
                circle(9f, 6.3f, 2.2f)
                circle(15f, 6.3f, 2.2f)
                circle(19.2f, 10.5f, 2f)
            }
        }
    }

    val Mountain: ImageVector by lazy {
        icon("Mountain") {
            stroke {
                moveTo(2f, 20f); lineTo(9f, 7f); lineTo(13f, 14f); lineTo(16f, 10f); lineTo(22f, 20f); close()
                moveTo(6.9f, 11f); lineTo(8.3f, 12f); lineTo(9.4f, 10.8f); lineTo(10.9f, 12f)
            }
        }
    }

    val Leaf: ImageVector by lazy {
        icon("Leaf") {
            stroke {
                moveTo(5f, 19f); curveTo(5f, 10f, 10f, 5f, 20f, 4f); curveTo(19f, 14f, 14f, 19f, 5f, 19f); close()
                moveTo(5f, 19f); lineTo(14f, 10f)
            }
        }
    }

    val Compass: ImageVector by lazy {
        icon("Compass") {
            stroke { circle(12f, 12f, 9f) }
            fill { moveTo(15.8f, 8.2f); lineTo(13.4f, 13.4f); lineTo(8.2f, 15.8f); lineTo(10.6f, 10.6f); close() }
        }
    }

    // ---------- moose guide ----------

    /** Front view of a moose head with palmate antlers: the in-game guide. */
    val Moose: ImageVector by lazy {
        icon("Moose") {
            stroke(width = 1.6f) {
                // antlers
                moveTo(9.6f, 8.6f); curveTo(7f, 8.6f, 4f, 7.6f, 2.5f, 4.6f)
                lineTo(4f, 5.2f); lineTo(4.3f, 3f); lineTo(5.7f, 5.1f); lineTo(6.4f, 2.9f); lineTo(7.5f, 5.3f); lineTo(8.6f, 3.6f)
                curveTo(9.2f, 5.4f, 9.7f, 7f, 9.6f, 8.6f)
                moveTo(14.4f, 8.6f); curveTo(17f, 8.6f, 20f, 7.6f, 21.5f, 4.6f)
                lineTo(20f, 5.2f); lineTo(19.7f, 3f); lineTo(18.3f, 5.1f); lineTo(17.6f, 2.9f); lineTo(16.5f, 5.3f); lineTo(15.4f, 3.6f)
                curveTo(14.8f, 5.4f, 14.3f, 7f, 14.4f, 8.6f)
                // head and long muzzle
                moveTo(9.6f, 8.6f); curveTo(10.5f, 7.8f, 13.5f, 7.8f, 14.4f, 8.6f)
                lineTo(15f, 13f); curveTo(15.6f, 15f, 15.6f, 18f, 14.6f, 19.6f)
                curveTo(13.6f, 21.2f, 10.4f, 21.2f, 9.4f, 19.6f)
                curveTo(8.4f, 18f, 8.4f, 15f, 9f, 13f); close()
                // ears
                moveTo(9.3f, 10.2f); lineTo(6.4f, 11.2f); curveTo(7.1f, 12.4f, 8.4f, 12.5f, 9.1f, 11.8f)
                moveTo(14.7f, 10.2f); lineTo(17.6f, 11.2f); curveTo(16.9f, 12.4f, 15.6f, 12.5f, 14.9f, 11.8f)
            }
            fill {
                circle(10.7f, 12.4f, 0.8f)
                circle(13.3f, 12.4f, 0.8f)
                circle(11f, 18.4f, 0.6f)
                circle(13f, 18.4f, 0.6f)
            }
        }
    }

    /** Paper plane. */
    val Send: ImageVector by lazy {
        icon("Send", autoMirror = true) {
            stroke {
                moveTo(4f, 11.5f); lineTo(20f, 4f); lineTo(14.5f, 20f); lineTo(11f, 13f); close()
                moveTo(11f, 13f); lineTo(20f, 4f)
            }
        }
    }

    /** Treasure chest: the Silk Road tribute. */
    val Chest: ImageVector by lazy {
        icon("Chest") {
            stroke {
                moveTo(3.5f, 11f); lineTo(20.5f, 11f); lineTo(20.5f, 19.5f); lineTo(3.5f, 19.5f); close()
                moveTo(3.5f, 11f); curveTo(3.5f, 4.5f, 20.5f, 4.5f, 20.5f, 11f)
                moveTo(8f, 6.2f); lineTo(8f, 19.5f)
                moveTo(16f, 6.2f); lineTo(16f, 19.5f)
            }
            fill {
                moveTo(10.5f, 10f); lineTo(13.5f, 10f); lineTo(13.5f, 14f); lineTo(10.5f, 14f); close()
            }
        }
    }

    /** A circle turning back on itself, around a play mark: replay the lost turn (second chance). */
    val Rewind: ImageVector by lazy {
        icon("Rewind") {
            stroke {
                moveTo(4.5f, 12f)
                arcTo(7.5f, 7.5f, 0f, isMoreThanHalf = true, isPositiveArc = false, x1 = 6.7f, y1 = 6.7f)
                moveTo(6.7f, 6.7f); lineTo(6.7f, 2.7f)
                moveTo(6.7f, 6.7f); lineTo(10.7f, 6.7f)
            }
            fill {
                moveTo(10.5f, 9f); lineTo(15f, 12f); lineTo(10.5f, 15f); close()
            }
        }
    }

    // ---------- sound ----------

    private fun PathBuilder.speaker() {
        moveTo(3.5f, 9.5f); lineTo(7.5f, 9.5f); lineTo(12.5f, 5f); lineTo(12.5f, 19f); lineTo(7.5f, 14.5f); lineTo(3.5f, 14.5f); close()
    }

    /** Speaker with sound waves: music on. */
    val SoundOn: ImageVector by lazy {
        icon("SoundOn") {
            stroke {
                speaker()
                moveTo(15.8f, 9.2f); curveTo(17.3f, 10.7f, 17.3f, 13.3f, 15.8f, 14.8f)
                moveTo(18.4f, 6.6f); curveTo(21.5f, 9.7f, 21.5f, 14.3f, 18.4f, 17.4f)
            }
        }
    }

    /** Speaker with a cross: music off. */
    val SoundOff: ImageVector by lazy {
        icon("SoundOff") {
            stroke {
                speaker()
                moveTo(16f, 9.5f); lineTo(21f, 14.5f)
                moveTo(21f, 9.5f); lineTo(16f, 14.5f)
            }
        }
    }

    /** Two beamed notes: the music settings. */
    val Music: ImageVector by lazy {
        icon("Music") {
            stroke { moveTo(9f, 17.5f); lineTo(9f, 6f); lineTo(19f, 4f); lineTo(19f, 15.5f); moveTo(9f, 9.5f); lineTo(19f, 7.5f) }
            fill { circle(6.8f, 17.5f, 2.3f); circle(16.8f, 15.5f, 2.3f) }
        }
    }
}

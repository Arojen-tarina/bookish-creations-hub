package fi.bookish.creations.arojen.tarinat.ui.components

/** Wraps [text] in a left-to-right isolate so "+12" never flips to "12+" inside Arabic or Urdu text. */
fun ltr(text: String): String = "\u2066$text\u2069"

/** A signed number ("+3", "-2") that keeps its sign on the left in every language. */
fun signed(value: Int, plusZero: Boolean = false): String =
    ltr(if (value > 0 || (plusZero && value == 0)) "+$value" else value.toString())

/** "+" followed by an already formatted number, kept left-to-right. */
fun plus(formatted: String): String = ltr("+$formatted")

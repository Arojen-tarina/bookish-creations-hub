package fi.bookish.creations.arojen.tarinat.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDirection
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.sp
import fi.bookish.creations.arojen.tarinat.R

/**
 * Cinzel covers Latin script only. Headings in other scripts (Cyrillic, Arabic,
 * CJK, Devanagari, Bengali) fall back to the system font automatically, so body
 * text deliberately stays on the system font for all 14 supported languages.
 */
val Cinzel = FontFamily(
    Font(R.font.cinzel_semibold, FontWeight.SemiBold),
    Font(R.font.cinzel_extrabold, FontWeight.ExtraBold),
)

/**
 * Every style lets the text's own content pick its direction, so an English or
 * numeric string inside an Arabic/Urdu layout still reads left to right.
 */
private fun style(
    fontFamily: FontFamily? = null,
    fontWeight: FontWeight,
    fontSize: TextUnit,
    lineHeight: TextUnit,
    letterSpacing: TextUnit = TextUnit.Unspecified,
) = TextStyle(
    fontFamily = fontFamily,
    fontWeight = fontWeight,
    fontSize = fontSize,
    lineHeight = lineHeight,
    letterSpacing = letterSpacing,
    textDirection = TextDirection.Content,
)

val Typography = Typography(
    displayLarge = style(fontFamily = Cinzel, fontWeight = FontWeight.ExtraBold, fontSize = 44.sp, lineHeight = 50.sp, letterSpacing = 1.5.sp),
    displayMedium = style(fontFamily = Cinzel, fontWeight = FontWeight.ExtraBold, fontSize = 34.sp, lineHeight = 40.sp, letterSpacing = 1.sp),
    headlineLarge = style(fontFamily = Cinzel, fontWeight = FontWeight.ExtraBold, fontSize = 28.sp, lineHeight = 34.sp, letterSpacing = 0.5.sp),
    headlineMedium = style(fontFamily = Cinzel, fontWeight = FontWeight.SemiBold, fontSize = 22.sp, lineHeight = 28.sp, letterSpacing = 0.5.sp),
    headlineSmall = style(fontFamily = Cinzel, fontWeight = FontWeight.SemiBold, fontSize = 18.sp, lineHeight = 24.sp, letterSpacing = 0.5.sp),
    titleLarge = style(fontWeight = FontWeight.Bold, fontSize = 18.sp, lineHeight = 24.sp),
    titleMedium = style(fontWeight = FontWeight.SemiBold, fontSize = 15.sp, lineHeight = 20.sp),
    titleSmall = style(fontWeight = FontWeight.SemiBold, fontSize = 13.sp, lineHeight = 18.sp),
    bodyLarge = style(fontWeight = FontWeight.Normal, fontSize = 15.sp, lineHeight = 22.sp),
    bodyMedium = style(fontWeight = FontWeight.Normal, fontSize = 13.sp, lineHeight = 19.sp),
    bodySmall = style(fontWeight = FontWeight.Normal, fontSize = 12.sp, lineHeight = 16.sp),
    labelLarge = style(fontWeight = FontWeight.Bold, fontSize = 14.sp, lineHeight = 18.sp, letterSpacing = 0.5.sp),
    labelMedium = style(fontWeight = FontWeight.SemiBold, fontSize = 12.sp, lineHeight = 16.sp, letterSpacing = 0.4.sp),
    labelSmall = style(fontWeight = FontWeight.SemiBold, fontSize = 10.sp, lineHeight = 14.sp, letterSpacing = 0.4.sp),
)

package fi.bookish.creations.arojen.tarinat.ui.components

/** Languages the generated texts under assets/i18n exist in. */
private val ASSET_LANGUAGES = setOf("fi", "en", "zh", "hi", "es", "ar", "fr", "bn", "pt", "ru", "ur", "id", "de", "ja")

/** Asset folder language for a locale language code; English when the game has no translation. */
fun assetLanguage(language: String): String {
    // Android still reports Indonesian with the legacy "in" code on some versions.
    val lang = if (language == "in") "id" else language
    return if (lang in ASSET_LANGUAGES) lang else "en"
}

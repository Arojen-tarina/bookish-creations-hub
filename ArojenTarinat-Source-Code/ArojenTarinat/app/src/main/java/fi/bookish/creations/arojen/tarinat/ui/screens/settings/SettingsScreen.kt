package fi.bookish.creations.arojen.tarinat.ui.screens.settings

import androidx.activity.compose.LocalActivity
import androidx.appcompat.app.AppCompatDelegate
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.dp
import androidx.core.os.LocaleListCompat
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import fi.bookish.creations.arojen.tarinat.BuildConfig
import fi.bookish.creations.arojen.tarinat.R
import fi.bookish.creations.arojen.tarinat.ads.Ads
import fi.bookish.creations.arojen.tarinat.analytics.Analytics
import fi.bookish.creations.arojen.tarinat.analytics.Events
import fi.bookish.creations.arojen.tarinat.audio.GameMusic
import fi.bookish.creations.arojen.tarinat.data.AnalyticsConsent
import fi.bookish.creations.arojen.tarinat.data.SettingsRepository
import fi.bookish.creations.arojen.tarinat.ui.components.BoardBackdrop
import fi.bookish.creations.arojen.tarinat.ui.components.GameButton
import fi.bookish.creations.arojen.tarinat.ui.components.GameButtonStyle
import fi.bookish.creations.arojen.tarinat.ui.components.RoundIconButton
import fi.bookish.creations.arojen.tarinat.ui.components.ltr
import fi.bookish.creations.arojen.tarinat.ui.game.hud.GamePanel
import fi.bookish.creations.arojen.tarinat.ui.game.hud.SectionTitle
import fi.bookish.creations.arojen.tarinat.ui.icons.GameIcons
import fi.bookish.creations.arojen.tarinat.ui.theme.Gold
import fi.bookish.creations.arojen.tarinat.ui.theme.GoldBright
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink500
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink700
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink900
import fi.bookish.creations.arojen.tarinat.ui.theme.TextHigh
import fi.bookish.creations.arojen.tarinat.ui.theme.TextLow
import fi.bookish.creations.arojen.tarinat.ui.theme.TextMid
import kotlinx.coroutines.launch

/** The 14 languages of the original game, each named in its own language. */
private val LANGUAGES = listOf(
    "fi" to "Suomi", "en" to "English", "zh" to "中文", "hi" to "हिन्दी", "es" to "Español",
    "ar" to "العربية", "fr" to "Français", "bn" to "বাংলা", "pt" to "Português", "ru" to "Русский",
    "ur" to "اردو", "id" to "Bahasa Indonesia", "de" to "Deutsch", "ja" to "日本語",
)

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun SettingsScreen(settingsRepo: SettingsRepository, music: GameMusic, ads: Ads, analytics: Analytics, onBack: () -> Unit) {
    val settings by settingsRepo.settings.collectAsStateWithLifecycle()
    val adPrivacyRequired by ads.privacyOptionsRequired.collectAsStateWithLifecycle()
    val activity = LocalActivity.current
    val scope = rememberCoroutineScope()
    // The app language Android currently applies; empty = follow the phone.
    val current = AppCompatDelegate.getApplicationLocales().takeIf { !it.isEmpty }?.get(0)?.language
        ?.let { if (it == "in") "id" else it }

    BoardBackdrop {
        Column(
            Modifier
                .fillMaxSize()
                .windowInsetsPadding(WindowInsets.safeDrawing)
                .padding(horizontal = 16.dp, vertical = 10.dp),
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                RoundIconButton(GameIcons.Back, stringResource(R.string.common_back), onBack, size = 40.dp)
                Spacer(Modifier.width(12.dp))
                Text(stringResource(R.string.settings_title), style = MaterialTheme.typography.headlineMedium, color = GoldBright)
            }
            Spacer(Modifier.height(10.dp))
            Row(Modifier.fillMaxSize(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                GamePanel(Modifier.weight(1.2f).fillMaxHeight()) {
                    Column(Modifier.verticalScroll(rememberScrollState()).padding(14.dp)) {
                        SectionTitle(stringResource(R.string.lang_switch), icon = GameIcons.Scroll)
                        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            LanguageChip(stringResource(R.string.settings_language_system), current == null) {
                                analytics.track(Events.settingsChanged("language", "system"))
                                AppCompatDelegate.setApplicationLocales(LocaleListCompat.getEmptyLocaleList())
                            }
                            for ((tag, label) in LANGUAGES) {
                                LanguageChip(label, current == tag) {
                                    analytics.track(Events.settingsChanged("language", tag))
                                    AppCompatDelegate.setApplicationLocales(LocaleListCompat.forLanguageTags(tag))
                                }
                            }
                        }
                    }
                }
                GamePanel(Modifier.weight(1f).fillMaxHeight()) {
                    Column(Modifier.verticalScroll(rememberScrollState()).padding(14.dp)) {
                        SectionTitle(stringResource(R.string.settings_sound), icon = GameIcons.Music)
                        // Local slider state so dragging is smooth and heard live; persisted when the finger lifts.
                        var volume by remember(settings.musicVolume) { mutableFloatStateOf(settings.musicVolume) }
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(stringResource(R.string.music_volume), style = MaterialTheme.typography.bodyMedium, color = TextHigh, modifier = Modifier.weight(1f))
                            Text(ltr("${(volume * 100).toInt()}%"), style = MaterialTheme.typography.labelLarge, color = TextMid)
                        }
                        Slider(
                            value = volume,
                            onValueChange = {
                                volume = it
                                music.previewVolume(it)
                            },
                            onValueChangeFinished = {
                                analytics.track(Events.settingsChanged("music_volume", (volume * 100).toInt().toString()))
                                scope.launch { settingsRepo.setMusicVolume(volume) }
                            },
                            enabled = !settings.musicMuted,
                            colors = SliderDefaults.colors(thumbColor = GoldBright, activeTrackColor = Gold, inactiveTrackColor = Ink500),
                        )
                        ToggleRow(stringResource(R.string.settings_mute), null, settings.musicMuted) {
                            analytics.track(Events.settingsChanged("music_muted", it.toString()))
                            scope.launch { settingsRepo.setMusicMuted(it) }
                        }

                        Spacer(Modifier.height(16.dp))
                        SectionTitle(stringResource(R.string.settings_privacy), icon = GameIcons.Shield)
                        ToggleRow(
                            stringResource(R.string.analytics_settings_title),
                            stringResource(R.string.analytics_settings_desc),
                            settings.analyticsConsent == AnalyticsConsent.GRANTED,
                        ) { on ->
                            // Counted while analytics is still on: switching it off sends nothing more.
                            analytics.track(Events.settingsChanged("analytics", if (on) "granted" else "denied"))
                            scope.launch { settingsRepo.setAnalyticsConsent(if (on) AnalyticsConsent.GRANTED else AnalyticsConsent.DENIED) }
                        }
                        // Google's consent choices for adverts, where the law asks for a way back to them (EEA, UK, some US states).
                        if (adPrivacyRequired && activity != null) {
                            GameButton(
                                stringResource(R.string.settings_ad_privacy),
                                { ads.showPrivacyOptions(activity) },
                                Modifier.fillMaxWidth().padding(top = 8.dp),
                                GameButtonStyle.Secondary,
                                compact = true,
                            )
                        }

                        Spacer(Modifier.height(16.dp))
                        SectionTitle(stringResource(R.string.settings_about), icon = GameIcons.Crown)
                        Text(stringResource(R.string.settings_credits), style = MaterialTheme.typography.bodySmall, color = TextMid)
                        Text(stringResource(R.string.settings_version, BuildConfig.VERSION_NAME), style = MaterialTheme.typography.labelSmall, color = TextLow, modifier = Modifier.padding(top = 4.dp))
                    }
                }
            }
        }
    }
}

@Composable
private fun LanguageChip(label: String, selected: Boolean, onClick: () -> Unit) {
    val shape = RoundedCornerShape(50)
    Row(
        Modifier
            .clip(shape)
            .background(if (selected) Gold else Ink700)
            .border(1.dp, if (selected) GoldBright else Gold.copy(alpha = 0.4f), shape)
            .clickable(role = Role.RadioButton, onClick = onClick)
            .padding(horizontal = 14.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        if (selected) {
            Icon(GameIcons.Check, null, tint = Ink900, modifier = Modifier.size(16.dp))
            Spacer(Modifier.width(6.dp))
        }
        Text(label, style = MaterialTheme.typography.labelLarge, color = if (selected) Ink900 else TextHigh)
    }
}

@Composable
private fun ToggleRow(title: String, description: String?, checked: Boolean, onChange: (Boolean) -> Unit) {
    Row(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(10.dp))
            .clickable(role = Role.Switch) { onChange(!checked) }
            .padding(vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(Modifier.weight(1f)) {
            Text(title, style = MaterialTheme.typography.bodyMedium, color = TextHigh)
            if (description != null) Text(description, style = MaterialTheme.typography.bodySmall, color = TextMid)
        }
        Spacer(Modifier.width(10.dp))
        Switch(
            checked = checked,
            onCheckedChange = onChange,
            colors = SwitchDefaults.colors(
                checkedThumbColor = Ink900,
                checkedTrackColor = Gold,
                uncheckedThumbColor = TextMid,
                uncheckedTrackColor = Ink700,
                uncheckedBorderColor = Ink500,
            ),
        )
    }
}

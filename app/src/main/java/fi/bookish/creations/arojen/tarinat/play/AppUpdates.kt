package fi.bookish.creations.arojen.tarinat.play

import android.app.Application
import android.content.Context
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.IntentSenderRequest
import androidx.core.content.edit
import com.google.android.play.core.appupdate.AppUpdateManagerFactory
import com.google.android.play.core.appupdate.AppUpdateOptions
import com.google.android.play.core.install.InstallStateUpdatedListener
import com.google.android.play.core.install.model.AppUpdateType
import com.google.android.play.core.install.model.InstallStatus
import com.google.android.play.core.install.model.UpdateAvailability
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Play in-app updates, the flexible kind: Play downloads the new version while
 * the player keeps playing, and the main menu offers a restart once it is in.
 * The offer comes at most every [OFFER_GAP_MS], so declining it is respected.
 * Only works for installs from Google Play; elsewhere every call quietly fails.
 */
class AppUpdates(app: Application, private val clock: () -> Long = System::currentTimeMillis) {
    private val manager = AppUpdateManagerFactory.create(app)
    private val prefs = app.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    private val _readyToInstall = MutableStateFlow(false)

    /** A downloaded update waits for a restart. */
    val readyToInstall: StateFlow<Boolean> = _readyToInstall.asStateFlow()

    private val listener = InstallStateUpdatedListener { state ->
        if (state.installStatus() == InstallStatus.DOWNLOADED) _readyToInstall.value = true
    }

    init {
        manager.registerListener(listener)
    }

    /** Call when the game comes to the front. */
    fun check(launcher: ActivityResultLauncher<IntentSenderRequest>) {
        manager.appUpdateInfo.addOnSuccessListener { info ->
            if (info.installStatus() == InstallStatus.DOWNLOADED) {
                _readyToInstall.value = true
                return@addOnSuccessListener
            }
            val now = clock()
            val offeredRecently = now - prefs.getLong(KEY_OFFERED_AT, 0L) < OFFER_GAP_MS
            if (info.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE &&
                info.isUpdateTypeAllowed(AppUpdateType.FLEXIBLE) &&
                !offeredRecently
            ) {
                prefs.edit { putLong(KEY_OFFERED_AT, now) }
                manager.startUpdateFlowForResult(info, launcher, AppUpdateOptions.defaultOptions(AppUpdateType.FLEXIBLE))
            }
        }
    }

    /** Restarts into the downloaded version. */
    fun installNow() {
        manager.completeUpdate()
    }

    private companion object {
        const val PREFS = "play"
        const val KEY_OFFERED_AT = "update_offered_at"
        const val OFFER_GAP_MS = 3 * 24 * 60 * 60 * 1000L
    }
}

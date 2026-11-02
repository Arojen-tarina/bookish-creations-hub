package fi.bookish.creations.arojen.tarinat.account

import android.app.Activity
import android.util.Base64
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialCancellationException
import androidx.credentials.exceptions.GetCredentialException
import androidx.credentials.exceptions.NoCredentialException
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import fi.bookish.creations.arojen.tarinat.BuildConfig
import fi.bookish.creations.arojen.tarinat.data.AchievementRepository
import fi.bookish.creations.arojen.tarinat.data.SaveRepository
import fi.bookish.creations.arojen.tarinat.game.achievements.ALL_ACHIEVEMENTS
import fi.bookish.creations.arojen.tarinat.game.achievements.PlayerStats
import fi.bookish.creations.arojen.tarinat.game.achievements.Progression
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.auth.SignOutScope
import io.github.jan.supabase.auth.auth
import io.github.jan.supabase.auth.providers.Google
import io.github.jan.supabase.auth.providers.builtin.Email
import io.github.jan.supabase.auth.providers.builtin.IDToken
import io.github.jan.supabase.postgrest.from
import io.github.jan.supabase.postgrest.postgrest
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.IOException
import java.security.MessageDigest
import java.util.UUID
import java.util.zip.GZIPInputStream
import java.util.zip.GZIPOutputStream

/** Who is signed in on this phone. A guest (anonymous account) has no [provider]. */
data class AccountState(
    val provider: String? = null,
    val email: String? = null,
    val lastBackupAt: Long = 0L,
    /**
     * The cloud copy exists but cannot be read (e.g. written by an incompatible version). It is left untouched:
     * no automatic or manual backup replaces it until the player signs out or deletes the account.
     */
    val cloudUnreadable: Boolean = false,
) {
    val signedIn: Boolean get() = provider != null
}

/** Progress in the cloud that differs from this phone's: the player chooses which to keep. */
data class CloudChoice(val cloudLevel: Int, val cloudSavedAt: Long)

/** A failed account action; [reason] picks the message ("cancelled" means the player backed out). */
class AccountException(val reason: String, cause: Throwable? = null) : Exception(reason, cause)

/** What the cloud holds for this account. [Unreadable] is distinct from [None] so an unreadable copy is never overwritten. */
private sealed interface CloudCopy {
    data object None : CloudCopy
    data object Unreadable : CloudCopy
    class Readable(val bundle: ProgressBundle) : CloudCopy
}

@Serializable
private data class ProgressBundle(
    val savedAt: Long,
    val stats: PlayerStats,
    val unlocked: Map<String, Long>,
    val saves: Map<Int, String>,
)

@Serializable
private data class ProgressRow(
    @SerialName("user_id") val userId: String,
    val data: String,
    @SerialName("app_version") val appVersion: String? = null,
    val level: Int? = null,
)

/**
 * The player's account: a guest (anonymous) account at first, made permanent
 * with Google or email and password so the progress (lifetime stats,
 * achievements and saved campaigns) is kept in the cloud and comes back on any
 * phone. The cloud copy is written when the app goes to the background.
 */
class Account(
    private val client: SupabaseClient,
    private val achievements: AchievementRepository,
    private val saves: SaveRepository,
    private val scope: CoroutineScope,
    private val clock: () -> Long = System::currentTimeMillis,
) {
    private val json = Json { ignoreUnknownKeys = true }
    private val lock = Mutex()

    private val _state = MutableStateFlow(AccountState())
    val state: StateFlow<AccountState> = _state.asStateFlow()

    private val _choice = MutableStateFlow<CloudChoice?>(null)
    val choice: StateFlow<CloudChoice?> = _choice.asStateFlow()

    private var cloudCopy: ProgressBundle? = null

    init {
        scope.launch { runCatching { client.auth.awaitInitialization() }; refreshState() }
    }

    private fun refreshState() {
        val user = client.auth.currentUserOrNull()
        val identity = user?.identities.orEmpty().firstOrNull()
        _state.value = _state.value.copy(provider = identity?.provider, email = user?.email?.takeIf { it.isNotBlank() })
    }

    /** The phone's account, signing in as a guest when there is none yet. */
    private suspend fun ensureSession() {
        client.auth.awaitInitialization()
        if (client.auth.currentSessionOrNull() == null) client.auth.signInAnonymously()
    }

    // ---------------------------------------------------------------- sign in

    suspend fun signInWithGoogle(activity: Activity) = act {
        val rawNonce = UUID.randomUUID().toString()
        val token = googleIdToken(activity, sha256(rawNonce))
        ensureSession()
        val guest = client.auth.currentUserOrNull()?.identities.isNullOrEmpty()
        val linked = guest && runCatching {
            // The guest account itself becomes the Google account: same id, same matches and progress.
            client.auth.linkIdentityWithIdToken(Google, token) { nonce = rawNonce }
            client.auth.retrieveUserForCurrentSession(updateSession = true)
        }.isSuccess
        if (!linked) {
            // This Google account already has a player account: switch to it.
            client.auth.signInWith(IDToken) {
                idToken = token
                provider = Google
                nonce = rawNonce
            }
        }
        afterSignIn()
    }

    /** Makes the guest account an email account (or registers a new one). */
    suspend fun createEmailAccount(email: String, password: String) = act {
        ensureSession()
        if (client.auth.currentUserOrNull()?.identities.isNullOrEmpty()) {
            client.auth.updateUser {
                this.email = email
                this.password = password
            }
            client.auth.retrieveUserForCurrentSession(updateSession = true)
        } else {
            client.auth.signUpWith(Email) {
                this.email = email
                this.password = password
            }
        }
        afterSignIn()
    }

    suspend fun signInWithEmail(email: String, password: String) = act {
        client.auth.signInWith(Email) {
            this.email = email
            this.password = password
        }
        afterSignIn()
    }

    /** Signs out; the phone keeps its progress and plays on as a new guest. */
    suspend fun signOut() = act {
        client.auth.signOut(SignOutScope.LOCAL)
        client.auth.signInAnonymously()
        _choice.value = null
        refreshState()
        _state.value = _state.value.copy(lastBackupAt = 0L, cloudUnreadable = false)
    }

    /** Deletes the account and its cloud copy for good (the phone keeps its own progress). */
    suspend fun deleteAccount() = act {
        client.postgrest.rpc("delete_my_account")
        client.auth.signOut(SignOutScope.LOCAL)
        client.auth.signInAnonymously()
        _choice.value = null
        refreshState()
        _state.value = _state.value.copy(lastBackupAt = 0L, cloudUnreadable = false)
    }

    // ---------------------------------------------------------------- cloud copy

    /** After signing in: an empty side takes the other's progress; two different ones are the player's choice. */
    private suspend fun afterSignIn() {
        refreshState()
        val cloud = downloadCloud()
        val local = localBundle()
        _state.value = _state.value.copy(cloudUnreadable = cloud == CloudCopy.Unreadable)
        when (cloud) {
            CloudCopy.None -> backupNow()
            CloudCopy.Unreadable -> Unit
            is CloudCopy.Readable -> when {
                local.isEmpty() -> applyCloud(cloud.bundle)
                else -> {
                    cloudCopy = cloud.bundle
                    _choice.value = CloudChoice(levelOf(cloud.bundle), cloud.bundle.savedAt)
                }
            }
        }
    }

    /** The player's answer to [choice]. */
    suspend fun keep(cloud: Boolean) = act {
        val copy = cloudCopy
        cloudCopy = null
        _choice.value = null
        if (cloud && copy != null) applyCloud(copy) else backupNow()
    }

    /**
     * Uploads this phone's progress (when signed in).
     * @throws AccountException with reason "cloud_unreadable" when the cloud copy must be kept as it is.
     */
    suspend fun backupNow() {
        if (!_state.value.signedIn || _choice.value != null) return
        if (_state.value.cloudUnreadable) throw AccountException("cloud_unreadable")
        lock.withLock {
            val user = client.auth.currentUserOrNull() ?: return
            val bundle = localBundle()
            client.from(TABLE).upsert(ProgressRow(user.id, encode(bundle), BuildConfig.VERSION_NAME, levelOf(bundle)))
            _state.value = _state.value.copy(lastBackupAt = clock())
        }
    }

    /** Fire-and-forget backup, e.g. when the app goes to the background. */
    fun backupSoon() {
        if (!_state.value.signedIn) return
        scope.launch { runCatching { backupNow() } }
    }

    private suspend fun downloadCloud(): CloudCopy {
        val user = client.auth.currentUserOrNull() ?: return CloudCopy.None
        val row = client.from(TABLE).select { filter { eq("user_id", user.id) } }.decodeSingleOrNull<ProgressRow>() ?: return CloudCopy.None
        val bundle = runCatching { decode(row.data) }.getOrNull() ?: return CloudCopy.Unreadable
        return CloudCopy.Readable(bundle)
    }

    private suspend fun applyCloud(cloud: ProgressBundle) {
        achievements.replaceAll(cloud.stats, cloud.unlocked)
        saves.importAll(cloud.saves)
        _state.value = _state.value.copy(lastBackupAt = clock())
    }

    private suspend fun localBundle() = ProgressBundle(clock(), achievements.stats.value, achievements.unlocked.value, saves.exportAll())

    private fun ProgressBundle.isEmpty() = stats == PlayerStats() && unlocked.isEmpty() && saves.isEmpty()

    private fun levelOf(bundle: ProgressBundle) = Progression.level(ALL_ACHIEVEMENTS.filter { it.id in bundle.unlocked }.sumOf { it.points })

    private fun encode(bundle: ProgressBundle): String {
        val out = ByteArrayOutputStream()
        GZIPOutputStream(out).use { it.write(json.encodeToString(ProgressBundle.serializer(), bundle).toByteArray()) }
        return Base64.encodeToString(out.toByteArray(), Base64.NO_WRAP)
    }

    private fun decode(data: String): ProgressBundle {
        val bytes = GZIPInputStream(ByteArrayInputStream(Base64.decode(data, Base64.NO_WRAP))).use { it.readBytes() }
        return json.decodeFromString(ProgressBundle.serializer(), bytes.decodeToString())
    }

    // ---------------------------------------------------------------- Google

    /** A Google ID token for the player's chosen Google account, bound to [hashedNonce]. */
    private suspend fun googleIdToken(activity: Activity, hashedNonce: String): String {
        val option = GetGoogleIdOption.Builder()
            .setFilterByAuthorizedAccounts(false)
            .setServerClientId(BuildConfig.GOOGLE_WEB_CLIENT_ID)
            .setNonce(hashedNonce)
            .build()
        val request = GetCredentialRequest.Builder().addCredentialOption(option).build()
        val credential = try {
            CredentialManager.create(activity).getCredential(activity, request).credential
        } catch (e: GetCredentialCancellationException) {
            throw AccountException("cancelled", e)
        } catch (e: NoCredentialException) {
            throw AccountException("no_google_account", e)
        } catch (e: GetCredentialException) {
            throw AccountException("google_failed", e)
        }
        if (credential !is CustomCredential || credential.type != GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {
            throw AccountException("google_failed")
        }
        return GoogleIdTokenCredential.createFrom(credential.data).idToken
    }

    private fun sha256(text: String): String =
        MessageDigest.getInstance("SHA-256").digest(text.toByteArray()).joinToString("") { "%02x".format(it) }

    /** Runs an account action, turning failures into [AccountException] reasons the screen can show. */
    private suspend fun act(block: suspend () -> Unit) {
        try {
            block()
        } catch (e: AccountException) {
            throw e
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            val text = e.message.orEmpty()
            val reason = when {
                "Invalid login credentials" in text || "invalid_credentials" in text -> "invalid_credentials"
                "already registered" in text || "email_exists" in text || "user_already_exists" in text -> "email_exists"
                "Password should be" in text || "weak_password" in text -> "weak_password"
                "valid email" in text || "email_address_invalid" in text -> "bad_email"
                e is IOException || "Unable to resolve host" in text -> "network"
                else -> "server"
            }
            throw AccountException(reason, e)
        } finally {
            refreshState()
        }
    }

    private companion object {
        const val TABLE = "player_progress"
    }
}

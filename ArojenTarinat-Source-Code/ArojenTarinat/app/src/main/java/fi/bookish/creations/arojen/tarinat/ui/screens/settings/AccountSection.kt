package fi.bookish.creations.arojen.tarinat.ui.screens.settings

import android.text.format.DateUtils
import androidx.activity.compose.LocalActivity
import androidx.annotation.StringRes
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import fi.bookish.creations.arojen.tarinat.R
import fi.bookish.creations.arojen.tarinat.account.Account
import fi.bookish.creations.arojen.tarinat.account.AccountException
import fi.bookish.creations.arojen.tarinat.ui.components.GameButton
import fi.bookish.creations.arojen.tarinat.ui.components.GameButtonStyle
import fi.bookish.creations.arojen.tarinat.ui.components.KeepFullScreen
import fi.bookish.creations.arojen.tarinat.ui.game.hud.GamePanel
import fi.bookish.creations.arojen.tarinat.ui.game.hud.SectionTitle
import fi.bookish.creations.arojen.tarinat.ui.icons.GameIcons
import fi.bookish.creations.arojen.tarinat.ui.theme.Gold
import fi.bookish.creations.arojen.tarinat.ui.theme.GoldBright
import fi.bookish.creations.arojen.tarinat.ui.theme.Jade
import fi.bookish.creations.arojen.tarinat.ui.theme.Rust
import fi.bookish.creations.arojen.tarinat.ui.theme.TextHigh
import fi.bookish.creations.arojen.tarinat.ui.theme.TextLow
import fi.bookish.creations.arojen.tarinat.ui.theme.TextMid
import kotlinx.coroutines.launch

@StringRes
private fun accountErrorRes(reason: String): Int = when (reason) {
    "invalid_credentials" -> R.string.acct_err_invalid
    "email_exists" -> R.string.acct_err_exists
    "weak_password" -> R.string.acct_err_weak
    "bad_email" -> R.string.acct_err_bad_email
    "no_google_account" -> R.string.acct_err_no_google
    "google_failed" -> R.string.acct_err_google
    "network" -> R.string.mp_err_network
    else -> R.string.mp_err_generic
}

/**
 * Guest, Google or email account: sign in so the progress is kept in the
 * cloud, save it now, sign out, or delete the account (Play's rule for apps
 * with accounts).
 */
@Composable
fun AccountSection(account: Account) {
    val state by account.state.collectAsStateWithLifecycle()
    val choice by account.choice.collectAsStateWithLifecycle()
    val activity = LocalActivity.current
    val scope = rememberCoroutineScope()
    var busy by remember { mutableStateOf(false) }
    var notice by remember { mutableStateOf<Pair<Int, Boolean>?>(null) }
    var emailOpen by remember { mutableStateOf(false) }
    var deleteOpen by remember { mutableStateOf(false) }

    fun run(@StringRes done: Int? = null, block: suspend () -> Unit) {
        if (busy) return
        busy = true
        notice = null
        scope.launch {
            try {
                block()
                if (done != null) notice = done to true
            } catch (e: AccountException) {
                if (e.reason != "cancelled") notice = accountErrorRes(e.reason) to false
            } finally {
                busy = false
            }
        }
    }

    SectionTitle(stringResource(R.string.acct_title), icon = GameIcons.People)
    if (state.signedIn) {
        val who = state.email ?: "—"
        Text(
            stringResource(if (state.provider == "google") R.string.acct_signed_in_google else R.string.acct_signed_in_email, who),
            style = MaterialTheme.typography.bodyMedium,
            color = TextHigh,
        )
        Text(
            if (state.lastBackupAt > 0) {
                stringResource(R.string.acct_backup_time, DateUtils.getRelativeTimeSpanString(state.lastBackupAt).toString())
            } else {
                stringResource(R.string.acct_backup_never)
            },
            style = MaterialTheme.typography.labelSmall,
            color = TextLow,
            modifier = Modifier.padding(top = 2.dp),
        )
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.padding(top = 8.dp)) {
            GameButton(stringResource(R.string.acct_backup_now), { run(R.string.acct_saved) { account.backupNow() } }, Modifier.weight(1f), GameButtonStyle.Secondary, enabled = !busy, compact = true)
            GameButton(stringResource(R.string.acct_sign_out), { run { account.signOut() } }, Modifier.weight(1f), GameButtonStyle.Secondary, enabled = !busy, compact = true)
        }
        GameButton(stringResource(R.string.acct_delete), { deleteOpen = true }, Modifier.fillMaxWidth().padding(top = 8.dp), GameButtonStyle.Secondary, enabled = !busy, compact = true)
    } else {
        Text(stringResource(R.string.acct_guest), style = MaterialTheme.typography.bodySmall, color = TextMid)
        GameButton(
            stringResource(R.string.acct_google),
            { activity?.let { a -> run(R.string.acct_done) { account.signInWithGoogle(a) } } },
            Modifier.fillMaxWidth().padding(top = 8.dp),
            enabled = !busy,
            compact = true,
        )
        GameButton(stringResource(R.string.acct_email), { emailOpen = true }, Modifier.fillMaxWidth().padding(top = 8.dp), GameButtonStyle.Secondary, enabled = !busy, compact = true)
    }
    notice?.let { (res, good) ->
        Text(stringResource(res), style = MaterialTheme.typography.labelMedium, color = if (good) Jade else Rust, modifier = Modifier.padding(top = 6.dp))
    }

    if (emailOpen) {
        EmailDialog(
            busy = busy,
            onSignIn = { email, password -> run(R.string.acct_done) { account.signInWithEmail(email, password); emailOpen = false } },
            onCreate = { email, password -> run(R.string.acct_done) { account.createEmailAccount(email, password); emailOpen = false } },
            onDismiss = { emailOpen = false },
            error = notice?.takeIf { !it.second }?.first,
        )
    }
    if (deleteOpen) {
        ConfirmDialog(
            title = stringResource(R.string.acct_delete_title),
            body = stringResource(R.string.acct_delete_body),
            confirm = stringResource(R.string.acct_delete_confirm),
            onConfirm = {
                deleteOpen = false
                run(R.string.acct_deleted) { account.deleteAccount() }
            },
            onDismiss = { deleteOpen = false },
        )
    }
    choice?.let { c ->
        Dialog(onDismissRequest = {}) {
            KeepFullScreen()
            GamePanel(Modifier.widthIn(max = 460.dp), alpha = 0.98f) {
                Column(Modifier.padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(stringResource(R.string.acct_choice_title), style = MaterialTheme.typography.headlineSmall, color = GoldBright, textAlign = TextAlign.Center)
                    Spacer(Modifier.height(8.dp))
                    Text(
                        stringResource(R.string.acct_choice_body, c.cloudLevel, DateUtils.getRelativeTimeSpanString(c.cloudSavedAt).toString()),
                        style = MaterialTheme.typography.bodyMedium,
                        color = TextMid,
                        textAlign = TextAlign.Center,
                    )
                    Spacer(Modifier.height(16.dp))
                    GameButton(stringResource(R.string.acct_keep_cloud), { run { account.keep(cloud = true) } }, Modifier.fillMaxWidth(), enabled = !busy)
                    Spacer(Modifier.height(8.dp))
                    GameButton(stringResource(R.string.acct_keep_phone), { run { account.keep(cloud = false) } }, Modifier.fillMaxWidth(), GameButtonStyle.Secondary, enabled = !busy)
                }
            }
        }
    }
}

@Composable
private fun EmailDialog(busy: Boolean, onSignIn: (String, String) -> Unit, onCreate: (String, String) -> Unit, onDismiss: () -> Unit, @StringRes error: Int?) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    val ready = email.contains('@') && password.length >= 6 && !busy
    Dialog(onDismissRequest = onDismiss) {
        KeepFullScreen()
        GamePanel(Modifier.widthIn(max = 460.dp), alpha = 0.98f) {
            Column(Modifier.padding(20.dp)) {
                Text(stringResource(R.string.acct_email), style = MaterialTheme.typography.headlineSmall, color = GoldBright)
                Spacer(Modifier.height(10.dp))
                AccountField(email, { email = it.trim() }, stringResource(R.string.acct_email_label), KeyboardType.Email, secret = false)
                Spacer(Modifier.height(8.dp))
                AccountField(password, { password = it }, stringResource(R.string.acct_password_label), KeyboardType.Password, secret = true)
                error?.let { Text(stringResource(it), style = MaterialTheme.typography.labelMedium, color = Rust, modifier = Modifier.padding(top = 6.dp)) }
                Spacer(Modifier.height(14.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    GameButton(stringResource(R.string.acct_sign_in), { onSignIn(email, password) }, Modifier.weight(1f), enabled = ready, compact = true)
                    GameButton(stringResource(R.string.acct_create), { onCreate(email, password) }, Modifier.weight(1f), GameButtonStyle.Secondary, enabled = ready, compact = true)
                }
            }
        }
    }
}

@Composable
private fun AccountField(value: String, onChange: (String) -> Unit, label: String, type: KeyboardType, secret: Boolean) {
    OutlinedTextField(
        value = value,
        onValueChange = onChange,
        placeholder = { Text(label, color = TextLow) },
        singleLine = true,
        keyboardOptions = KeyboardOptions(keyboardType = type),
        visualTransformation = if (secret) PasswordVisualTransformation() else VisualTransformation.None,
        colors = OutlinedTextFieldDefaults.colors(
            focusedTextColor = TextHigh,
            unfocusedTextColor = TextHigh,
            focusedBorderColor = Gold,
            unfocusedBorderColor = Gold.copy(alpha = 0.4f),
            cursorColor = GoldBright,
        ),
        modifier = Modifier.fillMaxWidth(),
    )
}

@Composable
private fun ConfirmDialog(title: String, body: String, confirm: String, onConfirm: () -> Unit, onDismiss: () -> Unit) {
    Dialog(onDismissRequest = onDismiss) {
        KeepFullScreen()
        GamePanel(Modifier.widthIn(max = 440.dp), alpha = 0.98f) {
            Column(Modifier.padding(20.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                Text(title, style = MaterialTheme.typography.headlineSmall, color = GoldBright, textAlign = TextAlign.Center)
                Spacer(Modifier.height(8.dp))
                Text(body, style = MaterialTheme.typography.bodyMedium, color = TextMid, textAlign = TextAlign.Center)
                Spacer(Modifier.height(16.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    GameButton(stringResource(R.string.save_cancel), onDismiss, style = GameButtonStyle.Secondary)
                    GameButton(confirm, onConfirm)
                }
            }
        }
    }
}

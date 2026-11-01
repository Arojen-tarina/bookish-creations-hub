package fi.bookish.creations.arojen.tarinat.ui.components

import android.view.View
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.BottomSheetDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.DialogWindowProvider
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import fi.bookish.creations.arojen.tarinat.ui.theme.Gold
import fi.bookish.creations.arojen.tarinat.ui.theme.Ink800
import fi.bookish.creations.arojen.tarinat.ui.theme.Scrim
import fi.bookish.creations.arojen.tarinat.ui.theme.TextHigh

/**
 * A bottom sheet in the game's colours that opens fully. Lists and forms that
 * would crowd a screen live in one, so the screen itself stays light.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GameSheet(onDismiss: () -> Unit, content: @Composable ColumnScope.() -> Unit) {
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
        containerColor = Ink800,
        contentColor = TextHigh,
        scrimColor = Scrim,
        dragHandle = { BottomSheetDefaults.DragHandle(color = Gold.copy(alpha = 0.6f)) },
    ) {
        // The sheet has a window of its own; keep the game full screen while it is open.
        KeepFullScreen()
        Column(
            Modifier
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp)
                .padding(bottom = 16.dp),
            content = content,
        )
    }
}

/**
 * Hides the system bars of the window this is placed in. Dialogs and sheets get
 * windows of their own, which would otherwise bring the bars back over the game.
 */
@Composable
fun KeepFullScreen() {
    val view = LocalView.current
    SideEffect {
        generateSequence<Any>(view) { (it as? View)?.parent }.filterIsInstance<DialogWindowProvider>().firstOrNull()?.window?.let { window ->
            WindowCompat.getInsetsController(window, window.decorView).apply {
                systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
                hide(WindowInsetsCompat.Type.systemBars())
            }
        }
    }
}

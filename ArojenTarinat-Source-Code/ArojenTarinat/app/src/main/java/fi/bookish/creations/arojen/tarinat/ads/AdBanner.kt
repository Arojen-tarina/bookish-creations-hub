package fi.bookish.creations.arojen.tarinat.ads

import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.compose.LifecycleResumeEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.google.android.gms.ads.AdListener
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.AdSize
import com.google.android.gms.ads.AdView

/**
 * An anchored adaptive banner as wide as its slot. It takes no room until an ad
 * has loaded (no empty box when there is no ad or no network), pauses with the
 * screen and is destroyed when the screen goes.
 */
@Composable
fun AdBanner(ads: Ads, unitId: String, modifier: Modifier = Modifier) {
    val ready by ads.ready.collectAsStateWithLifecycle()
    if (!ready) return
    BoxWithConstraints(modifier.fillMaxWidth()) {
        val width = maxWidth.value.toInt()
        val context = LocalContext.current
        // A new width (rotation, resized window) needs a new ad of the matching size.
        key(width) {
            val size = remember { AdSize.getLargeAnchoredAdaptiveBannerAdSize(context, width) }
            var loaded by remember { mutableStateOf(false) }
            var view by remember { mutableStateOf<AdView?>(null) }
            AndroidView(
                factory = {
                    AdView(it).apply {
                        setAdSize(size)
                        adUnitId = unitId
                        adListener = object : AdListener() {
                            override fun onAdLoaded() {
                                loaded = true
                            }
                        }
                        loadAd(AdRequest.Builder().build())
                        view = this
                    }
                },
                modifier = Modifier.fillMaxWidth().height(if (loaded) size.height.dp else 0.dp),
                onRelease = { it.destroy() },
            )
            LifecycleResumeEffect(view) {
                view?.resume()
                onPauseOrDispose { view?.pause() }
            }
        }
    }
}

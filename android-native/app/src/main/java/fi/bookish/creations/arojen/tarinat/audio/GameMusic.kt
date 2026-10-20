package fi.bookish.creations.arojen.tarinat.audio

import android.content.ContentResolver
import android.content.Context
import android.media.AudioManager
import android.net.Uri
import androidx.annotation.RawRes
import androidx.media3.common.AudioAttributes
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import fi.bookish.creations.arojen.tarinat.R
import fi.bookish.creations.arojen.tarinat.data.Settings
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

/** What the music should be doing. */
enum class MusicMood {
    /** The six-track playlist, in turn (menus and ordinary turns). */
    CALM,

    /** The combat track on repeat, from the player's first battle of a turn until the turn ends. */
    COMBAT,
}

/**
 * Background music, as in the original game: the six tracks play one after
 * another, combat music loops while the player is fighting, and afterwards the
 * playlist picks up where it left off. Lives as long as the process.
 *
 * It stays quiet in the background, through calls (audio focus), when
 * headphones are unplugged, and when the player was already listening to their
 * own music as the game came to the front. Everything runs on the main thread,
 * as ExoPlayer requires.
 */
class GameMusic(context: Context, settings: StateFlow<Settings>, scope: CoroutineScope) {
    private val app = context.applicationContext
    private val audioManager = app.getSystemService(AudioManager::class.java)
    private val main = CoroutineScope(scope.coroutineContext + Dispatchers.Main.immediate)

    private var player: ExoPlayer? = null
    private var current = settings.value
    private var mood = MusicMood.CALM

    /** The mood whose tracks the player holds (null before the first play). */
    private var loaded: MusicMood? = null
    private var foreground = false

    /** Another app's audio has the floor until the game next comes to the front. */
    private var yielding = false

    /** A full-screen ad has its own sound. */
    private var interrupted = false

    /** Volume while the settings slider is being dragged, before it is saved. */
    private var preview: Float? = null

    /** Where the playlist was when combat music took over. */
    private var playlistIndex = 0
    private var playlistPositionMs = 0L
    private var fade: Job? = null

    init {
        main.launch {
            settings.collect {
                if (it.musicVolume != current.musicVolume) preview = null
                current = it
                update()
            }
        }
    }

    fun onForeground() {
        foreground = true
        val ours = player?.isPlaying == true
        yielding = !ours && audioManager.isMusicActive
        update()
    }

    fun onBackground() {
        foreground = false
        update()
    }

    fun setMood(next: MusicMood) {
        if (next == mood) return
        mood = next
        update()
    }

    /** Silences the music while a full-screen ad plays, and brings it back after. */
    fun setInterrupted(value: Boolean) {
        if (value == interrupted) return
        interrupted = value
        update()
    }

    /** Plays at [volume] (0..1) while the player drags the slider; the saved setting takes over once stored. */
    fun previewVolume(volume: Float) {
        preview = volume
        player?.takeIf { it.playWhenReady }?.let { fadeTo(it, targetVolume(), 0) }
    }

    private fun targetVolume() = (preview ?: current.musicVolume).coerceIn(0f, 1f) * VOLUME_SCALE

    private fun shouldPlay() = foreground && !yielding && !interrupted && !current.musicMuted && targetVolume() > 0f

    private fun update() {
        val existing = player
        if (!shouldPlay()) {
            if (existing != null && existing.playWhenReady) fadeTo(existing, 0f, FADE_MS) { existing.pause() }
            return
        }
        val p = existing ?: create().also { player = it }
        when {
            loaded != mood && p.isPlaying -> fadeTo(p, 0f, FADE_MS) { load(p, mood); fadeIn(p) }
            loaded != mood -> { load(p, mood); fadeIn(p) }
            !p.playWhenReady -> fadeIn(p)
            else -> fadeTo(p, targetVolume(), FADE_MS)
        }
    }

    private fun fadeIn(p: ExoPlayer) {
        if (!p.playWhenReady) p.volume = 0f
        p.play()
        fadeTo(p, targetVolume(), FADE_IN_MS)
    }

    private fun load(p: ExoPlayer, next: MusicMood) {
        if (loaded == MusicMood.CALM) {
            playlistIndex = p.currentMediaItemIndex
            playlistPositionMs = p.currentPosition
        }
        when (next) {
            MusicMood.CALM -> {
                p.setMediaItems(PLAYLIST.map(::track), playlistIndex, playlistPositionMs)
                p.repeatMode = Player.REPEAT_MODE_ALL
            }
            MusicMood.COMBAT -> {
                p.setMediaItem(track(COMBAT))
                p.repeatMode = Player.REPEAT_MODE_ONE
            }
        }
        p.prepare()
        loaded = next
    }

    /** Glides the volume to [target] over [ms], then runs [then]; a newer fade replaces it. */
    private fun fadeTo(p: ExoPlayer, target: Float, ms: Long, then: () -> Unit = {}) {
        fade?.cancel()
        fade = main.launch {
            val from = p.volume
            val steps = (ms / FRAME_MS).coerceAtLeast(1)
            for (i in 1..steps) {
                p.volume = from + (target - from) * i / steps
                if (i < steps) delay(FRAME_MS)
            }
            then()
        }
    }

    private fun create(): ExoPlayer = ExoPlayer.Builder(app)
        .setAudioAttributes(
            AudioAttributes.Builder().setUsage(C.USAGE_GAME).setContentType(C.AUDIO_CONTENT_TYPE_MUSIC).build(),
            /* handleAudioFocus = */ true,
        )
        .setHandleAudioBecomingNoisy(true)
        .build()
        .apply {
            addListener(object : Player.Listener {
                override fun onPlayWhenReadyChanged(playWhenReady: Boolean, reason: Int) {
                    // Another app took the audio, or headphones came out: stay quiet until the next return to the game.
                    if (!playWhenReady && reason in YIELD_REASONS) yielding = true
                }
            })
        }

    private fun track(@RawRes id: Int): MediaItem = MediaItem.fromUri(
        Uri.Builder().scheme(ContentResolver.SCHEME_ANDROID_RESOURCE).authority(app.packageName).appendPath(id.toString()).build(),
    )

    private companion object {
        val PLAYLIST = listOf(
            R.raw.music_track1, R.raw.music_track2, R.raw.music_track3,
            R.raw.music_track4, R.raw.music_track5, R.raw.music_track6,
        )
        val COMBAT = R.raw.music_combat

        val YIELD_REASONS = setOf(
            Player.PLAY_WHEN_READY_CHANGE_REASON_AUDIO_FOCUS_LOSS,
            Player.PLAY_WHEN_READY_CHANGE_REASON_AUDIO_BECOMING_NOISY,
        )

        /** The original played music at 0.6 of the chosen volume, leaving headroom. */
        const val VOLUME_SCALE = 0.6f
        const val FADE_MS = 350L
        const val FADE_IN_MS = 700L
        const val FRAME_MS = 16L
    }
}

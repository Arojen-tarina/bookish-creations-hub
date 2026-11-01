package fi.bookish.creations.arojen.tarinat.multiplayer

import android.content.Context
import android.media.MediaPlayer
import android.media.MediaRecorder
import android.os.Build
import android.os.SystemClock
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.io.File

/** A finished voice message: AAC in an MPEG-4 (.m4a) file's bytes. */
class VoiceClip(val bytes: ByteArray, val durationMs: Int)

/** Records one voice message at a time, up to [MAX_MS] (the recorder stops itself there). */
class VoiceRecorder(private val context: Context) {
    private var recorder: MediaRecorder? = null
    private var file: File? = null
    private var startedAt = 0L

    val recording: Boolean get() = recorder != null

    /** Milliseconds recorded so far. */
    val elapsedMs: Long get() = if (recording) SystemClock.elapsedRealtime() - startedAt else 0L

    /** Starts recording; [onLimit] runs when the 30 seconds are up. False if the microphone is unavailable. */
    fun start(onLimit: () -> Unit): Boolean {
        cancel()
        val out = File(context.cacheDir, "voice-${System.nanoTime()}.m4a")
        val r = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) MediaRecorder(context) else @Suppress("DEPRECATION") MediaRecorder()
        return try {
            r.setAudioSource(MediaRecorder.AudioSource.MIC)
            r.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
            r.setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
            r.setAudioChannels(1)
            r.setAudioSamplingRate(22_050)
            r.setAudioEncodingBitRate(32_000)
            r.setMaxDuration(MAX_MS)
            r.setOutputFile(out.path)
            r.setOnInfoListener { _, what, _ -> if (what == MediaRecorder.MEDIA_RECORDER_INFO_MAX_DURATION_REACHED) onLimit() }
            r.prepare()
            r.start()
            recorder = r
            file = out
            startedAt = SystemClock.elapsedRealtime()
            true
        } catch (_: Exception) {
            r.release()
            out.delete()
            false
        }
    }

    /** Stops and returns the clip; null when it was too short or the recorder failed. */
    fun stop(): VoiceClip? {
        val r = recorder ?: return null
        val out = file
        val duration = (SystemClock.elapsedRealtime() - startedAt).coerceAtMost(MAX_MS.toLong()).toInt()
        recorder = null
        file = null
        val ok = runCatching { r.stop() }.isSuccess
        r.release()
        val bytes = out?.takeIf { ok && duration >= MIN_MS }?.readBytes()
        out?.delete()
        return bytes?.let { VoiceClip(it, duration) }
    }

    fun cancel() {
        val r = recorder ?: return
        recorder = null
        runCatching { r.stop() }
        r.release()
        file?.delete()
        file = null
    }

    companion object {
        const val MAX_MS = 30_000
        const val MIN_MS = 500
    }
}

/** Plays voice messages one at a time; [playingId] is the message playing now. */
class VoicePlayer(private val context: Context) {
    private var player: MediaPlayer? = null
    private var file: File? = null

    private val _playingId = MutableStateFlow<Long?>(null)
    val playingId: StateFlow<Long?> = _playingId.asStateFlow()

    /** Plays [bytes] as message [id]; [onEnd] runs when it finishes or is stopped. */
    fun play(id: Long, bytes: ByteArray, onEnd: () -> Unit) {
        stop()
        val out = File(context.cacheDir, "play-$id.m4a").apply { writeBytes(bytes) }
        val p = MediaPlayer()
        try {
            p.setDataSource(out.path)
            p.setOnCompletionListener {
                stop()
                onEnd()
            }
            p.prepare()
            p.start()
            player = p
            file = out
            _playingId.value = id
        } catch (_: Exception) {
            p.release()
            out.delete()
            onEnd()
        }
    }

    fun stop() {
        player?.let {
            runCatching { it.stop() }
            it.release()
        }
        player = null
        file?.delete()
        file = null
        _playingId.value = null
    }
}

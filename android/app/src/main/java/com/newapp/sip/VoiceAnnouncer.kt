package com.newapp.sip

import android.content.Context
import android.speech.tts.TextToSpeech
import android.util.Log
import java.util.Locale

/**
 * Speaks short call-progress announcements to the caller (e.g. "The user is
 * busy, please try again later") using Android Text-To-Speech. If the TTS
 * engine is unavailable, it falls back to the standard busy tone so the caller
 * still gets an audible cue.
 */
object VoiceAnnouncer {

    private const val TAG = "VoiceAnnouncer"

    @Volatile
    private var tts: TextToSpeech? = null

    @Volatile
    private var ready: Boolean = false

    @Volatile
    private var pendingMessage: String? = null

    /**
     * Speaks [message]. Initializes the TTS engine lazily on first use. If the
     * engine cannot be initialized, plays the busy tone instead.
     */
    @Synchronized
    fun speak(context: Context, message: String) {
        val existing = tts
        if (existing != null && ready) {
            existing.speak(message, TextToSpeech.QUEUE_FLUSH, null, "sip-announce")
            return
        }

        // Queue the message until the engine reports it is ready.
        pendingMessage = message

        if (existing == null) {
            val appContext = context.applicationContext
            tts = TextToSpeech(appContext) { status ->
                if (status == TextToSpeech.SUCCESS) {
                    ready = true
                    tts?.language = Locale.US
                    val queued = pendingMessage
                    pendingMessage = null
                    if (queued != null) {
                        tts?.speak(queued, TextToSpeech.QUEUE_FLUSH, null, "sip-announce")
                    }
                    Log.d(TAG, "TTS ready")
                } else {
                    Log.w(TAG, "TTS init failed (status=$status), falling back to busy tone")
                    ready = false
                    pendingMessage = null
                    CallToneHelper.playBusy()
                }
            }
        }
    }

    @Synchronized
    fun stop() {
        try {
            tts?.stop()
        } catch (error: Exception) {
            Log.w(TAG, "Failed to stop TTS", error)
        }
    }

    @Synchronized
    fun shutdown() {
        try {
            tts?.stop()
            tts?.shutdown()
        } catch (error: Exception) {
            Log.w(TAG, "Failed to shut down TTS", error)
        }
        tts = null
        ready = false
        pendingMessage = null
    }
}

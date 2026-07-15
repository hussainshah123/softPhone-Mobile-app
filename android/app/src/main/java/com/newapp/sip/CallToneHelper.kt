package com.newapp.sip

import android.media.AudioManager
import android.media.ToneGenerator
import android.util.Log

/**
 * Plays standard telephony call-progress tones (busy / congestion) using the
 * platform [ToneGenerator]. Used when an outgoing call cannot be completed
 * because the remote party is busy, rejected the call, or did not answer.
 */
object CallToneHelper {

    private const val TAG = "CallTone"
    private const val BUSY_DURATION_MS = 4000

    @Volatile
    private var toneGenerator: ToneGenerator? = null

    /** Plays the standard "line busy" tone (the caller hears the other side is busy). */
    @Synchronized
    fun playBusy() {
        stop()
        try {
            val generator = ToneGenerator(AudioManager.STREAM_MUSIC, 90)
            toneGenerator = generator
            generator.startTone(ToneGenerator.TONE_SUP_BUSY, BUSY_DURATION_MS)
            Log.d(TAG, "Busy tone started")
        } catch (error: Exception) {
            Log.e(TAG, "Failed to play busy tone", error)
        }
    }

    /** Plays the "congestion / unavailable" tone (no answer / temporarily unavailable). */
    @Synchronized
    fun playCongestion() {
        stop()
        try {
            val generator = ToneGenerator(AudioManager.STREAM_MUSIC, 90)
            toneGenerator = generator
            generator.startTone(ToneGenerator.TONE_SUP_CONGESTION, BUSY_DURATION_MS)
            Log.d(TAG, "Congestion tone started")
        } catch (error: Exception) {
            Log.e(TAG, "Failed to play congestion tone", error)
        }
    }

    @Synchronized
    fun stop() {
        try {
            toneGenerator?.stopTone()
            toneGenerator?.release()
        } catch (error: Exception) {
            Log.e(TAG, "Failed to stop tone", error)
        }
        toneGenerator = null
    }
}

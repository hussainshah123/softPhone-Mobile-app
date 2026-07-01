package com.newapp.sip

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.media.MediaPlayer
import android.media.RingtoneManager
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Log

object RingtoneHelper {

    private const val TAG = "Ringtone"

    @Volatile
    private var mediaPlayer: MediaPlayer? = null
    private var vibrator: Vibrator? = null
    private var audioManager: AudioManager? = null
    private var audioFocusRequest: AudioFocusRequest? = null

    /**
     * Starts playing the system default ringtone and vibrating.
     * Safe to call multiple times - will stop previous playback first.
     */
    @Synchronized
    fun start(context: Context) {
        Log.i(TAG, "Starting ringtone and vibration")

        // Stop any existing playback first
        stop()

        try {
            audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
            requestAudioFocus()
        } catch (e: Exception) {
            Log.e(TAG, "Error requesting audio focus", e)
        }

        // Start ringtone playback
        try {
            val ringtoneUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE)
            mediaPlayer = MediaPlayer().apply {
                setDataSource(context, ringtoneUri)
                @Suppress("DEPRECATION")
                setAudioStreamType(AudioManager.STREAM_RING)
                isLooping = true
                prepare()
                start()
            }
            Log.d(TAG, "Ringtone playback started")
        } catch (e: Exception) {
            Log.e(TAG, "Error starting ringtone", e)
            // Try fallback - notification sound
            try {
                val fallbackUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
                mediaPlayer = MediaPlayer().apply {
                    setDataSource(context, fallbackUri)
                    @Suppress("DEPRECATION")
                    setAudioStreamType(AudioManager.STREAM_RING)
                    isLooping = true
                    prepare()
                    start()
                }
                Log.d(TAG, "Fallback ringtone playback started")
            } catch (e2: Exception) {
                Log.e(TAG, "Error starting fallback ringtone", e2)
            }
        }

        // Start vibration
        try {
            vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
                vibratorManager.defaultVibrator
            } else {
                @Suppress("DEPRECATION")
                context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
            }

            val pattern = longArrayOf(0, 1000, 1000) // wait 0ms, vibrate 1000ms, pause 1000ms

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val effect = VibrationEffect.createWaveform(pattern, 0) // repeat from index 0
                vibrator?.vibrate(effect)
            } else {
                @Suppress("DEPRECATION")
                vibrator?.vibrate(pattern, 0) // repeat from index 0
            }
            Log.d(TAG, "Vibration started")
        } catch (e: Exception) {
            Log.e(TAG, "Error starting vibration", e)
        }
    }

    /**
     * Stops ringtone playback and vibration. Releases all resources.
     */
    @Synchronized
    fun stop() {
        Log.i(TAG, "Stopping ringtone and vibration")

        // Stop and release MediaPlayer
        try {
            mediaPlayer?.let { player ->
                if (player.isPlaying) {
                    player.stop()
                }
                player.release()
                Log.d(TAG, "MediaPlayer released")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping MediaPlayer", e)
        }
        mediaPlayer = null

        // Cancel vibration
        try {
            vibrator?.cancel()
            Log.d(TAG, "Vibration cancelled")
        } catch (e: Exception) {
            Log.e(TAG, "Error cancelling vibration", e)
        }
        vibrator = null

        // Abandon audio focus
        try {
            abandonAudioFocus()
        } catch (e: Exception) {
            Log.e(TAG, "Error abandoning audio focus", e)
        }
        audioManager = null
    }

    private fun requestAudioFocus() {
        val am = audioManager ?: return

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val attrs = AudioAttributes.Builder()
                .setUsage(AudioAttributes.USAGE_NOTIFICATION_RINGTONE)
                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                .build()

            audioFocusRequest = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN_TRANSIENT)
                .setAudioAttributes(attrs)
                .setOnAudioFocusChangeListener { focusChange ->
                    Log.d(TAG, "Audio focus changed: $focusChange")
                }
                .build()

            am.requestAudioFocus(audioFocusRequest!!)
        } else {
            @Suppress("DEPRECATION")
            am.requestAudioFocus(
                { focusChange -> Log.d(TAG, "Audio focus changed: $focusChange") },
                AudioManager.STREAM_RING,
                AudioManager.AUDIOFOCUS_GAIN_TRANSIENT
            )
        }
        Log.d(TAG, "Audio focus requested")
    }

    private fun abandonAudioFocus() {
        val am = audioManager ?: return

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            audioFocusRequest?.let { am.abandonAudioFocusRequest(it) }
            audioFocusRequest = null
        } else {
            @Suppress("DEPRECATION")
            am.abandonAudioFocus(null)
        }
        Log.d(TAG, "Audio focus abandoned")
    }
}

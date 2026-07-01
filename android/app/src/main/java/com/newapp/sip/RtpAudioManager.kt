package com.newapp.sip

import android.content.Context
import android.media.AudioFormat
import android.media.AudioManager
import android.media.AudioRecord
import android.media.AudioTrack
import android.media.MediaRecorder
import android.util.Log
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.InetAddress
import java.util.concurrent.atomic.AtomicBoolean
import kotlin.random.Random

object RtpAudioManager {

    private const val TAG = "RTP"
    private const val SAMPLE_RATE = 8000
    private const val SAMPLES_PER_PACKET = 160 // 20ms of audio at 8kHz
    private const val PCM_BYTES_PER_PACKET = SAMPLES_PER_PACKET * 2 // 320 bytes (16-bit samples)
    private const val RTP_HEADER_SIZE = 12
    private const val PCMU_PAYLOAD_SIZE = SAMPLES_PER_PACKET // 160 bytes after G.711 encoding
    private const val RTP_PACKET_SIZE = RTP_HEADER_SIZE + PCMU_PAYLOAD_SIZE

    // G.711 μ-law constants
    private const val BIAS = 0x84 // 132
    private const val CLIP = 32635

    // Exponent lookup table for μ-law encoding
    private val expLut = intArrayOf(
        0, 0, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3,
        4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
        5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
        5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
        6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
        6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
        6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
        6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6,
        7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
        7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
        7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
        7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
        7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
        7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
        7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7,
        7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7
    )

    // Public properties
    var localPort: Int = 0
        private set

    @Volatile
    var isMuted: Boolean = false

    @Volatile
    var isSpeakerOn: Boolean = false

    @Volatile
    private var payloadType: Int = 0 // 0=PCMU (ulaw), 8=PCMA (alaw)

    fun setPayloadType(pt: Int) {
        payloadType = when (pt) {
            0, 8 -> pt
            else -> {
                Log.w(TAG, "Unsupported negotiated payload type $pt, falling back to PCMU")
                0
            }
        }
        Log.d(TAG, "RTP payload type set to $payloadType")
    }

    // Internal state
    private val running = AtomicBoolean(false)
    private var socket: DatagramSocket? = null
    private var audioRecord: AudioRecord? = null
    private var audioTrack: AudioTrack? = null
    private var sendThread: Thread? = null
    private var receiveThread: Thread? = null
    private var audioManager: AudioManager? = null

    fun isRunning(): Boolean = running.get()

    /**
     * Pre-allocates a UDP socket and returns the local port.
     * Call this before start() so the port is available for SDP negotiation.
     * If already allocated, returns the current port.
     */
fun prepare(): Int {
        if (socket != null && !socket!!.isClosed) {
            Log.d(TAG, "Socket already allocated on port $localPort")
            return localPort
        }
        try {
            socket = DatagramSocket(0)
            localPort = socket!!.localPort
            Log.d(TAG, "Allocated RTP socket on port $localPort")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to allocate RTP socket", e)
        }
        return localPort
    }

    /**
     * Starts RTP audio streaming to the given remote endpoint.
     * If prepare() was not called, allocates a new socket.
     */
    fun start(context: Context, remoteIp: String, remotePort: Int) {
        if (running.getAndSet(true)) {
            Log.w(TAG, "RTP already running")
            return
        }

        Log.i(TAG, "Starting RTP stream to $remoteIp:$remotePort")

        // Allocate socket if not already prepared
        if (socket == null || socket!!.isClosed) {
            prepare()
        }

        // Configure audio manager
        audioManager = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
        audioManager?.mode = AudioManager.MODE_IN_COMMUNICATION
        if (isSpeakerOn) {
            @Suppress("DEPRECATION")
            audioManager?.isSpeakerphoneOn = true
        }

        // Initialize AudioRecord for capturing mic input
        val minRecordBufSize = AudioRecord.getMinBufferSize(
            SAMPLE_RATE,
            AudioFormat.CHANNEL_IN_MONO,
            AudioFormat.ENCODING_PCM_16BIT
        )
        if (minRecordBufSize <= 0) {
            Log.e(TAG, "AudioRecord buffer size calculation failed: $minRecordBufSize")
            return
        }
        val recordBufSize = maxOf(minRecordBufSize, PCM_BYTES_PER_PACKET * 4)
        audioRecord = AudioRecord(
            MediaRecorder.AudioSource.MIC,
            SAMPLE_RATE,
            AudioFormat.CHANNEL_IN_MONO,
            AudioFormat.ENCODING_PCM_16BIT,
            recordBufSize
        )

        if (audioRecord?.state != AudioRecord.STATE_INITIALIZED) {
            Log.e(TAG, "AudioRecord failed to initialize, state: ${audioRecord?.state}")
            audioRecord?.release()
            audioRecord = null
            audioManager = null
            running.set(false)
            return
        }

        // Initialize AudioTrack for playing received audio
        val minPlayBufSize = AudioTrack.getMinBufferSize(
            SAMPLE_RATE,
            AudioFormat.CHANNEL_OUT_MONO,
            AudioFormat.ENCODING_PCM_16BIT
        )
        if (minPlayBufSize <= 0) {
            Log.e(TAG, "AudioTrack buffer size calculation failed: $minPlayBufSize")
            audioRecord?.release()
            audioRecord = null
            audioManager = null
            return
        }
        val playBufSize = maxOf(minPlayBufSize, PCM_BYTES_PER_PACKET * 4)
        @Suppress("DEPRECATION")
        audioTrack = AudioTrack(
            AudioManager.STREAM_VOICE_CALL,
            SAMPLE_RATE,
            AudioFormat.CHANNEL_OUT_MONO,
            AudioFormat.ENCODING_PCM_16BIT,
            playBufSize,
            AudioTrack.MODE_STREAM
        )

        // Check AudioTrack initialization
        if (audioTrack?.state != AudioTrack.STATE_INITIALIZED) {
            Log.e(TAG, "AudioTrack failed to initialize")
            audioRecord?.release()
            audioRecord = null
            audioTrack = null
            audioManager = null
            running.set(false)
            return
        }

        // All checks passed, we can start recording and playback
        audioRecord?.startRecording()
        audioTrack?.play()

        // Start sender thread
        sendThread = Thread({
            sendLoop(remoteIp, remotePort)
        }, "RtpSender").apply { start() }

        // Start receiver thread
        receiveThread = Thread({
            receiveLoop()
        }, "RtpReceiver").apply { start() }

        Log.i(TAG, "RTP streaming started")

        running.set(true)
    }

    fun stop() {
        if (!running.getAndSet(false)) {
            Log.d(TAG, "RTP already stopped")
            return
        }

        Log.i(TAG, "Stopping RTP stream")

        try {
            audioRecord?.stop()
            audioRecord?.release()
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping AudioRecord", e)
        }
        audioRecord = null

        try {
            audioTrack?.stop()
            audioTrack?.release()
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping AudioTrack", e)
        }
        audioTrack = null

        try {
            socket?.close()
        } catch (e: Exception) {
            Log.e(TAG, "Error closing socket", e)
        }
        socket = null
        localPort = 0

        // Reset audio manager mode
        try {
            audioManager?.mode = AudioManager.MODE_NORMAL
            @Suppress("DEPRECATION")
            audioManager?.isSpeakerphoneOn = false
        } catch (e: Exception) {
            Log.e(TAG, "Error resetting AudioManager", e)
        }
        audioManager = null

        // Wait for threads to finish
        try {
            sendThread?.join(1000)
            receiveThread?.join(1000)
        } catch (e: InterruptedException) {
            Log.w(TAG, "Interrupted waiting for threads", e)
        }
        sendThread = null
        receiveThread = null

        isMuted = false
        isSpeakerOn = false
        payloadType = 0

        Log.i(TAG, "RTP streaming stopped")
    }

    /**
     * Toggles microphone mute state.
     * @return The new isMuted state.
     */
    fun toggleMute(): Boolean {
        isMuted = !isMuted
        Log.d(TAG, "Mute toggled: $isMuted")
        return isMuted
    }

    /**
     * Toggles between speaker and earpiece.
     * @return The new isSpeakerOn state.
     */
    fun toggleSpeaker(context: Context): Boolean {
        isSpeakerOn = !isSpeakerOn
        val am = context.getSystemService(Context.AUDIO_SERVICE) as AudioManager
        am.mode = AudioManager.MODE_IN_COMMUNICATION
        @Suppress("DEPRECATION")
        am.isSpeakerphoneOn = isSpeakerOn
        Log.d(TAG, "Speaker toggled: $isSpeakerOn")
        return isSpeakerOn
    }

    // -----------------------------------------------------------------------
    // Send loop - captures mic audio, encodes to PCMU, sends as RTP
    // -----------------------------------------------------------------------

    private fun sendLoop(remoteIp: String, remotePort: Int) {
        try {
            val remoteAddr = InetAddress.getByName(remoteIp)
            val ssrc = Random.nextInt()
            var sequenceNumber: Short = 0
            var timestamp = 0
            val pcmBuffer = ShortArray(SAMPLES_PER_PACKET)
            val rtpPacket = ByteArray(RTP_PACKET_SIZE)
            val silencePayload = when (payloadType) {
                8 -> ByteArray(PCMU_PAYLOAD_SIZE) { 0xD5.toByte() }
                else -> ByteArray(PCMU_PAYLOAD_SIZE) { 0xFF.toByte() }
            }

            // Static RTP header fields
            rtpPacket[0] = 0x80.toByte() // V=2, P=0, X=0, CC=0

            Log.d(TAG, "Sender started, SSRC=${ssrc.toUInt()}, remote=$remoteIp:$remotePort, PT=$payloadType")

            // SSRC (bytes 8-11)
            rtpPacket[8] = (ssrc shr 24 and 0xFF).toByte()
            rtpPacket[9] = (ssrc shr 16 and 0xFF).toByte()
            rtpPacket[10] = (ssrc shr 8 and 0xFF).toByte()
            rtpPacket[11] = (ssrc and 0xFF).toByte()

            while (running.get()) {
                rtpPacket[1] = (payloadType and 0x7F).toByte()
                val read = audioRecord?.read(pcmBuffer, 0, SAMPLES_PER_PACKET) ?: -1
                if (read <= 0) continue

                // Sequence number (bytes 2-3, big-endian)
                rtpPacket[2] = (sequenceNumber.toInt() shr 8 and 0xFF).toByte()
                rtpPacket[3] = (sequenceNumber.toInt() and 0xFF).toByte()

                // Timestamp (bytes 4-7, big-endian)
                rtpPacket[4] = (timestamp shr 24 and 0xFF).toByte()
                rtpPacket[5] = (timestamp shr 16 and 0xFF).toByte()
                rtpPacket[6] = (timestamp shr 8 and 0xFF).toByte()
                rtpPacket[7] = (timestamp and 0xFF).toByte()

                if (isMuted) {
                    // Send silence when muted
                    System.arraycopy(silencePayload, 0, rtpPacket, RTP_HEADER_SIZE, PCMU_PAYLOAD_SIZE)
                } else {
                    for (i in 0 until read) {
                        rtpPacket[RTP_HEADER_SIZE + i] = when (payloadType) {
                            8 -> linearToAlaw(pcmBuffer[i].toInt())
                            else -> linearToUlaw(pcmBuffer[i].toInt())
                        }
                    }
                    val silenceByte = if (payloadType == 8) 0xD5.toByte() else 0xFF.toByte()
                    for (i in read until PCMU_PAYLOAD_SIZE) {
                        rtpPacket[RTP_HEADER_SIZE + i] = silenceByte
                    }
                }

                val packet = DatagramPacket(rtpPacket, RTP_PACKET_SIZE, remoteAddr, remotePort)
                socket?.send(packet)

                sequenceNumber++
                timestamp += SAMPLES_PER_PACKET
            }
        } catch (e: Exception) {
            if (running.get()) {
                Log.e(TAG, "Error in send loop", e)
            }
        }
        Log.d(TAG, "Sender stopped")
    }

    // -----------------------------------------------------------------------
    // Receive loop - receives RTP packets, decodes PCMU, plays via AudioTrack
    // -----------------------------------------------------------------------

    private fun receiveLoop() {
        try {
            val recvBuf = ByteArray(1024) // Generous buffer for incoming RTP
            val pcmBuffer = ShortArray(SAMPLES_PER_PACKET)

            Log.d(TAG, "Receiver started on port $localPort")

            while (running.get()) {
                val packet = DatagramPacket(recvBuf, recvBuf.size)
                try {
                    socket?.receive(packet)
                } catch (e: Exception) {
                    if (running.get()) {
                        Log.e(TAG, "Error receiving packet", e)
                    }
                    continue
                }

                if (packet.length <= RTP_HEADER_SIZE) continue

                val pt = recvBuf[1].toInt() and 0x7F
                val payloadLength = packet.length - RTP_HEADER_SIZE
                val samplesToPlay = minOf(payloadLength, SAMPLES_PER_PACKET)

                for (i in 0 until samplesToPlay) {
                    pcmBuffer[i] = when (pt) {
                        8 -> alawToLinear(recvBuf[RTP_HEADER_SIZE + i])
                        else -> ulawToLinear(recvBuf[RTP_HEADER_SIZE + i])
                    }
                }

                audioTrack?.write(pcmBuffer, 0, samplesToPlay)
            }
        } catch (e: Exception) {
            if (running.get()) {
                Log.e(TAG, "Error in receive loop", e)
            }
        }
        Log.d(TAG, "Receiver stopped")
    }

    // -----------------------------------------------------------------------
    // G.711 μ-law codec (ITU-T standard)
    // -----------------------------------------------------------------------

    /**
     * Encodes a PCM 16-bit linear sample to G.711 μ-law.
     */
    fun linearToUlaw(sample: Int): Byte {
        var pcmVal = sample

        // Get the sign and magnitude
        val sign: Int
        if (pcmVal < 0) {
            pcmVal = -pcmVal
            sign = 0x80
        } else {
            sign = 0x00
        }

        // Clip the magnitude
        if (pcmVal > CLIP) pcmVal = CLIP
        pcmVal += BIAS

        // Find the exponent from the lookup table
        val exponent = expLut[(pcmVal shr 7) and 0xFF]

        // Extract the mantissa
        val mantissa = (pcmVal shr (exponent + 3)) and 0x0F

        // Compose the μ-law byte (complemented)
        val ulawByte = (sign or (exponent shl 4) or mantissa).inv() and 0xFF

        return ulawByte.toByte()
    }

    /**
     * Encodes a PCM 16-bit linear sample to G.711 A-law.
     */
    fun linearToAlaw(sample: Int): Byte {
        var pcmVal = sample
        val mask: Int
        if (pcmVal >= 0) {
            mask = 0xD5
        } else {
            mask = 0x55
            pcmVal = -pcmVal - 1
        }

        if (pcmVal > CLIP) pcmVal = CLIP

        val exponent = expLut[(pcmVal shr 7) and 0xFF]
        val mantissa = (pcmVal shr (exponent + 3)) and 0x0F
        return (mask or (exponent shl 4) or mantissa).toByte()
    }

    /**
     * Decodes a G.711 A-law byte to PCM 16-bit linear sample.
     */
    fun alawToLinear(alaw: Byte): Short {
        val alawVal = (alaw.toInt() and 0xFF) xor 0x55
        val sign = alawVal and 0x80
        val exponent = (alawVal shr 4) and 0x07
        val mantissa = alawVal and 0x0F

        var sample = if (exponent > 0) {
            ((mantissa shl 4) + 0x108) shl (exponent - 1)
        } else {
            (mantissa shl 4) + 8
        }

        if (sign != 0) sample = -sample
        return sample.toShort()
    }

    /**
     * Decodes a G.711 μ-law byte to PCM 16-bit linear sample.
     */
    fun ulawToLinear(ulaw: Byte): Short {
        // Complement the bits
        val ulawVal = (ulaw.toInt() and 0xFF).inv() and 0xFF

        val sign = ulawVal and 0x80
        val exponent = (ulawVal shr 4) and 0x07
        val mantissa = ulawVal and 0x0F

        var sample = ((mantissa shl 4) + BIAS) shl (exponent - 1)

        // Handle exponent 0 case
        if (exponent == 0) {
            sample = (mantissa shl 4) + 8 // Small values: (mantissa << 4) + half step
        } else {
            sample = ((mantissa shl 4) + BIAS) shl (exponent - 1)
        }

        // Apply sign
        if (sign != 0) sample = -sample

        return sample.toShort()
    }
}

package com.newapp.sip

import android.content.Context
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.Inet4Address
import java.net.InetAddress
import java.net.NetworkInterface
import java.security.MessageDigest
import java.util.concurrent.ArrayBlockingQueue
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.Executors
import java.util.concurrent.ScheduledFuture
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicInteger

object SipSession {
    const val VERSION = "6"

    private const val TAG = "SIP"
    private const val TIMEOUT_MS = 15000
    private const val DEFAULT_EXPIRES = 300

    private enum class Transport {
        UDP,
    }

    data class SipResponse(
        val statusCode: Int,
        val reasonPhrase: String,
        val headers: Map<String, List<String>>,
        val raw: String,
    )

    data class ActiveCall(
        val callId: String,
        val remoteNumber: String,
        val remoteDisplay: String,
        val fromTag: String,
        val toTag: String?,
        val direction: String,
        val inviteCseq: Int,
        val inviteRaw: String,
        val remoteIp: String = "127.0.0.1",
        val remotePort: Int = 4000,
    )

    data class SdpData(
        val remoteIp: String,
        val remotePort: Int,
        val payloadType: Int = 0,
    )

    private val executor = Executors.newSingleThreadExecutor()
    private val scheduler = Executors.newSingleThreadScheduledExecutor()
    private val running = AtomicBoolean(false)
    private val registered = AtomicBoolean(false)

    @Volatile private var reactContext: ReactApplicationContext? = null
    @Volatile private var appContext: Context? = null
    @Volatile private var socket: DatagramSocket? = null
    @Volatile private var listenerThread: Thread? = null
    @Volatile private var refreshTask: ScheduledFuture<*>? = null

    @Volatile private var username = ""
    @Volatile private var password = ""
    @Volatile private var host = ""
    @Volatile private var port = 5060
    @Volatile private var sipUri = ""
    @Volatile private var fromUri = ""
    @Volatile private var localIp = ""
    @Volatile private var localPort = 0
    @Volatile private var registerCallId = ""
    @Volatile private var registerFromTag = ""
    @Volatile private var registerExpires = DEFAULT_EXPIRES
    private val registerCseq = AtomicInteger(1)

    @Volatile private var activeCall: ActiveCall? = null
    @Volatile private var incomingCallAddress: InetAddress? = null
    @Volatile private var incomingCallPort: Int = 0
    private val responseWaiters = ConcurrentHashMap<String, ArrayBlockingQueue<SipResponse>>()

    private fun responseKey(callId: String, cseq: Int, method: String): String =
        "$callId:$cseq:${method.uppercase()}"

    private fun awaitFinalResponse(callId: String, cseq: Int, method: String): SipResponse {
        val key = responseKey(callId, cseq, method)
        val queue = ArrayBlockingQueue<SipResponse>(4)
        responseWaiters[key] = queue

        try {
            val deadline = System.currentTimeMillis() + TIMEOUT_MS
            while (System.currentTimeMillis() < deadline) {
                val remaining = deadline - System.currentTimeMillis()
                val response = queue.poll(remaining, TimeUnit.MILLISECONDS)
                    ?: throw IllegalStateException("No valid SIP response for $method")

                if (response.statusCode in 100..199) {
                    if (method == "INVITE" && response.statusCode in listOf(180, 183)) {
                        activeCall?.let { call ->
                            emitCallState("ringing", call.callId, call.remoteNumber)
                        }
                    }
                    Log.d(TAG, "Received ${response.statusCode} ${response.reasonPhrase}, waiting for final response...")
                    continue
                }

                return response
            }

            throw IllegalStateException("Timed out waiting for SIP $method response")
        } finally {
            responseWaiters.remove(key)
        }
    }

    private fun routeResponse(raw: String) {
        val response = parseResponse(raw) ?: return
        val callId = response.headers["call-id"]?.firstOrNull() ?: return
        val cseqHeader = response.headers["cseq"]?.firstOrNull() ?: return
        val cseq = cseqHeader.substringBefore(" ").trim()
        val method = cseqHeader.substringAfter(" ").trim()
        val key = responseKey(callId, cseq.toIntOrNull() ?: -1, method)
        responseWaiters[key]?.offer(response)
    }

    fun setReactContext(context: ReactApplicationContext?) {
        reactContext = context
        appContext = context?.applicationContext
    }

    fun register(usernameInput: String, passwordInput: String, server: String, portInput: Int): String {
        stopInternal(sendUnregister = false)

        username = usernameInput.trim()
        password = passwordInput
        host = normalizeHost(server)
        port = portInput
        sipUri = buildSipUri(host, port)
        fromUri = "sip:$username@$host"

        val errors = mutableListOf<String>()
        val sipUris = listOf("sip:$username@$host", sipUri).distinct()

        for (uri in sipUris) {
            try {
                Log.i(TAG, "Starting persistent UDP registration $uri -> $host:$port (v$VERSION)")
                return startPersistentRegistration(uri)
            } catch (error: Exception) {
                val message = error.message ?: error.javaClass.simpleName
                errors.add("UDP[$uri]: $message")
                Log.w(TAG, "UDP registration failed for $uri: $message", error)
                stopInternal(sendUnregister = false)
            }
        }

        throw IllegalStateException(
            "Could not register with SIP server. Attempts: ${errors.joinToString(" | ")}"
        )
    }

    fun unregister() {
        executor.execute {
            stopInternal(sendUnregister = true)
        }
    }

    fun makeCall(destination: String): String {
        val trimmedDestination = destination.trim()
        if (trimmedDestination.isEmpty()) {
            throw IllegalStateException("Destination number is required.")
        }
        if (!registered.get()) {
            throw IllegalStateException("Not registered to SIP server. Please login again.")
        }

        val currentSocket = socket ?: throw IllegalStateException("SIP session is not active.")
        val toUri = if (port == 5060) {
            "sip:$trimmedDestination@$host"
        } else {
            "sip:$trimmedDestination@$host:$port"
        }

        return inviteOverUdp(
            socket = currentSocket,
            toUri = toUri,
            destination = trimmedDestination,
        )
    }

    fun hangupCall() {
        executor.execute {
            val call = activeCall ?: return@execute
            val currentSocket = socket ?: return@execute
            try {
                sendBye(currentSocket, call)
                RtpAudioManager.stop()
                RingtoneHelper.stop()
                emitCallState("ended", call.callId, call.remoteNumber)
            } catch (error: Exception) {
                Log.w(TAG, "Failed to send BYE", error)
            } finally {
                activeCall = null
            }
        }
    }

    fun declineIncomingCall() {
        executor.execute {
            val call = activeCall ?: return@execute
            val currentSocket = socket ?: return@execute
            try {
                sendResponse(currentSocket, call.inviteRaw, 603, "Decline")
                RtpAudioManager.stop()
                RingtoneHelper.stop()
                emitCallState("ended", call.callId, call.remoteNumber)
            } catch (error: Exception) {
                Log.w(TAG, "Failed to decline call", error)
            } finally {
                activeCall = null
            }
        }
    }

    fun answerIncomingCall(): String {
        val call = activeCall ?: throw IllegalStateException("No incoming call to answer.")
        val currentSocket = socket ?: throw IllegalStateException("SIP session is not active.")

        RingtoneHelper.stop()
        val offerBody = extractMessageBody(call.inviteRaw)
        val offeredPts = parseOfferedPayloadTypes(offerBody)
        val selectedPt = offeredPts.firstOrNull { it == 0 || it == 8 } ?: 0
        RtpAudioManager.prepare()
        RtpAudioManager.setPayloadType(selectedPt)
        sendInviteOk(currentSocket, call)
        RtpAudioManager.start(appContext ?: throw IllegalStateException("Context not set"), call.remoteIp, call.remotePort)
        emitCallState("connected", call.callId, call.remoteNumber)
        return "Call answered"
    }

    private fun startPersistentRegistration(requestUri: String): String {
        val udpSocket = DatagramSocket()
        udpSocket.soTimeout = TIMEOUT_MS
        localIp = resolveLocalIp(host, port, udpSocket)
        localPort = udpSocket.localPort
        registerCallId = "${System.currentTimeMillis()}@$localIp"
        registerFromTag = randomHex(8)
        registerCseq.set(1)

        sendRegister(
            socket = udpSocket,
            requestUri = requestUri,
            cseq = registerCseq.getAndIncrement(),
            authorization = null,
            authStatusCode = null,
        )

        var response = readFinalUdpResponse(udpSocket)
        Log.d(TAG, "UDP initial REGISTER response: ${response.statusCode} ${response.reasonPhrase}")

        if (response.statusCode == 401 || response.statusCode == 407) {
            response = sendAuthenticatedRegister(
                socket = udpSocket,
                requestUri = requestUri,
                challengeResponse = response,
            )
            Log.d(TAG, "UDP authenticated REGISTER response: ${response.statusCode} ${response.reasonPhrase}")
        }

        if (response.statusCode != 200) {
            udpSocket.close()
            throw IllegalStateException(
                "Registration failed with SIP ${response.statusCode} ${response.reasonPhrase}".trim()
            )
        }

        registerExpires = response.headers["expires"]?.firstOrNull()?.toIntOrNull()
            ?: response.headers["contact"]?.firstOrNull()
                ?.substringAfter("expires=", DEFAULT_EXPIRES.toString())
                ?.substringBefore(";")
                ?.trim()
                ?.toIntOrNull()
            ?: DEFAULT_EXPIRES

        socket = udpSocket
        running.set(true)
        registered.set(true)
        startListener(udpSocket)
        scheduleRefresh(requestUri)
        emitRegistrationState("registered", "Successfully registered to SIP server")

        return "Successfully registered to SIP server"
    }

    private fun scheduleRefresh(requestUri: String) {
        refreshTask?.cancel(false)
        val refreshSeconds = (registerExpires * 0.8).toLong().coerceAtLeast(30)
        refreshTask = scheduler.scheduleAtFixedRate({
            executor.execute {
                if (!running.get()) return@execute
                val currentSocket = socket ?: return@execute
                try {
                    Log.d(TAG, "Refreshing SIP registration")
                    val cseq = registerCseq.getAndIncrement()
                    sendRegister(
                        socket = currentSocket,
                        requestUri = requestUri,
                        cseq = cseq,
                        authorization = null,
                        authStatusCode = null,
                    )
                    var response = awaitFinalResponse(registerCallId, cseq, "REGISTER")
                    if (response.statusCode == 401 || response.statusCode == 407) {
                        response = sendAuthenticatedRegister(
                            socket = currentSocket,
                            requestUri = requestUri,
                            challengeResponse = response,
                        )
                    }
                    if (response.statusCode == 200) {
                        registered.set(true)
                        emitRegistrationState("registered", "Registration refreshed")
                    } else {
                        Log.w(TAG, "Registration refresh failed: ${response.statusCode}")
                    }
                } catch (error: Exception) {
                    Log.w(TAG, "Registration refresh error", error)
                }
            }
        }, refreshSeconds, refreshSeconds, TimeUnit.SECONDS)
    }

    private fun startListener(udpSocket: DatagramSocket) {
        listenerThread = Thread {
            val buffer = ByteArray(8192)
            while (running.get()) {
                try {
                    val packet = DatagramPacket(buffer, buffer.size)
                    udpSocket.soTimeout = 5000
                    udpSocket.receive(packet)
                    val raw = String(packet.data, 0, packet.length, Charsets.UTF_8)
                    dispatchPacket(raw, packet.address, packet.port)
                } catch (_: java.net.SocketTimeoutException) {
                    // Keep listener alive while waiting for packets.
                } catch (error: Exception) {
                    if (running.get()) {
                        Log.w(TAG, "Listener error", error)
                    }
                }
            }
        }.apply {
            name = "SipSessionListener"
            isDaemon = true
            start()
        }
    }

    private fun dispatchPacket(raw: String, sourceAddress: InetAddress?, sourcePort: Int) {
        val firstLine = raw.lineSequence().firstOrNull()?.trim().orEmpty()
        Log.d(TAG, "Incoming SIP: ${preview(firstLine)}")

        if (firstLine.startsWith("SIP/2.0", ignoreCase = true)) {
            routeResponse(raw)
            return
        }

        when {
            firstLine.startsWith("OPTIONS ", ignoreCase = true) -> {
                val currentSocket = socket ?: return
                sendResponse(currentSocket, raw, 200, "OK")
            }
            firstLine.startsWith("INVITE ", ignoreCase = true) -> {
                handleIncomingInvite(raw, sourceAddress, sourcePort)
            }
            firstLine.startsWith("BYE ", ignoreCase = true) -> {
                val currentSocket = socket ?: return
                sendResponse(currentSocket, raw, 200, "OK")
                activeCall?.let { call ->
                    RtpAudioManager.stop()
                    RingtoneHelper.stop()
                    emitCallState("ended", call.callId, call.remoteNumber)
                    activeCall = null
                }
            }
            firstLine.startsWith("CANCEL ", ignoreCase = true) -> {
                val currentSocket = socket ?: return
                sendResponse(currentSocket, raw, 200, "OK")
            }
        }
    }

    private fun handleIncomingInvite(raw: String, sourceAddress: InetAddress?, sourcePort: Int) {
        val parsed = parseRequest(raw) ?: return
        val fromHeader = parsed.headers["from"]?.firstOrNull().orEmpty()
        val toHeader = parsed.headers["to"]?.firstOrNull().orEmpty()
        val callId = parsed.headers["call-id"]?.firstOrNull().orEmpty()
        val cseqHeader = parsed.headers["cseq"]?.firstOrNull().orEmpty()
        val fromTag = fromHeader.substringAfter("tag=", "").substringBefore(";").trim()
        val remoteNumber = extractSipUser(fromHeader) ?: "Unknown"
        val remoteDisplay = extractDisplayName(fromHeader) ?: remoteNumber

        val sdp = parseSdp(extractMessageBody(raw))
        val remoteIp = sdp.remoteIp
        val remotePort = sdp.remotePort

        activeCall = ActiveCall(
            callId = callId,
            remoteNumber = remoteNumber,
            remoteDisplay = remoteDisplay,
            fromTag = fromTag,
            toTag = null,
            direction = "incoming",
            inviteCseq = cseqHeader.substringBefore(" ").trim().toIntOrNull() ?: 1,
            inviteRaw = raw,
            remoteIp = remoteIp,
            remotePort = remotePort,
        )

        incomingCallAddress = sourceAddress
        incomingCallPort = sourcePort ?: 5060

        val currentSocket = socket ?: return
        sendResponse(currentSocket, raw, 180, "Ringing")
        appContext?.let { RingtoneHelper.start(it) }
        emitIncomingCall(callId, remoteNumber, remoteDisplay)
        emitCallState("ringing", callId, remoteNumber)
    }

    private fun inviteOverUdp(
        socket: DatagramSocket,
        toUri: String,
        destination: String,
    ): String {
        RtpAudioManager.prepare()
        val callId = "${System.currentTimeMillis()}@$localIp"
        val fromTag = randomHex(8)

        sendInvite(
            socket = socket,
            toUri = toUri,
            callId = callId,
            fromTag = fromTag,
            cseq = 1,
            authorization = null,
            authStatusCode = null,
        )

        activeCall = ActiveCall(
            callId = callId,
            remoteNumber = destination,
            remoteDisplay = destination,
            fromTag = fromTag,
            toTag = null,
            direction = "outgoing",
            inviteCseq = 1,
            inviteRaw = "",
            remoteIp = "127.0.0.1",
            remotePort = 4000,
        )

        emitCallState("connecting", callId, destination)

        var response = awaitFinalResponse(callId, 1, "INVITE")
        Log.d(TAG, "UDP initial INVITE response: ${response.statusCode} ${response.reasonPhrase}")

        if (response.statusCode == 401 || response.statusCode == 407) {
            response = sendAuthenticatedInvite(
                socket = socket,
                toUri = toUri,
                callId = callId,
                fromTag = fromTag,
                cseq = 2,
                challengeResponse = response,
            )
            Log.d(TAG, "UDP authenticated INVITE response: ${response.statusCode} ${response.reasonPhrase}")

            if (response.statusCode == 401 || response.statusCode == 407) {
                activeCall = null
                emitCallState("failed", callId, destination)
                throw IllegalStateException("Authentication failed for INVITE: ${response.statusCode}")
            }
        }

        return when (response.statusCode) {
            200 -> {
                val sdp = parseSdp(extractMessageBody(response.raw))
                val toHeader = response.headers["to"]?.firstOrNull().orEmpty()
                val toTag = toHeader.substringAfter("tag=", "").substringBefore(";").trim()
                activeCall = activeCall?.copy(
                    remoteIp = sdp.remoteIp,
                    remotePort = sdp.remotePort,
                    toTag = toTag.ifEmpty { null },
                )
                val ackTarget = response.headers["contact"]?.firstOrNull()?.let { extractSipUri(it) } ?: toUri
                sendAck(socket, callId, fromTag, response, ackTarget)
                RtpAudioManager.setPayloadType(sdp.payloadType)
                appContext?.let { RtpAudioManager.start(it, sdp.remoteIp, sdp.remotePort) }
                if (RtpAudioManager.isRunning()) {
                    emitCallState("connected", callId, destination)
                    "Call connected"
                } else {
                    emitCallState("failed", callId, destination)
                    throw IllegalStateException("Failed to start RTP audio stream")
                }
            }
            603, 486 -> {
                RtpAudioManager.stop()
                RingtoneHelper.stop()
                activeCall = null
                emitCallState("declined", callId, destination)
                throw IllegalStateException("Call declined by remote party")
            }
            else -> {
                activeCall = null
                emitCallState("failed", callId, destination)
                throw IllegalStateException(
                    "Call failed with SIP ${response.statusCode} ${response.reasonPhrase}".trim()
                )
            }
        }
    }

    private fun sendAuthenticatedRegister(
        socket: DatagramSocket,
        requestUri: String,
        challengeResponse: SipResponse,
    ): SipResponse {
        val challengeHeader = if (challengeResponse.statusCode == 401) {
            "www-authenticate"
        } else {
            "proxy-authenticate"
        }
        val challenge = challengeResponse.headers[challengeHeader]?.firstOrNull()
            ?: throw IllegalStateException("Missing authentication challenge from SIP server")

        val authorization = buildDigestAuth(
            challenge = challenge,
            username = username,
            password = password,
            method = "REGISTER",
            uri = requestUri,
        )

        val cseq = registerCseq.getAndIncrement()
        sendRegister(
            socket = socket,
            requestUri = requestUri,
            cseq = cseq,
            authorization = authorization,
            authStatusCode = challengeResponse.statusCode,
        )

        return if (running.get()) {
            awaitFinalResponse(registerCallId, cseq, "REGISTER")
        } else {
            readFinalUdpResponse(socket)
        }
    }

    private fun sendAuthenticatedInvite(
        socket: DatagramSocket,
        toUri: String,
        callId: String,
        fromTag: String,
        cseq: Int,
        challengeResponse: SipResponse,
    ): SipResponse {
        val challengeHeader = if (challengeResponse.statusCode == 401) {
            "www-authenticate"
        } else {
            "proxy-authenticate"
        }
        val challenge = challengeResponse.headers[challengeHeader]?.firstOrNull()
            ?: throw IllegalStateException("Missing authentication challenge from SIP server")

        val toHeader = challengeResponse.headers["to"]?.firstOrNull() ?: "<$toUri>"
        val toTag = toHeader.substringAfter("tag=", "").substringBefore(";").trim()
        val toWithTag = if (toTag.isNotEmpty()) {
            if (toHeader.contains("tag=")) toHeader else "$toHeader;tag=$toTag"
        } else {
            toHeader
        }

        val authorization = buildDigestAuth(
            challenge = challenge,
            username = username,
            password = password,
            method = "INVITE",
            uri = toUri,
        )

        sendInvite(
            socket = socket,
            toUri = toUri,
            callId = callId,
            fromTag = fromTag,
            cseq = cseq,
            authorization = authorization,
            authStatusCode = challengeResponse.statusCode,
            toHeader = toWithTag,
        )

        return awaitFinalResponse(callId, cseq, "INVITE")
    }

    private fun sendRegister(
        socket: DatagramSocket,
        requestUri: String,
        cseq: Int,
        authorization: String?,
        authStatusCode: Int?,
        expiresOverride: Int? = null,
    ) {
        val expiresValue = expiresOverride ?: registerExpires
        val branch = "z9hG4bK${randomHex(12)}"
        val message = buildString {
            append("REGISTER $requestUri SIP/2.0\r\n")
            append("Via: SIP/2.0/UDP $localIp:$localPort;branch=$branch;rport\r\n")
            append("Max-Forwards: 70\r\n")
            append("To: \"$username\" <$fromUri>\r\n")
            append("From: \"$username\" <$fromUri>;tag=$registerFromTag\r\n")
            append("Call-ID: $registerCallId\r\n")
            append("CSeq: $cseq REGISTER\r\n")
            append("Contact: <sip:$username@$localIp:$localPort;transport=udp>;expires=$expiresValue\r\n")
            append("Expires: $expiresValue\r\n")
            append("Allow: INVITE, ACK, CANCEL, BYE, NOTIFY, REFER, MESSAGE, OPTIONS, INFO, SUBSCRIBE\r\n")
            append("Supported: outbound, path\r\n")
            append("User-Agent: newapp/1.0\r\n")
            if (authorization != null) {
                val authHeader = if (authStatusCode == 407) "Proxy-Authorization" else "Authorization"
                append("$authHeader: $authorization\r\n")
            }
            append("Content-Length: 0\r\n")
            append("\r\n")
        }

        Log.d(TAG, "Sending UDP REGISTER (CSeq $cseq) to $host:$port")
        sendUdp(socket, message, host, port)
    }

    private fun sendInvite(
        socket: DatagramSocket,
        toUri: String,
        callId: String,
        fromTag: String,
        cseq: Int,
        authorization: String?,
        authStatusCode: Int?,
        toHeader: String? = null,
    ) {
        val branch = "z9hG4bK${randomHex(12)}"
        val toHeaderValue = toHeader ?: "<$toUri>"
        val sdp = buildAudioSdp()
        val contentLength = sdp.toByteArray(Charsets.UTF_8).size

        val message = buildString {
            append("INVITE $toUri SIP/2.0\r\n")
            append("Via: SIP/2.0/UDP $localIp:$localPort;branch=$branch;rport\r\n")
            append("Max-Forwards: 70\r\n")
            append("To: $toHeaderValue\r\n")
            append("From: \"$username\" <$fromUri>;tag=$fromTag\r\n")
            append("Call-ID: $callId\r\n")
            append("CSeq: $cseq INVITE\r\n")
            append("Contact: <sip:$username@$localIp:$localPort;transport=udp>\r\n")
            append("Allow: INVITE, ACK, CANCEL, BYE, NOTIFY, REFER, MESSAGE, OPTIONS, INFO, SUBSCRIBE\r\n")
            append("Content-Type: application/sdp\r\n")
            append("User-Agent: newapp/1.0\r\n")
            if (authorization != null) {
                val authHeader = if (authStatusCode == 407) "Proxy-Authorization" else "Authorization"
                append("$authHeader: $authorization\r\n")
            }
            append("Content-Length: $contentLength\r\n")
            append("\r\n")
            append(sdp)
        }

        Log.d(TAG, "Sending UDP INVITE (CSeq $cseq) to $host:$port")
        sendUdp(socket, message, host, port)
    }

    private fun sendBye(socket: DatagramSocket, call: ActiveCall) {
        val branch = "z9hG4bK${randomHex(12)}"
        val toUri = "sip:${call.remoteNumber}@${call.remoteIp}"
        val message = buildString {
            append("BYE $toUri SIP/2.0\r\n")
            append("Via: SIP/2.0/UDP $localIp:$localPort;branch=$branch;rport\r\n")
            append("Max-Forwards: 70\r\n")
            append("To: <${toUri}>${if (!call.toTag.isNullOrBlank()) ";tag=${call.toTag}" else ""}\r\n")
            append("From: \"$username\" <$fromUri>;tag=${call.fromTag}\r\n")
            append("Call-ID: ${call.callId}\r\n")
            append("CSeq: 1 BYE\r\n")
            append("Content-Length: 0\r\n")
            append("\r\n")
        }
        sendUdp(socket, message, host, port)
    }

    private fun sendInviteOk(socket: DatagramSocket, call: ActiveCall) {
        val toTag = randomHex(8)
        activeCall = call.copy(toTag = toTag)
        sendResponse(socket, call.inviteRaw, 200, "OK", toTag)
    }

    private fun sendAck(
        socket: DatagramSocket,
        callId: String,
        fromTag: String,
        response: SipResponse,
        requestUri: String,
    ) {
        val branch = "z9hG4bK${randomHex(12)}"
        val toHeader = response.headers["to"]?.firstOrNull().orEmpty()
        val toTag = toHeader.substringAfter("tag=", "").substringBefore(";").trim()
        val toHeaderValue = if (toTag.isNotEmpty() && !toHeader.contains("tag=")) {
            "$toHeader;tag=$toTag"
        } else {
            toHeader
        }

        val message = buildString {
            append("ACK $requestUri SIP/2.0\r\n")
            append("Via: SIP/2.0/UDP $localIp:$localPort;branch=$branch;rport\r\n")
            append("Max-Forwards: 70\r\n")
            append("To: $toHeaderValue\r\n")
            append("From: \"$username\" <$fromUri>;tag=$fromTag\r\n")
            append("Call-ID: $callId\r\n")
            append("CSeq: 1 ACK\r\n")
            append("Content-Length: 0\r\n")
            append("\r\n")
        }
        sendUdp(socket, message, host, port)
        Log.d(TAG, "Sent ACK for call $callId to $host:$port")
    }

    private fun sendResponse(
        socket: DatagramSocket,
        requestRaw: String,
        statusCode: Int,
        reasonPhrase: String,
        toTag: String? = null,
    ) {
        val parsed = parseRequest(requestRaw) ?: return
        val via = parsed.headers["via"]?.joinToString("\r\nVia: ")?.let { "Via: $it" }.orEmpty()
        val fromHeader = parsed.headers["from"]?.firstOrNull().orEmpty()
        val toHeader = parsed.headers["to"]?.firstOrNull().orEmpty()
        val callId = parsed.headers["call-id"]?.firstOrNull().orEmpty()
        val cseq = parsed.headers["cseq"]?.firstOrNull().orEmpty()
        val requestUri = parsed.requestUri ?: sipUri
        val resolvedTo = if (!toTag.isNullOrBlank() && !toHeader.contains("tag=")) {
            "$toHeader;tag=$toTag"
        } else {
            toHeader
        }

        val message = buildString {
            append("SIP/2.0 $statusCode $reasonPhrase\r\n")
            append("$via\r\n")
            append("From: $fromHeader\r\n")
            append("To: $resolvedTo\r\n")
            append("Call-ID: $callId\r\n")
            append("CSeq: $cseq\r\n")
            append("User-Agent: newapp/1.0\r\n")
            if (statusCode == 200 && requestRaw.startsWith("INVITE", ignoreCase = true)) {
                val offerBody = extractMessageBody(requestRaw)
                val offeredPts = parseOfferedPayloadTypes(offerBody)
                val selectedPt = offeredPts.firstOrNull { it == 0 || it == 8 } ?: 0
                RtpAudioManager.setPayloadType(selectedPt)
                val sdp = buildAnswerSdp(selectedPt)
                append("Content-Type: application/sdp\r\n")
                append("Content-Length: ${sdp.toByteArray(Charsets.UTF_8).size}\r\n")
                append("\r\n")
                append(sdp)
            } else {
                append("Content-Length: 0\r\n")
                append("\r\n")
            }
        }

        val destAddress = if (requestRaw.startsWith("INVITE", ignoreCase = true) && incomingCallAddress != null) {
            incomingCallAddress!!
        } else {
            InetAddress.getByName(host)
        }
        val destPort = if (requestRaw.startsWith("INVITE", ignoreCase = true) && incomingCallPort > 0) {
            incomingCallPort
        } else {
            port
        }
        sendUdp(socket, message, destAddress, destPort)
    }

    private fun stopInternal(sendUnregister: Boolean) {
        running.set(false)
        registered.set(false)
        refreshTask?.cancel(false)
        refreshTask = null

        val currentSocket = socket
        if (sendUnregister && currentSocket != null && username.isNotEmpty()) {
            try {
                sendRegister(
                    socket = currentSocket,
                    requestUri = sipUri,
                    cseq = registerCseq.getAndIncrement(),
                    authorization = null,
                    authStatusCode = null,
                    expiresOverride = 0,
                )
            } catch (error: Exception) {
                Log.w(TAG, "Failed to send unregister", error)
            }
        }

        try {
            currentSocket?.close()
        } catch (_: Exception) {
        }

        socket = null
        listenerThread?.interrupt()
        listenerThread = null
        activeCall = null
        responseWaiters.clear()
        RtpAudioManager.stop()
        RingtoneHelper.stop()
        emitRegistrationState("unregistered", "SIP session stopped")
    }

    private data class ParsedRequest(
        val requestUri: String?,
        val headers: Map<String, List<String>>,
    )

    private fun parseRequest(raw: String): ParsedRequest? {
        val cleaned = raw.replace("\uFEFF", "").trim()
        if (cleaned.isEmpty()) return null

        val lines = cleaned.split("\r\n", "\n")
        val firstLine = lines.firstOrNull()?.trim().orEmpty()
        val requestUri = Regex("""^\w+\s+(\S+)\s+SIP/2\.0$""", RegexOption.IGNORE_CASE)
            .find(firstLine)
            ?.groupValues
            ?.get(1)

        val headers = mutableMapOf<String, MutableList<String>>()
        for (index in 1 until lines.size) {
            val line = lines[index]
            if (line.isEmpty()) break
            val colonIndex = line.indexOf(':')
            if (colonIndex <= 0) continue
            val name = line.substring(0, colonIndex).trim().lowercase()
            val value = line.substring(colonIndex + 1).trim()
            headers.getOrPut(name) { mutableListOf() }.add(value)
        }

        return ParsedRequest(requestUri, headers)
    }

    private fun readFinalUdpResponse(socket: DatagramSocket): SipResponse {
        val previousTimeout = socket.soTimeout
        socket.soTimeout = TIMEOUT_MS
        val deadline = System.currentTimeMillis() + TIMEOUT_MS
        var lastPreview = "none"

        try {
            while (System.currentTimeMillis() < deadline) {
                val remaining = (deadline - System.currentTimeMillis()).toInt().coerceAtLeast(1000)
                socket.soTimeout = remaining
                val raw = receiveRawUdp(socket)
                lastPreview = preview(raw)
                val response = parseResponse(raw) ?: continue
                if (response.statusCode == 100) {
                    Log.d(TAG, "Received 100 Trying, waiting for final response...")
                    continue
                }
                return response
            }
        } finally {
            socket.soTimeout = previousTimeout
        }

        throw IllegalStateException("No valid SIP response over UDP. Last packet: $lastPreview")
    }

    private fun sendUdp(socket: DatagramSocket, message: String, host: String, port: Int) {
        val data = message.toByteArray(Charsets.UTF_8)
        val address = InetAddress.getByName(host)
        socket.send(DatagramPacket(data, data.size, address, port))
    }

    private fun sendUdp(socket: DatagramSocket, message: String, address: InetAddress, port: Int) {
        val data = message.toByteArray(Charsets.UTF_8)
        socket.send(DatagramPacket(data, data.size, address, port))
    }

    private fun receiveRawUdp(socket: DatagramSocket): String {
        val buffer = ByteArray(8192)
        val packet = DatagramPacket(buffer, buffer.size)
        socket.receive(packet)
        return String(packet.data, 0, packet.length, Charsets.UTF_8)
    }

    private fun parseResponse(raw: String): SipResponse? {
        val cleaned = raw.replace("\uFEFF", "").trim()
        if (cleaned.isEmpty()) return null

        val statusMatch = Regex("""(?m)^SIP/2\.0\s+(\d{3})\s*(.*)$""").find(cleaned) ?: return null
        val statusCode = statusMatch.groupValues[1].toInt()
        val reasonPhrase = statusMatch.groupValues[2].trim()
        val contentFromStatus = cleaned.substring(statusMatch.range.first)
        val lines = contentFromStatus.split("\r\n", "\n")

        val headers = mutableMapOf<String, MutableList<String>>()
        for (index in 1 until lines.size) {
            val line = lines[index]
            if (line.isEmpty()) break
            val colonIndex = line.indexOf(':')
            if (colonIndex <= 0) continue
            val name = line.substring(0, colonIndex).trim().lowercase()
            val value = line.substring(colonIndex + 1).trim()
            headers.getOrPut(name) { mutableListOf() }.add(value)
        }

        return SipResponse(statusCode, reasonPhrase, headers, cleaned)
    }

    private fun parseDigestChallenge(header: String): Map<String, String> {
        val params = mutableMapOf<String, String>()
        val digestPart = header.substringAfter("Digest", header).trim()
        Regex("""(\w+)=("([^"]+)"|([^,\s]+))""").findAll(digestPart).forEach { match ->
            val key = match.groupValues[1].lowercase()
            val value = match.groupValues[3].ifEmpty { match.groupValues[4] }
            params[key] = value
        }
        return params
    }

    private fun buildDigestAuth(
        challenge: String,
        username: String,
        password: String,
        method: String,
        uri: String,
    ): String {
        val params = parseDigestChallenge(challenge)
        val realm = params["realm"] ?: throw IllegalStateException("Missing realm in SIP auth challenge")
        val nonce = params["nonce"] ?: throw IllegalStateException("Missing nonce in SIP auth challenge")
        val algorithm = params["algorithm"] ?: "MD5"
        val qop = params["qop"]?.split(",")?.firstOrNull()?.trim()?.removeSurrounding("\"")

        val ha1 = md5("$username:$realm:$password")
        val ha2 = md5("$method:$uri")

        return if (qop == "auth") {
            val nc = "00000001"
            val cnonce = randomHex(16)
            val response = md5("$ha1:$nonce:$nc:$cnonce:$qop:$ha2")
            """Digest username="$username", realm="$realm", nonce="$nonce", uri="$uri", response="$response", algorithm=$algorithm, qop=$qop, nc=$nc, cnonce="$cnonce""""
        } else {
            val response = md5("$ha1:$nonce:$ha2")
            """Digest username="$username", realm="$realm", nonce="$nonce", uri="$uri", response="$response""""
        }
    }

    private fun md5(input: String): String {
        val digest = MessageDigest.getInstance("MD5")
        val bytes = digest.digest(input.toByteArray(Charsets.UTF_8))
        return bytes.joinToString("") { byte -> "%02x".format(byte.toInt() and 0xff) }
    }

    private fun buildSipUri(host: String, port: Int): String {
        return if (port == 5060) "sip:$host" else "sip:$host:$port"
    }

    private fun normalizeHost(server: String): String =
        server.trim()
            .removePrefix("sip:")
            .substringBefore("/")
            .substringBefore(":")

    private fun resolveLocalIp(host: String, port: Int, socket: DatagramSocket): String {
        try {
            socket.connect(InetAddress.getByName(host), port)
            val connectedIp = socket.localAddress?.hostAddress
            if (!connectedIp.isNullOrBlank() && connectedIp != "0.0.0.0") {
                return connectedIp
            }
        } catch (error: Exception) {
            Log.w(TAG, "Unable to resolve routed local IP, falling back to interface scan", error)
        }

        return NetworkInterface.getNetworkInterfaces().toList()
            .flatMap { networkInterface -> networkInterface.inetAddresses.toList() }
            .firstOrNull { address -> !address.isLoopbackAddress && address is Inet4Address }
            ?.hostAddress
            ?: "127.0.0.1"
    }

    private fun extractSipUser(header: String): String? {
        val uriMatch = Regex("""<sip:([^@>]+)@""").find(header)
        return uriMatch?.groupValues?.get(1)
    }

    private fun extractDisplayName(header: String): String? {
        val match = Regex(""""([^"]+)"""").find(header)
        return match?.groupValues?.get(1)
    }

    private fun randomHex(length: Int): String {
        val chars = "0123456789abcdef"
        return (1..length)
            .map { chars[(Math.random() * chars.length).toInt()] }
            .joinToString("")
    }

    private fun preview(raw: String): String =
        raw.replace("\r", "\\r").replace("\n", "\\n").take(240)

    private fun emitRegistrationState(state: String, message: String) {
        val context = reactContext ?: return
        val params = Arguments.createMap().apply {
            putString("state", state)
            putString("message", message)
        }
        context
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("sipRegistrationState", params)
    }

    private fun emitIncomingCall(callId: String, remoteNumber: String, displayName: String) {
        val context = reactContext ?: return
        val params = Arguments.createMap().apply {
            putString("callId", callId)
            putString("remoteNumber", remoteNumber)
            putString("displayName", displayName)
        }
        context
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("sipIncomingCall", params)
    }

    private fun emitCallState(state: String, callId: String, remoteNumber: String) {
        val context = reactContext ?: return
        val params = Arguments.createMap().apply {
            putString("state", state)
            putString("callId", callId)
            putString("remoteNumber", remoteNumber)
        }
        context
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("sipCallState", params)
    }

    private fun buildAnswerSdp(payloadType: Int): String {
        val rtpPort = RtpAudioManager.prepare().takeIf { it > 0 } ?: 4000
        val codecName = if (payloadType == 8) "PCMA/8000" else "PCMU/8000"
        return buildString {
            append("v=0\r\n")
            append("o=- ${System.currentTimeMillis()} 1 IN IP4 $localIp\r\n")
            append("s=-\r\n")
            append("c=IN IP4 $localIp\r\n")
            append("t=0 0\r\n")
            append("m=audio $rtpPort RTP/AVP $payloadType\r\n")
            append("a=rtpmap:$payloadType $codecName\r\n")
            append("a=sendrecv\r\n")
            append("a=ptime:20\r\n")
        }
    }

    private fun parseOfferedPayloadTypes(sdpContent: String): List<Int> {
        val mLine = Regex("""m=audio\s+\d+\s+RTP/AVP\s+(.+)""").find(sdpContent)?.groupValues?.get(1)
            ?: return listOf(0)
        return mLine.trim().split(Regex("""\s+"""))
            .mapNotNull { it.toIntOrNull() }
    }

    private fun buildAudioSdp(): String {
        val rtpPort = RtpAudioManager.prepare().takeIf { it > 0 } ?: 4000
        return buildString {
            append("v=0\r\n")
            append("o=- ${System.currentTimeMillis()} 1 IN IP4 $localIp\r\n")
            append("s=-\r\n")
            append("c=IN IP4 $localIp\r\n")
            append("t=0 0\r\n")
            append("m=audio $rtpPort RTP/AVP 18 3 111 8 0\r\n")
            append("a=rtpmap:18 G729/8000\r\n")
            append("a=rtpmap:3 GSM/8000\r\n")
            append("a=rtpmap:111 opus/48000/2\r\n")
            append("a=rtpmap:8 PCMA/8000\r\n")
            append("a=rtpmap:0 PCMU/8000\r\n")
            append("a=sendrecv\r\n")
            append("a=ptime:20\r\n")
        }
    }

    private fun extractMessageBody(raw: String): String {
        val separator = when {
            raw.contains("\r\n\r\n") -> "\r\n\r\n"
            raw.contains("\n\n") -> "\n\n"
            else -> return ""
        }
        return raw.substringAfter(separator).trim()
    }

    private fun extractSipUri(headerValue: String): String? {
        val match = Regex("""<([^>]+)>""").find(headerValue)
        return match?.groupValues?.get(1)?.trim()
    }

    private fun parseSdp(sdpContent: String): SdpData {
        var remoteIp = "127.0.0.1"
        var remotePort = 4000
        var payloadType = 0

        if (sdpContent.isBlank()) {
            Log.w(TAG, "Empty SDP body, using defaults")
            return SdpData(remoteIp, remotePort, payloadType)
        }

        val cLineMatch = Regex("""c=IN IP4\s+(\S+)""").find(sdpContent)
        if (cLineMatch != null) {
            remoteIp = cLineMatch.groupValues[1]
        }

        val mLineMatch = Regex("""m=audio\s+(\d+)\s+RTP/AVP(?:\s+(\d+))?""").find(sdpContent)
        if (mLineMatch != null) {
            remotePort = mLineMatch.groupValues[1].toIntOrNull() ?: 4000
            payloadType = mLineMatch.groupValues[2].toIntOrNull() ?: 0
        }

        Log.d(TAG, "Parsed SDP: $remoteIp:$remotePort PT=$payloadType")
        return SdpData(remoteIp, remotePort, payloadType)
    }
}

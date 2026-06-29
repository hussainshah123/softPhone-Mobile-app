package com.newapp.sip

import android.util.Log
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.Inet4Address
import java.net.InetAddress
import java.net.InetSocketAddress
import java.net.NetworkInterface
import java.net.Socket
import java.security.MessageDigest
import java.util.concurrent.ThreadLocalRandom

object SipRegistrationClient {
    const val VERSION = "4"

    private const val TAG = "SIP"
    private const val TIMEOUT_MS = 15000

    private enum class Transport {
        TCP,
        UDP,
    }

    data class SipResponse(
        val statusCode: Int,
        val reasonPhrase: String,
        val headers: Map<String, List<String>>,
    )

    fun register(username: String, password: String, server: String, port: Int): String {
        val host = normalizeHost(server)
        val fromUri = "sip:$username@$host"
        val errors = mutableListOf<String>()

        val sipUris = listOf(
            "sip:$username@$host",
            buildSipUri(host, port),
        ).distinct()

        for (transport in Transport.values()) {
            for (sipUri in sipUris) {
                try {
                    Log.i(TAG, "Trying ${transport.name} REGISTER $sipUri -> $host:$port (client v$VERSION)")
                    return registerWithTransport(
                        username = username,
                        password = password,
                        host = host,
                        port = port,
                        sipUri = sipUri,
                        fromUri = fromUri,
                        transport = transport,
                    )
                } catch (error: Exception) {
                    val message = error.message ?: error.javaClass.simpleName
                    errors.add("${transport.name}[$sipUri]: $message")
                    Log.w(TAG, "${transport.name} registration failed for $sipUri: $message", error)
                }
            }
        }

        throw IllegalStateException(
            "Could not register with SIP server. Attempts: ${errors.joinToString(" | ")}"
        )
    }

    private fun registerWithTransport(
        username: String,
        password: String,
        host: String,
        port: Int,
        sipUri: String,
        fromUri: String,
        transport: Transport,
    ): String {
        return when (transport) {
            Transport.UDP -> registerOverUdp(username, password, host, port, sipUri, fromUri)
            Transport.TCP -> registerOverTcp(username, password, host, port, sipUri, fromUri)
        }
    }

    private fun registerOverUdp(
        username: String,
        password: String,
        host: String,
        port: Int,
        sipUri: String,
        fromUri: String,
    ): String {
        DatagramSocket().use { socket ->
            socket.soTimeout = TIMEOUT_MS
            val localIp = resolveLocalIp(host, port, socket)
            val localPort = socket.localPort
            val callId = "${System.currentTimeMillis()}@$localIp"
            val fromTag = randomHex(8)

            sendRegister(
                sendMessage = { message -> sendUdp(socket, message, host, port) },
                transport = Transport.UDP,
                username = username,
                sipUri = sipUri,
                fromUri = fromUri,
                localIp = localIp,
                localPort = localPort,
                callId = callId,
                fromTag = fromTag,
                cseq = 1,
                authorization = null,
                authStatusCode = null,
                host = host,
                port = port,
            )

            var response = readFinalUdpResponse(socket)
            Log.d(TAG, "UDP initial response: ${response.statusCode} ${response.reasonPhrase}")

            if (response.statusCode == 401 || response.statusCode == 407) {
                response = sendAuthenticatedRegister(
                    username = username,
                    password = password,
                    host = host,
                    port = port,
                    sipUri = sipUri,
                    fromUri = fromUri,
                    localIp = localIp,
                    localPort = localPort,
                    callId = callId,
                    fromTag = fromTag,
                    cseq = 2,
                    challengeResponse = response,
                    transport = Transport.UDP,
                    sendMessage = { message -> sendUdp(socket, message, host, port) },
                    readResponse = { readFinalUdpResponse(socket) },
                )
                Log.d(TAG, "UDP authenticated response: ${response.statusCode} ${response.reasonPhrase}")
            }

            return mapRegistrationResult(response)
        }
    }

    private fun registerOverTcp(
        username: String,
        password: String,
        host: String,
        port: Int,
        sipUri: String,
        fromUri: String,
    ): String {
        Socket().use { socket ->
            socket.connect(InetSocketAddress(host, port), TIMEOUT_MS)
            socket.soTimeout = TIMEOUT_MS
            socket.tcpNoDelay = true

            val localIp = socket.localAddress?.hostAddress ?: resolveLocalIp(host, port, null)
            val localPort = socket.localPort
            val callId = "${System.currentTimeMillis()}@$localIp"
            val fromTag = randomHex(8)
            val writer = socket.getOutputStream()
            val reader = BufferedReader(InputStreamReader(socket.getInputStream(), Charsets.UTF_8))

            sendRegister(
                sendMessage = { message -> sendTcp(writer, message) },
                transport = Transport.TCP,
                username = username,
                sipUri = sipUri,
                fromUri = fromUri,
                localIp = localIp,
                localPort = localPort,
                callId = callId,
                fromTag = fromTag,
                cseq = 1,
                authorization = null,
                authStatusCode = null,
                host = host,
                port = port,
            )

            var response = readFinalTcpResponse(reader)
            Log.d(TAG, "TCP initial response: ${response.statusCode} ${response.reasonPhrase}")

            if (response.statusCode == 401 || response.statusCode == 407) {
                response = sendAuthenticatedRegister(
                    username = username,
                    password = password,
                    host = host,
                    port = port,
                    sipUri = sipUri,
                    fromUri = fromUri,
                    localIp = localIp,
                    localPort = localPort,
                    callId = callId,
                    fromTag = fromTag,
                    cseq = 2,
                    challengeResponse = response,
                    transport = Transport.TCP,
                    sendMessage = { message -> sendTcp(writer, message) },
                    readResponse = { readFinalTcpResponse(reader) },
                )
                Log.d(TAG, "TCP authenticated response: ${response.statusCode} ${response.reasonPhrase}")
            }

            return mapRegistrationResult(response)
        }
    }

    private fun sendAuthenticatedRegister(
        username: String,
        password: String,
        host: String,
        port: Int,
        sipUri: String,
        fromUri: String,
        localIp: String,
        localPort: Int,
        callId: String,
        fromTag: String,
        cseq: Int,
        challengeResponse: SipResponse,
        transport: Transport,
        sendMessage: (String) -> Unit,
        readResponse: () -> SipResponse,
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
            uri = sipUri,
        )

        sendRegister(
            sendMessage = sendMessage,
            transport = transport,
            username = username,
            sipUri = sipUri,
            fromUri = fromUri,
            localIp = localIp,
            localPort = localPort,
            callId = callId,
            fromTag = fromTag,
            cseq = cseq,
            authorization = authorization,
            authStatusCode = challengeResponse.statusCode,
            host = host,
            port = port,
        )

        return readResponse()
    }

    private fun mapRegistrationResult(response: SipResponse): String {
        return when (response.statusCode) {
            200 -> "Successfully registered to SIP server"
            403 -> throw IllegalStateException("Registration rejected: invalid SIP credentials")
            404 -> throw IllegalStateException("Registration failed: SIP account not found on server")
            else -> throw IllegalStateException(
                "Registration failed with SIP ${response.statusCode} ${response.reasonPhrase}".trim()
            )
        }
    }

    private fun buildSipUri(host: String, port: Int): String {
        return if (port == 5060) {
            "sip:$host"
        } else {
            "sip:$host:$port"
        }
    }

    private fun normalizeHost(server: String): String =
        server.trim()
            .removePrefix("sip:")
            .substringBefore("/")
            .substringBefore(":")

    private fun resolveLocalIp(host: String, port: Int, socket: DatagramSocket?): String {
        try {
            if (socket != null) {
                socket.connect(InetAddress.getByName(host), port)
                val connectedIp = socket.localAddress?.hostAddress
                if (!connectedIp.isNullOrBlank() && connectedIp != "0.0.0.0") {
                    return connectedIp
                }
            } else {
                DatagramSocket().use { probe ->
                    probe.connect(InetAddress.getByName(host), port)
                    val connectedIp = probe.localAddress?.hostAddress
                    if (!connectedIp.isNullOrBlank() && connectedIp != "0.0.0.0") {
                        return connectedIp
                    }
                }
            }
        } catch (error: Exception) {
            Log.w(TAG, "Unable to resolve routed local IP, falling back to interface scan", error)
        }

        return getLocalIpAddress()
    }

    private fun getLocalIpAddress(): String {
        return try {
            NetworkInterface.getNetworkInterfaces().toList()
                .flatMap { networkInterface -> networkInterface.inetAddresses.toList() }
                .firstOrNull { address ->
                    !address.isLoopbackAddress && address is Inet4Address
                }
                ?.hostAddress
                ?: "127.0.0.1"
        } catch (error: Exception) {
            Log.w(TAG, "Unable to resolve local IP, using 127.0.0.1", error)
            "127.0.0.1"
        }
    }

    private fun sendRegister(
        sendMessage: (String) -> Unit,
        transport: Transport,
        username: String,
        sipUri: String,
        fromUri: String,
        localIp: String,
        localPort: Int,
        callId: String,
        fromTag: String,
        cseq: Int,
        authorization: String?,
        authStatusCode: Int?,
        host: String,
        port: Int,
    ) {
        val branch = "z9hG4bK${randomHex(12)}"
        val viaTransport = transport.name
        val displayName = username
        val message = buildString {
            append("REGISTER $sipUri SIP/2.0\r\n")
            append("Via: SIP/2.0/$viaTransport $localIp:$localPort;branch=$branch;rport\r\n")
            append("Max-Forwards: 70\r\n")
            append("To: \"$displayName\" <$fromUri>\r\n")
            append("From: \"$displayName\" <$fromUri>;tag=$fromTag\r\n")
            append("Call-ID: $callId\r\n")
            append("CSeq: $cseq REGISTER\r\n")
            append("Contact: <sip:$username@$localIp:$localPort;transport=${viaTransport.lowercase()}>\r\n")
            append("Expires: 3600\r\n")
            append("Allow: INVITE, ACK, CANCEL, BYE, NOTIFY, REFER, MESSAGE, OPTIONS, INFO, SUBSCRIBE\r\n")
            append("Supported: outbound, path\r\n")
            append("User-Agent: newapp/1.0\r\n")
            if (authorization != null) {
                val authHeader = if (authStatusCode == 407) {
                    "Proxy-Authorization"
                } else {
                    "Authorization"
                }
                append("$authHeader: $authorization\r\n")
            }
            append("Content-Length: 0\r\n")
            append("\r\n")
        }

        Log.d(TAG, "Sending ${transport.name} REGISTER (CSeq $cseq) to $host:$port")
        Log.v(TAG, "REGISTER payload:\n$message")
        sendMessage(message)
    }

    private fun readFinalUdpResponse(socket: DatagramSocket): SipResponse {
        val deadline = System.currentTimeMillis() + TIMEOUT_MS
        var lastPreview = "none"

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

        throw IllegalStateException(
            "No valid SIP response over UDP. Last packet: $lastPreview"
        )
    }

    private fun readFinalTcpResponse(reader: BufferedReader): SipResponse {
        val deadline = System.currentTimeMillis() + TIMEOUT_MS
        var lastPreview = "none"

        while (System.currentTimeMillis() < deadline) {
            val raw = readRawTcp(reader) ?: break
            lastPreview = preview(raw)

            val response = parseResponse(raw) ?: continue

            if (response.statusCode == 100) {
                Log.d(TAG, "Received 100 Trying, waiting for final response...")
                continue
            }

            return response
        }

        throw IllegalStateException(
            "No valid SIP response over TCP. Last packet: $lastPreview"
        )
    }

    private fun sendUdp(socket: DatagramSocket, message: String, host: String, port: Int) {
        val data = message.toByteArray(Charsets.UTF_8)
        val address = InetAddress.getByName(host)
        socket.send(DatagramPacket(data, data.size, address, port))
    }

    private fun sendTcp(writer: java.io.OutputStream, message: String) {
        writer.write(message.toByteArray(Charsets.UTF_8))
        writer.flush()
    }

    private fun receiveRawUdp(socket: DatagramSocket): String {
        val buffer = ByteArray(8192)
        val packet = DatagramPacket(buffer, buffer.size)
        socket.receive(packet)
        val raw = String(packet.data, 0, packet.length, Charsets.UTF_8)
        Log.d(TAG, "UDP packet (${packet.length} bytes): ${preview(raw)}")
        return raw
    }

    private fun readRawTcp(reader: BufferedReader): String? {
        val headerLines = mutableListOf<String>()
        var sawStatusLine = false

        while (true) {
            val line = reader.readLine() ?: return null
            headerLines.add(line)

            if (line.startsWith("SIP/2.0")) {
                sawStatusLine = true
            }

            if (line.isEmpty() && sawStatusLine) {
                break
            }
        }

        val headers = headerLines.joinToString("\r\n")
        val contentLength = Regex("(?im)^content-length:\\s*(\\d+)\\s*$")
            .find(headers)
            ?.groupValues
            ?.get(1)
            ?.toIntOrNull()
            ?: 0

        val body = if (contentLength > 0) {
            val buffer = CharArray(contentLength)
            var read = 0
            while (read < contentLength) {
                val count = reader.read(buffer, read, contentLength - read)
                if (count == -1) {
                    break
                }
                read += count
            }
            String(buffer, 0, read)
        } else {
            ""
        }

        val raw = if (body.isEmpty()) {
            headers + "\r\n\r\n"
        } else {
            headers + "\r\n\r\n" + body
        }

        Log.d(TAG, "TCP message (${raw.length} chars): ${preview(raw)}")
        return raw
    }

    private fun parseResponse(raw: String): SipResponse? {
        val cleaned = raw.replace("\uFEFF", "").trim()
        if (cleaned.isEmpty()) {
            Log.w(TAG, "Ignoring empty packet")
            return null
        }

        val statusMatch = Regex("""(?m)^SIP/2\.0\s+(\d{3})\s*(.*)$""").find(cleaned)
        if (statusMatch == null) {
            Log.w(TAG, "Ignoring non-SIP packet: ${preview(cleaned)}")
            return null
        }

        val statusCode = statusMatch.groupValues[1].toInt()
        val reasonPhrase = statusMatch.groupValues[2].trim()
        val contentFromStatus = cleaned.substring(statusMatch.range.first)
        val lines = contentFromStatus.split("\r\n", "\n")

        val headers = mutableMapOf<String, MutableList<String>>()
        for (index in 1 until lines.size) {
            val line = lines[index]
            if (line.isEmpty()) {
                break
            }

            val colonIndex = line.indexOf(':')
            if (colonIndex <= 0) {
                continue
            }

            val name = line.substring(0, colonIndex).trim().lowercase()
            val value = line.substring(colonIndex + 1).trim()
            headers.getOrPut(name) { mutableListOf() }.add(value)
        }

        return SipResponse(statusCode, reasonPhrase, headers)
    }

    private fun parseDigestChallenge(header: String): Map<String, String> {
        val params = mutableMapOf<String, String>()
        val digestPart = header.substringAfter("Digest", header).trim()
        val regex = Regex("""(\w+)=("([^"]*)"|([^,\s]+))""")

        regex.findAll(digestPart).forEach { match ->
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

        val ha1 = md5(username + ":" + realm + ":" + password)
        val ha2 = md5(method + ":" + uri)

        return if (qop == "auth") {
            val nc = "00000001"
            val cnonce = randomHex(16)
            val response = md5(ha1 + ":" + nonce + ":" + nc + ":" + cnonce + ":" + qop + ":" + ha2)
            """Digest username="$username", realm="$realm", nonce="$nonce", uri="$uri", response="$response", algorithm=$algorithm, qop=$qop, nc=$nc, cnonce="$cnonce""""
        } else {
            val response = md5(ha1 + ":" + nonce + ":" + ha2)
            """Digest username="$username", realm="$realm", nonce="$nonce", uri="$uri", response="$response""""
        }
    }

    private fun md5(input: String): String {
        val digest = MessageDigest.getInstance("MD5")
        val bytes = digest.digest(input.toByteArray(Charsets.UTF_8))
        return bytes.joinToString("") { byte -> "%02x".format(byte.toInt() and 0xff) }
    }

    private fun randomHex(length: Int): String {
        val chars = "0123456789abcdef"
        return (1..length)
            .map { chars[ThreadLocalRandom.current().nextInt(chars.length)] }
            .joinToString("")
    }

    private fun preview(raw: String): String {
        return raw
            .replace("\r", "\\r")
            .replace("\n", "\\n")
            .take(240)
    }
}

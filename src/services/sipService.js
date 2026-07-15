import { NativeEventEmitter, NativeModules, Platform } from 'react-native'

const LOG_TAG = '[SIP]'
const { SipRegistration } = NativeModules
const sipEmitter = SipRegistration ? new NativeEventEmitter(SipRegistration) : null

const log = (...args) => console.log(LOG_TAG, ...args)
const logError = (...args) => console.error(LOG_TAG, ...args)

const listeners = {
    registration: new Set(),
    incomingCall: new Set(),
    callState: new Set(),
}

const normalizeServer = (server) =>
    server
        .trim()
        .replace(/^https?:\/\//, '')
        .replace(/^sip:/, '')
        .split('/')[0]
        .split(':')[0]
        .trim()

const ensureNativeModule = async () => {
    if (Platform.OS !== 'android') {
        throw new Error('Native SIP registration is currently supported on Android only.')
    }

    if (!SipRegistration?.registerSIP) {
        throw new Error('Native SIP module is not available. Rebuild the Android app with: npx react-native run-android')
    }

    if (SipRegistration?.getVersion) {
        const nativeVersion = await SipRegistration.getVersion()
        log('Native SIP module version:', nativeVersion)

        if (String(nativeVersion) !== '10') {
            throw new Error(
                `Outdated native SIP module (v${nativeVersion}). Run: cd android && gradlew clean && cd .. && npx react-native run-android`
            )
        }
    }
}

const attachNativeListeners = () => {
    if (!sipEmitter || sipEmitter._sipListenersAttached) {
        return
    }

    sipEmitter.addListener('sipRegistrationState', (event) => {
        log('Registration state:', event?.state, event?.message || '')
        listeners.registration.forEach((handler) => handler(event))
    })

    sipEmitter.addListener('sipIncomingCall', (event) => {
        log('Incoming call:', event?.displayName || event?.remoteNumber)
        listeners.incomingCall.forEach((handler) => handler(event))
    })

    sipEmitter.addListener('sipCallState', (event) => {
        log('Call state:', event?.state, event?.remoteNumber || '')
        listeners.callState.forEach((handler) => handler(event))
    })

    sipEmitter._sipListenersAttached = true
}

export const onRegistrationState = (handler) => {
    attachNativeListeners()
    listeners.registration.add(handler)
    return () => listeners.registration.delete(handler)
}

export const onIncomingCall = (handler) => {
    attachNativeListeners()
    listeners.incomingCall.add(handler)
    return () => listeners.incomingCall.delete(handler)
}

export const onCallState = (handler) => {
    attachNativeListeners()
    listeners.callState.add(handler)
    return () => listeners.callState.delete(handler)
}

export const registerSIP = async (username, password, server, port) => {
    const trimmedUsername = username.trim()
    const trimmedPassword = password.trim()
    const host = normalizeServer(server)
    const sipPort = String(port || '5060').trim()
    const sipUri = `sip:${trimmedUsername}@${host}`

    if (!trimmedUsername || !trimmedPassword || !host) {
        logError('Registration aborted: missing username, password, or server')
        throw new Error('SIP username, password, and server are required.')
    }

    await ensureNativeModule()
    attachNativeListeners()

    log('Starting native SIP registration (UDP)')
    log('URI:', sipUri)
    log('Server:', host, 'Port:', sipPort)

    try {
        const result = await SipRegistration.registerSIP(
            trimmedUsername,
            trimmedPassword,
            host,
            sipPort
        )
        log('Registration successful:', result)
        return result
    } catch (error) {
        const message = error?.message || 'Registration failed. Check your SIP credentials and server.'
        logError('Registration failed:', message)
        throw new Error(message)
    }
}

export const unregisterSIP = async () => {
    if (!SipRegistration?.unregisterSIP) {
        return
    }
    await SipRegistration.unregisterSIP()
}

export const getUserAgent = () => null

export const makeCall = async (_username, _password, _server, _port, destination) => {
    const destinationNumber = destination.trim()

    if (!destinationNumber) {
        logError('Call aborted: missing destination')
        throw new Error('Destination number is required.')
    }

    await ensureNativeModule()
    attachNativeListeners()

    log('Initiating SIP call')
    log('To:', destinationNumber)

    try {
        const result = await SipRegistration.makeCall(
            _username,
            _password,
            _server,
            _port,
            destinationNumber
        )
        log('Call initiated:', result)
        return result
    } catch (error) {
        const message = error?.message || 'Call failed. Check your SIP credentials and server.'
        logError('Call failed:', message)
        throw new Error(message)
    }
}

export const hangupCall = async () => {
    if (!SipRegistration?.hangupCall) {
        logError('hangupCall is not available in native module')
        throw new Error('Hangup is not available on this build. Please rebuild the app.')
    }
    try {
        log('Calling native hangupCall()')
        const result = await SipRegistration.hangupCall()
        log('hangupCall result:', result)
        return result
    } catch (error) {
        logError('hangupCall native error:', error)
        throw error
    }
}

export const answerCall = async () => {
    if (!SipRegistration?.answerCall) {
        logError('answerCall is not available in native module')
        throw new Error('Answer is not available on this build.')
    }
    try {
        log('Calling native answerCall()')
        const result = await SipRegistration.answerCall()
        log('answerCall result:', result)
        return result
    } catch (error) {
        logError('answerCall native error:', error)
        throw error
    }
}

export const declineCall = async () => {
    if (!SipRegistration?.declineCall) {
        logError('declineCall is not available in native module')
        throw new Error('Decline is not available on this build. Please rebuild the app.')
    }
    try {
        log('Calling native declineCall()')
        const result = await SipRegistration.declineCall()
        log('declineCall result:', result)
        return result
    } catch (error) {
        logError('declineCall native error:', error)
        throw error
    }
}

export const toggleSpeaker = async () => {
    if (!SipRegistration?.toggleSpeaker) {
        return false
    }
    return SipRegistration.toggleSpeaker()
}

export const toggleMute = async () => {
    if (!SipRegistration?.toggleMute) {
        return false
    }
    return SipRegistration.toggleMute()
}

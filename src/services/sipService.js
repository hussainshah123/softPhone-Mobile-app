import { NativeModules, Platform } from 'react-native'

const LOG_TAG = '[SIP]'
const { SipRegistration } = NativeModules

const log = (...args) => console.log(LOG_TAG, ...args)
const logError = (...args) => console.error(LOG_TAG, ...args)

const normalizeServer = (server) =>
    server
        .trim()
        .replace(/^https?:\/\//, '')
        .replace(/^sip:/, '')
        .split('/')[0]
        .split(':')[0]

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

        if (String(nativeVersion) !== '4') {
            throw new Error(
                `Outdated native SIP module (v${nativeVersion}). Run: cd android && gradlew clean && cd .. && npx react-native run-android`
            )
        }
    }
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

    log('Starting native SIP registration (TCP first, then UDP)')
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

export const getUserAgent = () => null

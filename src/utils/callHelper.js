import AsyncStorage from '@react-native-async-storage/async-storage'
import { Alert } from 'react-native'
import { makeCall } from '../services/sipService'

/**
 * Formats a call duration given in seconds into a mm:ss (or h:mm:ss) string,
 * e.g. 75 -> "01:15", 3665 -> "1:01:05". Used on the call screens (live timer)
 * and in the call history list.
 *
 * @param {number} totalSeconds - elapsed call time in seconds
 * @returns {string} formatted duration
 */
export const formatDuration = (totalSeconds) => {
    const secs = Math.max(0, Math.floor(Number(totalSeconds) || 0))
    const hours = Math.floor(secs / 3600)
    const minutes = Math.floor((secs % 3600) / 60)
    const seconds = secs % 60
    const pad = (n) => String(n).padStart(2, '0')

    if (hours > 0) {
        return `${hours}:${pad(minutes)}:${pad(seconds)}`
    }
    return `${pad(minutes)}:${pad(seconds)}`
}

/**
 * Starts an outgoing call to the given number from anywhere in the app
 * (recent calls, favorites, history, etc.).
 *
 * Loads the saved SIP credentials, navigates to the OutgoingCall screen and
 * places the call via the native SIP module — the same flow the dialpad uses.
 *
 * @param {object} navigation - navigation object from the calling screen
 * @param {string} phoneNumber - destination number to dial
 * @param {string} [callerName] - display name to show on the call screen
 */
export const startCall = async (navigation, phoneNumber, callerName) => {
    const number = String(phoneNumber || '').trim()

    if (!number) {
        Alert.alert('Error', 'No number to call')
        return
    }

    let credentials = null
    try {
        const stored = await AsyncStorage.getItem('sipCredentials')
        if (stored) {
            credentials = JSON.parse(stored)
        }
    } catch (error) {
        console.error('[callHelper] Failed to load SIP credentials:', error)
    }

    if (!credentials?.username) {
        Alert.alert('Error', 'Please login with SIP credentials first')
        return
    }

    // OutgoingCall / BottomTabs live on the root stack. From a tab screen we need
    // the parent stack navigator; fall back to the given navigation otherwise.
    const rootNavigation =
        (typeof navigation?.getParent === 'function' && navigation.getParent()) || navigation

    rootNavigation.navigate('OutgoingCall', {
        phoneNumber: number,
        callerName: callerName || number,
    })

    try {
        await makeCall(
            credentials.username,
            credentials.password,
            credentials.server,
            credentials.port,
            number
        )
    } catch (error) {
        Alert.alert('Call Failed', error?.message || 'Unable to place the call')
        rootNavigation.navigate('BottomTabs')
    }
}

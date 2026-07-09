import AsyncStorage from '@react-native-async-storage/async-storage'

const HISTORY_KEY = 'callHistory'

export const saveCallHistory = async (call) => {
    try {
        const history = await getCallHistory()
        const newCall = {
            id: Date.now().toString(),
            ...call,
            timestamp: Date.now(),
        }
        const updatedHistory = [newCall, ...history].slice(0, 100)
        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory))
        console.log('[CallHistory] Saved call:', newCall)
    } catch (error) {
        console.error('[CallHistory] Failed to save call:', error)
    }
}

export const getCallHistory = async () => {
    try {
        const history = await AsyncStorage.getItem(HISTORY_KEY)
        const parsed = history ? JSON.parse(history) : []
        return parsed
    } catch (error) {
        console.error('[CallHistory] Failed to load history:', error)
        return []
    }
}
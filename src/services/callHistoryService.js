import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = 'callHistory';
const DUPLICATE_THRESHOLD = 2000; // 2 seconds to consider as duplicate

let lastSavedCall = null;

const isDuplicate = (call) => {
    if (!lastSavedCall) return false;

    const timeDiff = Date.now() - lastSavedCall.timestamp;
    const sameNumber = call.number === lastSavedCall.number;
    const sameType = call.type === lastSavedCall.type;
    const withinThreshold = timeDiff < DUPLICATE_THRESHOLD;

    return sameNumber && sameType && withinThreshold;
};

export const saveCallHistory = async (call) => {
    try {
        // Prevent duplicate entries
        if (isDuplicate(call)) {
            console.log('[CallHistory] Duplicate call detected, skipping save');
            return;
        }

        const history = await getCallHistory();
        const newCall = {
            id: Date.now().toString(),
            ...call,
            timestamp: Date.now(),
        };

        // Update last saved call tracker
        lastSavedCall = newCall;

        const updatedHistory = [newCall, ...history].slice(0, 100);
        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
        console.log('[CallHistory] Saved call:', newCall);
    } catch (error) {
        console.error('[CallHistory] Failed to save call:', error);
    }
};

export const getCallHistory = async () => {
    try {
        const history = await AsyncStorage.getItem(HISTORY_KEY);
        const parsed = history ? JSON.parse(history) : [];
        return parsed;
    } catch (error) {
        console.error('[CallHistory] Failed to load history:', error);
        return [];
    }
};

export const clearCallHistory = async () => {
    try {
        await AsyncStorage.removeItem(HISTORY_KEY);
        lastSavedCall = null;
        console.log('[CallHistory] Call history cleared');
    } catch (error) {
        console.error('[CallHistory] Failed to clear history:', error);
    }
};
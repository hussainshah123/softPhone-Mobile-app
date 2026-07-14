import AsyncStorage from '@react-native-async-storage/async-storage';

let firestore = null;

const getFirestoreDB = async () => {
  if (!firestore) {
    try {
      firestore = await import('@react-native-firebase/firestore').then(m => m.default);
    } catch (error) {
      console.warn('[Firebase] Firestore not available - using local storage only');
      return null;
    }
  }
  return firestore;
};

const CREDENTIALS_KEY = 'sipCredentials';
const USER_ID_KEY = 'userId';

const firebaseService = {
  async saveSIPCredentials(userId, sipCredentials) {
    try {
      await AsyncStorage.setItem(USER_ID_KEY, userId);
      await AsyncStorage.setItem(CREDENTIALS_KEY, JSON.stringify(sipCredentials));

      try {
        const db = await getFirestoreDB();
        if (db) {
          await db()
            .collection('users')
            .doc(userId)
            .set({
              sipCredentials: {
                username: sipCredentials.username,
                server: sipCredentials.server,
                port: sipCredentials.port,
              },
              updatedAt: db.FieldValue.serverTimestamp(),
            }, { merge: true });
          console.log('[Firebase] Credentials synced to Firestore');
        }
      } catch (firestoreError) {
        console.warn('[Firebase] Firestore sync skipped, using local storage:', firestoreError.message);
      }

      console.log('[Firebase] SIP credentials saved successfully');
      return true;
    } catch (error) {
      console.error('[Firebase] Error saving credentials:', error);
      throw error;
    }
  },

  async getSIPCredentials(userId) {
    try {
      try {
        const db = await getFirestoreDB();
        if (db) {
          const doc = await db()
            .collection('users')
            .doc(userId)
            .get();

          if (doc.exists) {
            const data = doc.data();
            if (data && data.sipCredentials) {
              return data.sipCredentials;
            }
          }
        }
      } catch (firestoreError) {
        console.warn('[Firebase] Firestore retrieval skipped:', firestoreError.message);
      }

      return null;
    } catch (error) {
      console.error('[Firebase] Error retrieving credentials:', error);
      return null;
    }
  },

  async getLocalSIPCredentials() {
    try {
      const credentials = await AsyncStorage.getItem(CREDENTIALS_KEY);
      return credentials ? JSON.parse(credentials) : null;
    } catch (error) {
      console.error('[Firebase] Error retrieving local credentials:', error);
      return null;
    }
  },

  async getStoredUserId() {
    try {
      return await AsyncStorage.getItem(USER_ID_KEY);
    } catch (error) {
      console.error('[Firebase] Error retrieving user ID:', error);
      return null;
    }
  },

  async clearCredentials() {
    try {
      await AsyncStorage.removeItem(CREDENTIALS_KEY);
      await AsyncStorage.removeItem(USER_ID_KEY);
      console.log('[Firebase] Credentials cleared');
    } catch (error) {
      console.error('[Firebase] Error clearing credentials:', error);
    }
  },

  async isUserAuthenticated() {
    try {
      const userId = await this.getStoredUserId();
      const credentials = await this.getLocalSIPCredentials();
      return !!(userId && credentials);
    } catch (error) {
      console.error('[Firebase] Error checking authentication:', error);
      return false;
    }
  },

  async logoutUser(userId) {
    try {
      try {
        const db = await getFirestoreDB();
        if (db) {
          await db()
            .collection('users')
            .doc(userId)
            .update({
              lastLogout: db.FieldValue.serverTimestamp(),
            });
        }
      } catch (firestoreError) {
        console.warn('[Firebase] Firestore logout update skipped:', firestoreError.message);
      }

      await this.clearCredentials();
      console.log('[Firebase] User logged out successfully');
      return true;
    } catch (error) {
      console.error('[Firebase] Error during logout:', error);
      throw error;
    }
  },
};

export default firebaseService;

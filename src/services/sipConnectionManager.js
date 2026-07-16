import { AppState } from 'react-native';
import { registerSIP, unregisterSIP, onRegistrationState } from './sipService';
import firebaseService from './firebaseService';

const LOG_TAG = '[SIPConnectionManager]';

let appStateSubscription = null;
let registrationUnsubscribe = null;
let isConnected = false;
let connectionCheckInterval = null;
let autoReconnectTimeout = null;
let appState = AppState.currentState;
const statusListeners = new Set();

const log = (...args) => console.log(LOG_TAG, ...args);
const logError = (...args) => console.error(LOG_TAG, ...args);

const setConnected = (value) => {
  if (isConnected === value) {
    return;
  }
  isConnected = value;
  statusListeners.forEach((handler) => {
    try {
      handler(isConnected);
    } catch (error) {
      logError('Status listener error:', error.message);
    }
  });
};

const CONNECTION_CHECK_INTERVAL = 30000; // 30 seconds
const RECONNECT_DELAY = 5000; // 5 seconds
const MAX_RECONNECT_ATTEMPTS = 5;
let reconnectAttempts = 0;

const sipConnectionManager = {
  async initializeConnection() {
    try {
      log('Initializing SIP connection manager...');

      // Check if user is authenticated
      const isAuth = await firebaseService.isUserAuthenticated();
      if (!isAuth) {
        log('User not authenticated, skipping auto-registration');
        return false;
      }

      // Try to auto-register with stored credentials
      await this.autoRegisterWithStoredCredentials();

      // Set up app state listener
      this.setupAppStateListener();

      // Set up registration state listener
      this.setupRegistrationStateListener();

      // Start connection polling
      this.startConnectionPolling();

      log('SIP connection manager initialized successfully');
      return true;
    } catch (error) {
      logError('Failed to initialize connection manager:', error.message);
      return false;
    }
  },

  async autoRegisterWithStoredCredentials() {
    try {
      log('Attempting auto-registration with stored credentials...');

      const credentials = await firebaseService.getLocalSIPCredentials();
      if (!credentials) {
        logError('No stored credentials found for auto-registration');
        return false;
      }

      const { username, password, server, port } = credentials;
      log('Found stored credentials for user:', username);

      await registerSIP(username, password, server, port);
      reconnectAttempts = 0;
      log('Auto-registration successful');
      return true;
    } catch (error) {
      logError('Auto-registration failed:', error.message);

      // Attempt to reconnect with exponential backoff
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        const delay = RECONNECT_DELAY * reconnectAttempts;
        log(`Scheduling reconnection attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS} in ${delay}ms`);

        autoReconnectTimeout = setTimeout(
          () => this.autoRegisterWithStoredCredentials(),
          delay
        );
      }

      return false;
    }
  },

  setupAppStateListener() {
    if (appStateSubscription) {
      appStateSubscription.remove();
    }

    appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
      log(`App state changed: ${appState} → ${nextAppState}`);

      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        log('App came to foreground, checking SIP connection...');
        // Give the app a moment to fully initialize
        setTimeout(() => {
          if (!isConnected) {
            log('SIP not connected, attempting to reconnect...');
            this.autoRegisterWithStoredCredentials();
          } else {
            log('SIP already connected');
          }
        }, 1000);
      } else if (nextAppState.match(/inactive|background/)) {
        log('App going to background');
        // Connection will be maintained by the native module
      }

      appState = nextAppState;
    });

    log('App state listener configured');
  },

  setupRegistrationStateListener() {
    if (registrationUnsubscribe) {
      registrationUnsubscribe();
    }

    registrationUnsubscribe = onRegistrationState((event) => {
      const state = event?.state?.toLowerCase();
      const message = event?.message || '';

      log(`Registration state: ${state} - ${message}`);

      if (state === 'registered' || state === 'ok') {
        setConnected(true);
        reconnectAttempts = 0;
        log('✓ SIP successfully connected');
      } else if (state === 'failed' || state === 'failure') {
        setConnected(false);
        log('✗ SIP connection failed, will retry on app foreground');
      } else if (state === 'unregistered') {
        setConnected(false);
        log('SIP unregistered');
      }
    });

    log('Registration state listener configured');
  },

  startConnectionPolling() {
    if (connectionCheckInterval) {
      clearInterval(connectionCheckInterval);
    }

    connectionCheckInterval = setInterval(() => {
      log(`[Polling] Checking SIP connection status: ${isConnected ? 'CONNECTED' : 'DISCONNECTED'}`);

      // The native module will maintain the connection
      // This polling just logs the status
      // If disconnected and app is in foreground, attempt reconnection
      if (!isConnected && appState === 'active') {
        log('[Polling] Attempting to reconnect...');
        this.autoRegisterWithStoredCredentials();
      }
    }, CONNECTION_CHECK_INTERVAL);

    log(`Connection polling started (interval: ${CONNECTION_CHECK_INTERVAL}ms)`);
  },

  stopConnectionPolling() {
    if (connectionCheckInterval) {
      clearInterval(connectionCheckInterval);
      connectionCheckInterval = null;
      log('Connection polling stopped');
    }
  },

  async stopConnectionMonitoring() {
    log('Stopping SIP connection monitoring...');

    this.stopConnectionPolling();

    if (appStateSubscription) {
      appStateSubscription.remove();
      appStateSubscription = null;
    }

    if (registrationUnsubscribe) {
      registrationUnsubscribe();
      registrationUnsubscribe = null;
    }

    if (autoReconnectTimeout) {
      clearTimeout(autoReconnectTimeout);
      autoReconnectTimeout = null;
    }

    // Tell the SIP server we are gone (REGISTER expires=0) so the account
    // is not shown as connected after logout.
    try {
      await unregisterSIP();
      log('SIP unregistered from server');
    } catch (error) {
      logError('Failed to unregister from SIP server:', error.message);
    }

    setConnected(false);
    reconnectAttempts = 0;
    log('SIP connection monitoring stopped');
  },

  onConnectionStatusChange(handler) {
    statusListeners.add(handler);
    // Emit current status immediately so the UI is in sync on mount.
    try {
      handler(isConnected);
    } catch (error) {
      logError('Status listener error:', error.message);
    }
    return () => statusListeners.delete(handler);
  },

  isConnectionActive() {
    return isConnected;
  },

  getConnectionStatus() {
    return {
      connected: isConnected,
      appState: appState,
      reconnectAttempts: reconnectAttempts,
    };
  },
};

export default sipConnectionManager;

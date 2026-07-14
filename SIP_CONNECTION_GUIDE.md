# SIP Connection Management Guide

## Overview

Your app now automatically maintains SIP connection with the server. Users will stay connected even after closing and reopening the app.

## Features Implemented

✅ **Auto-Registration** - Automatically registers with stored SIP credentials when entering the app
✅ **Connection Persistence** - Maintains SIP connection in background
✅ **App Lifecycle Handling** - Re-registers when app comes to foreground
✅ **Connection Polling** - Monitors connection status every 30 seconds
✅ **Automatic Reconnection** - Attempts to reconnect with exponential backoff if connection drops
✅ **Intelligent State Management** - Only auto-registers if credentials are stored

## How It Works

### 1. Auto-Registration Flow

```
App Opens
    ↓
Splash Screen → Checks Authentication
    ↓
User Authenticated?
    ├─ YES: Navigate to BottomTabs (Home)
    └─ NO: Navigate to Login
    ↓
Home Screen Loads
    ↓
SIP Connection Manager Initializes
    ↓
Loads Stored Credentials
    ↓
Auto-Registers with SIP Server
    ↓
Connection Status Listener Activated
```

### 2. App Lifecycle Handling

```
App in Foreground
    ↓
User switches to another app
    ↓
App goes to Background
    ├─ SIP connection maintained by native module
    └─ Polling continues
    ↓
User opens app again
    ↓
App comes to Foreground
    ↓
Connection Status Check
    ├─ Connected: Continue normally
    └─ Disconnected: Attempt auto-reconnection
```

### 3. Connection Polling

Every **30 seconds**, the app:
- Checks if SIP connection is active
- Logs connection status
- If disconnected and app is in foreground, attempts reconnection

### 4. Reconnection Logic

If connection fails:
1. **Attempt 1:** Retry after 5 seconds
2. **Attempt 2:** Retry after 10 seconds
3. **Attempt 3:** Retry after 15 seconds
4. **Attempt 4:** Retry after 20 seconds
5. **Attempt 5:** Retry after 25 seconds
6. **Max Attempts Reached:** Stop and wait for manual intervention or app foreground event

## Architecture

### File Structure
```
src/services/
├── sipService.js                 (Core SIP operations)
├── sipConnectionManager.js       (NEW - Connection lifecycle)
├── firebaseService.js            (Credential persistence)
└── callHistoryService.js         (Call history)

src/screens/home/
└── Home.jsx                      (Modified - Initializes connection)
```

### Components

#### SIP Connection Manager (`sipConnectionManager.js`)

**Public Methods:**

```javascript
// Initialize connection management
await sipConnectionManager.initializeConnection();
// Returns: true if initialized, false otherwise

// Get current connection status
const status = sipConnectionManager.getConnectionStatus();
// Returns: { connected: boolean, appState: string, reconnectAttempts: number }

// Check if connected
const isConnected = sipConnectionManager.isConnectionActive();
// Returns: true/false

// Stop monitoring (on logout)
sipConnectionManager.stopConnectionMonitoring();
```

**Internal Methods:**
- `autoRegisterWithStoredCredentials()` - Registers with stored SIP credentials
- `setupAppStateListener()` - Listens to app foreground/background events
- `setupRegistrationStateListener()` - Monitors SIP registration state changes
- `startConnectionPolling()` - Starts periodic connection status checks
- `stopConnectionPolling()` - Stops periodic checks

## Configuration

You can adjust these parameters in `sipConnectionManager.js`:

```javascript
// Check connection every 30 seconds
const CONNECTION_CHECK_INTERVAL = 30000;

// Wait 5 seconds before first reconnect attempt
const RECONNECT_DELAY = 5000;

// Try up to 5 reconnect attempts
const MAX_RECONNECT_ATTEMPTS = 5;
```

## Logging

All SIP connection events are logged with `[SIPConnectionManager]` prefix:

```
[SIPConnectionManager] Initializing SIP connection manager...
[SIPConnectionManager] Attempting auto-registration with stored credentials...
[SIPConnectionManager] Found stored credentials for user: john_doe
[SIPConnectionManager] Auto-registration successful
[SIPConnectionManager] ✓ SIP successfully connected
[SIPConnectionManager] [Polling] Checking SIP connection status: CONNECTED
```

Check logcat for detailed debugging:
```bash
adb logcat | grep "SIPConnectionManager\|SIP"
```

## User Experience

### First Login
1. User registers with SIP credentials
2. Credentials saved to local storage + Firebase
3. Connection established immediately

### Close and Reopen App
1. User closes the app
2. User reopens the app
3. Splash screen (3 seconds)
4. Auto-login (no login screen needed)
5. Home screen loads
6. **SIP connection automatically re-established** ← NEW!

### Background/Foreground Switching
1. User is on a call
2. User switches to another app
3. SIP connection maintained by native module
4. User returns to app
5. Connection verified and active

### Connection Loss
1. If connection drops
2. App automatically attempts to reconnect
3. With exponential backoff (5s → 10s → 15s → 20s → 25s)
4. Maximum 5 reconnection attempts
5. Manual re-register available from Settings/SIP Account

## Testing

### Test Auto-Connection
1. Log in with SIP credentials
2. Close the app completely
3. Reopen the app
4. Check logcat for "Auto-registration successful" message
5. Verify SIP connection status shows "CONNECTED"

### Test Foreground/Background
1. Make a SIP call
2. Switch to another app
3. Wait 10 seconds
4. Return to app
5. Call should continue uninterrupted

### Test Connection Polling
```bash
adb logcat | grep "Polling"
```
You should see polling messages every 30 seconds

### Test Reconnection
1. Block network connection briefly (disable WiFi/mobile)
2. Check logcat for reconnection attempts
3. Re-enable network
4. Connection should automatically re-establish

## Troubleshooting

### Issue: Auto-registration not working
**Cause:** Credentials not stored from previous login
**Solution:** Log out and log in again to save credentials

### Issue: Connection drops frequently
**Cause:** Network instability or SIP server issues
**Solution:** 
1. Check server connectivity
2. Verify SIP credentials are correct (Settings → SIP Account)
3. Restart app
4. Check native logcat for SIP module errors

### Issue: Reconnection attempts not working
**Cause:** Max reconnect attempts reached
**Solution:**
1. Restart the app
2. Go to Settings → SIP Account
3. Click "Save Changes" to manually re-register

### Issue: App doesn't recognize connection status
**Cause:** Registration state listener not updating
**Solution:** Check if `onRegistrationState` listener is properly connected in logs

## Security Considerations

⚠️ **Connection Maintenance:**
- SIP connection is maintained by the native Android SIP module
- Device encryption protects stored credentials
- Connection tokens are not exposed to JavaScript layer
- Consider implementing periodic credential refresh for long-lived sessions

## Future Enhancements

1. **Visual Connection Status** - Add indicator in UI showing connection state
2. **Manual Reconnect** - Add button in Settings to manually reconnect
3. **Connection Logs** - Store connection events for debugging
4. **Notification on Disconnect** - Alert user if connection drops
5. **Battery Optimization** - Reduce polling frequency in low-battery mode
6. **Network Change Handling** - Detect WiFi/mobile switch and reconnect

## Code Examples

### Get Current Connection Status
```javascript
const status = sipConnectionManager.getConnectionStatus();
if (status.connected) {
  console.log('SIP is connected!');
} else {
  console.log(`SIP disconnected. Reconnect attempts: ${status.reconnectAttempts}`);
}
```

### Manual Reconnection
```javascript
// In Settings or wherever needed
const credentials = await firebaseService.getLocalSIPCredentials();
if (credentials) {
  await sipConnectionManager.autoRegisterWithStoredCredentials();
}
```

### Handle on Logout
```javascript
// When user logs out
await sipConnectionManager.stopConnectionMonitoring();
await firebaseService.logoutUser(userId);
```

## Support

For debugging:
1. Check `[SIPConnectionManager]` logs
2. Check `[SIP]` logs from sipService
3. Check `[Firebase]` logs from firebaseService
4. Check native `adb logcat | grep -i sip` for native module errors
5. Visit Firebase Console to verify credentials are stored

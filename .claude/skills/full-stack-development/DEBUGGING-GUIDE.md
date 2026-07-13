# SIP & VoIP Debugging Guide

Practical troubleshooting for the most common issues in this softphone app.

## Quick Checklist

- [ ] App won't start → Check native module linking
- [ ] No incoming calls → Check SIP registration status
- [ ] Outgoing calls fail → Check credentials and network
- [ ] No audio → Check permissions and speaker mode
- [ ] Listener firing multiple times → Check event cleanup
- [ ] App crashes on login → Check AsyncStorage access

## SIP Registration Issues

### Problem: Registration Never Completes

**Symptoms:** Stuck on "Registering..." screen, registration event never fires

**Diagnosis:**
```bash
# View SIP module logs
adb logcat | grep -i sip

# Check if native module is linked
adb shell pm dump com.fortdice.newapp | grep linphone
```

**Common Causes & Solutions:**

1. **Native Module Not Linked**
   ```bash
   # Solution: Rebuild
   cd android && gradlew clean
   cd .. && npm run android
   ```

2. **Wrong Server Address or Port**
   - Check: Does server accept registrations from this port?
   - Test with: `nc -zv server.com 5060`
   - Asterisk default: port 5060/UDP

3. **Credentials Invalid**
   - Username: Usually numeric (e.g., 1000, 2000)
   - Password: Case-sensitive, no escaping needed
   - Test with: Asterisk CLI `asterisk -rvvv` → `sip show users`

4. **Network Not Connected**
   ```bash
   adb shell
   ping 8.8.8.8  # Test connectivity
   ```

5. **Firewall Blocking SIP**
   - Check if port 5060 is open
   - Try: `adb shell iptables -L` (requires rooted device)

### Problem: "401 Unauthorized" Registration Error

**Diagnosis:**
```javascript
// In sipService.js, add verbose logging
console.log('[SIP] Attempting registration with:');
console.log('  Username:', username);
console.log('  Password:', '***');
console.log('  Server:', server);
console.log('  Port:', port);
```

**Solutions:**
1. Verify credentials on SIP server
2. Check password doesn't have special chars that need escaping
3. Ensure user hasn't been deleted from SIP server
4. Check SIP server auth log: `tail -f /var/log/asterisk/messages`

## Incoming Call Issues

### Problem: Incoming Calls Not Received

**Symptoms:** Other parties can call, but app doesn't show incoming call

**Diagnosis:**

1. **Check if registration is active:**
   ```bash
   adb logcat | grep "registered\|registration"
   ```

2. **Check if listener is attached:**
   ```javascript
   // Add logging to onIncomingCall setup
   useEffect(() => {
     console.log('[SIP] Setting up incoming call listener');
     const unsubscribe = onIncomingCall((event) => {
       console.log('[SIP] ✅ INCOMING CALL RECEIVED');
       // handler
     });
     
     return () => {
       console.log('[SIP] Cleaning up incoming call listener');
       unsubscribe();
     };
   }, []);
   ```

3. **Check native logs:**
   ```bash
   adb logcat | grep -i "incoming\|invite"
   ```

**Common Causes:**

1. **Listener Not Registered Early Enough**
   - Move listener setup to App.jsx, not individual screens
   - Listener must be active before incoming call arrives

2. **Listener Cleaned Up Too Early**
   - Check: Is component unmounting during call?
   - Avoid unsubscribing on screen change if call is active

3. **Registration Dropped**
   - SIP registration expires (default 3600s)
   - Check: Do you need to re-register? `onRegistrationState` would show `registration_failed`

4. **Remote Party Dialing Wrong Number**
   - App registers as one extension (e.g., 1000)
   - Remote party dialing different number? It won't ring app.

**Solution: Test Manually**
```bash
# Terminal 1: Start Asterisk
docker run -d --name asterisk -p 5060:5060/udp asterisk:latest

# Terminal 2: Register app with username 1000

# Terminal 3: Open Asterisk CLI and call from another extension
docker exec -it asterisk asterisk -rvvv
*CLI> dial 1000  # Call the app
```

### Problem: Incoming Call Screen Doesn't Show

**Symptoms:** Can hear phone ringing, but no UI appears

**Diagnosis:**
```javascript
// Check if navigationRef is properly exported
// In App.jsx
export const navigationRef = React.createRef();

// Verify it's being used in sipService.js
import { navigationRef } from '../App';

// Add logging to verify navigation is called
onIncomingCall((event) => {
  console.log('[SIP] Navigating to IncomingCall with:', event);
  navigationRef.navigate('IncomingCall', { 
    remoteNumber: event.remoteNumber,
    displayName: event.displayName,
  });
});
```

**Solutions:**
1. Verify `navigationRef` is exported from App.jsx
2. Ensure route name matches exactly: "IncomingCall"
3. Check route is registered in Navigator

## Outgoing Call Issues

### Problem: "Call Failed" or Call Hangs Up Immediately

**Symptoms:** Outgoing call starts ringing, but disconnects quickly

**Diagnosis:**
```bash
adb logcat | grep -i "call\|bye\|error" | tail -50
```

**Common Causes:**

1. **No Audio Permissions**
   ```bash
   adb shell pm list permission-groups
   adb shell pm dump com.fortdice.newapp | grep permission
   ```
   Solution: Request RECORD_AUDIO permission

2. **Remote Party Rejected**
   - Check call state: Should see "ringing" then "ended"
   - This is normal, offer to retry

3. **Media Failed to Establish**
   - WebRTC might not be initializing properly
   - Check logcat for "WebRTC" errors

4. **Network Changed During Call**
   - App switched from WiFi to mobile mid-call?
   - SIP session may not survive network switch

**Test:**
```javascript
// In services/sipService.js, add detailed call logging
export const makeCall = async (username, password, server, port, dest) => {
  console.log('[SIP] Making outgoing call to:', dest);
  
  try {
    const result = await NativeModules.SipRegistration.makeCall(
      username, password, server, port, dest
    );
    console.log('[SIP] Call initiated:', result);
    return result;
  } catch (error) {
    console.error('[SIP] Call failed:', error);
    throw error;
  }
};
```

## Audio & Media Issues

### Problem: No Audio During Call

**Symptoms:** Call connects, no audio in either direction

**Diagnosis:**
```bash
# Check if audio routes are set up
adb shell dumpsys audio | grep "mSpeaker\|Route"

# Check permissions
adb shell pm list permissions-all | grep RECORD_AUDIO
```

**Solutions:**

1. **Check Speaker Mode**
   ```javascript
   // In ActiveCall screen, verify speaker is enabled
   const handleToggleSpeaker = async () => {
     await toggleSpeaker();
     // Verify state changes
   };
   ```

2. **Check Microphone Permission**
   ```javascript
   // In Login or app startup
   import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

   const checkAudioPermission = async () => {
     const result = await check(PERMISSIONS.ANDROID.RECORD_AUDIO);
     if (result !== RESULTS.GRANTED) {
       await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
     }
   };
   ```

3. **Check Volume Settings**
   - Device volume set to 0?
   - Try: Physical volume buttons on device

4. **WebRTC Not Initialized**
   - Check: Does ActiveCall screen initialize WebRTC?
   - Add logging to `webrtcSetup.js`

**Test with ADB:**
```bash
# Record audio to test mic works
adb shell
mm-qrecorder -D 10 /sdcard/test.wav
# Then pull and play: adb pull /sdcard/test.wav

# Check audio output routing
adb shell dumpsys audio_policy
```

### Problem: One-Way Audio

**Symptoms:** Can hear remote party, they can't hear you (or vice versa)

**Diagnosis:**
```bash
# Check RTP packet flow
adb logcat | grep -i rtp
```

**Solutions:**
1. Check microphone isn't muted
2. Try toggling speaker on/off
3. Check if audio codec negotiation succeeded
4. Test on different network (WiFi vs mobile)

## Event Listener Issues

### Problem: Incoming Call Handler Fires Multiple Times

**Symptoms:** Incoming call popup shows multiple times, or events fire twice

**Root Cause:** Event listener not cleaned up on component unmount

**Diagnosis:**
```javascript
// Add logging to see how many times listener is set up
useEffect(() => {
  console.log('[DEBUG] Setting up listener - count increased');
  
  const unsubscribe = onIncomingCall((event) => {
    console.log('[SIP] Handler fired - may fire multiple times if not cleaned up');
  });
  
  return () => {
    console.log('[DEBUG] Cleaning up listener');
    unsubscribe();
  };
}, []); // Empty dependency array is CRITICAL
```

**Solution:**
```javascript
// ✅ CORRECT
useEffect(() => {
  const unsubscribe = onIncomingCall(handler);
  return unsubscribe; // Cleanup called on unmount
}, []); // Empty deps = setup once, cleanup once

// ❌ WRONG
useEffect(() => {
  const unsubscribe = onIncomingCall(handler);
  // NO RETURN = NO CLEANUP!
}, []);

// ❌ WRONG
useEffect(() => {
  const unsubscribe = onIncomingCall(handler);
  return unsubscribe;
}, [handler]); // Changing handler = re-subscribe = listener leak
```

## AsyncStorage Issues

### Problem: "Credentials Not Saved" or "Auto-Login Fails"

**Diagnosis:**
```javascript
// Test AsyncStorage directly
import AsyncStorage from '@react-native-async-storage/async-storage';

const testStorage = async () => {
  try {
    await AsyncStorage.setItem('test', 'value');
    const value = await AsyncStorage.getItem('test');
    console.log('[Storage] Test passed, value:', value);
    await AsyncStorage.removeItem('test');
  } catch (error) {
    console.error('[Storage] Test failed:', error);
  }
};

// Call in useEffect to test on app start
useEffect(() => {
  testStorage();
}, []);
```

**Solutions:**

1. **Wrap in try/catch:**
   ```javascript
   try {
     const creds = await AsyncStorage.getItem('sip_credentials');
     // Use creds
   } catch (error) {
     console.error('[Storage] Read failed:', error);
     // Fallback to manual login
   }
   ```

2. **Clear corrupted data:**
   ```bash
   adb shell
   rm -rf /data/data/com.fortdice.newapp/shared_prefs/
   ```

3. **Check storage permission:**
   ```bash
   adb shell pm list permissions-all | grep WRITE_EXTERNAL
   ```

## App Crash Issues

### Problem: App Crashes on Login

**Diagnosis:**
```bash
# Get crash log
adb logcat | grep FATAL
adb logcat | grep Exception
adb logcat | grep -A5 "AndroidRuntime"
```

**Common Causes:**

1. **NativeModules.SipRegistration is undefined**
   ```javascript
   // Add guard before native call
   if (!NativeModules.SipRegistration) {
     throw new Error('SIP module not available. Rebuild required.');
   }
   ```

2. **Invalid JSON in AsyncStorage**
   ```javascript
   try {
     const json = await AsyncStorage.getItem('sip_credentials');
     const obj = JSON.parse(json); // May throw!
   } catch (error) {
     console.error('[Storage] JSON parse failed, clearing:', error);
     await AsyncStorage.removeItem('sip_credentials');
   }
   ```

3. **Null pointer in navigation**
   ```javascript
   // Ensure route.params exists before destructuring
   const IncomingCall = ({ route }) => {
     const params = route?.params || {};
     const { remoteNumber = 'Unknown' } = params;
     // Safe to use remoteNumber
   };
   ```

## Performance Issues

### Problem: App Freezes During Call

**Diagnosis:**
```bash
adb shell dumpsys meminfo com.fortdice.newapp
```

**Solutions:**
1. Check component doesn't re-render during call
2. Use `React.memo()` for expensive components
3. Avoid heavy logging during active calls
4. Profile with React Profiler

## Network Issues

### Problem: Calls Drop When WiFi/Network Changes

**Diagnosis:**
```bash
# Monitor network state
adb logcat | grep -i "network\|connectivity"
```

**Solution:**
```javascript
import { useNetInfo } from '@react-native-community/netinfo';

export const useNetworkAwareSIP = () => {
  const netInfo = useNetInfo();

  useEffect(() => {
    if (!netInfo.isConnected) {
      console.log('[Network] Disconnected, should hang up active calls');
      hangupCall(); // Gracefully end call
    }
  }, [netInfo.isConnected]);
};
```

## Debug Commands Cheat Sheet

```bash
# View SIP logs
adb logcat | grep -i sip

# View all app logs
adb logcat | grep "fortdice"

# Clear logcat
adb logcat -c

# View native module availability
adb shell pm dump com.fortdice.newapp | grep -i linphone

# Check audio device status
adb shell dumpsys audio

# View app permissions
adb shell pm dump com.fortdice.newapp | grep permission

# Test network from device
adb shell
ping 8.8.8.8
nc -zv your-sip-server.com 5060

# Kill app and restart
adb shell am force-stop com.fortdice.newapp
npm run android

# View crash logs
adb logcat | grep "FATAL\|Exception\|Error"
```

## When to Check CLAUDE.md vs This Guide

- **CLAUDE.md**: Architecture, tech stack, overall patterns
- **SIP-AND-WEBRTC.md**: How SIP works, integration patterns
- **DEBUGGING-GUIDE.md**: Specific troubleshooting steps (you are here)
- **BEST-PRACTICES.md**: Do's and don'ts for code quality

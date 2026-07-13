# SIP & WebRTC Integration Guide

This guide covers the core VoIP patterns used in this softphone application. **Read this first if you're new to SIP or WebRTC.**

## Quick Overview

- **SIP (Session Initiation Protocol)**: Signaling layer — handles call setup, registration, call state
- **WebRTC**: Media layer — handles audio/video streaming
- **Native Module** (`react-native-linphone`): Bridge between React Native and Android SIP

## SIP Registration

### Flow: User Login → Registration → Listen for Events

```
User enters credentials
         ↓
   registerSIP() [native call]
         ↓
   Wait for registration event
         ↓
   Registration complete or failed
         ↓
   User sees success/error
```

### Implementation

**1. Save Credentials (Login Screen)**
```javascript
// screens/login/Login.jsx
const handleLogin = async () => {
  const { username, password, server, port } = formState;
  
  // Validate
  if (!username || !password || !server || !port) {
    setErrors({ form: 'All fields required' });
    return;
  }

  try {
    setLoading(true);
    
    // Call native SIP module
    await registerSIP(username, password, server, port);
    
    // Save if "Remember Me" checked
    if (rememberMe) {
      await AsyncStorage.setItem('sip_credentials', 
        JSON.stringify({ username, password, server, port })
      );
    }
    
    // Show loading and wait for registration event
    setStatus('Registering...');
  } catch (error) {
    setErrors({ form: error.message });
  }
};
```

**2. Listen for Registration State**
```javascript
// services/sipService.js
export const onRegistrationState = (handler) => {
  const subscription = NativeModules.SipRegistration.onSipRegistrationState(
    (event) => handler(event.state)
  );
  
  return () => subscription.remove(); // Cleanup function
};

// In Login.jsx - wait for registration result
useEffect(() => {
  const unsubscribe = onRegistrationState((state) => {
    console.log('[SIP] Registration state:', state);
    
    if (state === 'registered') {
      setStatus('Registered!');
      setTimeout(() => navigation.navigate('BottomTabs'), 500);
    } else if (state === 'registration_failed') {
      setErrors({ form: 'Registration failed. Check credentials.' });
      setLoading(false);
    }
  });
  
  return unsubscribe;
}, []);
```

**3. Auto-Login on App Start**
```javascript
// In App.jsx or Splash.jsx
useEffect(() => {
  const autoLogin = async () => {
    try {
      const creds = await AsyncStorage.getItem('sip_credentials');
      
      if (creds) {
        const { username, password, server, port } = JSON.parse(creds);
        
        // Register silently
        await registerSIP(username, password, server, port);
        
        // Navigation will happen when registration event fires
      } else {
        // No saved credentials, show login
        navigationRef.navigate('Login');
      }
    } catch (error) {
      console.error('[Auth] Auto-login failed:', error);
      navigationRef.navigate('Login');
    }
  };
  
  autoLogin();
}, []);
```

## Incoming Calls

### Flow: Remote Party Calls → Native Event → Navigate to Answer/Decline

```
Remote party initiates SIP INVITE
         ↓
   Android SIP module receives INVITE
         ↓
   Native event: onSipIncomingCall
         ↓
   React Native receives event
         ↓
   Navigate to IncomingCall screen
         ↓
   User answers or declines
         ↓
   Media begins or call ends
```

### Implementation

**1. Listen for Incoming Calls (App.jsx or Home screen)**
```javascript
// MUST be set up early, before user navigates away
import { onIncomingCall } from './services/sipService';

export default function App() {
  useEffect(() => {
    const unsubscribe = onIncomingCall((event) => {
      console.log('[SIP] Incoming call from:', event.remoteNumber);
      
      // Navigate from outside React tree
      navigationRef.navigate('IncomingCall', {
        remoteNumber: event.remoteNumber,
        displayName: event.displayName || event.remoteNumber,
      });
    });
    
    return unsubscribe; // CRITICAL: Cleanup
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      {/* Navigation structure */}
    </NavigationContainer>
  );
}
```

**2. Answer or Decline Call (IncomingCall Screen)**
```javascript
// screens/incoming-call/IncomingCall.jsx
import { answerCall, declineCall, onCallState } from '../../services/sipService';

export const IncomingCall = ({ route, navigation }) => {
  const { remoteNumber, displayName } = route.params;

  const handleAnswer = async () => {
    try {
      await answerCall();
      
      // Listen for call state changes
      const unsubscribe = onCallState((event) => {
        if (event.state === 'connected') {
          // Audio now flowing
          navigation.navigate('ActiveCall', { remoteNumber });
        } else if (event.state === 'ended') {
          unsubscribe();
          // Save to history
          saveCallHistory({
            number: remoteNumber,
            type: 'incoming',
            duration: event.duration,
            timestamp: new Date().toISOString(),
          });
          navigation.navigate('Home');
        }
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to answer call: ' + error.message);
    }
  };

  const handleDecline = async () => {
    try {
      await declineCall();
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to decline call');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.caller}>{displayName}</Text>
      <Text style={styles.number}>{remoteNumber}</Text>
      
      <View style={styles.buttons}>
        <TouchableOpacity 
          style={[styles.btn, styles.decline]}
          onPress={handleDecline}
        >
          <Text>Decline</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.btn, styles.answer]}
          onPress={handleAnswer}
        >
          <Text>Answer</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
```

## Outgoing Calls

### Flow: User Dials → Make Call → Wait for Connection → Media Flows

```
User enters number in dialpad
         ↓
   User presses Call
         ↓
   makeCall() [native call]
         ↓
   SIP INVITE sent to remote
         ↓
   Listen for call state (ringing, connected, etc.)
         ↓
   Remote answers or rejects
         ↓
   Media streams or call ends
```

### Implementation

**1. Initiate Call (Dialpad Screen)**
```javascript
// screens/dialpad/Dialpad.jsx
import { makeCall, onCallState } from '../../services/sipService';

export const Dialpad = ({ navigation }) => {
  const [number, setNumber] = useState('');
  const [isDialing, setIsDialing] = useState(false);

  const handleCall = async () => {
    // Validate
    if (!number || number.length < 5) {
      Alert.alert('Invalid Number', 'Please enter a valid phone number');
      return;
    }

    try {
      setIsDialing(true);
      
      // Get stored credentials
      const creds = await AsyncStorage.getItem('sip_credentials');
      const { username, password, server, port } = JSON.parse(creds);
      
      // Initiate call
      await makeCall(username, password, server, port, number);
      
      // Navigate to outgoing call screen
      navigation.navigate('OutgoingCall', { remoteNumber: number });
      
      // Listen for call state
      const unsubscribe = onCallState((event) => {
        if (event.state === 'connected') {
          // Audio is flowing, can now show active call UI
          console.log('[SIP] Call connected');
        } else if (event.state === 'ended') {
          unsubscribe();
          // Save to history
          saveCallHistory({
            number,
            type: 'outgoing',
            duration: event.duration || 0,
            timestamp: new Date().toISOString(),
          });
          navigation.navigate('Home');
        }
      });
    } catch (error) {
      Alert.alert('Call Error', error.message);
    } finally {
      setIsDialing(false);
    }
  };

  return (
    <View>
      {/* Dialpad UI */}
      <TextInput 
        value={number} 
        onChangeText={setNumber}
        placeholder="Enter number"
      />
      <Button 
        title="Call" 
        onPress={handleCall}
        disabled={isDialing}
      />
    </View>
  );
};
```

**2. Active Call Screen**
```javascript
// screens/active-call/ActiveCall.jsx
import { hangupCall, toggleMute, toggleSpeaker } from '../../services/sipService';

export const ActiveCall = ({ route, navigation }) => {
  const { remoteNumber } = route.params;
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);

  // Timer for call duration
  useEffect(() => {
    const interval = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleHangup = async () => {
    try {
      await hangupCall();
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Error', 'Failed to end call');
    }
  };

  const handleToggleMute = async () => {
    try {
      await toggleMute();
      setIsMuted(!isMuted);
    } catch (error) {
      console.error('[SIP] Failed to toggle mute:', error);
    }
  };

  const handleToggleSpeaker = async () => {
    try {
      await toggleSpeaker();
      setIsSpeaker(!isSpeaker);
    } catch (error) {
      console.error('[SIP] Failed to toggle speaker:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.number}>{remoteNumber}</Text>
      <Text style={styles.duration}>{formatDuration(duration)}</Text>
      
      <View style={styles.controls}>
        <TouchableOpacity 
          style={[styles.btn, isMuted && styles.active]}
          onPress={handleToggleMute}
        >
          <Icon name={isMuted ? 'mic-off' : 'mic'} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.hangup}
          onPress={handleHangup}
        >
          <Icon name="phone" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.btn, isSpeaker && styles.active]}
          onPress={handleToggleSpeaker}
        >
          <Icon name="speaker" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
```

## WebRTC Media Setup

**Status:** Configured in `src/services/webrtcSetup.js` but not yet integrated with active calls.

### Current Initialization
```javascript
// services/webrtcSetup.js
import { RTCPeerConnection, RTCSessionDescription } from 'react-native-webrtc';

export const initializeWebRTC = async () => {
  try {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: ['stun:stun.l.google.com:19302'] },
      ],
    });
    
    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('[WebRTC] ICE candidate:', event.candidate);
        // Send to SIP signaling
      }
    };
    
    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log('[WebRTC] Received remote stream');
      // Display audio/video
    };

    return peerConnection;
  } catch (error) {
    console.error('[WebRTC] Initialization failed:', error);
    throw error;
  }
};
```

## Event System Architecture

### Event Types

```javascript
// 1. Registration State
onRegistrationState(handler: (state: string) => void)
// State values: 'registering', 'registered', 'registration_failed'

// 2. Incoming Call
onIncomingCall(handler: (event: { remoteNumber, displayName, state }) => void)

// 3. Call State
onCallState(handler: (event: { state, duration, ... }) => void)
// State values: 'connecting', 'ringing', 'connected', 'ended'
```

### Memory Management

**Always unsubscribe when component unmounts:**

```javascript
useEffect(() => {
  const unsubscribe = onIncomingCall(handler);
  return unsubscribe; // Called on unmount
}, []);
```

Without cleanup, listeners accumulate and fire multiple times. This is the #1 bug in SIP applications.

## Error Handling

### Common Registration Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `NativeModules.SipRegistration undefined` | Native module not linked | Run `npm run android` or rebuild |
| `401 Unauthorized` | Wrong credentials | Check username, password, server address |
| `REGISTER timeout` | Server unreachable | Check network, server address, port |
| `Invalid password` | Password chars not escaped | Use raw password, don't escape |

### Common Call Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Call rejected` | Remote party declined | Normal behavior, offer to retry |
| `Media not available` | Audio permission denied | Request RECORD_AUDIO permission |
| `Call timeout` | Remote not responding | Retry or inform user server issue |

### User-Friendly Error Messages

```javascript
const getUserFriendlyError = (error) => {
  if (error.includes('401') || error.includes('unauthorized')) {
    return 'Invalid username or password';
  }
  if (error.includes('timeout') || error.includes('unreachable')) {
    return 'Server not responding. Check your connection.';
  }
  if (error.includes('permission')) {
    return 'Microphone access required. Enable in Settings.';
  }
  return 'An error occurred. Please try again.';
};
```

## Platform Limitations

### Android ✅
- Full SIP support via native module
- WebRTC audio/video
- Call recording possible

### iOS ⚠️
- SIP not supported (native module is Android-only)
- Alternative: Implement via WebRTC or VoIP push (CallKit)
- Current app focuses on Android first

## Testing SIP Locally

### Start SIP Server (Docker)
```bash
# Run Asterisk SIP server
docker run -d --name asterisk \
  -p 5060:5060/udp \
  -p 5060:5060/tcp \
  asterisk:latest
```

### Test with Credentials
- **Username**: 1000 (default Asterisk extension)
- **Password**: 1000
- **Server**: localhost or machine IP
- **Port**: 5060

### Test Calls
1. Register in app with above credentials
2. In another terminal, register another extension (2000)
3. From app, dial 2000 to test outgoing call
4. From extension 2000, dial 1000 to test incoming call

## Common Workflows

### Add New Spoken Feature
1. Plan where in call flow it fits
2. Add listener in appropriate screen or service
3. Handle async state updates
4. Test with real SIP server (not mock)

### Debug No Audio Issues
1. Check permissions in Android manifest
2. Verify speaker mode is set correctly
3. Check logcat for WebRTC errors
4. Test on physical device (emulator audio issues common)

### Handle Network Switch During Call
1. Listen for network state change
2. Re-REGISTER with SIP if needed
3. Notify user about connection change
4. Gracefully end call if no connectivity

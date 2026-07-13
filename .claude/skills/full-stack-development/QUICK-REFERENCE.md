# Quick Reference Guide

## Common NPM Commands

```bash
# Development
npm start              # Start Metro dev server
npm run android        # Build and run on Android
npm run ios            # Build and run on iOS
npm test               # Run tests
npm lint               # Run ESLint
npm run format         # Format code with Prettier

# Production
npm run build          # Build for production
npm run bundle         # Create Android app bundle
```

## Git Workflows

```bash
# Create feature branch
git checkout -b feature/my-feature

# Commit changes
git add src/
git commit -m "description of changes"

# Push to remote
git push -u origin feature/my-feature

# Create pull request (via GitHub/GitLab)
# ... review and merge ...

# Clean up local branch
git branch -d feature/my-feature
```

## React Native Structure

### Creating a New Screen
1. Create file in `src/screens/feature-name/FeatureName.jsx`
2. Export screen component
3. Add to navigation in `src/navigations/Stack.jsx` or `src/navigations/Bottom.jsx`
4. Test navigation

### Creating a Reusable Component
1. Create file in `src/components/ComponentName.jsx`
2. Define component with props
3. Add PropTypes or TypeScript types
4. Export from `src/components/index.js` (if index exists)

### Adding a Service
1. Create file in `src/services/featureService.js`
2. Define export functions
3. Add error handling
4. Add logging with `[Feature]` prefix
5. Export from service file

## Backend (NestJS) Structure

### Creating a Module
```bash
nest generate module feature
nest generate service feature
nest generate controller feature
```

### API Endpoints
- GET `/api/feature` - List all
- GET `/api/feature/:id` - Get one
- POST `/api/feature` - Create
- PATCH `/api/feature/:id` - Update
- DELETE `/api/feature/:id` - Delete

### Testing
```bash
npm run test              # Run tests
npm run test:watch       # Watch mode
npm run test:e2e         # End-to-end tests
```

## Database (PostgreSQL/Supabase)

### Connecting Locally
```bash
psql -U username -d database_name
```

### Common SQL
```sql
-- View table structure
\d table_name

-- List all tables
\dt

-- Run SQL file
\i file.sql

-- Export data
\copy table_name TO 'output.csv' WITH CSV HEADER
```

### Supabase CLI
```bash
supabase start              # Start local Supabase
supabase stop               # Stop local Supabase
supabase db push            # Push migrations to remote
supabase db pull            # Pull schema from remote
```

## Android Debugging

### View Logs
```bash
adb logcat | grep SIP       # Filter SIP logs
adb logcat -c               # Clear logs
adb devices                 # List connected devices
```

### Run on Device
```bash
adb install app.apk
adb shell am start -n package/.MainActivity
```

### Gradle
```bash
cd android
./gradlew build              # Build
./gradlew bundleRelease     # Create App Bundle
./gradlew clean             # Clean build
```

## iOS Debugging

### View Logs
```bash
xcrun simctl list                           # List simulators
xcrun simctl boot <udid>                    # Boot simulator
xcrun simctl install booted app.app         # Install app
```

### Build
```bash
xcodebuild build                   # Build for simulator
xcodebuild -scheme newapp archive  # Archive for release
```

## Firebase Configuration

### Login
```bash
firebase login
firebase projects:list
firebase use project-id
```

### Deploy Functions
```bash
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only storage
```

## Useful Tools

### REST Client
- **Postman** - GUI REST client
- **cURL** - Command-line HTTP client
- **Thunder Client** - VS Code extension
- **REST Client** - VS Code extension

### Database Tools
- **pgAdmin** - PostgreSQL UI
- **DBeaver** - Universal database tool
- **Supabase Studio** - Web-based SQL editor

### Mobile Testing
- **Android Studio** - Android emulator and debugging
- **Xcode** - iOS simulator and debugging
- **React Native Debugger** - JavaScript debugging

### Performance Profiling
- **React DevTools Profiler** - Component rendering
- **Android Profiler** - Android CPU, memory, network
- **Xcode Instruments** - iOS performance profiling

## Debugging Checklist

### App Won't Start
- [ ] Check native logs (logcat/Console.app)
- [ ] Verify all dependencies installed
- [ ] Clear Metro cache: `npm start -- --reset-cache`
- [ ] Clear Android/iOS build: `cd android && gradlew clean`
- [ ] Check for port conflicts (Metro uses 8081)

### API Not Working
- [ ] Check API server is running
- [ ] Verify endpoint URL and method
- [ ] Test with Postman/cURL first
- [ ] Check server logs
- [ ] Verify authentication token

### Database Issues
- [ ] Check connection string
- [ ] Verify database is running
- [ ] Check for missing migrations
- [ ] Verify user permissions
- [ ] Check for locked tables

### Navigation Issues
- [ ] Verify screen registered in navigator
- [ ] Check route name matches
- [ ] Test navigation params passed correctly
- [ ] Check for circular navigation
- [ ] Verify listeners cleaned up on unmount

### Performance Issues
- [ ] Profile with React DevTools
- [ ] Check for unnecessary re-renders
- [ ] Look for memory leaks
- [ ] Check large image sizes
- [ ] Profile native code if needed

## File Locations

```
src/
├── screens/               # All feature screens
├── navigations/
│   ├── Stack.jsx         # Main stack navigation
│   └── Bottom.jsx        # Tab navigation
├── services/
│   ├── sipService.js     # SIP logic
│   ├── callHistoryService.js
│   └── webrtcSetup.js
├── components/           # Reusable components
├── utils/
│   └── svgs/            # SVG icons
└── assets/              # Images, fonts

android/
├── app/src/main/
│   ├── java/            # Kotlin code
│   └── AndroidManifest.xml
└── build.gradle         # Dependencies

ios/
├── newapp/              # Swift code
└── Podfile              # CocoaPods dependencies
```

## Project-Specific Snippets

### ✅ SIP Event Listener with Cleanup (CRITICAL PATTERN)
```javascript
// In screens/home/Home.jsx or any SIP-connected screen
import { onIncomingCall } from '../../services/sipService';

export const Home = ({ navigation }) => {
  useEffect(() => {
    // Subscribe to incoming calls
    const unsubscribe = onIncomingCall((event) => {
      navigation.navigate('IncomingCall', {
        remoteNumber: event.remoteNumber,
        displayName: event.displayName,
      });
    });

    // REQUIRED: Cleanup when component unmounts
    return unsubscribe;
  }, [navigation]); // Navigation dependency

  return (
    <View>
      {/* Screen content */}
    </View>
  );
};
```

### Save & Load SIP Credentials (Login Pattern)
```javascript
// Login.jsx - Save on checkbox
const handleRememberMe = async (username, password, server, port) => {
  if (rememberMe) {
    await AsyncStorage.setItem('sip_credentials', JSON.stringify({
      username, password, server, port
    }));
  }
};

// Login.jsx - Auto-load on mount
useEffect(() => {
  const loadCredentials = async () => {
    try {
      const creds = await AsyncStorage.getItem('sip_credentials');
      if (creds) {
        const { username, password, server, port } = JSON.parse(creds);
        setUsername(username);
        setPassword(password);
        setRememberMe(true);
      }
    } catch (error) {
      console.log('[Auth] Failed to load saved credentials:', error);
    }
  };
  
  loadCredentials();
}, []);
```

### Register SIP & Listen for State Changes
```javascript
// In services/sipService.js
export const registerSIP = async (username, password, server, port) => {
  // Validate
  if (!username || !password || !server || !port) {
    throw new Error('Missing registration parameters');
  }
  
  if (Platform.OS !== 'android') {
    throw new Error('SIP only supported on Android');
  }

  try {
    const result = await NativeModules.SipRegistration.registerSIP(
      username, password, server, port
    );
    console.log('[SIP] Registration sent:', result);
    return result;
  } catch (error) {
    console.error('[SIP] Registration failed:', error);
    throw error;
  }
};

// In screens/login/Login.jsx
const handleLogin = async () => {
  try {
    await registerSIP(username, password, server, port);
    
    // Listen for registration state
    onRegistrationState((state) => {
      if (state === 'registered') {
        navigation.navigate('BottomTabs'); // Success
      } else if (state === 'registration_failed') {
        setError('Invalid credentials or server unreachable');
      }
    });
  } catch (error) {
    setError(error.message);
  }
};
```

### Call History Service (Append-Only Max 100)
```javascript
// services/callHistoryService.js
export const saveCallHistory = async (call) => {
  try {
    let history = await getCallHistory();
    
    // Add new call at beginning, keep only last 100
    const newCall = {
      ...call,
      id: Date.now(),
      timestamp: new Date().toISOString(),
    };
    
    history = [newCall, ...history].slice(0, 100);
    await AsyncStorage.setItem('call_history', JSON.stringify(history));
    console.log('[CallHistory] Saved. Total calls:', history.length);
  } catch (error) {
    console.error('[CallHistory] Failed to save:', error);
    throw error;
  }
};

export const getCallHistory = async () => {
  try {
    const data = await AsyncStorage.getItem('call_history');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('[CallHistory] Failed to load:', error);
    return []; // Fallback empty array
  }
};

// In screens/history/History.jsx
export const History = () => {
  const [calls, setCalls] = useState([]);

  useEffect(() => {
    const loadHistory = async () => {
      const history = await getCallHistory();
      setCalls(history);
    };
    
    loadHistory();
  }, []);

  return (
    <FlatList
      data={calls}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <CallHistoryItem call={item} />
      )}
    />
  );
};
```

### Navigate from SIP Service (Outside React Tree)
```javascript
// In App.jsx - Export navigation reference
export const navigationRef = React.createRef();

export default function App() {
  return (
    <NavigationContainer ref={navigationRef}>
      {/* Navigation structure */}
    </NavigationContainer>
  );
}

// In services/sipService.js - Use reference for programmatic nav
import { navigationRef } from '../App';

export const initializeSipListeners = () => {
  onIncomingCall((event) => {
    console.log('[SIP] Incoming call from:', event.remoteNumber);
    navigationRef.navigate('IncomingCall', {
      remoteNumber: event.remoteNumber,
      displayName: event.displayName,
    });
  });

  onCallState((event) => {
    if (event.state === 'connected') {
      navigationRef.navigate('OutgoingCall', { callInfo: event });
    } else if (event.state === 'ended') {
      // Save to history
      saveCallHistory({
        number: event.remoteNumber,
        type: 'outgoing',
        duration: event.duration,
      });
      navigationRef.navigate('Home');
    }
  });
};
```

### Make Outgoing Call
```javascript
// In screens/dialpad/Dialpad.jsx
import { makeCall, onCallState } from '../../services/sipService';

export const Dialpad = ({ navigation }) => {
  const [number, setNumber] = useState('');

  const handleCall = async () => {
    try {
      await makeCall(username, password, server, port, number);
      
      // Listen for call state
      const unsubscribe = onCallState((event) => {
        if (event.state === 'connected') {
          navigation.navigate('OutgoingCall', { remoteNumber: number });
        } else if (event.state === 'ended') {
          unsubscribe();
          navigation.goBack();
        }
      });
    } catch (error) {
      Alert.alert('Call Error', error.message);
    }
  };

  return (
    <View>
      <TextInput value={number} onChangeText={setNumber} />
      <Button title="Call" onPress={handleCall} />
    </View>
  );
};
```

### WebRTC Setup (Media Configuration)
```javascript
// In services/webrtcSetup.js
import { RTCPeerConnection, RTCSessionDescription } from 'react-native-webrtc';

export const initializeWebRTC = async () => {
  try {
    // Request permissions
    const permissions = await checkMultiplePermissions([
      PERMISSIONS.ANDROID.RECORD_AUDIO,
      PERMISSIONS.ANDROID.CAMERA,
    ]);

    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: ['stun:stun.l.google.com:19302'] },
      ],
    });

    console.log('[WebRTC] Initialized');
    return peerConnection;
  } catch (error) {
    console.error('[WebRTC] Initialization failed:', error);
    throw error;
  }
};
```

### Generic Snippets

### NestJS Service
```typescript
@Injectable()
export class FeatureService {
  constructor(private db: DatabaseService) {}

  async getAll() {
    return this.db.feature.findMany();
  }
}
```

### PostgreSQL Migration
```sql
-- Up
CREATE TABLE features (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Down
DROP TABLE features;
```

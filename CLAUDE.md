# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A React Native softphone application that enables VoIP calling through SIP (Session Initiation Protocol). The app integrates with native Android SIP modules for call management, WebRTC for media handling, and provides features like contact management, call history, dialpad, and voicemail support.

**Key Tech Stack:**
- React Native 0.86.0 (using JSX)
- React Navigation 7.x (stack + bottom tabs)
- Native Android SIP module (via react-native-linphone)
- WebRTC (react-native-webrtc)
- JsSIP library for SIP protocol
- AsyncStorage for persistent data
- React 19.2.3
- TypeScript support (tsconfig configured, but codebase uses JSX)
- Babel 7.25+ and Metro bundler

## Common Commands

```bash
# Installation
npm install

# Start Metro dev server
npm start

# Build and run Android
npm run android

# Run linter
npm lint

# Run tests
npm test

# Single test file (e.g., App.test.js)
npm test -- App.test.js
```

**Note:** iOS support is configured but the native SIP module is Android-only. iOS SIP calls would require alternative implementation.

## Architecture Overview

### Directory Structure

- **`src/screens/`** - Feature screens organized by feature (home, dialpad, contact, login, incoming/outgoing calls, settings, etc.)
- **`src/navigations/`** - React Navigation setup (Stack.jsx for stack navigator, Bottom.jsx for tab navigator)
- **`src/services/`** - Business logic layer:
  - `sipService.js` - Core SIP registration, call control, and event listeners
  - `callHistoryService.js` - Call history persistence via AsyncStorage
  - `webrtcSetup.js` - WebRTC media configuration
- **`src/components/`** - Reusable UI components (CustomAlert, Header, etc.)
- **`src/utils/svgs/`** - SVG icon definitions
- **`src/assets/`** - Images and fonts
- **`android/`** - Native Android code (includes SIP native module)

### Navigation Flow

**Stack Navigator** (top-level, manages screen replacement):
- Splash → Onboarding → Slider → Login → BottomTabs (main app)
- Full-screen overlays: IncommingCall, OutgoingCall, VoiceMail, RecentCallHistory, UpgradeToPremium
- Settings screens: SipAccountScreen, CallQualityScreen, HelpAndSupportScreen

**Bottom Tab Navigator** (within BottomTabs):
- Home, Contact, Dial (floating center button), History, Profile (Settings)

### Service Layer

#### SIP Service (`src/services/sipService.js`)

**Core Functions:**
- `registerSIP(username, password, server, port)` - Registers user with SIP server via native module
- `makeCall(username, password, server, port, destination)` - Initiates outgoing call
- `answerCall()`, `declineCall()`, `hangupCall()` - Call control
- `toggleMute()`, `toggleSpeaker()` - Audio controls

**Event System:**
Three event emitters for listening to native module events:
- `onRegistrationState(handler)` - Fired when SIP registration state changes
- `onIncomingCall(handler)` - Fired when incoming call arrives (triggers navigation to IncommingCall screen)
- `onCallState(handler)` - Fired when call state changes (connected, ringing, ended, etc.)

Each listener returns an unsubscribe function. Example:
```javascript
const unsubscribe = onIncomingCall((event) => {
  // event: { remoteNumber, displayName, state, ... }
});
return unsubscribe; // cleanup
```

**Important:** The service validates that the native module is available before operations. Android-only; will throw error on iOS.

#### Call History Service (`src/services/callHistoryService.js`)

- `saveCallHistory(call)` - Appends call to history (max 100 entries), stored in AsyncStorage
- `getCallHistory()` - Retrieves call history, returns empty array on error

Call records include: id (timestamp), phone number, type, duration, timestamp.

### Data Persistence

- **AsyncStorage** used for:
  - SIP credentials (Login screen)
  - Call history (up to 100 entries)
- **Remember Me** checkbox saves credentials locally for next login

## Important Patterns & Conventions

### Event Listener Cleanup

Always unsubscribe from SIP events when component unmounts:
```javascript
useEffect(() => {
  const unsubscribe = onIncomingCall(handler);
  return unsubscribe; // cleanup on unmount
}, []);
```

### Error Handling

- SIP registration/call errors are caught and re-thrown with user-friendly messages
- Validation happens before native module calls (username, password, server, destination checks)
- Log tags (`[SIP]`, `[CallHistory]`) used for debugging

### Screen Navigation

- Use `navigationRef` (exported from App.jsx) to navigate programmatically from outside React tree (e.g., from SIP event listeners)
- Incoming calls trigger navigation to IncommingCall screen with caller info passed as route params

### Form Validation

Login screen validates all required fields and displays field-level error messages. Pattern: `errors` object tracks validation state.

## Development Notes

### Native Module Integration

The Android native SIP module (`react-native-linphone`) is accessed via `NativeModules.SipRegistration`. 
- Exposes: `registerSIP()`, `makeCall()`, `answerCall()`, `declineCall()`, `hangupCall()`, `toggleSpeaker()`, `toggleMute()`, `unregisterSIP()`
- Events emitted: `sipRegistrationState`, `sipIncomingCall`, `sipCallState`
- Version check ensures native module v6 is installed; older versions throw error with rebuild instructions

**Rebuilding after native changes:**
```bash
cd android && gradlew clean && cd .. && npx react-native run-android
```

### Styling

- Inline `StyleSheet.create()` used throughout
- Color scheme: Green accent (`#006E1C`), gray neutrals, gradient backgrounds
- Safe area context integrated for notch/safe area handling

### Platform-Specific Code

- `Platform.OS === 'android'` check in sipService.js (SIP only works on Android)
- React Native Screens for performance optimization
- iOS will need alternative SIP implementation or WebRTC-based fallback

### Testing

Jest configured with React Native preset. Tests should mock:
- AsyncStorage
- NativeModules.SipRegistration
- Navigation context
- Platform checks

## Debugging Tips

- SIP logs prefixed with `[SIP]` in console
- CallHistory logs prefixed with `[CallHistory]`
- Metro dev menu: Reload (R), Dev Menu (Ctrl+M on Android, Cmd+M on iOS)
- Check native logcat for Android SIP module errors: `adb logcat | grep SIP`

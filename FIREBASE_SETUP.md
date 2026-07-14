# Firebase Authentication Setup Guide

## Overview
Your app now supports persistent authentication with Firebase. Users who successfully register will remain logged in even after closing and reopening the app, until they manually log out.

## Features Implemented
1. **Persistent Authentication** - Users stay logged in after app restart
2. **Local & Cloud Storage** - SIP credentials stored locally + synced to Firestore
3. **Firebase Integration** - Ready for cloud-based credential management
4. **Logout Functionality** - Users can log out from the Settings screen

## Installation Steps

### Step 1: Install Firebase Firestore (Optional but Recommended)
If you want to sync credentials to the cloud for multi-device support:

```bash
npm install @react-native-firebase/firestore
```

After installing, rebuild the app:
```bash
cd android && gradlew clean && cd ..
npm run android
```

### Step 2: Set Up Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create or select your project
3. Enable Firestore Database in your project
4. Download `google-services.json` from Firebase Console
5. Place it in `android/app/` directory (already listed in `.gitignore`)

### Step 3: Configure Firestore Security Rules
Replace your Firestore security rules with:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

## How It Works

### Login Flow
1. User fills in SIP credentials (username, password, server, port)
2. App registers with SIP server via `registerSIP()`
3. Credentials are saved locally via AsyncStorage
4. If Firestore is installed, credentials sync to cloud
5. User ID stored for future authentication checks

### Auto-Login Flow
1. Splash screen loads (3 seconds)
2. Checks `firebaseService.isUserAuthenticated()`
3. If authenticated, navigates directly to **BottomTabs** (main app)
4. If not authenticated, navigates to Onboarding flow

### Logout Flow
1. User taps "Log Out" in Settings
2. Confirms logout in alert dialog
3. Local credentials cleared via `firebaseService.clearCredentials()`
4. Firestore updated with logout timestamp (if available)
5. Navigation resets to Login screen

## File Changes

### New Files
- `src/services/firebaseService.js` - Firebase credential management

### Modified Files
- `src/screens/login/Login.jsx` - Uses `firebaseService.saveSIPCredentials()`
- `src/screens/splashscreen/Splash.jsx` - Checks authentication on app start
- `src/screens/setting/Setting.jsx` - Uses `firebaseService.logoutUser()`

## API Reference

### firebaseService.saveSIPCredentials(userId, credentials)
Saves SIP credentials locally and syncs to Firestore.
```javascript
const userId = `${username}_${Date.now()}`;
await firebaseService.saveSIPCredentials(userId, {
  username: 'john_doe',
  password: '****',
  server: 'sip.example.com',
  port: '5060'
});
```

### firebaseService.isUserAuthenticated()
Checks if user is currently authenticated.
```javascript
const isAuth = await firebaseService.isUserAuthenticated();
if (isAuth) {
  // User is logged in
}
```

### firebaseService.getLocalSIPCredentials()
Retrieves stored SIP credentials from device.
```javascript
const creds = await firebaseService.getLocalSIPCredentials();
// Returns: { username, password, server, port }
```

### firebaseService.logoutUser(userId)
Clears credentials and updates Firestore logout timestamp.
```javascript
await firebaseService.logoutUser(userId);
// User is now logged out
```

### firebaseService.clearCredentials()
Removes all stored credentials from device.
```javascript
await firebaseService.clearCredentials();
```

## Troubleshooting

### Issue: "Firestore not available"
**Solution:** This is a warning if `@react-native-firebase/firestore` is not installed. The app will still work with local storage. Install the package for cloud sync.

### Issue: User not staying logged in
**Solution:** Check that `firebaseService.saveSIPCredentials()` is called after successful SIP registration.

### Issue: Firestore sync failing
**Solution:** 
1. Verify Firebase project is set up correctly
2. Check Firestore security rules allow authenticated users
3. Ensure `google-services.json` is in `android/app/`
4. Check device has internet connectivity

### Issue: User can't logout
**Solution:** Check that the user taps "Log Out" in Settings screen and confirms in the alert dialog.

## Security Considerations

⚠️ **Important:** Passwords are stored locally on the device. Consider:
1. Using device encryption (enabled by default on modern Android)
2. Implementing additional security measures for sensitive credentials
3. Never storing passwords on Firebase - use token-based authentication instead
4. Implementing token refresh mechanism for long-lived sessions

## Future Enhancements

1. **Firebase Authentication** - Use Firebase Auth instead of storing passwords
2. **Token-Based Auth** - Replace password storage with OAuth/JWT tokens
3. **Biometric Login** - Add fingerprint/face recognition support
4. **Multi-Device Support** - Access credentials across multiple devices
5. **Encrypted Storage** - Use react-native-keychain for better security

## Testing

### Test Auto-Login
1. Log in with SIP credentials
2. Close the app
3. Reopen the app
4. Should skip to main app without login screen

### Test Logout
1. Tap "Profile" tab
2. Scroll down and tap "Log Out"
3. Confirm logout
4. Should return to Login screen
5. Reopen app, should show login screen

## Support
If you encounter issues, check:
- Android logcat: `adb logcat | grep Firebase`
- Console logs prefixed with `[Firebase]`
- Firestore rules and security permissions

# Complete Technology Stack Reference

## Frontend - React Native

**Version:** 0.86.0
**Purpose:** Cross-platform mobile app for iOS and Android

### Key Libraries
- `react`: UI framework (v19.2.3)
- `react-navigation`: Screen and tab navigation
- `react-native-webrtc`: WebRTC media handling
- `react-native-linphone`: Android SIP module
- `@react-native-async-storage/async-storage`: Local data persistence
- `react-native-safe-area-context`: Safe area handling

### Key Directories
- `src/screens/` - Feature screens (Home, Login, Dialpad, Contact, History, Settings)
- `src/navigations/` - Navigation setup (Stack and Tab navigators)
- `src/components/` - Reusable components (Header, CustomAlert, etc.)
- `src/services/` - Business logic services
- `src/utils/` - Utilities and SVG icons
- `src/assets/` - Images, fonts, and static resources

### Navigation Structure
```
Stack Navigator:
  Splash → Onboarding → Slider → Login → BottomTabs
  
BottomTabs:
  Home | Contact | Dial | History | Profile/Settings
  
Full-Screen Overlays:
  IncomingCall, OutgoingCall, VoiceMail, RecentCallHistory, UpgradeToPremium
```

## Backend - NestJS

**Framework:** Progressive Node.js framework
**Purpose:** RESTful API server for the softphone application

### Key Concepts
- **Modules**: Feature-based organization
- **Controllers**: HTTP endpoint handlers
- **Services**: Business logic and database access
- **Providers**: Dependency injection
- **Guards/Interceptors**: Authentication and cross-cutting concerns
- **Pipes**: Data transformation and validation

### Typical Structure
```
src/
├── modules/
│   ├── auth/          # Authentication & authorization
│   ├── calls/         # Call management
│   ├── contacts/      # Contact management
│   └── ...
├── common/            # Shared utilities
├── database/          # ORM configuration
└── main.ts            # Application entry point
```

### Common Patterns
- TypeORM or Prisma for database access
- JWT for API authentication
- Validation using class-validator
- Error handling with custom exceptions
- Logging using Winston or Pino

## Database - PostgreSQL

**Purpose:** Primary relational database for persistent data

### Key Concepts
- Tables for structured data (users, calls, contacts, etc.)
- Migrations for schema versioning
- Indexes for query performance
- Constraints for data integrity
- Transactions for atomic operations

### Common Operations
```sql
-- Migrations
CREATE TABLE users (id SERIAL PRIMARY KEY, ...);
ALTER TABLE calls ADD COLUMN duration INTEGER;

-- Queries
SELECT * FROM call_history WHERE user_id = $1;
UPDATE users SET last_login = NOW() WHERE id = $1;
```

## Technology Selection Guide

### When to Use PostgreSQL (Direct) vs Supabase vs Firebase

| Need | PostgreSQL | Supabase | Firebase | Decision |
|------|-----------|----------|----------|----------|
| **Relational Data** | ✅ Native | ✅ Native | ❌ NoSQL only | Use PostgreSQL/Supabase |
| **Real-Time Updates** | ❌ Polling | ✅ WebSocket | ✅ WebSocket | Use Supabase/Firebase |
| **User Auth** | ❌ Manual | ✅ JWT/RLS | ✅ Built-in | Use Supabase/Firebase |
| **Mobile Backend** | ❌ Complex | ✅ Perfect | ✅ Perfect | Use Supabase/Firebase |
| **Cost Control** | ✅ Cheap | ✅ Affordable | ⚠️ Can scale | Use PostgreSQL/Supabase |
| **Server-Side Only** | ✅ Best | ❌ Overkill | ❌ Overkill | Use PostgreSQL |

### For This VoIP App

**Current Stack:** React Native (frontend) + Android SIP (native) + AsyncStorage (local)

**Backend Recommendation:**

**Phase 1** (Current): No backend needed
- User credentials stored in AsyncStorage
- Call history stored locally
- All SIP signaling via native Android module

**Phase 2** (Future): Add backend when you need:
- Cloud sync of call history
- User accounts across devices
- Real-time call notifications
- Voicemail storage

**Recommended Stack for Phase 2:**
```
React Native App
       ↓
   Supabase (PostgreSQL + Auth + Real-time)
       ↓
   Database: users, call_history, contacts
```

Why Supabase?
- PostgreSQL for relational data (call history, contacts)
- Real-time subscriptions for instant call history sync
- Built-in auth (JWT)
- Row-Level Security to prevent users seeing other users' data

## Supabase (Recommended for Backend)

**Purpose:** PostgreSQL-backed backend as a service

### Key Features
- **PostgreSQL Database**: Full SQL database for relational data
- **Authentication**: JWT-based auth with automatic RLS
- **Real-Time Subscriptions**: Live data updates to mobile client
- **Edge Functions**: Serverless functions for complex logic
- **File Storage**: Object storage for voicemail/recordings
- **Row-Level Security (RLS)**: Database-level access control (no SQL injection possible)

### Advantages for This App
- Direct SQL access (easy migrations)
- Real-time call history sync across devices
- Open-source (easy self-hosting if needed)
- Perfect for mobile-first architecture

### Integration with React Native
```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
});

// Real-time call history
supabase
  .from('call_history')
  .on('*', payload => {
    console.log('Call history updated:', payload);
  })
  .subscribe();

// Insert call record
await supabase.from('call_history').insert({
  user_id: user.id,
  remote_number: '+1234567890',
  duration: 120,
  type: 'incoming'
});
```

## Firebase

**Purpose:** Alternative cloud services (use if you need specific Firebase features)

### Key Services
- **Authentication**: Email/password, OAuth, phone auth, SMS
- **Cloud Firestore**: NoSQL database (not ideal for relational data)
- **Realtime Database**: Real-time JSON (older, use Firestore)
- **Cloud Storage**: File storage for voicemail
- **Cloud Functions**: Serverless functions
- **Analytics**: Usage tracking and crash reporting
- **Push Notifications**: Remote notifications for incoming calls
- **Cloud Messaging**: FCM for VoIP push notifications

### When to Choose Firebase
- You need VoIP push notifications (FCM)
- You're building for both iOS and Android (Firebase has iOS support)
- You want integrated analytics
- You prefer NoSQL for flexibility

### When NOT to Use Firebase
- You need relational data (call history, contacts, relationships)
- You want direct SQL access for complex queries
- You want row-level security at database level
- Cost is a concern (Firebase scales aggressively)

### Integration Example
```javascript
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Authentication
const user = await auth().createUserWithEmailAndPassword('email', 'password');

// Store call record (less ideal than PostgreSQL for structured data)
await firestore().collection('users').doc(user.uid).collection('calls').add({
  remoteNumber: '+1234567890',
  duration: 120,
  type: 'incoming',
  createdAt: new Date(),
});
```

## Mobile Platforms

### Android (Kotlin)

**Purpose:** Native code for Android-specific features

#### Key Components
- **SIP Module**: Handle VoIP signaling via JNI
- **WebRTC Integration**: Media handling
- **Permissions**: Runtime permissions for contacts, microphone
- **Services**: Background services for call handling

#### Gradle
- Build configuration and dependencies
- Signing configuration for releases
- Product flavors for different builds

### iOS (Swift)

**Purpose:** Native code for iOS-specific features

#### Key Components
- **Objective-C Interop**: React Native bridge
- **CallKit**: Native call UI integration
- **PushKit**: VoIP push notifications
- **Contacts Framework**: Access to device contacts

#### CocoaPods
- Dependency management
- Native library integration
- Linking native modules

## Development Tools

### Build & Bundling
- **Metro Bundler**: React Native bundler
- **Gradle**: Android build system
- **Xcode**: iOS build system

### Testing
- **Jest**: JavaScript testing framework
- **React Native Testing Library**: Component testing
- **Detox**: End-to-end testing for React Native

### Debugging
- **React DevTools**: Component inspector
- **Metro Debugger**: JavaScript debugger
- **Android Studio Debugger**: Native code debugging
- **Xcode Debugger**: iOS debugging

### Code Quality
- **ESLint**: JavaScript linting
- **Prettier**: Code formatting
- **TypeScript**: Type checking (optional, configured but not enforced)

## Deployment

### Android
1. Build signed APK/AAB with Gradle
2. Upload to Google Play Store
3. Manage versions and rollouts

### iOS
1. Build and sign with Xcode
2. Upload to App Store Connect
3. Manage TestFlight and releases

### Backend (NestJS)
1. Build with `npm run build`
2. Deploy to cloud (AWS, GCP, Heroku, etc.)
3. Run migrations before deploying new code
4. Monitor with logging and error tracking

### Database (PostgreSQL/Supabase)
1. Create migrations
2. Test migrations locally
3. Apply to staging environment
4. Deploy to production
5. Verify data integrity

---
name: full-stack-development
description: Full-stack development guidance for React Native, Kotlin, Swift, JavaScript, Firebase, Supabase, NestJS, and PostgreSQL. Use when building features, fixing bugs, or planning architecture across the mobile app, backend API, or database layers.
when_to_use: When working on mobile features (React Native, iOS/Android), backend APIs (NestJS), databases (PostgreSQL), cloud services (Firebase/Supabase), or cross-stack integration. Also use for architecture decisions, tech stack questions, or multi-layer debugging.
---

# Full-Stack Development Assistant

Your project is a **React Native softphone application** with a complete technology stack. This skill provides guidance across all layers:

## Technology Stack Overview

### 📱 Frontend & Mobile
- **React Native 0.86.0** - Cross-platform mobile app (iOS/Android)
- **React Navigation 7.x** - Navigation management
- **JavaScript/JSX** - Frontend logic and utilities

### 🔧 Mobile Platforms
- **Kotlin** - Android native modules and optimization
- **Swift** - iOS native modules and optimization

### 🖥️ Backend
- **NestJS** - Progressive Node.js framework
- **TypeScript** - Type-safe backend code

### 🗄️ Data & Services
- **PostgreSQL** - Primary relational database
- **Supabase** - PostgreSQL backend as a service
- **Firebase** - Authentication, storage, real-time features

## Core Capabilities

### React Native Development
- Component architecture and patterns
- Navigation setup and management
- State management strategies
- WebRTC media handling
- Native module integration
- Performance optimization
- Testing strategies

### Mobile Platform Integration
- **Kotlin/Android**: JNI bridges, Gradle, native modules, SIP integration
- **Swift/iOS**: Objective-C interop, CocoaPods, iOS SDK

### Backend Development (NestJS)
- Module and controller architecture
- Service layer patterns
- Database integration (TypeORM, Prisma)
- API design and REST principles
- Authentication and authorization
- Error handling and logging

### Database Management
- **PostgreSQL**: Schema design, migrations, performance, backups
- **Supabase**: Real-time subscriptions, edge functions, security
- **Firebase**: Firestore, Cloud Functions, authentication

## Project-Specific Context

This is a **VoIP softphone application** with:
- **SIP protocol integration** (Android native) — See [SIP-AND-WEBRTC.md](SIP-AND-WEBRTC.md) for patterns
- **WebRTC for media handling** — See [SIP-AND-WEBRTC.md](SIP-AND-WEBRTC.md) § WebRTC Setup
- **Contact management and call history** — Stored in AsyncStorage locally
- **Dialpad, voicemail, and incoming/outgoing calls** — Event-driven via SIP listeners
- **React Navigation**: Stack navigator + Bottom tabs
- **AsyncStorage for local data persistence** — See [BEST-PRACTICES.md](BEST-PRACTICES.md) § SIP Credentials

⚠️ **Important**: SIP only works on Android. iOS would need alternative implementation.

## Development Patterns

### Architecture Layers
- **Presentation**: React Native screens in `src/screens/`
- **Navigation**: React Navigation setup in `src/navigations/`
- **Services**: Business logic in `src/services/`
- **Components**: Reusable UI in `src/components/`
- **Utilities**: Helpers and assets in `src/utils/`

### Common Patterns
- **Event listeners** for native module communication (SIP events)
- **Service-based architecture** for business logic separation
- **Navigation ref** for programmatic navigation outside React tree
- **AsyncStorage** for persistent state
- **Error boundaries** for graceful error handling

### Best Practices
- Unsubscribe from event listeners on component unmount
- Validate input before native module calls
- Use error boundaries for screens
- Test navigation flows end-to-end
- Log with prefixes: `[SIP]`, `[CallHistory]`, `[Auth]`

## Typical Workflows

### Adding a Feature
1. Plan component structure and data flow
2. Create database schema if needed (Supabase/PostgreSQL)
3. Build backend API endpoints (NestJS)
4. Create React Native screens and navigation
5. Connect frontend to backend APIs
6. Add testing and error handling
7. Deploy to staging, then production

### Fixing a Bug
1. Identify the layer (frontend, backend, database, or native)
2. Add logging to trace the issue
3. Test in isolation (unit test or manual test)
4. Fix the root cause
5. Add a test to prevent regression
6. Verify across all platforms

### Database Schema Changes
1. Create migration script (Supabase or raw SQL)
2. Update ORM models (backend)
3. Update API endpoints if needed
4. Update React Native screens
5. Test data migration path
6. Deploy migrations before app code

### Native Integration
1. Plan native module interface
2. Implement Kotlin/Swift code
3. Create bridge code (JNI or React Native modules)
4. Test on physical devices
5. Handle platform-specific logic
6. Profile performance

## Key Files & Directories

```
src/
├── screens/          # Feature screens
├── navigations/      # Navigation configuration
├── services/         # Business logic (SIP, CallHistory)
├── components/       # Reusable UI components
├── utils/            # Utilities and helpers
└── assets/           # Images and fonts

android/             # Android native code
ios/                 # iOS native code
```

## Documentation Map

| Situation | Read This | Time |
|-----------|-----------|------|
| **New to SIP/VoIP?** | [SIP-AND-WEBRTC.md](SIP-AND-WEBRTC.md) | 20 min |
| **Building SIP features?** | [SIP-AND-WEBRTC.md](SIP-AND-WEBRTC.md) + [QUICK-REFERENCE.md](QUICK-REFERENCE.md) | 30 min |
| **Something broken?** | [DEBUGGING-GUIDE.md](DEBUGGING-GUIDE.md) | 10-30 min |
| **Copy-paste code?** | [QUICK-REFERENCE.md](QUICK-REFERENCE.md) | 5 min |
| **Design decision?** | [TECH-STACK.md](TECH-STACK.md) (decision matrix) | 5 min |
| **Code review?** | [BEST-PRACTICES.md](BEST-PRACTICES.md) § SIP patterns | 5 min |
| **Full overview?** | This file (SKILL.md) | 10 min |

## Quick Debugging

⚠️ **Most Common Issues:**

1. **Incoming calls not received** → Check event listener cleanup → [DEBUGGING-GUIDE.md](DEBUGGING-GUIDE.md) § Incoming Call Issues
2. **Listener fires multiple times** → Missing cleanup on unmount → [BEST-PRACTICES.md](BEST-PRACTICES.md) § Event Listener Management
3. **Registration never completes** → Check native module linking → [DEBUGGING-GUIDE.md](DEBUGGING-GUIDE.md) § SIP Registration
4. **No audio during call** → Check speaker mode and permissions → [DEBUGGING-GUIDE.md](DEBUGGING-GUIDE.md) § Audio Issues
5. **App crashes on login** → Native module undefined or AsyncStorage error → [DEBUGGING-GUIDE.md](DEBUGGING-GUIDE.md) § App Crashes

See [DEBUGGING-GUIDE.md](DEBUGGING-GUIDE.md) for step-by-step fixes.

## When to Escalate

- Complex architectural decisions → Design review with team
- Performance optimization → Profile with native tools first
- Security concerns → Code review with security checklist
- CI/CD issues → Check build logs and environment setup
- SIP protocol issues → Test with real SIP server, not mock

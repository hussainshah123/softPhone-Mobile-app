# Full-Stack Development Best Practices

## React Native Development

### Component Architecture
- Keep components focused and single-responsibility
- Extract reusable logic into custom hooks
- Use functional components with hooks
- Implement proper error boundaries for screens

### Navigation
- Always clean up listeners on unmount
- Use `navigationRef` for programmatic navigation outside React tree
- Pass data through route params, not global state for screen transitions
- Test navigation flows end-to-end

### State Management
- Use AsyncStorage for persistent data (user preferences, auth tokens)
- Use Context API for medium-scope state (theme, user info)
- Use local state (useState) for component-specific data
- Cache API responses to reduce network calls
- **SIP-specific**: Never store SIP credentials in Context; use AsyncStorage with secure storage consideration

### Performance Optimization
- Use `React.memo` for expensive components
- Optimize re-renders with useMemo and useCallback
- Lazy load screens in navigation
- Use FlatList instead of ScrollView for long lists
- Profile with React Native Debugger before optimizing
- **For VoIP**: Minimize re-renders during calls; audio processing is CPU-intensive

### Testing
- Write unit tests for business logic (utilities, services)
- Write integration tests for navigation flows
- Test error states and edge cases
- Mock NativeModules and AsyncStorage in tests
- **SIP Testing**: Mock `NativeModules.SipRegistration` for call flows; test event listener cleanup

## SIP & VoIP-Specific Patterns ⚠️ CRITICAL

### Event Listener Management
**This is THE most important pattern in this codebase.**

```javascript
// ✅ CORRECT - Always cleanup on unmount
useEffect(() => {
  const unsubscribe = onIncomingCall((event) => {
    // Handle incoming call
    navigationRef.navigate('IncomingCall', { caller: event });
  });
  
  return unsubscribe; // Cleanup function
}, []);

// ❌ WRONG - Memory leak, listeners accumulate
useEffect(() => {
  onIncomingCall((event) => {
    navigationRef.navigate('IncomingCall', { caller: event });
  });
  // No return statement = listener never cleaned up!
}, []);
```

**Why:** Each time the component mounts, a new listener is added. Without cleanup, old listeners persist, causing duplicate events and memory leaks. This is especially critical for SIP events which fire frequently.

### SIP Registration Error Handling
Always validate before calling native SIP:

```javascript
// ✅ CORRECT - Validate before native call
async function registerSIP(username, password, server, port) {
  // Validation
  if (!username || !password || !server || !port) {
    throw new Error('[SIP] Missing required registration parameters');
  }
  
  if (!Platform.OS === 'android') {
    throw new Error('[SIP] SIP only supported on Android');
  }
  
  try {
    const result = await NativeModules.SipRegistration.registerSIP(
      username, password, server, port
    );
    log('[SIP] Registration successful');
    return result;
  } catch (error) {
    log('[SIP] Registration failed:', error.message);
    throw error; // Re-throw with context
  }
}
```

### AsyncStorage for SIP Credentials
Safe credential persistence:

```javascript
// Save credentials (checkbox: Remember Me)
const saveSIPCredentials = async (username, password, server, port) => {
  try {
    const credentials = { username, password, server, port };
    await AsyncStorage.setItem('sip_credentials', JSON.stringify(credentials));
    log('[Auth] Credentials saved');
  } catch (error) {
    log('[Auth] Failed to save credentials:', error);
    // Don't throw - let user continue, may need manual login next time
  }
};

// Load credentials (auto-login)
const loadSIPCredentials = async () => {
  try {
    const creds = await AsyncStorage.getItem('sip_credentials');
    return creds ? JSON.parse(creds) : null;
  } catch (error) {
    log('[Auth] Failed to load credentials:', error);
    return null; // Fallback to manual login
  }
};
```

### Navigation from SIP Service (Outside React)
When SIP events arrive, use `navigationRef` to navigate outside the React tree:

```javascript
// In sipService.js
import { navigationRef } from '../App'; // Exported from App.jsx

export const initializeSipListeners = () => {
  onIncomingCall((event) => {
    // Navigate from outside React tree
    navigationRef.navigate('IncomingCall', {
      remoteNumber: event.remoteNumber,
      displayName: event.displayName,
    });
  });
  
  onCallState((event) => {
    if (event.state === 'connected') {
      navigationRef.navigate('OutgoingCall', { callInfo: event });
    }
  });
};
```

### Call History Service Pattern
Append-only with max entries:

```javascript
export const saveCallHistory = async (call) => {
  try {
    let history = await getCallHistory();
    
    // Keep only last 100 calls
    history = [{ ...call, id: Date.now() }, ...history].slice(0, 100);
    
    await AsyncStorage.setItem('call_history', JSON.stringify(history));
    log('[CallHistory] Saved call, total:', history.length);
  } catch (error) {
    log('[CallHistory] Failed to save:', error);
    throw error;
  }
};
```

### Android-Only Consideration
Always check platform before SIP operations:

```javascript
// ✅ CORRECT - Platform check
if (Platform.OS !== 'android') {
  throw new Error('SIP calling only available on Android');
}

// For iOS, implement alternative (WebRTC fallback, or indicate feature unavailable)
```

### Error Messages for Users
- "Failed to register with server. Check your credentials and internet connection."
- "Call declined by remote party." (not "Call failed")
- "Microphone access denied. Enable in Settings."
- "Unable to register: Server unreachable. Retry in 30 seconds."

**Never expose**: Technical details like "JNI call failed" or "NativeModules undefined"

## Backend (NestJS) Development

### Architecture
- Organize by feature, not by layer
- Keep modules small and focused
- Use dependency injection throughout
- Follow single responsibility principle

### API Design
- Use RESTful conventions for endpoints
- Return consistent response formats
- Include proper HTTP status codes
- Document with Swagger/OpenAPI
- Version APIs when breaking changes needed

### Database
- Use migrations for all schema changes
- Never modify database directly in production
- Index columns used in WHERE/JOIN/ORDER BY clauses
- Write optimized queries, use EXPLAIN ANALYZE
- Use transactions for related operations

### Authentication & Security
- Validate all inputs (use class-validator)
- Hash passwords (never store plain text)
- Use JWT with appropriate expiration
- Implement rate limiting
- Add CORS configuration
- Never commit secrets (.env files)

### Error Handling
- Create custom exception classes
- Log all errors with context
- Return user-friendly error messages
- Don't expose internal details in error responses

## Database (PostgreSQL) Design

### Schema Design
- Use appropriate data types (don't over-normalize)
- Add constraints (NOT NULL, UNIQUE, CHECK)
- Use foreign keys with CASCADE/RESTRICT appropriately
- Create indexes for frequently queried columns

### Migrations
- Write forward and backward migrations
- Test migrations on staging first
- Keep migrations small and atomic
- Document complex migrations

### Query Performance
- Use EXPLAIN ANALYZE to check query plans
- Avoid N+1 queries (use JOINs or batch queries)
- Create appropriate indexes
- Use LIMIT for large result sets
- Archive old data regularly

### Data Integrity
- Use constraints for validation
- Use transactions for related operations
- Backup regularly
- Test restore procedures

## Native Integration

### Android (Kotlin)
- Use proper error handling for JNI calls
- Clean up resources properly (listeners, connections)
- Test on actual devices, not just emulators
- Profile with Android Profiler for memory/CPU issues
- Handle permissions properly with runtime checks

### iOS (Swift)
- Use proper memory management (weak self in closures)
- Test on actual devices
- Handle background execution properly
- Use CallKit for native integration
- Profile with Instruments

## Security Best Practices

### Application Level
- Validate and sanitize all inputs
- Use HTTPS only (TLS 1.2+)
- Implement proper authentication and authorization
- Never log sensitive data (passwords, tokens, PII)
- Rotate API keys and secrets regularly

### Data Protection
- Encrypt sensitive data in transit (HTTPS)
- Encrypt sensitive data at rest in database
- Use AsyncStorage securely for mobile
- Handle PII carefully (comply with GDPR/CCPA)

### Third-Party Services
- Review Firebase/Supabase security rules
- Use scoped API keys
- Rotate credentials regularly
- Monitor for unauthorized access

## Debugging Strategies

### React Native
1. Start with React DevTools
2. Check console logs and errors
3. Use React Native Debugger for breakpoints
4. Check native logs (logcat for Android, Console.app for iOS)
5. Test on both Android and iOS

### Backend API
1. Check server logs
2. Test with Postman or cURL
3. Add debug logging to track request flow
4. Check database queries with EXPLAIN
5. Monitor performance metrics

### Database
1. Connect with psql client
2. Check query execution plan with EXPLAIN
3. Look for missing indexes
4. Check for connection issues
5. Monitor disk space and WAL size

### Native Issues
1. Check native logs (logcat, Console.app)
2. Run native debuggers (Android Studio, Xcode)
3. Check for memory leaks
4. Profile CPU usage
5. Test on real devices

## Deployment Checklist

### Before Any Deployment
- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] No console errors or warnings
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Performance benchmarks acceptable
- [ ] Security review completed
- [ ] User-facing strings finalized

### Frontend Release
- [ ] Version bumped (semantic versioning)
- [ ] App signed and built
- [ ] Tested on staging build
- [ ] App store listings updated
- [ ] Screenshots and description current
- [ ] Release notes prepared
- [ ] Rollback plan documented

### Backend Release
- [ ] Database migrations prepared
- [ ] API versioning considered
- [ ] Backward compatibility maintained
- [ ] Performance tested
- [ ] Error tracking configured
- [ ] Monitoring alerts set
- [ ] Runbook documented

## Code Quality Standards

### JavaScript/TypeScript
- Use const/let, avoid var
- Prefer arrow functions
- Use async/await, not .then()
- Add type hints (TypeScript)
- Write meaningful variable names
- Keep functions small (<50 lines)

### Git Practices
- Write descriptive commit messages
- One feature per branch
- Keep branches short-lived
- Review before merging
- Rebase instead of merge (when appropriate)
- Delete merged branches

### Documentation
- Document WHY, not WHAT (code shows what)
- Write clear component props documentation
- Document API endpoints with examples
- Keep README up-to-date
- Document setup and deployment steps

## Team Collaboration

### Code Review
- Review for correctness first, style second
- Be constructive and kind
- Ask questions instead of making demands
- Approve when satisfied
- Resolve conversations when done

### Communication
- Document decisions in ADRs (Architecture Decision Records)
- Keep team in sync on technical direction
- Share debugging insights and learnings
- Report blockers early
- Celebrate wins!

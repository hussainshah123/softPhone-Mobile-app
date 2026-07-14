# Call History & Call Cancellation Fixes

## Issues Fixed

### 1. ✅ Duplicate Call History Entries
**Problem:** When making one call, it appeared multiple times in the history (4+ times)

**Root Cause:** 
- `saveCallHistory()` was called both in event listeners AND in button handlers
- Multiple state changes could trigger multiple saves
- No duplicate detection mechanism

**Solution:**
- Added duplicate detection with 2-second threshold
- Only saves calls that are not duplicates of the last saved call
- Fixed OutgoingCall and IncomingCall to avoid double-saving

### 2. ✅ Call Cancellation Not Working
**Problem:** "Cancel" button didn't work, and calls wouldn't disconnect on both ends

**Root Cause:**
- IncomingCall was saving before calling `declineCall()`
- OutgoingCall was mixing save logic with hangup logic
- Event listeners were handling saves but UI wasn't waiting for them

**Solution:**
- Separated save logic from hangup/decline logic
- Let event listeners handle call history saving (single source of truth)
- UI buttons only trigger the SIP commands (`hangupCall()`, `declineCall()`)
- Added proper error handling and logging

### 3. ✅ Recent Calls Not Showing Real Data
**Problem:** Recent Calls section showed static dummy data

**Solution:**
- Updated RecentCalls component to load actual call history
- Shows up to 6 unique contacts from recent calls
- Displays loading state while fetching
- Shows "No recent calls" message when history is empty

## Files Modified

### 1. `src/services/callHistoryService.js`
- Added duplicate detection mechanism
- Tracks last saved call to prevent duplicates
- Calls within 2 seconds with same number/type are ignored
- Added `clearCallHistory()` function
- Improved error handling

### 2. `src/screens/outgoing/OutgoingCall.jsx`
- Removed `saveCallHistory()` from `handleEndCall()`
- Only calls `hangupCall()` in button handler
- Event listener handles all history saving
- Improved logging for debugging

### 3. `src/screens/incomming/IncommingCall.jsx`
- Removed `saveCallHistory()` from `handleDecline()`
- Only calls `declineCall()` in button handler
- Event listener handles history saving
- Fixed double-save issue

### 4. `src/screens/home/components/RecentCalls.jsx`
- Now loads from actual `getCallHistory()` instead of dummy data
- Shows up to 6 unique recent contacts
- Displays loading spinner while fetching
- Shows "No recent calls" when empty
- Auto-generates avatar images based on phone number

## How It Works Now

### Call History Saving Flow

```
User Makes Call
    ↓
SIP Server processes call
    ↓
Call state changes (connecting → ringing → connected → ended)
    ↓
Event Listener receives 'ended' event
    ↓
Calls saveCallHistory() ONCE
    ↓
Duplicate check: Is this call similar to the last saved call?
    ├─ YES: Skip (duplicate detected)
    └─ NO: Save to AsyncStorage
    ↓
Call appears in Recent Calls
```

### Call Cancellation Flow

```
User Taps "Cancel" or "Decline" Button
    ↓
handleEndCall() or handleDecline() called
    ↓
Calls hangupCall() or declineCall()
    ↓
Native SIP module sends command to both users
    ↓
Call state changes to 'ended' on both sides
    ↓
Event listener receives event
    ↓
saveCallHistory() called (one time)
    ↓
Call is logged and UI returns to home
```

## Configuration

### Duplicate Detection Threshold
Located in `callHistoryService.js`:
```javascript
const DUPLICATE_THRESHOLD = 2000; // 2 seconds
```

Adjust this value if needed:
- **Lower (1000ms):** Stricter duplicate detection
- **Higher (5000ms):** More lenient, allows similar calls within 5 seconds

## Testing

### Test 1: Make a Call (No Duplicates)
```bash
1. Start app
2. Go to Dial Pad
3. Enter a phone number
4. Make call
5. Wait for connection or let it ring
6. End call by tapping "End Call"
7. Go to Recent Calls
Expected: Call shows ONCE in the list
Check logs: [CallHistory] Saved call:
```

### Test 2: Quick Consecutive Calls (Duplicate Detection)
```bash
1. Make first call
2. Hang up
3. Immediately make same call again (within 2 seconds)
Expected: Second call should NOT be saved (duplicate detected)
Check logs: [CallHistory] Duplicate call detected, skipping save
```

### Test 3: Call Cancellation Works
```bash
1. Outgoing call: Tap "Cancel" button while ringing
2. Check logcat: Should see hangupCall() called
3. Call should disconnect immediately
4. Check Recent Calls: Call should be saved as 'missed' or 'outgoing'

5. Incoming call: Tap "Decline" button
6. Check logcat: Should see declineCall() called
7. Caller should see call declined
8. Check Recent Calls: Call saved as 'missed'
```

### Test 4: Real Call History Display
```bash
1. Make 3 different calls to different numbers
2. Go to Home tab
3. Check Recent Calls section
Expected: Shows up to 6 unique contacts from call history
Expected: No duplicates even if same person called multiple times
```

## Logging

All activity is logged for debugging. Check with:
```bash
adb logcat | grep -E "CallHistory|OutgoingCall|IncomingCall"
```

### Expected Log Messages

**Saving call:**
```
[CallHistory] Saved call: {id: "1720967234567", name: "John", number: "123456", type: "outgoing", ...}
```

**Duplicate detected:**
```
[CallHistory] Duplicate call detected, skipping save
```

**Call ended:**
```
[OutgoingCall] Call ended event - saving history and navigating back
[IncomingCall] Call state: ended
```

**Hangup/Decline:**
```
[OutgoingCall] User initiated call end
[OutgoingCall] Hangup command sent successfully
[IncomingCall] User declined call
[IncomingCall] Decline command sent successfully
```

## Architecture

### Call History Service
```javascript
// Single save source - prevents duplicates
saveCallHistory(call)
  ├─ Check for duplicates (isDuplicate)
  ├─ Get existing history
  ├─ Add new call to top
  ├─ Keep max 100 entries
  └─ Save to AsyncStorage

// Retrieval
getCallHistory()
  └─ Returns array of call objects

// Cleanup
clearCallHistory()
  └─ Removes all history
```

### Call State Events
The app listens to these SIP call states:
- `connecting` - Initial state, setting up connection
- `ringing` - Call is ringing
- `connected` - Call is active
- `ended` - Call ended normally
- `failed` - Call failed
- `declined` - Call was declined
- `missed` - Incoming call wasn't answered

## Troubleshooting

### Issue: Calls still showing as duplicates
**Solution:** 
1. Clear app data: `adb shell pm clear com.newapp`
2. Reload app
3. Make new call
4. Check if duplicate threshold needs adjustment

### Issue: Recent Calls shows "No recent calls"
**Solution:**
1. Make sure calls were actually saved (check logcat)
2. Go to Settings → SIP Account to verify connection
3. Try making a call again
4. Refresh the app

### Issue: Cancel button not working
**Solution:**
1. Check logcat for errors: `adb logcat | grep "Hangup\|Decline"`
2. Verify SIP connection is active
3. Check native SIP module errors: `adb logcat | grep -i sip`
4. May be a native module issue - try rebuilding

### Issue: Too many calls saved
**Solution:**
1. Go to Settings (if added)
2. Add "Clear Call History" button to clear all records
3. Or wait for history to reach 100 entries (oldest automatically deleted)

## Future Enhancements

1. **Call Duration** - Track how long each call lasted
2. **Call Status Icons** - Show incoming/outgoing/missed with icons
3. **Contact Integration** - Link calls to existing contacts
4. **Call Statistics** - Total calls, total duration, favorite contacts
5. **Delete Individual Calls** - Swipe to delete from history
6. **Call Notes** - Add notes to specific calls
7. **Export History** - Export call history as CSV/PDF
8. **Search History** - Search past calls by name/number

## References
- `callHistoryService.js` - Call history logic
- `OutgoingCall.jsx` - Outgoing call screen
- `IncommingCall.jsx` - Incoming call screen
- `RecentCalls.jsx` - Recent calls component

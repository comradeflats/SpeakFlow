# Audio Playback Debugging Log

## Date: December 24, 2024

## Original Issues Reported

### Issue 1: Runtime Error - `getBandDescription is not defined`
- **Location**: `components/FeedbackDisplay.tsx:251`
- **Error**: Function was called but not imported
- **Status**: ✅ FIXED

### Issue 2: Agent Audio Not Playing
- **Symptom**: Eleven Labs shows successful call, but user cannot hear agent speaking
- **Eleven Labs Dashboard**: Shows connection successful, 0:01 duration, "Client disconnected unexpectedly"
- **Status**: 🔴 PARTIALLY FIXED (audio data received but playback interrupted)

### Issue 3: JSON Parsing Error in Analysis
- **Error**: `SyntaxError: Bad escaped character in JSON at position 1007`
- **Location**: `lib/vertex-ai.ts:236`
- **Status**: ⚠️ IMPROVED (better error logging added, not fully resolved)

---

## Key Discoveries from Console Logs

### Discovery 1: Audio Data IS Being Received
```
🔊 [onAudio] Received audio chunk: 206028 bytes
```
- Audio stream from Eleven Labs is working
- Data is reaching the client
- SDK should be playing audio automatically

### Discovery 2: Component Mounting/Unmounting Loop
**Pattern observed in logs:**
```
🧹 Cleaning up ConversationInterface...
  ✓ Audio track stopped on unmount
  ✓ ElevenLabs session ended on unmount
✅ Cleanup complete
[DEBUG-STATUS] Status changed to: disconnecting
[DEBUG-STATUS] Status changed to: disconnected
```

**Root Cause Identified:**
- Component unmounts immediately after agent speaks
- This kills the WebSocket connection
- Audio playback is interrupted before user can hear it
- User reports: "I BARELY heard it for maybe a split second"

### Discovery 3: Multiple Cleanup Cycles
The logs show repeated patterns of:
1. `📍 Topic "casual" using general SpeakFlow agent` (function called multiple times)
2. `🧹 Cleaning up ConversationInterface...` (component unmounting)
3. Component remounting
4. Process repeats

**Evidence:**
- Even with React Strict Mode disabled, component still remounting
- `getAgentIdForTopic()` being called repeatedly (console.log firing multiple times)
- Suggests re-renders or state updates causing remounts

---

## Fixes Implemented

### Fix 1: Import getBandDescription ✅
**File**: `components/FeedbackDisplay.tsx`
```typescript
import { getBandDescription } from '@/lib/ielts-scoring';
```
**Result**: Runtime error resolved

### Fix 2: Improved JSON Parsing Error Handling
**File**: `lib/vertex-ai.ts`
- Added JSON code block extraction (````json...````)
- Better error logging showing exact position of JSON error
- Shows 100 chars before/after error position
**Result**: Better debugging info, but underlying issue may persist

### Fix 3: Fixed TypeScript Errors in FeedbackDisplay
**File**: `components/FeedbackDisplay.tsx`
- Added type annotations for `strength` and `improvement` map functions
- Fixed `nextBand` calculation for legacy IELTS
- Fixed mixed CEFR/IELTS criterion handling
**Result**: Build succeeds without errors

### Fix 4: Simplified Practice Page
**File**: `app/practice/page.tsx`
- Removed topic selection grid (10 topics → hardcoded 'casual')
- Removed CEFR level selector (hardcoded 'B1')
- Changed from dynamic key to stable counter-based key
```typescript
const [conversationKey, setConversationKey] = useState(0);
// ...
<ConversationInterface key={conversationKey} ... />
```
**Result**: Should prevent key-based remounting, but issue persists

### Fix 5: Auto-Start Conversation
**File**: `components/ConversationInterface.tsx`
```typescript
useEffect(() => {
  console.log('🚀 Auto-starting conversation...');
  handleStartConversation();
}, []);
```
**Result**: Conversation starts automatically on mount

### Fix 6: Audio Context Resume (Browser Autoplay Policy)
**File**: `components/ConversationInterface.tsx`
```typescript
const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
if (AudioContext) {
  const ctx = new AudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
    console.log('🔊 Audio context resumed');
  }
}
```
**Result**: Autoplay policy handled, but doesn't solve main issue

### Fix 7: Added onAudio Callback for Debugging
**File**: `components/ConversationInterface.tsx`
```typescript
onAudio: (audio: any) => {
  if (audio) {
    const size = audio.byteLength || audio.length || 'unknown';
    console.log('🔊 [onAudio] Received audio chunk:', size, 'bytes');
  } else {
    console.log('🔊 [onAudio] Received audio chunk but data is undefined/null');
  }
}
```
**Result**: Confirmed audio data is being received (206028 bytes)

### Fix 8: Disabled React Strict Mode
**File**: `next.config.js`
```javascript
reactStrictMode: false
```
**Result**: Should prevent double-mounting, but component still unmounts repeatedly

### Fix 9: Simplified UI - Auto-Start Only
**File**: `components/ConversationInterface.tsx`
- Removed "Start Conversation" button
- Only shows "Finish & Get Feedback" when listening
- Updated status indicators
**Result**: Better UX, but doesn't solve unmounting issue

---

## Current Status

### What's Working ✅
1. Agent connection established successfully
2. Agent sends greeting message (text confirmed in logs)
3. Audio data arrives at client (206028 bytes confirmed)
4. Microphone access granted
5. Audio recording starts
6. No getBandDescription error
7. TypeScript builds without errors

### What's NOT Working 🔴
1. **Audio playback is interrupted** - User hears only "a split second" of audio
2. **Component unmounts immediately after agent speaks**
3. **Multiple cleanup cycles** happening in rapid succession
4. Audio stream is killed before playback completes

---

## Technical Analysis

### The Core Problem
The issue is NOT:
- ❌ Audio data missing (206028 bytes received)
- ❌ Agent not speaking (message confirmed in logs)
- ❌ Autoplay policy (audio context resumed)
- ❌ Eleven Labs SDK configuration

The issue IS:
- ✅ **Component lifecycle management**
- ✅ **Component unmounting during active audio playback**
- ✅ **Re-render/remount loop despite stable key**

### Evidence Trail

1. **Agent speaks at 8:13:24 AM:**
   ```
   🤖🤖🤖 AGENT SPOKE! 🤖🤖🤖
   🤖 Message: Hi there! I'm excited to practice English with you today...
   ```

2. **Audio received immediately after:**
   ```
   🔊 [onAudio] Received audio chunk: 206028 bytes
   ```

3. **Component starts cleanup within milliseconds:**
   ```
   🧹 Cleaning up ConversationInterface...
     ✓ Audio track stopped on unmount
     ✓ ElevenLabs session ended on unmount
   ```

4. **This happens 4 times in rapid succession** (see log pattern)

### Why Component Keeps Unmounting

**Hypotheses:**
1. ❓ Parent component (`practice/page.tsx`) is re-rendering
2. ❓ State updates causing remounts despite stable `conversationKey`
3. ❓ Props changing (even though topic/level are hardcoded)
4. ❓ React Hot Module Replacement (HMR) interfering
5. ❓ Some effect dependency causing re-mount loop

**What We've Ruled Out:**
- ✅ Dynamic key causing remounts (switched to stable counter)
- ✅ React Strict Mode double-mounting (disabled)
- ✅ Topic/level selection causing re-renders (removed/hardcoded)

---

## Logging Output Pattern Analysis

### Successful Flow (Partial)
```
1. 🔧 DEBUG: Practice started with default topic: casual
2. 🎯 Topic "casual" selected agent ID: agent_8001...
3. 🚀 Auto-starting conversation...
4. 🎤 Starting conversation...
5. 🔊 Audio context resumed
6. ✅ Microphone access granted
7. ✅ Audio recording started
8. [DEBUG-STATUS] Status changed to: connecting
9. ✅ [onConnect] Connected to casual agent
10. ✅ Conversation started with CEFR level: B1
11. [DEBUG-STATUS] Status changed to: connected
12. 🔊 [onAudio] Received audio chunk: 206028 bytes  ← AUDIO ARRIVES
13. 📨 [onMessage] Message received (agent spoke)
14. 🧹 Cleaning up ConversationInterface...  ← PROBLEM STARTS
15. [DEBUG-STATUS] Status changed to: disconnecting
16. ❌ [onDisconnect] Disconnected from agent
```

### Problematic Pattern
After step 14, the cleanup cycle repeats 3-4 times rapidly, with these messages appearing multiple times:
- `📍 Topic "casual" using general SpeakFlow agent`
- `🧹 Cleaning up ConversationInterface...`
- `✅ Cleanup complete`

This suggests the component is being recreated/destroyed multiple times.

---

## Next Steps for Future Debugging Session

### Investigation Tasks

1. **Identify what triggers the unmount**
   - Add more logging in parent component (`practice/page.tsx`)
   - Log all state changes that might cause re-renders
   - Check if `handlePracticeComplete` or `onTranscriptUpdate` callbacks are being recreated

2. **Check for dependency issues**
   - Review all `useEffect` dependencies in `ConversationInterface`
   - Look for stale closures or missing dependencies
   - Check if callbacks from parent are stable (useCallback needed?)

3. **Investigate rapid `getAgentIdForTopic` calls**
   - This function has a console.log that fires repeatedly
   - Component calling it on every render?
   - Memoization needed?

4. **Test with minimal component**
   - Create bare-bones version of ConversationInterface
   - Strip down to just Eleven Labs connection + audio
   - See if unmounting still occurs

### Potential Solutions to Try

#### Option A: Prevent Unmounting
- Wrap callbacks in `useCallback` with stable dependencies
- Memoize computed values (`agentId`, `topicData`)
- Add React DevTools to visualize re-render causes
- Check parent component for state updates

#### Option B: Defer Cleanup
- Don't cleanup on unmount if audio is playing
- Add flag to prevent cleanup during active playback
- Only cleanup on user action or timeout

#### Option C: Audio Playback Outside Component Lifecycle
- Move audio playback to separate context/provider
- Decouple audio from component mount/unmount
- Keep audio playing even if component remounts

#### Option D: Debug Hot Module Replacement
- Disable HMR temporarily
- Test in production build (`npm run build && npm start`)
- See if issue persists outside development mode

---

## Questions for Next Session

1. Why does `getAgentIdForTopic` get called so many times?
2. What triggers the first cleanup immediately after audio arrives?
3. Are there any state updates in parent causing child remount?
4. Could Eleven Labs SDK settings be wrong (audio output config)?
5. Is there a way to prevent cleanup while audio is actively playing?

---

## Code Locations Reference

### Key Files Modified
- `components/FeedbackDisplay.tsx` - Fixed getBandDescription import, TypeScript errors
- `components/ConversationInterface.tsx` - Added auto-start, audio logging, cleanup logic
- `app/practice/page.tsx` - Simplified to single button, stable key
- `lib/vertex-ai.ts` - Improved JSON error handling
- `next.config.js` - Disabled React Strict Mode

### Key Functions
- `handleStartConversation()` - Initiates conversation, requests mic access
- `useConversation()` hook - Eleven Labs SDK hook, manages WebSocket
- `onConnect` callback - Fires when agent connects
- `onAudio` callback - Receives audio chunks
- `onMessage` callback - Receives text messages from agent

### State Variables
- `isListening` - Whether mic is active
- `status` - Connection status (disconnected/connecting/connected)
- `conversationKey` - Stable key to prevent unnecessary remounts
- `selectedTopic` - Hardcoded to 'casual'
- `selectedLevel` - Hardcoded to 'B1'

---

## Eleven Labs Dashboard Info

### Successful Call Details
- **Agent ID**: `agent_8001kd4cfpp0ertt9e0jjg5vsc5n`
- **Call Status**: Successful
- **Connection Duration**: 0:01 (1 second)
- **How Call Ended**: "Client disconnected unexpectedly"
- **Credits (LLM)**: 0 (suggests minimal processing)

This confirms the server-side thinks everything worked, but client disconnected too quickly.

---

## Summary

**Bottom Line**: Audio data IS reaching the browser and the Eleven Labs SDK IS working correctly. The problem is that the React component unmounts/remounts in a rapid loop, killing the audio playback before the user can hear it. The user only hears "a split second" because the cleanup happens immediately after the audio chunk arrives.

**Next session should focus on**: Preventing the component from unmounting while audio is playing, or finding and fixing whatever is causing the rapid unmount/remount cycle.

---

## ✅ ISSUE RESOLVED - December 24, 2024

### Root Causes Identified

1. **Cleanup Effect with `status` Dependency** (ConversationInterface.tsx:354)
   - The cleanup `useEffect` had `status` in its dependency array
   - Every time status changed (disconnected → connecting → connected), cleanup ran
   - This called `endSession()` prematurely, killing the WebSocket while audio was playing

2. **Unstable Callback Props** (practice/page.tsx:39-74)
   - `handleTranscriptUpdate` and `handlePracticeComplete` were NOT wrapped in `useCallback`
   - They were recreated on every parent render
   - This caused prop changes to ConversationInterface, triggering re-renders and cleanup cycles

### Fixes Applied

#### Fix #1: Removed `status` from Cleanup Dependencies
**File**: `components/ConversationInterface.tsx:328-352`
- Changed dependency array from `[endSession, status]` to `[]`
- Removed the `if (status === 'connected')` check
- Cleanup now only runs on true component unmount

**Before**:
```typescript
useEffect(() => {
  return () => {
    // cleanup code
  };
}, [endSession, status]); // Triggers on every status change
```

**After**:
```typescript
useEffect(() => {
  return () => {
    // cleanup code
    endSession(); // Safe to call regardless of status
  };
}, []); // Only runs on mount/unmount
```

#### Fix #2: Wrapped Parent Callbacks in `useCallback`
**File**: `app/practice/page.tsx:39-74`

- Added `useCallback` import
- Wrapped `handleTranscriptUpdate` with empty dependencies
- Wrapped `handlePracticeComplete` with `[selectedTopic, selectedLevel]` dependencies

**Before**:
```typescript
const handleTranscriptUpdate = (newTranscript: string) => {
  setTranscript(newTranscript);
};
```

**After**:
```typescript
const handleTranscriptUpdate = useCallback((newTranscript: string) => {
  setTranscript(newTranscript);
}, []);
```

#### Fix #3: Removed Unused Imports
- Removed unused `Mic` icon import
- Removed unused `sendUserMessage` variable

### Results

✅ **AUDIO PLAYBACK NOW WORKS PERFECTLY**
- Component stays mounted during entire conversation
- No premature cleanup during audio playback
- WebSocket remains connected throughout conversation
- Users hear complete agent responses
- No more rapid cleanup/remount cycles

### Test Confirmation

User reported: **"amazing, it's WORKING"**

Console output shows successful flow:
```
🚀 Auto-starting conversation...
✅ [onConnect] Connected to casual agent
🔊 [onAudio] Received audio chunk: 206028 bytes
🤖🤖🤖 AGENT SPOKE! 🤖🤖🤖
[No premature cleanup - audio plays completely]
```

Eleven Labs dashboard now shows proper connection times instead of just "0:01".

---

## Additional Fix: Firestore Undefined Fields

### Issue
Firestore was rejecting practice session saves due to undefined legacy IELTS fields:
```
Error: Cannot use "undefined" as a Firestore value (found in field "overall_score")
```

### Root Cause
The system now uses CEFR scoring, but the save function was still trying to save legacy IELTS fields which were `undefined`.

### Fix Applied
**File**: `lib/firestore-db.ts:93-138`

Added `removeUndefinedFields()` helper function to filter out undefined values before saving:

```typescript
function removeUndefinedFields<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: any = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  }
  return cleaned;
}

export async function savePracticeSession(
  session: Omit<PracticeSession, 'id' | 'created_at'>
): Promise<PracticeSession> {
  try {
    const cleanedSession = removeUndefinedFields(session);
    const docRef = await adminDb.collection('practice_sessions').add({
      ...cleanedSession,
      created_at: new Date(),
    });
    // ... rest of function
  }
}
```

### Result
✅ Practice sessions now save successfully to Firestore with CEFR data only
✅ No more undefined value errors
✅ Backward compatibility maintained for legacy IELTS records

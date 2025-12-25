# Supabase to Google Cloud Migration Plan

**Date**: December 17, 2024
**Purpose**: Replace Supabase with Google Cloud services for hackathon compliance
**Backup Location**: `/Users/comradeflats/Desktop/hackathon-supabase-backup/`

---

## ⚠️ Why This Migration is Critical

The hackathon rules state:
> "The use of other services that directly compete with Google Cloud (for cloud platform capabilities) or with the Partner whose challenge you've selected is not permitted."

**Supabase competes with:**
- ❌ Cloud Firestore / Cloud SQL (database)
- ❌ Firebase Authentication / Identity Platform (authentication)
- ❌ Cloud Storage (file storage)

**Submitting with Supabase could result in disqualification.**

---

## 📊 Migration Overview

### What Needs to be Replaced

| Current (Supabase) | Replace With (Google Cloud) | Complexity |
|-------------------|----------------------------|-----------|
| Supabase PostgreSQL | **Firebase Firestore** | Medium |
| Supabase Auth | **Firebase Authentication** | Medium |
| Supabase Storage (future) | Cloud Storage | Low (already planned) |

### Why Firestore Over Cloud SQL?

**Firestore Advantages:**
- ✅ Serverless (no database management)
- ✅ Real-time updates built-in
- ✅ Automatic scaling
- ✅ Generous free tier
- ✅ Easier integration with Firebase Auth
- ✅ Better for Next.js/React apps
- ✅ Less migration complexity

**Cloud SQL:**
- ❌ Requires database management
- ❌ Need connection pooling for serverless
- ❌ More expensive
- ❌ More complex setup
- ✅ Familiar PostgreSQL syntax (only advantage)

**Decision: Use Firebase Firestore**

---

## 🗂️ Current Supabase Architecture

### Database Schema

```sql
-- users table
users {
  id: UUID (primary key)
  email: TEXT
  created_at: TIMESTAMP
  updated_at: TIMESTAMP
  target_band_score: DECIMAL(2,1)
  full_name: TEXT
}

-- practice_sessions table
practice_sessions {
  id: UUID (primary key)
  user_id: UUID (foreign key → users.id)
  part: TEXT ('1', '2', '3')
  created_at: TIMESTAMP
  audio_url: TEXT
  transcript: TEXT
  overall_score: DECIMAL(2,1)
  fluency_score: DECIMAL(2,1)
  lexical_score: DECIMAL(2,1)
  grammar_score: DECIMAL(2,1)
  pronunciation_score: DECIMAL(2,1)
  fluency_feedback: TEXT
  lexical_feedback: TEXT
  grammar_feedback: TEXT
  pronunciation_feedback: TEXT
  strengths: TEXT[]
  improvements: TEXT[]
  pronunciation_heatmap: JSONB
  detailed_feedback: JSONB
}
```

### Authentication Flow
1. User signs up with email/password
2. Supabase creates auth user
3. App creates profile in `users` table
4. Session managed via cookies
5. Middleware protects routes

### Files Using Supabase
- `lib/supabase-client.ts` - Database operations
- `lib/supabase-server.ts` - Server-side auth
- `lib/supabase-browser.ts` - Browser-side auth
- `app/api/analyze/route.ts` - Saves practice sessions
- `middleware.ts` - Route protection
- `app/auth/callback/route.ts` - Auth callback handler
- `components/AuthModal.tsx` - Login/signup UI
- `components/AuthButton.tsx` - User status display
- `app/dashboard/page.tsx` - Fetches user sessions (if exists)

---

## 🎯 Firestore Migration Plan

### Step 1: Install Firebase Admin SDK (30 minutes)

```bash
npm install firebase-admin
npm install firebase
```

**Why both packages?**
- `firebase-admin`: Server-side operations (API routes)
- `firebase`: Client-side operations (browser)

---

### Step 2: Set up Firebase Project (15 minutes)

**Tasks:**
- [ ] Go to https://console.firebase.google.com
- [ ] Create new project (link to existing GCP project: `ielts-ai-practice-481410`)
- [ ] Enable Firestore Database
  - Choose "Start in production mode"
  - Select region: `us-central1` (same as Vertex AI)
- [ ] Enable Firebase Authentication
  - Enable Email/Password provider
- [ ] Generate service account key for Admin SDK
  - Project Settings → Service Accounts → Generate new private key
  - Save to: `~/.gcp/ielts-firebase-admin-key.json`
- [ ] Get Firebase config for web app
  - Project Settings → General → Your apps → Web app
  - Copy config object

**Add to `.env.local`:**
```bash
# Firebase Admin (server-side)
FIREBASE_ADMIN_CREDENTIALS=/Users/comradeflats/.gcp/ielts-firebase-admin-key.json

# Firebase Web (client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=ielts-ai-practice-481410.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=ielts-ai-practice-481410
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=ielts-ai-practice-481410.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

### Step 3: Create Firestore Database Client (1 hour)

**Create `lib/firebase-admin.ts`** (replaces server-side Supabase):

```typescript
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin (singleton)
if (!getApps().length) {
  initializeApp({
    credential: cert(require(process.env.FIREBASE_ADMIN_CREDENTIALS!)),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

export const adminDb = getFirestore();
export const adminAuth = getAuth();
```

**Create `lib/firebase-client.ts`** (replaces browser-side Supabase):

```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (singleton)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
```

---

### Step 4: Migrate Database Operations (2-3 hours)

**Create `lib/firestore-db.ts`** (replaces `lib/supabase-client.ts`):

```typescript
import { adminDb } from './firebase-admin';
import { db } from './firebase-client';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';

// Type definitions (keep same as Supabase version)
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  target_band_score: number;
  full_name?: string;
}

export interface PracticeSession {
  id: string;
  user_id: string;
  part: '1' | '2' | '3';
  created_at: string;
  audio_url?: string;
  transcript?: string;
  overall_score?: number;
  fluency_score?: number;
  lexical_score?: number;
  grammar_score?: number;
  pronunciation_score?: number;
  fluency_feedback?: string;
  lexical_feedback?: string;
  grammar_feedback?: string;
  pronunciation_feedback?: string;
  strengths?: string[];
  improvements?: string[];
  pronunciation_heatmap?: any;
  detailed_feedback?: any;
}

// Firestore collections
const USERS_COLLECTION = 'users';
const SESSIONS_COLLECTION = 'practice_sessions';

/**
 * Save a practice session (server-side with Admin SDK)
 */
export async function savePracticeSessionAdmin(
  session: Omit<PracticeSession, 'id' | 'created_at'>
) {
  const docRef = await adminDb.collection(SESSIONS_COLLECTION).add({
    ...session,
    created_at: new Date().toISOString(),
  });

  const doc = await docRef.get();
  return { id: doc.id, ...doc.data() } as PracticeSession;
}

/**
 * Get all practice sessions for a user (client-side)
 */
export async function getUserSessions(
  userId: string,
  limitCount = 50
): Promise<PracticeSession[]> {
  const q = query(
    collection(db, SESSIONS_COLLECTION),
    where('user_id', '==', userId),
    orderBy('created_at', 'desc'),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as PracticeSession[];
}

/**
 * Get sessions by IELTS part (client-side)
 */
export async function getSessionsByPart(
  userId: string,
  part: '1' | '2' | '3',
  limitCount = 10
): Promise<PracticeSession[]> {
  const q = query(
    collection(db, SESSIONS_COLLECTION),
    where('user_id', '==', userId),
    where('part', '==', part),
    orderBy('created_at', 'desc'),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as PracticeSession[];
}

/**
 * Get or create user profile (server-side)
 */
export async function getOrCreateUserProfileAdmin(authUser: {
  id: string;
  email: string;
}): Promise<User> {
  const userRef = adminDb.collection(USERS_COLLECTION).doc(authUser.id);
  const userDoc = await userRef.get();

  if (userDoc.exists) {
    return { id: userDoc.id, ...userDoc.data() } as User;
  }

  // Create new user profile
  const newUser = {
    email: authUser.email,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    target_band_score: 7.0,
  };

  await userRef.set(newUser);
  return { id: authUser.id, ...newUser } as User;
}

/**
 * Update user profile (client-side)
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<User, 'id' | 'created_at' | 'email'>>
) {
  const userRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(userRef, {
    ...updates,
    updated_at: new Date().toISOString(),
  });

  const updatedDoc = await getDoc(userRef);
  return { id: updatedDoc.id, ...updatedDoc.data() } as User;
}

/**
 * Get recent sessions (client-side)
 */
export async function getRecentSessions(
  userId: string,
  count = 5
): Promise<PracticeSession[]> {
  const q = query(
    collection(db, SESSIONS_COLLECTION),
    where('user_id', '==', userId),
    orderBy('created_at', 'desc'),
    limit(count)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as PracticeSession[];
}

// Keep calculateImprovementTrend as-is (pure function)
export function calculateImprovementTrend(sessions: PracticeSession[]): {
  trend: 'improving' | 'stable' | 'declining';
  rate: number;
} {
  if (sessions.length < 2) {
    return { trend: 'stable', rate: 0 };
  }

  const scores = sessions
    .map((s) => s.overall_score)
    .filter((s): s is number => s !== null && s !== undefined)
    .reverse();

  if (scores.length < 2) {
    return { trend: 'stable', rate: 0 };
  }

  const n = scores.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = scores.reduce((a, b) => a + b, 0);
  const sumXY = scores.reduce((sum, y, x) => sum + x * y, 0);
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const trend = slope > 0.1 ? 'improving' : slope < -0.1 ? 'declining' : 'stable';

  return { trend, rate: slope };
}

/**
 * Calculate user stats (client-side)
 * Replaces the Supabase user_stats view
 */
export async function getUserStats(userId: string) {
  const sessions = await getUserSessions(userId, 1000);

  if (sessions.length === 0) {
    return null;
  }

  const totalSessions = sessions.length;
  const sum = (field: keyof PracticeSession) =>
    sessions.reduce((acc, s) => acc + (Number(s[field]) || 0), 0);

  return {
    user_id: userId,
    total_sessions: totalSessions,
    avg_overall_score: sum('overall_score') / totalSessions,
    avg_fluency_score: sum('fluency_score') / totalSessions,
    avg_lexical_score: sum('lexical_score') / totalSessions,
    avg_grammar_score: sum('grammar_score') / totalSessions,
    avg_pronunciation_score: sum('pronunciation_score') / totalSessions,
    last_practice_date: sessions[0].created_at,
    first_practice_date: sessions[sessions.length - 1].created_at,
  };
}
```

---

### Step 5: Migrate Authentication (1-2 hours)

**Update `components/AuthModal.tsx`:**

Replace Supabase auth calls with Firebase:

```typescript
import { auth } from '@/lib/firebase-client';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

// Sign in
const handleSignIn = async (email: string, password: string) => {
  await signInWithEmailAndPassword(auth, email, password);
};

// Sign up
const handleSignUp = async (email: string, password: string) => {
  await createUserWithEmailAndPassword(auth, email, password);
};

// Sign out
const handleSignOut = async () => {
  await signOut(auth);
};
```

**Update `components/AuthButton.tsx`:**

```typescript
import { auth } from '@/lib/firebase-client';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useEffect, useState } from 'react';

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  // Rest of component...
}
```

**Update `middleware.ts`:**

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Firebase handles auth via client-side tokens
  // For server-side verification, use Firebase Admin SDK

  const token = request.cookies.get('__session')?.value;

  if (!token && (
    request.nextUrl.pathname.startsWith('/practice') ||
    request.nextUrl.pathname.startsWith('/dashboard')
  )) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/practice/:path*', '/dashboard/:path*'],
};
```

**Create `app/api/auth/session/route.ts`** (for middleware):

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  const { idToken } = await request.json();

  try {
    // Verify the ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // Set session cookie (5 days)
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const response = NextResponse.json({ success: true });
    response.cookies.set('__session', sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
```

---

### Step 6: Update API Routes (30 minutes)

**Update `app/api/analyze/route.ts`:**

```typescript
// OLD
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(url, serviceRoleKey);
await supabase.from('practice_sessions').insert([sessionData]);

// NEW
import { savePracticeSessionAdmin } from '@/lib/firestore-db';
await savePracticeSessionAdmin(sessionData);
```

---

### Step 7: Firestore Security Rules (30 minutes)

In Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Users can read/write their own practice sessions
    match /practice_sessions/{sessionId} {
      allow read: if request.auth != null &&
        resource.data.user_id == request.auth.uid;
      allow create: if request.auth != null &&
        request.resource.data.user_id == request.auth.uid;
      allow update, delete: if request.auth != null &&
        resource.data.user_id == request.auth.uid;
    }
  }
}
```

---

## 📋 Complete Migration Checklist

### Phase 1: Setup (1 hour)
- [ ] Install `firebase` and `firebase-admin` packages
- [ ] Create Firebase project in console (link to GCP project)
- [ ] Enable Firestore Database
- [ ] Enable Firebase Authentication (Email/Password)
- [ ] Generate Admin SDK service account key
- [ ] Get Firebase web config
- [ ] Add environment variables to `.env.local`

### Phase 2: Code Migration (3-4 hours)
- [ ] Create `lib/firebase-admin.ts`
- [ ] Create `lib/firebase-client.ts`
- [ ] Create `lib/firestore-db.ts` (replace supabase-client.ts)
- [ ] Update `app/api/analyze/route.ts`
- [ ] Update `components/AuthModal.tsx`
- [ ] Update `components/AuthButton.tsx`
- [ ] Update `middleware.ts`
- [ ] Create `app/api/auth/session/route.ts`
- [ ] Update any dashboard pages (if exist)

### Phase 3: Security & Rules (30 minutes)
- [ ] Set Firestore security rules
- [ ] Test authentication flow
- [ ] Test database read/write with authenticated user
- [ ] Verify unauthorized access is blocked

### Phase 4: Testing (1-2 hours)
- [ ] Test sign up flow
- [ ] Test sign in flow
- [ ] Test sign out flow
- [ ] Test practice session save
- [ ] Test session retrieval
- [ ] Test progress dashboard (if exists)
- [ ] Verify all data is being saved correctly
- [ ] Check browser console for errors
- [ ] Test on mobile

### Phase 5: Cleanup (30 minutes)
- [ ] Remove Supabase packages: `npm uninstall @supabase/supabase-js @supabase/ssr`
- [ ] Delete `lib/supabase-client.ts`
- [ ] Delete `lib/supabase-server.ts`
- [ ] Delete `lib/supabase-browser.ts`
- [ ] Delete `app/auth/callback/route.ts` (not needed for Firebase)
- [ ] Remove Supabase env vars from `.env.local`
- [ ] Update `.env.example` with Firebase vars
- [ ] Commit changes with clear message

---

## 🚨 Important Notes

### Data Migration
**You don't need to migrate existing Supabase data** because:
1. This is a hackathon project (not production)
2. You likely only have test data
3. Starting fresh with Firebase is cleaner

### Cost Comparison
**Firestore Free Tier** (more than enough for hackathon):
- 50,000 reads/day
- 20,000 writes/day
- 1 GB storage
- 10 GB bandwidth/month

**Firebase Auth Free Tier:**
- Unlimited users
- Email/password authentication

### Firebase vs Supabase: Key Differences

| Feature | Supabase | Firebase |
|---------|----------|----------|
| Database | PostgreSQL (SQL) | Firestore (NoSQL) |
| Queries | Complex joins, SQL | Simple queries, denormalization |
| Real-time | PostgreSQL replication | Native real-time |
| Auth | Built-in | Built-in |
| Pricing | PostgreSQL pricing | NoSQL pricing |

### NoSQL Considerations

Firestore is NoSQL, so:
- ❌ No SQL joins (must denormalize)
- ❌ No complex aggregations
- ✅ But our schema is simple enough!

Our queries are straightforward:
- Get user profile by ID
- Get sessions by user_id
- Get sessions by user_id + part
- Order by created_at

**All of these work perfectly in Firestore!**

---

## 🎯 Expected Time Investment

**Total Migration Time**: 6-9 hours

- Setup: 1 hour
- Code migration: 3-4 hours
- Security rules: 30 minutes
- Testing: 1-2 hours
- Cleanup: 30 minutes
- Buffer for issues: 1 hour

**Worth it?** Absolutely! Without this migration, you risk disqualification.

---

## 💡 Pro Tips

1. **Test incrementally**: Don't migrate everything at once
2. **Keep Supabase backup**: You have it at `hackathon-supabase-backup/`
3. **Use Firebase Emulator**: For local testing without hitting production
4. **Monitor costs**: Firebase console shows daily usage
5. **Check demo video**: Highlight "Built on Google Cloud Platform" with Firebase logo

---

## 🏆 Post-Migration Narrative for Submission

**Before (Supabase):**
"Built with Supabase and Vertex AI"
- ❌ Uses competitor service
- ❌ Risk of disqualification

**After (Firebase):**
"Built entirely on Google Cloud Platform"
- ✅ Firebase Authentication
- ✅ Cloud Firestore
- ✅ Vertex AI
- ✅ Cloud Run deployment
- ✅ Shows deep GCP integration
- ✅ Judges love full-stack GCP usage!

---

## 📞 Need Help?

Common issues and solutions:

**Issue: Firebase Admin credentials not found**
```
Solution: Verify FIREBASE_ADMIN_CREDENTIALS path in .env.local
Check file exists: ls -la ~/.gcp/ielts-firebase-admin-key.json
```

**Issue: Firestore permission denied**
```
Solution: Check security rules in Firebase Console
Verify user is authenticated (check auth state)
```

**Issue: Can't read from Firestore**
```
Solution: Ensure indexes are created (console will show URL to create)
Check query has proper where/orderBy combination
```

---

## ✅ Success Criteria

Migration is complete when:
- [ ] User can sign up with email/password (Firebase Auth)
- [ ] User can sign in (Firebase Auth)
- [ ] Practice sessions save to Firestore
- [ ] Dashboard loads user sessions from Firestore
- [ ] All tests pass
- [ ] No Supabase code remains
- [ ] No Supabase packages in package.json
- [ ] Firebase credentials in environment variables
- [ ] Security rules properly configured

---

**Ready to start? Begin with Phase 1: Setup!**

*Last updated: December 17, 2024*

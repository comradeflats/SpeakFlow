import { adminDb } from './firebase-admin';
import { TopicId, CEFRLevel } from './conversation-topics';
import { cefrToNumeric } from './cefr-scoring';

// Type definitions for our Firestore database
export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  preferred_cefr_level?: CEFRLevel;
  last_level_assessment?: string; // ISO timestamp of last level assessment
  preferred_topics?: TopicId[];
  full_name?: string;
}

export interface PracticeSession {
  id: string;
  user_id: string;
  topic: TopicId;
  cefr_level: CEFRLevel;
  created_at: string;
  part?: "1" | "2" | "3";
  audio_url?: string;
  transcript?: string;

  // Legacy IELTS fields (kept for backward compatibility with old records)
  // @deprecated - Use CEFR fields instead (overall_level, range_level, accuracy_level, etc.)
  overall_score?: number;
  fluency_score?: number;
  lexical_score?: number;
  grammar_score?: number;
  pronunciation_score?: number;
  lexical_feedback?: string;
  grammar_feedback?: string;
  pronunciation_feedback?: string;

  // New CEFR fields (SpeakFlow system)
  overall_level?: string; // e.g., "B2", "C1", etc.
  range_level?: string; // Vocabulary
  accuracy_level?: string; // Grammar
  fluency_level?: string; // Speaking flow
  interaction_level?: string; // Communication effectiveness
  coherence_level?: string; // Discourse organization

  range_feedback?: string; // Vocabulary feedback
  accuracy_feedback?: string; // Grammar feedback
  fluency_feedback?: string; // Fluency feedback (used by both systems)
  interaction_feedback?: string; // Interaction feedback
  coherence_feedback?: string; // Coherence feedback

  // Common feedback fields (used by both IELTS and CEFR)
  strengths?: string[];
  improvements?: string[];
  pronunciation_heatmap?: DetailedFeedbackItem[]; // Renamed from detailed_feedback
  verbatim_transcript?: string;
}

export interface DetailedFeedbackItem {
  phrase: string;
  issue?: string; // CEFR format: single issue description
  suggestion?: string; // CEFR format: how to fix
  criterion?: 'range' | 'accuracy' | 'fluency' | 'interaction' | 'coherence' | 'fluency' | 'lexical' | 'grammar' | 'pronunciation';
  severity?: 'minor' | 'moderate' | 'major';

  // Legacy IELTS format (kept for backward compatibility)
  issues?: {
    criterion: 'fluency' | 'lexical' | 'grammar' | 'pronunciation' | 'range' | 'accuracy' | 'interaction' | 'coherence';
    severity: 'minor' | 'moderate' | 'major';
    description: string;
    suggestion: string;
    bandImpact: string;
  }[];
}

export interface UserStats {
  user_id: string;
  total_sessions: number;
  avg_overall_score: number;
  avg_fluency_score: number;
  avg_lexical_score: number;
  avg_grammar_score: number;
  avg_pronunciation_score: number;
  last_practice_date: string;
  first_practice_date: string;
}

// Helper function to convert Firestore Timestamp to ISO string
function timestampToISO(timestamp: any): string {
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toISOString();
  }
  return timestamp || new Date().toISOString();
}

/**
 * Helper function to remove undefined values from an object
 * Firestore doesn't allow undefined values
 */
function removeUndefinedFields<T extends Record<string, any>>(obj: T): Partial<T> {
  const cleaned: any = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      cleaned[key] = obj[key];
    }
  }
  return cleaned;
}

/**
 * Save a practice session to Firestore
 */
export async function savePracticeSession(
  session: Omit<PracticeSession, 'id' | 'created_at'>
): Promise<PracticeSession> {
  try {
    // Remove undefined fields before saving to Firestore
    const cleanedSession = removeUndefinedFields(session);

    const docRef = await adminDb.collection('practice_sessions').add({
      ...cleanedSession,
      created_at: new Date(),
    });

    const doc = await docRef.get();
    const data = doc.data();

    if (!data) {
      throw new Error('Failed to retrieve saved session');
    }

    return {
      id: doc.id,
      ...data,
      created_at: timestampToISO(data.created_at),
    } as PracticeSession;
  } catch (error) {
    console.error('Error saving practice session:', error);
    throw error;
  }
}

/**
 * Get all practice sessions for a user
 */
export async function getUserSessions(
  userId: string,
  limit = 50
): Promise<PracticeSession[]> {
  try {
    const snapshot = await adminDb
      .collection('practice_sessions')
      .where('user_id', '==', userId)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        created_at: timestampToISO(data.created_at),
      } as PracticeSession;
    });
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    throw error;
  }
}

/**
 * Get recent sessions for a specific topic
 */
export async function getSessionsByTopic(
  userId: string,
  topic: TopicId,
  limit = 10
): Promise<PracticeSession[]> {
  try {
    const snapshot = await adminDb
      .collection('practice_sessions')
      .where('user_id', '==', userId)
      .where('topic', '==', topic)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        created_at: timestampToISO(data.created_at),
      } as PracticeSession;
    });
  } catch (error) {
    console.error('Error fetching sessions by topic:', error);
    throw error;
  }
}

/**
 * Get recent sessions for a specific CEFR level
 */
export async function getSessionsByLevel(
  userId: string,
  cefrLevel: CEFRLevel,
  limit = 10
): Promise<PracticeSession[]> {
  try {
    const snapshot = await adminDb
      .collection('practice_sessions')
      .where('user_id', '==', userId)
      .where('cefr_level', '==', cefrLevel)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        created_at: timestampToISO(data.created_at),
      } as PracticeSession;
    });
  } catch (error) {
    console.error('Error fetching sessions by CEFR level:', error);
    throw error;
  }
}

/**
 * Get user statistics (calculated from sessions)
 * Now uses CEFR levels instead of numeric scores
 */
export async function getUserStats(userId: string): Promise<UserStats | null> {
  try {
    const sessions = await getUserSessions(userId, 1000); // Get all sessions

    if (sessions.length === 0) {
      return null;
    }

    const totalSessions = sessions.length;

    // Calculate averages based on CEFR levels (convert to numeric for averaging)
    const levelSums = {
      overall: 0,
      fluency: 0,
      lexical: 0, // Still used for backward compat stats display
      grammar: 0,
      pronunciation: 0,
    };

    sessions.forEach((session) => {
      // Use CEFR levels if available, fallback to legacy scores
      if (session.overall_level) {
        levelSums.overall += cefrToNumeric(session.overall_level as any);
      } else if (session.overall_score) {
        levelSums.overall += session.overall_score;
      }

      if (session.fluency_level) {
        levelSums.fluency += cefrToNumeric(session.fluency_level as any);
      } else if (session.fluency_score) {
        levelSums.fluency += session.fluency_score;
      }

      // For backward compat: map range_level to lexical, accuracy_level to grammar
      if (session.range_level) {
        levelSums.lexical += cefrToNumeric(session.range_level as any);
      } else if (session.lexical_score) {
        levelSums.lexical += session.lexical_score;
      }

      if (session.accuracy_level) {
        levelSums.grammar += cefrToNumeric(session.accuracy_level as any);
      } else if (session.grammar_score) {
        levelSums.grammar += session.grammar_score;
      }

      // Pronunciation not in CEFR, use legacy if available
      levelSums.pronunciation += session.pronunciation_score || 0;
    });

    const dates = sessions.map((s) => new Date(s.created_at).getTime()).sort();

    return {
      user_id: userId,
      total_sessions: totalSessions,
      // Normalize CEFR numeric values (1-6 scale) to be comparable with old scores
      avg_overall_score: levelSums.overall / totalSessions,
      avg_fluency_score: levelSums.fluency / totalSessions,
      avg_lexical_score: levelSums.lexical / totalSessions,
      avg_grammar_score: levelSums.grammar / totalSessions,
      avg_pronunciation_score: levelSums.pronunciation / totalSessions,
      last_practice_date: new Date(dates[dates.length - 1]).toISOString(),
      first_practice_date: new Date(dates[0]).toISOString(),
    };
  } catch (error) {
    console.error('Error calculating user stats:', error);
    return null;
  }
}

/**
 * Get or create user profile
 */
export async function getOrCreateUserProfile(authUser: {
  id: string;
  email: string;
}): Promise<User> {
  try {
    const userRef = adminDb.collection('users').doc(authUser.id);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      const data = userDoc.data();
      return {
        id: userDoc.id,
        ...data,
        created_at: timestampToISO(data?.created_at),
        updated_at: timestampToISO(data?.updated_at),
      } as User;
    }

    // Create new user profile
    const newUser = {
      email: authUser.email,
      created_at: new Date(),
      updated_at: new Date(),
      preferred_cefr_level: 'B1' as CEFRLevel, // Default to intermediate
      preferred_topics: [] as TopicId[],
    };

    await userRef.set(newUser);

    return {
      id: authUser.id,
      ...newUser,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as User;
  } catch (error) {
    console.error('Error getting or creating user profile:', error);
    throw error;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<User, 'id' | 'created_at' | 'email'>>
): Promise<User> {
  try {
    const userRef = adminDb.collection('users').doc(userId);

    await userRef.update({
      ...updates,
      updated_at: new Date(),
    });

    const updatedDoc = await userRef.get();
    const data = updatedDoc.data();

    if (!data) {
      throw new Error('Failed to retrieve updated user');
    }

    return {
      id: updatedDoc.id,
      ...data,
      created_at: timestampToISO(data.created_at),
      updated_at: timestampToISO(data.updated_at),
    } as User;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

/**
 * Get recent sessions for progress tracking (last N sessions)
 */
export async function getRecentSessions(
  userId: string,
  count = 5
): Promise<PracticeSession[]> {
  return getUserSessions(userId, count);
}

/**
 * Save user's preferred CEFR level (from assessment or manual selection)
 */
export async function saveUserPreferredLevel(
  userId: string,
  level: CEFRLevel
): Promise<void> {
  try {
    const userRef = adminDb.collection('users').doc(userId);

    await userRef.set({
      preferred_cefr_level: level,
      last_level_assessment: new Date().toISOString(),
      updated_at: new Date(),
    }, { merge: true });

    console.log(`✅ Saved preferred CEFR level for user ${userId}: ${level}`);
  } catch (error) {
    console.error('Error saving user preferred level:', error);
    throw error;
  }
}

/**
 * Get user's preferred CEFR level
 * Returns null if user doesn't exist or hasn't set a level
 */
export async function getUserPreferredLevel(
  userId: string
): Promise<CEFRLevel | null> {
  try {
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return null;
    }

    const data = userDoc.data();
    return (data?.preferred_cefr_level as CEFRLevel) || null;
  } catch (error) {
    console.error('Error fetching user preferred level:', error);
    return null;
  }
}

/**
 * Calculate improvement trend (simple linear regression on CEFR levels)
 * Now works with CEFR levels converted to numeric scale
 */
export function calculateImprovementTrend(sessions: PracticeSession[]): {
  trend: 'improving' | 'stable' | 'declining';
  rate: number;
} {
  if (sessions.length < 2) {
    return { trend: 'stable', rate: 0 };
  }

  // Get overall levels (prefer CEFR, fallback to scores)
  const levels = sessions
    .map((s) => {
      if (s.overall_level) {
        return cefrToNumeric(s.overall_level as any);
      }
      return s.overall_score || 0;
    })
    .filter((l) => l > 0)
    .reverse(); // Chronological order

  if (levels.length < 2) {
    return { trend: 'stable', rate: 0 };
  }

  // Simple linear regression
  const n = levels.length;
  const sumX = (n * (n - 1)) / 2;
  const sumY = levels.reduce((a, b) => a + b, 0);
  const sumXY = levels.reduce((sum, y, x) => sum + x * y, 0);
  const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  const trend = slope > 0.1 ? 'improving' : slope < -0.1 ? 'declining' : 'stable';

  return { trend, rate: slope };
}

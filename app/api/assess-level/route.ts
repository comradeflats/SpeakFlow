import { analyzeESLSpeechWithAudioForAssessment } from '@/lib/vertex-ai';
import { adminAuth } from '@/lib/firebase-admin';
import { saveUserPreferredLevel, checkSessionLimit, incrementSessionCount } from '@/lib/firestore-db';
import { CEFRLevel } from '@/lib/conversation-topics';
import { NextRequest, NextResponse } from 'next/server';

// Helper to ensure a value is an array
const ensureArray = (value: any): string[] => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    // If it's a string, try splitting by newlines or commas
    return value.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
  }
  return [];
};

export async function POST(request: NextRequest) {
  try {
    const { audio, fullTranscript, feedbackLanguage = 'en' } = await request.json();

    if (!audio) {
      return NextResponse.json(
        { error: 'Missing audio data' },
        { status: 400 }
      );
    }

    // Get authenticated user from session cookie
    const sessionCookie = request.cookies.get('__session')?.value;

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
    const userId = decodedClaims.uid;

    // Check session limit
    const limitCheck = await checkSessionLimit(userId, 'assessment');
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { error: 'Assessment limit reached. You have already completed your assessment.' },
        { status: 403 }
      );
    }

    // Decode base64 audio
    // Format: "data:audio/webm;base64,<base64data>"
    const base64Data = audio.split(',')[1];
    if (!base64Data) {
      return NextResponse.json(
        { error: 'Invalid audio format' },
        { status: 400 }
      );
    }

    const audioBuffer = Buffer.from(base64Data, 'base64');

    // Call Vertex AI for assessment using specialized assessment function
    // NO level anchor - evaluates across full CEFR range (A1-C2)
    const analysis = await analyzeESLSpeechWithAudioForAssessment(
      audioBuffer,
      'casual', // Neutral topic for assessment
      'audio/webm',
      fullTranscript,
      feedbackLanguage
    );

    // Extract the overall assessed level
    const assessedLevel = analysis.overall_level as CEFRLevel;

    if (!assessedLevel) {
      return NextResponse.json(
        { error: 'Failed to assess CEFR level from conversation' },
        { status: 500 }
      );
    }

    console.log(`✅ Level assessment complete for user ${userId}: ${assessedLevel}`);

    // Calculate confidence based on how consistent the criteria levels are
    const levels = [
      analysis.range_level,
      analysis.accuracy_level,
      analysis.fluency_level,
      analysis.interaction_level,
      analysis.coherence_level
    ].filter(Boolean);

    // Convert CEFR levels to numeric values for variation calculation
    const numericLevels = levels.map(l => {
      const match = l?.match(/[A-C][1-2]/);
      return match ? match[0] : '';
    }).filter(Boolean).map(l => {
      const mapping: Record<string, number> = { 'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6 };
      return mapping[l] || 3;
    });

    // If all criteria are within 1 level of each other, high confidence
    const levelVariation = numericLevels.length > 0
      ? numericLevels.reduce((acc, val, _, arr) => {
          const diff = Math.abs(val - (arr.reduce((a, b) => a + b, 0) / arr.length));
          return Math.max(acc, diff);
        }, 0)
      : 0;

    const confidence = levelVariation < 0.5 ? 'high' : levelVariation < 1.0 ? 'medium' : 'low';

    // Save assessed level as user's preferred level
    await saveUserPreferredLevel(userId, assessedLevel);

    // Increment assessment count
    await incrementSessionCount(userId, 'assessment');

    // Add debugging logs for type conversion
    if (!Array.isArray(analysis.strengths)) {
      console.warn('⚠️ Strengths was not an array, converting:', typeof analysis.strengths);
    }
    if (!Array.isArray(analysis.improvements)) {
      console.warn('⚠️ Improvements was not an array, converting:', typeof analysis.improvements);
    }

    // Return assessment result with comprehensive feedback
    return NextResponse.json({
      assessedLevel,
      confidence,
      details: {
        range_level: analysis.range_level,
        accuracy_level: analysis.accuracy_level,
        fluency_level: analysis.fluency_level,
        interaction_level: analysis.interaction_level,
        coherence_level: analysis.coherence_level
      },
      strengths: ensureArray(analysis.strengths),
      improvements: ensureArray(analysis.improvements),

      // Include comprehensive feedback
      verbatim_transcript: analysis.verbatim_transcript || '',
      range_feedback: ensureArray(analysis.range_feedback),
      accuracy_feedback: ensureArray(analysis.accuracy_feedback),
      fluency_feedback: ensureArray(analysis.fluency_feedback),
      interaction_feedback: ensureArray(analysis.interaction_feedback),
      coherence_feedback: ensureArray(analysis.coherence_feedback),
      detailed_feedback: ensureArray(analysis.detailed_feedback),
    });
  } catch (error: any) {
    console.error('Error in level assessment:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error during level assessment' },
      { status: 500 }
    );
  }
}

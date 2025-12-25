import { analyzeESLSpeechWithAudio } from '@/lib/vertex-ai';
import { adminAuth } from '@/lib/firebase-admin';
import { savePracticeSession } from '@/lib/firestore-db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { audio, topic, cefrLevel, fullTranscript, feedbackLanguage = 'en' } = await request.json();

    console.log('🌍 API received feedbackLanguage:', feedbackLanguage);

    if (!audio || !topic || !cefrLevel) {
      return NextResponse.json(
        { error: 'Missing audio, topic, or CEFR level' },
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

    // Call Vertex AI with audio, full conversation context, and language preference
    const analysis = await analyzeESLSpeechWithAudio(
      audioBuffer,
      topic,
      cefrLevel,
      'audio/webm',
      fullTranscript,
      feedbackLanguage
    );

    // Debug: Check if detailed feedback is present
    if (analysis.detailed_feedback && analysis.detailed_feedback.length > 0) {
      console.log(`✅ Detailed feedback received: ${analysis.detailed_feedback.length} phrases`);
    } else if (analysis.detailedFeedback && analysis.detailedFeedback.length > 0) {
      console.log(`✅ Detailed feedback received (legacy format): ${analysis.detailedFeedback.length} phrases`);
    } else {
      console.log('⚠️  No detailed feedback in Vertex AI response');
    }

    // Log CEFR levels received
    console.log('📊 CEFR Analysis Results:');
    console.log(`   Overall: ${analysis.overall_level || 'N/A'}`);
    console.log(`   Range: ${analysis.range_level || 'N/A'}, Accuracy: ${analysis.accuracy_level || 'N/A'}`);
    console.log(`   Fluency: ${analysis.fluency_level || 'N/A'}, Interaction: ${analysis.interaction_level || 'N/A'}, Coherence: ${analysis.coherence_level || 'N/A'}`);

    // Save to Firestore
    try {
      await savePracticeSession({
        user_id: userId,
        topic: topic,
        cefr_level: cefrLevel,
        transcript: analysis.verbatim_transcript || analysis.verbatimTranscript || '',

        // CEFR fields only
        overall_level: analysis.overall_level,
        range_level: analysis.range_level,
        accuracy_level: analysis.accuracy_level,
        fluency_level: analysis.fluency_level,
        interaction_level: analysis.interaction_level,
        coherence_level: analysis.coherence_level,

        range_feedback: analysis.range_feedback,
        accuracy_feedback: analysis.accuracy_feedback,
        fluency_feedback: analysis.fluency_feedback,
        interaction_feedback: analysis.interaction_feedback,
        coherence_feedback: analysis.coherence_feedback,

        // Common fields
        strengths: analysis.strengths || [],
        improvements: analysis.improvements || [],
        pronunciation_heatmap: analysis.detailed_feedback || analysis.detailedFeedback || [],
        verbatim_transcript: analysis.verbatim_transcript || analysis.verbatimTranscript,
      });

      console.log('✅ Practice session saved to Firestore with CEFR levels');
    } catch (dbError) {
      console.error('Failed to save to Firestore:', dbError);
      // Don't fail the request if DB save fails - return analysis anyway
    }

    return NextResponse.json(analysis, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);

    // Vertex AI specific error handling
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('PERMISSION_DENIED')) {
      return NextResponse.json(
        { error: 'GCP authentication failed. Check service account permissions.' },
        { status: 403 }
      );
    }

    if (errorMessage.includes('RESOURCE_EXHAUSTED')) {
      return NextResponse.json(
        { error: 'Vertex AI quota exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    if (errorMessage.includes('No GCP credentials found')) {
      return NextResponse.json(
        { error: 'GCP configuration error. Check environment variables.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to analyze speech',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}

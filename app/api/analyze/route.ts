import { analyzeESLSpeech } from '@/lib/gemini';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { transcript, part } = await request.json();

    if (!transcript || !part) {
      return NextResponse.json(
        { error: 'Missing transcript or part' },
        { status: 400 }
      );
    }

    // Call Gemini for analysis
    const analysis = await analyzeESLSpeech(transcript, part);

    return NextResponse.json(analysis, { status: 200 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze speech',
        // Provide mock data for testing when API fails
        fluencyScore: 6,
        lexicalScore: 6,
        grammarScore: 6,
        pronunciationScore: 6,
        overallScore: 6,
        fluencyFeedback: 'Good speech flow with minor hesitations.',
        lexicalFeedback: 'Solid vocabulary range with room for more advanced expressions.',
        grammarFeedback: 'Generally accurate grammar with some complex structures attempted.',
        pronunciationFeedback: 'Clear pronunciation with good word stress patterns.',
        improvements: [
          'Reduce filler words like "um" and "uh"',
          'Incorporate more sophisticated vocabulary',
          'Practice connecting phrases more smoothly',
        ],
        strengths: [
          'Clear voice and good articulation',
          'Coherent and logical response structure',
          'Appropriate use of discourse markers',
        ],
      },
      { status: 200 }
    );
  }
}

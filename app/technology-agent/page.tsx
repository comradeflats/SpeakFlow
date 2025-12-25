'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ConversationInterface } from '@/components/ConversationInterface';
import { FeedbackDisplay } from '@/components/FeedbackDisplay';
import { CEFRAnalysis } from '@/lib/cefr-scoring';
import { ChevronLeft } from 'lucide-react';
import Card from '@/components/ui/Card';
import Spinner from '@/components/ui/Spinner';
import { TopicId, CEFRLevel, getTopicById, ConversationTopic } from '@/lib/conversation-topics';

// Hardcode the topic for this dedicated page
const DEDICATED_TOPIC_ID: TopicId = 'technology';
const DEDICATED_TOPIC_DATA: ConversationTopic | undefined = getTopicById(DEDICATED_TOPIC_ID);

export default function TechnologyAgentPage() {
  const [stage, setStage] = useState<'practice' | 'results'>('practice');
  // Default to B1, but this could be a prop or a smaller selector component
  const [selectedLevel] = useState<CEFRLevel>('B1');
  const [transcript, setTranscript] = useState('');
  const [analysis, setAnalysis] = useState<CEFRAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleTranscriptUpdate = (newTranscript: string) => {
    setTranscript(newTranscript);
  };

  const handlePracticeComplete = async (audioData: string) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio: audioData,
          topic: DEDICATED_TOPIC_ID,
          cefrLevel: selectedLevel,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze speech');
      }

      const result = await response.json();
      setAnalysis(result);
      setTranscript(result.verbatimTranscript || result.transcript || '');
      setStage('results');
    } catch (error) {
      console.error('Error analyzing speech:', error);
      alert('Error analyzing your speech. Please try again.');
      setStage('practice'); // Go back to practice on error
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStartOver = () => {
    setStage('practice');
    setTranscript('');
    setAnalysis(null);
  };
  
  if (!DEDICATED_TOPIC_DATA) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-red-500">Error: Topic 'technology' not found.</p>
      </div>
    );
  }

  if (stage === 'practice') {
    return (
      <div className="min-h-screen bg-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/practice"
            className="inline-flex items-center gap-2 text-ocean-600 hover:text-ocean-700 mb-8 font-semibold transition-smooth"
          >
            <ChevronLeft size={20} />
            Back to All Topics
          </Link>

          {isAnalyzing && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="flex flex-col items-center gap-4">
                <Spinner size="lg" color="ocean" />
                <p className="text-lg font-semibold text-slate-dark">Analyzing your conversation...</p>
                <p className="text-sm text-slate-medium text-center max-w-md">
                  Our AI is evaluating your fluency, vocabulary, grammar, and pronunciation.
                </p>
              </Card>
            </div>
          )}

          <ConversationInterface
            key={`${DEDICATED_TOPIC_ID}-${selectedLevel}`}
            topic={DEDICATED_TOPIC_ID}
            cefrLevel={selectedLevel}
            onTranscriptUpdate={handleTranscriptUpdate}
            onComplete={handlePracticeComplete}
          />
        </div>
      </div>
    );
  }

  if (stage === 'results' && analysis) {
    return (
      <div className="min-h-screen bg-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleStartOver}
            className="inline-flex items-center gap-2 text-ocean-600 hover:text-ocean-700 mb-8 font-semibold transition-smooth"
          >
            <ChevronLeft size={20} />
            Practice Again
          </button>

          <FeedbackDisplay
            analysis={analysis}
            topic={DEDICATED_TOPIC_DATA.name}
            cefrLevel={selectedLevel}
            transcript={transcript}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Spinner size="lg" color="ocean" />
    </div>
  );
}

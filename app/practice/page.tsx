'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ConversationInterface } from '@/components/ConversationInterface';
import { FeedbackDisplay } from '@/components/FeedbackDisplay';
import { IELTSAnalysis } from '@/lib/ielts-scoring';
import { Loader, ChevronLeft } from 'lucide-react';

export default function PracticePage() {
  const [stage, setStage] = useState<'select' | 'practice' | 'results'>('select');
  const [selectedPart, setSelectedPart] = useState<'1' | '2' | '3' | null>(null);
  const [transcript, setTranscript] = useState('');
  const [analysis, setAnalysis] = useState<IELTSAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const partDescriptions = {
    '1': {
      name: 'Introduction & Personal Questions',
      duration: '4-5 minutes',
      description: 'Answer questions about familiar topics like work, studies, family, hobbies.',
      topics: ['Work or Studies', 'Your Hometown', 'Your Family', 'Your Interests'],
    },
    '2': {
      name: 'Cue Card Task',
      duration: '1-2 minutes (prep + speaking)',
      description: 'Speak on a given topic for 1-2 minutes based on bullet points.',
      topics: ['Describe a Person', 'Describe a Place', 'Describe an Event', 'Describe an Object'],
    },
    '3': {
      name: 'Discussion & Abstract Questions',
      duration: '4-5 minutes',
      description: 'Discuss more abstract topics related to your Part 2 topic.',
      topics: ['Follow-up Questions', 'Abstract Concepts', 'Opinion Questions', 'Comparative Discussion'],
    },
  };

  const handlePartSelect = (part: '1' | '2' | '3') => {
    setSelectedPart(part);
    setTranscript('');
    setAnalysis(null);
    setStage('practice');
  };

  const handleTranscriptUpdate = (newTranscript: string) => {
    setTranscript(newTranscript);
  };

  const handlePracticeComplete = async (finalTranscript: string) => {
    setIsAnalyzing(true);
    try {
      // Call the analysis API
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: finalTranscript,
          part: selectedPart,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze speech');
      }

      const result = await response.json();
      setAnalysis(result);
      setStage('results');
    } catch (error) {
      console.error('Error analyzing speech:', error);
      alert('Error analyzing your speech. Please try again.');
      setStage('practice');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBackToParts = () => {
    setStage('select');
    setSelectedPart(null);
    setTranscript('');
    setAnalysis(null);
  };

  if (stage === 'select') {
    return (
      <div className="min-h-screen bg-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-8 font-semibold transition"
          >
            <ChevronLeft size={20} />
            Back to Home
          </Link>

          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">IELTS Speaking Practice</h1>
            <p className="text-lg text-gray-600">
              Choose a part to practice. The AI examiner will assess your fluency, vocabulary, grammar, and pronunciation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {Object.entries(partDescriptions).map(([part, info]) => (
              <div
                key={part}
                className="bg-white rounded-xl border border-gray-200 p-8 hover:border-teal-300 hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group"
                onClick={() => handlePartSelect(part as '1' | '2' | '3')}
              >
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                      {part}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{info.name}</h2>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 font-semibold">{info.duration}</p>
                </div>

                <p className="text-gray-700 text-sm mb-6 leading-relaxed">{info.description}</p>

                <div className="mb-6">
                  <p className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">Common Topics:</p>
                  <ul className="space-y-2">
                    {info.topics.map((topic) => (
                      <li key={topic} className="text-sm text-gray-600 flex items-center gap-2">
                        <span className="w-1 h-1 bg-teal-500 rounded-full" />
                        {topic}
                      </li>
                    ))}
                  </ul>
                </div>

                <button className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg transition shadow-md hover:shadow-lg">
                  Start Practice
                </button>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-teal-50 border-l-4 border-teal-600 p-6 rounded-lg">
            <p className="text-slate-700 text-sm">
              <strong className="text-teal-700">💡 Pro Tip:</strong> Start with Part 1 if you&apos;re new to IELTS practice. Parts 2 and 3 require more advanced vocabulary and fluency. You can practice any part at any time.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'practice' && selectedPart) {
    return (
      <div className="min-h-screen bg-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleBackToParts}
            className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-8 font-semibold transition"
          >
            <ChevronLeft size={20} />
            Back to Parts
          </button>

          {isAnalyzing && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-8 flex flex-col items-center gap-4 shadow-2xl">
                <Loader size={48} className="animate-spin text-teal-600" />
                <p className="text-lg font-semibold text-slate-900">Analyzing your speech...</p>
                <p className="text-sm text-gray-600 text-center">
                  Our AI examiner is evaluating your fluency, vocabulary, grammar, and pronunciation.
                </p>
              </div>
            </div>
          )}

          <ConversationInterface
            agentId={process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID || ''}
            part={selectedPart}
            onTranscriptUpdate={handleTranscriptUpdate}
            onComplete={handlePracticeComplete}
          />
        </div>
      </div>
    );
  }

  if (stage === 'results' && selectedPart && analysis) {
    return (
      <div className="min-h-screen bg-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleBackToParts}
            className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 mb-8 font-semibold transition"
          >
            <ChevronLeft size={20} />
            Try Another Part
          </button>

          <FeedbackDisplay analysis={analysis} part={selectedPart} transcript={transcript} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <Loader size={48} className="animate-spin text-teal-600" />
    </div>
  );
}

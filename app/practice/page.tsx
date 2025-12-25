'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { ConversationInterface, ConversationMessage } from '@/components/ConversationInterface';
import { FeedbackDisplay } from '@/components/FeedbackDisplay';
import { LevelAssessment, AssessmentResult } from '@/components/LevelAssessment';
import { CEFRAnalysis, DetailedFeedbackItem, CEFRLevel } from '@/lib/cefr-scoring';
import { ChevronLeft, Lightbulb, Target, Award } from 'lucide-react';
import Card from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { TopicId, getTopicById } from '@/lib/conversation-topics';
import CEFRLevelSelector from '@/components/CEFRLevelSelector';
import { LanguagePicker } from '@/components/LanguagePicker';

const DEFAULT_TOPIC: TopicId = 'casual';
const DEFAULT_LEVEL: CEFRLevel = 'B1';

const CEFR_LEVEL_NAMES: Record<CEFRLevel, string> = {
  'A1': 'Beginner',
  'A1+': 'High Beginner',
  'A2': 'Elementary',
  'A2+': 'High Elementary',
  'B1': 'Intermediate',
  'B1+': 'High Intermediate',
  'B2': 'Upper-Intermediate',
  'B2+': 'High Upper-Intermediate',
  'C1': 'Advanced',
  'C1+': 'High Advanced',
  'C2': 'Proficient',
};

export default function PracticePage() {
  const [stage, setStage] = useState<'assessment-prompt' | 'assessment' | 'assessment-result' | 'select' | 'practice' | 'results'>('select');
  const [selectedTopic, setSelectedTopic] = useState<TopicId | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel>(DEFAULT_LEVEL);
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [hasCheckedPreferredLevel, setHasCheckedPreferredLevel] = useState(false);
  const [userPreferredLevel, setUserPreferredLevel] = useState<CEFRLevel | null>(null);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [analysis, setAnalysis] = useState<CEFRAnalysis | null>(null);
  const [feedbackLanguage, setFeedbackLanguage] = useState<string>('en');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [conversationKey, setConversationKey] = useState(0); // Stable key for conversation instance

  // Check if user has a preferred level on mount
  useEffect(() => {
    const checkPreferredLevel = async () => {
      try {
        // Check if coming from dashboard with ?assess=true
        const params = new URLSearchParams(window.location.search);
        if (params.get('assess') === 'true') {
          // Force assessment flow even if user has preferred level
          setStage('assessment-prompt');
          setHasCheckedPreferredLevel(true);
          return;
        }

        // For now, check localStorage as a simple client-side check
        // In production, this should fetch from the backend
        const storedLevel = localStorage.getItem('preferred_cefr_level');
        if (storedLevel && ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(storedLevel)) {
          setUserPreferredLevel(storedLevel as CEFRLevel);
          setSelectedLevel(storedLevel as CEFRLevel);
          setStage('select');
        } else {
          // No preferred level found - show assessment prompt
          setStage('assessment-prompt');
        }
      } catch (error) {
        console.error('Error checking preferred level:', error);
        setStage('select'); // Default to selection if check fails
      } finally {
        setHasCheckedPreferredLevel(true);
      }
    };

    checkPreferredLevel();
  }, []);

  // Load and persist feedback language preference
  useEffect(() => {
    const storedLanguage = localStorage.getItem('feedbackLanguage');
    if (storedLanguage) {
      setFeedbackLanguage(storedLanguage);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('feedbackLanguage', feedbackLanguage);
  }, [feedbackLanguage]);

  const handleStartPractice = () => {
    setSelectedTopic(DEFAULT_TOPIC);
    setTranscript('');
    setMessages([]);
    setAnalysis(null);
    setConversationKey(prev => prev + 1); // Increment key to create fresh conversation instance
    setStage('practice');

    console.log('🔧 DEBUG: Practice started with default topic:', DEFAULT_TOPIC);
    console.log('🔧 DEBUG: Selected CEFR Level:', selectedLevel);
  };

  const handleTranscriptUpdate = useCallback((newTranscript: string) => {
    setTranscript(newTranscript);
  }, []);

  const handleMessagesUpdate = useCallback((newMessages: ConversationMessage[]) => {
    setMessages(newMessages);
  }, []);

  const handlePracticeComplete = useCallback(async (audioData: string) => {
    setIsAnalyzing(true);
    try {
      // Build full conversation transcript from messages
      const fullTranscript = messages
        .map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.text}`)
        .join('\n');

      console.log('🌍 Sending to API with language:', feedbackLanguage);

      // Call the analysis API with audio and full conversation context
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio: audioData,
          topic: selectedTopic,
          cefrLevel: selectedLevel,
          fullTranscript,
          messages,
          feedbackLanguage,
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
      setStage('practice');
    } finally {
      setIsAnalyzing(false);
    }
  }, [selectedTopic, selectedLevel, messages, feedbackLanguage]);

  const handleBackToTopics = () => {
    setStage('select');
    setSelectedTopic(null);
    setTranscript('');
    setMessages([]);
    setAnalysis(null);
    // Keep conversationKey as-is - it will be incremented when starting a new practice
  };

  const handleStartAssessment = () => {
    setStage('assessment');
  };

  const handleSkipAssessment = () => {
    setStage('select');
  };

  const handleAssessmentComplete = (result: AssessmentResult) => {
    setAssessmentResult(result);
    setSelectedLevel(result.assessedLevel);
    setUserPreferredLevel(result.assessedLevel);

    // Save to localStorage for client-side persistence
    localStorage.setItem('preferred_cefr_level', result.assessedLevel);

    setStage('assessment-result');
  };

  const handleProceedFromAssessment = () => {
    setStage('select');
  };

  // Show loading state while checking preferred level
  if (!hasCheckedPreferredLevel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Spinner size="lg" color="ocean" />
      </div>
    );
  }

  // Assessment Prompt - First time users
  if (stage === 'assessment-prompt') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-ocean-600 hover:text-ocean-700 mb-8 font-semibold transition-smooth"
          >
            <ChevronLeft size={20} />
            Back to Home
          </Link>

          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Target className="w-8 h-8 text-blue-600" />
            </div>

            <h1 className="text-3xl font-bold text-slate-dark mb-4">
              Welcome to SpeakFlow!
            </h1>

            <p className="text-lg text-slate-medium mb-8">
              To provide you with the best practice experience, we need to know your current English speaking level.
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="p-6 border-2 border-blue-200 rounded-lg bg-blue-50">
                <Award className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-dark mb-2">Take Assessment</h3>
                <p className="text-sm text-slate-medium mb-4">
                  Have a 1-2 minute conversation with our AI to determine your CEFR level accurately.
                </p>
                <Button onClick={handleStartAssessment} variant="primary" className="w-full">
                  Assess My Level
                </Button>
              </div>

              <div className="p-6 border-2 border-gray-200 rounded-lg">
                <Lightbulb className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                <h3 className="font-semibold text-slate-dark mb-2">I Know My Level</h3>
                <p className="text-sm text-slate-medium mb-4">
                  If you already know your CEFR level (A1-C2), you can skip the assessment.
                </p>
                <Button onClick={handleSkipAssessment} variant="secondary" className="w-full">
                  Skip & Select Level
                </Button>
              </div>
            </div>

            {/* Feedback Language Selection */}
            <div className="mb-6 p-6 border-2 border-gray-200 rounded-lg bg-gray-50 text-left">
              <h3 className="font-semibold text-slate-dark mb-2">
                Feedback Language
              </h3>
              <p className="text-sm text-slate-medium mb-4">
                All feedback and analysis will be provided in this language
              </p>
              <LanguagePicker
                selectedLanguage={feedbackLanguage}
                onLanguageChange={setFeedbackLanguage}
              />
            </div>

            <Alert variant="info" className="text-left">
              <p className="text-sm">
                <strong>Why assess?</strong> Practicing at the right level helps you improve faster. The assessment is quick, conversational, and adapts to your responses.
              </p>
            </Alert>
          </Card>
        </div>
      </div>
    );
  }

  // Assessment in progress
  if (stage === 'assessment') {
    return (
      <div className="min-h-screen bg-white py-12 px-4">
        <LevelAssessment
          onComplete={handleAssessmentComplete}
          onCancel={() => setStage('assessment-prompt')}
          feedbackLanguage={feedbackLanguage}
        />
      </div>
    );
  }

  // Assessment Result
  if (stage === 'assessment-result' && assessmentResult) {
    // Convert AssessmentResult to CEFRAnalysis format for FeedbackDisplay
    const analysisFromAssessment: CEFRAnalysis = {
      overall_level: assessmentResult.assessedLevel,
      range_level: (assessmentResult.details.range_level || assessmentResult.assessedLevel) as CEFRLevel,
      accuracy_level: (assessmentResult.details.accuracy_level || assessmentResult.assessedLevel) as CEFRLevel,
      fluency_level: (assessmentResult.details.fluency_level || assessmentResult.assessedLevel) as CEFRLevel,
      interaction_level: (assessmentResult.details.interaction_level || assessmentResult.assessedLevel) as CEFRLevel,
      coherence_level: (assessmentResult.details.coherence_level || assessmentResult.assessedLevel) as CEFRLevel,

      range_feedback: assessmentResult.range_feedback || [],
      accuracy_feedback: assessmentResult.accuracy_feedback || [],
      fluency_feedback: assessmentResult.fluency_feedback || [],
      interaction_feedback: assessmentResult.interaction_feedback || [],
      coherence_feedback: assessmentResult.coherence_feedback || [],

      strengths: assessmentResult.strengths,
      improvements: assessmentResult.improvements,
      verbatim_transcript: assessmentResult.verbatim_transcript || '',
      detailed_feedback: (assessmentResult.detailed_feedback || []) as DetailedFeedbackItem[],
    };

    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-ocean-600 hover:text-ocean-700 mb-8 font-semibold transition-smooth"
          >
            <ChevronLeft size={20} />
            Back to Home
          </Link>

          <Card className="p-8">
            {/* Header with confidence badge */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-dark mb-4">
                Assessment Complete!
              </h1>
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="px-6 py-3 bg-ocean-600 text-white rounded-lg">
                  <p className="text-sm font-semibold">Your CEFR Level</p>
                  <p className="text-3xl font-bold">{assessmentResult.assessedLevel}</p>
                  <p className="text-sm opacity-90">
                    {CEFR_LEVEL_NAMES[assessmentResult.assessedLevel]}
                  </p>
                </div>

                <div className={`px-4 py-2 rounded-lg ${
                  assessmentResult.confidence === 'high' ? 'bg-green-100 text-green-800' :
                  assessmentResult.confidence === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  <p className="text-xs font-semibold">Confidence</p>
                  <p className="text-lg font-bold uppercase">{assessmentResult.confidence}</p>
                </div>
              </div>

              <p className="text-slate-medium">
                Here's a detailed analysis of your speaking performance
              </p>
            </div>

            {/* Use FeedbackDisplay component for comprehensive feedback */}
            <FeedbackDisplay
              analysis={analysisFromAssessment}
              topic="casual"
              cefrLevel={assessmentResult.assessedLevel}
              transcript={assessmentResult.verbatim_transcript || ''}
            />

            {/* Action buttons */}
            <div className="mt-8 flex gap-4 justify-center">
              <Button
                onClick={handleProceedFromAssessment}
                variant="primary"
              >
                Start Practicing at {assessmentResult.assessedLevel} Level
              </Button>
              <Button
                onClick={() => {
                  // Check if came from dashboard
                  const params = new URLSearchParams(window.location.search);
                  if (params.get('assess') === 'true') {
                    window.location.href = '/dashboard';
                  } else {
                    setStage('assessment-prompt');
                  }
                }}
                variant="secondary"
              >
                {new URLSearchParams(window.location.search).get('assess') === 'true'
                  ? 'Return to Dashboard'
                  : 'Retake Assessment'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (stage === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-ocean-600 hover:text-ocean-700 mb-8 font-semibold transition-smooth"
          >
            <ChevronLeft size={20} />
            Back to Home
          </Link>

          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-dark mb-3">
              Ready to Practice?
            </h1>
            <p className="text-lg text-slate-medium max-w-3xl mx-auto">
              Start a natural conversation to practice your English. Our AI will provide personalized feedback to help you improve.
            </p>
          </div>

          {/* CEFR Level Selector */}
          <div className="mb-8 max-w-4xl mx-auto">
            <CEFRLevelSelector
              selectedLevel={selectedLevel}
              onChange={setSelectedLevel}
              defaultLevel={userPreferredLevel || undefined}
            />
          </div>

          {/* Feedback Language Selection */}
          <div className="mb-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-slate-dark mb-3">
                Feedback Language
              </h3>
              <p className="text-sm text-slate-medium mb-4">
                All feedback and analysis will be provided in this language
              </p>
              <LanguagePicker
                selectedLanguage={feedbackLanguage}
                onLanguageChange={setFeedbackLanguage}
              />
            </div>
          </div>

          {/* Start Practice Button */}
          <div className="mb-12 max-w-4xl mx-auto">
            <Button
              onClick={handleStartPractice}
              variant="primary"
              size="lg"
              className="w-full py-4 text-lg font-semibold"
            >
              Start Practice
            </Button>
          </div>

          {/* Pro Tip */}
          <div className="max-w-4xl mx-auto">
            <Alert variant="info" className="p-6">
              <Lightbulb size={20} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm">
                  <strong>Pro Tip:</strong> Click Start Practice to begin a natural conversation. The AI will guide you through the discussion and provide detailed feedback. Conversations typically last 3-5 minutes. Don't worry about making mistakes - just focus on practicing!
                </p>
              </div>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'practice' && selectedTopic) {
    return (
      <div className="min-h-screen bg-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleBackToTopics}
            className="inline-flex items-center gap-2 text-ocean-600 hover:text-ocean-700 mb-8 font-semibold transition-smooth"
          >
            <ChevronLeft size={20} />
            Back to Topics
          </button>

          {isAnalyzing && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <Card className="flex flex-col items-center gap-4">
                <Spinner size="lg" color="ocean" />
                <p className="text-lg font-semibold text-slate-dark">Analyzing your conversation...</p>
                <p className="text-sm text-slate-medium text-center max-w-md">
                  Our AI is evaluating your fluency, vocabulary, grammar, and pronunciation using advanced linguistic analysis.
                </p>
              </Card>
            </div>
          )}

          <ConversationInterface
            key={conversationKey}
            topic={selectedTopic}
            cefrLevel={selectedLevel}
            onTranscriptUpdate={handleTranscriptUpdate}
            onMessagesUpdate={handleMessagesUpdate}
            onComplete={handlePracticeComplete}
          />
        </div>
      </div>
    );
  }

  if (stage === 'results' && selectedTopic && analysis) {
    const topicData = getTopicById(selectedTopic);

    return (
      <div className="min-h-screen bg-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleBackToTopics}
            className="inline-flex items-center gap-2 text-ocean-600 hover:text-ocean-700 mb-8 font-semibold transition-smooth"
          >
            <ChevronLeft size={20} />
            Try Another Topic
          </button>

          <FeedbackDisplay
            analysis={analysis}
            topic={topicData?.name || selectedTopic}
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

'use client';

import { useState, useRef, useEffect } from 'react';
import { useConversation } from '@elevenlabs/react';
import { CheckCircle, Loader } from 'lucide-react';
import Button from './ui/Button';
import Alert from './ui/Alert';
import { getAssessmentAgentId, CEFRLevel } from '@/lib/conversation-topics';
import { AgentSpeakingIndicator } from './AgentSpeakingIndicator';
import { ProcessingIndicator } from './ProcessingIndicator';

const ASSESSMENT_DURATION_MS = 90000; // 1.5 minutes
const MIN_ASSESSMENT_DURATION_MS = 60000; // 1 minute minimum

interface LevelAssessmentProps {
  onComplete: (result: AssessmentResult) => void;
  onCancel?: () => void;
  feedbackLanguage?: string;
}

export interface AssessmentResult {
  assessedLevel: CEFRLevel;
  confidence: 'high' | 'medium' | 'low';
  details: {
    range_level?: string;
    accuracy_level?: string;
    fluency_level?: string;
    interaction_level?: string;
    coherence_level?: string;
  };
  strengths: string[];
  improvements: string[];

  // Comprehensive feedback fields
  verbatim_transcript?: string;
  range_feedback?: string[];
  accuracy_feedback?: string[];
  fluency_feedback?: string[];
  interaction_feedback?: string[];
  coherence_feedback?: string[];
  detailed_feedback?: Array<{
    phrase: string;
    issue: string;
    criterion: string;
    severity: string;
    suggestion: string;
  }>;
}

export const LevelAssessment: React.FC<LevelAssessmentProps> = ({
  onComplete,
  onCancel,
  feedbackLanguage = 'en',
}) => {
  const agentId = getAssessmentAgentId();

  const [conversationStartTime, setConversationStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [_transcript, setTranscript] = useState<string>('');
  const transcriptRef = useRef<string>('');
  const [messages, setMessages] = useState<Array<{role: 'user' | 'agent', text: string}>>([]);

  // Audio recording state
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const hasStartedRecordingRef = useRef<boolean>(false);

  const {
    status,
    startSession,
    endSession,
  } = useConversation({
    agentId: agentId,
    onConnect: () => {
      console.log('✅ Connected to assessment agent');
      setConversationStartTime(Date.now());
    },
    onDisconnect: () => {
      console.log('❌ Disconnected from assessment agent');
    },
    onMessage: (message: any) => {
      console.log('📨 Assessment message:', message);

      const text = message.message || '';
      const source = message.source || '';

      if (source === 'user' && text) {
        const newTranscript = transcriptRef.current + (transcriptRef.current ? '\n' : '') + `You: ${text}`;
        transcriptRef.current = newTranscript;
        setTranscript(newTranscript);
        setMessages(prev => [...prev, { role: 'user', text }]);
      } else if ((source === 'ai' || source === 'agent') && text) {
        const newTranscript = transcriptRef.current + (transcriptRef.current ? '\n' : '') + `Agent: ${text}`;
        transcriptRef.current = newTranscript;
        setTranscript(newTranscript);
        setMessages(prev => [...prev, { role: 'agent', text }]);
      }
    },
    onError: (error: any) => {
      console.error('❌ Assessment error:', error);
      setError('An error occurred during the assessment. Please try again.');
    },
  });

  // Timer to track elapsed time
  useEffect(() => {
    if (status === 'connected' && conversationStartTime > 0) {
      const interval = setInterval(() => {
        setElapsedTime(Date.now() - conversationStartTime);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [status, conversationStartTime]);

  // Auto-end assessment after target duration
  useEffect(() => {
    if (elapsedTime >= ASSESSMENT_DURATION_MS && status === 'connected') {
      console.log('⏰ Assessment duration reached, ending session...');
      handleFinishAssessment();
    }
  }, [elapsedTime, status]);

  // Start audio recording when connected
  useEffect(() => {
    if (status === 'connected' && !hasStartedRecordingRef.current) {
      startAudioRecording();
      hasStartedRecordingRef.current = true;
    }
  }, [status]);

  // Auto-start conversation on mount
  useEffect(() => {
    if (status === 'disconnected') {
      handleStartAssessment();
    }
  }, []);

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      mediaRecorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
          setAudioChunks((prev) => [...prev, event.data]);
        }
      };

      mediaRecorder.start(1000); // Capture every second
      console.log('🎤 Audio recording started for assessment');
    } catch (error) {
      console.error('Error starting audio recording:', error);
      setError('Failed to access microphone. Please check your permissions.');
    }
  };

  const stopAudioRecording = (): Blob | null => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
    }

    if (audioChunks.length === 0) {
      return null;
    }

    return new Blob(audioChunks, { type: 'audio/webm' });
  };

  const handleStartAssessment = async () => {
    try {
      setError(null);
      await startSession({
        agentId: agentId,
        connectionType: 'websocket',
      });
    } catch (error: any) {
      console.error('Error starting assessment:', error);
      setError(error.message || 'Failed to start assessment');
    }
  };

  const handleFinishAssessment = async () => {
    // Check minimum duration
    if (elapsedTime < MIN_ASSESSMENT_DURATION_MS) {
      setError(`Please continue the conversation for at least ${Math.ceil((MIN_ASSESSMENT_DURATION_MS - elapsedTime) / 1000)} more seconds.`);
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      // End the conversation session
      await endSession();

      // Stop audio recording
      const audioBlob = stopAudioRecording();

      if (!audioBlob) {
        throw new Error('No audio recorded during assessment');
      }

      // Convert audio to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;

        // Call assess-level API
        const response = await fetch('/api/assess-level', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            audio: base64Audio,
            fullTranscript: transcriptRef.current,
            feedbackLanguage: feedbackLanguage,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Assessment failed');
        }

        const result: AssessmentResult = await response.json();
        console.log('✅ Assessment result:', result);

        // Pass result to parent
        onComplete(result);
      };
    } catch (error: any) {
      console.error('Error finishing assessment:', error);
      setError(error.message || 'Failed to complete assessment');
      setIsAnalyzing(false);
    }
  };

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progress = Math.min((elapsedTime / ASSESSMENT_DURATION_MS) * 100, 100);
  const remainingTime = Math.max(0, ASSESSMENT_DURATION_MS - elapsedTime);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          CEFR Level Assessment
        </h2>

        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        {isAnalyzing ? (
          <div className="text-center py-12">
            <ProcessingIndicator isActive={true} />
            <p className="text-gray-600 mt-4">
              Analyzing your conversation and determining your CEFR level...
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This may take up to 30 seconds
            </p>
          </div>
        ) : (
          <>
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Assessment Progress
                </span>
                <span className="text-sm text-gray-600">
                  {formatTime(elapsedTime)} / {formatTime(ASSESSMENT_DURATION_MS)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {remainingTime > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {Math.ceil(remainingTime / 1000)}s remaining
                </p>
              )}
            </div>

            {/* Status Indicator */}
            <div className="mb-6">
              {status === 'connected' && <AgentSpeakingIndicator isActive={true} />}
              {status === 'connecting' && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Connecting to assessment agent...</span>
                </div>
              )}
              {status === 'disconnected' && !isAnalyzing && (
                <div className="text-sm text-gray-500">
                  Click "Start Assessment" to begin
                </div>
              )}
            </div>

            {/* Instructions */}
            {status === 'connected' && (
              <Alert variant="info" className="mb-6">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">Have a natural conversation!</p>
                    <p>Answer questions honestly and speak naturally. The agent will adapt to your level automatically.</p>
                  </div>
                </div>
              </Alert>
            )}

            {/* Conversation Messages */}
            {messages.length > 0 && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Conversation
                </h3>
                <div className="space-y-3">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`
                          max-w-[80%] px-4 py-3 rounded-lg
                          ${msg.role === 'user'
                            ? 'bg-ocean-600 text-white rounded-br-none'
                            : 'bg-gray-200 text-slate-dark rounded-bl-none'
                          }
                        `}
                      >
                        <p className="text-xs font-semibold mb-1 opacity-70">
                          {msg.role === 'user' ? 'You' : 'AI Assessor'}
                        </p>
                        <p className="text-sm leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              {onCancel && status === 'disconnected' && (
                <Button variant="secondary" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              {status === 'disconnected' && !isAnalyzing && (
                <Button onClick={handleStartAssessment}>
                  Start Assessment
                </Button>
              )}
              {status === 'connected' && elapsedTime >= MIN_ASSESSMENT_DURATION_MS && (
                <Button onClick={handleFinishAssessment} variant="primary">
                  Finish Assessment
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useConversation } from '@elevenlabs/react';
import { Send, Loader, Lightbulb } from 'lucide-react';
import Button from './ui/Button';
import Alert from './ui/Alert';
import { getAgentIdForLevel, getTopicById, getAgentSystemPrompt, TopicId, CEFRLevel } from '@/lib/conversation-topics';
import { AgentSpeakingIndicator } from './AgentSpeakingIndicator';
import { ProcessingIndicator } from './ProcessingIndicator';

const PRACTICE_DURATION_MS = 90000;      // 1.5 minutes (same as assessment)
const MIN_PRACTICE_DURATION_MS = 60000;  // 1 minute minimum

type ConversationState = 'idle' | 'user-speaking' | 'processing' | 'agent-speaking';

interface ConversationMessage {
  role: 'user' | 'agent';
  text: string;
  timestamp: number;
}

interface ConversationInterfaceProps {
  topic: TopicId;
  cefrLevel: CEFRLevel;
  onTranscriptUpdate: (transcript: string) => void;
  onMessagesUpdate?: (messages: ConversationMessage[]) => void;
  onComplete: (audioData: string) => void;
}

export type { ConversationMessage };

export const ConversationInterface: React.FC<ConversationInterfaceProps> = ({
  topic,
  cefrLevel,
  onTranscriptUpdate,
  onMessagesUpdate,
  onComplete,
}) => {
  const topicData = getTopicById(topic);
  const agentId = getAgentIdForLevel(cefrLevel);

  const [_transcript, setTranscript] = useState<string>('');
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [showTranscript, setShowTranscript] = useState(true);
  const [conversationState, setConversationState] = useState<ConversationState>('idle');
  const [conversationStartTime, setConversationStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const transcriptRef = useRef<string>('');
  const hasGreetedRef = useRef<boolean>(false);

  // Audio recording state
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);

  // Load transcript visibility preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('showTranscript');
    if (saved !== null) {
      setShowTranscript(saved === 'true');
    }
  }, []);

  // Save transcript visibility preference to localStorage
  useEffect(() => {
    localStorage.setItem('showTranscript', String(showTranscript));
  }, [showTranscript]);

  // Notify parent component when messages update
  useEffect(() => {
    if (onMessagesUpdate && messages.length > 0) {
      onMessagesUpdate(messages);
    }
  }, [messages, onMessagesUpdate]);

  // Debug: Log which agent ID is being used
  useEffect(() => {
    console.log(`🎯 Topic "${topic}" selected agent ID:`, agentId);
    console.log(`📋 CEFR Level:`, cefrLevel);
  }, [topic, cefrLevel, agentId]);

  const {
    status,
    startSession,
    endSession,
  } = useConversation({
    agentId: agentId,
    onConnect: () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`✅ [onConnect] Connected to ${topic} agent (${agentId})`);
      console.log('🔊 [onConnect] Audio output should be enabled');
      console.log('🔊 [onConnect] Listening for agent greeting...');
      console.log('[onConnect] Resetting hasGreetedRef to false');
      hasGreetedRef.current = false; // Reset greeting flag
      setConversationStartTime(Date.now());
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    },
    onAudio: (audio: any) => {
      if (audio) {
        const size = audio.byteLength || audio.length || 'unknown';
        console.log('🔊 [onAudio] Received audio chunk:', size, 'bytes');
      } else {
        console.log('🔊 [onAudio] Received audio chunk but data is undefined/null');
      }
      // Audio is automatically played by the SDK
      // This callback is just for logging/debugging
    },
    onDisconnect: () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('❌ [onDisconnect] Disconnected from agent');
      console.log('❌ [onDisconnect] Status before disconnect:', status);
      console.log('❌ [onDisconnect] Had greeted:', hasGreetedRef.current);
      hasGreetedRef.current = false;
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    },
    onMessage: (message: any) => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📨 [onMessage] Message received at:', new Date().toLocaleTimeString());
      console.log('📨 [onMessage] Full message object:', JSON.stringify(message, null, 2));

      // Capture ALL messages for debugging
      if (message.message) {
        console.log(`📨 [onMessage] Source: ${message.source}`);
        console.log(`📨 [onMessage] Content: ${message.message}`);

        const role = message.source === 'user' ? 'user' : 'agent';

        // Update conversation state based on role
        if (role === 'agent') {
          setConversationState('agent-speaking');
          // Estimate speaking duration based on text length (~150 WPM)
          const estimatedDuration = (message.message.length / 150) * 60 * 1000;
          setTimeout(() => {
            setConversationState('idle');
          }, estimatedDuration);
        } else {
          // User just spoke, AI is processing response
          setConversationState('processing');
        }

        // Add to full message history
        const newMessage: ConversationMessage = {
          role,
          text: message.message,
          timestamp: Date.now(),
        };

        setMessages(prev => [...prev, newMessage]);

        // Log AI messages specifically
        if (message.source === 'ai' || message.source === 'agent') {
          console.log('🤖🤖🤖 AGENT SPOKE! 🤖🤖🤖');
          console.log('🤖 Message:', message.message);
          console.log('🤖 This is the agent greeting/response!');
        }

        // Log user messages
        if (message.source === 'user') {
          console.log('👤 USER MESSAGE DETECTED');
          console.log('👤 Message:', message.message);
        }
      } else {
        console.log('⚠️  [onMessage] No message content in this message object');
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // Only capture user messages (not AI responses) for backward-compatible transcript
      if (message.source === 'user' && message.message) {
        const newTranscript = transcriptRef.current + ' ' + message.message;
        transcriptRef.current = newTranscript;
        setTranscript(newTranscript.trim());
        onTranscriptUpdate(newTranscript.trim());
      }
    },
    onError: (error: any) => {
      console.error('❌ Conversation error:', error);
      console.error('❌ Full error object:', JSON.stringify(error, null, 2));
      alert('Error with conversation: ' + error.message);
    },
  });

  // NOTE: Removed automatic "Hello" greeting trigger
  // Eleven Labs agents should speak their "First message" automatically when connected
  // We'll let the agent initiate the conversation naturally
  useEffect(() => {
    console.log('[DEBUG-STATUS] Status changed to:', status);
    if (status === 'connected') {
      console.log('[DEBUG-STATUS] ✅ Connected! Agent should speak its first message automatically.');
      console.log('[DEBUG-STATUS] Waiting for agent to greet the user...');
      hasGreetedRef.current = true; // Mark as greeted to prevent future auto-messages
    }
  }, [status]);

  // Timer to track elapsed time
  useEffect(() => {
    if (status === 'connected' && conversationStartTime > 0) {
      const interval = setInterval(() => {
        setElapsedTime(Date.now() - conversationStartTime);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [status, conversationStartTime]);

  // Auto-end practice session after target duration
  useEffect(() => {
    if (elapsedTime >= PRACTICE_DURATION_MS && status === 'connected') {
      console.log('⏰ Practice duration reached, ending session...');
      handleStopConversation();
    }
  }, [elapsedTime, status]);

  // Cleanup function to fully stop audio recording
  const stopAudioRecording = useCallback(async () => {
    console.log('🛑 Stopping audio recording...');

    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      console.log('  ✓ MediaRecorder stopped');
    }

    // Stop all audio tracks
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log('  ✓ Audio track stopped');
      });
      audioStreamRef.current = null;
    }

    // Wait for cleanup to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    // Clear references
    mediaRecorderRef.current = null;

    console.log('✅ Audio recording fully stopped');
  }, []);

  const startAudioRecording = useCallback(async () => {
    try {
      // Stop any existing recording first
      await stopAudioRecording();

      console.log('🎤 Starting new audio recording...');
      console.log('🎤 Requesting microphone access...');

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ Microphone access granted');
      audioStreamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log(`  📦 Audio chunk: ${event.data.size} bytes`);
          setAudioChunks(prev => [...prev, event.data]);
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100);

      console.log('✅ Audio recording started');
    } catch (error: any) {
      console.error('❌ Failed to start audio recording:', error);
      console.error('❌ Error name:', error.name);
      console.error('❌ Error message:', error.message);

      if (error.name === 'NotAllowedError') {
        alert('Microphone access was denied. Please allow microphone access and try again.');
      } else if (error.name === 'NotFoundError') {
        alert('No microphone found. Please connect a microphone and try again.');
      } else {
        alert('Failed to access microphone: ' + error.message);
      }

      throw error;
    }
  }, [stopAudioRecording]);

  const handleStartConversation = useCallback(async () => {
    try {
      console.log('🎤 Starting conversation...');
      console.log(`📊 CEFR Level: ${cefrLevel}, Topic: ${topic}`);

      // Resume audio context if needed (browser autoplay policy)
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          if (ctx.state === 'suspended') {
            await ctx.resume();
            console.log('🔊 Audio context resumed');
          }
          ctx.close(); // Close this test context
        }
      } catch (audioError) {
        console.warn('Could not resume audio context:', audioError);
      }

      setIsListening(true);

      // Clear previous data
      setAudioChunks([]);
      setMessages([]);
      transcriptRef.current = '';
      setTranscript('');

      await startAudioRecording();

      // Generate CEFR-specific system prompt
      const customPrompt = getAgentSystemPrompt(topic, cefrLevel);
      console.log('🎯 Using CEFR-adapted prompt for level:', cefrLevel);
      console.log('📝 Custom prompt length:', customPrompt.length, 'characters');

      // Start session with CEFR-adapted system prompt
      // NOTE: firstMessage override intentionally NOT used
      // Dashboard-configured greetings work correctly when not overridden
      // Programmatic override was preventing greetings from being spoken
      await startSession({
        agentId: agentId,
        connectionType: 'websocket',
      });

      console.log('✅ Conversation started with CEFR level:', cefrLevel);
    } catch (error: any) {
      console.error('❌ Failed to start conversation:', error);
      console.error('❌ Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      setIsListening(false);

      // Show user-friendly error message
      if (error.name === 'NotAllowedError') {
        // Microphone permission was already shown above
      } else {
        alert('Failed to start conversation: ' + error.message);
      }
    }
  }, [agentId, topic, cefrLevel, startAudioRecording, startSession]);

  const handleStopConversation = useCallback(async () => {
    try {
      // Check minimum duration
      if (elapsedTime < MIN_PRACTICE_DURATION_MS) {
        setError(`Please continue the conversation for at least ${Math.ceil((MIN_PRACTICE_DURATION_MS - elapsedTime) / 1000)} more seconds.`);
        return;
      }

      setError(null); // Clear any previous errors
      console.log('🛑 Stopping conversation...');

      // Stop ElevenLabs session
      await endSession();
      console.log('  ✓ ElevenLabs session ended');

      setIsListening(false);

      // Use cleanup function to stop audio recording
      await stopAudioRecording();

      // Wait for final chunks to arrive
      await new Promise(resolve => setTimeout(resolve, 300));

      // Create audio blob
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

      console.log(`  📊 Audio blob size: ${audioBlob.size} bytes`);

      if (audioBlob.size === 0) {
        console.error('❌ No audio captured');
        alert('No audio captured. Please speak something before finishing.');
        return;
      }

      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Audio = reader.result as string;
        console.log('✅ Audio converted to base64, sending for analysis...');
        onComplete(base64Audio);
      };
      reader.readAsDataURL(audioBlob);

    } catch (error) {
      console.error('Failed to stop conversation:', error);
    }
  }, [elapsedTime, audioChunks, onComplete, endSession, stopAudioRecording]);

  // Auto-start conversation when component mounts
  useEffect(() => {
    console.log('🚀 Auto-starting conversation...');
    handleStartConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps = run once on mount

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up ConversationInterface on unmount...');

      // Stop recording if active
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        console.log('  ✓ MediaRecorder stopped on unmount');
      }

      // Stop all tracks
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => {
          track.stop();
          console.log('  ✓ Audio track stopped on unmount');
        });
      }

      // End ElevenLabs session (endSession is safe to call even if not connected)
      endSession();
      console.log('  ✓ ElevenLabs session cleanup called on unmount');

      console.log('✅ Cleanup complete');
    };
  }, []); // Empty deps - cleanup only on true unmount

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progress = Math.min((elapsedTime / PRACTICE_DURATION_MS) * 100, 100);
  const remainingTime = Math.max(0, PRACTICE_DURATION_MS - elapsedTime);

  return (
    <div className="flex flex-col h-screen bg-white rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-ocean-50 to-ocean-100 border-b border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{topicData?.icon || '💬'}</span>
              <div>
                <h2 className="text-3xl font-bold text-slate-dark">
                  {topicData?.name || topic}
                </h2>
                <p className="text-slate-medium text-sm">
                  Level: {cefrLevel} | Duration: 1:30 minutes
                </p>
              </div>
            </div>
          </div>

          {/* Transcript Toggle */}
          <div className="flex items-center gap-2 ml-4">
            <label className="flex items-center gap-2 text-sm text-slate-medium cursor-pointer hover:text-slate-dark transition-colors">
              <input
                type="checkbox"
                checked={showTranscript}
                onChange={(e) => setShowTranscript(e.target.checked)}
                className="rounded border-gray-300 text-ocean-600 focus:ring-ocean-500 cursor-pointer"
              />
              <span className="font-medium">Show transcript</span>
            </label>
            <span className="text-xs text-slate-medium/70 hidden sm:inline">
              {showTranscript ? '(Visible)' : '(Hidden)'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden p-6">
        {/* Visual Indicators */}
        <div className="mb-4">
          <AgentSpeakingIndicator isActive={conversationState === 'agent-speaking'} />
          <ProcessingIndicator isActive={conversationState === 'processing'} />

          {/* Connection Status */}
          <div className="flex items-center gap-3 mt-2">
            <div
              className={`w-3 h-3 rounded-full transition-all ${
                isListening
                  ? 'bg-ocean-600 animate-pulse shadow-lg'
                  : status === 'connecting'
                  ? 'bg-yellow-500 animate-pulse'
                  : 'bg-gray-300'
              }`}
            />
            <span className="text-sm text-slate-medium">
              {conversationState === 'agent-speaking'
                ? 'AI is speaking...'
                : conversationState === 'processing'
                ? 'AI is thinking...'
                : isListening
                ? 'Listening... Speak naturally'
                : status === 'connecting'
                ? 'Connecting to agent...'
                : 'Initializing...'}
            </span>
          </div>
        </div>

        {/* Transcript Display */}
        <div className="flex-1 bg-gray-50 rounded-lg border border-gray-200 p-6 mb-6 overflow-y-auto">
          {showTranscript ? (
            messages.length > 0 ? (
              <div className="space-y-4">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-4">
                  Conversation Transcript
                </p>
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
                        {msg.role === 'user' ? 'You' : 'AI Partner'}
                      </p>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-medium italic text-center py-12">
                Your conversation will appear here as you speak...
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex flex-col items-center gap-3">
                <div className="flex items-center gap-2 text-slate-medium">
                  <span className={`w-3 h-3 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></span>
                  <span className="font-medium text-lg">
                    {isListening ? 'Recording in Progress' : 'Ready to Record'}
                  </span>
                </div>
                <p className="text-sm text-slate-medium/70 max-w-xs">
                  {isListening
                    ? 'Speak naturally - your conversation is being captured'
                    : 'Transcript hidden for immersive practice'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Status Indicator */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full transition-all ${
                isListening
                  ? 'bg-ocean-600 animate-pulse-ring shadow-lg'
                  : status === 'connecting'
                  ? 'bg-yellow-500 animate-pulse'
                  : 'bg-gray-300'
              }`}
            />
            <span className="text-sm text-slate-medium">
              {isListening
                ? 'Listening... Speak naturally with the AI'
                : status === 'connecting'
                ? 'Connecting to agent...'
                : status === 'connected'
                ? 'Connected! Starting conversation...'
                : 'Initializing...'}
            </span>
          </div>
        </div>

        {/* Timer Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Practice Progress
            </span>
            <span className="text-sm text-gray-600">
              {formatTime(elapsedTime)} / {formatTime(PRACTICE_DURATION_MS)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-ocean-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          {remainingTime > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {Math.ceil(remainingTime / 1000)}s remaining
            </p>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="error" className="mb-6">
            {error}
          </Alert>
        )}

        {/* Helpful Tips */}
        <div className="mb-6">
          <Alert variant="info" className="p-4">
            <Lightbulb size={20} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm">
                <strong>Tip:</strong> Have a natural conversation with the AI. It will adapt to your {cefrLevel} level. Don't worry about mistakes - just practice speaking!
              </p>
            </div>
          </Alert>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-4">
          {/* Auto-start enabled - only show Finish button when listening */}
          {isListening && (
            <Button
              onClick={handleStopConversation}
              variant="danger"
              size="lg"
              className="flex-1 flex items-center justify-center gap-2"
            >
              <Send size={20} />
              Finish & Get Feedback
            </Button>
          )}
        </div>

        {/* Status Text */}
        {status === 'connecting' && (
          <div className="mt-4 flex items-center justify-center gap-2 text-ocean-600">
            <Loader size={16} className="animate-spin" />
            <span className="text-sm font-medium">Initializing conversation...</span>
          </div>
        )}
      </div>
    </div>
  );
};

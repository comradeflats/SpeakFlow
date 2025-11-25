'use client';

import { useState, useRef } from 'react';
import { useConversation } from '@elevenlabs/react';
import { Mic, Send, Loader } from 'lucide-react';

interface ConversationInterfaceProps {
  agentId: string;
  onTranscriptUpdate: (transcript: string) => void;
  onComplete: (transcript: string) => void;
  part: '1' | '2' | '3';
}

export const ConversationInterface: React.FC<ConversationInterfaceProps> = ({
  agentId,
  onTranscriptUpdate,
  onComplete,
  part,
}) => {
  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState(false);
  const transcriptRef = useRef<string>('');

  const {
    status,
    startSession,
    endSession,
  } = useConversation({
    agentId,
    onConnect: () => console.log('Connected'),
    onDisconnect: () => console.log('Disconnected'),
    onMessage: (message: any) => {
      // Only capture user messages (not AI responses)
      if (message.source === 'user' && message.message) {
        const newTranscript = transcriptRef.current + ' ' + message.message;
        transcriptRef.current = newTranscript;
        setTranscript(newTranscript.trim());
        onTranscriptUpdate(newTranscript.trim());
      }
    },
    onError: (error: any) => {
      console.error('Conversation error:', error);
      alert('Error with conversation: ' + error.message);
    },
  });


  const handleStartConversation = async () => {
    try {
      setIsListening(true);
      await startSession({ agentId } as any);
    } catch (error) {
      console.error('Failed to start conversation:', error);
      setIsListening(false);
    }
  };

  const handleStopConversation = async () => {
    try {
      await endSession();
      setIsListening(false);
      if (transcript.trim()) {
        onComplete(transcript);
      } else {
        alert('No transcript captured. Please speak something before finishing.');
      }
    } catch (error) {
      console.error('Failed to stop conversation:', error);
    }
  };

  const getDurationText = () => {
    const parts = {
      '1': '4-5 minutes (Tell me about yourself)',
      '2': '1-2 minutes (Describe something)',
      '3': '4-5 minutes (Discussion questions)',
    };
    return parts[part];
  };

  return (
    <div className="flex flex-col h-screen bg-white rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-gray-200 p-6">
        <h2 className="text-3xl font-bold text-slate-900 mb-1">
          IELTS Speaking Part {part}
        </h2>
        <p className="text-gray-600 text-sm">
          {getDurationText()}
        </p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden p-6">
        {/* Transcript Display */}
        <div className="flex-1 bg-slate-50 rounded-lg border border-gray-200 p-6 mb-6 overflow-y-auto">
          {transcript ? (
            <div className="text-gray-700 leading-relaxed space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Your response</p>
              <p className="text-base text-slate-800 leading-relaxed">{transcript}</p>
            </div>
          ) : (
            <div className="text-gray-400 italic text-center py-12">
              Your spoken response will appear here as you speak...
            </div>
          )}
        </div>

        {/* Status Indicator */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full transition-all ${
                isListening
                  ? 'bg-teal-500 animate-pulse-ring shadow-lg'
                  : 'bg-gray-300'
              }`}
            />
            <span className="text-sm text-gray-600">
              {isListening
                ? 'Listening... Speak naturally'
                : 'Ready to start. Click to begin.'}
            </span>
          </div>
        </div>

        {/* Helpful Tips */}
        <div className="mb-6 p-4 bg-teal-50 rounded-lg border border-teal-200">
          <p className="text-sm text-slate-700">
            <strong className="text-teal-700">💡 Tip:</strong> Speak naturally without pausing. The AI understands natural speech with different accents and pace variations.
          </p>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-4">
          {!isListening ? (
            <button
              onClick={handleStartConversation}
              disabled={!status || status === 'connecting'}
              className="flex-1 flex items-center justify-center gap-2 bg-teal-600 text-white font-semibold py-4 rounded-lg hover:bg-teal-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mic size={20} />
              Start Speaking
            </button>
          ) : (
            <button
              onClick={handleStopConversation}
              className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white font-semibold py-4 rounded-lg hover:bg-red-600 transition-all shadow-md hover:shadow-lg"
            >
              <Send size={20} />
              Finish & Analyze
            </button>
          )}
        </div>

        {/* Status Text */}
        {status === 'connecting' && (
          <div className="mt-4 flex items-center justify-center gap-2 text-teal-600">
            <Loader size={16} className="animate-spin" />
            <span className="text-sm font-medium">Initializing conversation...</span>
          </div>
        )}
      </div>
    </div>
  );
};

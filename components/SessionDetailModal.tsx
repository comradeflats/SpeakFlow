'use client';

import { useEffect } from 'react';
import { PracticeSession } from '@/lib/firestore-db';
import { CEFRAnalysis, CEFRLevel } from '@/lib/cefr-scoring';
import { FeedbackDisplay } from './FeedbackDisplay';

interface SessionDetailModalProps {
  session: PracticeSession | null;
  onClose: () => void;
}

// Transform PracticeSession to CEFRAnalysis format
const transformSessionToAnalysis = (session: PracticeSession): CEFRAnalysis => {
  return {
    overall_level: (session.overall_level as CEFRLevel) || 'B1',
    range_level: (session.range_level as CEFRLevel) || 'B1',
    accuracy_level: (session.accuracy_level as CEFRLevel) || 'B1',
    fluency_level: (session.fluency_level as CEFRLevel) || 'B1',
    interaction_level: (session.interaction_level as CEFRLevel) || 'B1',
    coherence_level: (session.coherence_level as CEFRLevel) || 'B1',

    range_feedback: session.range_feedback || [],
    accuracy_feedback: session.accuracy_feedback || [],
    fluency_feedback: session.fluency_feedback || [],
    interaction_feedback: session.interaction_feedback || [],
    coherence_feedback: session.coherence_feedback || [],

    strengths: session.strengths || [],
    improvements: session.improvements || [],
    detailed_feedback: session.pronunciation_heatmap || [],
    verbatim_transcript: session.verbatim_transcript,
  };
};

// Format topic ID to readable name
const formatTopic = (topic: string): string => {
  const topicNames: Record<string, string> = {
    'tech': 'Technology',
    'travel': 'Travel',
    'food': 'Food & Dining',
    'work': 'Work & Career',
    'hobbies': 'Hobbies',
    'current-events': 'Current Events',
  };
  return topicNames[topic] || topic;
};

// Format date/time
const formatDateTime = (dateString: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
};

export default function SessionDetailModal({ session, onClose }: SessionDetailModalProps) {
  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (session) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [session, onClose]);

  // Don't render if no session
  if (!session) {
    return null;
  }

  const analysis = transformSessionToAnalysis(session);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto pointer-events-auto animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl z-10">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  Session Feedback
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDateTime(session.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {formatTopic(session.topic)}
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Target Level: {session.cefr_level}
                  </span>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body - Feedback Display */}
          <div className="px-6 py-6">
            <FeedbackDisplay
              analysis={analysis}
              topic={formatTopic(session.topic)}
              cefrLevel={session.cefr_level}
              transcript={session.verbatim_transcript || ''}
            />
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

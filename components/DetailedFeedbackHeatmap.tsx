'use client';

import React, { useState } from 'react';
import { DetailedFeedbackItem as CEFRDetailedFeedbackItem } from '@/lib/cefr-scoring';

// CEFR format only
type DetailedFeedbackItem = CEFRDetailedFeedbackItem;
type IssueSeverity = 'minor' | 'moderate' | 'major';
type CriterionType = 'range' | 'accuracy' | 'fluency' | 'interaction' | 'coherence';

interface DetailedFeedbackHeatmapProps {
  transcript: string;
  detailedFeedback: DetailedFeedbackItem[];
}

// Color schemes for each CEFR criterion (5 criteria)
const criterionConfig = {
  range: {
    label: 'Range (Vocabulary)',
    color: 'purple',
    emoji: '📚',
    bgLight: 'bg-purple-50',
    bgMedium: 'bg-purple-100',
    border: 'border-purple-400',
    text: 'text-purple-700',
  },
  accuracy: {
    label: 'Accuracy (Grammar)',
    color: 'red',
    emoji: '✏️',
    bgLight: 'bg-red-50',
    bgMedium: 'bg-red-100',
    border: 'border-red-400',
    text: 'text-red-700',
  },
  fluency: {
    label: 'Fluency',
    color: 'blue',
    emoji: '🗣️',
    bgLight: 'bg-blue-50',
    bgMedium: 'bg-blue-100',
    border: 'border-blue-400',
    text: 'text-blue-700',
  },
  interaction: {
    label: 'Interaction',
    color: 'green',
    emoji: '👥',
    bgLight: 'bg-green-50',
    bgMedium: 'bg-green-100',
    border: 'border-green-400',
    text: 'text-green-700',
  },
  coherence: {
    label: 'Coherence',
    color: 'orange',
    emoji: '🔗',
    bgLight: 'bg-orange-50',
    bgMedium: 'bg-orange-100',
    border: 'border-orange-400',
    text: 'text-orange-700',
  },
};

const severityConfig = {
  minor: {
    label: 'Minor',
    emoji: '🟡',
    intensity: 'border-2',
  },
  moderate: {
    label: 'Moderate',
    emoji: '🟠',
    intensity: 'border-3',
  },
  major: {
    label: 'Major',
    emoji: '🔴',
    intensity: 'border-4',
  },
};

export default function DetailedFeedbackHeatmap({
  transcript,
  detailedFeedback,
}: DetailedFeedbackHeatmapProps) {
  const [selectedPhrase, setSelectedPhrase] = useState<number | null>(null);
  const [hoveredPhrase, setHoveredPhrase] = useState<number | null>(null);
  const [expandedSummaryItem, setExpandedSummaryItem] = useState<number | null>(null);

  if (!detailedFeedback || detailedFeedback.length === 0) {
    return null;
  }

  // Build a map of phrases to their positions in the transcript
  const phraseMap = new Map<number, DetailedFeedbackItem>();
  detailedFeedback.forEach((item, index) => {
    phraseMap.set(index, item);
  });

  // Split transcript into segments based on phrases with issues
  const renderTranscript = () => {
    let currentPosition = 0;
    const segments: React.ReactElement[] = [];

    detailedFeedback.forEach((item, index) => {
      const phraseStart = transcript.indexOf(item.phrase, currentPosition);

      if (phraseStart === -1) {
        // Phrase not found, skip
        return;
      }

      // Add text before this phrase (clean text)
      if (phraseStart > currentPosition) {
        const cleanText = transcript.substring(currentPosition, phraseStart);
        segments.push(
          <span key={`clean-${index}`} className="text-gray-700">
            {cleanText}
          </span>
        );
      }

      // Add the phrase with issues (highlighted)
      const isActive = hoveredPhrase === index || selectedPhrase === index;

      // CEFR format - single issue per item
      const criteriaList = [item.criterion];
      const severities = [item.severity];
      const maxSeverity = getMaxSeverity(severities);

      segments.push(
        <span
          key={`phrase-${index}`}
          className={`
            relative inline-block px-1 py-0.5 mx-0.5 rounded cursor-pointer
            transition-all duration-200
            ${isActive ? 'bg-yellow-100 shadow-md scale-105' : 'bg-gray-50 hover:bg-gray-100'}
            ${severityConfig[maxSeverity].intensity}
            border-dashed
            ${getBorderColor(criteriaList)}
          `}
          onMouseEnter={() => setHoveredPhrase(index)}
          onMouseLeave={() => setHoveredPhrase(null)}
          onClick={() => setSelectedPhrase(selectedPhrase === index ? null : index)}
        >
          <span className="text-gray-800">{item.phrase}</span>
          {/* Issue badges */}
          <span className="inline-flex gap-0.5 ml-1">
            {criteriaList.map((criterion: CriterionType, idx: number) => (
              <span
                key={idx}
                className={`text-xs ${criterionConfig[criterion].text}`}
                title={criterionConfig[criterion].label}
              >
                {criterionConfig[criterion].emoji}
              </span>
            ))}
          </span>
        </span>
      );

      currentPosition = phraseStart + item.phrase.length;
    });

    // Add remaining text
    if (currentPosition < transcript.length) {
      segments.push(
        <span key="clean-end" className="text-gray-700">
          {transcript.substring(currentPosition)}
        </span>
      );
    }

    return segments;
  };

  // Get the most severe issue level
  const getMaxSeverity = (severities: IssueSeverity[]): IssueSeverity => {
    if (severities.includes('major')) return 'major';
    if (severities.includes('moderate')) return 'moderate';
    return 'minor';
  };

  // Get border color based on criteria
  const getBorderColor = (criteria: CriterionType[]): string => {
    if (criteria.length === 0) return 'border-gray-300';
    // Use the first criterion's color
    return criterionConfig[criteria[0]].border;
  };

  return (
    <>
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 500px;
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <span>🎯</span>
          Detailed Phrase Analysis
        </h3>
        <p className="text-sm text-gray-500">
          {detailedFeedback.length} {detailedFeedback.length === 1 ? 'issue' : 'issues'} found
        </p>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-3">Legend:</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(criterionConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2">
              <span className="text-lg">{config.emoji}</span>
              <span className="text-sm text-gray-600">{config.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Severity levels:</p>
          <div className="flex gap-4">
            {Object.entries(severityConfig).map(([key, config]) => (
              <span key={key} className="text-xs text-gray-600">
                {config.emoji} {config.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Transcript */}
      <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
        <p className="text-sm font-medium text-gray-600 mb-3">
          💡 Hover over or click highlighted phrases to see detailed feedback
        </p>
        <div className="text-base leading-relaxed whitespace-pre-wrap">
          {renderTranscript()}
        </div>
      </div>

      {/* Detailed Issues Panel */}
      {(hoveredPhrase !== null || selectedPhrase !== null) && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200 p-6 shadow-lg animate-fadeIn">
          {detailedFeedback[hoveredPhrase ?? selectedPhrase!] && (
            <DetailedIssueCard
              feedbackItem={detailedFeedback[hoveredPhrase ?? selectedPhrase!]}
              onClose={() => {
                setHoveredPhrase(null);
                setSelectedPhrase(null);
              }}
            />
          )}
        </div>
      )}

      {/* Summary List */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-800">All Issues Summary:</h4>
        {detailedFeedback.map((item, index) => {
          const isExpanded = expandedSummaryItem === index;
          return (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all"
            >
              <div
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedSummaryItem(isExpanded ? null : index)}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <span className="text-2xl">
                      {severityConfig[item.severity as IssueSeverity].emoji}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 mb-1">
                      "{item.phrase}"
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {/* CEFR format: single criterion */}
                      <span
                        className={`
                          inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs
                          ${criterionConfig[item.criterion as CriterionType].bgMedium}
                          ${criterionConfig[item.criterion as CriterionType].text}
                        `}
                      >
                        {criterionConfig[item.criterion as CriterionType].emoji}
                        {criterionConfig[item.criterion as CriterionType].label}
                      </span>
                    </div>
                  </div>
                  {/* Chevron icon */}
                  <div className="flex-shrink-0">
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Inline expansion */}
              {isExpanded && (
                <div className="border-t border-gray-200 bg-gray-50 p-4 animate-slideDown">
                  <DetailedIssueCard
                    feedbackItem={item}
                    onClose={() => setExpandedSummaryItem(null)}
                    inline={true}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      </div>
    </>
  );
}

// Detailed issue card component
function DetailedIssueCard({
  feedbackItem,
  onClose,
  inline = false,
}: {
  feedbackItem: DetailedFeedbackItem;
  onClose: () => void;
  inline?: boolean;
}) {
  return (
    <div className={inline ? 'space-y-3' : 'space-y-4'}>
      {!inline && (
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-800 text-lg mb-2">Issue Details</h4>
            <p className="text-sm text-gray-700 bg-white rounded px-3 py-2 border border-gray-200">
              "{feedbackItem.phrase}"
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className={inline ? '' : 'space-y-3'}>
        {/* CEFR format: single issue */}
        <div
            className={`
              ${inline ? 'bg-white' : 'bg-white'}
              rounded-lg ${inline ? 'p-3' : 'p-4'} border-l-4
              ${criterionConfig[feedbackItem.criterion as CriterionType].border}
            `}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={inline ? 'text-xl' : 'text-2xl'}>{criterionConfig[feedbackItem.criterion as CriterionType].emoji}</span>
              <span className={`font-semibold ${criterionConfig[feedbackItem.criterion as CriterionType].text}`}>
                {criterionConfig[feedbackItem.criterion as CriterionType].label}
              </span>
              <span className="ml-auto text-sm">
                {severityConfig[feedbackItem.severity as IssueSeverity].emoji} {severityConfig[feedbackItem.severity as IssueSeverity].label}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <p className="font-medium text-gray-700 mb-1">Problem:</p>
                <p className="text-gray-600">{feedbackItem.issue}</p>
              </div>

              <div>
                <p className="font-medium text-gray-700 mb-1">💡 How to improve:</p>
                <p className="text-gray-600">{feedbackItem.suggestion}</p>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}

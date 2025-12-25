'use client';

import React from 'react';
import { CEFRAnalysis, getGlobalDescriptor, getImprovementPath, cefrToNumeric } from '@/lib/cefr-scoring';
import { CheckCircle, TrendingUp, ArrowRight, FileText, BarChart3, Target, ChevronDown, ChevronUp, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Badge from './ui/Badge';
import Button from './ui/Button';
import Card from './ui/Card';
import DetailedFeedbackHeatmap from './DetailedFeedbackHeatmap';

interface FeedbackDisplayProps {
  analysis: CEFRAnalysis;
  topic: string;
  cefrLevel: string;
  transcript: string;
}

export const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({
  analysis,
  topic: _topic,
  cefrLevel: _cefrLevel,
  transcript,
}) => {
  const [showLearningPath, setShowLearningPath] = React.useState(false);
  const [showTranscript, setShowTranscript] = React.useState(false);

  // CEFR criteria (5 criteria)
  const criteria = [
    { label: 'Range', level: analysis.range_level, feedback: analysis.range_feedback },
    { label: 'Accuracy', level: analysis.accuracy_level, feedback: analysis.accuracy_feedback },
    { label: 'Fluency', level: analysis.fluency_level, feedback: analysis.fluency_feedback },
    { label: 'Interaction', level: analysis.interaction_level, feedback: analysis.interaction_feedback },
    { label: 'Coherence', level: analysis.coherence_level, feedback: analysis.coherence_feedback },
  ];

  const getLevelVariant = (level: string): 'success' | 'info' | 'warning' | 'error' => {
    const numeric = cefrToNumeric(level as any);
    if (numeric >= 5) return 'success'; // C1-C2
    if (numeric >= 4) return 'info';    // B2+
    if (numeric >= 3) return 'warning'; // B1-B2
    return 'error';                     // A1-A2
  };

  const router = useRouter();

  // Helper to calculate word count and speaking time
  const wordCount = (analysis.verbatim_transcript || transcript).split(/\s+/).length;
  const speakingTimeMinutes = (wordCount / 150).toFixed(1);

  // Get improvement path for Next Steps
  const improvementPath = getImprovementPath(analysis.overall_level);

  const handlePracticeAgain = () => {
    router.push('/practice');
  };

  const handleViewProgress = () => {
    router.push('/dashboard');
  };

  return (
    <div className="space-y-6 bg-white">
      {/* Header */}
      <h2 className="text-3xl font-bold text-slate-dark mb-8">Your Results</h2>

      {/* Main Content - Single View */}
      <div className="space-y-6">

        {/* SECTION 1: Word-by-Word Analysis (MOST PROMINENT) */}
        {analysis.detailed_feedback && analysis.detailed_feedback.length > 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-ocean-300 p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="text-ocean-600" size={28} />
              <div>
                <h2 className="text-2xl font-bold text-slate-dark">
                  Word-by-Word Analysis
                </h2>
                <p className="text-sm text-slate-medium">
                  Interactive transcript with detailed feedback on {analysis.detailed_feedback.length} phrases
                </p>
              </div>
            </div>
            <DetailedFeedbackHeatmap
              transcript={analysis.verbatim_transcript || transcript}
              detailedFeedback={analysis.detailed_feedback}
            />
          </div>
        )}

        {/* SECTION 2: CEFR Scores - Badges Only */}
        <Card className="p-6">
          <h3 className="text-xl font-bold text-slate-dark mb-4 flex items-center gap-2">
            <Award className="text-ocean-600" size={24} />
            Your CEFR Assessment
          </h3>

          {/* Overall Level - Large Badge */}
          <div className="mb-6 pb-6 border-b-2 border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-medium">Overall Level</span>
              <div className="flex items-center gap-3">
                <Badge variant={getLevelVariant(analysis.overall_level)}>
                  {analysis.overall_level}
                </Badge>
                <span className="text-sm text-slate-dark">
                  {analysis.global_descriptor_translated || getGlobalDescriptor(analysis.overall_level)}
                </span>
              </div>
            </div>
          </div>

          {/* 5 Criterion Badges - Grid Layout */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {criteria.map((item) => (
              <div key={item.label} className="text-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-slate-medium mb-2 font-medium">{item.label}</p>
                <Badge variant={getLevelVariant(item.level)}>
                  {item.level}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* SECTION 3: Strengths & Improvements - Concise */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top 5 Strengths */}
          <Card variant="elevated" className="bg-success_light border-l-4 border-l-success">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="text-success flex-shrink-0" size={24} />
              <h3 className="text-lg font-bold text-slate-dark">Key Strengths</h3>
            </div>
            <ul className="space-y-2">
              {analysis.strengths.slice(0, 5).map((strength: string, index: number) => (
                <li key={index} className="flex gap-2 text-slate-dark text-sm">
                  <CheckCircle className="text-success flex-shrink-0 mt-0.5" size={16} />
                  <span className="leading-relaxed">{strength}</span>
                </li>
              ))}
            </ul>
            {analysis.strengths.length > 5 && (
              <p className="text-xs text-slate-medium mt-3 italic">
                +{analysis.strengths.length - 5} more strengths identified
              </p>
            )}
          </Card>

          {/* Top 5 Improvements */}
          <Card variant="elevated" className="bg-warning_light border-l-4 border-l-warning">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="text-warning flex-shrink-0" size={24} />
              <h3 className="text-lg font-bold text-slate-dark">Focus Areas</h3>
            </div>
            <ul className="space-y-2">
              {analysis.improvements.slice(0, 5).map((improvement: string, index: number) => (
                <li key={index} className="flex gap-2 text-slate-dark text-sm">
                  <ArrowRight className="text-warning flex-shrink-0 mt-0.5" size={16} />
                  <span className="leading-relaxed">{improvement}</span>
                </li>
              ))}
            </ul>
            {analysis.improvements.length > 5 && (
              <p className="text-xs text-slate-medium mt-3 italic">
                +{analysis.improvements.length - 5} more areas to work on
              </p>
            )}
          </Card>
        </div>

        {/* SECTION 4: Learning Path (Expandable) */}
        <Card className="p-6">
          <button
            onClick={() => setShowLearningPath(!showLearningPath)}
            className="w-full flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-2">
              <Target className="text-ocean-600" size={24} />
              <h3 className="text-xl font-bold text-slate-dark">Your Learning Path</h3>
            </div>
            {showLearningPath ? (
              <ChevronUp className="text-slate-medium" size={20} />
            ) : (
              <ChevronDown className="text-slate-medium" size={20} />
            )}
          </button>

          {showLearningPath && (
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
              {/* Current Level & Next Target */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card variant="elevated" className="bg-info_light border-l-4 border-l-info">
                  <h3 className="text-base font-semibold text-slate-dark mb-2">Current Level</h3>
                  <p className="text-4xl font-bold text-info mb-2">{analysis.overall_level}</p>
                  <p className="text-sm text-slate-dark leading-relaxed">
                    {analysis.global_descriptor_translated || getGlobalDescriptor(analysis.overall_level)}
                  </p>
                </Card>

                {improvementPath.nextLevel && (
                  <Card variant="elevated" className="bg-success_light border-l-4 border-l-success">
                    <h3 className="text-base font-semibold text-slate-dark mb-2">Next Target</h3>
                    <p className="text-4xl font-bold text-success mb-2">{improvementPath.nextLevel}</p>
                    <p className="text-sm text-slate-dark">
                      Focus on the areas below to reach your next level.
                    </p>
                  </Card>
                )}
              </div>

              {/* Focus Areas */}
              {improvementPath.focusAreas.length > 0 && (
                <div>
                  <h3 className="text-base font-semibold text-slate-dark mb-3">
                    Focus Areas {improvementPath.nextLevel ? `to Reach ${improvementPath.nextLevel}` : 'for Improvement'}
                  </h3>
                  <ul className="space-y-2">
                    {improvementPath.focusAreas.map((area, index) => (
                      <li key={index} className="flex gap-2 items-start text-sm">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-ocean-600 text-white flex items-center justify-center text-xs font-bold mt-0.5">
                          {index + 1}
                        </div>
                        <span className="text-slate-dark leading-relaxed">{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* SECTION 5: Transcript & Stats (Expandable) */}
        <Card className="p-6">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="w-full flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-3">
              <FileText className="text-ocean-600" size={24} />
              <h3 className="text-lg font-bold text-slate-dark">Transcript & Statistics</h3>
            </div>
            {showTranscript ? (
              <ChevronUp className="text-slate-medium" size={20} />
            ) : (
              <ChevronDown className="text-slate-medium" size={20} />
            )}
          </button>

          {showTranscript && (
            <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
              {/* Metadata */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-slate-medium uppercase tracking-wide mb-1">Word Count</p>
                  <p className="text-2xl font-bold text-slate-dark">{wordCount}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-slate-medium uppercase tracking-wide mb-1">Speaking Time</p>
                  <p className="text-2xl font-bold text-slate-dark">{speakingTimeMinutes}<span className="text-base"> min</span></p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-slate-medium uppercase tracking-wide mb-1">Avg WPM</p>
                  <p className="text-2xl font-bold text-slate-dark">
                    {Math.round(wordCount / parseFloat(speakingTimeMinutes))}
                  </p>
                </div>
              </div>

              {/* Verbatim Transcript */}
              <div>
                <h4 className="text-base font-semibold text-slate-dark mb-3">
                  {analysis.verbatim_transcript ? 'What You Actually Said' : 'Transcript'}
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <p className="text-sm text-slate-dark leading-relaxed whitespace-pre-wrap">
                    {analysis.verbatim_transcript || transcript}
                  </p>
                </div>
                {analysis.verbatim_transcript && (
                  <p className="text-xs text-slate-medium mt-2 italic">
                    This is a verbatim transcript including any grammar mistakes, filler words, or repetitions.
                  </p>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-6 mt-6 border-t border-gray-200">
        <Button variant="primary" size="lg" className="flex-1" onClick={handlePracticeAgain}>
          Practice Another Question
        </Button>
        <Button variant="secondary" size="lg" className="flex-1" onClick={handleViewProgress}>
          View Progress
        </Button>
      </div>
    </div>
  );
};

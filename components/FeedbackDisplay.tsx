'use client';

import { IELTSAnalysis, getBandDescription } from '@/lib/ielts-scoring';
import { CheckCircle, TrendingUp } from 'lucide-react';

interface FeedbackDisplayProps {
  analysis: IELTSAnalysis;
  part: '1' | '2' | '3';
  transcript: string;
}

export const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({
  analysis,
  part,
  transcript,
}) => {
  const scores = [
    { label: 'Fluency', score: analysis.fluencyScore, feedback: analysis.fluencyFeedback },
    { label: 'Lexical', score: analysis.lexicalScore, feedback: analysis.lexicalFeedback },
    { label: 'Grammar', score: analysis.grammarScore, feedback: analysis.grammarFeedback },
    { label: 'Pronunciation', score: analysis.pronunciationScore, feedback: analysis.pronunciationFeedback },
  ];

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-emerald-600';
    if (score >= 7) return 'text-teal-600';
    if (score >= 6) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 8) return 'bg-emerald-50 border border-emerald-200';
    if (score >= 7) return 'bg-teal-50 border border-teal-200';
    if (score >= 6) return 'bg-amber-50 border border-amber-200';
    return 'bg-red-50 border border-red-200';
  };

  return (
    <div className="space-y-6 bg-white">
      {/* Overall Score */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-6">Your Results</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Overall Band Score */}
          <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl p-8 text-white shadow-lg">
            <p className="text-sm font-semibold opacity-90">Overall Band Score</p>
            <p className="text-6xl font-bold mt-3">{analysis.overallScore}</p>
            <p className="text-sm mt-6 opacity-90 leading-relaxed">
              {getBandDescription(analysis.overallScore)}
            </p>
          </div>

          {/* Part Information */}
          <div className="bg-slate-50 rounded-xl p-8 border border-gray-200">
            <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">IELTS Speaking</p>
            <p className="text-5xl font-bold text-slate-900 mt-3">Part {part}</p>
            <p className="text-sm text-gray-600 mt-4">
              {part === '1'
                ? 'Introduction & Personal Questions (4-5 min)'
                : part === '2'
                ? 'Cue Card Task (1-2 min)'
                : 'Discussion & Abstract Questions (4-5 min)'}
            </p>
          </div>
        </div>
      </div>

      {/* Four Criteria Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        {scores.map((item) => (
          <div key={item.label} className={`${getScoreBgColor(item.score)} rounded-xl p-5`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900">{item.label}</h3>
              <span className={`text-3xl font-bold ${getScoreColor(item.score)}`}>
                {item.score}
              </span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{item.feedback}</p>
          </div>
        ))}
      </div>

      {/* Strengths */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="text-emerald-600" size={22} />
          <h3 className="text-lg font-bold text-slate-900">Your Strengths</h3>
        </div>
        <ul className="space-y-3">
          {analysis.strengths.map((strength, index) => (
            <li key={index} className="flex gap-3 text-slate-700 text-sm">
              <span className="text-emerald-600 font-bold mt-0.5">✓</span>
              <span className="leading-relaxed">{strength}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Areas for Improvement */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="text-amber-600" size={22} />
          <h3 className="text-lg font-bold text-slate-900">Areas to Improve</h3>
        </div>
        <ul className="space-y-3">
          {analysis.improvements.map((improvement, index) => (
            <li key={index} className="flex gap-3 text-slate-700 text-sm">
              <span className="text-amber-600 font-bold mt-0.5">→</span>
              <span className="leading-relaxed">{improvement}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Band Description and Next Steps */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">What's Next?</h3>
        <div className="space-y-4 text-sm text-slate-700">
          <p>
            <strong className="text-teal-700">Current Level:</strong> {getBandDescription(analysis.overallScore)}
          </p>
          <p>
            <strong className="text-teal-700">Recommendation:</strong>{' '}
            {analysis.overallScore < 6
              ? 'Focus on building confidence with more practice. Use the areas for improvement above to target specific skills.'
              : analysis.overallScore < 7
              ? 'You\'re on the right track! Consistent practice on the improvement areas will help you reach Band 7.'
              : analysis.overallScore < 8
              ? 'Excellent progress! Fine-tune your language for near-native proficiency with focus on vocabulary and subtle pronunciation nuances.'
              : 'Outstanding! You\'re at an expert level. Maintain your current skills and explore advanced nuances.'}
          </p>
        </div>
      </div>

      {/* Transcript Review */}
      <div className="pt-4">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Transcript Review</h3>
        <div className="bg-slate-50 border border-gray-200 rounded-xl p-5 max-h-64 overflow-y-auto">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{transcript}</p>
        </div>
      </div>

      {/* Practice Again Button */}
      <div className="flex gap-4 pt-4">
        <button className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg transition-all shadow-md hover:shadow-lg">
          Practice Another Question
        </button>
        <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition-all shadow-sm">
          View Progress
        </button>
      </div>
    </div>
  );
};

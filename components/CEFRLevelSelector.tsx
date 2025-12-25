'use client';

import { CEFRLevel, CEFR_LEVELS } from '@/lib/conversation-topics';
import { Award } from 'lucide-react';

interface CEFRLevelSelectorProps {
  selectedLevel: CEFRLevel;
  onChange: (level: CEFRLevel) => void;
  defaultLevel?: CEFRLevel; // User's assessed/preferred level
  onAssessClick?: () => void; // Optional callback for "Find your level" link
}

export default function CEFRLevelSelector({
  selectedLevel,
  onChange,
  defaultLevel,
  onAssessClick,
}: CEFRLevelSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-dark">
          Your English Level
        </label>
        {defaultLevel && (
          <div className="flex items-center gap-1 text-xs text-blue-600">
            <Award className="w-3 h-3" />
            <span>Assessed: {defaultLevel}</span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-6 gap-2">
        {CEFR_LEVELS.map(({ level, name, description }) => {
          const isDefault = defaultLevel === level;
          return (
            <button
              key={level}
              onClick={() => onChange(level)}
              className={`
                relative px-4 py-3 rounded-lg border-2 transition-all duration-200
                ${
                  selectedLevel === level
                    ? 'border-ocean-600 bg-ocean-50 shadow-md scale-105'
                    : isDefault
                    ? 'border-blue-200 bg-blue-50 hover:border-ocean-300 hover:shadow-sm'
                    : 'border-gray-200 bg-white hover:border-ocean-300 hover:shadow-sm'
                }
              `}
              title={`${name}: ${description}`}
            >
              <div className="flex flex-col items-center gap-1">
                <span
                  className={`
                    text-lg font-bold
                    ${selectedLevel === level ? 'text-ocean-700' : isDefault ? 'text-blue-600' : 'text-slate-medium'}
                  `}
                >
                  {level}
                </span>
                <span
                  className={`
                    text-xs font-medium
                    ${selectedLevel === level ? 'text-ocean-600' : isDefault ? 'text-blue-500' : 'text-gray-500'}
                  `}
                >
                  {name}
                </span>
              </div>

              {/* Badge for assessed level */}
              {isDefault && selectedLevel !== level && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <Award className="w-3 h-3 text-white" />
                </div>
              )}

              {/* Checkmark indicator for selected level */}
              {selectedLevel === level && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-ocean-600 rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Description of selected level */}
      <div className="text-sm text-slate-medium bg-gray-50 rounded-lg p-3 border border-gray-200">
        <span className="font-semibold text-slate-dark">{selectedLevel}:</span>{' '}
        {CEFR_LEVELS.find(l => l.level === selectedLevel)?.description}
      </div>

      {/* Optional "Find your level" link */}
      {onAssessClick && !defaultLevel && (
        <button
          onClick={onAssessClick}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium underline"
        >
          Not sure of your level? Take a quick assessment →
        </button>
      )}
    </div>
  );
}

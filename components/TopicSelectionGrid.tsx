'use client';

import { TopicId, CONVERSATION_TOPICS, CEFRLevel } from '@/lib/conversation-topics';

interface TopicSelectionGridProps {
  selectedLevel: CEFRLevel;
  onTopicSelect: (topicId: TopicId) => void;
}

export default function TopicSelectionGrid({
  selectedLevel,
  onTopicSelect,
}: TopicSelectionGridProps) {
  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-dark">
          Choose a Conversation Topic
        </h2>
        <p className="text-slate-medium">
          Select a topic to practice natural conversation at your {selectedLevel} level
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {CONVERSATION_TOPICS.map((topic) => (
          <button
            key={topic.id}
            onClick={() => onTopicSelect(topic.id)}
            className="group relative bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-ocean-400 hover:shadow-lg transition-all duration-200 text-left"
          >
            {/* Gradient background on hover */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${topic.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-200`}
            />

            <div className="relative space-y-3">
              {/* Icon */}
              <div className="text-4xl">{topic.icon}</div>

              {/* Topic name */}
              <h3 className="text-lg font-bold text-slate-dark group-hover:text-ocean-700 transition-colors">
                {topic.name}
              </h3>

              {/* Description */}
              <p className="text-sm text-slate-medium leading-relaxed">
                {topic.description}
              </p>

              {/* Example scenarios (show on hover) */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 space-y-1">
                <p className="text-xs font-semibold text-ocean-600 uppercase tracking-wide">
                  Examples:
                </p>
                <ul className="text-xs text-slate-medium space-y-0.5">
                  {topic.exampleScenarios.slice(0, 2).map((scenario, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="text-ocean-500 mt-0.5">•</span>
                      <span>{scenario}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Arrow indicator */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <svg
                  className="w-5 h-5 text-ocean-600"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

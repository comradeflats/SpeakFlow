import React from 'react';
import { UserStats } from '@/lib/firestore-db';
import StatCard from './ui/StatCard';

interface StatsGridProps {
  stats: UserStats | null;
  streak: number;
  bestScore: number;
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats, streak, bestScore }) => {
  // Convert numeric score to CEFR level
  const getCEFRLevel = (score: number): string => {
    if (score >= 5.5) return 'C2';
    if (score >= 5) return 'C1';
    if (score >= 4) return 'B2';
    if (score >= 3) return 'B1';
    if (score >= 2) return 'A2';
    if (score >= 1) return 'A1';
    return '-';
  };

  const avgScore = stats?.avg_overall_score || 0;
  const currentLevel = getCEFRLevel(avgScore);
  const bestLevel = getCEFRLevel(bestScore);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Current Level - Large gradient card */}
      <div className="bg-gradient-to-br from-ocean-600 to-ocean-700 rounded-xl p-6 text-white shadow-lg">
        <p className="text-xs font-semibold opacity-90 uppercase tracking-wide">
          Current CEFR Level
        </p>
        <p className="text-5xl font-bold mt-3">
          {currentLevel}
        </p>
        <p className="text-sm mt-3 opacity-80">
          Score: {avgScore.toFixed(1)} / 6.0
        </p>
      </div>

      {/* Total Sessions */}
      <StatCard
        label="Total Sessions"
        value={stats?.total_sessions || 0}
        variant="info"
        subtext="Practice attempts"
      />

      {/* Current Streak */}
      <StatCard
        label="Current Streak"
        value={`${streak} ${streak === 1 ? 'day' : 'days'}`}
        variant="success"
        subtext={streak > 0 ? 'Keep it up!' : 'Start practicing'}
      />

      {/* Best Level */}
      <StatCard
        label="Best Level"
        value={bestLevel}
        variant="warning"
        subtext="Personal best"
      />
    </div>
  );
};

export default StatsGrid;

'use client';

import { useState } from 'react';
import { PracticeSession, UserStats } from '@/lib/firestore-db';
import { ProgressChart } from './ProgressChart';
import StatsGrid from './StatsGrid';
import RecentSessionsList from './RecentSessionsList';
import DashboardEmptyState from './DashboardEmptyState';
import SessionDetailModal from './SessionDetailModal';
import { ArrowLeft, Target } from 'lucide-react';
import Link from 'next/link';
import Button from './ui/Button';

interface DashboardClientProps {
  sessions: PracticeSession[];
  stats: UserStats | null;
}

// Transform sessions for ProgressChart component
function transformSessionsForChart(sessions: PracticeSession[]) {
  if (sessions.length === 0) return [];

  // Import the cefrToNumeric function for converting CEFR levels to numbers
  const cefrToNumeric = (level: string): number => {
    const mapping: Record<string, number> = {
      'A1': 1, 'A1+': 1.5, 'A2': 2, 'A2+': 2.5,
      'B1': 3, 'B1+': 3.5, 'B2': 4, 'B2+': 4.5,
      'C1': 5, 'C1+': 5.5, 'C2': 6
    };
    return mapping[level] || 0;
  };

  // Group sessions by date
  const byDate = sessions.reduce((acc, session) => {
    const date = new Date(session.created_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });

    if (!acc[date]) {
      acc[date] = {
        date,
        scores: [] as number[]
      };
    }

    // Add overall level score (convert CEFR to numeric)
    if (session.overall_level) {
      const numericScore = cefrToNumeric(session.overall_level);
      acc[date].scores.push(numericScore);
    } else if (session.overall_score) {
      // Fallback to legacy numeric score if available
      acc[date].scores.push(session.overall_score);
    }

    return acc;
  }, {} as Record<string, any>);

  // Convert to array and calculate average for each date
  return Object.values(byDate)
    .map(day => ({
      date: day.date,
      average: day.scores.length > 0
        ? day.scores.reduce((a: number, b: number) => a + b, 0) / day.scores.length
        : 0
    }))
    .reverse(); // Show oldest to newest for chart
}

// Calculate consecutive day streak
function calculateStreak(sessions: PracticeSession[]): number {
  if (sessions.length === 0) return 0;

  // Get unique dates sorted newest first
  const dates = [...new Set(
    sessions.map(s => new Date(s.created_at).toDateString())
  )].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  let streak = 1;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  // Check if most recent session was today or yesterday
  if (dates[0] !== today && dates[0] !== yesterday) return 0;

  // Count consecutive days
  for (let i = 1; i < dates.length; i++) {
    const diff = (new Date(dates[i-1]).getTime() - new Date(dates[i]).getTime()) / 86400000;
    if (Math.abs(diff - 1) < 0.5) { // Allow for slight time variations
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export default function DashboardClient({ sessions, stats }: DashboardClientProps) {
  // State for session detail modal
  const [selectedSession, setSelectedSession] = useState<PracticeSession | null>(null);

  // If no sessions, show empty state
  if (sessions.length === 0) {
    return <DashboardEmptyState />;
  }

  // Transform data for components
  const chartData = transformSessionsForChart(sessions);
  const streak = calculateStreak(sessions);
  const bestScore = Math.max(
    ...sessions.map(session => {
      // If session has CEFR level, convert to numeric
      if (session.overall_level) {
        return cefrToNumeric(session.overall_level);
      }
      // Fallback to legacy numeric score
      return session.overall_score || 0;
    })
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-slate-medium hover:text-slate-dark transition-smooth mb-4"
            >
              <ArrowLeft size={16} />
              Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-slate-dark">Your Progress</h1>
            <p className="text-slate-medium mt-2">
              Track your English speaking improvement over time
            </p>
          </div>

          {/* Reassess Level Button */}
          <Button
            onClick={() => {
              window.location.href = '/practice?assess=true';
            }}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <Target className="w-4 h-4" />
            Reassess My Level
          </Button>
        </div>

        {/* Stats Grid */}
        <StatsGrid stats={stats} streak={streak} bestScore={bestScore} showElevenLabsCredits={true} />

        {/* Progress Chart */}
        <ProgressChart data={chartData} />

        {/* Recent Sessions */}
        <RecentSessionsList
          sessions={sessions.slice(0, 10)}
          onSessionClick={setSelectedSession}
        />
      </div>

      {/* Session Detail Modal */}
      <SessionDetailModal
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
      />
    </div>
  );
}

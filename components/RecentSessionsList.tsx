import React from 'react';
import { PracticeSession } from '@/lib/firestore-db';
import { cefrToNumeric } from '@/lib/cefr-scoring';
import Badge from './ui/Badge';
import Card from './ui/Card';

interface RecentSessionsListProps {
  sessions: PracticeSession[];
}

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString));
};

const getLevelVariant = (level: string): 'success' | 'info' | 'warning' | 'error' => {
  const numeric = cefrToNumeric(level as any);
  if (numeric >= 5) return 'success'; // C1-C2
  if (numeric >= 4) return 'info';    // B2+
  if (numeric >= 3) return 'warning'; // B1-B2
  return 'error';                     // A1-A2
};

const RecentSessionsList: React.FC<RecentSessionsListProps> = ({ sessions }) => {
  if (sessions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl p-8 shadow-lg">
      <h2 className="text-2xl font-bold text-slate-dark mb-6">Recent Sessions</h2>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-xs font-semibold text-slate-medium uppercase tracking-wide">
                Date
              </th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-medium uppercase tracking-wide">
                Overall
              </th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-medium uppercase tracking-wide">
                Range
              </th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-medium uppercase tracking-wide">
                Accuracy
              </th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-medium uppercase tracking-wide">
                Fluency
              </th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-medium uppercase tracking-wide">
                Interaction
              </th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-slate-medium uppercase tracking-wide">
                Coherence
              </th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr key={session.id} className="border-b border-gray-100 hover:bg-gray-50 transition-smooth">
                <td className="py-4 px-4 text-sm text-slate-dark">
                  {formatDate(session.created_at)}
                </td>
                <td className="py-4 px-4 text-center">
                  {session.overall_level && (
                    <Badge variant={getLevelVariant(session.overall_level)}>
                      {session.overall_level}
                    </Badge>
                  )}
                </td>
                <td className="py-4 px-4 text-center text-sm text-slate-medium">
                  {session.range_level || '-'}
                </td>
                <td className="py-4 px-4 text-center text-sm text-slate-medium">
                  {session.accuracy_level || '-'}
                </td>
                <td className="py-4 px-4 text-center text-sm text-slate-medium">
                  {session.fluency_level || '-'}
                </td>
                <td className="py-4 px-4 text-center text-sm text-slate-medium">
                  {session.interaction_level || '-'}
                </td>
                <td className="py-4 px-4 text-center text-sm text-slate-medium">
                  {session.coherence_level || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {sessions.map((session) => (
          <Card key={session.id} className="hover:shadow-md transition-smooth">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-slate-medium">
                  {formatDate(session.created_at)}
                </p>
              </div>
              {session.overall_level && (
                <Badge variant={getLevelVariant(session.overall_level)} className="text-lg px-3 py-1">
                  {session.overall_level}
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-5 gap-2 pt-3 border-t border-gray-100">
              <div className="text-center">
                <p className="text-xs text-slate-medium mb-1">Range</p>
                <p className="text-sm font-semibold text-slate-dark">
                  {session.range_level || '-'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-medium mb-1">Accuracy</p>
                <p className="text-sm font-semibold text-slate-dark">
                  {session.accuracy_level || '-'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-medium mb-1">Fluency</p>
                <p className="text-sm font-semibold text-slate-dark">
                  {session.fluency_level || '-'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-medium mb-1">Interact</p>
                <p className="text-sm font-semibold text-slate-dark">
                  {session.interaction_level || '-'}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-medium mb-1">Coherence</p>
                <p className="text-sm font-semibold text-slate-dark">
                  {session.coherence_level || '-'}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RecentSessionsList;

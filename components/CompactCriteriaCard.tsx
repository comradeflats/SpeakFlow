import React from 'react';
import Badge from './ui/Badge';

type BadgeVariant = 'success' | 'info' | 'warning' | 'error';

interface CompactCriteriaCardProps {
  label: string;
  score: number | string;
  variant: BadgeVariant;
  summary: string | string[];
}

const CompactCriteriaCard: React.FC<CompactCriteriaCardProps> = ({
  label,
  score,
  variant,
  summary,
}) => {
  // Handle both string and array formats (backward compatibility)
  const summaryArray = Array.isArray(summary) ? summary : [summary];
  const firstPoint = summaryArray[0] || 'No feedback available';
  const additionalPoints = summaryArray.length - 1;

  // Truncate first point to ~40 characters
  const truncatedSummary = firstPoint.length > 40
    ? firstPoint.substring(0, 40) + '...'
    : firstPoint;

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-smooth">
      <div className="flex-shrink-0">
        <Badge variant={variant}>{score}</Badge>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-dark">{label}</p>
        <p className="text-xs text-slate-medium truncate mt-0.5">{truncatedSummary}</p>
        {additionalPoints > 0 && (
          <p className="text-xs text-ocean-600 mt-1">
            +{additionalPoints} more point{additionalPoints > 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
};

export default CompactCriteriaCard;

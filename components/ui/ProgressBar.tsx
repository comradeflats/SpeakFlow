import React from 'react';

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  color?: 'ocean' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
}

const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ value, max = 100, color = 'ocean', showLabel = false, className = '', ...props }, ref) => {
    const percentage = Math.min((value / max) * 100, 100);

    const colorClasses = {
      ocean: 'bg-ocean-600',
      success: 'bg-success',
      warning: 'bg-warning',
      error: 'bg-error',
    };

    return (
      <div ref={ref} className={`w-full ${className}`} {...props}>
        <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${colorClasses[color]}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <p className="mt-2 text-sm text-slate-medium">
            {value} / {max}
          </p>
        )}
      </div>
    );
  }
);

ProgressBar.displayName = 'ProgressBar';

export default ProgressBar;

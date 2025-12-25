import React from 'react';
import Avatar from './Avatar';
import { CEFRLevel } from '@/lib/cefr-scoring';

interface ScoreDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  level: CEFRLevel | string;
  label?: string;
  variant?: 'circle' | 'badge';
}

const ScoreDisplay = React.forwardRef<HTMLDivElement, ScoreDisplayProps>(
  ({ level, label = 'CEFR Level', variant = 'circle', className = '', ...props }, ref) => {
    // Determine color based on CEFR level
    const getCefrColor = (cefrLevel: string): 'ocean' | 'success' | 'warning' | 'error' | 'info' => {
      const levelStr = cefrLevel.toUpperCase();
      if (levelStr.startsWith('C2')) return 'success';
      if (levelStr.startsWith('C1')) return 'ocean';
      if (levelStr.startsWith('B2')) return 'info';
      if (levelStr.startsWith('B1')) return 'warning';
      return 'error'; // A1, A2
    };

    const bgColor = getCefrColor(level);

    if (variant === 'circle') {
      return (
        <div ref={ref} className={`text-center ${className}`} {...props}>
          <Avatar size="lg" bgColor={bgColor}>
            {level}
          </Avatar>
          {label && (
            <p className="mt-2 text-sm text-slate-medium">{label}</p>
          )}
        </div>
      );
    }

    return (
      <div ref={ref} className={`flex items-center gap-2 ${className}`} {...props}>
        <Avatar size="md" bgColor={bgColor}>
          {level}
        </Avatar>
        {label && (
          <div>
            <p className="text-sm font-medium text-slate-dark">{label}</p>
            <p className="text-xs text-slate-medium">CEFR Scale</p>
          </div>
        )}
      </div>
    );
  }
);

ScoreDisplay.displayName = 'ScoreDisplay';

export default ScoreDisplay;

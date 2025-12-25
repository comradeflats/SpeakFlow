import React from 'react';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  color?: 'ocean' | 'slate' | 'success' | 'warning' | 'error';
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 'md', color = 'ocean', className = '', ...props }, ref) => {
    const sizeClasses = {
      sm: 'w-4 h-4 border-2',
      md: 'w-8 h-8 border-3',
      lg: 'w-12 h-12 border-4',
    };

    const colorClasses = {
      ocean: 'border-ocean-200 border-t-ocean-600',
      slate: 'border-slate-light border-t-slate-dark',
      success: 'border-success_light border-t-success',
      warning: 'border-warning_light border-t-warning',
      error: 'border-error_light border-t-error',
    };

    const finalClassName = `${sizeClasses[size]} ${colorClasses[color]} rounded-full animate-spin ${className}`.trim();

    return (
      <div ref={ref} className={finalClassName} {...props} />
    );
  }
);

Spinner.displayName = 'Spinner';

export default Spinner;

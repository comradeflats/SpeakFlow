import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info';
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ variant = 'info', className = '', ...props }, ref) => {
    const baseClasses = 'inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium';

    const variantClasses = {
      success: 'bg-success_light text-success',
      warning: 'bg-warning_light text-warning',
      error: 'bg-error_light text-error',
      info: 'bg-info_light text-info',
    };

    const finalClassName = `${baseClasses} ${variantClasses[variant]} ${className}`.trim();

    return (
      <span ref={ref} className={finalClassName} {...props} />
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;

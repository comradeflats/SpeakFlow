import React from 'react';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'info' | 'success' | 'warning' | 'error';
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ variant = 'info', className = '', ...props }, ref) => {
    const baseClasses = 'rounded-lg p-4 border-l-4 flex gap-3';

    const variantClasses = {
      info: 'bg-info_light border-l-info text-info',
      success: 'bg-success_light border-l-success text-success',
      warning: 'bg-warning_light border-l-warning text-warning',
      error: 'bg-error_light border-l-error text-error',
    };

    const finalClassName = `${baseClasses} ${variantClasses[variant]} ${className}`.trim();

    return (
      <div ref={ref} className={finalClassName} {...props} />
    );
  }
);

Alert.displayName = 'Alert';

export default Alert;

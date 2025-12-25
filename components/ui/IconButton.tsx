import React from 'react';

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  'aria-label': string;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', disabled = false, 'aria-label': ariaLabel, ...props }, ref) => {
    const baseClasses = 'rounded-lg transition-smooth focus-ring disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center';

    const variantClasses = {
      primary: 'bg-ocean-600 text-white hover:bg-ocean-700 active:bg-ocean-800 shadow-md hover:shadow-lg',
      secondary: 'bg-slate-light text-slate-dark hover:bg-gray-300 active:bg-gray-400 shadow-sm hover:shadow-md',
      ghost: 'text-slate-dark hover:bg-gray-50 active:bg-gray-100',
    };

    const sizeClasses = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
    };

    const finalClassName = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim();

    return (
      <button
        ref={ref}
        className={finalClassName}
        disabled={disabled}
        aria-label={ariaLabel}
        {...props}
      />
    );
  }
);

IconButton.displayName = 'IconButton';

export default IconButton;

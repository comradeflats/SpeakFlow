import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', disabled = false, children, ...props }, ref) => {
    const baseClasses = 'font-medium rounded-lg transition-smooth focus-ring disabled:opacity-50 disabled:cursor-not-allowed';

    const variantClasses = {
      primary: 'bg-ocean-600 text-white hover:bg-ocean-700 active:bg-ocean-800 shadow-md hover:shadow-lg',
      secondary: 'bg-slate-light text-slate-dark hover:bg-gray-300 active:bg-gray-400 shadow-sm hover:shadow-md',
      ghost: 'text-slate-dark hover:bg-gray-50 active:bg-gray-100',
      danger: 'bg-error text-white hover:bg-red-700 active:bg-red-800 shadow-md hover:shadow-lg',
    };

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    const finalClassName = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim();

    return (
      <button ref={ref} className={finalClassName} disabled={disabled} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', disabled = false, ...props }, ref) => {
    const baseClasses =
      'w-full rounded-lg border border-gray-200 px-4 py-2.5 text-base bg-white focus-ring transition-smooth';

    const stateClasses = error
      ? 'border-error text-error'
      : 'hover:border-gray-300 focus:border-ocean-600';

    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : '';

    const finalClassName = `${baseClasses} ${stateClasses} ${disabledClasses} ${className}`.trim();

    return (
      <div className="w-full">
        {label && (
          <label className="block mb-2 text-sm font-medium text-slate-dark">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={finalClassName}
          disabled={disabled}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-error">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-600">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

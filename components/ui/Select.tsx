import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: Array<{ value: string; label: string }>;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options = [], className = '', disabled = false, ...props }, ref) => {
    const baseClasses =
      'w-full rounded-lg border border-gray-200 px-4 py-2.5 text-base bg-white focus-ring transition-smooth appearance-none cursor-pointer';

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
        <div className="relative">
          <select
            ref={ref}
            className={finalClassName}
            disabled={disabled}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-dark">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </div>
        </div>
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

Select.displayName = 'Select';

export default Select;

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'flat';
  hoverable?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', hoverable = false, className = '', ...props }, ref) => {
    const baseClasses = 'rounded-lg bg-white border border-gray-200 p-6';

    const variantClasses = {
      default: 'shadow-sm',
      elevated: 'shadow-lg',
      flat: 'shadow-none',
    };

    const hoverClass = hoverable
      ? 'transition-smooth hover:shadow-md hover:border-gray-300 cursor-pointer'
      : '';

    const finalClassName = `${baseClasses} ${variantClasses[variant]} ${hoverClass} ${className}`.trim();

    return (
      <div ref={ref} className={finalClassName} {...props} />
    );
  }
);

Card.displayName = 'Card';

export default Card;

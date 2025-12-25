import React from 'react';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  bgColor?: 'ocean' | 'success' | 'warning' | 'error' | 'info';
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ size = 'md', bgColor = 'ocean', className = '', children, ...props }, ref) => {
    const sizeClasses = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-12 h-12 text-sm',
      lg: 'w-16 h-16 text-base',
      xl: 'w-20 h-20 text-lg',
    };

    const bgClasses = {
      ocean: 'bg-ocean-50 text-ocean-600',
      success: 'bg-success_light text-success',
      warning: 'bg-warning_light text-warning',
      error: 'bg-error_light text-error',
      info: 'bg-info_light text-info',
    };

    const finalClassName = `${sizeClasses[size]} ${bgClasses[bgColor]} rounded-full flex items-center justify-center font-semibold ${className}`.trim();

    return (
      <div ref={ref} className={finalClassName} {...props}>
        {children}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export default Avatar;

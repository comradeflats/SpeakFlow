import React from 'react';
import Card from './Card';

type StatVariant = 'info' | 'success' | 'warning' | 'error';

interface StatCardProps {
  label: string;
  value: string | number;
  variant: StatVariant;
  subtext?: string;
}

const variantStyles = {
  info: 'bg-info_light border-info text-info',
  success: 'bg-success_light border-success text-success',
  warning: 'bg-warning_light border-warning text-warning',
  error: 'bg-red-50 border-error text-error',
};

const StatCard: React.FC<StatCardProps> = ({ label, value, variant, subtext }) => {
  return (
    <Card className={`text-center border-l-4 ${variantStyles[variant]}`}>
      <p className="text-xs uppercase tracking-wide font-semibold opacity-80 mb-2">
        {label}
      </p>
      <p className="text-4xl font-bold mb-1">{value}</p>
      {subtext && (
        <p className="text-xs opacity-70 mt-1">{subtext}</p>
      )}
    </Card>
  );
};

export default StatCard;

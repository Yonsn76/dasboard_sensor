import React from 'react';
import Card from './Card';
import clsx from 'clsx';

interface KpiCardProps {
  title: string;
  value: string;
  children?: React.ReactNode;
  color?: 'primary-blue' | 'primary-red' | 'primary-orange' | 'primary-green' | 'primary-yellow';
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, children, color }) => {
  const colorClassMap = {
    'primary-blue': 'text-primary-blue',
    'primary-red': 'text-primary-red',
    'primary-orange': 'text-primary-orange',
    'primary-green': 'text-primary-green',
    'primary-yellow': 'text-primary-yellow',
  };

  const textColorClass = color ? colorClassMap[color] : 'text-gray-800';

  return (
    <Card className="relative overflow-hidden">
      <div className="flex flex-col">
        <p className="text-sm text-gray-500 mb-1 truncate">{title}</p>
        <p className={clsx('text-2xl font-bold', textColorClass)}>{value}</p>
        {children && <div className="mt-1">{children}</div>}
      </div>
    </Card>
  );
};

export default KpiCard;
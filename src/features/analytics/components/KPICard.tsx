import React from 'react';
import { Card } from '@/components/ui/card';

interface KPICardProps {
  value: string | number;
  label: string;
  status?: 'good' | 'warning' | 'critical';
}

export const KPICard: React.FC<KPICardProps> = ({ value, label, status = 'good' }) => {
  const bg = status === 'good' ? 'bg-green-100 dark:bg-green-900' :
    status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900' :
    'bg-red-100 dark:bg-red-900';
  const text = status === 'good' ? 'text-green-800 dark:text-green-200' :
    status === 'warning' ? 'text-yellow-800 dark:text-yellow-200' :
    'text-red-800 dark:text-red-200';
  return (
    <Card className={`p-4 ${bg} ${text} rounded-lg shadow`}>
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-sm uppercase">{label}</div>
    </Card>
  );
};

import React from 'react';
import { Card } from '@/components/ui/card';

interface MetricCardProps {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({ value, label, icon }) => (
  <Card className="flex items-center p-4 shadow-md rounded-md bg-white dark:bg-gray-800" title={label}>
    {icon && <span className="mr-2 text-xl">{icon}</span>}
    <div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  </Card>
);

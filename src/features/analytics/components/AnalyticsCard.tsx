import React from 'react';
import { Card } from '@/components/ui/card';

interface AnalyticsCardProps {
  title: string;
  children: React.ReactNode;
}

export const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ title, children }) => (
  <Card className="p-4 shadow-lg rounded-lg bg-white dark:bg-gray-800">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    {children}
  </Card>
);

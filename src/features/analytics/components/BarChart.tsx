import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface BarChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  fill?: string;
}

export const BarChart: React.FC<BarChartProps> = ({ data, xKey, yKey, fill = '#10b981' }) => (
  <ResponsiveContainer width="100%" height={300}>
    <RechartsBarChart data={data}>
      <XAxis dataKey={xKey} />
      <YAxis />
      <Tooltip />
      <Bar dataKey={yKey} fill={fill} />
    </RechartsBarChart>
  </ResponsiveContainer>
);

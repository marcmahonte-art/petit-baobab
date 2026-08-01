import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface LineChartProps {
  data: any[];
  xKey: string;
  yKey: string;
  color?: string;
}

export const LineChart: React.FC<LineChartProps> = ({ data, xKey, yKey, color = '#3b82f6' }) => (
  <ResponsiveContainer width="100%" height={300}>
    <RechartsLineChart data={data}>
      <XAxis dataKey={xKey} />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} dot={false} />
    </RechartsLineChart>
  </ResponsiveContainer>
);

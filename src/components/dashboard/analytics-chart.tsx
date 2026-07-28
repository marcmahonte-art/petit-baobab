"use client";
import { AreaChart, Area, ResponsiveContainer } from "recharts";

export function AnalyticsChart({ data }: { data: { m: string; v: number }[] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="gAnalytics" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7D6AF8" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#7D6AF8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke="#7D6AF8" fill="url(#gAnalytics)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

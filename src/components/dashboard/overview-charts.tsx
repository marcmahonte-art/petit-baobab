"use client";

import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface ChartPoint { m: string; [k: string]: any }

export function InscChart({ data }: { data: ChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7D6AF8" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#7D6AF8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1ECE5" />
        <XAxis dataKey="m" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Area type="monotone" dataKey="v" stroke="#7D6AF8" fill="url(#g1)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function RevChart({ data }: { data: ChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1ECE5" />
        <XAxis dataKey="m" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Bar dataKey="v" fill="#7D6AF8" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StarsChart({ data }: { data: ChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1ECE5" />
        <XAxis dataKey="m" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Line type="monotone" dataKey="dist" stroke="#FFB300" strokeWidth={2} name="Distribuées" />
        <Line type="monotone" dataKey="cons" stroke="#7D6AF8" strokeWidth={2} name="Consommées" />
      </LineChart>
    </ResponsiveContainer>
  );
}

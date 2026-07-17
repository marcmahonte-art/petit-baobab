import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

type DashboardCardProps = {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
};

export default function DashboardCard({ title, value, icon }: DashboardCardProps) {
  return (
    <motion.div
      className="bg-white/30 backdrop-blur-md rounded-xl p-4 shadow-sm border border-white/20 hover:shadow-md transition"
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center gap-3">
        {icon && <span className="text-2xl">{icon}</span>}
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-700">{title}</h3>
          <p className="text-2xl font-bold text-primary">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}

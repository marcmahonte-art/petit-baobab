"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import type { ProgressItem } from "@/lib/rewards/mock-rewards";

const TONES = ["bg-[#7D6AF8]", "bg-emerald-400", "bg-[#FFB300]", "bg-blue-400", "bg-pink-400", "bg-orange-400"];

export function ProgressCard({ items }: { items: ProgressItem[] }) {
  return (
    <Card className="rounded-[22px] md:rounded-[28px] bg-white border border-[#EFE7DB]/60 shadow-[0_4px_12px_rgba(0,0,0,.06)] p-5 md:p-6">
      <h2 className="text-lg md:text-xl font-extrabold text-[#3B2416] mb-4">Ma progression</h2>
      <div className="flex flex-col gap-4">
        {items.map((it, i) => {
          const pct = Math.min(100, Math.round((it.value / it.goal) * 100));
          return (
            <div key={it.id}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-bold text-[#3B2416]">{it.label}</span>
                <span className="text-xs font-semibold text-[#7A6A5E]">
                  {it.value} / {it.goal}
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-[#F0E7DA] overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${TONES[i % TONES.length]}`}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${pct}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.9, ease: "easeOut", delay: i * 0.05 }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

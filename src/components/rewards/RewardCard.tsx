"use client";

import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import type { UpcomingReward } from "@/lib/rewards/mock-rewards";

export function RewardCard({ reward, delay }: { reward: UpcomingReward; delay: number }) {
  const pct = Math.min(100, Math.round((reward.currentXp / reward.xpRequired) * 100));
  const unlocked = reward.currentXp >= reward.xpRequired;

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay }}
      className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#EFE7DB]/60 shadow-sm"
    >
      <div className="w-12 h-12 shrink-0 rounded-xl bg-[#FFF3D6] flex items-center justify-center text-2xl relative">
        <span aria-hidden>{reward.icon}</span>
        {!unlocked && (
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#7A6A5E] flex items-center justify-center">
            <Lock className="w-3 h-3 text-white" />
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[#3B2416] truncate">{reward.name}</p>
        <div className="mt-1 h-2 rounded-full bg-[#F0E7DA] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-[#FFB300]"
            initial={{ width: 0 }}
            whileInView={{ width: `${pct}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <p className="mt-0.5 text-[10px] font-semibold text-[#7A6A5E]">
          {unlocked ? "Débloqué !" : `${reward.xpRequired} XP requis`}
        </p>
      </div>
    </motion.div>
  );
}

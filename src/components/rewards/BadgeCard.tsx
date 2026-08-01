"use client";

import { motion } from "framer-motion";
import type { Badge } from "@/lib/rewards/mock-rewards";
import { toneClass } from "./tones";

export function BadgeCard({ badge }: { badge: Badge }) {
  return (
    <motion.div
      whileHover={badge.earned ? { scale: 1.06 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`flex flex-col items-center gap-2 text-center ${badge.earned ? "cursor-pointer" : "opacity-35 saturate-0"}`}
      aria-label={`${badge.name} ${badge.earned ? "(obtenu)" : "(à débloquer)"}`}
    >
      <div
        className={`w-20 h-20 rounded-full flex items-center justify-center border-2 shadow-sm text-3xl ${toneClass(badge.tone)}`}
      >
        <span aria-hidden>{badge.icon}</span>
      </div>
      <span className="text-[11px] font-bold text-[#7A6A5E] leading-tight max-w-[88px]">
        {badge.name}
      </span>
    </motion.div>
  );
}

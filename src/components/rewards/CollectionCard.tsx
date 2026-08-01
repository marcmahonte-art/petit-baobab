"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import type { CollectionItem } from "@/lib/rewards/mock-rewards";

export function CollectionCard({ items }: { items: CollectionItem[] }) {
  return (
    <Card className="rounded-[22px] md:rounded-[28px] bg-white border border-[#EFE7DB]/60 shadow-[0_4px_12px_rgba(0,0,0,.06)] p-5 md:p-6">
      <h2 className="text-lg md:text-xl font-extrabold text-[#3B2416] mb-4">Ma collection</h2>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {items.map((it, i) => (
          <motion.div
            key={it.id}
            whileHover={it.unlocked ? { scale: 1.08, y: -2 } : {}}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl text-center ${
              it.unlocked
                ? "bg-[#FFF9F2] border border-[#F0E7DA] cursor-pointer"
                : "bg-[#F7F4EF] border border-transparent opacity-40 saturate-0"
            }`}
            aria-label={`${it.name} ${it.unlocked ? "(débloqué)" : "(verrouillé)"}`}
          >
            <span className="text-2xl" aria-hidden>
              {it.icon}
            </span>
            <span className="text-[10px] font-bold text-[#7A6A5E] leading-tight">{it.name}</span>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}

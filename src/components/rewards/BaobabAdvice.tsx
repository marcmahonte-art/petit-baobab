"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function BaobabAdvice({ advice }: { advice: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="flex items-center gap-4 rounded-[22px] md:rounded-[28px] bg-[#EAF7EF] border border-[#CDEBD6] p-5 md:p-6"
    >
      <div className="shrink-0 w-20 h-20 md:w-24 md:h-24 relative">
        <Image
          src="/illustrations/Baobab.webp"
          alt="Petit Baobab"
          fill
          sizes="(max-width: 768px) 80px, 96px"
          className="object-contain"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base md:text-lg font-extrabold text-[#1F7A4D] mb-1">Conseil du Baobab 🌳</h3>
        <p className="text-sm md:text-[15px] font-medium text-[#2C6B45] leading-relaxed">{advice}</p>
      </div>
      <Button className="shrink-0 h-11 px-5 rounded-full bg-[#1F7A4D] hover:bg-[#18633E] text-white font-bold">
        Commencer
      </Button>
    </motion.div>
  );
}

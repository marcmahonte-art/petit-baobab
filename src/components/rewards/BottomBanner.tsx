"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function BottomBanner() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-[28px] bg-[#1F7A4D] px-6 md:px-10 py-8 md:py-10 text-white shadow-[0_18px_50px_rgba(31,122,77,0.25)]"
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="shrink-0 w-20 h-20 md:w-24 md:h-24 relative">
            <Image
              src="/illustrations/coloring-baobab.png"
              alt="Coffre au trésor"
              fill
              sizes="(max-width: 768px) 80px, 96px"
              className="object-contain"
            />
          </div>
          <p className="text-lg md:text-2xl font-extrabold leading-tight max-w-xl">
            Plus tu joues, plus tu gagnes, plus ton univers grandit.
          </p>
        </div>
        <Button className="shrink-0 h-12 px-7 rounded-full bg-[#FFD95C] hover:bg-[#F7C93A] text-[#3B2416] font-extrabold">
          Découvrir les défis
        </Button>
      </div>
      {/* Halos décoratifs */}
      <div className="absolute right-10 top-6 w-28 h-28 rounded-full bg-[#FFD95C]/20 blur-2xl" aria-hidden />
      <div className="absolute left-1/3 bottom-2 w-24 h-24 rounded-full bg-[#7D6AF8]/20 blur-2xl" aria-hidden />
    </motion.section>
  );
}

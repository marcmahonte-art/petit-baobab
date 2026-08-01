"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useProfile } from "@/lib/hooks/useProfile";
import { getMascotImage } from "@/lib/mascots";

// Feuilles qui flottent très légèrement (animation douce, jamais agressive).
const LEAVES = [
  { emoji: "🍃", className: "left-[8%] top-[20%]", delay: 0 },
  { emoji: "🍂", className: "left-[78%] top-[30%]", delay: 1.2 },
  { emoji: "🌿", className: "left-[40%] top-[10%]", delay: 0.6 },
  { emoji: "🍃", className: "left-[62%] top-[60%]", delay: 1.8 },
];

export function Hero({ childName }: { childName: string }) {
  const profile = useProfile();
  const mascotSrc = profile?.mascot ? getMascotImage(profile.mascot) : null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#FFFDF5] via-[#FFF8E6] to-[#FFF3D6] border border-[#F0E7DA] shadow-[0_10px_30px_rgba(59,36,22,0.06)]"
      style={{ height: 220 }}
    >
      {/* Feuilles flottantes */}
      {LEAVES.map((l, i) => (
        <motion.span
          key={i}
          aria-hidden
          className={`pointer-events-none absolute text-2xl select-none ${l.className}`}
          animate={{ y: [0, -10, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: l.delay }}
        >
          {l.emoji}
        </motion.span>
      ))}

      <div className="relative z-10 flex h-full items-center gap-5 px-6 md:px-10">
        {/* Avatar enfant */}
        <div className="shrink-0">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white border-4 border-white shadow-md overflow-hidden flex items-center justify-center">
            {mascotSrc ? (
              <Image src={mascotSrc} alt={childName} width={80} height={80} className="w-full h-full object-contain" />
            ) : (
              <span className="text-2xl font-extrabold text-[#7D6AF8]">
                {childName.substring(0, 2).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Texte */}
        <div className="min-w-0 flex-1">
          <p className="text-lg md:text-xl font-extrabold text-[#3B2416]">
            Bonjour {childName} 👋
          </p>
          <h1 className="mt-1 text-2xl md:text-[34px] font-extrabold text-[#3B2416] leading-tight">
            Centre des récompenses ⭐
          </h1>
          <p className="mt-1 text-sm md:text-base font-medium text-[#7A6A5E]">
            Chaque activité te rapproche d&apos;une nouvelle aventure !
          </p>
        </div>

        {/* Illustration Petit Baobab */}
        <div className="hidden md:block shrink-0">
          <Image
            src="/illustrations/about-hero.webp"
            alt="Petit Baobab souriant"
            width={200}
            height={200}
            className="h-[180px] w-auto object-contain drop-shadow-sm"
          />
        </div>
      </div>
    </motion.section>
  );
}

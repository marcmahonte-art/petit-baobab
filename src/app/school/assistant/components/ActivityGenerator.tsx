"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import Image from "next/image";

interface ActivityGeneratorProps {
  onComplete: () => void;
}

const MESSAGES = [
  "Petit Baobab consulte les fiches MENA...",
  "Adaptation aux matériaux locaux...",
  "Finalisation de votre fiche pédagogique...",
];

export default function ActivityGenerator({ onComplete }: ActivityGeneratorProps) {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % MESSAGES.length);
    }, 900);

    const timer = setTimeout(() => {
      onComplete();
    }, 2800);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div className="bg-white border border-[#EDE3D5] rounded-3xl p-8 sm:p-12 text-center shadow-md space-y-6 animate-in fade-in duration-300">
      <div className="relative inline-flex items-center justify-center">
        <div className="w-24 h-24 rounded-full bg-[#F3ECFF] border-2 border-[#6535E8]/30 flex items-center justify-center animate-pulse">
          <Image
            src="/illustrations/robot.webp"
            alt="Petit Baobab AI"
            width={72}
            height={72}
            className="object-contain"
          />
        </div>
        <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-[#FF8A00] text-white flex items-center justify-center shadow-sm animate-bounce">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>

      <div className="space-y-2 max-w-md mx-auto">
        <h3 className="text-xl sm:text-2xl font-extrabold text-[#35180D] flex items-center justify-center gap-2">
          <span>Petit Baobab prépare votre activité...</span>
        </h3>
        <p className="text-sm font-semibold text-[#6535E8] animate-pulse">
          {MESSAGES[msgIdx]}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full max-w-sm mx-auto bg-[#F5F0EB] h-2.5 rounded-full overflow-hidden">
        <div className="bg-gradient-to-r from-[#6535E8] via-[#FF8A00] to-[#65A916] h-full animate-[progress_2.8s_ease-in-out_infinite] rounded-full" />
      </div>

      <p className="text-xs text-[#90847B] font-medium">
        Génération sécurisée et conforme aux 5 domaines d'éveil MENA
      </p>
    </div>
  );
}

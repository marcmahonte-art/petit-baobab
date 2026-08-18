"use client";

import React from "react";
import Image from "next/image";
import { Lightbulb } from "lucide-react";

export default function BaobabAdvice() {
  return (
    <div className="relative bg-[#F3ECFF] border border-[#E0D2FC] rounded-3xl p-5 shadow-xs overflow-hidden">
      <div className="flex items-start gap-4 z-10 relative">
        <div className="w-10 h-10 rounded-2xl bg-[#6535E8]/15 text-[#6535E8] flex items-center justify-center shrink-0">
          <Lightbulb className="w-5 h-5" />
        </div>

        <div className="space-y-1 pr-12">
          <h4 className="font-extrabold text-sm text-[#35180D] tracking-wide uppercase">
            Conseil de Petit Baobab
          </h4>
          <p className="text-xs sm:text-sm text-[#544375] font-medium leading-relaxed">
            Plus votre besoin est précis, plus le résultat sera adapté à votre classe et à vos objectifs.
          </p>
        </div>
      </div>

      {/* Robot Mascot Illustration */}
      <div className="absolute right-2 bottom-1 w-16 h-16 pointer-events-none opacity-90">
        <Image
          src="/illustrations/robot.webp"
          alt="Robot Petit Baobab"
          width={64}
          height={64}
          className="object-contain drop-shadow-xs"
        />
      </div>
    </div>
  );
}

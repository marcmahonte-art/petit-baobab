"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { History, Star } from "lucide-react";

interface AssistantHeaderProps {
  starBalance: number;
}

export default function AssistantHeader({ starBalance }: AssistantHeaderProps) {
  return (
    <div className="relative bg-gradient-to-r from-[#FFFDF8] via-[#FFF9EE] to-[#F5EFFF] border border-[#EDE3D5] rounded-3xl p-6 sm:p-8 overflow-hidden shadow-sm">
      {/* Decorative Mascot / African Nature Illustrations (Header Right) */}
      <div className="absolute right-0 -top-6 bottom-0 w-64 md:w-80 pointer-events-none z-[1] hidden md:flex items-end justify-end opacity-90">
        <div className="relative w-full h-full">
          <Image
            src="/illustrations/Baobab.webp"
            alt="Baobab"
            width={120}
            height={120}
            className="absolute right-2 top-2 w-28 h-28 object-contain opacity-80"
          />
          <Image
            src="/illustrations/lion.webp"
            alt="Lion"
            width={90}
            height={90}
            className="absolute right-24 bottom-2 w-20 h-20 object-contain drop-shadow-sm"
          />
          <Image
            src="/illustrations/mascots/zuri-girafe.png"
            alt="Girafe"
            width={90}
            height={110}
            className="absolute right-4 bottom-0 w-20 h-24 object-contain drop-shadow-sm"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-[2] flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-3xl">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#35180D] tracking-tight flex items-center gap-2">
              Assistant pédagogique
              <span className="inline-block text-[#FF8A00] animate-pulse">✦</span>
            </h1>

            {/* Star Balance Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100/80 border border-amber-300 rounded-full text-amber-900 font-bold text-xs sm:text-sm shadow-xs">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>Solde : <strong className="text-[#35180D]">{starBalance}</strong> ✦</span>
            </div>
          </div>

          <p className="text-sm sm:text-base text-[#6B625C] leading-relaxed max-w-xl">
            Créez des activités, fiches et contenus adaptés à vos enfants en quelques clics.
          </p>
        </div>

        {/* History Action Button */}
        <div className="shrink-0">
          <Link
            href="/school/assistant/history"
            className="inline-flex items-center justify-center gap-2.5 w-[155px] h-[48px] bg-white border border-[#F1DDBF] hover:border-[#FF8A00] text-[#35180D] font-bold text-sm rounded-[24px] shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
          >
            <History className="w-4 h-4 text-[#6535E8]" />
            <span>Historique</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

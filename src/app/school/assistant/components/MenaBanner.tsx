"use client";

import React from "react";
import { GraduationCap } from "lucide-react";

export default function MenaBanner() {
  return (
    <div className="flex items-center gap-3.5 px-4 py-3.5 sm:px-5 bg-[#F4F9E8] border border-[#D5EAA9] rounded-[14px] text-[#2F5204] shadow-xs">
      <div className="w-9 h-9 rounded-xl bg-[#65A916]/15 text-[#65A916] flex items-center justify-center shrink-0">
        <GraduationCap className="w-5 h-5" />
      </div>
      <p className="text-xs sm:text-sm font-semibold leading-snug">
        <span className="font-bold text-[#65A916] mr-1">✦ MENA :</span>
        Tous les contenus sont adaptés au programme national du MENA et conçus avec du matériel local, simple et accessible.
      </p>
    </div>
  );
}

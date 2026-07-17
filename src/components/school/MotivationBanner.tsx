"use client";
import React from "react";

interface MotivationBannerProps {
  starsEarnedThisWeek: number;
}

export default function MotivationBanner({
  starsEarnedThisWeek,
}: MotivationBannerProps) {
  return (
    <div className="bg-[#E8F8F0] border border-[#A7F3D0] rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3 justify-center shadow-sm">
      <span className="text-xl">🎉</span>
      <p className="text-sm font-extrabold text-[#065F46] text-center sm:text-left leading-normal">
        Félicitations ! Vos élèves ont gagné{" "}
        <span className="text-base font-black text-[#047857]">
          {starsEarnedThisWeek} étoiles
        </span>{" "}
        cette semaine.
        <span className="font-semibold text-[#059669] block sm:inline sm:ml-1">
          Continuez comme ça !
        </span>
      </p>
    </div>
  );
}

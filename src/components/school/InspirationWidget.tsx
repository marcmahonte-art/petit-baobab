"use client";
import React from "react";
import Image from "next/image";

export default function InspirationWidget() {
  return (
    <div className="bg-[#FFF8E1] rounded-2xl p-5 shadow-sm border border-[#FFE08A] overflow-hidden relative">
      <h3 className="text-sm font-extrabold text-[#3B2416] mb-1">
        Apprendre, créer, grandir !
      </h3>
      <p className="text-[11px] text-[#7A6A5E] font-medium mb-4 leading-normal">
        Petit Baobab accompagne vos élèves chaque jour.
      </p>

      {/* Illustration */}
      <div className="flex justify-center -mx-5 -mb-5 mt-2">
        <Image
          src="/illustrations/premium-boy.webp"
          alt="Apprendre, créer, grandir"
          width={280}
          height={160}
          className="w-full h-auto object-cover max-h-[160px] rounded-b-2xl"
        />
      </div>
    </div>
  );
}

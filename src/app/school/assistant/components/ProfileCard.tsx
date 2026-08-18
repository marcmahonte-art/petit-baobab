"use client";

import React from "react";
import Image from "next/image";
import { Check } from "lucide-react";
import { Persona } from "@/lib/assistant/prompts";

export interface ProfileItem {
  id: Persona;
  title: string;
  subtitle: string;
  ageBadge: string;
  imageSrc: string;
  accentColor: string;
}

interface ProfileCardProps {
  profile: ProfileItem;
  isSelected: boolean;
  onSelect: (id: Persona) => void;
}

export default function ProfileCard({ profile, isSelected, onSelect }: ProfileCardProps) {
  return (
    <div
      onClick={() => onSelect(profile.id)}
      className={`relative flex flex-col justify-between p-5 rounded-[16px] cursor-pointer transition-all duration-200 select-none min-h-[300px] w-full ${
        isSelected
          ? "bg-[#F7FCEB] border-2 border-[#65A916] shadow-md scale-[1.01]"
          : "bg-white border border-[#E8DFC9] hover:border-[#65A916]/50 hover:shadow-sm hover:-translate-y-0.5"
      }`}
    >
      {/* Top right check badge when selected */}
      {isSelected && (
        <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#65A916] text-white flex items-center justify-center shadow-xs animate-in zoom-in-50 duration-200">
          <Check className="w-4 h-4 stroke-[3]" />
        </div>
      )}

      {/* Header Info */}
      <div className="space-y-1 pr-6">
        <h3 className="font-extrabold text-lg text-[#35180D] leading-snug">
          {profile.title}
        </h3>
        <p className="text-xs sm:text-sm text-[#7A6A5E] font-medium">
          {profile.subtitle}
        </p>
      </div>

      {/* Profile Artwork */}
      <div className="my-4 flex items-center justify-center relative w-full h-36">
        <Image
          src={profile.imageSrc}
          alt={profile.title}
          width={130}
          height={130}
          className="object-contain max-h-36 drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Bottom Age / Target Badge */}
      <div className="pt-2 border-t border-[#EDE3D5]/60">
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
            isSelected
              ? "bg-[#65A916] text-white"
              : "bg-[#F4F0E8] text-[#554A42]"
          }`}
        >
          {profile.ageBadge}
        </span>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { MessageSquareText } from "lucide-react";

interface NeedInputProps {
  value: string;
  onChange: (val: string) => void;
}

export default function NeedInput({ value, onChange }: NeedInputProps) {
  const maxLength = 250;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= maxLength) {
      onChange(text);
    }
  };

  return (
    <div className="bg-white border border-[#EDE3D5] rounded-3xl p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-base text-[#4022C9] flex items-center gap-2">
          <MessageSquareText className="w-4 h-4 text-[#4022C9]" />
          <span>Décrivez votre besoin</span>
        </h3>
        <span className="text-xs font-bold text-[#90847B]">
          (optionnel)
        </span>
      </div>

      <div className="relative">
        <textarea
          value={value}
          onChange={handleChange}
          maxLength={maxLength}
          placeholder="Ex : Une activité sur les animaux de la savane pour des enfants de 4 ans pendant 30 minutes..."
          className="w-full h-[155px] p-3.5 rounded-2xl border border-[#E8DFC9] bg-[#FFFDF8] text-sm text-[#35180D] font-medium focus:outline-none focus:border-[#4022C9] focus:ring-2 focus:ring-[#4022C9]/20 transition-all resize-none leading-relaxed"
        />
        <div className="absolute bottom-3 right-3 text-xs font-bold text-[#90847B] bg-white/80 px-2 py-0.5 rounded-full border border-[#EDE3D5]">
          {value.length} / {maxLength}
        </div>
      </div>
    </div>
  );
}

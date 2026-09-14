"use client";

import React from "react";
import { MemoryBookPage } from "../../../types/memory-book.types";
import Image from "next/image";

interface CoverTemplateProps {
  page: MemoryBookPage;
  isReadOnly?: boolean;
  onUpdateField?: (fieldKey: string, value: any) => void;
}

export const CoverTemplate: React.FC<CoverTemplateProps> = ({
  page,
  isReadOnly = false,
  onUpdateField,
}) => {
  const data = page.data || {};
  const childName = data.childName || "Aminata";
  const title = data.title || "Mon cahier de souvenirs";
  const subtitle = data.subtitle || "Mes petits moments, mes grandes histoires ✨";
  const schoolYear = data.schoolYear || "2025 - 2026";
  const coverImage = data.coverImage || "/cahier-souvenirs/cover.png";

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-8 md:p-12 select-none overflow-hidden bg-[#FFFDF8]">
      {/* Texture de fond subtile */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_16%,rgba(249,183,44,0.12),transparent_28%),radial-gradient(circle_at_90%_75%,rgba(22,134,107,0.08),transparent_32%)]" />

      {/* Cadre décoratif extérieur */}
      <div className="absolute inset-4 rounded-[24px] border-2 border-dashed border-[#E8DED0] pointer-events-none" />

      {/* En-tête : Logo & Titre */}
      <div className="relative z-10 w-full flex flex-col items-center text-center mt-2">
        <div className="w-[170px] h-[55px] relative mb-2">
          <Image
            src="/cahier-souvenirs/logo.png"
            alt="Petit Baobab"
            fill
            className="object-contain"
            priority
          />
        </div>

        <h1 className="font-baloo text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#61351F] leading-tight drop-shadow-xs">
          {title}
        </h1>
        <p className="font-nunito text-xs sm:text-sm md:text-base font-semibold text-[#71675E] mt-1">
          {subtitle}
        </p>
      </div>

      {/* Visuel central de couverture officiel */}
      <div className="relative z-10 my-auto flex flex-col items-center">
        <div className="relative w-[210px] h-[220px] sm:w-[250px] sm:h-[260px] md:w-[280px] md:h-[295px] rounded-[20px] bg-white p-3 shadow-[0_16px_36px_rgba(97,53,31,0.15)] border border-[#E8DED0]/60 overflow-hidden transform hover:scale-[1.02] transition duration-300">
          <Image
            src={coverImage}
            alt="Couverture"
            fill
            className="object-cover rounded-[14px]"
            priority
          />
        </div>

        {/* Badge prénom personnalisable */}
        <div className="mt-4 px-6 py-2 rounded-full bg-[#EEE9FF] border border-[#7658E8]/30 shadow-xs">
          {isReadOnly ? (
            <span className="font-baloo text-lg sm:text-xl font-bold text-[#7658E8]">
              {childName}
            </span>
          ) : (
            <input
              type="text"
              value={childName}
              onChange={(e) => onUpdateField && onUpdateField("childName", e.target.value)}
              placeholder="Prénom de l'enfant"
              className="font-baloo text-lg sm:text-xl font-bold text-[#7658E8] bg-transparent text-center outline-none border-b border-transparent focus:border-[#7658E8]"
            />
          )}
        </div>
      </div>

      {/* Pied de page : Année scolaire & Décoration */}
      <div className="relative z-10 w-full flex items-center justify-between pt-2 border-t border-[#E8DED0]/60 text-xs sm:text-sm font-bold text-[#91877D]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#16866B]" />
          <span>Année scolaire : {schoolYear}</span>
        </div>
        <div className="font-nunito text-[#61351F]/70">
          Édition Souvenirs d’enfance
        </div>
      </div>
    </div>
  );
};

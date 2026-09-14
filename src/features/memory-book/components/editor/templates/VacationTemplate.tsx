"use client";

import React from "react";
import { MemoryBookPage } from "../../../types/memory-book.types";
import Image from "next/image";

interface VacationTemplateProps {
  page: MemoryBookPage;
  isReadOnly?: boolean;
  onUpdateField?: (fieldKey: string, value: any) => void;
}

export const VacationTemplate: React.FC<VacationTemplateProps> = ({
  page,
  isReadOnly = false,
  onUpdateField,
}) => {
  const data = page.data || {};
  const destination = data.destination ?? "Chez mes grands-parents au village";
  const activities = data.activities ?? "Baignade, cueillir des mangues et regarder les étoiles le soir";
  const specialMemory = data.specialMemory ?? "Les histoires captivantes racontées par les aînés autour du feu.";

  return (
    <div className="relative w-full h-full p-8 md:p-10 select-none overflow-hidden bg-[#FFFDF8] flex flex-col justify-between">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_25%_15%,rgba(249,183,44,0.09),transparent_25%),radial-gradient(circle_at_75%_75%,rgba(42,165,220,0.08),transparent_30%)]" />

      {/* En-tête */}
      <div className="relative z-10 text-center mb-4">
        <span className="text-3xl">🏖️</span>
        <h2 className="font-baloo text-3xl sm:text-4xl font-extrabold text-[#61351F] leading-tight">
          Mes vacances
        </h2>
        <p className="text-xs sm:text-sm text-[#91877D] font-bold">
          Mes voyages, le grand air et mes découvertes
        </p>
      </div>

      {/* Contenu */}
      <div className="relative z-10 flex-1 flex flex-col gap-4">
        <div className="rounded-[18px] p-4 bg-[#FFF1D5]/70 border border-[#F9B72C]/30 shadow-xs">
          <label className="font-baloo text-sm text-[#F28B30] font-bold block mb-1.5">
            🌴 Où je suis allé(e) / Mon endroit de rêve :
          </label>
          {isReadOnly ? (
            <p className="text-xs font-bold text-[#4d4037]">{destination}</p>
          ) : (
            <input
              type="text"
              value={destination}
              onChange={(e) => onUpdateField && onUpdateField("destination", e.target.value)}
              className="w-full border border-[#ded5c9] rounded-[10px] bg-white text-[#4d4037] px-3 py-2 text-xs outline-none focus:border-[#7658e8]"
            />
          )}
        </div>

        <div className="rounded-[18px] p-4 bg-[#DDEFF7]/60 border border-[#2aa5dc]/30 shadow-xs">
          <label className="font-baloo text-sm text-[#2aa5dc] font-bold block mb-1.5">
            🍉 Mes activités amusantes en vacances :
          </label>
          {isReadOnly ? (
            <p className="text-xs font-bold text-[#4d4037]">{activities}</p>
          ) : (
            <textarea
              value={activities}
              onChange={(e) => onUpdateField && onUpdateField("activities", e.target.value)}
              rows={2}
              className="w-full border border-[#ded5c9] rounded-[10px] bg-white text-[#4d4037] p-2.5 text-xs outline-none resize-none focus:border-[#7658e8]"
            />
          )}
        </div>

        <div className="rounded-[18px] p-4 bg-[#FBE2E7]/60 border border-[#FBE2E7] shadow-xs">
          <label className="font-baloo text-sm text-[#61351F] font-bold block mb-1.5">
            ✨ Mon moment préféré de toutes les vacances :
          </label>
          {isReadOnly ? (
            <p className="text-xs italic text-[#4d4037] font-medium leading-relaxed">{specialMemory}</p>
          ) : (
            <textarea
              value={specialMemory}
              onChange={(e) => onUpdateField && onUpdateField("specialMemory", e.target.value)}
              rows={2}
              className="w-full border border-[#ded5c9] rounded-[10px] bg-white text-[#4d4037] p-2.5 text-xs outline-none resize-none focus:border-[#7658e8]"
            />
          )}
        </div>
      </div>

      {/* Bas de page */}
      <div className="relative z-10 flex items-center justify-between pt-3 border-t border-[#E8DED0]/70 mt-4">
        <div className="w-[110px] h-[36px] relative">
          <Image
            src="/cahier-souvenirs/logo.png"
            alt="Petit Baobab"
            fill
            className="object-contain object-left"
          />
        </div>
        <span className="font-baloo font-bold text-xs text-[#91877D]">Page 8 / 10</span>
      </div>
    </div>
  );
};

"use client";

import React from "react";
import { MemoryBookPage } from "../../../types/memory-book.types";
import Image from "next/image";

interface MemoriesTemplateProps {
  page: MemoryBookPage;
  isReadOnly?: boolean;
  onUpdateField?: (fieldKey: string, value: any) => void;
}

export const MemoriesTemplate: React.FC<MemoriesTemplateProps> = ({
  page,
  isReadOnly = false,
  onUpdateField,
}) => {
  const data = page.data || {};
  const memory1Title = data.memory1Title ?? "La sortie au zoo";
  const memory1Text = data.memory1Text ?? "J’ai vu des girafes et des éléphants immenses avec mes copains !";
  const memory2Title = data.memory2Title ?? "Mon anniversaire";
  const memory2Text = data.memory2Text ?? "Un magnifique gâteau au chocolat et tous mes amis réunis pour chanter.";

  return (
    <div className="relative w-full h-full p-8 md:p-10 select-none overflow-hidden bg-[#FFFDF8] flex flex-col justify-between">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_30%_15%,rgba(22,134,107,0.06),transparent_25%),radial-gradient(circle_at_75%_75%,rgba(118,88,232,0.07),transparent_30%)]" />

      {/* En-tête */}
      <div className="relative z-10 text-center mb-4">
        <span className="text-3xl">⭐</span>
        <h2 className="font-baloo text-3xl sm:text-4xl font-extrabold text-[#61351F] leading-tight">
          Mes souvenirs
        </h2>
        <p className="text-xs sm:text-sm text-[#91877D] font-bold">
          Les moments gravés pour toujours dans mon cœur
        </p>
      </div>

      {/* Souvenirs */}
      <div className="relative z-10 flex-1 flex flex-col gap-4">
        {/* Souvenir 1 */}
        <div className="rounded-[20px] p-4 bg-[#DFF1E9]/40 border border-[#16866B]/20 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🌿</span>
            {isReadOnly ? (
              <h3 className="font-baloo text-base font-bold text-[#16866B]">{memory1Title}</h3>
            ) : (
              <input
                type="text"
                value={memory1Title}
                onChange={(e) => onUpdateField && onUpdateField("memory1Title", e.target.value)}
                className="font-baloo text-base font-bold text-[#16866B] bg-transparent outline-none border-b border-dashed border-[#16866B]/40 focus:border-[#16866B] w-full"
              />
            )}
          </div>
          {isReadOnly ? (
            <p className="text-xs text-[#4d4037] leading-relaxed italic">{memory1Text}</p>
          ) : (
            <textarea
              value={memory1Text}
              onChange={(e) => onUpdateField && onUpdateField("memory1Text", e.target.value)}
              rows={3}
              className="w-full border border-[#ded5c9] rounded-[10px] bg-white text-[#4d4037] p-2.5 text-xs outline-none resize-none focus:border-[#16866B]"
            />
          )}
        </div>

        {/* Souvenir 2 */}
        <div className="rounded-[20px] p-4 bg-[#FFF1D5]/50 border border-[#F9B72C]/20 shadow-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🎂</span>
            {isReadOnly ? (
              <h3 className="font-baloo text-base font-bold text-[#F28B30]">{memory2Title}</h3>
            ) : (
              <input
                type="text"
                value={memory2Title}
                onChange={(e) => onUpdateField && onUpdateField("memory2Title", e.target.value)}
                className="font-baloo text-base font-bold text-[#F28B30] bg-transparent outline-none border-b border-dashed border-[#F28B30]/40 focus:border-[#F28B30] w-full"
              />
            )}
          </div>
          {isReadOnly ? (
            <p className="text-xs text-[#4d4037] leading-relaxed italic">{memory2Text}</p>
          ) : (
            <textarea
              value={memory2Text}
              onChange={(e) => onUpdateField && onUpdateField("memory2Text", e.target.value)}
              rows={3}
              className="w-full border border-[#ded5c9] rounded-[10px] bg-white text-[#4d4037] p-2.5 text-xs outline-none resize-none focus:border-[#F28B30]"
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
        <span className="font-baloo font-bold text-xs text-[#91877D]">Page 5 / 10</span>
      </div>
    </div>
  );
};

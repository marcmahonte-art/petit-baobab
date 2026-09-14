"use client";

import React from "react";
import { MemoryBookPage } from "../../../types/memory-book.types";
import Image from "next/image";

interface PrideTemplateProps {
  page: MemoryBookPage;
  isReadOnly?: boolean;
  onUpdateField?: (fieldKey: string, value: any) => void;
}

export const PrideTemplate: React.FC<PrideTemplateProps> = ({
  page,
  isReadOnly = false,
  onUpdateField,
}) => {
  const data = page.data || {};
  const proud1 = data.proud1 ?? "J’ai appris à faire du vélo sans les petites roues !";
  const proud2 = data.proud2 ?? "Je sais écrire mon prénom tout seul en lettres attachées.";
  const proud3 = data.proud3 ?? "J’aide toujours mes camarades quand ils ont un chagrin.";

  return (
    <div className="relative w-full h-full p-8 md:p-10 select-none overflow-hidden bg-[#FFFDF8] flex flex-col justify-between">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(249,183,44,0.08),transparent_25%),radial-gradient(circle_at_80%_80%,rgba(22,134,107,0.06),transparent_30%)]" />

      {/* En-tête */}
      <div className="relative z-10 text-center mb-4">
        <span className="text-3xl">🏆</span>
        <h2 className="font-baloo text-3xl sm:text-4xl font-extrabold text-[#61351F] leading-tight">
          Mes fiertés
        </h2>
        <p className="text-xs sm:text-sm text-[#91877D] font-bold">
          Les défis que j&apos;ai relevés et mes plus belles victoires
        </p>
      </div>

      {/* 3 Cartes de Fierté */}
      <div className="relative z-10 flex-1 flex flex-col gap-4">
        {/* Médaille 1 */}
        <div className="rounded-[18px] p-4 bg-[#FFF1D5]/80 border border-[#F9B72C]/40 shadow-xs flex gap-3 items-start">
          <div className="w-10 h-10 rounded-full bg-[#F9B72C] text-white flex items-center justify-center font-baloo font-bold text-lg flex-shrink-0 shadow-sm">
            1
          </div>
          <div className="flex-1">
            <strong className="font-baloo text-sm text-[#61351F] block mb-1">
              🥇 Ma plus grande réussite :
            </strong>
            {isReadOnly ? (
              <p className="text-xs font-bold text-[#4d4037]">{proud1}</p>
            ) : (
              <textarea
                value={proud1}
                onChange={(e) => onUpdateField && onUpdateField("proud1", e.target.value)}
                rows={2}
                className="w-full border border-[#ded5c9] rounded-[10px] bg-white text-[#4d4037] p-2 text-xs outline-none resize-none focus:border-[#7658e8]"
              />
            )}
          </div>
        </div>

        {/* Médaille 2 */}
        <div className="rounded-[18px] p-4 bg-[#DDEFF7]/70 border border-[#2aa5dc]/30 shadow-xs flex gap-3 items-start">
          <div className="w-10 h-10 rounded-full bg-[#2aa5dc] text-white flex items-center justify-center font-baloo font-bold text-lg flex-shrink-0 shadow-sm">
            2
          </div>
          <div className="flex-1">
            <strong className="font-baloo text-sm text-[#61351F] block mb-1">
              🥈 Un nouveau savoir ou talent :
            </strong>
            {isReadOnly ? (
              <p className="text-xs font-bold text-[#4d4037]">{proud2}</p>
            ) : (
              <textarea
                value={proud2}
                onChange={(e) => onUpdateField && onUpdateField("proud2", e.target.value)}
                rows={2}
                className="w-full border border-[#ded5c9] rounded-[10px] bg-white text-[#4d4037] p-2 text-xs outline-none resize-none focus:border-[#7658e8]"
              />
            )}
          </div>
        </div>

        {/* Médaille 3 */}
        <div className="rounded-[18px] p-4 bg-[#DFF1E9]/70 border border-[#16866B]/30 shadow-xs flex gap-3 items-start">
          <div className="w-10 h-10 rounded-full bg-[#16866B] text-white flex items-center justify-center font-baloo font-bold text-lg flex-shrink-0 shadow-sm">
            3
          </div>
          <div className="flex-1">
            <strong className="font-baloo text-sm text-[#61351F] block mb-1">
              🥉 Mon geste généreux :
            </strong>
            {isReadOnly ? (
              <p className="text-xs font-bold text-[#4d4037]">{proud3}</p>
            ) : (
              <textarea
                value={proud3}
                onChange={(e) => onUpdateField && onUpdateField("proud3", e.target.value)}
                rows={2}
                className="w-full border border-[#ded5c9] rounded-[10px] bg-white text-[#4d4037] p-2 text-xs outline-none resize-none focus:border-[#7658e8]"
              />
            )}
          </div>
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
        <span className="font-baloo font-bold text-xs text-[#91877D]">Page 7 / 10</span>
      </div>
    </div>
  );
};

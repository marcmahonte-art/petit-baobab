"use client";

import React from "react";
import { MemoryBookPage } from "../../../types/memory-book.types";
import Image from "next/image";

interface SecretsTemplateProps {
  page: MemoryBookPage;
  isReadOnly?: boolean;
  onUpdateField?: (fieldKey: string, value: any) => void;
}

export const SecretsTemplate: React.FC<SecretsTemplateProps> = ({
  page,
  isReadOnly = false,
  onUpdateField,
}) => {
  const data = page.data || {};
  const secretPower = data.secretPower ?? "Je peux parler discrètement aux oiseaux dans le jardin !";
  const hiddenTreasure = data.hiddenTreasure ?? "Une jolie pierre brillante et multicolore cachée dans ma chambre.";
  const bigWish = data.bigWish ?? "Faire un grand voyage autour du monde en montgolfière avec toute ma famille.";

  return (
    <div className="relative w-full h-full p-8 md:p-10 select-none overflow-hidden bg-[#FFFDF8] flex flex-col justify-between">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_25%_25%,rgba(118,88,232,0.08),transparent_25%),radial-gradient(circle_at_75%_75%,rgba(242,139,48,0.07),transparent_30%)]" />

      {/* En-tête */}
      <div className="relative z-10 text-center mb-4">
        <span className="text-3xl">🔒</span>
        <h2 className="font-baloo text-3xl sm:text-4xl font-extrabold text-[#61351F] leading-tight">
          Mes petits secrets
        </h2>
        <p className="text-xs sm:text-sm text-[#91877D] font-bold">
          Chut... des petits trésors rien que pour moi !
        </p>
      </div>

      {/* Secrets Cards */}
      <div className="relative z-10 flex-1 flex flex-col gap-4">
        <div className="rounded-[18px] p-4 bg-[#EEE9FF]/60 border border-[#7658E8]/20 shadow-xs">
          <label className="font-baloo text-sm text-[#7658E8] font-bold block mb-1.5 flex items-center gap-1.5">
            ⚡ Mon super-pouvoir secret :
          </label>
          {isReadOnly ? (
            <p className="text-xs font-bold text-[#4d4037]">{secretPower}</p>
          ) : (
            <input
              type="text"
              value={secretPower}
              onChange={(e) => onUpdateField && onUpdateField("secretPower", e.target.value)}
              className="w-full border border-[#ded5c9] rounded-[10px] bg-white text-[#4d4037] px-3 py-2 text-xs outline-none focus:border-[#7658e8]"
            />
          )}
        </div>

        <div className="rounded-[18px] p-4 bg-[#FFF1D5]/70 border border-[#F9B72C]/30 shadow-xs">
          <label className="font-baloo text-sm text-[#61351F] font-bold block mb-1.5 flex items-center gap-1.5">
            💎 Mon trésor caché préféré :
          </label>
          {isReadOnly ? (
            <p className="text-xs font-bold text-[#4d4037]">{hiddenTreasure}</p>
          ) : (
            <input
              type="text"
              value={hiddenTreasure}
              onChange={(e) => onUpdateField && onUpdateField("hiddenTreasure", e.target.value)}
              className="w-full border border-[#ded5c9] rounded-[10px] bg-white text-[#4d4037] px-3 py-2 text-xs outline-none focus:border-[#7658e8]"
            />
          )}
        </div>

        <div className="rounded-[18px] p-4 bg-[#FBE2E7]/70 border border-[#FBE2E7] shadow-xs">
          <label className="font-baloo text-sm text-[#61351F] font-bold block mb-1.5 flex items-center gap-1.5">
            🌟 Mon vœu le plus cher :
          </label>
          {isReadOnly ? (
            <p className="text-xs italic text-[#4d4037] font-medium leading-relaxed">{bigWish}</p>
          ) : (
            <textarea
              value={bigWish}
              onChange={(e) => onUpdateField && onUpdateField("bigWish", e.target.value)}
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
        <span className="font-baloo font-bold text-xs text-[#91877D]">Page 10 / 10</span>
      </div>
    </div>
  );
};

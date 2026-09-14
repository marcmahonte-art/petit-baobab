"use client";

import React from "react";
import { MemoryBookPage } from "../../../types/memory-book.types";
import Image from "next/image";

interface BooksTemplateProps {
  page: MemoryBookPage;
  isReadOnly?: boolean;
  onUpdateField?: (fieldKey: string, value: any) => void;
}

export const BooksTemplate: React.FC<BooksTemplateProps> = ({
  page,
  isReadOnly = false,
  onUpdateField,
}) => {
  const data = page.data || {};
  const favoriteBook = data.favoriteBook ?? "Le Secret du Grand Baobab";
  const favoriteHero = data.favoriteHero ?? "Kaya la petite lionne";
  const storyMoral = data.storyMoral ?? "L’amitié et le courage sont les plus beaux trésors du monde.";

  return (
    <div className="relative w-full h-full p-8 md:p-10 select-none overflow-hidden bg-[#FFFDF8] flex flex-col justify-between">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_25%_25%,rgba(118,88,232,0.06),transparent_25%),radial-gradient(circle_at_80%_70%,rgba(242,139,48,0.07),transparent_30%)]" />

      {/* En-tête */}
      <div className="relative z-10 text-center mb-4">
        <span className="text-3xl">📚</span>
        <h2 className="font-baloo text-3xl sm:text-4xl font-extrabold text-[#61351F] leading-tight">
          Mes livres
        </h2>
        <p className="text-xs sm:text-sm text-[#91877D] font-bold">
          Mes histoires préférées et mes héros extraordinaires
        </p>
      </div>

      {/* Formulaire lecture */}
      <div className="relative z-10 flex-1 flex flex-col gap-4">
        <div className="rounded-[18px] p-4 bg-[#EEE9FF]/50 border border-[#7658E8]/20 shadow-xs">
          <label className="font-baloo text-sm text-[#7658E8] font-bold block mb-1.5">
            📖 Mon livre préféré de l&apos;année :
          </label>
          {isReadOnly ? (
            <p className="text-xs font-bold text-[#4d4037]">{favoriteBook}</p>
          ) : (
            <input
              type="text"
              value={favoriteBook}
              onChange={(e) => onUpdateField && onUpdateField("favoriteBook", e.target.value)}
              className="w-full border border-[#ded5c9] rounded-[10px] bg-white text-[#4d4037] px-3 py-2 text-xs outline-none focus:border-[#7658e8]"
            />
          )}
        </div>

        <div className="rounded-[18px] p-4 bg-[#FFF1D5]/60 border border-[#F9B72C]/30 shadow-xs">
          <label className="font-baloo text-sm text-[#61351F] font-bold block mb-1.5">
            🦁 Mon personnage ou héros favori :
          </label>
          {isReadOnly ? (
            <p className="text-xs font-bold text-[#4d4037]">{favoriteHero}</p>
          ) : (
            <input
              type="text"
              value={favoriteHero}
              onChange={(e) => onUpdateField && onUpdateField("favoriteHero", e.target.value)}
              className="w-full border border-[#ded5c9] rounded-[10px] bg-white text-[#4d4037] px-3 py-2 text-xs outline-none focus:border-[#7658e8]"
            />
          )}
        </div>

        <div className="rounded-[18px] p-4 bg-[#DFF1E9]/50 border border-[#16866B]/20 shadow-xs">
          <label className="font-baloo text-sm text-[#16866B] font-bold block mb-1.5">
            💡 Ce que cette histoire m&apos;a appris :
          </label>
          {isReadOnly ? (
            <p className="text-xs italic text-[#4d4037] font-medium leading-relaxed">{storyMoral}</p>
          ) : (
            <textarea
              value={storyMoral}
              onChange={(e) => onUpdateField && onUpdateField("storyMoral", e.target.value)}
              rows={3}
              className="w-full border border-[#ded5c9] rounded-[10px] bg-white text-[#4d4037] p-2.5 text-xs outline-none resize-none focus:border-[#16866B]"
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
        <span className="font-baloo font-bold text-xs text-[#91877D]">Page 6 / 10</span>
      </div>
    </div>
  );
};

"use client";

import React from "react";
import { MemoryBookPage } from "../../../types/memory-book.types";
import Image from "next/image";

interface FriendsTemplateProps {
  page: MemoryBookPage;
  isReadOnly?: boolean;
  onUpdateField?: (fieldKey: string, value: any) => void;
}

export const FriendsTemplate: React.FC<FriendsTemplateProps> = ({
  page,
  isReadOnly = false,
  onUpdateField,
}) => {
  const data = page.data || {};
  const bestFriends = data.bestFriends ?? "Fatou, Moussa, Lucas et Sarah";
  const gamesTogether = data.gamesTogether ?? "Inventer des histoires magiques et courir dans la cour";
  const funnyMoments = data.funnyMoments ?? "Quand on a tous rigolé à la cantine en racontant des blagues !";

  return (
    <div className="relative w-full h-full p-8 md:p-10 select-none overflow-hidden bg-[#FFFDF8] flex flex-col justify-between">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_25%,rgba(242,139,48,0.06),transparent_25%),radial-gradient(circle_at_80%_70%,rgba(22,134,107,0.07),transparent_30%)]" />

      {/* En-tête */}
      <div className="relative z-10 text-center mb-4">
        <span className="text-3xl">👫</span>
        <h2 className="font-baloo text-3xl sm:text-4xl font-extrabold text-[#61351F] leading-tight">
          Mes camarades
        </h2>
        <p className="text-xs sm:text-sm text-[#91877D] font-bold">
          Mes copains, mes copines et nos moments de rire
        </p>
      </div>

      {/* Contenu */}
      <div className="relative z-10 flex-1 flex flex-col gap-4">
        {/* Liste des amis */}
        <div className="rounded-[18px] p-4 bg-[#FBE2E7]/50 border border-[#FBE2E7] shadow-xs">
          <strong className="font-baloo text-sm text-[#61351F] flex items-center gap-1.5 mb-2">
            💖 Mes meilleurs amis cette année :
          </strong>
          {isReadOnly ? (
            <p className="text-xs font-bold text-[#4d4037]">{bestFriends}</p>
          ) : (
            <input
              type="text"
              value={bestFriends}
              onChange={(e) => onUpdateField && onUpdateField("bestFriends", e.target.value)}
              className="w-full border border-[#ded5c9] rounded-[10px] bg-white text-[#4d4037] px-3 py-2 text-xs outline-none focus:border-[#7658e8]"
            />
          )}
        </div>

        {/* Nos jeux préférés */}
        <div className="rounded-[18px] p-4 bg-[#DDEFF7]/50 border border-[#DDEFF7] shadow-xs">
          <strong className="font-baloo text-sm text-[#61351F] flex items-center gap-1.5 mb-2">
            ⚽ À quoi nous aimons jouer ensemble :
          </strong>
          {isReadOnly ? (
            <p className="text-xs font-bold text-[#4d4037]">{gamesTogether}</p>
          ) : (
            <textarea
              value={gamesTogether}
              onChange={(e) => onUpdateField && onUpdateField("gamesTogether", e.target.value)}
              rows={2}
              className="w-full border border-[#ded5c9] rounded-[10px] bg-white text-[#4d4037] p-2.5 text-xs outline-none resize-none focus:border-[#7658e8]"
            />
          )}
        </div>

        {/* Moment drôle */}
        <div className="rounded-[18px] p-4 bg-[#FFF1D5]/60 border border-[#F9B72C]/20 shadow-xs">
          <strong className="font-baloo text-sm text-[#61351F] flex items-center gap-1.5 mb-2">
            😂 Notre fou rire le plus mémorable :
          </strong>
          {isReadOnly ? (
            <p className="text-xs italic text-[#4d4037] font-medium leading-relaxed">{funnyMoments}</p>
          ) : (
            <textarea
              value={funnyMoments}
              onChange={(e) => onUpdateField && onUpdateField("funnyMoments", e.target.value)}
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
        <span className="font-baloo font-bold text-xs text-[#91877D]">Page 4 / 10</span>
      </div>
    </div>
  );
};

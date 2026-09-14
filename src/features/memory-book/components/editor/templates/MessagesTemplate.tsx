"use client";

import React from "react";
import { MemoryBookPage } from "../../../types/memory-book.types";
import Image from "next/image";

interface MessagesTemplateProps {
  page: MemoryBookPage;
  isReadOnly?: boolean;
  onUpdateField?: (fieldKey: string, value: any) => void;
}

export const MessagesTemplate: React.FC<MessagesTemplateProps> = ({
  page,
  isReadOnly = false,
  onUpdateField,
}) => {
  const data = page.data || {};
  const parentsMessage = data.parentsMessage ?? "Nous sommes tellement fiers de toi notre trésor ! Continue de grandir avec ce beau sourire et cette curiosité.";
  const teacherMessage = data.teacherMessage ?? "Une élève attentive, joyeuse et pleine d'imagination. Bravo pour tous tes progrès cette année !";
  const friendsMessage = data.friendsMessage ?? "Tu es la meilleure copine du monde, promis on sera toujours amis !";

  return (
    <div className="relative w-full h-full p-8 md:p-10 select-none overflow-hidden bg-[#FFFDF8] flex flex-col justify-between">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(118,88,232,0.06),transparent_25%),radial-gradient(circle_at_80%_80%,rgba(249,183,44,0.07),transparent_30%)]" />

      {/* En-tête */}
      <div className="relative z-10 text-center mb-4">
        <span className="text-3xl">💬</span>
        <h2 className="font-baloo text-3xl sm:text-4xl font-extrabold text-[#61351F] leading-tight">
          Les petits mots
        </h2>
        <p className="text-xs sm:text-sm text-[#91877D] font-bold">
          Les messages doux de ma famille, de ma maîtresse et de mes amis
        </p>
      </div>

      {/* 3 Cartes de petits mots */}
      <div className="relative z-10 flex-1 flex flex-col gap-3.5">
        {/* Mot des parents */}
        <div className="rounded-[18px] p-3.5 bg-[#FBE2E7]/60 border border-[#FBE2E7] shadow-xs">
          <strong className="font-baloo text-xs font-bold text-[#61351F] flex items-center gap-1.5 mb-1">
            💌 Le mot de mes parents :
          </strong>
          {isReadOnly ? (
            <p className="text-xs italic text-[#4d4037] leading-relaxed font-medium">{parentsMessage}</p>
          ) : (
            <textarea
              value={parentsMessage}
              onChange={(e) => onUpdateField && onUpdateField("parentsMessage", e.target.value)}
              rows={2}
              className="w-full border border-[#ded5c9] rounded-[10px] bg-white text-[#4d4037] p-2 text-xs outline-none resize-none focus:border-[#7658e8]"
            />
          )}
        </div>

        {/* Mot de l'enseignant */}
        <div className="rounded-[18px] p-3.5 bg-[#DFF1E9]/60 border border-[#16866B]/20 shadow-xs">
          <strong className="font-baloo text-xs font-bold text-[#16866B] flex items-center gap-1.5 mb-1">
            🌿 Le mot de mon maître / ma maîtresse :
          </strong>
          {isReadOnly ? (
            <p className="text-xs italic text-[#4d4037] leading-relaxed font-medium">{teacherMessage}</p>
          ) : (
            <textarea
              value={teacherMessage}
              onChange={(e) => onUpdateField && onUpdateField("teacherMessage", e.target.value)}
              rows={2}
              className="w-full border border-[#ded5c9] rounded-[10px] bg-white text-[#4d4037] p-2 text-xs outline-none resize-none focus:border-[#16866B]"
            />
          )}
        </div>

        {/* Mot des camarades */}
        <div className="rounded-[18px] p-3.5 bg-[#DDEFF7]/60 border border-[#2aa5dc]/20 shadow-xs">
          <strong className="font-baloo text-xs font-bold text-[#2aa5dc] flex items-center gap-1.5 mb-1">
            🎈 Le mot de mes copains :
          </strong>
          {isReadOnly ? (
            <p className="text-xs italic text-[#4d4037] leading-relaxed font-medium">{friendsMessage}</p>
          ) : (
            <textarea
              value={friendsMessage}
              onChange={(e) => onUpdateField && onUpdateField("friendsMessage", e.target.value)}
              rows={2}
              className="w-full border border-[#ded5c9] rounded-[10px] bg-white text-[#4d4037] p-2 text-xs outline-none resize-none focus:border-[#2aa5dc]"
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
        <span className="font-baloo font-bold text-xs text-[#91877D]">Page 9 / 10</span>
      </div>
    </div>
  );
};

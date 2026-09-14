"use client";

import React from "react";
import { MemoryBookPage } from "../../../types/memory-book.types";
import Image from "next/image";

interface YearTemplateProps {
  page: MemoryBookPage;
  isReadOnly?: boolean;
  onUpdateField?: (fieldKey: string, value: any) => void;
}

export const YearTemplate: React.FC<YearTemplateProps> = ({
  page,
  isReadOnly = false,
  onUpdateField,
}) => {
  const data = page.data || {};
  const schoolName = data.schoolName ?? "École Les Petits Baobabs";
  const grade = data.grade ?? "Grande Section / CP";
  const teacherName = data.teacherName ?? "Mme Awa";
  const favoriteSubject = data.favoriteSubject ?? "Le dessin et les histoires";
  const recessGame = data.recessGame ?? "La marelle et le ballon";
  const bestMemory = data.bestMemory ?? "Le jour du spectacle de fin d’année avec tous mes amis !";

  return (
    <div className="relative w-full h-full p-8 md:p-10 select-none overflow-hidden bg-[#FFFDF8] flex flex-col justify-between">
      {/* Texture de fond */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_15%_20%,rgba(118,88,232,0.06),transparent_25%),radial-gradient(circle_at_85%_70%,rgba(249,183,44,0.07),transparent_30%)]" />

      {/* En-tête */}
      <div className="relative z-10 text-center mb-4">
        <span className="text-3xl">🎒</span>
        <h2 className="font-baloo text-3xl sm:text-4xl font-extrabold text-[#61351F] leading-tight">
          Mon année à l&apos;école
        </h2>
        <p className="text-xs sm:text-sm text-[#91877D] font-bold">
          Les souvenirs de ma classe et de mes journées d&apos;écolier
        </p>
      </div>

      {/* Contenu principal */}
      <div className="relative z-10 flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Carte École & Classe */}
        <div className="rounded-[18px] p-4 bg-[#FFF9F2] border border-[#E8DED0] flex flex-col gap-3 shadow-xs">
          <h3 className="font-baloo font-bold text-base text-[#16866B] flex items-center gap-1.5">
            🏫 Mon École
          </h3>
          <div>
            <label className="text-[11px] font-extrabold text-[#61351F] block mb-1">
              Nom de mon école :
            </label>
            {isReadOnly ? (
              <p className="text-xs font-bold text-[#4d4037]">{schoolName}</p>
            ) : (
              <input
                type="text"
                value={schoolName}
                onChange={(e) => onUpdateField && onUpdateField("schoolName", e.target.value)}
                className="w-full border border-[#ded5c9] rounded-[10px] bg-white text-[#4d4037] px-3 py-1.5 text-xs outline-none focus:border-[#7658e8]"
              />
            )}
          </div>
          <div>
            <label className="text-[11px] font-extrabold text-[#61351F] block mb-1">
              Ma classe :
            </label>
            {isReadOnly ? (
              <p className="text-xs font-bold text-[#4d4037]">{grade}</p>
            ) : (
              <input
                type="text"
                value={grade}
                onChange={(e) => onUpdateField && onUpdateField("grade", e.target.value)}
                className="w-full border border-[#ded5c9] rounded-[10px] bg-white text-[#4d4037] px-3 py-1.5 text-xs outline-none focus:border-[#7658e8]"
              />
            )}
          </div>
          <div>
            <label className="text-[11px] font-extrabold text-[#61351F] block mb-1">
              Ma maîtresse / Mon maître :
            </label>
            {isReadOnly ? (
              <p className="text-xs font-bold text-[#4d4037]">{teacherName}</p>
            ) : (
              <input
                type="text"
                value={teacherName}
                onChange={(e) => onUpdateField && onUpdateField("teacherName", e.target.value)}
                className="w-full border border-[#ded5c9] rounded-[10px] bg-white text-[#4d4037] px-3 py-1.5 text-xs outline-none focus:border-[#7658e8]"
              />
            )}
          </div>
        </div>

        {/* Carte Matières & Récré */}
        <div className="rounded-[18px] p-4 bg-[#EEE9FF]/40 border border-[#7658E8]/20 flex flex-col gap-3 shadow-xs">
          <h3 className="font-baloo font-bold text-base text-[#7658E8] flex items-center gap-1.5">
            🎨 Mes Préférences
          </h3>
          <div>
            <label className="text-[11px] font-extrabold text-[#61351F] block mb-1">
              Ce que je préfère apprendre :
            </label>
            {isReadOnly ? (
              <p className="text-xs font-bold text-[#4d4037]">{favoriteSubject}</p>
            ) : (
              <input
                type="text"
                value={favoriteSubject}
                onChange={(e) => onUpdateField && onUpdateField("favoriteSubject", e.target.value)}
                className="w-full border border-[#ded5c9] rounded-[10px] bg-white text-[#4d4037] px-3 py-1.5 text-xs outline-none focus:border-[#7658e8]"
              />
            )}
          </div>
          <div>
            <label className="text-[11px] font-extrabold text-[#61351F] block mb-1">
              Mon jeu favori en récréation :
            </label>
            {isReadOnly ? (
              <p className="text-xs font-bold text-[#4d4037]">{recessGame}</p>
            ) : (
              <input
                type="text"
                value={recessGame}
                onChange={(e) => onUpdateField && onUpdateField("recessGame", e.target.value)}
                className="w-full border border-[#ded5c9] rounded-[10px] bg-white text-[#4d4037] px-3 py-1.5 text-xs outline-none focus:border-[#7658e8]"
              />
            )}
          </div>
        </div>

        {/* Grand souvenir marquant de l'année */}
        <div className="md:col-span-2 rounded-[18px] p-4 bg-[#FFF1D5] border border-[#F9B72C]/30 flex flex-col gap-1 shadow-xs">
          <strong className="font-baloo text-sm text-[#61351F] flex items-center gap-1.5">
            ⭐ Le plus beau jour de mon année :
          </strong>
          {isReadOnly ? (
            <p className="text-xs leading-relaxed italic text-[#61351F] font-medium mt-1">
              {bestMemory}
            </p>
          ) : (
            <textarea
              value={bestMemory}
              onChange={(e) => onUpdateField && onUpdateField("bestMemory", e.target.value)}
              rows={2}
              className="w-full mt-1 border border-[#E8DED0] rounded-[10px] bg-white text-[#61351F] p-2 text-xs outline-none resize-none focus:border-[#7658e8]"
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
        <span className="font-baloo font-bold text-xs text-[#91877D]">Page 3 / 10</span>
      </div>
    </div>
  );
};

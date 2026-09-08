"use client";

import React from "react";
import { MemoryBookPage, PhotoElementData } from "../../types/memory-book.types";
import { PhotoSlot } from "./PhotoSlot";
import { TextSlot } from "./TextSlot";
import { BookOpen, Sparkles, School, User } from "lucide-react";
import Image from "next/image";

interface CoverTemplateProps {
  page: MemoryBookPage;
  totalPages: number;
  profileId: string;
  bookId: string;
  onUpdateText: (elementId: string, value: string) => void;
  onUpdatePhoto: (elementId: string, data: Partial<PhotoElementData>) => void;
  isReadOnly?: boolean;
}

export const CoverTemplate: React.FC<CoverTemplateProps> = ({
  page,
  totalPages,
  profileId,
  bookId,
  onUpdateText,
  onUpdatePhoto,
  isReadOnly = false,
}) => {
  const coverPhoto = page.elements.find((el) => el.type === "photo" && el.id === "p1_photo_portrait");
  const prenomEl = page.elements.find((el) => el.id === "p1_txt_prenom");
  const classeEl = page.elements.find((el) => el.id === "p1_txt_classe");
  const ecoleEl = page.elements.find((el) => el.id === "p1_txt_ecole");
  const anneeEl = page.elements.find((el) => el.id === "p1_txt_annee");

  return (
    <div className="relative w-full max-w-[650px] mx-auto rounded-[32px] border-4 border-[#7D6AF8] p-6 md:p-10 bg-[#FFF9F2] shadow-xl flex flex-col items-center justify-between" style={{ minHeight: "820px" }}>
      {/* Décoration */}
      <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-[#7D6AF8] rounded-tl-md" />
      <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-[#7D6AF8] rounded-tr-md" />
      <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-[#7D6AF8] rounded-bl-md" />
      <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-[#7D6AF8] rounded-br-md" />

      {/* En-tête couverture */}
      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-[#7D6AF8] text-white shadow-md">
            <Sparkles className="w-5 h-5" />
          </span>
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#7D6AF8]">
            {page.categoryTag || "Couverture & Portrait"}
          </span>
        </div>
        <span className="text-xs font-bold text-gray-500 bg-white/80 px-2.5 py-1 rounded-full">
          Page 1 / {totalPages}
        </span>
      </div>

      {/* Logo Petit Baobab */}
      <div className="flex items-center gap-3 mb-4">
        <Image
          src="/logo/logo-petit-baobab.svg"
          alt="Petit Baobab"
          width={100}
          height={30}
          className="h-8 w-auto"
        />
        <span className="text-[10px] font-bold text-[#9c8a76]">Cahier de souvenirs</span>
      </div>

      {/* Grand cercle couverture */}
      <div className="relative w-[260px] h-[260px] rounded-full bg-white border-[5px] border-[#7D6AF8] flex flex-col items-center justify-center text-center shadow-xl mb-4">
        {/* Photo de profil */}
        {coverPhoto?.photoData?.url && (
          <div className="absolute inset-0 rounded-full overflow-hidden p-4">
            <img src={coverPhoto.photoData.url} alt="Portrait" className="w-full h-full object-cover rounded-full" />
          </div>
        )}
        {!coverPhoto?.photoData?.url && (
          <div className="absolute inset-0 rounded-full bg-[#F3EDE4] flex items-center justify-center">
            <User className="w-12 h-12 text-[#7D6AF8]" />
          </div>
        )}

        <div className="relative z-10">
          {/* Champ nom */}
          {prenomEl && (
            <div className="mt-16 mb-2">
              <TextSlot
                textData={prenomEl.textData}
                title="Mon prénom & nom"
                elementId={prenomEl.id}
                onUpdate={(val) => onUpdateText(prenomEl.id, val)}
                isReadOnly={isReadOnly}
              />
            </div>
          )}
        </div>

        <div className="text-[#FBB03B] tracking-[4px] text-sm mt-2">♦ ♦ ♦ ♦ ♦ ♦ ♦</div>

        {/* Année */}
        {anneeEl && (
          <div className="caveat-font text-2xl font-bold text-[#F7941D] mt-1">
            <TextSlot
              textData={anneeEl.textData}
              elementId={anneeEl.id}
              onUpdate={(val) => onUpdateText(anneeEl.id, val)}
              isReadOnly={isReadOnly}
            />
          </div>
        )}
      </div>

      {/* Polaroids */}
      <div className="flex gap-6 justify-center mb-4">
        <div className="bg-white border-2 border-[#3A362E] p-2.5 pb-6 w-[140px] shadow-md transform -rotate-3 text-center">
          <div className="w-full aspect-square bg-[#F3EBDA] overflow-hidden flex items-center justify-center font-bold text-xs text-[#8a7f66]">
            {/* Photo amis */}
            {page.elements.find((el) => el.id === "cover-friends")?.photoData?.url ? (
              <img src={page.elements.find((el) => el.id === "cover-friends")?.photoData?.url} alt="Amis" className="w-full h-full object-cover" />
            ) : (
              <span>Mes amis</span>
            )}
          </div>
          <div className="caveat-font font-bold text-sm text-[#5B5648] mt-2">Mes amis</div>
        </div>

        <div className="bg-white border-2 border-[#3A362E] p-2.5 pb-6 w-[140px] shadow-md transform rotate-2 text-center">
          <div className="w-full aspect-square bg-[#F3EBDA] overflow-hidden flex items-center justify-center font-bold text-xs text-[#8a7f66]">
            {/* Photo enseignant */}
            {page.elements.find((el) => el.id === "cover-teacher")?.photoData?.url ? (
              <img src={page.elements.find((el) => el.id === "cover-teacher")?.photoData?.url} alt="Enseignant" className="w-full h-full object-cover" />
            ) : (
              <span>Photo</span>
            )}
          </div>
          <div className="caveat-font font-bold text-sm text-[#5B5648] mt-2">Ma maîtresse / Mon maître</div>
        </div>
      </div>

      {/* Infos école */}
      <div className="flex flex-col items-center gap-2 mb-4">
        {classeEl && (
          <TextSlot textData={classeEl.textData} title="Ma classe" elementId={classeEl.id} onUpdate={(val) => onUpdateText(classeEl.id, val)} isReadOnly={isReadOnly} />
        )}
        {ecoleEl && (
          <TextSlot textData={ecoleEl.textData} title="Le nom de mon école" elementId={ecoleEl.id} onUpdate={(val) => onUpdateText(ecoleEl.id, val)} isReadOnly={isReadOnly} />
        )}
      </div>

      {/* Pied */}
      <div className="mt-4 pt-3 border-t border-gray-200/80 flex items-center justify-between text-xs text-gray-500 w-full">
        <div className="flex items-center gap-1.5 font-semibold text-[#7D6AF8]">
          <BookOpen className="w-4 h-4" />
          <span>Petit Baobab</span>
        </div>
        <span className="font-bold">— 1 / {totalPages} —</span>
      </div>
    </div>
  );
};

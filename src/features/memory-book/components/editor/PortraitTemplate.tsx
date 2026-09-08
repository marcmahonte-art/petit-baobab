"use client";

import React from "react";
import { MemoryBookPage, PhotoElementData } from "../../types/memory-book.types";
import { PhotoSlot } from "./PhotoSlot";
import { TextSlot } from "./TextSlot";
import { Camera, Heart, XCircle, User, School, Calendar } from "lucide-react";

interface PortraitTemplateProps {
  page: MemoryBookPage;
  totalPages: number;
  profileId: string;
  bookId: string;
  onUpdateText: (elementId: string, value: string) => void;
  onUpdatePhoto: (elementId: string, data: Partial<PhotoElementData>) => void;
  isReadOnly?: boolean;
}

export const PortraitTemplate: React.FC<PortraitTemplateProps> = ({
  page,
  totalPages,
  profileId,
  bookId,
  onUpdateText,
  onUpdatePhoto,
  isReadOnly = false,
}) => {
  const photoEl = page.elements.find((el) => el.type === "photo" && el.id === "p1_photo_portrait");
  const prenomEl = page.elements.find((el) => el.id === "p1_txt_prenom");
  const ageEl = page.elements.find((el) => el.id === "p2_txt_age");
  const annivEl = page.elements.find((el) => el.id === "p2_txt_anniversaire");
  const tailleEl = page.elements.find((el) => el.id === "p2_txt_taille");
  const couleurEl = page.elements.find((el) => el.id === "p2_txt_couleur");
  const platEl = page.elements.find((el) => el.id === "p2_txt_plat");
  const animalEl = page.elements.find((el) => el.id === "p2_txt_animal");
  const metierEl = page.elements.find((el) => el.id === "p3_txt_futur_metier");
  const adoreEl = page.elements.find((el) => el.id === "p3_txt_jadore");
  const detesteEl = page.elements.find((el) => el.id === "p3_txt_deteste");

  return (
    <div className="relative w-full max-w-[650px] mx-auto rounded-[32px] border-4 border-[#20C997] p-6 md:p-8 bg-[#FFF9F2] shadow-xl flex flex-col justify-between" style={{ minHeight: "820px" }}>
      {/* Décoration coins */}
      <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#20C997] rounded-tl-md pointer-events-none" />
      <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#20C997] rounded-tr-md pointer-events-none" />
      <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-[#20C997] rounded-bl-md pointer-events-none" />
      <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-[#20C997] rounded-br-md pointer-events-none" />

      {/* En-tête */}
      <div className="border-b-2 border-dashed border-gray-300/70 pb-4 mb-5">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-white shadow-xs border border-gray-100">
              <User className="w-5 h-5 text-[#20C997]" />
            </span>
            <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-white/90 text-[#20C997] shadow-xs border border-[#20C997]/20">
              {page.categoryTag || "Mon Portrait"}
            </span>
          </div>
          <span className="text-xs font-bold text-gray-500 bg-white/80 px-2.5 py-1 rounded-full shadow-2xs">
            Page 2 / {totalPages}
          </span>
        </div>
        <h2 className="text-xl md:text-2xl font-black tracking-tight text-gray-900 mt-2 font-display">
          {page.title}
        </h2>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col gap-4 justify-start overflow-y-auto">
        {/* Photo portrait */}
        {photoEl && (
          <div className="flex justify-center my-2">
            <PhotoSlot
              photoData={photoEl.photoData}
              title="Mon Portrait de l&apos;Année"
              subtitle="Glisse ta plus belle photo ici"
              profileId={profileId}
              bookId={bookId}
              elementId={photoEl.id}
              aspectRatio="portrait"
              onUpdate={(data) => onUpdatePhoto(photoEl.id, data)}
              isReadOnly={isReadOnly}
            />
          </div>
        )}

        {/* Informations personnelles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {prenomEl && (
            <TextSlot textData={prenomEl.textData} title="Mon prénom & nom" elementId={prenomEl.id} onUpdate={(val) => onUpdateText(prenomEl.id, val)} isReadOnly={isReadOnly} />
          )}
          {ageEl && (
            <TextSlot textData={ageEl.textData} title="Mon âge cette année" elementId={ageEl.id} onUpdate={(val) => onUpdateText(ageEl.id, val)} isReadOnly={isReadOnly} />
          )}
          {annivEl && (
            <TextSlot textData={annivEl.textData} title="Mon anniversaire" elementId={annivEl.id} onUpdate={(val) => onUpdateText(annivEl.id, val)} isReadOnly={isReadOnly} />
          )}
          {tailleEl && (
            <TextSlot textData={tailleEl.textData} title="Ma taille" elementId={tailleEl.id} onUpdate={(val) => onUpdateText(tailleEl.id, val)} isReadOnly={isReadOnly} />
          )}
          {couleurEl && (
            <TextSlot textData={couleurEl.textData} title="Ma couleur préférée" elementId={couleurEl.id} onUpdate={(val) => onUpdateText(couleurEl.id, val)} isReadOnly={isReadOnly} />
          )}
          {platEl && (
            <TextSlot textData={platEl.textData} title="Mon plat préféré" elementId={platEl.id} onUpdate={(val) => onUpdateText(platEl.id, val)} isReadOnly={isReadOnly} />
          )}
          {animalEl && (
            <TextSlot textData={animalEl.textData} title="Mon animal préféré" elementId={animalEl.id} onUpdate={(val) => onUpdateText(animalEl.id, val)} isReadOnly={isReadOnly} />
          )}
        </div>

        {/* Rêves & Goûts */}
        <div className="mt-2 p-4 rounded-2xl bg-[#FFFDF0] border-2 border-[#FBB03B]/30">
          <h3 className="font-bold text-[#3B2416] text-sm mb-3 flex items-center gap-2">
            <span className="text-lg">✨</span> Mes rêves & mes goûts
          </h3>
          {metierEl && (
            <TextSlot textData={metierEl.textData} title="Plus tard, quand je serai grand(e), je serai..." elementId={metierEl.id} onUpdate={(val) => onUpdateText(metierEl.id, val)} isReadOnly={isReadOnly} />
          )}
          {adoreEl && (
            <div className="flex items-center gap-2 mb-1 mt-2">
              <Heart className="w-4 h-4 text-rose-500" />
              <TextSlot textData={adoreEl.textData} title="Ce que j&apos;adore" elementId={adoreEl.id} onUpdate={(val) => onUpdateText(adoreEl.id, val)} isReadOnly={isReadOnly} />
            </div>
          )}
          {detesteEl && (
            <div className="flex items-center gap-2 mb-1 mt-2">
              <XCircle className="w-4 h-4 text-[#FF5E83]" />
              <TextSlot textData={detesteEl.textData} title="Ce que je déteste" elementId={detesteEl.id} onUpdate={(val) => onUpdateText(detesteEl.id, val)} isReadOnly={isReadOnly} />
            </div>
          )}
        </div>
      </div>

      {/* Pied */}
      <div className="mt-4 pt-4 border-t border-gray-200/80 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1.5 font-semibold text-[#20C997]">
          <User className="w-4 h-4" />
          <span>Petit Baobab</span>
        </div>
        <span className="font-bold">— 2 / {totalPages} —</span>
      </div>
    </div>
  );
};

"use client";

import React, { useRef } from "react";
import { MemoryBookPage } from "../../../types/memory-book.types";
import Image from "next/image";

interface PortraitTemplateProps {
  page: MemoryBookPage;
  isReadOnly?: boolean;
  onUpdateField?: (fieldKey: string, value: any) => void;
  onRequestPhotoUpload?: () => void;
}

const PALETTE_COLORS = [
  { id: "#36a96b", className: "bg-[#36a96b]" },
  { id: "#2aa5dc", className: "bg-[#2aa5dc]" },
  { id: "#ffc83d", className: "bg-[#ffc83d]" },
  { id: "#f28b30", className: "bg-[#f28b30]" },
  { id: "#f58b9b", className: "bg-[#f58b9b]" },
  { id: "#7658e8", className: "bg-[#7658e8]" },
];

export const PortraitTemplate: React.FC<PortraitTemplateProps> = ({
  page,
  isReadOnly = false,
  onUpdateField,
  onRequestPhotoUpload,
}) => {
  const data = page.data || {};
  const name = data.name ?? "Aminata";
  const birthday = data.birthday ?? "12 / 05 / 2018";
  const age = data.age ?? "6 ans";
  const height = data.height ?? "120 cm";
  const favoriteColor = data.favoriteColor ?? "#7658e8";
  const favoriteFood = data.favoriteFood ?? "Le riz au poulet";
  const favoriteAnimal = data.favoriteAnimal ?? "Le lion";
  const futureDream = data.futureDream ?? "Je veux être médecin pour aider les autres.";
  const dreamCatch = data.dreamCatch ?? "Rêve\nGrand !";
  const love = data.love ?? "Jouer avec mes amis,\nles gâteaux et les dessins.";
  const hate = data.hate ?? "Les légumes\net me lever tôt.";

  const photoUrl = data.photoUrl || "/cahier-souvenirs/child.png";
  const zoom = data.zoom ?? 1;
  const rotation = data.rotation ?? 0;
  const hasPhoto = Boolean(data.photoUrl && data.photoUrl !== "");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string" && onUpdateField) {
        onUpdateField("photoUrl", reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-[#FFFDF8]">
      {/* Fond radial subtil conforme au prototype */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_16%,rgba(249,183,44,0.08),transparent_23%),radial-gradient(circle_at_90%_65%,rgba(22,134,107,0.06),transparent_25%)]" />

      {/* Décoration feuille haut gauche */}
      <div className="absolute left-[3.5%] top-[3.5%] w-[11%] aspect-square z-10 pointer-events-none">
        <Image
          src="/cahier-souvenirs/feuille-plante.png"
          alt=""
          fill
          className="object-contain opacity-95"
        />
      </div>

      {/* Décoration soleil haut droite */}
      <div className="absolute right-[5%] top-[3.5%] text-[40px] leading-none text-[#F9B72C] z-10 select-none pointer-events-none drop-shadow-xs">
        ☀️
      </div>

      {/* Rayons décoratifs */}
      <span className="absolute top-[7.2%] left-[19%] text-[#F9B72C] text-[24px] pointer-events-none select-none">
        ✨
      </span>
      <span className="absolute top-[7.2%] right-[13%] text-[#F9B72C] text-[24px] pointer-events-none select-none">
        ✨
      </span>

      {/* Titre "Mon portrait" */}
      <h2 className="absolute top-[4.2%] left-[20%] right-[15%] m-0 text-center font-baloo text-[clamp(24px,3.8vw,38px)] font-extrabold text-[#5b2f1f] leading-none pointer-events-none">
        Mon portrait
      </h2>

      {/* Cadre Photo incliné (-6deg) */}
      <div className="absolute left-[7.5%] top-[17%] w-[34%] aspect-[0.82] bg-white p-2 shadow-[0_9px_16px_rgba(70,50,30,0.16)] -rotate-6 rounded-[7px] z-10 flex flex-col justify-center items-center">
        {/* Couronne */}
        <span className="absolute left-[7%] -top-[13px] text-[25px] text-[#f7b31d] pointer-events-none">
          👑
        </span>

        {/* Zone photo interne avec zoom & rotation */}
        <div className="relative w-full h-full overflow-hidden rounded-[2px] bg-[#f2ede4] flex items-center justify-center">
          {hasPhoto ? (
            <img
              src={photoUrl}
              alt="Portrait de l'enfant"
              className="w-full h-full object-cover transition-transform duration-100 origin-center"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-2 text-[#91877D]">
              <span className="text-2xl mb-1">📷</span>
              <span className="text-[10px] font-bold">Aucune photo</span>
            </div>
          )}
        </div>

        {/* Bouton caméra interactif */}
        {!isReadOnly && (
          <>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => {
                if (onRequestPhotoUpload) {
                  onRequestPhotoUpload();
                } else {
                  fileInputRef.current?.click();
                }
              }}
              title="Changer la photo"
              className="absolute -right-[7px] -bottom-[7px] w-[36px] h-[36px] rounded-full bg-[#61351F] text-white flex items-center justify-center border-2 border-white shadow-md hover:scale-110 active:scale-95 transition cursor-pointer text-sm"
            >
              📷
            </button>
          </>
        )}
      </div>

      {/* Colonne de formulaire à droite */}
      <div className="absolute left-[48%] top-[17%] right-[6%] flex flex-col gap-[6px] z-10">
        {/* Prénom */}
        <div className="flex flex-col">
          <label className="text-[11px] font-extrabold text-[#61351F] mb-[2px]">
            Mon prénom :
          </label>
          {isReadOnly ? (
            <div className="px-2.5 py-1.5 rounded-[9px] bg-[#fffdfa] border border-[#ded5c9] text-xs font-bold text-[#4d4037]">
              {name}
            </div>
          ) : (
            <input
              type="text"
              value={name}
              onChange={(e) => onUpdateField && onUpdateField("name", e.target.value)}
              className="w-full border border-[#ded5c9] rounded-[9px] bg-[#fffdfa] text-[#4d4037] px-2.5 py-1.5 text-xs outline-none focus:border-[#8d72ee] focus:ring-2 focus:ring-[#7658e8]/20 transition"
            />
          )}
        </div>

        {/* Anniversaire */}
        <div className="flex flex-col">
          <label className="text-[11px] font-extrabold text-[#61351F] mb-[2px]">
            Mon anniversaire :
          </label>
          {isReadOnly ? (
            <div className="px-2.5 py-1.5 rounded-[9px] bg-[#fffdfa] border border-[#ded5c9] text-xs font-semibold text-[#4d4037]">
              {birthday}
            </div>
          ) : (
            <input
              type="text"
              value={birthday}
              onChange={(e) => onUpdateField && onUpdateField("birthday", e.target.value)}
              className="w-full border border-[#ded5c9] rounded-[9px] bg-[#fffdfa] text-[#4d4037] px-2.5 py-1.5 text-xs outline-none focus:border-[#8d72ee] focus:ring-2 focus:ring-[#7658e8]/20 transition"
            />
          )}
        </div>

        {/* Âge */}
        <div className="flex flex-col">
          <label className="text-[11px] font-extrabold text-[#61351F] mb-[2px]">
            Mon âge :
          </label>
          {isReadOnly ? (
            <div className="px-2.5 py-1.5 rounded-[9px] bg-[#fffdfa] border border-[#ded5c9] text-xs font-semibold text-[#4d4037]">
              {age}
            </div>
          ) : (
            <input
              type="text"
              value={age}
              onChange={(e) => onUpdateField && onUpdateField("age", e.target.value)}
              className="w-full border border-[#ded5c9] rounded-[9px] bg-[#fffdfa] text-[#4d4037] px-2.5 py-1.5 text-xs outline-none focus:border-[#8d72ee] focus:ring-2 focus:ring-[#7658e8]/20 transition"
            />
          )}
        </div>

        {/* Taille */}
        <div className="flex flex-col">
          <label className="text-[11px] font-extrabold text-[#61351F] mb-[2px]">
            Ma taille :
          </label>
          {isReadOnly ? (
            <div className="px-2.5 py-1.5 rounded-[9px] bg-[#fffdfa] border border-[#ded5c9] text-xs font-semibold text-[#4d4037]">
              {height}
            </div>
          ) : (
            <input
              type="text"
              value={height}
              onChange={(e) => onUpdateField && onUpdateField("height", e.target.value)}
              className="w-full border border-[#ded5c9] rounded-[9px] bg-[#fffdfa] text-[#4d4037] px-2.5 py-1.5 text-xs outline-none focus:border-[#8d72ee] focus:ring-2 focus:ring-[#7658e8]/20 transition"
            />
          )}
        </div>

        {/* Couleur préférée avec 6 pastilles interactives */}
        <div className="flex flex-col">
          <label className="text-[11px] font-extrabold text-[#61351F] mb-[2px]">
            Ma couleur préférée :
          </label>
          <div className="flex items-center gap-2 py-1">
            {PALETTE_COLORS.map((c) => {
              const isSelected = favoriteColor === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  disabled={isReadOnly}
                  onClick={() => onUpdateField && onUpdateField("favoriteColor", c.id)}
                  className={`w-[22px] h-[22px] rounded-full transition cursor-pointer ${c.className} ${
                    isSelected
                      ? "ring-2 ring-white shadow-[0_0_0_2px_#7658E8] scale-110"
                      : "hover:scale-105"
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Plat préféré */}
        <div className="flex flex-col">
          <label className="text-[11px] font-extrabold text-[#61351F] mb-[2px]">
            Mon plat préféré :
          </label>
          {isReadOnly ? (
            <div className="px-2.5 py-1.5 rounded-[9px] bg-[#fffdfa] border border-[#ded5c9] text-xs font-semibold text-[#4d4037]">
              {favoriteFood}
            </div>
          ) : (
            <input
              type="text"
              value={favoriteFood}
              onChange={(e) => onUpdateField && onUpdateField("favoriteFood", e.target.value)}
              className="w-full border border-[#ded5c9] rounded-[9px] bg-[#fffdfa] text-[#4d4037] px-2.5 py-1.5 text-xs outline-none focus:border-[#8d72ee] focus:ring-2 focus:ring-[#7658e8]/20 transition"
            />
          )}
        </div>

        {/* Animal préféré */}
        <div className="flex flex-col">
          <label className="text-[11px] font-extrabold text-[#61351F] mb-[2px]">
            Mon animal préféré :
          </label>
          {isReadOnly ? (
            <div className="px-2.5 py-1.5 rounded-[9px] bg-[#fffdfa] border border-[#ded5c9] text-xs font-semibold text-[#4d4037]">
              {favoriteAnimal}
            </div>
          ) : (
            <input
              type="text"
              value={favoriteAnimal}
              onChange={(e) => onUpdateField && onUpdateField("favoriteAnimal", e.target.value)}
              className="w-full border border-[#ded5c9] rounded-[9px] bg-[#fffdfa] text-[#4d4037] px-2.5 py-1.5 text-xs outline-none focus:border-[#8d72ee] focus:ring-2 focus:ring-[#7658e8]/20 transition"
            />
          )}
        </div>

        {/* Plus tard je serai */}
        <div className="flex flex-col">
          <label className="text-[11px] font-extrabold text-[#61351F] mb-[2px]">
            Plus tard, je serai :
          </label>
          {isReadOnly ? (
            <div className="px-2.5 py-1.5 rounded-[9px] bg-[#fffdfa] border border-[#ded5c9] text-xs font-semibold text-[#4d4037] min-h-[44px]">
              {futureDream}
            </div>
          ) : (
            <textarea
              value={futureDream}
              onChange={(e) => onUpdateField && onUpdateField("futureDream", e.target.value)}
              rows={2}
              className="w-full border border-[#ded5c9] rounded-[9px] bg-[#fffdfa] text-[#4d4037] px-2.5 py-1.5 text-xs outline-none resize-none focus:border-[#8d72ee] focus:ring-2 focus:ring-[#7658e8]/20 transition leading-tight"
            />
          )}
        </div>
      </div>

      {/* Illustration du Baobab avec mix-blend-mode: multiply */}
      <div className="absolute right-[4%] top-[49%] w-[30%] h-[22%] pointer-events-none z-10">
        <Image
          src="/cahier-souvenirs/baobab.png"
          alt="Baobab"
          fill
          className="object-contain mix-blend-multiply"
        />
      </div>

      {/* Message "Rêve Grand !" incliné (-3deg) */}
      <div className="absolute right-[5%] top-[68%] font-baloo font-extrabold text-[24px] sm:text-[27px] leading-[0.82] text-center -rotate-3 text-[#61351F] pointer-events-none z-10">
        Rêve<br />Grand !
      </div>

      {/* Cartes Souvenirs en bas : J'adore / Je déteste */}
      <div className="absolute left-[6%] right-[6%] bottom-[12%] grid grid-cols-2 gap-3 z-10">
        {/* Carte J'adore */}
        <div className="rounded-[15px] p-3 min-h-[78px] bg-[#FBE2E7] text-[#61351F] flex flex-col justify-start shadow-xs">
          <strong className="flex items-center gap-1.5 text-xs font-bold">
            ❤️ J&apos;adore
          </strong>
          {isReadOnly ? (
            <p className="mt-1.5 text-[11px] leading-[1.35] italic font-medium">
              {love}
            </p>
          ) : (
            <textarea
              value={love}
              onChange={(e) => onUpdateField && onUpdateField("love", e.target.value)}
              rows={2}
              className="w-full mt-1 text-[11px] leading-[1.3] italic font-medium bg-transparent border-0 outline-none resize-none text-[#61351F]"
            />
          )}
        </div>

        {/* Carte Je déteste */}
        <div className="rounded-[15px] p-3 min-h-[78px] bg-[#DDEFF7] text-[#61351F] flex flex-col justify-start shadow-xs">
          <strong className="flex items-center gap-1.5 text-xs font-bold">
            🥦 Je déteste
          </strong>
          {isReadOnly ? (
            <p className="mt-1.5 text-[11px] leading-[1.35] italic font-medium">
              {hate}
            </p>
          ) : (
            <textarea
              value={hate}
              onChange={(e) => onUpdateField && onUpdateField("hate", e.target.value)}
              rows={2}
              className="w-full mt-1 text-[11px] leading-[1.3] italic font-medium bg-transparent border-0 outline-none resize-none text-[#61351F]"
            />
          )}
        </div>
      </div>

      {/* Logo Petit Baobab en bas à gauche */}
      <div className="absolute left-[5%] bottom-[4%] w-[18%] h-[6%] pointer-events-none z-10">
        <Image
          src="/cahier-souvenirs/logo.png"
          alt="Petit Baobab"
          fill
          className="object-contain object-left"
        />
      </div>

      {/* Décoration florale de pied de page en bas à droite */}
      <div className="absolute right-[4%] bottom-[3%] w-[15%] h-[5%] pointer-events-none z-10 opacity-90">
        <Image
          src="/cahier-souvenirs/bottom_deco.png"
          alt=""
          fill
          className="object-contain object-right"
        />
      </div>
    </div>
  );
};

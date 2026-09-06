"use client";

import React from "react";
import { MemoryBookPage, PhotoElementData } from "../../types/memory-book.types";
import { PhotoSlot } from "./PhotoSlot";
import { TextSlot } from "./TextSlot";
import { Sparkles, Heart, School, BookOpen, Smile, User, Users, Sun, Bookmark } from "lucide-react";

interface BookPageRendererProps {
  page: MemoryBookPage;
  totalPages: number;
  profileId: string;
  bookId: string;
  onUpdateText: (elementId: string, value: string) => void;
  onUpdatePhoto: (elementId: string, data: Partial<PhotoElementData>) => void;
  isReadOnly?: boolean;
}

const themeStyles = {
  "warm-cream": "bg-[#FFF9F2] border-amber-200/80 text-amber-950",
  "sunny-yellow": "bg-[#FFFDF0] border-yellow-200/80 text-amber-950",
  "mint-pastel": "bg-[#F2FCF8] border-emerald-200/80 text-emerald-950",
  "lavender-light": "bg-[#F8F6FF] border-purple-200/80 text-purple-950",
  "coral-soft": "bg-[#FFF6F6] border-rose-200/80 text-rose-950",
};

const headerIcons: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="w-5 h-5 text-amber-500" />,
  User: <User className="w-5 h-5 text-blue-500" />,
  Heart: <Heart className="w-5 h-5 text-rose-500" />,
  School: <School className="w-5 h-5 text-emerald-500" />,
  Smile: <Smile className="w-5 h-5 text-amber-500" />,
  BookMarked: <Bookmark className="w-5 h-5 text-purple-500" />,
  Users: <Users className="w-5 h-5 text-indigo-500" />,
  Sun: <Sun className="w-5 h-5 text-amber-500" />,
};

export const BookPageRenderer: React.FC<BookPageRendererProps> = ({
  page,
  totalPages,
  profileId,
  bookId,
  onUpdateText,
  onUpdatePhoto,
  isReadOnly = false,
}) => {
  const currentTheme = page.backgroundTheme || "warm-cream";
  const themeClass = themeStyles[currentTheme] || themeStyles["warm-cream"];

  return (
    <div
      id={`memory-page-${page.pageNumber}`}
      className={`relative w-full max-w-[650px] mx-auto rounded-[24px] md:rounded-[32px] border-4 p-5 md:p-8 shadow-xl transition-all ${themeClass} flex flex-col justify-between`}
      style={{
        minHeight: "820px",
      }}
    >
      {/* Motifs décoratifs de coins */}
      <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-purple-300 rounded-tl-md pointer-events-none" />
      <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-purple-300 rounded-tr-md pointer-events-none" />
      <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-purple-300 rounded-bl-md pointer-events-none" />
      <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-purple-300 rounded-br-md pointer-events-none" />

      {/* En-tête de la page */}
      <div className="border-b-2 border-dashed border-gray-300/70 pb-4 mb-5">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-white shadow-xs border border-gray-100">
              {headerIcons[page.headerIcon || "Sparkles"] || <Sparkles className="w-5 h-5 text-purple-500" />}
            </span>
            <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-white/90 text-purple-700 shadow-xs border border-purple-100">
              {page.categoryTag || "Souvenirs"}
            </span>
          </div>

          <span className="text-xs font-bold text-gray-500 bg-white/80 px-2.5 py-1 rounded-full shadow-2xs">
            Page {page.pageNumber} / {totalPages}
          </span>
        </div>

        <h2 className="text-xl md:text-2xl font-black tracking-tight text-gray-900 mt-2 font-display">
          {page.title}
        </h2>
        {page.subtitle && (
          <p className="text-xs md:text-sm text-gray-600 font-medium mt-0.5">{page.subtitle}</p>
        )}
      </div>

      {/* Contenu dynamique des éléments */}
      <div className="flex-1 flex flex-col gap-4 justify-start">
        {page.elements.map((element) => {
          if (element.type === "photo") {
            const isWide = page.id === "p4_classe_enseignants" || page.id === "p8_vacances_aventures";
            return (
              <div key={element.id} className="w-full my-2">
                <PhotoSlot
                  photoData={element.photoData}
                  title={element.title}
                  subtitle={element.subtitle}
                  profileId={profileId}
                  bookId={bookId}
                  elementId={element.id}
                  aspectRatio={isWide ? "landscape" : "portrait"}
                  onUpdate={(data) => onUpdatePhoto(element.id, data)}
                  isReadOnly={isReadOnly}
                />
              </div>
            );
          }

          if (element.type === "text") {
            return (
              <TextSlot
                key={element.id}
                textData={element.textData}
                title={element.title}
                elementId={element.id}
                onUpdate={(val) => onUpdateText(element.id, val)}
                isReadOnly={isReadOnly}
              />
            );
          }

          return null;
        })}
      </div>

      {/* Pied de page du cahier */}
      <div className="mt-8 pt-4 border-t border-gray-200/80 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1.5 font-semibold text-purple-800">
          <BookOpen className="w-4 h-4 text-purple-600" />
          <span>Petit Baobab — Mon Cahier de Souvenirs</span>
        </div>
        <span className="font-bold text-gray-600">— {page.pageNumber} —</span>
      </div>
    </div>
  );
};

"use client";

import React from "react";
import { MemoryBookPage } from "../../types/memory-book.types";
import {
  Sparkles,
  User,
  Heart,
  School,
  Smile,
  BookMarked,
  Users,
  Sun,
  Camera,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PageSidebarProps {
  pages: MemoryBookPage[];
  activePageIndex: number;
  onPageSelect: (index: number) => void;
}

const pageIcons: Record<string, React.ReactNode> = {
  p1_portrait: <Sparkles className="w-3.5 h-3.5" />,
  p2_tout_sur_moi: <User className="w-3.5 h-3.5" />,
  p3_reves_et_gouts: <Heart className="w-3.5 h-3.5" />,
  p4_classe_enseignants: <School className="w-3.5 h-3.5" />,
  p5_meilleurs_souvenirs: <Smile className="w-3.5 h-3.5" />,
  p6_ce_que_jai_appris: <BookMarked className="w-3.5 h-3.5" />,
  p7_camarades_mots: <Users className="w-3.5 h-3.5" />,
  p8_vacances_aventures: <Sun className="w-3.5 h-3.5" />,
  p9_secrets_mot_de_fin: <Camera className="w-3.5 h-3.5" />,
};

const themeColors: Record<string, string> = {
  "warm-cream": "bg-[#FFF9F2] border-amber-200",
  "sunny-yellow": "bg-[#FFFDF0] border-yellow-200",
  "mint-pastel": "bg-[#F2FCF8] border-emerald-200",
  "lavender-light": "bg-[#F8F6FF] border-purple-200",
  "coral-soft": "bg-[#FFF6F6] border-rose-200",
};

export const PageSidebar: React.FC<PageSidebarProps> = ({
  pages,
  activePageIndex,
  onPageSelect,
}) => {
  return (
    <div className="hidden lg:flex w-20 flex-shrink-0 flex-col gap-2 overflow-y-auto">
      <div className="text-center mb-2">
        <p className="text-[10px] font-black text-[#9c8a76] uppercase tracking-wider">Pages</p>
      </div>
      {pages.map((page, index) => {
        const isActive = index === activePageIndex;
        const icon = pageIcons[page.id] || <BookMarked className="w-3.5 h-3.5" />;
        const themeClass = themeColors[page.backgroundTheme || "warm-cream"] || themeColors["warm-cream"];

        return (
          <button
            key={page.id}
            type="button"
            onClick={() => onPageSelect(index)}
            className={cn(
              "relative w-full aspect-[3/4] rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all hover:scale-105 active:scale-95",
              isActive
                ? "border-[#7D6AF8] bg-[#7D6AF8] text-white shadow-lg scale-105"
                : `${themeClass} border-gray-200 hover:border-[#7D6AF8] hover:bg-white`
            )}
            title={page.title}
          >
            <span className={cn(
              "font-black text-sm",
              isActive ? "text-white" : "text-[#3B2416]"
            )}>
              {page.pageNumber}
            </span>
            {icon}
            {isActive && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#7D6AF8]" />
            )}
          </button>
        );
      })}

      <div className="h-px bg-gray-200 my-2" />

      <button
        type="button"
        className="w-full aspect-[3/4] rounded-xl border-2 border-dashed border-[#F0E7DA] items-center justify-center gap-1 bg-[#FFF9F2] hover:border-[#F7941D] hover:bg-[#FFF5E6] transition cursor-pointer"
        title="Aperçu PDF"
      >
        <svg className="w-6 h-6 text-[#F7941D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </button>
    </div>
  );
};

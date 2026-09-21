"use client";

import React from "react";
import Image from "next/image";
import {
  BookOpen,
  Palette,
  Backpack,
  Users,
  Star,
  Library,
  Trophy,
  TreePalm,
  MessageCircle,
  Lock,
  FileText,
} from "lucide-react";
import { useMemoryBookStore } from "../../store/memory-book-store";

type PageIcon = React.ComponentType<{ className?: string; strokeWidth?: number }>;

/**
 * Les icônes reprennent celles des maquettes (tracés filaires) plutôt que des
 * emoji : la spec §13 décrit un `icon: string` par page, mais le rendu attendu
 * est celui du design system.
 */
const PAGES_META: Array<{ title: string; Icon: PageIcon }> = [
  { title: "Ma couverture", Icon: BookOpen },
  { title: "Mon portrait", Icon: Palette },
  { title: "Mon année", Icon: Backpack },
  { title: "Mes camarades", Icon: Users },
  { title: "Mes souvenirs", Icon: Star },
  { title: "Mes livres", Icon: Library },
  { title: "Mes fiertés", Icon: Trophy },
  { title: "Mes vacances", Icon: TreePalm },
  { title: "Les petits mots", Icon: MessageCircle },
  { title: "Mes petits secrets", Icon: Lock },
];

export const Sidebar: React.FC = () => {
  const { currentBook, activePageIndex, setActivePageIndex } = useMemoryBookStore();

  const pages = currentBook?.pages_data || [];
  const totalPages = pages.length || 10;
  const progressPercent = Math.round(((activePageIndex + 1) / totalPages) * 100);

  return (
    <aside className="w-full h-full bg-[#FFFDF8]/95 border border-[#61351F]/[0.07] rounded-[20px] p-3 sm:p-4 overflow-y-auto flex flex-col shadow-xs">
      {/* Miniature de couverture */}
      <div className="mx-1 mb-3 p-2 bg-white rounded-[15px] shadow-[0_7px_22px_rgba(70,50,30,0.09)] flex justify-center cursor-pointer hover:scale-[1.01] transition"
        onClick={() => setActivePageIndex(0)}
      >
        <div className="relative w-[190px] h-[200px] sm:w-[205px] sm:h-[216px] rounded-[7px] overflow-hidden">
          <Image
            src="/cahier-souvenirs/cover.png"
            alt="Couverture du cahier"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Compteur de page et progression */}
      <div className="flex justify-between items-center text-sm font-bold text-[#61351F] px-1.5 pb-2">
        <span>Page {activePageIndex + 1} / {totalPages}</span>
        <span className="text-[#16866B]">{progressPercent}%</span>
      </div>

      {/* Barre de progression verte */}
      <div className="h-2 bg-[#eee8de] rounded-[10px] mx-1.5 mb-3.5 overflow-hidden">
        <div
          className="h-full bg-[#16866B] rounded-[10px] transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Navigation verticale des pages */}
      <nav className="flex flex-col gap-1">
        {Array.from({ length: totalPages }).map((_, index) => {
          const meta = PAGES_META[index] || { title: `Page ${index + 1}`, Icon: FileText };
          const pageTitle = pages[index]?.title || meta.title;
          const isActive = index === activePageIndex;
          const { Icon } = meta;

          return (
            <button
              key={index}
              type="button"
              onClick={() => setActivePageIndex(index)}
              className={`w-full text-left py-2.5 px-3 rounded-[12px] text-xs sm:text-sm font-bold flex items-center gap-2.5 transition duration-150 cursor-pointer ${
                isActive
                  ? "bg-[#F0EBFF] text-[#7658E8] font-extrabold"
                  : "bg-transparent text-[#61351F] hover:bg-[#F4ECE1]/60"
              }`}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={isActive ? 2.4 : 1.9} />
              <span className="truncate">
                {index + 1}. {pageTitle}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

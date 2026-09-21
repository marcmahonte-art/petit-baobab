"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BookOpen, Eye, Download, ChevronDown } from "lucide-react";
import { useMemoryBookStore } from "../../store/memory-book-store";

interface TopBarProps {
  onBack?: () => void;
  onPreview?: () => void;
  onDownloadPdf?: () => void;
  isDownloadingPdf?: boolean;
  childAvatarUrl?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  onBack,
  onPreview,
  onDownloadPdf,
  isDownloadingPdf = false,
  childAvatarUrl = "/cahier-souvenirs/child.png",
}) => {
  const { saveStatus, currentBook } = useMemoryBookStore();

  const getPillStyle = () => {
    switch (saveStatus) {
      case "Enregistrement...":
        return "bg-[#FFF0D0] text-[#C66B05] animate-pulse";
      case "Enregistré ✓":
        return "bg-[#DFF1E9] text-[#16866B]";
      case "Erreur":
      case "Hors connexion":
        return "bg-[#FBE2E7] text-[#C53030]";
      case "Brouillon":
      default:
        return "bg-[#FFF0D0] text-[#C66B05]";
    }
  };

  return (
    <header className="h-[82px] grid grid-cols-[auto_1fr_auto] lg:grid-cols-[280px_1fr_auto] items-center gap-3 md:gap-5 px-4 md:px-7 border-b border-[#61351F]/[0.08] bg-[#FFFDF8]/85 backdrop-blur-md z-30 flex-shrink-0">
      {/* Marque / Logo */}
      <div className="hidden sm:flex items-center">
        <Link href="/learn/souvenirs" className="block relative w-[174px] h-[55px]">
          <Image
            src="/cahier-souvenirs/logo.png"
            alt="Petit Baobab"
            fill
            className="object-contain object-left"
            priority
          />
        </Link>
      </div>

      {/* Titre & Bouton Retour */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        <Link
          href="/learn/souvenirs"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-bold text-[#403832] hover:text-[#61351F] transition py-1 px-2 -ml-2 rounded-xl hover:bg-black/5 flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4 flex-shrink-0" strokeWidth={2.4} />
          <span className="hidden sm:inline">Retour</span>
        </Link>

        <div className="w-[34px] h-[34px] rounded-[9px] bg-[#7658E8] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
          <BookOpen className="w-[19px] h-[19px]" strokeWidth={2.2} />
        </div>

        <div className="flex flex-col min-w-0">
          <h1 className="font-baloo text-xl sm:text-2xl lg:text-[27px] leading-tight m-0 font-extrabold text-[#61351F] truncate">
            {currentBook?.title || "Mon cahier de souvenirs"}
          </h1>
          <p className="hidden md:block m-0 mt-0.5 text-[#71675e] text-xs sm:text-sm truncate">
            Mes petits moments, mes grandes histoires ✨
          </p>
        </div>
      </div>

      {/* Actions à droite */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Statut d'enregistrement */}
        <span
          className={`h-[40px] sm:h-[44px] rounded-[14px] px-3 sm:px-4 font-bold text-xs sm:text-sm inline-flex items-center justify-center transition-colors duration-200 ${getPillStyle()}`}
        >
          {saveStatus}
        </span>

        {/* Bouton Prévisualiser */}
        <button
          type="button"
          onClick={onPreview}
          className="h-[40px] sm:h-[44px] rounded-[14px] px-3 sm:px-4 font-bold text-xs sm:text-sm bg-[#F0EBFF] text-[#7658E8] hover:bg-[#e4dcff] active:scale-95 transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
        >
          <Eye className="w-4 h-4 flex-shrink-0" strokeWidth={2.2} />
          <span className="hidden md:inline">Prévisualiser</span>
        </button>

        {/* Bouton Télécharger PDF */}
        <button
          type="button"
          onClick={onDownloadPdf}
          disabled={isDownloadingPdf}
          className="h-[40px] sm:h-[44px] rounded-[14px] px-3 sm:px-4 font-bold text-xs sm:text-sm bg-[#7658E8] hover:bg-[#6849dd] text-white shadow-[0_8px_18px_rgba(118,88,232,0.22)] active:scale-95 transition inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
        >
          <Download className="w-4 h-4 flex-shrink-0" strokeWidth={2.2} />
          <span className="hidden sm:inline">
            {isDownloadingPdf ? "Préparation..." : "Télécharger PDF"}
          </span>
        </button>

        {/* Avatar enfant */}
        <div className="relative w-[38px] h-[38px] sm:w-[44px] sm:h-[44px] rounded-full overflow-hidden border border-[#E8DED0] ml-1 flex-shrink-0 shadow-xs">
          <Image
            src={childAvatarUrl}
            alt="Profil enfant"
            fill
            className="object-cover object-top"
          />
        </div>
        <ChevronDown className="w-4 h-4 text-[#71675e] hidden lg:block flex-shrink-0" strokeWidth={2.2} />
      </div>
    </header>
  );
};

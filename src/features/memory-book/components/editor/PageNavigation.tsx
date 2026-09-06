"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Eye, CheckCircle2, Loader2, Save } from "lucide-react";
import Link from "next/link";

interface PageNavigationProps {
  currentPageIndex: number;
  totalPages: number;
  onPageSelect: (index: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onSave: () => void;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  bookId: string;
}

export const PageNavigation: React.FC<PageNavigationProps> = ({
  currentPageIndex,
  totalPages,
  onPageSelect,
  onNext,
  onPrev,
  onSave,
  isSaving,
  hasUnsavedChanges,
  bookId,
}) => {
  const isFirst = currentPageIndex === 0;
  const isLast = currentPageIndex === totalPages - 1;

  return (
    <div className="w-full max-w-[650px] mx-auto mt-6 flex flex-col gap-4">
      {/* Barre de navigation principale (Grands boutons adaptés aux enfants) */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onPrev}
          disabled={isFirst}
          className="flex-1 py-3.5 px-4 rounded-2xl bg-white border-2 border-gray-200 text-gray-700 font-bold text-sm md:text-base flex items-center justify-center gap-2 hover:bg-gray-50 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>Page Précédente</span>
        </button>

        {/* Bouton de sauvegarde manuelle ou statut auto-save */}
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving || !hasUnsavedChanges}
          className="px-4 py-3.5 rounded-2xl border-2 font-bold text-sm flex items-center gap-2 transition shadow-xs disabled:opacity-60 bg-white border-purple-200 text-purple-700 hover:bg-purple-50 active:scale-98"
          title="Sauvegarder les modifications"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              <span className="hidden sm:inline">Enregistrement...</span>
            </>
          ) : hasUnsavedChanges ? (
            <>
              <Save className="w-4 h-4 text-purple-600" />
              <span className="hidden sm:inline">Enregistrer</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline text-emerald-700">Enregistré</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={isLast}
          className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm md:text-base flex items-center justify-center gap-2 hover:from-purple-700 hover:to-indigo-700 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition"
        >
          <span>Page Suivante</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Raccourcis de sélection directe des 9 pages */}
      <div className="bg-white/90 p-3 rounded-2xl border border-purple-100 shadow-xs flex items-center justify-between gap-1.5 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalPages }).map((_, idx) => {
            const isActive = idx === currentPageIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onPageSelect(idx)}
                className={`w-9 h-9 rounded-xl font-black text-sm flex items-center justify-center transition-all ${
                  isActive
                    ? "bg-purple-600 text-white shadow-md scale-105"
                    : "bg-purple-50 text-purple-800 hover:bg-purple-100"
                }`}
                title={`Aller à la page ${idx + 1}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        <Link
          href={`/learn/souvenirs/${bookId}/apercu`}
          className="ml-2 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs md:text-sm flex items-center gap-1.5 shadow-xs whitespace-nowrap active:scale-95 transition"
        >
          <Eye className="w-4 h-4" />
          <span>Aperçu & PDF</span>
        </Link>
      </div>
    </div>
  );
};

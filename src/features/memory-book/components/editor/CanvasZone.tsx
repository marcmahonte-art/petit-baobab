"use client";

import React from "react";
import { useMemoryBookStore } from "../../store/memory-book-store";
import { getTemplateComponent } from "./templates/template-registry";

interface CanvasZoneProps {
  onRequestPhotoUpload?: () => void;
}

export const CanvasZone: React.FC<CanvasZoneProps> = ({ onRequestPhotoUpload }) => {
  const {
    currentBook,
    activePageIndex,
    setActivePageIndex,
    nextPage,
    prevPage,
    updatePageField,
  } = useMemoryBookStore();

  const pages = currentBook?.pages_data || [];
  const activePage = pages[activePageIndex] || pages[0];
  const totalPages = pages.length || 10;

  if (!activePage) {
    return (
      <section className="w-full h-full bg-[#FAF3E4]/75 rounded-[22px] flex items-center justify-center p-6">
        <p className="font-bold text-[#91877D]">Chargement du cahier de souvenirs...</p>
      </section>
    );
  }

  const TemplateComponent = getTemplateComponent(activePage.templateId);

  const handleUpdateField = (fieldKey: string, value: any) => {
    updatePageField(activePage.id, fieldKey, value);
  };

  return (
    <section className="w-full h-full min-w-0 bg-[#FAF3E4]/75 rounded-[22px] flex flex-col items-center min-h-0 overflow-y-auto p-2 sm:p-3 md:p-4">
      {/* Navigation supérieure de la page */}
      <div className="h-[46px] flex items-center gap-2.5 mb-2.5 flex-shrink-0">
        <button
          type="button"
          onClick={prevPage}
          disabled={activePageIndex === 0}
          title="Page précédente"
          className="w-[34px] h-[34px] rounded-full bg-white text-[#5e554d] text-xl font-bold flex items-center justify-center shadow-xs hover:bg-[#FAF3E4] active:scale-95 transition disabled:opacity-40 cursor-pointer border border-[#E8DED0]/40"
        >
          ‹
        </button>

        <div className="relative">
          <select
            value={activePageIndex}
            onChange={(e) => setActivePageIndex(Number(e.target.value))}
            className="h-[38px] px-4 rounded-[12px] bg-white font-extrabold text-xs sm:text-sm text-[#4b4139] shadow-xs border border-[#E8DED0]/40 outline-none cursor-pointer appearance-none pr-8 text-center"
          >
            {pages.map((p, idx) => (
              <option key={p.id || idx} value={idx}>
                Page {idx + 1} — {p.title}
              </option>
            ))}
          </select>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[#4b4139] pointer-events-none">
            ▾
          </span>
        </div>

        <button
          type="button"
          onClick={nextPage}
          disabled={activePageIndex === totalPages - 1}
          title="Page suivante"
          className="w-[34px] h-[34px] rounded-full bg-white text-[#5e554d] text-xl font-bold flex items-center justify-center shadow-xs hover:bg-[#FAF3E4] active:scale-95 transition disabled:opacity-40 cursor-pointer border border-[#E8DED0]/40"
        >
          ›
        </button>
      </div>

      {/* Feuille A4 Paper (Ratio strict 210/297) */}
      <div className="w-full flex justify-center items-start flex-1 min-h-0 pb-4">
        <article
          id="memory-book-paper"
          className="relative w-[min(595px,94%)] aspect-[210/297] bg-[#FFFDF8] shadow-[0_16px_38px_rgba(78,57,35,0.17)] rounded-[4px] overflow-hidden flex-shrink-0 transition-all duration-200"
        >
          <TemplateComponent
            page={activePage}
            isReadOnly={false}
            onUpdateField={handleUpdateField}
            onRequestPhotoUpload={onRequestPhotoUpload}
          />
        </article>
      </div>
    </section>
  );
};

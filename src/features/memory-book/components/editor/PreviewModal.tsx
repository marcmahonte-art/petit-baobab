"use client";

import React, { useState } from "react";
import { useMemoryBookStore } from "../../store/memory-book-store";
import { getTemplateComponent } from "./templates/template-registry";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadPdf: () => void;
  isDownloadingPdf?: boolean;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  onDownloadPdf,
  isDownloadingPdf = false,
}) => {
  const { currentBook, activePageIndex, setActivePageIndex, nextPage, prevPage } = useMemoryBookStore();
  const [previewZoom, setPreviewZoom] = useState<number>(1);

  if (!isOpen || !currentBook) return null;

  const pages = currentBook.pages_data || [];
  const activePage = pages[activePageIndex] || pages[0];
  const totalPages = pages.length || 10;
  const TemplateComponent = getTemplateComponent(activePage?.templateId);

  return (
    <div className="fixed inset-0 z-50 bg-[#3B2416]/70 backdrop-blur-sm flex flex-col items-center justify-between p-3 sm:p-6 overflow-hidden animate-in fade-in duration-200">
      {/* Barre d'actions supérieure */}
      <header className="w-full max-w-5xl flex items-center justify-between bg-white/95 border border-[#E8DED0] rounded-[20px] px-4 py-3 shadow-lg z-20 flex-shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#F0EBFF] hover:bg-[#e4dcff] text-[#7658E8] font-extrabold text-xs sm:text-sm transition cursor-pointer active:scale-95"
        >
          <span>←</span>
          <span>Retour à l&apos;édition</span>
        </button>

        {/* Indicateur de page au centre */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevPage}
            disabled={activePageIndex === 0}
            className="w-8 h-8 rounded-full bg-[#FAF3E4] font-bold text-sm text-[#61351F] flex items-center justify-center disabled:opacity-30 cursor-pointer hover:bg-[#f0e4d0] transition"
          >
            ‹
          </button>
          <span className="font-baloo font-bold text-sm sm:text-base text-[#61351F] px-2">
            Page {activePageIndex + 1} / {totalPages}
          </span>
          <button
            type="button"
            onClick={nextPage}
            disabled={activePageIndex === totalPages - 1}
            className="w-8 h-8 rounded-full bg-[#FAF3E4] font-bold text-sm text-[#61351F] flex items-center justify-center disabled:opacity-30 cursor-pointer hover:bg-[#f0e4d0] transition"
          >
            ›
          </button>
        </div>

        {/* Zoom & Téléchargement PDF */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 bg-[#F1EEE9] p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setPreviewZoom((z) => Math.max(0.7, z - 0.1))}
              className="px-2 py-1 rounded-lg hover:bg-white text-[#61351F] transition"
            >
              -
            </button>
            <span className="px-1 text-[#61351F]">{Math.round(previewZoom * 100)}%</span>
            <button
              type="button"
              onClick={() => setPreviewZoom((z) => Math.min(1.3, z + 0.1))}
              className="px-2 py-1 rounded-lg hover:bg-white text-[#61351F] transition"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={isDownloadingPdf}
            className="px-4 py-2 rounded-xl bg-[#7658E8] hover:bg-[#6849dd] text-white font-extrabold text-xs sm:text-sm shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <span>📥</span>
            <span>{isDownloadingPdf ? "Préparation..." : "Télécharger PDF"}</span>
          </button>
        </div>
      </header>

      {/* Page A4 épurée en plein écran */}
      <main className="w-full flex-1 flex items-center justify-center overflow-auto p-4 my-2">
        <div
          className="relative transition-transform duration-200"
          style={{ transform: `scale(${previewZoom})` }}
        >
          <article className="relative w-[min(595px,90vw)] aspect-[210/297] bg-[#FFFDF8] rounded-[6px] shadow-2xl overflow-hidden border border-[#E8DED0]/50">
            {activePage && (
              <TemplateComponent page={activePage} isReadOnly={true} />
            )}
          </article>
        </div>
      </main>

      {/* Navigation miniature en bas */}
      <footer className="w-full max-w-2xl flex items-center justify-center gap-1.5 py-1 z-20 flex-shrink-0">
        {pages.map((p, idx) => (
          <button
            key={p.id || idx}
            type="button"
            onClick={() => setActivePageIndex(idx)}
            className={`w-7 h-7 rounded-full text-xs font-extrabold transition cursor-pointer ${
              idx === activePageIndex
                ? "bg-[#7658E8] text-white shadow-md scale-110"
                : "bg-white/80 text-[#61351F] hover:bg-white"
            }`}
          >
            {idx + 1}
          </button>
        ))}
      </footer>
    </div>
  );
};

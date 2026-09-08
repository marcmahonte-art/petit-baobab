"use client";

import React, { useEffect, useCallback, useState } from "react";
import { MemoryBookRecord } from "../../types/memory-book.types";
import { useMemoryBookStore } from "../../store/memory-book-store";
import { EditorLayout } from "./EditorLayout";
import { AppShell } from "./AppShell";
import Link from "next/link";
import { ArrowLeft, BookOpen, Sparkles, Maximize2, Eye, Download } from "lucide-react";

interface MemoryBookEditorProps {
  initialBook: MemoryBookRecord;
  profileId: string;
}

export const MemoryBookEditor: React.FC<MemoryBookEditorProps> = ({
  initialBook,
  profileId,
}) => {
  const {
    currentBook,
    activePageIndex,
    isSaving,
    hasUnsavedChanges,
    setBook,
    setActivePageIndex,
    nextPage,
    prevPage,
    updateTextElement,
    updatePhotoElement,
    saveCurrentBook,
  } = useMemoryBookStore();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    try {
      setIsDownloading(true);
      const res = await fetch(`/api/memory-books/${activeBook.id}/pdf`, {
        method: "GET",
      });
      if (!res.ok) throw new Error("Erreur génération PDF");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${activeBook.title.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erreur téléchargement PDF:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    setBook(initialBook);
  }, [initialBook, setBook]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const timer = setTimeout(() => {
      saveCurrentBook();
    }, 3000);
    return () => clearTimeout(timer);
  }, [hasUnsavedChanges, saveCurrentBook]);

  const activeBook = currentBook || initialBook;
  const pages = activeBook.pages_data || [];
  const activePage = pages[activePageIndex] || pages[0];

  const handleUpdateText = useCallback(
    (elementId: string, val: string) => {
      if (!activePage) return;
      updateTextElement(activePage.id, elementId, val);
    },
    [activePage, updateTextElement]
  );

  const handleUpdatePhoto = useCallback(
    (elementId: string, data: any) => {
      if (!activePage) return;
      updatePhotoElement(activePage.id, elementId, data);
    },
    [activePage, updatePhotoElement]
  );

  if (!activePage) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500 font-bold">Chargement de ton cahier de souvenirs...</p>
      </div>
    );
  }

  return (
    <AppShell>
      {/* En-tête de l'éditeur */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          href="/learn/souvenirs"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 shadow-2xs transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-purple-600" />
          <span>Mes Cahiers</span>
        </Link>

        <div className="text-center">
          <h1 className="text-lg md:text-xl font-black text-gray-900 flex items-center justify-center gap-1.5">
            <BookOpen className="w-5 h-5 text-purple-600" />
            <span>{activeBook.title}</span>
          </h1>
          <p className="text-xs text-gray-500 font-medium">Année {activeBook.school_year}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Bouton Plein écran */}
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="px-3 py-2.5 rounded-2xl bg-white border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 shadow-2xs transition active:scale-95"
            title="Prévisualisation plein écran"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Bouton Télécharger PDF */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="px-3 py-2.5 rounded-2xl bg-white border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 shadow-2xs transition active:scale-95 disabled:opacity-50"
            title="Télécharger en PDF"
          >
            <Download className="w-4 h-4 text-green-600" />
          </button>

          {/* Bouton Aperçu PDF */}
          <Link
            href={`/learn/souvenirs/${activeBook.id}/apercu`}
            className="px-3 py-2.5 rounded-2xl bg-white border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 shadow-2xs transition active:scale-95"
            title="Aperçu PDF"
          >
            <Eye className="w-4 h-4" />
          </Link>

          {/* Bouton Prévisualiser */}
          <Link
            href={`/learn/souvenirs/${activeBook.id}/apercu`}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-xs hover:from-purple-700 hover:to-indigo-700 transition active:scale-95 flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">Prévisualiser</span>
          </Link>
        </div>
      </div>

      {/* Mode plein écran */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-[#F3EDE4] overflow-y-auto">
          <div className="sticky top-0 bg-[#F3EDE4] p-4 flex items-center justify-end gap-3 z-10">
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="px-4 py-2 rounded-2xl bg-white border border-gray-200 font-bold text-sm hover:bg-gray-50 transition"
            >
              ✕ Fermer
            </button>
          </div>
          <div className="flex justify-center pb-8">
            <div className="w-full max-w-[800px] px-4">
              {pages.map((page, idx) => (
                <div key={page.id} className="mb-8">
                  {/* Mini rendu de chaque page en plein écran */}
                  <div className="relative w-full rounded-[32px] border-4 bg-[#FFF9F2] shadow-xl p-6 md:p-10">
                    <div className="text-center mb-4">
                      <span className="text-xs font-bold text-gray-500 bg-white/80 px-2.5 py-1 rounded-full">
                        Page {page.pageNumber} / {pages.length}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black tracking-tight text-gray-900 mb-2">{page.title}</h2>
                    {page.subtitle && (
                      <p className="text-sm text-gray-600 mb-4">{page.subtitle}</p>
                    )}
                    <div className="flex flex-col gap-3">
                      {page.elements.map((el) => {
                        if (el.type === "photo" && el.photoData?.url) {
                          return (
                            <img
                              key={el.id}
                              src={el.photoData.url}
                              alt={el.title || "Photo"}
                              className="w-full max-w-[500px] mx-auto rounded-xl object-cover"
                              style={{
                                transform: `scale(${el.photoData.zoom || 1}) rotate(${el.photoData.rotation || 0}deg)`,
                              }}
                            />
                          );
                        }
                        if (el.type === "text" && el.textData?.value) {
                          return (
                            <p key={el.id} className="text-lg font-bold text-gray-800">
                              {el.textData.value}
                            </p>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Layout 3 colonnes : Sidebar + Canvas + Inspector */}
      <div className="w-full flex justify-center">
        <EditorLayout
          activePage={activePage}
          pages={pages}
          totalPages={pages.length}
          profileId={profileId}
          bookId={activeBook.id}
          isSaving={isSaving}
          hasUnsavedChanges={hasUnsavedChanges}
          onSave={saveCurrentBook}
          onNext={nextPage}
          onPrev={prevPage}
          onPageSelect={setActivePageIndex}
        />
      </div>
    </AppShell>
  );
};

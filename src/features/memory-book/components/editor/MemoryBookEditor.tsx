"use client";

import React, { useEffect, useCallback } from "react";
import { MemoryBookRecord } from "../../types/memory-book.types";
import { useMemoryBookStore } from "../../store/memory-book-store";
import { BookPageRenderer } from "./BookPageRenderer";
import { PageNavigation } from "./PageNavigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Sparkles } from "lucide-react";

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

  // Initialisation du cahier dans le store
  useEffect(() => {
    setBook(initialBook);
  }, [initialBook, setBook]);

  // Sauvegarde automatique (Debounce de 3 secondes dès qu'il y a un changement)
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
    <div className="w-full max-w-4xl mx-auto px-4 py-4 md:py-6">
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

        <Link
          href={`/learn/souvenirs/${activeBook.id}/apercu`}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm shadow-xs hover:from-purple-700 hover:to-indigo-700 transition active:scale-95 flex items-center gap-1.5"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span className="hidden sm:inline">Prévisualiser</span>
          <span className="sm:hidden">Aperçu</span>
        </Link>
      </div>

      {/* Rendu de la page active du cahier */}
      <div className="w-full flex justify-center">
        <BookPageRenderer
          page={activePage}
          totalPages={pages.length}
          profileId={profileId}
          bookId={activeBook.id}
          onUpdateText={handleUpdateText}
          onUpdatePhoto={handleUpdatePhoto}
        />
      </div>

      {/* Barre de navigation et contrôles sous le cahier */}
      <PageNavigation
        currentPageIndex={activePageIndex}
        totalPages={pages.length}
        onPageSelect={setActivePageIndex}
        onNext={nextPage}
        onPrev={prevPage}
        onSave={saveCurrentBook}
        isSaving={isSaving}
        hasUnsavedChanges={hasUnsavedChanges}
        bookId={activeBook.id}
      />
    </div>
  );
};

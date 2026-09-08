"use client";

import React, { useState } from "react";
import { MemoryBookPage } from "../../types/memory-book.types";
import { useMemoryBookStore } from "../../store/memory-book-store";
import { BookPageRenderer } from "./BookPageRenderer";
import { PageNavigation } from "./PageNavigation";
import { PageSidebar } from "./PageSidebar";
import {
  LayoutDashboard,
  Palette,
  Settings,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EditorLayoutProps {
  activePage: MemoryBookPage;
  pages: MemoryBookPage[];
  totalPages: number;
  profileId: string;
  bookId: string;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  onSave: () => void;
  onNext: () => void;
  onPrev: () => void;
  onPageSelect: (index: number) => void;
}

const inspectorTabs = [
  { id: "edit", label: "Éditer", icon: LayoutDashboard },
  { id: "theme", label: "Thème", icon: Palette },
  { id: "settings", label: "Paramètres", icon: Settings },
] as const;

export function EditorLayout({
  activePage,
  pages,
  totalPages,
  profileId,
  bookId,
  isSaving,
  hasUnsavedChanges,
  onSave,
  onNext,
  onPrev,
  onPageSelect,
}: EditorLayoutProps) {
  const [activeInspectorTab, setActiveInspectorTab] = useState("edit");
  const { updateTextElement, updatePhotoElement, activePageIndex } = useMemoryBookStore();

  const handleUpdateText = (elementId: string, value: string) => {
    updateTextElement(activePage.id, elementId, value);
  };

  const handleUpdatePhoto = (elementId: string, data: any) => {
    updatePhotoElement(activePage.id, elementId, data);
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-4 pb-20 lg:pb-0">
      {/* Sidebar navigation pages (desktop) */}
      <PageSidebar
        pages={pages}
        activePageIndex={activePageIndex}
        onPageSelect={onPageSelect}
      />

      {/* Canvas principal */}
      <div className="flex-1 flex flex-col items-center min-w-0">
        <div className="w-full flex justify-center">
          <BookPageRenderer
            page={activePage}
            totalPages={totalPages}
            profileId={profileId}
            bookId={bookId}
            onUpdateText={handleUpdateText}
            onUpdatePhoto={handleUpdatePhoto}
          />
        </div>
        <div className="w-full flex justify-center mt-4">
          <PageNavigation
            currentPageIndex={activePageIndex}
            totalPages={totalPages}
            onPageSelect={onPageSelect}
            onNext={onNext}
            onPrev={onPrev}
            onSave={onSave}
            isSaving={isSaving}
            hasUnsavedChanges={hasUnsavedChanges}
            bookId={bookId}
          />
        </div>
      </div>

      {/* Inspector latéral (desktop) */}
      <div className="hidden lg:block w-full lg:w-80 flex-shrink-0">
        <div className="sticky top-24 bg-white rounded-2xl border border-[#F0E7DA] shadow-xs overflow-hidden">
          <div className="flex border-b border-[#F0E7DA] bg-[#FFF9F2]">
            {inspectorTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeInspectorTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveInspectorTab(tab.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold transition",
                    isActive
                      ? "text-[#7D6AF8] border-b-2 border-[#7D6AF8] bg-white"
                      : "text-[#9c8a76] hover:text-[#3B2416]"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                  {tab.id === "settings" && (
                    <ChevronRight className="w-3 h-3 ml-1" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-4 max-h-[60vh] overflow-y-auto">
            {activeInspectorTab === "edit" && (
              <div className="flex flex-col gap-4">
                <div>
                  <label className="font-bold text-xs text-[#3B2416] uppercase tracking-wider mb-1.5 block">
                    Titre de la page
                  </label>
                  <p className="text-sm text-[#6F604F]">{activePage.title}</p>
                </div>
                <div>
                  <label className="font-bold text-xs text-[#3B2416] uppercase tracking-wider mb-1.5 block">
                    Sous-titre
                  </label>
                  <p className="text-sm text-[#6F604F]">
                    {activePage.subtitle || "—"}
                  </p>
                </div>
                <div>
                  <label className="font-bold text-xs text-[#3B2416] uppercase tracking-wider mb-1.5 block">
                    Éléments ({activePage.elements.length})
                  </label>
                  <div className="flex flex-col gap-1.5">
                    {activePage.elements.map((el) => (
                      <div
                        key={el.id}
                        className="flex items-center gap-2 p-2 rounded-xl bg-[#FFF9F2] border border-[#F0E7DA] text-xs"
                      >
                        <span className="font-bold text-[#7D6AF8]">
                          {el.type === "photo" ? "📷" : "✏️"}
                        </span>
                        <span className="text-[#3B2416] flex-1 truncate">
                          {el.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeInspectorTab === "theme" && (
              <div className="flex flex-col gap-3">
                <p className="text-sm font-bold text-[#3B2416] mb-2">Thème de fond</p>
                {["warm-cream", "sunny-yellow", "mint-pastel", "lavender-light", "coral-soft"].map((theme) => (
                  <button
                    key={theme}
                    type="button"
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-xs font-bold transition",
                      activePage.backgroundTheme === theme
                        ? "border-[#7D6AF8] bg-[#FFF9F2] text-[#7D6AF8]"
                        : "border-[#F0E7DA] text-[#6F604F] hover:border-[#7D6AF8]"
                    )}
                  >
                    <span
                      className={cn(
                        "w-4 h-4 rounded-full border border-gray-300",
                        theme === "warm-cream" && "bg-[#FFF9F2]",
                        theme === "sunny-yellow" && "bg-[#FFFDF0]",
                        theme === "mint-pastel" && "bg-[#F2FCF8]",
                        theme === "lavender-light" && "bg-[#F8F6FF]",
                        theme === "coral-soft" && "bg-[#FFF6F6]"
                      )}
                    />
                    {theme}
                  </button>
                ))}
              </div>
            )}

            {activeInspectorTab === "settings" && (
              <div className="flex flex-col gap-3">
                <div className="p-3 rounded-xl bg-[#FFF9F2] border border-[#F0E7DA]">
                  <p className="text-xs font-bold text-[#3B2416] mb-1">Page {activePage.pageNumber} / {totalPages}</p>
                  <p className="text-[11px] text-[#6F604F]">{activePage.categoryTag}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#FFF9F2] border border-[#F0E7DA]">
                  <p className="text-xs font-bold text-[#3B2416] mb-1">Nombre d&apos;éléments</p>
                  <p className="text-[11px] text-[#6F604F]">{activePage.elements.length} éléments</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { create } from "zustand";
import { MemoryBookRecord, PhotoElementData } from "../types/memory-book.types";
import { memoryBookService } from "../services/memoryBookService";

interface MemoryBookState {
  currentBook: MemoryBookRecord | null;
  activePageIndex: number;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  lastSavedAt: Date | null;

  // Actions
  setBook: (book: MemoryBookRecord) => void;
  setActivePageIndex: (index: number) => void;
  nextPage: () => void;
  prevPage: () => void;

  updateTextElement: (pageId: string, elementId: string, value: string) => void;
  updatePhotoElement: (pageId: string, elementId: string, photoData: Partial<PhotoElementData>) => void;
  saveCurrentBook: () => Promise<void>;
}

export const useMemoryBookStore = create<MemoryBookState>((set, get) => ({
  currentBook: null,
  activePageIndex: 0,
  isSaving: false,
  hasUnsavedChanges: false,
  lastSavedAt: null,

  setBook: (book) => set({ currentBook: book, activePageIndex: 0, hasUnsavedChanges: false }),

  setActivePageIndex: (index) => {
    const { currentBook } = get();
    if (!currentBook) return;
    const max = currentBook.pages_data.length - 1;
    const clamped = Math.max(0, Math.min(index, max));
    set({ activePageIndex: clamped });
  },

  nextPage: () => {
    const { currentBook, activePageIndex } = get();
    if (!currentBook) return;
    if (activePageIndex < currentBook.pages_data.length - 1) {
      set({ activePageIndex: activePageIndex + 1 });
    }
  },

  prevPage: () => {
    const { activePageIndex } = get();
    if (activePageIndex > 0) {
      set({ activePageIndex: activePageIndex - 1 });
    }
  },

  updateTextElement: (pageId, elementId, value) => {
    const { currentBook } = get();
    if (!currentBook) return;

    const newPages = currentBook.pages_data.map((page) => {
      if (page.id !== pageId) return page;
      return {
        ...page,
        elements: page.elements.map((el) => {
          if (el.id !== elementId) return el;
          return {
            ...el,
            textData: {
              ...el.textData,
              value,
            },
          };
        }),
      };
    });

    set({
      currentBook: {
        ...currentBook,
        pages_data: newPages,
      },
      hasUnsavedChanges: true,
    });
  },

  updatePhotoElement: (pageId, elementId, photoUpdates) => {
    const { currentBook } = get();
    if (!currentBook) return;

    const newPages = currentBook.pages_data.map((page) => {
      if (page.id !== pageId) return page;
      return {
        ...page,
        elements: page.elements.map((el) => {
          if (el.id !== elementId) return el;
          return {
            ...el,
            photoData: {
              zoom: 1,
              offsetX: 0,
              offsetY: 0,
              ...el.photoData,
              ...photoUpdates,
            },
          };
        }),
      };
    });

    set({
      currentBook: {
        ...currentBook,
        pages_data: newPages,
      },
      hasUnsavedChanges: true,
    });
  },

  saveCurrentBook: async () => {
    const { currentBook, isSaving, hasUnsavedChanges } = get();
    if (!currentBook || isSaving || !hasUnsavedChanges) return;

    set({ isSaving: true });
    try {
      const updated = await memoryBookService.updateBook(currentBook.id, {
        pages_data: currentBook.pages_data,
        status: "in_progress",
      });
      set({
        currentBook: updated,
        hasUnsavedChanges: false,
        lastSavedAt: new Date(),
      });
    } catch (e) {
      console.error("Erreur d'enregistrement du cahier", e);
    } finally {
      set({ isSaving: false });
    }
  },
}));

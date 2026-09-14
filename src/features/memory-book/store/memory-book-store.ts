import { create } from "zustand";
import { MemoryBookRecord, PhotoElementData, PhotoTransform } from "../types/memory-book.types";
import { memoryBookService } from "../services/memoryBookService";

export type SaveStatusLabel = "Brouillon" | "Enregistrement..." | "Enregistré ✓" | "Erreur" | "Hors connexion";

interface MemoryBookState {
  currentBook: MemoryBookRecord | null;
  activePageIndex: number;
  isSaving: boolean;
  saveStatus: SaveStatusLabel;
  hasUnsavedChanges: boolean;
  lastSavedAt: Date | null;
  activeTab: "edit" | "theme" | "settings";
  previewOpen: boolean;

  // Actions
  setBook: (book: MemoryBookRecord) => void;
  setActivePageIndex: (index: number) => void;
  setActiveTab: (tab: "edit" | "theme" | "settings") => void;
  setPreviewOpen: (open: boolean) => void;
  nextPage: () => void;
  prevPage: () => void;

  updatePageField: (pageId: string, fieldKey: string, value: any) => void;
  updatePagePhoto: (pageId: string, photoUrl: string | null) => void;
  updatePagePhotoTransform: (
    pageId: string,
    transform: { zoom?: number; rotation?: number; offsetX?: number; offsetY?: number }
  ) => void;
  removePagePhoto: (pageId: string) => void;
  setBookTheme: (themeId: string) => void;

  // Legacy element actions for backward compatibility
  updateTextElement: (pageId: string, elementId: string, value: string) => void;
  updatePhotoElement: (pageId: string, elementId: string, photoData: Partial<PhotoElementData>) => void;

  saveCurrentBook: () => Promise<void>;
  scheduleAutoSave: () => void;
}

let autoSaveTimer: NodeJS.Timeout | null = null;

export const useMemoryBookStore = create<MemoryBookState>((set, get) => ({
  currentBook: null,
  activePageIndex: 0,
  isSaving: false,
  saveStatus: "Brouillon",
  hasUnsavedChanges: false,
  lastSavedAt: null,
  activeTab: "edit",
  previewOpen: false,

  setBook: (book) => {
    // Initialiser currentPage si renseigné dans le book
    const initialIndex = book.current_page !== undefined ? book.current_page : 0;
    const clampedIndex = Math.max(0, Math.min(initialIndex, (book.pages_data?.length || 1) - 1));
    set({
      currentBook: book,
      activePageIndex: clampedIndex,
      hasUnsavedChanges: false,
      saveStatus: "Brouillon",
    });
  },

  setActivePageIndex: (index) => {
    const { currentBook } = get();
    if (!currentBook) return;
    const max = (currentBook.pages_data?.length || 1) - 1;
    const clamped = Math.max(0, Math.min(index, max));
    set({ activePageIndex: clamped });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setPreviewOpen: (open) => set({ previewOpen: open }),

  nextPage: () => {
    const { currentBook, activePageIndex } = get();
    if (!currentBook) return;
    if (activePageIndex < (currentBook.pages_data?.length || 1) - 1) {
      set({ activePageIndex: activePageIndex + 1 });
    }
  },

  prevPage: () => {
    const { activePageIndex } = get();
    if (activePageIndex > 0) {
      set({ activePageIndex: activePageIndex - 1 });
    }
  },

  updatePageField: (pageId, fieldKey, value) => {
    const { currentBook, scheduleAutoSave } = get();
    if (!currentBook) return;

    const newPages = currentBook.pages_data.map((page) => {
      if (page.id !== pageId) return page;
      const currentData = page.data || {};
      return {
        ...page,
        data: {
          ...currentData,
          [fieldKey]: value,
        },
      };
    });

    set({
      currentBook: {
        ...currentBook,
        pages_data: newPages,
      },
      hasUnsavedChanges: true,
    });

    scheduleAutoSave();
  },

  updatePagePhoto: (pageId, photoUrl) => {
    const { currentBook, scheduleAutoSave } = get();
    if (!currentBook) return;

    const newPages = currentBook.pages_data.map((page) => {
      if (page.id !== pageId) return page;
      const currentData = page.data || {};
      return {
        ...page,
        data: {
          ...currentData,
          photoUrl: photoUrl || "",
        },
      };
    });

    set({
      currentBook: {
        ...currentBook,
        pages_data: newPages,
      },
      hasUnsavedChanges: true,
    });

    scheduleAutoSave();
  },

  updatePagePhotoTransform: (pageId, transform) => {
    const { currentBook, scheduleAutoSave } = get();
    if (!currentBook) return;

    const newPages = currentBook.pages_data.map((page) => {
      if (page.id !== pageId) return page;
      const currentData = page.data || {};
      const newZoom = transform.zoom !== undefined ? transform.zoom : (currentData.zoom ?? 1);
      const newRotation = transform.rotation !== undefined ? transform.rotation : (currentData.rotation ?? 0);
      const newOffsetX = transform.offsetX !== undefined ? transform.offsetX : (currentData.offsetX ?? 0);
      const newOffsetY = transform.offsetY !== undefined ? transform.offsetY : (currentData.offsetY ?? 0);

      return {
        ...page,
        data: {
          ...currentData,
          zoom: newZoom,
          rotation: newRotation,
          offsetX: newOffsetX,
          offsetY: newOffsetY,
        },
      };
    });

    set({
      currentBook: {
        ...currentBook,
        pages_data: newPages,
      },
      hasUnsavedChanges: true,
    });

    scheduleAutoSave();
  },

  removePagePhoto: (pageId) => {
    const { currentBook, scheduleAutoSave } = get();
    if (!currentBook) return;

    const newPages = currentBook.pages_data.map((page) => {
      if (page.id !== pageId) return page;
      const currentData = page.data || {};
      return {
        ...page,
        data: {
          ...currentData,
          photoUrl: "",
        },
      };
    });

    set({
      currentBook: {
        ...currentBook,
        pages_data: newPages,
      },
      hasUnsavedChanges: true,
    });

    scheduleAutoSave();
  },

  setBookTheme: (themeId) => {
    const { currentBook, scheduleAutoSave } = get();
    if (!currentBook) return;

    set({
      currentBook: {
        ...currentBook,
        theme: themeId,
        themeId: themeId,
      },
      hasUnsavedChanges: true,
    });

    scheduleAutoSave();
  },

  // Rétrocompatibilité text elements
  updateTextElement: (pageId, elementId, value) => {
    const { currentBook, scheduleAutoSave } = get();
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

    scheduleAutoSave();
  },

  // Rétrocompatibilité photo elements
  updatePhotoElement: (pageId, elementId, photoUpdates) => {
    const { currentBook, scheduleAutoSave } = get();
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

    scheduleAutoSave();
  },

  scheduleAutoSave: () => {
    set({ saveStatus: "Enregistrement..." });
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    autoSaveTimer = setTimeout(() => {
      void get().saveCurrentBook();
    }, 900);
  },

  saveCurrentBook: async () => {
    const { currentBook, isSaving, hasUnsavedChanges } = get();
    if (!currentBook || isSaving) return;

    try {
      set({ isSaving: true, saveStatus: "Enregistrement..." });

      await memoryBookService.updateBook(currentBook.id, {
        pages_data: currentBook.pages_data,
        title: currentBook.title,
        school_year: currentBook.school_year,
        theme: currentBook.theme,
        status: currentBook.status || "in_progress",
        current_page: get().activePageIndex,
      });

      set({
        isSaving: false,
        hasUnsavedChanges: false,
        lastSavedAt: new Date(),
        saveStatus: "Enregistré ✓",
      });

      // Remettre "Brouillon" ou état au bout de 2.5s
      setTimeout(() => {
        if (!get().hasUnsavedChanges && get().saveStatus === "Enregistré ✓") {
          set({ saveStatus: "Enregistré ✓" });
        }
      }, 2500);
    } catch (err) {
      console.error("Erreur sauvegarde du cahier:", err);
      set({
        isSaving: false,
        saveStatus: navigator.onLine ? "Erreur" : "Hors connexion",
      });
    }
  },
}));

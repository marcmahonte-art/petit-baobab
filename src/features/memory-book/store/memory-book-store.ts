import { create } from "zustand";
import { MemoryBookRecord, PhotoElementData } from "../types/memory-book.types";
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

/**
 * Dernier état réellement persisté (spec §42 : « ne sauvegarder que les données
 * modifiées »). On compare l'état courant à cet instantané pour ne transmettre
 * que les colonnes qui ont changé, et pour ne rien transmettre du tout quand
 * rien n'a bougé.
 */
interface SavedSnapshot {
  title: string;
  theme: string;
  school_year: string;
  status: string;
  current_page: number;
  pages_data: string;
}

let savedSnapshot: SavedSnapshot | null = null;

function takeSnapshot(book: MemoryBookRecord, activePageIndex: number): SavedSnapshot {
  return {
    title: book.title ?? "",
    theme: book.theme ?? "",
    school_year: book.school_year ?? "",
    status: book.status ?? "",
    current_page: activePageIndex,
    // `pages_data` est une colonne JSONB unique : la comparaison porte donc sur
    // la sérialisation complète. Un enregistrement par page demanderait une
    // table dédiée (migration), hors périmètre ici.
    pages_data: JSON.stringify(book.pages_data ?? []),
  };
}

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
    savedSnapshot = takeSnapshot(book, clampedIndex);
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
    const { currentBook, isSaving, hasUnsavedChanges, activePageIndex } = get();
    if (!currentBook || isSaving) return;

    // Rien n'a bougé depuis la dernière écriture : inutile de solliciter le réseau.
    if (!hasUnsavedChanges) {
      set({ saveStatus: "Enregistré ✓" });
      return;
    }

    const current = takeSnapshot(currentBook, activePageIndex);
    const previous = savedSnapshot;

    // On ne transmet que les colonnes dont la valeur diffère réellement.
    const payload: Partial<MemoryBookRecord> = {};
    if (!previous || previous.pages_data !== current.pages_data) {
      payload.pages_data = currentBook.pages_data;
    }
    if (!previous || previous.title !== current.title) payload.title = currentBook.title;
    if (!previous || previous.theme !== current.theme) payload.theme = currentBook.theme;
    if (!previous || previous.school_year !== current.school_year) payload.school_year = currentBook.school_year;
    if (!previous || previous.status !== current.status) payload.status = currentBook.status || "in_progress";
    // `current_page` n'est volontairement pas transmis : la table memory_books
    // ne possède pas cette colonne (voir supabase/migrations/24_memory_books.sql),
    // et l'envoyer faisait échouer toute la requête PostgREST — donc toute la
    // sauvegarde — sans que l'erreur remonte. La page courante reste un état
    // local tant qu'une colonne dédiée n'est pas ajoutée en base.

    if (Object.keys(payload).length === 0) {
      savedSnapshot = current;
      set({ hasUnsavedChanges: false, saveStatus: "Enregistré ✓" });
      return;
    }

    try {
      set({ isSaving: true, saveStatus: "Enregistrement..." });

      await memoryBookService.updateBook(currentBook.id, payload);

      savedSnapshot = current;
      set({
        isSaving: false,
        hasUnsavedChanges: false,
        lastSavedAt: new Date(),
        saveStatus: "Enregistré ✓",
      });
    } catch (err) {
      console.error("Erreur sauvegarde du cahier:", err);
      set({
        isSaving: false,
        saveStatus: navigator.onLine ? "Erreur" : "Hors connexion",
      });
    }
  },
}));

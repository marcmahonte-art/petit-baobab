import { supabase } from "@/lib/supabaseClient";
import { MemoryBookRecord, MemoryBookPage } from "../types/memory-book.types";
import { SCHOOL_MEMORY_BOOK_TEMPLATE_V1 } from "../constants/default-templates";

const LOCAL_STORAGE_KEY = "petit_baobab_memory_books_cache";

function getLocalBooks(): MemoryBookRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn("Erreur lecture cache local des cahiers", e);
    return [];
  }
}

function saveLocalBooks(books: MemoryBookRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(books));
  } catch (e) {
    console.warn("Erreur écriture cache local des cahiers", e);
  }
}

export const memoryBookService = {
  /**
   * Récupère tous les cahiers de souvenirs du profil enfant actif
   */
  async listByProfile(profileId?: string): Promise<MemoryBookRecord[]> {
    let remoteBooks: MemoryBookRecord[] = [];

    try {
      let query = supabase
        .from("memory_books")
        .select("*")
        .order("updated_at", { ascending: false });

      if (profileId) {
        query = query.eq("profile_id", profileId);
      }

      const { data, error } = await query;
      if (!error && data) {
        remoteBooks = data as MemoryBookRecord[];
      }
    } catch (err) {
      console.warn("Supabase indisponible pour memory_books, utilisation du cache local:", err);
    }

    // Réconciliation avec le cache local
    const localBooks = getLocalBooks();
    const map = new Map<string, MemoryBookRecord>();

    // Insérer les distants d'abord
    remoteBooks.forEach((b) => map.set(b.id, b));

    // Insérer les locaux si absents ou plus récents
    localBooks.forEach((lb) => {
      const existing = map.get(lb.id);
      if (!existing || new Date(lb.updated_at) > new Date(existing.updated_at)) {
        if (!profileId || lb.profile_id === profileId) {
          map.set(lb.id, lb);
        }
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  },

  /**
   * Récupère un cahier de souvenirs par son ID
   */
  async getById(id: string): Promise<MemoryBookRecord | null> {
    try {
      const { data, error } = await supabase
        .from("memory_books")
        .select("*")
        .eq("id", id)
        .single();

      if (!error && data) {
        return data as MemoryBookRecord;
      }
    } catch (e) {
      console.warn("Lecture distante échouée, recherche en local pour", id);
    }

    // Fallback local
    const localList = getLocalBooks();
    return localList.find((b) => b.id === id) || null;
  },

  /**
   * Crée un nouveau cahier de souvenirs à partir d'un modèle
   */
  async createBook(params: {
    profileId: string;
    templateId?: string;
    title?: string;
    schoolYear?: string;
  }): Promise<MemoryBookRecord> {
    const template = SCHOOL_MEMORY_BOOK_TEMPLATE_V1;
    const now = new Date().toISOString();
    const newId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `mb_${Date.now()}`;

    // Copie profonde des pages du modèle par défaut pour isoler les modifications
    const initialPages: MemoryBookPage[] = JSON.parse(JSON.stringify(template.pages));

    const newRecord: MemoryBookRecord = {
      id: newId,
      profile_id: params.profileId,
      template_id: params.templateId || template.id,
      title: params.title || template.title,
      school_year: params.schoolYear || "2025 - 2026",
      theme: "savane",
      status: "draft",
      cover_color: "#7D6AF8",
      pages_data: initialPages,
      thumbnail_url: template.previewThumbnail,
      created_at: now,
      updated_at: now,
    };

    // 1. Sauvegarde locale immédiate
    const currentLocals = getLocalBooks();
    saveLocalBooks([newRecord, ...currentLocals.filter((b) => b.id !== newId)]);

    // 2. Persistance Supabase (silencieuse en cas d'erreur réseau)
    try {
      const { data, error } = await supabase
        .from("memory_books")
        .insert({
          id: newRecord.id,
          profile_id: newRecord.profile_id,
          template_id: newRecord.template_id,
          title: newRecord.title,
          school_year: newRecord.school_year,
          theme: newRecord.theme,
          status: newRecord.status,
          cover_color: newRecord.cover_color,
          pages_data: newRecord.pages_data,
          thumbnail_url: newRecord.thumbnail_url,
          created_at: newRecord.created_at,
          updated_at: newRecord.updated_at,
        })
        .select()
        .single();

      if (!error && data) {
        return data as MemoryBookRecord;
      }
    } catch (e) {
      console.warn("Sauvegarde distante différée (offline/fallback local actif)");
    }

    return newRecord;
  },

  /**
   * Met à jour le contenu d'un cahier (pages, statut, titre, etc.)
   */
  async updateBook(id: string, updates: Partial<MemoryBookRecord>): Promise<MemoryBookRecord> {
    const now = new Date().toISOString();
    const payload = {
      ...updates,
      updated_at: now,
    };

    // 1. Mise à jour cache local
    const locals = getLocalBooks();
    const index = locals.findIndex((b) => b.id === id);
    let updatedRecord: MemoryBookRecord;

    if (index !== -1) {
      updatedRecord = { ...locals[index], ...payload };
      locals[index] = updatedRecord;
      saveLocalBooks(locals);
    } else {
      updatedRecord = payload as MemoryBookRecord;
    }

    // 2. Sync Supabase
    try {
      const { data, error } = await supabase
        .from("memory_books")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (!error && data) {
        return data as MemoryBookRecord;
      }
    } catch (e) {
      console.warn("Sync update Supabase en attente/échouée");
    }

    return updatedRecord;
  },

  /**
   * Supprime un cahier de souvenirs
   */
  async deleteBook(id: string): Promise<boolean> {
    // 1. Suppression locale
    const locals = getLocalBooks();
    saveLocalBooks(locals.filter((b) => b.id !== id));

    // 2. Suppression Supabase
    try {
      await supabase.from("memory_books").delete().eq("id", id);
      return true;
    } catch (e) {
      console.warn("Erreur suppression distante Supabase", e);
      return true;
    }
  },
};

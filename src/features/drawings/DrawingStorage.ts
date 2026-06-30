import type { SavedDrawing } from "@/features/drawings/types"
import { supabase } from "@/lib/supabaseClient"
import { storageService } from "@/lib/storageService"

const STORAGE_KEY = "petit-baobab.saved-drawings.v1"
const DB_NAME = "petit-baobab-db"
const DB_VERSION = 1
const STORE_NAME = "drawings"

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export interface DrawingStorage {
  list(): Promise<SavedDrawing[]>
  save(drawing: SavedDrawing): Promise<SavedDrawing>
  rename(id: string, name: string): Promise<SavedDrawing | null>
  delete(id: string): Promise<void>
}

export class LocalDrawingStorage implements DrawingStorage {
  async list(): Promise<SavedDrawing[]> {
    if (typeof window === "undefined") return []

    try {
      const db = await getDB()
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readonly")
        const store = transaction.objectStore(STORE_NAME)
        const request = store.getAll()

        request.onsuccess = () => {
          const list = request.result as SavedDrawing[]
          list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          resolve(list)
        }
        request.onerror = () => reject(request.error)
      })
    } catch (e) {
      console.error("IndexedDB list failed, falling back to localStorage:", e)
      return this.localStorageList()
    }
  }

  async save(drawing: SavedDrawing): Promise<SavedDrawing> {
    if (typeof window === "undefined") return drawing

    try {
      const db = await getDB()
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite")
        const store = transaction.objectStore(STORE_NAME)
        const request = store.put(drawing)

        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
      
      // Also try to mirror in localStorage as backup, ignore quota warnings
      try {
        this.localStorageSave(drawing)
      } catch {
        // Safe to ignore if localStorage quota is exceeded, as IndexedDB succeeded
      }
      return drawing
    } catch (e) {
      console.error("IndexedDB save failed, falling back to localStorage:", e)
      return this.localStorageSave(drawing)
    }
  }

  async rename(id: string, name: string): Promise<SavedDrawing | null> {
    const drawings = await this.list()
    const found = drawings.find((d) => d.id === id)
    if (!found) return null

    const updated = {
      ...found,
      name,
      updatedAt: new Date().toISOString(),
    }

    await this.save(updated)
    return updated
  }

  async delete(id: string): Promise<void> {
    if (typeof window === "undefined") return

    try {
      const db = await getDB()
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite")
        const store = transaction.objectStore(STORE_NAME)
        const request = store.delete(id)

        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
      this.localStorageDelete(id)
    } catch (e) {
      console.error("IndexedDB delete failed, falling back to localStorage:", e)
      this.localStorageDelete(id)
    }
  }

  private localStorageList(): SavedDrawing[] {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as SavedDrawing[]) : []
    } catch {
      return []
    }
  }

  private localStorageSave(drawing: SavedDrawing): SavedDrawing {
    try {
      const drawings = this.localStorageList()
      const nextDrawings = [drawing, ...drawings.filter((item) => item.id !== drawing.id)]
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextDrawings))
    } catch (e) {
      console.warn("LocalStorage save mirror failed (likely quota exceeded), drawing is safe in IndexedDB:", e)
    }
    return drawing
  }

  private localStorageDelete(id: string) {
    try {
      const drawings = this.localStorageList()
      const nextDrawings = drawings.filter((item) => item.id !== id)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextDrawings))
    } catch (e) {
      console.error("LocalStorage delete failed:", e)
    }
  }
}

export class RemoteDrawingStorage implements DrawingStorage {
  async list() {
    const { data, error } = await supabase
      .from("saved_drawings")
      .select("*")
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Error listing drawings from Supabase:", error)
      return []
    }

    return (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      modelName: row.model_name,
      category: row.category,
      origin: row.origin as "coloriage" | "ia",
      status: row.status as "in_progress" | "completed" | "error",
      profileId: row.profile_id ?? "",
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      isColored: row.is_colored ?? true,
      image: row.image,
      thumbnail: row.thumbnail,
      template: row.template,
      state: row.state,
    }))
  }

  async save(drawing: SavedDrawing) {
    const { error } = await supabase
      .from("saved_drawings")
      .upsert({
        id: drawing.id,
        name: drawing.name,
        model_name: drawing.modelName,
        category: drawing.category,
        origin: drawing.origin,
        status: drawing.status,
        profile_id: drawing.profileId,
        created_at: drawing.createdAt,
        updated_at: drawing.updatedAt,
        is_colored: drawing.isColored,
        image: drawing.image,
        thumbnail: drawing.thumbnail,
        template: drawing.template,
        state: drawing.state,
      })

    if (error) {
      console.error("Error saving drawing to Supabase:", error)
      throw error
    }

    return drawing
  }

  async rename(id: string, name: string) {
    const { data, error } = await supabase
      .from("saved_drawings")
      .update({
        name,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error renaming drawing in Supabase:", error)
      return null
    }

    return {
      id: data.id,
      name: data.name,
      modelName: data.model_name,
      category: data.category,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      origin: data.origin as "coloriage" | "ia",
      status: data.status as "in_progress" | "completed" | "error",
      profileId: data.profile_id ?? "",
      isColored: data.is_colored ?? true,
      image: data.image,
      thumbnail: data.thumbnail,
      template: data.template,
      state: data.state,
    }
  }

  async delete(id: string) {
    try {
      const { data, error: fetchError } = await supabase
        .from("saved_drawings")
        .select("profile_id, origin")
        .eq("id", id)
        .single()

      if (!fetchError && data) {
        const profileId = data.profile_id || "anonymous"
        const type = data.origin === "ia" ? "ai" : "user"
        await storageService.deleteDrawingFiles(profileId, id, type)
      }
    } catch (err) {
      console.warn("Failed to fetch/delete drawing files from Supabase Storage before DB delete:", err)
    }

    const { error } = await supabase
      .from("saved_drawings")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting drawing from Supabase:", error)
      throw error
    }
  }
}

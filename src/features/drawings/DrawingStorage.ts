import type { SavedDrawing } from "@/features/drawings/types"
import { supabase } from "@/lib/supabaseClient"

const STORAGE_KEY = "petit-baobab.saved-drawings.v1"

export interface DrawingStorage {
  list(): Promise<SavedDrawing[]>
  save(drawing: SavedDrawing): Promise<SavedDrawing>
  rename(id: string, name: string): Promise<SavedDrawing | null>
  delete(id: string): Promise<void>
}

export class LocalDrawingStorage implements DrawingStorage {
  async list() {
    if (typeof window === "undefined") return []

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as SavedDrawing[]) : []
    } catch {
      return []
    }
  }

  async save(drawing: SavedDrawing) {
    const drawings = await this.list()
    const nextDrawings = [drawing, ...drawings.filter((item) => item.id !== drawing.id)]
    this.persist(nextDrawings)
    return drawing
  }

  async rename(id: string, name: string) {
    const drawings = await this.list()
    const index = drawings.findIndex((drawing) => drawing.id === id)

    if (index < 0) return null

    const updated = {
      ...drawings[index],
      name,
      updatedAt: new Date().toISOString(),
    }

    drawings[index] = updated
    this.persist(drawings)
    return updated
  }

  async delete(id: string) {
    const drawings = await this.list()
    this.persist(drawings.filter((drawing) => drawing.id !== id))
  }

  private persist(drawings: SavedDrawing[]) {
    if (typeof window === "undefined") return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(drawings))
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
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      progress: row.progress as "completed" | "in_progress",
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
        created_at: drawing.createdAt,
        updated_at: drawing.updatedAt,
        progress: drawing.progress,
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
      progress: data.progress as "completed" | "in_progress",
      image: data.image,
      thumbnail: data.thumbnail,
      template: data.template,
      state: data.state,
    }
  }

  async delete(id: string) {
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

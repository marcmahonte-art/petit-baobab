import type { SavedDrawing } from "@/features/drawings/types"

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
    return []
  }

  async save(drawing: SavedDrawing) {
    return drawing
  }

  async rename() {
    return null
  }

  async delete() {}
}

import { DrawingRepository } from "@/features/drawings/DrawingRepository"
import type { DrawingItem } from "@/lib/store"
import type { DrawingSort, SaveDrawingInput, SavedDrawing } from "@/features/drawings/types"

export class DrawingService {
  constructor(private repository = new DrawingRepository()) {}

  async list(filters?: { search?: string; category?: string; sort?: DrawingSort }) {
    const drawings = await this.repository.list()
    const search = filters?.search?.trim().toLowerCase() || ""
    const category = filters?.category || "all"

    return drawings
      .filter((drawing) => {
        const matchesSearch = !search || drawing.name.toLowerCase().includes(search) || drawing.modelName.toLowerCase().includes(search)
        const matchesCategory = category === "all" || drawing.category === category
        return matchesSearch && matchesCategory
      })
      .sort((a, b) => {
        if (filters?.sort === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        if (filters?.sort === "name") return a.name.localeCompare(b.name, "fr", { sensitivity: "base" })
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      })
  }

  async save(input: SaveDrawingInput, existingId?: string | null) {
    const now = new Date().toISOString()
    let id = this.createId()
    let createdAt = now

    if (existingId) {
      id = existingId
      try {
        const list = await this.repository.list()
        const found = list.find((item) => item.id === existingId)
        if (found) {
          createdAt = found.createdAt
        }
      } catch (e) {
        console.error("Error looking up existing drawing:", e)
      }
    }

    const drawing: SavedDrawing = {
      id,
      name: input.name,
      modelName: input.template.name,
      category: input.category,
      createdAt,
      updatedAt: now,
      progress: (input.state.filledZones >= 6 ? "completed" : "in_progress") as "completed" | "in_progress",
      isColored: true,
      image: input.image,
      thumbnail: input.thumbnail,
      template: input.template,
      state: input.state,
    }

    return this.repository.save(drawing)
  }

  async saveFromTemplate(template: DrawingItem, category: string): Promise<SavedDrawing | null> {
    const existing = await this.repository.list()
    const alreadySaved = existing.find((d) => d.template.id === template.id && !d.isColored)
    if (alreadySaved) return null

    const now = new Date().toISOString()
    const drawing: SavedDrawing = {
      id: this.createId(),
      name: template.name,
      modelName: template.name,
      category,
      createdAt: now,
      updatedAt: now,
      progress: "in_progress",
      isColored: false,
      image: template.image,
      thumbnail: template.image,
      template,
      state: {
        canvasJson: "",
        selectedTool: "brush",
        selectedColor: "#FFD95C",
        brushSize: 6,
        usedColors: [],
        filledZones: 0,
      },
    }

    return this.repository.save(drawing)
  }

  rename(id: string, name: string) {
    return this.repository.rename(id, name)
  }

  delete(id: string) {
    return this.repository.delete(id)
  }

  private createId() {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID()
    }

    return `drawing-${Date.now()}-${Math.random().toString(16).slice(2)}`
  }
}

export const drawingService = new DrawingService()


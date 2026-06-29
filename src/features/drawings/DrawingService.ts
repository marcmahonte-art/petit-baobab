import { DrawingRepository } from "@/features/drawings/DrawingRepository"
import type { DrawingSort, SaveDrawingInput } from "@/features/drawings/types"

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

  async save(input: SaveDrawingInput) {
    const now = new Date().toISOString()
    const drawing = {
      id: this.createId(),
      name: input.name,
      modelName: input.template.name,
      category: input.category,
      createdAt: now,
      updatedAt: now,
      progress: input.state.filledZones >= 6 ? "completed" : "in_progress",
      image: input.image,
      thumbnail: input.thumbnail,
      template: input.template,
      state: input.state,
    } as const

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

import { DrawingRepository } from "@/features/drawings/DrawingRepository"
import type { DrawingItem } from "@/lib/store"
import type { DrawingSort, SaveDrawingInput, SavedDrawing } from "@/features/drawings/types"

interface DrawingStats {
  total: number
  completed: number
  iaCount: number
  categoriesCount: { category: string; count: number }[]
}

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
    let id = existingId || input.id || this.createId()
    let createdAt = now

    const searchId = existingId || input.id
    if (searchId) {
      try {
        const list = await this.repository.list()
        const found = list.find((item) => item.id === searchId)
        if (found) {
          createdAt = found.createdAt
        }
      } catch (e) {
        console.error("Error looking up existing drawing:", e)
      }
    }

    const status = input.state.filledZones >= 6 ? "completed" : "in_progress"

    const drawing: SavedDrawing = {
      id,
      name: input.name,
      modelName: input.template.name,
      category: input.category,
      origin: "coloriage",
      status,
      profileId: input.profileId,
      createdAt,
      updatedAt: now,
      isColored: true,
      image: input.image,
      thumbnail: input.thumbnail,
      template: input.template,
      state: input.state,
    }

    return this.repository.save(drawing)
  }

  async saveFromTemplate(template: DrawingItem, category: string, profileId: string): Promise<SavedDrawing | null> {
    const existing = await this.repository.list()
    const alreadySaved = existing.find((d) => d.template.id === template.id && !d.isColored && d.profileId === profileId)
    if (alreadySaved) return null

    const now = new Date().toISOString()
    const drawing: SavedDrawing = {
      id: this.createId(),
      name: template.name,
      modelName: template.name,
      category,
      origin: "coloriage",
      status: "in_progress",
      profileId,
      createdAt: now,
      updatedAt: now,
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

  async saveIA(input: SaveDrawingInput) {
    const now = new Date().toISOString()
    const id = this.createId()

    const drawing: SavedDrawing = {
      id,
      name: input.name,
      modelName: input.template.name,
      category: input.category,
      origin: "ia",
      status: "completed",
      profileId: input.profileId,
      createdAt: now,
      updatedAt: now,
      isColored: false,
      image: input.image,
      thumbnail: input.thumbnail,
      template: input.template,
      state: input.state,
    }

    return this.repository.save(drawing)
  }

  async getByProfile(profileId: string) {
    const drawings = await this.repository.list()
    return drawings.filter((d) => d.profileId === profileId)
  }

  async markCompleted(id: string) {
    const drawings = await this.repository.list()
    const found = drawings.find((d) => d.id === id)
    if (!found) return null

    const updated: SavedDrawing = {
      ...found,
      status: "completed",
      updatedAt: new Date().toISOString(),
    }

    return this.repository.save(updated)
  }

  async getStats(profileId: string): Promise<DrawingStats> {
    const drawings = await this.getByProfile(profileId)
    const total = drawings.length
    const completed = drawings.filter((d) => d.status === "completed").length
    const iaCount = drawings.filter((d) => d.origin === "ia").length

    const catMap = new Map<string, number>()
    for (const d of drawings) {
      catMap.set(d.category, (catMap.get(d.category) || 0) + 1)
    }
    const categoriesCount = Array.from(catMap.entries()).map(([category, count]) => ({ category, count }))

    return { total, completed, iaCount, categoriesCount }
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

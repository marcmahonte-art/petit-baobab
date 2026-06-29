import type { DrawingItem, ToolType } from "@/lib/store"

export interface SavedDrawingState {
  canvasJson: string
  selectedTool: ToolType
  selectedColor: string
  brushSize: number
  usedColors: string[]
  filledZones: number
}

export interface SavedDrawing {
  id: string
  name: string
  modelName: string
  category: string
  origin: "coloriage" | "ia"
  status: "in_progress" | "completed" | "error"
  profileId: string
  createdAt: string
  updatedAt: string
  isColored: boolean
  image: string
  thumbnail: string
  template: DrawingItem
  state: SavedDrawingState
}

export interface SaveDrawingInput {
  name: string
  category: string
  origin: "coloriage" | "ia"
  profileId: string
  image: string
  thumbnail: string
  template: DrawingItem
  state: SavedDrawingState
}

export type DrawingSort = "recent" | "oldest" | "name"

import type { DrawingItem, ToolType } from "@/lib/store"

export type DrawingProgress = "completed" | "in_progress"

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
  createdAt: string
  updatedAt: string
  progress: DrawingProgress
  image: string
  thumbnail: string
  template: DrawingItem
  state: SavedDrawingState
}

export interface SaveDrawingInput {
  name: string
  category: string
  image: string
  thumbnail: string
  template: DrawingItem
  state: SavedDrawingState
}

export type DrawingSort = "recent" | "oldest" | "name"

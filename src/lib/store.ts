import { create } from "zustand"

export type ToolType = "brush" | "bucket" | "eraser" | "fill"

export interface DrawingItem {
  id: string
  name: string
  image: string
  isVector?: boolean
  category?: string
}

export interface ColoringState {
  selectedTool: ToolType
  selectedColor: string
  brushSize: number
  points: number
  badges: string[]
  isRewardPopupOpen: boolean
  isSaved: boolean
  isAddedToLivre: boolean
  canvasHistory: string[]
  historyIndex: number
  currentDrawing: DrawingItem
  magicCategory: string
  selectedCategory: string

  setSelectedTool: (tool: ToolType) => void
  setSelectedColor: (color: string) => void
  setBrushSize: (size: number) => void
  addPoints: (points: number) => void
  addBadge: (badge: string) => void
  setRewardPopupOpen: (isOpen: boolean) => void
  setSaved: (saved: boolean) => void
  setAddedToLivre: (added: boolean) => void
  setCurrentDrawing: (drawing: DrawingItem) => void
  setMagicCategory: (cat: string) => void
  setSelectedCategory: (category: string) => void
  pushHistory: (canvasJson: string) => void
  undo: () => { canUndo: boolean; stateJson?: string }
  redo: () => { canRedo: boolean; stateJson?: string }
  clearHistory: () => void
  replaceHistory: (canvasJson: string) => void
}

export const useColoringStore = create<ColoringState>((set, get) => ({
  selectedTool: "brush",
  selectedColor: "#FFD95C",
  brushSize: 6,
  points: 120,
  badges: ["Super Artiste", "Explorateur", "Creatif", "Lecteur"],
  isRewardPopupOpen: false,
  isSaved: false,
  isAddedToLivre: false,
  canvasHistory: [],
  historyIndex: -1,
  currentDrawing: { id: "elephant", name: "Elephant", image: "/illustrations/animals/elephant.svg", category: "animals" },
  magicCategory: "",
  selectedCategory: "animals",

  setSelectedTool: (tool) => set({ selectedTool: tool }),
  setSelectedColor: (color) => set({ selectedColor: color }),
  setBrushSize: (size) => set({ brushSize: size }),
  addPoints: (p) => set((state) => ({ points: state.points + p })),
  addBadge: (b) =>
    set((state) => ({
      badges: state.badges.includes(b) ? state.badges : [...state.badges, b],
    })),
  setRewardPopupOpen: (isOpen) => set({ isRewardPopupOpen: isOpen }),
  setSaved: (saved) => set({ isSaved: saved }),
  setAddedToLivre: (added) => set({ isAddedToLivre: added }),
  setCurrentDrawing: (drawing) => set({ currentDrawing: drawing, isSaved: false }),
  setMagicCategory: (cat) => set({ magicCategory: cat }),
  setSelectedCategory: (cat) => set({ selectedCategory: cat }),

  pushHistory: (json) => {
    const { canvasHistory, historyIndex } = get()
    const nextHistory = canvasHistory.slice(0, historyIndex + 1)
    nextHistory.push(json)
    set({
      canvasHistory: nextHistory,
      historyIndex: nextHistory.length - 1,
    })
  },

  undo: () => {
    const { canvasHistory, historyIndex } = get()
    if (historyIndex > 0) {
      const nextIndex = historyIndex - 1
      set({ historyIndex: nextIndex })
      return { canUndo: true, stateJson: canvasHistory[nextIndex] }
    }
    return { canUndo: false }
  },

  redo: () => {
    const { canvasHistory, historyIndex } = get()
    if (historyIndex < canvasHistory.length - 1) {
      const nextIndex = historyIndex + 1
      set({ historyIndex: nextIndex })
      return { canRedo: true, stateJson: canvasHistory[nextIndex] }
    }
    return { canRedo: false }
  },

  clearHistory: () => set({ canvasHistory: [], historyIndex: -1 }),
  replaceHistory: (json) => set({ canvasHistory: [json], historyIndex: 0 }),
}))

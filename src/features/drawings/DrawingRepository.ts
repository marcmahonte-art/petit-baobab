import { LocalDrawingStorage, RemoteDrawingStorage, type DrawingStorage } from "@/features/drawings/DrawingStorage"
import type { SavedDrawing } from "@/features/drawings/types"

export class DrawingRepository {
  private storage: DrawingStorage

  constructor(isConnected = false) {
    this.storage = isConnected ? new RemoteDrawingStorage() : new LocalDrawingStorage()
  }

  list() {
    return this.storage.list()
  }

  save(drawing: SavedDrawing) {
    return this.storage.save(drawing)
  }

  rename(id: string, name: string) {
    return this.storage.rename(id, name)
  }

  delete(id: string) {
    return this.storage.delete(id)
  }
}

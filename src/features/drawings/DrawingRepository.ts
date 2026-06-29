import { LocalDrawingStorage, RemoteDrawingStorage, type DrawingStorage } from "@/features/drawings/DrawingStorage"
import type { SavedDrawing } from "@/features/drawings/types"

const isSupabaseConnected = typeof window !== "undefined" && 
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && 
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export class DrawingRepository {
  private storage: DrawingStorage

  constructor(isConnected = isSupabaseConnected) {
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

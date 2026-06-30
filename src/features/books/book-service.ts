import type { BookFilters, SavedBook } from "@/features/books/types"
import { LocalBookStorage } from "@/features/books/storage"
import { RemoteBookStorage } from "@/features/books/RemoteBookStorage"

const isSupabaseConnected = typeof window !== "undefined" &&
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export class BookService {
  constructor(private storage = isSupabaseConnected ? new RemoteBookStorage() : new LocalBookStorage()) {}

  async list(filters?: BookFilters): Promise<SavedBook[]> {
    const books = await this.storage.list()

    if (!filters) return books

    return books.filter((book) => {
      if (filters.status && book.status !== filters.status) return false
      if (filters.profileId && book.profileId !== filters.profileId) return false
      return true
    })
  }

  async save(book: SavedBook): Promise<SavedBook> {
    const now = new Date().toISOString()
    const updated: SavedBook = {
      ...book,
      updatedAt: now,
      createdAt: book.createdAt || now,
    }
    return this.storage.save(updated)
  }

  async delete(id: string): Promise<void> {
    return this.storage.delete(id)
  }

  async getById(id: string): Promise<SavedBook | null> {
    return this.storage.getById(id)
  }

  async finalize(id: string, pdfUrl: string): Promise<SavedBook | null> {
    const book = await this.storage.getById(id)
    if (!book) return null

    const updated: SavedBook = {
      ...book,
      status: "finalized",
      pdfUrl,
      updatedAt: new Date().toISOString(),
    }

    return this.storage.save(updated)
  }
}

export const bookService = new BookService()

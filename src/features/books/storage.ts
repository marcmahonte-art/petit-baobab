import type { SavedBook } from "@/features/books/types"

const STORAGE_KEY = "petit-baobab.saved-books.v1"
const DB_NAME = "petit-baobab-db"
const DB_VERSION = 1
const STORE_NAME = "books"

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export interface BookStorage {
  list(): Promise<SavedBook[]>
  save(book: SavedBook): Promise<SavedBook>
  getById(id: string): Promise<SavedBook | null>
  delete(id: string): Promise<void>
}

export class LocalBookStorage implements BookStorage {
  async list(): Promise<SavedBook[]> {
    if (typeof window === "undefined") return []

    try {
      const db = await getDB()
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readonly")
        const store = transaction.objectStore(STORE_NAME)
        const request = store.getAll()

        request.onsuccess = () => {
          const list = request.result as SavedBook[]
          list.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          resolve(list)
        }
        request.onerror = () => reject(request.error)
      })
    } catch (e) {
      console.error("IndexedDB list failed, falling back to localStorage:", e)
      return this.localStorageList()
    }
  }

  async save(book: SavedBook): Promise<SavedBook> {
    if (typeof window === "undefined") return book

    try {
      const db = await getDB()
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite")
        const store = transaction.objectStore(STORE_NAME)
        const request = store.put(book)

        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })

      try {
        this.localStorageSave(book)
      } catch {
        // Safe to ignore if localStorage quota is exceeded, as IndexedDB succeeded
      }
      return book
    } catch (e) {
      console.error("IndexedDB save failed, falling back to localStorage:", e)
      return this.localStorageSave(book)
    }
  }

  async getById(id: string): Promise<SavedBook | null> {
    const list = await this.list()
    return list.find((b) => b.id === id) ?? null
  }

  async delete(id: string): Promise<void> {
    if (typeof window === "undefined") return

    try {
      const db = await getDB()
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite")
        const store = transaction.objectStore(STORE_NAME)
        const request = store.delete(id)

        request.onsuccess = () => resolve()
        request.onerror = () => reject(request.error)
      })
      this.localStorageDelete(id)
    } catch (e) {
      console.error("IndexedDB delete failed, falling back to localStorage:", e)
      this.localStorageDelete(id)
    }
  }

  private localStorageList(): SavedBook[] {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as SavedBook[]) : []
    } catch {
      return []
    }
  }

  private localStorageSave(book: SavedBook): SavedBook {
    try {
      const books = this.localStorageList()
      const nextBooks = [book, ...books.filter((item) => item.id !== book.id)]
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextBooks))
    } catch (e) {
      console.warn("LocalStorage save mirror failed (likely quota exceeded), book is safe in IndexedDB:", e)
    }
    return book
  }

  private localStorageDelete(id: string) {
    try {
      const books = this.localStorageList()
      const nextBooks = books.filter((item) => item.id !== id)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextBooks))
    } catch (e) {
      console.error("LocalStorage delete failed:", e)
    }
  }
}

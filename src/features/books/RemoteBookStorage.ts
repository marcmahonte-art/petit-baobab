import type { SavedBook } from "@/features/books/types"
import type { BookStorage } from "@/features/books/storage"
import { supabase } from "@/lib/supabaseClient"
import { storageService } from "@/lib/storageService"

export class RemoteBookStorage implements BookStorage {
  async list(): Promise<SavedBook[]> {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .order("updated_at", { ascending: false })

    if (error) {
      console.error("Error listing books from Supabase:", error)
      return []
    }

    return (data || []).map((row) => ({
      id: row.id,
      title: row.title,
      subtitle: row.subtitle ?? "",
      author: row.author ?? "",
      childName: row.child_name ?? "",
      cover: row.cover,
      palette: row.palette,
      style: row.style,
      frame: row.frame,
      format: row.format,
      orientation: row.orientation,
      pages: row.pages || [],
      status: row.status,
      pdfUrl: row.pdf_url ?? "",
      coverImageUrl: row.cover_image_url ?? "",
      profileId: row.profile_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  }

  async save(book: SavedBook): Promise<SavedBook> {
    const { error } = await supabase
      .from("books")
      .upsert({
        id: book.id,
        title: book.title,
        subtitle: book.subtitle,
        author: book.author,
        child_name: book.childName,
        cover: book.cover,
        palette: book.palette,
        style: book.style,
        frame: book.frame,
        format: book.format,
        orientation: book.orientation,
        pages: book.pages,
        status: book.status,
        pdf_url: book.pdfUrl,
        cover_image_url: book.coverImageUrl,
        profile_id: book.profileId,
        created_at: book.createdAt,
        updated_at: book.updatedAt,
      })

    if (error) {
      console.error("Error saving book to Supabase:", error)
      throw error
    }

    return book
  }

  async getById(id: string): Promise<SavedBook | null> {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error(`Error fetching book ${id} from Supabase:`, error)
      return null
    }

    if (!data) return null

    return {
      id: data.id,
      title: data.title,
      subtitle: data.subtitle ?? "",
      author: data.author ?? "",
      childName: data.child_name ?? "",
      cover: data.cover,
      palette: data.palette,
      style: data.style,
      frame: data.frame,
      format: data.format,
      orientation: data.orientation,
      pages: data.pages || [],
      status: data.status,
      pdfUrl: data.pdf_url ?? "",
      coverImageUrl: data.cover_image_url ?? "",
      profileId: data.profile_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const book = await this.getById(id)
      if (book) {
        await storageService.deleteBookFiles(book.profileId, id)
      }
    } catch (err) {
      console.warn("Failed to delete book files from storage before database record deletion:", err)
    }

    const { error } = await supabase
      .from("books")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting book from Supabase:", error)
      throw error
    }
  }
}

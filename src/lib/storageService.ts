import { supabase } from "@/lib/supabaseClient"

/**
 * Converts a base64 Data URL to a Blob object.
 * Useful for legacy code handling base64 data strings.
 */
export function base64ToBlob(base64DataUrl: string): Blob {
  const parts = base64DataUrl.split(",")
  if (parts.length < 2) {
    throw new Error("Invalid base64 data URL format")
  }
  const mimeMatch = parts[0].match(/:(.*?);/)
  const mimeType = mimeMatch ? mimeMatch[1] : "image/png"
  const binaryStr = atob(parts[1])
  const len = binaryStr.length
  const u8arr = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    u8arr[i] = binaryStr.charCodeAt(i)
  }
  return new Blob([u8arr], { type: mimeType })
}

/**
 * Supabase Storage service for Petit Baobab.
 * Handles uploading drawings, thumbnails, PDFs, and covers,
 * and deleting files, as well as resolving public URLs.
 */
export const storageService = {
  /**
   * Helper to get public URL for a file in a given bucket.
   */
  getPublicUrl(bucket: "drawings" | "books", path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  },

  /**
   * Helper to generate a resized thumbnail Blob from an image Blob.
   */
  generateThumbnail(blob: Blob, maxSize: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Could not get canvas context"))
          return
        }

        const width = img.naturalWidth || img.width
        const height = img.naturalHeight || img.height

        let w = width
        let h = height
        if (width > height) {
          if (width > maxSize) {
            h = Math.round((height * maxSize) / width)
            w = maxSize
          }
        } else {
          if (height > maxSize) {
            w = Math.round((width * maxSize) / height)
            h = maxSize
          }
        }

        canvas.width = w
        canvas.height = h
        ctx.drawImage(img, 0, 0, w, h)

        canvas.toBlob((resultBlob) => {
          if (resultBlob) {
            resolve(resultBlob)
          } else {
            reject(new Error("Failed to convert canvas to blob"))
          }
        }, "image/png")
      }
      img.onerror = () => {
        reject(new Error("Failed to load image for thumbnail generation"))
      }
      img.src = URL.createObjectURL(blob)
    })
  },

  /**
   * Upload a drawing image (original high-quality rendering).
   * Path: drawings/{ai|user}/{profileId}/{drawingId}.png
   */
  async uploadDrawingImage(
    file: Blob | File,
    profileId: string,
    drawingId: string,
    type: "ai" | "user"
  ): Promise<string> {
    const cleanProfileId = profileId || "anonymous"
    const path = `${type}/${cleanProfileId}/${drawingId}.png`

    const { error } = await supabase.storage
      .from("drawings")
      .upload(path, file, {
        contentType: "image/png",
        upsert: true,
      })

    if (error) {
      console.error(`Error uploading drawing image to ${path}:`, error)
      throw error
    }

    return this.getPublicUrl("drawings", path)
  },

  /**
   * Upload a drawing thumbnail.
   * Path: drawings/{ai|user}/{profileId}/{drawingId}_thumb.png
   */
  async uploadThumbnail(
    file: Blob | File,
    profileId: string,
    drawingId: string,
    type: "ai" | "user"
  ): Promise<string> {
    const cleanProfileId = profileId || "anonymous"
    const path = `${type}/${cleanProfileId}/${drawingId}_thumb.png`

    const { error } = await supabase.storage
      .from("drawings")
      .upload(path, file, {
        contentType: "image/png",
        upsert: true,
      })

    if (error) {
      console.error(`Error uploading thumbnail to ${path}:`, error)
      throw error
    }

    return this.getPublicUrl("drawings", path)
  },

  /**
   * Upload a generated Book PDF.
   * Path: books/{profileId}/{bookId}.pdf
   */
  async uploadBookPdf(
    file: Blob | File,
    profileId: string,
    bookId: string
  ): Promise<string> {
    const cleanProfileId = profileId || "anonymous"
    const path = `${cleanProfileId}/${bookId}.pdf`

    const { error } = await supabase.storage
      .from("books")
      .upload(path, file, {
        contentType: "application/pdf",
        upsert: true,
      })

    if (error) {
      console.error(`Error uploading book PDF to ${path}:`, error)
      throw error
    }

    return this.getPublicUrl("books", path)
  },

  /**
   * Upload a Book Cover Image.
   * Path: books/{profileId}/{bookId}_cover.png
   */
  async uploadBookCover(
    file: Blob | File,
    profileId: string,
    bookId: string
  ): Promise<string> {
    const cleanProfileId = profileId || "anonymous"
    const path = `${cleanProfileId}/${bookId}_cover.png`

    const { error } = await supabase.storage
      .from("books")
      .upload(path, file, {
        contentType: "image/png",
        upsert: true,
      })

    if (error) {
      console.error(`Error uploading book cover to ${path}:`, error)
      throw error
    }

    return this.getPublicUrl("books", path)
  },

  /**
   * Delete drawing files (image and thumbnail).
   */
  async deleteDrawingFiles(
    profileId: string,
    drawingId: string,
    type: "ai" | "user"
  ): Promise<void> {
    const cleanProfileId = profileId || "anonymous"
    const paths = [
      `${type}/${cleanProfileId}/${drawingId}.png`,
      `${type}/${cleanProfileId}/${drawingId}_thumb.png`,
    ]

    const { error } = await supabase.storage.from("drawings").remove(paths)
    if (error) {
      console.warn(`Could not delete drawing files from storage:`, error.message)
    }
  },

  /**
   * Delete book files (PDF and cover image).
   */
  async deleteBookFiles(profileId: string, bookId: string): Promise<void> {
    const cleanProfileId = profileId || "anonymous"
    const paths = [
      `${cleanProfileId}/${bookId}.pdf`,
      `${cleanProfileId}/${bookId}_cover.png`,
    ]

    const { error } = await supabase.storage.from("books").remove(paths)
    if (error) {
      console.warn(`Could not delete book files from storage:`, error.message)
    }
  },
}

"use client"

import { useCallback, useState } from "react"
import { useBookStore } from "../store/useBookStore"
import { useProfileStore } from "@/lib/profile-store"
import { storageService } from "@/lib/storageService"
import { downloadBlob } from "@/lib/download"
import { generateBookPdf } from "../pdf/generateBookPdf"
import { bookService } from "@/features/books"
import type { ColoringBook } from "../types/ColoringBook"

export type GenerationStatus = "idle" | "generating" | "uploading" | "done" | "error"

export function useBookPdf() {
  const [status, setStatus] = useState<GenerationStatus>("idle")
  const [error, setError] = useState<string | null>(null)
  const progress = useBookStore((s) => s.exportSettings.generationProgress)

  const setGen = (key: "isGenerating" | "generationProgress", value: boolean | number) =>
    useBookStore.getState().setExportSetting(key, value)

  /**
   * Génère le PDF à partir du modèle de domaine `ColoringBook`.
   * Le composant interactif n'est PAS utilisé.
   */
  const generate = useCallback(async (book: ColoringBook) => {
    setError(null)
    setStatus("generating")
    setGen("isGenerating", true)
    setGen("generationProgress", 0)

    try {
      const blob = await generateBookPdf(book)
      setStatus("uploading")

      const profileId = useProfileStore.getState().activeProfileId || "anonymous"
      const bookId = crypto.randomUUID()
      let pdfUrl = ""
      try {
        pdfUrl = await storageService.uploadBookPdf(blob, profileId, bookId)
      } catch (e) {
        console.error("Upload PDF échoué:", e)
      }

      const pagesRef = book.pages
        .filter((p) => p.type === "drawing")
        .map((p, idx) => ({ drawingId: p.id.replace(/^drawing-/, ""), pageNumber: idx + 1 }))
      const now = new Date().toISOString()
      try {
        await bookService.save({
          id: bookId,
          title: book.title || "Mon livre de coloriage",
          subtitle: book.subtitle || "",
          author: book.author || "Auteur",
          childName: book.childName || "Enfant",
          cover: book.cover,
          palette: book.palette,
          style: book.style,
          frame: book.frame,
          format: book.format,
          orientation: book.orientation,
          pages: pagesRef,
          status: pdfUrl ? "finalized" : "draft",
          pdfUrl,
          coverImageUrl: "",
          profileId,
          createdAt: now,
          updatedAt: now,
        } as unknown as Parameters<typeof bookService.save>[0])
      } catch (e) {
        console.error("Sauvegarde livre échouée:", e)
      }

      const safeTitle = (book.title || "livre-coloriage")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
      downloadBlob(blob, `${safeTitle}-petit-baobab.pdf`)
      setGen("generationProgress", 100)
      setStatus("done")
    } catch (e) {
      console.error("Génération PDF échouée:", e)
      setError(e instanceof Error ? e.message : "La génération du PDF a échoué.")
      setStatus("error")
    } finally {
      setGen("isGenerating", false)
    }
  }, [])

  return { status, error, progress, generate }
}

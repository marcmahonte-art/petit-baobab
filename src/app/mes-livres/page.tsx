"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { MobileBottomNav } from "@/components/child-dashboard/mobile-bottom-nav"
import { SavedBooksGallery } from "@/components/saved-books/SavedBooksGallery"
import { bookService } from "@/features/books"
import type { SavedBook, CoverTemplate, CoverPalette, BookStyle, BookFrame, BookFormat, BookOrientation } from "@/features/books/types"
import { useBookStore } from "@/features/coloring-book/store/useBookStore"
import Image from "next/image"
import { BookOpen } from "lucide-react"

export default function MesLivresPage() {
  const router = useRouter()
  const [books, setBooks] = useState<SavedBook[]>([])
  const [loading, setLoading] = useState(true)

  const loadBooks = useCallback(async () => {
    setLoading(true)
    try {
      const list = await bookService.list()
      setBooks(list)
    } catch (e) {
      console.error("Failed to load books:", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadBooks()
  }, [loadBooks])

  const hydrateStore = useCallback((book: SavedBook, step: number) => {
    useBookStore.getState().hydrate({
      currentStep: step as 1 | 2 | 3 | 4,
      selectedImages: book.pages.map((p) => p.drawingId),
      bookInfo: {
        title: book.title,
        subtitle: book.subtitle,
        author: book.author,
        childName: book.childName,
      },
      cover: book.cover as CoverTemplate,
      palette: book.palette as CoverPalette,
      style: book.style as BookStyle,
      frame: book.frame as BookFrame,
      format: book.format as BookFormat,
      orientation: book.orientation as BookOrientation,
    })
  }, [])

  const handleModify = useCallback((book: SavedBook) => {
    hydrateStore(book, 2)
    router.push("/livres-de-coloriage")
  }, [hydrateStore, router])

  const handleDownload = useCallback((book: SavedBook) => {
    if (book.pdfUrl) {
      const a = document.createElement("a")
      a.href = book.pdfUrl
      a.download = `${book.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf`
      a.click()
    } else {
      hydrateStore(book, 4)
      router.push("/livres-de-coloriage?action=download")
    }
  }, [hydrateStore, router])

  const handlePrint = useCallback((book: SavedBook) => {
    hydrateStore(book, 4)
    router.push("/livres-de-coloriage?action=print")
  }, [hydrateStore, router])

  const handleDelete = useCallback(async (id: string) => {
    await bookService.delete(id)
    setBooks((prev) => prev.filter((b) => b.id !== id))
  }, [])

  return (
    <div className="min-h-screen bg-[#FFF9F2] relative overflow-hidden pb-16 lg:pb-24">
      <div className="mx-auto max-w-[1536px] lg:grid lg:grid-cols-[280px_1fr] lg:gap-8 lg:px-8 px-4 lg:py-6 pt-4 pb-24 lg:pb-6 relative z-10">
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <Sidebar />
          </div>
        </div>

        <main className="flex flex-col gap-6 min-h-[calc(100vh-48px)]">
          <div className="flex flex-col gap-1 py-2">
            <h1 className="text-[28px] md:text-[34px] font-extrabold text-[#1F2937] leading-tight flex items-center gap-2">
              <BookOpen className="w-7 h-7 text-[#1F2937]" /> Mes livres
            </h1>
            <p className="text-[15px] font-semibold text-[#64748B]">
              Retrouve, modifie, télécharge ou imprime tous tes livres de coloriage.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-[20px] border border-[#E5E7EB]/80 bg-white overflow-hidden animate-pulse">
                  <div className="h-[180px] bg-[#F0E7DA]" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-[#F0E7DA] rounded w-3/4" />
                    <div className="h-3 bg-[#F0E7DA] rounded w-1/2" />
                  </div>
                  <div className="h-10 bg-[#F0E7DA]" />
                </div>
              ))}
            </div>
          ) : (
            <SavedBooksGallery
              books={books}
              onModify={handleModify}
              onDownload={handleDownload}
              onPrint={handlePrint}
              onDelete={handleDelete}
            />
          )}
        </main>
      </div>

      <MobileBottomNav />

      <div className="absolute bottom-0 left-0 right-0 w-full z-0 hidden lg:block select-none pointer-events-none">
        <Image
          src="/illustrations/footer_bas.webp"
          alt=""
          width={1920}
          height={346}
          className="w-full h-auto block"
          priority
        />
      </div>
    </div>
  )
}

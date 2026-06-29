"use client"

import { bookService } from "../services/book.service"
import { useBookStore } from "../store/useBookStore"

export function useBookExport() {
  const title = useBookStore((state) => state.bookInfo.title)
  const selectedImagesCount = useBookStore((state) => state.selectedImages.length)
  const style = useBookStore((state) => state.style)
  const options = useBookStore((state) => state.options)
  const printSettings = useBookStore((state) => state.printSettings)
  const exportSettings = useBookStore((state) => state.exportSettings)

  return {
    exportSettings,
    exportPreview: bookService.exportPdf({ title, selectedImagesCount, style, options, printSettings }),
  }
}

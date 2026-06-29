"use client"

import { useMemo } from "react"
import { calculateEstimatedPdfSize, calculatePageCount, getSelectedDrawings } from "../utils/book.utils"
import { useBookStore } from "../store/useBookStore"

export function useBookPreview() {
  const selectedImages = useBookStore((state) => state.selectedImages)
  const preview = useBookStore((state) => state.preview)
  const style = useBookStore((state) => state.style)
  const options = useBookStore((state) => state.options)
  const printSettings = useBookStore((state) => state.printSettings)

  return useMemo(
    () => ({
      selectedDrawings: getSelectedDrawings(selectedImages),
      bookPages: preview,
      totalPagesCount: calculatePageCount(preview),
      calculatedPdfWeight: calculateEstimatedPdfSize({
        selectedImagesCount: selectedImages.length,
        style,
        options,
        printSettings,
      }),
    }),
    [options, preview, printSettings, selectedImages, style],
  )
}

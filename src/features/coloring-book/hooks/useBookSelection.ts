"use client"

import { libraryDrawings } from "../constants/book.constants"
import { useBookStore } from "../store/useBookStore"
import { getSelectedDrawings } from "../utils/book.utils"

export function useBookSelection() {
  const selectedImages = useBookStore((state) => state.selectedImages)
  const toggleSelectedImage = useBookStore((state) => state.toggleSelectedImage)
  const setSelectedImages = useBookStore((state) => state.setSelectedImages)
  const searchTerm = useBookStore((state) => state.settings.searchTerm)
  const selectedCategory = useBookStore((state) => state.settings.selectedCategory)

  const filteredDrawings = libraryDrawings.filter((drawing) => {
    const matchesSearch = drawing.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || drawing.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return {
    selectedImages,
    selectedDrawings: getSelectedDrawings(selectedImages),
    filteredDrawings,
    toggleSelectedImage,
    setSelectedImages,
  }
}

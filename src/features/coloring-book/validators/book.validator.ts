import type { BookFormat, BookInfo, BookStyle, CoverTemplate } from "../types"

export interface BookValidationInput {
  selectedImages: string[]
  bookInfo: BookInfo
  cover: CoverTemplate | ""
  format: BookFormat | ""
  style: BookStyle | ""
}

export type BookValidationErrors = Partial<Record<keyof BookInfo | "selectedImages" | "cover" | "format" | "style", string>>

export function validateBook(input: BookValidationInput): BookValidationErrors {
  const errors: BookValidationErrors = {}

  if (input.selectedImages.length === 0) {
    errors.selectedImages = "Sélectionne au moins un dessin."
  }

  if (!input.bookInfo.title.trim()) {
    errors.title = "Ajoute un titre."
  }

  if (!input.cover) {
    errors.cover = "Choisis une couverture."
  }

  if (!input.format) {
    errors.format = "Choisis un format."
  }

  if (!input.style) {
    errors.style = "Choisis un style."
  }

  return errors
}

export function canContinue(errors: BookValidationErrors): boolean {
  return Object.keys(errors).length === 0
}

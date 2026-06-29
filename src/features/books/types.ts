export type BookStatus = "draft" | "finalized"
export type BookFormat = "A4" | "A5" | "Letter" | "Carré"
export type BookOrientation = "Portrait" | "Paysage" | "Carré"
export type BookFrame = "Nature" | "Faso Dan Fani" | "Bogolan" | "Savane" | "Animaux" | "Aucun"
export type BookStyle = "Contour simple" | "Noir & Blanc détaillé" | "Traits épais" | "Version couleur"
export type CoverTemplate = "petit-baobab" | "savane" | "ecole" | "afrique" | "coloree"
export type CoverPalette = "Purple" | "Green" | "Yellow" | "Orange" | "Blue" | "Pink" | "Turquoise" | "Multicolore"

export interface BookPageRef {
  drawingId: string
  pageNumber: number
}

export interface SavedBook {
  id: string
  title: string
  subtitle: string
  author: string
  childName: string
  cover: CoverTemplate
  palette: CoverPalette
  style: BookStyle
  frame: BookFrame
  format: BookFormat
  orientation: BookOrientation
  pages: BookPageRef[]
  status: BookStatus
  pdfUrl: string
  profileId: string
  createdAt: string
  updatedAt: string
}

export interface BookFilters {
  status?: BookStatus
  profileId?: string
}

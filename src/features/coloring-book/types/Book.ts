import type { BookExportSettings } from "./BookExport"
import type { BookFrame } from "./BookFrame"
import type { BookPage } from "./BookPage"
import type { BookSettings } from "./BookSettings"
import type { BookStyle } from "./BookStyle"
import type { CoverPalette, CoverTemplate } from "./Cover"
import type { PrintSettings } from "./PrintRequest"

export type BookStep = 1 | 2 | 3 | 4
export type BookFormat = "A4" | "A5" | "Letter" | "Carré"
export type BookOrientation = "Portrait" | "Paysage" | "Carré"

export interface LibraryDrawing {
  id: string
  name: string
  image: string
  category: string
  isPersonal?: boolean
}

export interface DrawingCategory {
  id: string
  label: string
  icon: string
}

export interface BookInfo {
  title: string
  subtitle: string
  author: string
  childName: string
}

export interface BookOptions {
  pageNumbers: boolean
  addTitlePage: boolean
  belongsTo: boolean
  educationalText: boolean
  funFact: boolean
  questions: boolean
}

export interface BookWizardState {
  currentStep: BookStep
  selectedImages: string[]
  bookInfo: BookInfo
  cover: CoverTemplate
  palette: CoverPalette
  style: BookStyle
  frame: BookFrame
  format: BookFormat
  orientation: BookOrientation
  options: BookOptions
  preview: BookPage[]
  exportSettings: BookExportSettings
  printSettings: PrintSettings
  history: string[]
  loading: boolean
  errors: Partial<Record<keyof BookInfo | "selectedImages" | "cover" | "format" | "style", string>>
  isDirty: boolean
  settings: BookSettings
}

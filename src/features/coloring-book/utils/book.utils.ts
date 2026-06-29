import { libraryDrawings } from "../constants/book.constants"
import type { BookInfo, BookOptions, BookPage, BookStyle, LibraryDrawing, PrintSettings } from "../types"
import { validateBook } from "../validators/book.validator"

export function getSelectedDrawings(selectedImages: string[]): LibraryDrawing[] {
  return selectedImages
    .map((id) => libraryDrawings.find((drawing) => drawing.id === id))
    .filter((drawing): drawing is LibraryDrawing => Boolean(drawing))
}

export function buildPreview(params: {
  selectedImages: string[]
  options: Pick<BookOptions, "addTitlePage" | "belongsTo">
  bookInfo: Pick<BookInfo, "childName">
  cover: string
}): BookPage[] {
  const pages: BookPage[] = []

  if (params.options.addTitlePage) {
    pages.push({ type: "cover", label: "Couverture", details: params.cover })
  }

  if (params.options.belongsTo) {
    pages.push({ type: "belongs_to", label: "Page de garde", details: `Appartient à ${params.bookInfo.childName}` })
  }

  getSelectedDrawings(params.selectedImages).forEach((drawing) => {
    pages.push({ type: "drawing", label: drawing.name, image: drawing.image, details: drawing.category })
  })

  return pages
}

export function calculatePageCount(pages: BookPage[]): number {
  return pages.length
}

export function calculateEstimatedPdfSize(params: {
  selectedImagesCount: number
  style: BookStyle
  options: Pick<BookOptions, "addTitlePage" | "belongsTo">
  printSettings: Pick<PrintSettings, "optimizeInk">
}): number {
  let base = 1.4
  const multiplier = params.style === "Noir & Blanc détaillé" || params.style === "Version couleur" ? 0.6 : 0.3

  base += params.selectedImagesCount * multiplier
  if (params.options.addTitlePage) base += 0.8
  if (params.options.belongsTo) base += 0.2
  if (params.printSettings.optimizeInk) base *= 0.75

  return Number(base.toFixed(1))
}

export function buildCover(bookInfo: BookInfo, cover: string) {
  return { cover, ...bookInfo }
}

export function generateFilename(title: string): string {
  const slug = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

  return `${slug || "mon-livre-de-coloriage"}-petit-baobab.pdf`
}

export function generateBook(params: Parameters<typeof buildPreview>[0]) {
  const pages = buildPreview(params)
  return {
    pages,
    pageCount: calculatePageCount(pages),
  }
}

export { validateBook }

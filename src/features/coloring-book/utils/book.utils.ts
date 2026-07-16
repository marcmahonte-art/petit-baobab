import { libraryDrawings } from "../constants/book.constants"
import type { BookInfo, BookOptions, BookPage, BookStyle, LibraryDrawing, PrintSettings } from "../types"
import { validateBook } from "../validators/book.validator"

export function getSelectedDrawings(selectedImages: string[], customDrawings: LibraryDrawing[] = []): LibraryDrawing[] {
  return selectedImages
    .map((id) => {
      const staticDraw = libraryDrawings.find((drawing) => drawing.id === id)
      if (staticDraw) return staticDraw

      const savedDraw = customDrawings.find((drawing) => drawing.id === id)
      if (savedDraw) return savedDraw

      return undefined
    })
    .filter((drawing): drawing is LibraryDrawing => Boolean(drawing))
}

/**
 * Construit la liste ordonnée des pages du livre.
 * Chaque page reçoit un `id` unique et stable (jamais un index de tableau).
 */
export function buildPreview(params: {
  selectedImages: string[]
  options: Pick<BookOptions, "addTitlePage" | "belongsTo">
  bookInfo: Pick<BookInfo, "childName">
  cover: string
  customDrawings?: LibraryDrawing[]
}): BookPage[] {
  const pages: BookPage[] = []

  if (params.options.addTitlePage) {
    pages.push({
      id: `cover-${params.cover}`,
      type: "cover",
      title: "Couverture",
      theme: "couverture",
      category: params.cover,
      details: params.cover,
    })
  }

  if (params.options.belongsTo) {
    const child = params.bookInfo.childName || "Awa"
    pages.push({
      id: `belongs-${child}`,
      type: "belongs_to",
      title: "Ce livre appartient à",
      theme: "page-de-garde",
      category: "appartient",
      details: `Appartient à ${child}`,
    })
  }

  getSelectedDrawings(params.selectedImages, params.customDrawings).forEach((drawing) => {
    const isSvg = typeof drawing.image === "string" && drawing.image.toLowerCase().endsWith(".svg")
    pages.push({
      id: `drawing-${drawing.id}`,
      type: "drawing",
      title: drawing.name,
      theme: drawing.category,
      category: drawing.category,
      details: drawing.category,
      isPersonal: drawing.isPersonal,
      svgPath: isSvg ? drawing.image : undefined,
      image: drawing.image,
      svg: drawing.svg,
    })
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

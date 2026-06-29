import { buildPreview, calculateEstimatedPdfSize, generateBook, generateFilename } from "../utils/book.utils"
import type { BookInfo, BookOptions, BookStyle, CoverTemplate, PrintSettings } from "../types"

export const bookService = {
  create: generateBook,
  update: generateBook,
  delete(bookId: string) {
    return { deleted: true, bookId }
  },
  preview: buildPreview,
  exportPdf(params: {
    title: string
    selectedImagesCount: number
    style: BookStyle
    options: Pick<BookOptions, "addTitlePage" | "belongsTo">
    printSettings: Pick<PrintSettings, "optimizeInk">
  }) {
    return {
      filename: generateFilename(params.title),
      estimatedSize: calculateEstimatedPdfSize(params),
    }
  },
  buildCoverPayload(bookInfo: BookInfo, cover: CoverTemplate) {
    return { cover, bookInfo }
  },
}

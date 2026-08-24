import { memo } from "react"
import type { ColoringBook } from "../types/ColoringBook"
import { BookPage } from "./BookPage"

export interface BookPrintProps {
  /** Données du livre UNIQUEMENT. Aucune dépendance à l'UI interactive. */
  book: ColoringBook
  className?: string
}

/**
 * Version IMPRESSION du livre.
 * - Reconstruit le livre entier à partir des données.
 * - Chaque page est une <section class="print-page"> indépendante.
 * - Aucune animation (Framer Motion absent).
 * - Rendu identique au PDF (mêmes données, mêmes pages).
 */
function BookPrintComponent({ book, className }: BookPrintProps) {
  return (
    <div className={className} data-book-print>
      {book.pages.map((page, index) => (
        <section key={page.id} className="print-page" data-page-type={page.type} data-page-id={page.id}>
          <BookPage
            page={page}
            index={index}
            total={book.pages.length}
            title={book.title}
            subtitle={book.subtitle}
            author={book.author}
            childName={book.childName}
            palette={book.palette}
            style={book.style}
            pageNumbers={book.settings.pageNumbers}
            variant="print"
          />
        </section>
      ))}
    </div>
  )
}

export const BookPrint = memo(BookPrintComponent)

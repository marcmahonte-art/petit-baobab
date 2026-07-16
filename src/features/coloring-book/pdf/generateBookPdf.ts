import { generateVectorBookPdf, BOOK_FORMATS, PALETTE_COLORS } from "@/lib/pdf/vectorBookPdf"
import type { ColoringBook } from "../types/ColoringBook"

function slug(title: string): string {
  return (
    title
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "mon-livre-de-coloriage"
  )
}

/**
 * Génère un vrai PDF vectoriel du livre à partir du modèle `ColoringBook`.
 * - A4 (ou format choisi), marges 10 mm (gérées dans vectorBookPdf).
 * - Chaque SVG centré, couverture + pages + fin de livre.
 * - Raster de secours si aucun SVG disponible.
 */
export async function generateBookPdf(book: ColoringBook): Promise<Blob> {
  const dims = BOOK_FORMATS[book.format] ?? [210, 297]
  const isLandscape = book.orientation === "Paysage"
  const w = isLandscape ? dims[1] : dims[0]
  const h = isLandscape ? dims[0] : dims[1]
  const palette = PALETTE_COLORS[book.palette] ?? PALETTE_COLORS.Purple

  const pages = book.pages.map((p) => {
    if (p.type === "drawing") {
      return {
        type: "drawing" as const,
        label: p.title,
        svgUrl: p.svgPath,
        svg: p.svg,
        rasterUrl: p.image,
      }
    }
    return {
      type: p.type,
      label: p.title,
      title: book.title,
      subtitle: book.subtitle,
      author: book.author,
      childName: book.childName,
    }
  })

  return generateVectorBookPdf({
    pages,
    coverSvgUrl: `/illustrations/covers/cover-${book.cover}.svg`,
    palette,
    format: { w, h },
    orientation: isLandscape ? "landscape" : "portrait",
    filename: `${slug(book.title)}-petit-baobab.pdf`,
  })
}

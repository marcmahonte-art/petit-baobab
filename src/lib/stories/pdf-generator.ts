// ============================================================
// Petit Baobab — Générateur d'Album PDF pour Enfants (Section 10 & 28)
// Format A4 Paysage / Portrait avec mise en page conte de fées
// ============================================================

import { jsPDF } from "jspdf"
import type { Story } from "./types"

/** Cadre de l'illustration sur les pages de récit (mm). */
const STORY_FRAME = { x: 20, y: 32, w: 120, h: 140, r: 4 }
/** Cadre de l'illustration sur la couverture (mm). */
const COVER_FRAME = { x: 60, y: 78, w: 177, h: 78, r: 6 }

interface LoadedImage {
  dataUrl: string
  width: number
  height: number
}

/**
 * Charge une illustration, la recadre en « cover » sur le ratio demandé et la
 * renvoie en JPEG.
 *
 * Pourquoi passer par un canvas : les illustrations du site sont des WebP, un
 * format que jsPDF n'embarque pas de façon fiable. Le canvas les normalise en
 * JPEG quel que soit le format source.
 *
 * Côté serveur (aucun DOM disponible), renvoie `null` : l'appelant retombe
 * alors sur le cadre décoratif.
 */
async function loadImageAsJpeg(
  url: string,
  targetAspect: number,
  maxWidth = 1400
): Promise<LoadedImage | null> {
  if (typeof document === "undefined" || !url) return null

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = document.createElement("img")
      el.crossOrigin = "anonymous"
      el.decoding = "async"
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error("image load failed"))
      el.src = url
    })

    const nw = img.naturalWidth
    const nh = img.naturalHeight
    if (!nw || !nh) return null

    // Recadrage « cover » : on conserve la plus grande zone au bon ratio.
    let sw = nw
    let sh = nh
    let sx = 0
    let sy = 0
    if (nw / nh > targetAspect) {
      sw = nh * targetAspect
      sx = (nw - sw) / 2
    } else {
      sh = nw / targetAspect
      sy = (nh - sh) / 2
    }

    const outW = Math.max(1, Math.min(maxWidth, Math.round(sw)))
    const outH = Math.max(1, Math.round(outW / targetAspect))

    const canvas = document.createElement("canvas")
    canvas.width = outW
    canvas.height = outH
    const ctx = canvas.getContext("2d")
    if (!ctx) return null

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH)

    return { dataUrl: canvas.toDataURL("image/jpeg", 0.88), width: outW, height: outH }
  } catch {
    return null
  }
}

/** Dessine une image à coins arrondis (repli sans arrondi si le clip échoue). */
function drawRoundedImage(
  doc: jsPDF,
  dataUrl: string,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  let clipped = false
  try {
    doc.saveGraphicsState()
    doc.roundedRect(x, y, w, h, r, r, null)
    doc.clip()
    doc.discardPath()
    clipped = true
  } catch {
    clipped = false
  }

  doc.addImage(dataUrl, "JPEG", x, y, w, h, undefined, "FAST")

  if (clipped) {
    try {
      doc.restoreGraphicsState()
    } catch {
      // Rien à faire : le clip restera actif sur le reste de la page.
    }
  }
}

export async function generateStoryPdf(story: Story): Promise<jsPDF> {
  // Format A4 Paysage (297mm x 210mm) adapté aux albums jeunesse illustrés
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  })

  const pageWidth = 297
  const pageHeight = 210

  const pages = story.pages || []

  // Les illustrations sont chargées en parallèle avant le dessin : le rendu
  // reste ensuite purement séquentiel (jsPDF n'est pas réentrant).
  const [coverImage, ...pageImages] = await Promise.all([
    loadImageAsJpeg(
      story.coverUrl,
      COVER_FRAME.w / COVER_FRAME.h,
      1600
    ),
    ...pages.map((page) =>
      loadImageAsJpeg(
        page.illustrationUrl || story.coverUrl,
        STORY_FRAME.w / STORY_FRAME.h
      )
    ),
  ])

  // ------------------------------------------------------------
  // PAGE 1 : Couverture du Livre
  // ------------------------------------------------------------
  // Fond chaleureux crème / vanille Petit Baobab
  doc.setFillColor(255, 249, 242)
  doc.rect(0, 0, pageWidth, pageHeight, "F")

  // Bordure décorative dorée
  doc.setDrawColor(255, 179, 0)
  doc.setLineWidth(1.5)
  doc.rect(12, 12, pageWidth - 24, pageHeight - 24)

  doc.setDrawColor(125, 106, 248)
  doc.setLineWidth(0.5)
  doc.rect(14, 14, pageWidth - 28, pageHeight - 28)

  // En-tête Collection
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(125, 106, 248) // Violet Petit Baobab
  doc.text("PETIT BAOBAB — HISTOIRES MAGIQUES D'AFRIQUE", pageWidth / 2, 30, { align: "center" })

  // Titre de l'histoire
  doc.setFontSize(26)
  doc.setTextColor(59, 36, 22) // Brun chaud
  const splitTitle = doc.splitTextToSize(story.title, pageWidth - 60)
  doc.text(splitTitle, pageWidth / 2, 52, { align: "center" })

  // Badge Pays / Thème
  doc.setFontSize(13)
  doc.setFont("helvetica", "normal")
  doc.setTextColor(104, 76, 56)
  const metaText = `${story.country || "Afrique"} • Thème : ${story.category || "Aventure"} • Âge : ${story.ageRange}`
  doc.text(metaText, pageWidth / 2, 70, { align: "center" })

  // Illustration de couverture (recadrée dans son cadre arrondi)
  if (coverImage) {
    drawRoundedImage(
      doc,
      coverImage.dataUrl,
      COVER_FRAME.x,
      COVER_FRAME.y,
      COVER_FRAME.w,
      COVER_FRAME.h,
      COVER_FRAME.r
    )
    doc.setDrawColor(230, 215, 195)
    doc.setLineWidth(0.6)
    doc.roundedRect(COVER_FRAME.x, COVER_FRAME.y, COVER_FRAME.w, COVER_FRAME.h, COVER_FRAME.r, COVER_FRAME.r)
  } else {
    // Repli : cadre décoratif si l'illustration n'a pas pu être chargée
    doc.setFillColor(255, 240, 206)
    doc.roundedRect(COVER_FRAME.x, COVER_FRAME.y, COVER_FRAME.w, COVER_FRAME.h, COVER_FRAME.r, COVER_FRAME.r, "F")
  }

  // Résumé sous l'illustration
  doc.setFont("helvetica", "italic")
  doc.setFontSize(11.5)
  doc.setTextColor(130, 95, 65)
  const descLines = doc
    .splitTextToSize(`"${story.description || ""}"`, pageWidth - 90)
    .slice(0, 2)
  doc.text(descLines, pageWidth / 2, 166, { align: "center" })

  // Bas de couverture : signature et devise
  doc.setFont("helvetica", "bold")
  doc.setFontSize(13)
  doc.setTextColor(32, 201, 151) // Vert Baobab
  doc.text("Un livre personnalisé pour imaginer, apprendre et grandir", pageWidth / 2, 180, { align: "center" })

  doc.setFontSize(10)
  doc.setTextColor(150, 140, 130)
  doc.text("Éditions Petit Baobab • www.monpetitbaobab.com", pageWidth / 2, 191, { align: "center" })

  // ------------------------------------------------------------
  // PAGES 1 à 10 : Les chapitres illustrés
  // ------------------------------------------------------------
  for (let index = 0; index < pages.length; index += 1) {
    const page = pages[index]
    const illustration = pageImages[index]

    doc.addPage()

    // Fond doux
    doc.setFillColor(255, 252, 248)
    doc.rect(0, 0, pageWidth, pageHeight, "F")

    // Liseré discret
    doc.setDrawColor(240, 231, 218)
    doc.setLineWidth(0.8)
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20)

    // En-tête haut de page
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10)
    doc.setTextColor(125, 106, 248)
    doc.text(`PETIT BAOBAB • ${story.title.toUpperCase()}`, 18, 20)

    doc.setTextColor(255, 179, 0)
    doc.text(`PAGE ${page.pageNumber || index + 1} / ${pages.length}`, pageWidth - 18, 20, { align: "right" })

    // Séparateur
    doc.setDrawColor(240, 230, 215)
    doc.line(18, 23, pageWidth - 18, 23)

    // Colonne gauche : illustration du récit
    if (illustration) {
      doc.setFillColor(255, 245, 230)
      doc.setDrawColor(230, 215, 195)
      doc.setLineWidth(0.6)
      doc.roundedRect(STORY_FRAME.x, STORY_FRAME.y, STORY_FRAME.w, STORY_FRAME.h, STORY_FRAME.r, STORY_FRAME.r, "FD")
      drawRoundedImage(
        doc,
        illustration.dataUrl,
        STORY_FRAME.x,
        STORY_FRAME.y,
        STORY_FRAME.w,
        STORY_FRAME.h,
        STORY_FRAME.r
      )
      doc.setDrawColor(230, 215, 195)
      doc.setLineWidth(0.6)
      doc.roundedRect(STORY_FRAME.x, STORY_FRAME.y, STORY_FRAME.w, STORY_FRAME.h, STORY_FRAME.r, STORY_FRAME.r)
    } else {
      // Repli : cadre décoratif si l'illustration n'a pas pu être chargée
      doc.setFillColor(255, 245, 230)
      doc.setDrawColor(230, 215, 195)
      doc.roundedRect(STORY_FRAME.x, STORY_FRAME.y, STORY_FRAME.w, STORY_FRAME.h, STORY_FRAME.r, STORY_FRAME.r, "FD")

      doc.setFont("helvetica", "italic")
      doc.setFontSize(11)
      doc.setTextColor(140, 110, 85)
      doc.text("Illustration originale Petit Baobab", STORY_FRAME.x + STORY_FRAME.w / 2, STORY_FRAME.y + 63, {
        align: "center",
      })
      doc.text(`Scène ${page.pageNumber || index + 1}`, STORY_FRAME.x + STORY_FRAME.w / 2, STORY_FRAME.y + 73, {
        align: "center",
      })
    }

    // Colonne droite : Récit du conte
    const textStartX = 152
    const textWidth = pageWidth - textStartX - 22

    // Numéro de page ornemental
    doc.setFont("helvetica", "bold")
    doc.setFontSize(36)
    doc.setTextColor(255, 179, 0)
    doc.text(`${page.pageNumber || index + 1}`, textStartX, 45)

    // Texte du récit
    doc.setFont("helvetica", "normal")
    doc.setFontSize(14)
    doc.setTextColor(59, 36, 22)

    const storyLines = doc.splitTextToSize(page.text || "", textWidth)
    doc.text(storyLines, textStartX, 60, { lineHeightFactor: 1.6 })

    // Dernière page : Message moral et éducatif
    if (index === pages.length - 1) {
      doc.setFillColor(240, 253, 248)
      doc.setDrawColor(32, 201, 151)
      doc.roundedRect(textStartX, 135, textWidth, 35, 4, 4, "FD")

      doc.setFont("helvetica", "bold")
      doc.setFontSize(11)
      doc.setTextColor(32, 201, 151)
      doc.text("LE CONSEIL DU PETIT BAOBAB", textStartX + 6, 144)

      doc.setFont("helvetica", "italic")
      doc.setFontSize(11)
      doc.setTextColor(59, 36, 22)
      doc.text("Bravo pour cette belle lecture ! Le savoir est un trésor infini.", textStartX + 6, 155)
    }

    // Pied de page
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(170, 160, 150)
    doc.text("Petit Baobab — Créateur d'histoires africaines", pageWidth / 2, pageHeight - 14, { align: "center" })
  }

  return doc
}

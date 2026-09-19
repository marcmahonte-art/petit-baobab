// ============================================================
// Petit Baobab — Générateur d'Album PDF pour Enfants (Section 10 & 28)
// Format A4 Paysage / Portrait avec mise en page conte de fées
// ============================================================

import { jsPDF } from "jspdf"
import type { Story } from "./types"

export async function generateStoryPdf(story: Story): Promise<jsPDF> {
  // Format A4 Paysage (297mm x 210mm) adapté aux albums jeunesse illustrés
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  })

  const pageWidth = 297
  const pageHeight = 210

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

  // Cadre central décoratif (Illustration ou médaillon)
  doc.setFillColor(255, 240, 206)
  doc.roundedRect(60, 80, pageWidth - 120, 75, 6, 6, "F")

  doc.setFont("helvetica", "italic")
  doc.setFontSize(12)
  doc.setTextColor(130, 95, 65)
  const descLines = doc.splitTextToSize(`"${story.description}"`, pageWidth - 140)
  doc.text(descLines, pageWidth / 2, 115, { align: "center" })

  // Bas de couverture : signature de l'enfant et devise
  doc.setFont("helvetica", "bold")
  doc.setFontSize(13)
  doc.setTextColor(32, 201, 151) // Vert Baobab
  doc.text("Un livre personnalisé pour imaginer, apprendre et grandir", pageWidth / 2, 175, { align: "center" })

  doc.setFontSize(10)
  doc.setTextColor(150, 140, 130)
  doc.text("Éditions Petit Baobab • www.monpetitbaobab.com", pageWidth / 2, 188, { align: "center" })

  // ------------------------------------------------------------
  // PAGES 1 à 10 : Les chapitres illustrés
  // ------------------------------------------------------------
  story.pages.forEach((page, index) => {
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
    doc.text(`PAGE ${page.pageNumber || index + 1} / ${story.pages.length}`, pageWidth - 18, 20, { align: "right" })

    // Séparateur
    doc.setDrawColor(240, 230, 215)
    doc.line(18, 23, pageWidth - 18, 23)

    // Colonne gauche : Cadre d'illustration (125mm x 140mm)
    doc.setFillColor(255, 245, 230)
    doc.setDrawColor(230, 215, 195)
    doc.roundedRect(20, 32, 120, 140, 4, 4, "FD")

    // Pictogramme ou mention de scène
    doc.setFont("helvetica", "italic")
    doc.setFontSize(11)
    doc.setTextColor(140, 110, 85)
    doc.text("Illustration originale Petit Baobab", 80, 95, { align: "center" })
    doc.text(`Scène ${page.pageNumber || index + 1}`, 80, 105, { align: "center" })

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

    const storyLines = doc.splitTextToSize(page.text, textWidth)
    doc.text(storyLines, textStartX, 60, { lineHeightFactor: 1.6 })

    // Dernière page : Message moral et éducatif
    if (index === story.pages.length - 1) {
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
  })

  return doc
}

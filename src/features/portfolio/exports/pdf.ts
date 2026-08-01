import { jsPDF } from "jspdf"
import type { PortfolioEvent } from "../types"
import { portfolioEngine } from "../engine/portfolio-engine"
import { formatDuration } from "../statistics"
import type { SouvenirBookData } from "./types"

function frDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
  } catch {
    return new Date().toLocaleDateString("fr-FR")
  }
}

async function fetchAsDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

/**
 * Génère le "Livre souvenir" PDF (A4 portrait, multi-pages).
 * Couverture, statistiques, timeline, certificats, messages et signature.
 */
export async function generateSouvenirBookPdf(data: SouvenirBookData, qrDataUrl: string | null): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
  const pageW = 210
  const pageH = 297
  const margin = 18
  const accent = data.accent ?? "#FF8A00"
  let y = margin

  const ensureSpace = (needed: number) => {
    if (y + needed > pageH - margin) {
      doc.addPage()
      y = margin
    }
  }

  const centerText = (text: string, size: number, bold = false, color: [number, number, number] = [59, 36, 22]) => {
    doc.setFont("helvetica", bold ? "bold" : "normal")
    doc.setFontSize(size)
    doc.setTextColor(color[0], color[1], color[2])
    doc.text(text, pageW / 2, y, { align: "center" })
    y += size * 0.55
  }

  // ---------------------------------------------------------------------------
  // Couverture
  // ---------------------------------------------------------------------------
  doc.setFillColor(255, 247, 236)
  doc.rect(0, 0, pageW, pageH, "F")
  doc.setDrawColor(accent)
  doc.setLineWidth(3)
  doc.rect(margin, margin, pageW - margin * 2, pageH - margin * 2)

  y = 70
  doc.setTextColor(120, 106, 94)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(16)
  doc.text("PETIT BAOBAB", pageW / 2, y, { align: "center" })
  y += 26

  doc.setTextColor(59, 36, 22)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(32)
  doc.text("Mon livre souvenir", pageW / 2, y, { align: "center" })
  y += 20

  doc.setFontSize(20)
  doc.setTextColor(accent)
  doc.text(data.childName || "Petit Explorateur", pageW / 2, y, { align: "center" })
  y += 16

  doc.setFont("helvetica", "normal")
  doc.setFontSize(13)
  doc.setTextColor(120, 106, 94)
  doc.text(`Année ${data.year}`, pageW / 2, y, { align: "center" })

  if (data.mascotUrl) {
    const img = await fetchAsDataUrl(data.mascotUrl)
    if (img) {
      doc.addImage(img, "PNG", pageW / 2 - 18, y + 20, 36, 36)
    }
  }

  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(59, 36, 22)
  doc.text("Petit Baobab", pageW / 2, 250, { align: "center" })

  if (qrDataUrl) {
    try {
      doc.addImage(qrDataUrl, "PNG", margin + 14, pageH - margin - 44, 30, 30)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      doc.setTextColor(120, 106, 94)
      doc.text("Le musée de", margin + 14, pageH - margin - 8)
      doc.text("l'enfant", margin + 14, pageH - margin - 3)
    } catch {
      // QR indisponible
    }
  }

  // ---------------------------------------------------------------------------
  // Statistiques
  // ---------------------------------------------------------------------------
  doc.addPage()
  y = margin + 10
  centerText(data.timelineLabel, 18, true)
  centerText(`Les chiffres de ${data.childName || "mon année"}`, 12, false, [120, 106, 94])

  const statRows: [string, string | number][] = [
    ["Coloriages", data.stats.colorings],
    ["Livres", data.stats.books],
    ["Dessins", data.stats.drawings],
    ["Dessins magiques", data.stats.magicDrawings],
    ["Histoires", data.stats.stories],
    ["Quiz réussis", data.stats.quizzes],
    ["Jeux terminés", data.stats.games],
    ["Badges", data.stats.badges],
    ["Défis réalisés", data.stats.challenges],
    ["Parcours terminés", data.stats.pathsCompleted],
    ["Certificats", data.stats.certificates],
    ["Collections", data.stats.collections],
    ["XP gagnés", data.stats.xp],
    ["Étoiles gagnées", data.stats.stars],
    ["Temps de jeu", formatDuration(data.stats.timePlayedSeconds)],
  ]

  y += 6
  for (const [label, value] of statRows) {
    ensureSpace(10)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(12)
    doc.setTextColor(59, 36, 22)
    doc.text(label, margin, y)
    doc.setFont("helvetica", "bold")
    doc.text(String(value), pageW - margin, y, { align: "right" })
    doc.setDrawColor(240, 231, 218)
    doc.setLineWidth(0.3)
    doc.line(margin, y + 2.5, pageW - margin, y + 2.5)
    y += 10
  }

  // ---------------------------------------------------------------------------
  // Timeline (meilleurs moments)
  // ---------------------------------------------------------------------------
  doc.addPage()
  y = margin + 10
  centerText("Mes plus beaux moments", 18, true)

  const featured = [...data.events].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 40)
  for (const event of featured) {
    ensureSpace(14)
    const icon = portfolioEngine.getEventMeta(event.event_type).icon
    const line = `${icon} ${event.title} — ${frDate(event.created_at)}`
    doc.setFont("helvetica", "normal")
    doc.setFontSize(12)
    doc.setTextColor(59, 36, 22)
    const wrapped = doc.splitTextToSize(line, pageW - margin * 2)
    doc.text(wrapped, margin, y)
    y += wrapped.length * 6 + 1
  }

  // ---------------------------------------------------------------------------
  // Certificats
  // ---------------------------------------------------------------------------
  if (data.certificates.length > 0) {
    doc.addPage()
    y = margin + 10
    centerText("Mes certificats", 18, true)
    for (const cert of data.certificates) {
      ensureSpace(12)
      doc.setFont("helvetica", "bold")
      doc.setFontSize(13)
      doc.setTextColor(accent)
      doc.text(`📜 ${cert.title}`, margin, y)
      y += 7
      doc.setFont("helvetica", "normal")
      doc.setFontSize(11)
      doc.setTextColor(120, 106, 94)
      doc.text(frDate(cert.date), margin, y)
      y += 12
    }
  }

  // ---------------------------------------------------------------------------
  // Messages de la capsule temporelle
  // ---------------------------------------------------------------------------
  if (data.messages.length > 0) {
    doc.addPage()
    y = margin + 10
    centerText("Messages pour plus tard", 18, true)
    for (const msg of data.messages) {
      ensureSpace(16)
      doc.setDrawColor(accent)
      doc.setLineWidth(0.5)
      doc.roundedRect(margin, y - 5, pageW - margin * 2, 14, 2, 2)
      doc.setFont("helvetica", "italic")
      doc.setFontSize(11)
      doc.setTextColor(59, 36, 22)
      const wrapped = doc.splitTextToSize(`« ${msg.message} »`, pageW - margin * 2 - 8)
      doc.text(wrapped, margin + 4, y)
      y += wrapped.length * 5.5 + 8
      if (msg.author) {
        doc.setFont("helvetica", "normal")
        doc.setFontSize(10)
        doc.setTextColor(120, 106, 94)
        doc.text(`— ${msg.author}`, pageW - margin - 4, y, { align: "right" })
        y += 6
      }
    }
  }

  doc.setPage(doc.getNumberOfPages())
  const lastPageH = doc.internal.pageSize.getHeight()
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(160, 150, 140)
  doc.text("Fait avec ❤️ par Petit Baobab", pageW / 2, lastPageH - 15, { align: "center" })

  doc.save(`livre-souvenir-${data.year}.pdf`)
}

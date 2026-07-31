"use client"

import { jsPDF } from "jspdf"
import type { CertificatePdfData, PathTheme } from "../types"
import { getTheme } from "../constants"

const A4_LANDSCAPE = { width: 297, height: 210 }

function themeAccent(theme: PathTheme): string {
  return getTheme(theme).accent
}

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
 * Génère un certificat PDF A4 paysage.
 * Contenu : nom, photo de la mascotte, nom du parcours, date,
 * signature Petit Baobab et QR code de vérification.
 */
export async function generateCertificatePdf(
  data: CertificatePdfData,
  qrDataUrl: string | null,
  mascotUrl?: string,
): Promise<void> {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
  const { width, height } = A4_LANDSCAPE
  const accent = themeAccent(data.pathTheme)
  const margin = 12

  // Cadre décoratif
  doc.setDrawColor(accent)
  doc.setLineWidth(2)
  doc.rect(margin, margin, width - margin * 2, height - margin * 2)

  doc.setDrawColor(accent)
  doc.setLineWidth(0.6)
  doc.rect(margin + 6, margin + 6, width - (margin + 6) * 2, height - (margin + 6) * 2)

  // En-tête
  doc.setTextColor(120, 106, 94)
  doc.setFont("helvetica", "normal")
  doc.setFontSize(13)
  doc.text("PETIT BAOBAB", width / 2, 32, { align: "center" })

  doc.setTextColor(59, 36, 22)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(26)
  doc.text("Certificat de réussite", width / 2, 52, { align: "center" })

  doc.setFontSize(15)
  doc.text("Ce certificat est décerné à", width / 2, 70, { align: "center" })

  // Nom de l'enfant
  doc.setFont("helvetica", "bold")
  doc.setFontSize(40)
  doc.setTextColor(accent)
  doc.text(data.childName || "Petit Explorateur", width / 2, 92, { align: "center" })

  doc.setFont("helvetica", "normal")
  doc.setFontSize(15)
  doc.setTextColor(59, 36, 22)
  doc.text("pour avoir terminé avec brio le parcours", width / 2, 108, { align: "center" })

  doc.setFont("helvetica", "bold")
  doc.setFontSize(22)
  doc.setTextColor(255, 138, 0)
  doc.text(data.pathTitle, width / 2, 124, { align: "center" })

  // Date
  doc.setFont("helvetica", "normal")
  doc.setFontSize(13)
  doc.setTextColor(120, 106, 94)
  doc.text(`Fait le ${frDate(data.issuedAt)}`, width / 2, 148, { align: "center" })

  // Signature Petit Baobab
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  doc.setTextColor(59, 36, 22)
  doc.text("Petit Baobab", width / 2, 172, { align: "center" })

  // Mascotte
  if (mascotUrl) {
    const img = await fetchAsDataUrl(mascotUrl)
    if (img) {
      doc.addImage(img, "PNG", width / 2 - 14, 178, 28, 28)
    }
  }

  // QR Code (coin inférieur gauche du cadre)
  if (qrDataUrl) {
    try {
      doc.addImage(qrDataUrl, "PNG", margin + 12, height - margin - 46, 34, 34)
      doc.setFont("helvetica", "normal")
      doc.setFontSize(9)
      doc.setTextColor(120, 106, 94)
      doc.text("Scan pour vérifier", margin + 12, height - margin - 4)
      doc.text("ce certificat", margin + 12, height - margin - 1)
    } catch {
      // QR indisponible : on continue sans lui.
    }
  }

  doc.save(`certificat-${data.pathTitle.replace(/[^a-zA-Z0-9]+/g, "-")}.pdf`)
}

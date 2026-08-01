"use client"

import { portfolioEngine } from "../engine/portfolio-engine"
import type { ShareItem } from "./types"

const CARD_SIZE = 1080

/**
 * Crée une image de partage optimisée (carte carrée 1080×1080)
 * à partir d'un événement / dessin / livre / certificat / album.
 */
export async function generateShareCard(item: ShareItem, childName = "Petit Explorateur"): Promise<Blob | null> {
  const canvas = document.createElement("canvas")
  canvas.width = CARD_SIZE
  canvas.height = CARD_SIZE
  const ctx = canvas.getContext("2d")
  if (!ctx) return null

  // Fond dégradé
  const gradient = ctx.createLinearGradient(0, 0, 0, CARD_SIZE)
  gradient.addColorStop(0, "#FFE08A")
  gradient.addColorStop(1, "#FFB84D")
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, CARD_SIZE, CARD_SIZE)

  // Cadre
  ctx.strokeStyle = "rgba(59,36,22,0.25)"
  ctx.lineWidth = 18
  ctx.strokeRect(36, 36, CARD_SIZE - 72, CARD_SIZE - 72)

  ctx.textAlign = "center"
  ctx.fillStyle = "#3B2416"

  // Icône catégorie
  const category = item.event ? portfolioEngine.categoryOfEvent(item.event) : null
  const icon = category ? portfolioEngine.categoryIcon(category) : "📌"
  ctx.font = "150px serif"
  ctx.fillText(icon, CARD_SIZE / 2, 320)

  // Image de la création (si disponible)
  if (item.image) {
    try {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.src = item.image
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })
      const size = 560
      const x = (CARD_SIZE - size) / 2
      const y = 120
      ctx.fillStyle = "#FFFFFF"
      ctx.fillRect(x - 8, y - 8, size + 16, size + 16)
      ctx.drawImage(img, x, y, size, size)
    } catch {
      // Sans image : l'icône suffit.
    }
  }

  // Titre
  ctx.font = "bold 84px sans-serif"
  ctx.fillStyle = "#3B2416"
  const title = item.title.length > 36 ? `${item.title.slice(0, 34)}…` : item.title
  ctx.fillText(title, CARD_SIZE / 2, item.image ? 820 : 520, CARD_SIZE - 140)

  // Sous-titre / date
  if (item.subtitle) {
    ctx.font = "52px sans-serif"
    ctx.fillStyle = "rgba(59,36,22,0.7)"
    const subtitle = item.subtitle.length > 60 ? `${item.subtitle.slice(0, 58)}…` : item.subtitle
    ctx.fillText(subtitle, CARD_SIZE / 2, item.image ? 900 : 600, CARD_SIZE - 160)
  }

  // Pied de page
  ctx.font = "48px sans-serif"
  ctx.fillStyle = "rgba(59,36,22,0.55)"
  ctx.fillText(`Petit Baobab · ${childName}`, CARD_SIZE / 2, 990)

  return await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/png")
  })
}

/** Partage une carte via WhatsApp (partage natif avec fichier si dispo). */
export async function shareToWhatsApp(item: ShareItem, childName?: string): Promise<{ shared: boolean; url?: string }> {
  const blob = await generateShareCard(item, childName)
  const text = `${item.title} — Petit Baobab`

  if (blob && typeof navigator !== "undefined" && "canShare" in navigator && navigator.canShare?.({ files: [new File([blob], "partage.png", { type: "image/png" })] })) {
    try {
      await navigator.share({
        files: [new File([blob], "partage.png", { type: "image/png" })],
        text,
      })
      return { shared: true }
    } catch {
      // Abandon → fallback URL WhatsApp.
    }
  }

  const url = `https://wa.me/?text=${encodeURIComponent(text)}`
  if (typeof window !== "undefined") {
    window.open(url, "_blank", "noopener,noreferrer")
  }
  return { shared: false, url }
}

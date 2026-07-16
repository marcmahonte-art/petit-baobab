"use client"

import type { BookFormat, BookOrientation, CoverPalette } from "@/features/coloring-book/types"

export interface VectorBookPage {
  type: "cover" | "belongs_to" | "drawing"
  label?: string
  /** Prebuilt vector SVG string (preferred) */
  svg?: string
  /** Vector SVG URL (fetched + minified) */
  svgUrl?: string
  /** Raster fallback (PNG/JPEG/data URL) */
  rasterUrl?: string
  title?: string
  subtitle?: string
  author?: string
  childName?: string
}

export interface PaletteColors {
  primary: string
  secondary: string
  text: string
}

export interface GenerateVectorBookParams {
  pages: VectorBookPage[]
  coverSvgUrl: string
  palette: PaletteColors
  format: { w: number; h: number }
  orientation: "portrait" | "landscape"
  filename: string
  onProgress?: (progress: number) => void
}

const hexToRgb = (hex: string): [number, number, number] => {
  const h = hex.replace("#", "")
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h
  const n = parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function minifySvg(svg: string): string {
  return svg
    .replace(/<\?xml[\s\S]*?\?>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .replace(/>\s+</g, "><")
    .replace(/\s+\/>/g, "/>")
    .trim()
}

async function fetchSvgText(url: string): Promise<string> {
  const abs = url.startsWith("data:") || url.startsWith("http") ? url : `${window.location.origin}${url}`
  const res = await fetch(abs)
  return minifySvg(await res.text())
}

function parseSvg(svg: string): SVGSVGElement {
  const doc = new DOMParser().parseFromString(svg, "image/svg+xml")
  const el = doc.documentElement as unknown as SVGSVGElement
  if (!el || el.tagName.toLowerCase() !== "svg") throw new Error("Invalid SVG")
  return el
}

async function embedSvg(
  svg2pdfFn: (el: Element, pdf: any, opts: object) => Promise<any>,
  doc: any,
  svg: string,
  box: { x: number; y: number; width: number; height: number },
): Promise<void> {
  const el = parseSvg(svg)
  const holder = document.createElement("div")
  holder.style.position = "absolute"
  holder.style.left = "-99999px"
  holder.style.top = "0"
  holder.appendChild(el)
  document.body.appendChild(holder)
  try {
    await svg2pdfFn(el, doc, { x: box.x, y: box.y, width: box.width, height: box.height })
  } finally {
    document.body.removeChild(holder)
  }
}

async function loadRaster(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    const abs = url.startsWith("data:") || url.startsWith("http") ? url : `${window.location.origin}${url}`
    img.src = abs
  })
}

type Svg2pdfFn = (el: Element, pdf: any, opts: object) => Promise<any>

export async function generateVectorBookPdf(params: GenerateVectorBookParams): Promise<Blob> {
  const { jsPDF } = await import("jspdf")
  const { svg2pdf } = await import("svg2pdf.js")

  const { pages, coverSvgUrl, palette, format, orientation, onProgress } = params
  const doc = new jsPDF({
    orientation,
    unit: "mm",
    format: [format.w, format.h],
    compress: true,
  })

  const margin = 18
  const pw = format.w
  const ph = format.h
  const total = pages.length

  for (let i = 0; i < total; i++) {
    if (i > 0) doc.addPage()
    const page = pages[i]

    if (page.type === "cover") {
      await renderCover(svg2pdf, doc, page, { pw, ph, margin, palette, coverSvgUrl })
    } else if (page.type === "belongs_to") {
      renderBelongs(doc, page, { pw, ph, palette })
    } else {
      await renderDrawing(svg2pdf, doc, page, { pw, ph, margin })
    }

    onProgress?.(Math.round(((i + 1) / total) * 90))
  }

  const blob = doc.output("blob")
  onProgress?.(100)
  return blob
}

async function renderCover(
  svg2pdf: Svg2pdfFn,
  doc: any,
  page: VectorBookPage,
  ctx: { pw: number; ph: number; margin: number; palette: PaletteColors; coverSvgUrl: string },
) {
  const { pw, ph, margin, palette, coverSvgUrl } = ctx
  const cx = pw / 2

  doc.setFillColor(...hexToRgb(palette.secondary))
  doc.rect(0, 0, pw, ph, "F")
  doc.setDrawColor(...hexToRgb(palette.primary))
  doc.setLineWidth(1.2)
  doc.rect(margin / 2, margin / 2, pw - margin, ph - margin, "S")

  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.setTextColor(...hexToRgb("#3B2416"))
  doc.text("PETIT BAOBAB", cx, margin, { align: "center" })

  doc.setFontSize(20)
  doc.setTextColor(...hexToRgb(palette.text))
  doc.text((page.title || "Mon livre de coloriage").toUpperCase(), cx, margin + 14, {
    align: "center",
    maxWidth: pw - margin * 2,
  })

  if (page.subtitle) {
    doc.setFont("helvetica", "italic")
    doc.setFontSize(12)
    doc.setTextColor(...hexToRgb("#7A6A5E"))
    doc.text(page.subtitle, cx, margin + 24, { align: "center", maxWidth: pw - margin * 2 })
  }
  doc.setFont("helvetica", "bold")

  const areaY = margin + 32
  const areaH = ph - margin * 2 - 32 - 28
  try {
    const coverSvg = await fetchSvgText(coverSvgUrl)
    const el = parseSvg(coverSvg)
    const vb = el.viewBox.baseVal
    const iw = vb && vb.width ? vb.width : 300
    const ih = vb && vb.height ? vb.height : 366
    const scale = Math.min((pw - margin * 2) / iw, areaH / ih)
    const dw = iw * scale
    const dh = ih * scale
    await embedSvg(svg2pdf, doc, coverSvg, { x: cx - dw / 2, y: areaY + (areaH - dh) / 2, width: dw, height: dh })
  } catch (e) {
    console.warn("Cover SVG embed failed, skipping motif", e)
  }

  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)
  doc.setTextColor(...hexToRgb("#1F2937"))
  doc.text(`Par : ${page.author || "Auteur"}`, cx, ph - margin - 14, { align: "center" })
  if (page.childName) {
    doc.setFontSize(9)
    doc.setTextColor(...hexToRgb("#64748B"))
    doc.text(`Créé pour ${page.childName}`, cx, ph - margin - 6, { align: "center" })
  }
}

function renderBelongs(doc: any, page: VectorBookPage, ctx: { pw: number; ph: number; palette: PaletteColors }) {
  const { pw, ph, palette } = ctx
  const cx = pw / 2
  doc.setFillColor(...hexToRgb(palette.secondary))
  doc.rect(0, 0, pw, ph, "F")
  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.setTextColor(...hexToRgb(palette.text))
  doc.text("Ce livre appartient à", cx, ph / 2 - 16, { align: "center" })
  doc.setFontSize(30)
  doc.text(page.childName || "Awa", cx, ph / 2 + 16, { align: "center" })
  doc.setFont("helvetica", "normal")
  doc.setFontSize(11)
  doc.setTextColor(...hexToRgb("#7A6A5E"))
  doc.text("Prépare tes crayons et amuse-toi bien !", cx, ph / 2 + 36, { align: "center" })
}

async function renderDrawing(
  svg2pdf: Svg2pdfFn,
  doc: any,
  page: VectorBookPage,
  ctx: { pw: number; ph: number; margin: number },
) {
  const { pw, ph, margin } = ctx
  const areaX = margin
  const areaY = margin + 12
  const areaW = pw - margin * 2
  const areaH = ph - margin * 2 - 12 - 10

  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  doc.setTextColor(...hexToRgb("#64748B"))
  doc.text(page.label || "Coloriage", margin, margin + 5)

  const box = { x: areaX, y: areaY, width: areaW, height: areaH }

  if (page.svg) {
    await embedSvg(svg2pdf, doc, page.svg, box)
  } else if (page.svgUrl) {
    try {
      const svg = await fetchSvgText(page.svgUrl)
      await embedSvg(svg2pdf, doc, svg, box)
    } catch {
      if (page.rasterUrl) await drawRaster(doc, page.rasterUrl, box)
    }
  } else if (page.rasterUrl) {
    await drawRaster(doc, page.rasterUrl, box)
  }

  doc.setFontSize(8)
  doc.setTextColor(...hexToRgb("#9CA3AF"))
  doc.text("Petit Baobab", pw / 2, ph - margin, { align: "center" })
}

async function drawRaster(doc: any, url: string, box: { x: number; y: number; width: number; height: number }) {
  const img = await loadRaster(url)
  if (!img) return
  const iw = img.naturalWidth || 800
  const ih = img.naturalHeight || 500
  const scale = Math.min(box.width / iw, box.height / ih)
  const dw = iw * scale
  const dh = ih * scale
  doc.addImage(img, "PNG", box.x + (box.width - dw) / 2, box.y + (box.height - dh) / 2, dw, dh)
}

export const BOOK_FORMATS: Record<BookFormat, [number, number]> = {
  A4: [210, 297],
  A5: [148, 210],
  Letter: [216, 279],
  Carré: [210, 210],
}

export const PALETTE_COLORS: Record<string, PaletteColors> = {
  Purple: { primary: "#6D4CFF", secondary: "#F1EFFF", text: "#4A4EBE" },
  Green: { primary: "#20C997", secondary: "#E6FAF4", text: "#0E7C5D" },
  Yellow: { primary: "#FFD95C", secondary: "#FFFDF2", text: "#8A6D00" },
  Orange: { primary: "#FFB300", secondary: "#FFF6E0", text: "#A35C00" },
  Blue: { primary: "#1194FF", secondary: "#E6F4FF", text: "#0056B3" },
  Pink: { primary: "#FF5E83", secondary: "#FFEBF0", text: "#B81C40" },
  Turquoise: { primary: "#13C6A2", secondary: "#E8FBF7", text: "#0B7F67" },
  Multicolore: { primary: "#7D4AF8", secondary: "#FFFDF7", text: "#3B2416" },
}

export type { BookOrientation, CoverPalette }

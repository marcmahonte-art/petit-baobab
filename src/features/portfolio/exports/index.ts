"use client"

/** Ouvre la boîte d'impression du navigateur (zone .print-area via CSS @media print). */
export function printPortfolio(): void {
  window.print()
}

/** Imprime une zone HTML précise (iframe cachée). */
export function printElement(html: string, title = "Petit Baobab"): void {
  const iframe = document.createElement("iframe")
  iframe.style.position = "fixed"
  iframe.style.right = "0"
  iframe.style.bottom = "0"
  iframe.style.width = "0"
  iframe.style.height = "0"
  iframe.style.border = "0"
  document.body.appendChild(iframe)

  const doc = iframe.contentWindow?.document
  if (!doc) return
  doc.open()
  doc.write(`<!DOCTYPE html><html><head><meta charset="utf-8" /><title>${title}</title>
    <style>
      body { font-family: system-ui, sans-serif; padding: 24px; color: #3B2416; }
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      @page { margin: 12mm; }
    </style></head><body>${html}</body></html>`)
  doc.close()

  iframe.contentWindow?.focus()
  iframe.contentWindow?.print()
  setTimeout(() => iframe.remove(), 1000)
}

export { generateSouvenirBookPdf } from "./pdf"
export { generateShareCard, shareToWhatsApp } from "./share"
export type { ShareItem, SouvenirBookData } from "./types"

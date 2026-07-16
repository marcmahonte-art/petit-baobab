/**
 * Lightweight SVG minifier: strips XML declaration, comments and redundant
 * whitespace. Safe for our cover/template SVGs (no whitespace-sensitive text).
 */
export function minifySvg(svg: string): string {
  return svg
    .replace(/<\?xml[\s\S]*?\?>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\s+/g, " ")
    .replace(/>\s+</g, "><")
    .replace(/\s+\/>/g, "/>")
    .trim()
}

/** Parses an SVG string into a live <svg> element (needed by svg2pdf.js). */
export function svgStringToElement(svg: string): SVGSVGElement {
  const doc = new DOMParser().parseFromString(svg, "image/svg+xml")
  const el = doc.documentElement as unknown as SVGSVGElement
  if (el && el.tagName.toLowerCase() !== "svg") {
    throw new Error("Invalid SVG document")
  }
  return el
}

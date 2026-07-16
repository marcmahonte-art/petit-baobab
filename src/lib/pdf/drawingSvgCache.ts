/**
 * Client-side cache mapping a drawing id to its VECTOR SVG string.
 * Avoids a DB migration: the colored vector is produced at save time
 * (DrawingEngine.toSVG) and reused at PDF generation.
 */
const PREFIX = "pb:drawing-svg:"

export function setDrawingSvg(id: string, svg: string): void {
  try {
    localStorage.setItem(PREFIX + id, svg)
  } catch {
    /* quota / private mode: ignore */
  }
}

export function getDrawingSvg(id: string): string | undefined {
  try {
    return localStorage.getItem(PREFIX + id) || undefined
  } catch {
    return undefined
  }
}

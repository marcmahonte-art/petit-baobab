import type { CSSProperties } from "react"
import type { BookFrame } from "../types"

/**
 * Vrais motifs décoratifs (SVG, pas d'emojis) utilisés comme cadre de livre.
 * Chaque motif est une tuile 48x48 encodée en data-URI et appliquée via
 * `border-image` (répétée le long du cadre).
 */

const tile = (body: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'>${body}</svg>`,
  )}")`

// Bogolan — mud-cloth malien : fond crème + géométrie marron
const bogolan = tile(`
  <rect width='48' height='48' fill='#F4E9D8'/>
  <g fill='none' stroke='#3B2416' stroke-width='2.5'>
    <path d='M24 6 L42 24 L24 42 L6 24 Z'/>
    <path d='M24 15 L33 24 L24 33 L15 24 Z'/>
    <line x1='0' y1='24' x2='48' y2='24' stroke-dasharray='3 4'/>
    <line x1='24' y1='0' x2='24' y2='48' stroke-dasharray='3 4'/>
  </g>
  <g fill='#3B2416'>
    <circle cx='6' cy='6' r='2.5'/><circle cx='42' cy='6' r='2.5'/>
    <circle cx='6' cy='42' r='2.5'/><circle cx='42' cy='42' r='2.5'/>
  </g>
`)

// Faso Dan Fani — tissu burkinabè : bandes verticales multicolores tissées
const faso = tile(`
  <rect width='48' height='48' fill='#FFE3C2'/>
  <rect x='0' width='12' height='48' fill='#FF5E83'/>
  <rect x='12' width='12' height='48' fill='#20C997'/>
  <rect x='24' width='12' height='48' fill='#FFD95C'/>
  <rect x='36' width='12' height='48' fill='#3B2416'/>
  <g stroke='#ffffff' stroke-width='1.5' opacity='0.5'>
    <line x1='0' y1='8' x2='48' y2='8'/><line x1='0' y1='24' x2='48' y2='24'/><line x1='0' y1='40' x2='48' y2='40'/>
  </g>
`)

// Nature — feuilles et vignes stylisées
const nature = tile(`
  <rect width='48' height='48' fill='#EAF7F0'/>
  <g fill='#20C997'>
    <path d='M24 8 C16 18 16 30 24 40 C32 30 32 18 24 8 Z'/>
  </g>
  <g fill='#0E7C5D'>
    <circle cx='10' cy='12' r='3'/><circle cx='38' cy='12' r='3'/>
    <circle cx='10' cy='38' r='3'/><circle cx='38' cy='38' r='3'/>
  </g>
`)

// Savane — soleil + rayons géométriques ambrés
const savane = tile(`
  <rect width='48' height='48' fill='#FFF6E0'/>
  <g fill='none' stroke='#FFB300' stroke-width='3'>
    <circle cx='24' cy='24' r='9'/>
    <g stroke='#A35C00'>
      <line x1='24' y1='2' x2='24' y2='8'/><line x1='24' y1='40' x2='24' y2='46'/>
      <line x1='2' y1='24' x2='8' y2='24'/><line x1='40' y1='24' x2='46' y2='24'/>
      <line x1='9' y1='9' x2='13' y2='13'/><line x1='35' y1='35' x2='39' y2='39'/>
      <line x1='39' y1='9' x2='35' y2='13'/><line x1='13' y1='35' x2='9' y2='39'/>
    </g>
  </g>
`)

// Animaux — empreintes de pattes
const animaux = tile(`
  <rect width='48' height='48' fill='#F3EEFF'/>
  <g fill='#7D6AF8'>
    <circle cx='24' cy='26' r='7'/>
    <circle cx='15' cy='14' r='3.5'/><circle cx='22' cy='10' r='3.5'/>
    <circle cx='33' cy='14' r='3.5'/><circle cx='26' cy='10' r='3.5'/>
  </g>
`)

export interface FrameStyle {
  borderWidth: string
  borderImageSource: string
  borderImageSlice: string
  borderImageRepeat: string
  fallback: string
}

export const FRAME_STYLES: Record<BookFrame, FrameStyle> = {
  Bogolan: { borderWidth: "16px", borderImageSource: bogolan, borderImageSlice: "24", borderImageRepeat: "round", fallback: "#3B2416" },
  "Faso Dan Fani": { borderWidth: "14px", borderImageSource: faso, borderImageSlice: "24", borderImageRepeat: "round", fallback: "#3B2416" },
  Nature: { borderWidth: "12px", borderImageSource: nature, borderImageSlice: "24", borderImageRepeat: "round", fallback: "#20C997" },
  Savane: { borderWidth: "12px", borderImageSource: savane, borderImageSlice: "24", borderImageRepeat: "round", fallback: "#FFB300" },
  Animaux: { borderWidth: "12px", borderImageSource: animaux, borderImageSlice: "24", borderImageRepeat: "round", fallback: "#7D6AF8" },
  Aucun: { borderWidth: "2px", borderImageSource: "none", borderImageSlice: "0", borderImageRepeat: "stretch", fallback: "#3B2416" },
}

export function frameBorderStyle(frame: BookFrame): CSSProperties {
  if (frame === "Aucun") return { border: "2px solid rgba(59,36,22,0.1)" }
  const s = FRAME_STYLES[frame]
  return {
    borderStyle: "solid",
    borderWidth: s.borderWidth,
    borderImageSource: s.borderImageSource,
    borderImageSlice: s.borderImageSlice,
    borderImageRepeat: s.borderImageRepeat,
    borderColor: s.fallback,
  }
}

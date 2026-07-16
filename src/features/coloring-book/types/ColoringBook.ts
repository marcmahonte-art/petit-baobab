import type { BookFormat, BookFrame, BookOrientation, BookStyle, CoverPalette, CoverTemplate } from "../types"
import type { BookPage } from "./BookPage"

/**
 * Modèle de domaine canonique du livre de coloriage.
 * Toute la logique d'impression / PDF consomme UNIQUEMENT ce modèle.
 * Aucune dépendance au store, à l'UI ou au cycle de vie React.
 */
export interface ColoringBookSettings {
  /** Numérotation des pages en bas de page */
  pageNumbers: boolean
  /** Page de garde / couverture personnalisée */
  addTitlePage: boolean
  /** Page "Ce livre appartient à" */
  belongsTo: boolean
  /** Texte éducatif */
  educationalText: boolean
  /** Fait amusant */
  funFact: boolean
  /** Questions / mini-jeux */
  questions: boolean
  /** Optimiser l'encre (contours plus fins) */
  optimizeInk: boolean
  /** Recto uniquement (verso blanc) */
  rectoOnly: boolean
  /** Repères de coupe */
  cutMarks: boolean
  /** Marge de reliure */
  bindingMargin: boolean
  /** Fond perdu (bleed) */
  bleed: boolean
}

export interface ColoringBook {
  id: string
  title: string
  subtitle: string
  author: string
  childName: string
  cover: CoverTemplate
  palette: CoverPalette
  style: BookStyle
  frame: BookFrame
  format: BookFormat
  orientation: BookOrientation
  /** Nombre de dessins sélectionnés */
  drawingCount: number
  settings: ColoringBookSettings
  /** Pages ordonnées. Chaque page possède un `id` unique (jamais un index). */
  pages: BookPage[]
}

export type { BookFormat, BookFrame, BookOrientation, BookStyle, CoverPalette, CoverTemplate }

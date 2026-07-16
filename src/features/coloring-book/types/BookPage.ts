export type BookPageType = "cover" | "belongs_to" | "drawing"

/**
 * Page de livre. Chaque page possède un `id` stable et unique
 * (jamais un index de tableau) utilisé comme clé React.
 */
export interface BookPage {
  /** Identifiant unique et stable de la page (ex: "cover-petit-baobab", "drawing-elephant"). */
  id: string
  type: BookPageType
  title: string
  /** Chemin du SVG source (prioritaire pour impression / PDF vectoriel). */
  svgPath?: string
  /** SVG vectoriel pré-généré (perso) en fallback du svgPath. */
  svg?: string
  /** Image raster de secours (PNG/JPEG/data URL). */
  image?: string
  /** Thème illustratif (ex: "animaux", "culture"). */
  theme: string
  /** Catégorie (ex: "animals"). */
  category: string
  /** Sous-titre / détail affiché (ex: catégorie, enfant). */
  details?: string
  isPersonal?: boolean
}


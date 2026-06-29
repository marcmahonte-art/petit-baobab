export type BookStyle =
  | "Contour simple"
  | "Noir & Blanc détaillé"
  | "Version couleur"
  | "Traits épais"
  | "Contours épais"

export interface BookStyleOption {
  id: BookStyle
  name: string
  desc: string
  icon: string
}

export type BookStyle =
  | "Contour simple"
  | "Noir & Blanc détaillé"
  | "Version couleur"
  | "Traits épais"
  | "Contours épais"

import type { LucideIcon } from "lucide-react"

export interface BookStyleOption {
  id: BookStyle
  name: string
  desc: string
  icon: LucideIcon
}

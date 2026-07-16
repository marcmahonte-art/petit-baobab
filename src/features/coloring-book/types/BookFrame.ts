export type BookFrame = "Nature" | "Faso Dan Fani" | "Bogolan" | "Savane" | "Animaux" | "Aucun"

import type { LucideIcon } from "lucide-react"

export interface BookFrameOption {
  id: BookFrame
  label: string
  icon: LucideIcon
}

import { Palette, BookOpen, Gamepad2, Bookmark, Tent, Sparkles, Settings, Award, Map, BrainCircuit, Camera } from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface NavItem {
  icon: LucideIcon
  label: string
  href: string
}

/**
 * Liens de navigation communs aux sidebars /dashboard et /dashboardstudent.
 * N'inclut PAS "Accueil" (href différent) ni les liens spécifiques à chaque espace
 * (Espace parents, Facturation côté parent uniquement).
 */
export const commonNavItems: NavItem[] = [
  { icon: Palette, label: "Coloriage", href: "/learn/coloriage" },
  { icon: Sparkles, label: "Dessin magique", href: "/learn/magic-drawing" },
  { icon: BookOpen, label: "Livres de coloriage", href: "/learn/livres-de-coloriage" },
  { icon: Bookmark, label: "Mes livres", href: "/learn/mes-livres" },
  { icon: Camera, label: "Cahier de souvenirs", href: "/learn/souvenirs" },
  { icon: Gamepad2, label: "Jeux éducatifs", href: "#" },
  { icon: Bookmark, label: "Histoires", href: "#" },
  { icon: Tent, label: "Activités", href: "#" },
  { icon: Map, label: "Parcours", href: "/learn/parcours" },
  { icon: BrainCircuit, label: "Coach IA", href: "/learn/coach" },
  { icon: Award, label: "Mon portfolio", href: "/learn/portfolio" },
]

/** Lien Paramètres — commun aux deux sidebars, toujours en dernière position. */
export const settingsNavItem: NavItem = { icon: Settings, label: "Paramètres", href: "/parametres" }

import type {
  PortfolioCategory,
  PortfolioEventType,
  AlbumDefinition,
} from "../types"

export interface PortfolioCategoryMeta {
  id: PortfolioCategory
  icon: string
  color: string
}

export const PORTFOLIO_CATEGORIES: PortfolioCategoryMeta[] = [
  { id: "Dessins", icon: "/icons/marketing/dessins.png", color: "#FF8A00" },
  { id: "Livres", icon: "/icons/marketing/livres.png", color: "#1D9E75" },
  { id: "Coloriages", icon: "/icons/marketing/coloriages.png", color: "#FF5E83" },
  { id: "Dessins magiques", icon: "/icons/marketing/marqueur-ia.png", color: "#7D6AF8" },
  { id: "Histoires", icon: "/icons/marketing/histoires.png", color: "#1194FF" },
  { id: "Quiz", icon: "/icons/marketing/quiz.png", color: "#FFB300" },
  { id: "Jeux", icon: "/icons/marketing/jeux-educatifs.png", color: "#E63946" },
  { id: "Badges", icon: "/icons/marketing/badges.png", color: "#FFD95C" },
  { id: "Récompenses", icon: "/icons/marketing/recompenses.png", color: "#FF6B35" },
  { id: "Défis", icon: "/icons/marketing/defis.png", color: "#8BC34A" },
  { id: "Certificats", icon: "/icons/marketing/certificats.png", color: "#20C997" },
  { id: "Collections", icon: "/icons/marketing/collections.png", color: "#A9702C" },
  { id: "Photos souvenirs", icon: "/icons/marketing/photos-de-souvenirs.png", color: "#9C89B8" },
]

export function getCategoryMeta(category: PortfolioCategory) {
  return PORTFOLIO_CATEGORIES.find((c) => c.id === category) ?? PORTFOLIO_CATEGORIES[0]
}

export interface EventTypeMeta {
  type: PortfolioEventType
  category: PortfolioCategory
  title: string
  icon: string
}

export const EVENT_TYPE_META: Record<PortfolioEventType, EventTypeMeta> = {
  DRAWING_CREATED: { type: "DRAWING_CREATED", category: "Dessins", title: "Nouveau dessin", icon: "/icons/marketing/dessins.png" },
  DRAWING_COMPLETED: { type: "DRAWING_COMPLETED", category: "Dessins", title: "Dessin terminé", icon: "/icons/marketing/dessins-2.png" },
  BOOK_CREATED: { type: "BOOK_CREATED", category: "Livres", title: "Nouveau livre", icon: "/icons/marketing/livres.png" },
  BOOK_PRINTED: { type: "BOOK_PRINTED", category: "Livres", title: "Livre imprimé", icon: "/icons/marketing/imprimer.png" },
  MAGIC_DRAWING_CREATED: { type: "MAGIC_DRAWING_CREATED", category: "Dessins magiques", title: "Dessin magique", icon: "/icons/marketing/marqueur-ia.png" },
  COLORING_COMPLETED: { type: "COLORING_COMPLETED", category: "Coloriages", title: "Coloriage terminé", icon: "/icons/marketing/coloriages.png" },
  GAME_COMPLETED: { type: "GAME_COMPLETED", category: "Jeux", title: "Jeu terminé", icon: "/icons/marketing/jeux-educatifs.png" },
  QUIZ_COMPLETED: { type: "QUIZ_COMPLETED", category: "Quiz", title: "Quiz réussi", icon: "/icons/marketing/quiz.png" },
  STORY_CREATED: { type: "STORY_CREATED", category: "Histoires", title: "Nouvelle histoire", icon: "/icons/marketing/histoires.png" },
  BADGE_UNLOCKED: { type: "BADGE_UNLOCKED", category: "Badges", title: "Badge débloqué", icon: "/icons/marketing/badges.png" },
  CHALLENGE_COMPLETED: { type: "CHALLENGE_COMPLETED", category: "Défis", title: "Défi relevé", icon: "/icons/marketing/defis.png" },
  LEVEL_UP: { type: "LEVEL_UP", category: "Récompenses", title: "Niveau supérieur", icon: "/icons/marketing/recompenses.png" },
  STARS_EARNED: { type: "STARS_EARNED", category: "Récompenses", title: "Étoiles gagnées", icon: "/icons/marketing/recompenses.png" },
  SHOP_PURCHASE: { type: "SHOP_PURCHASE", category: "Récompenses", title: "Achat à la boutique", icon: "/icons/marketing/boutiques.png" },
  WORLD_OBJECT_UNLOCKED: { type: "WORLD_OBJECT_UNLOCKED", category: "Collections", title: "Objet de collection", icon: "/icons/marketing/collections.png" },
  WORLD_MEMORY_CREATED: { type: "WORLD_MEMORY_CREATED", category: "Collections", title: "Souvenir du monde", icon: "/icons/marketing/arbre-mature.png" },
  PATH_COMPLETED: { type: "PATH_COMPLETED", category: "Certificats", title: "Parcours terminé", icon: "/icons/marketing/certificats.png" },
  CERTIFICATE_ISSUED: { type: "CERTIFICATE_ISSUED", category: "Certificats", title: "Certificat obtenu", icon: "/icons/marketing/certificats.png" },
  PORTFOLIO_MEMORY: { type: "PORTFOLIO_MEMORY", category: "Photos souvenirs", title: "Souvenir", icon: "/icons/marketing/photos-de-souvenirs.png" },
}

/** Événements du bus jugés non pertinents pour l'album (connexions, invitation…). */
export const NOISY_GAME_EVENTS: ReadonlySet<string> = new Set([
  "LOGIN",
  "DAILY_LOGIN",
  "STREAK_DAY",
  "PROFILE_COMPLETED",
  "FIRST_DOWNLOAD",
  "SHOP_REVIEW",
  "INVITE_PARENT",
  "INVITE_CHILD",
  "CLASS_CREATED",
  "STUDENT_JOINED",
  "STARS_USED",
])

/**
 * Albums automatiques de l'année (le "musée" de l'enfant).
 * Chaque album possède un matcher qui attribue les événements.
 */
export const AUTO_ALBUM_DEFINITIONS: AlbumDefinition[] = [
  {
    id: "coloriages",
    title: "Coloriages",
    icon: "/icons/marketing/coloriages.png",
    matcher: (e) => e.event_type === "COLORING_COMPLETED",
  },
  {
    id: "livres",
    title: "Livres",
    icon: "/icons/marketing/livres.png",
    matcher: (e) => e.event_type === "BOOK_CREATED" || e.event_type === "BOOK_PRINTED",
  },
  {
    id: "safari",
    title: "Safari",
    icon: "/icons/marketing/collections.png",
    matcher: (e) => {
      const text = `${e.title} ${e.description ?? ""}`.toLowerCase()
      return (
        text.includes("safari") ||
        text.includes("animal") ||
        text.includes("lion") ||
        text.includes("girafe") ||
        text.includes("savane") ||
        text.includes("afrique")
      )
    },
  },
  {
    id: "alphabet",
    title: "Alphabet",
    icon: "/icons/marketing/lecture.png",
    matcher: (e) => {
      const text = `${e.title} ${e.description ?? ""}`.toLowerCase()
      return text.includes("alphabet") || text.includes("lettre") || text.includes("abcd")
    },
  },
  {
    id: "vacances",
    title: "Vacances",
    icon: "/icons/marketing/photos-de-souvenirs.png",
    matcher: (e) => {
      const month = new Date(e.created_at).getMonth()
      return month === 6 || month === 7
    },
  },
  {
    id: "noel",
    title: "Noël",
    icon: "/icons/marketing/recompenses.png",
    matcher: (e) => new Date(e.created_at).getMonth() === 11,
  },
  {
    id: "ecole",
    title: "Ecole",
    icon: "/icons/marketing/ecoles.png",
    matcher: (e) => new Date(e.created_at).getMonth() === 8,
  },
  {
    id: "famille",
    title: "Famille",
    icon: "/icons/marketing/photos-de-souvenirs.png",
    matcher: (e) => e.event_type === "PORTFOLIO_MEMORY",
  },
]

export const TIMELINE_BUCKET_LABELS: Record<string, string> = {
  today: "Aujourd'hui",
  week: "Cette semaine",
  month: "Ce mois",
  year: "Cette année",
  older: "Depuis le début",
}

export const DEFAULT_PORTFOLIO_THEME = "savane"

export const PORTFOLIO_STORAGE_KEY = "petit-baobab-portfolio-v1"

export const CAPSULE_OPTIONS = [
  { years: 1, label: "Dans 1 an" },
  { years: 3, label: "Dans 3 ans" },
  { years: 5, label: "Dans 5 ans" },
] as const

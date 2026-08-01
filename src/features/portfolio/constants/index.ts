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
  { id: "Dessins", icon: "🎨", color: "#FF8A00" },
  { id: "Livres", icon: "📚", color: "#1D9E75" },
  { id: "Coloriages", icon: "🖍️", color: "#FF5E83" },
  { id: "Dessins magiques", icon: "✨", color: "#7D6AF8" },
  { id: "Histoires", icon: "📖", color: "#1194FF" },
  { id: "Quiz", icon: "❓", color: "#FFB300" },
  { id: "Jeux", icon: "🎮", color: "#E63946" },
  { id: "Badges", icon: "🏅", color: "#FFD95C" },
  { id: "Récompenses", icon: "🎁", color: "#FF6B35" },
  { id: "Défis", icon: "🏆", color: "#8BC34A" },
  { id: "Certificats", icon: "📜", color: "#20C997" },
  { id: "Collections", icon: "🐾", color: "#A9702C" },
  { id: "Photos souvenirs", icon: "📷", color: "#9C89B8" },
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
  DRAWING_CREATED: { type: "DRAWING_CREATED", category: "Dessins", title: "Nouveau dessin", icon: "🎨" },
  DRAWING_COMPLETED: { type: "DRAWING_COMPLETED", category: "Dessins", title: "Dessin terminé", icon: "🖼️" },
  BOOK_CREATED: { type: "BOOK_CREATED", category: "Livres", title: "Nouveau livre", icon: "📚" },
  BOOK_PRINTED: { type: "BOOK_PRINTED", category: "Livres", title: "Livre imprimé", icon: "🖨️" },
  MAGIC_DRAWING_CREATED: { type: "MAGIC_DRAWING_CREATED", category: "Dessins magiques", title: "Dessin magique", icon: "✨" },
  COLORING_COMPLETED: { type: "COLORING_COMPLETED", category: "Coloriages", title: "Coloriage terminé", icon: "🖍️" },
  GAME_COMPLETED: { type: "GAME_COMPLETED", category: "Jeux", title: "Jeu terminé", icon: "🎮" },
  QUIZ_COMPLETED: { type: "QUIZ_COMPLETED", category: "Quiz", title: "Quiz réussi", icon: "❓" },
  STORY_CREATED: { type: "STORY_CREATED", category: "Histoires", title: "Nouvelle histoire", icon: "📖" },
  BADGE_UNLOCKED: { type: "BADGE_UNLOCKED", category: "Badges", title: "Badge débloqué", icon: "🏅" },
  CHALLENGE_COMPLETED: { type: "CHALLENGE_COMPLETED", category: "Défis", title: "Défi relevé", icon: "🏆" },
  LEVEL_UP: { type: "LEVEL_UP", category: "Récompenses", title: "Niveau supérieur", icon: "⬆️" },
  STARS_EARNED: { type: "STARS_EARNED", category: "Récompenses", title: "Étoiles gagnées", icon: "⭐" },
  SHOP_PURCHASE: { type: "SHOP_PURCHASE", category: "Récompenses", title: "Achat à la boutique", icon: "🛍️" },
  WORLD_OBJECT_UNLOCKED: { type: "WORLD_OBJECT_UNLOCKED", category: "Collections", title: "Objet de collection", icon: "🐾" },
  WORLD_MEMORY_CREATED: { type: "WORLD_MEMORY_CREATED", category: "Collections", title: "Souvenir du monde", icon: "🌍" },
  PATH_COMPLETED: { type: "PATH_COMPLETED", category: "Certificats", title: "Parcours terminé", icon: "🎓" },
  CERTIFICATE_ISSUED: { type: "CERTIFICATE_ISSUED", category: "Certificats", title: "Certificat obtenu", icon: "📜" },
  PORTFOLIO_MEMORY: { type: "PORTFOLIO_MEMORY", category: "Photos souvenirs", title: "Souvenir", icon: "📷" },
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
    icon: "🖍️",
    matcher: (e) => e.event_type === "COLORING_COMPLETED",
  },
  {
    id: "livres",
    title: "Livres",
    icon: "📚",
    matcher: (e) => e.event_type === "BOOK_CREATED" || e.event_type === "BOOK_PRINTED",
  },
  {
    id: "safari",
    title: "Safari",
    icon: "🦁",
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
    icon: "🔤",
    matcher: (e) => {
      const text = `${e.title} ${e.description ?? ""}`.toLowerCase()
      return text.includes("alphabet") || text.includes("lettre") || text.includes("abcd")
    },
  },
  {
    id: "vacances",
    title: "Vacances",
    icon: "🏖️",
    matcher: (e) => {
      const month = new Date(e.created_at).getMonth()
      return month === 6 || month === 7
    },
  },
  {
    id: "noel",
    title: "Noël",
    icon: "🎄",
    matcher: (e) => new Date(e.created_at).getMonth() === 11,
  },
  {
    id: "ecole",
    title: "Ecole",
    icon: "🎒",
    matcher: (e) => new Date(e.created_at).getMonth() === 8,
  },
  {
    id: "famille",
    title: "Famille",
    icon: "👨‍👩‍👧",
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

import type { GameEventType } from "../../gamification/types"

/** Catégories du portfolio (album vivant de l'enfant). */
export type PortfolioCategory =
  | "Dessins"
  | "Livres"
  | "Coloriages"
  | "Dessins magiques"
  | "Histoires"
  | "Quiz"
  | "Jeux"
  | "Badges"
  | "Récompenses"
  | "Défis"
  | "Certificats"
  | "Collections"
  | "Photos souvenirs"

export const PORTFOLIO_CATEGORIES_LIST = [
  "Dessins",
  "Livres",
  "Coloriages",
  "Dessins magiques",
  "Histoires",
  "Quiz",
  "Jeux",
  "Badges",
  "Récompenses",
  "Défis",
  "Certificats",
  "Collections",
  "Photos souvenirs",
] as const

/**
 * Types d'événements du portfolio. Inclut les événements du bus de gamification
 * (GameEventType) plus les événements internes du portfolio.
 */
export type PortfolioEventType =
  | Extract<GameEventType, "DRAWING_CREATED" | "DRAWING_COMPLETED" | "BOOK_CREATED" | "BOOK_PRINTED" | "MAGIC_DRAWING_CREATED" | "COLORING_COMPLETED" | "GAME_COMPLETED" | "QUIZ_COMPLETED" | "STORY_CREATED" | "BADGE_UNLOCKED" | "CHALLENGE_COMPLETED" | "LEVEL_UP" | "STARS_EARNED" | "SHOP_PURCHASE" | "WORLD_OBJECT_UNLOCKED" | "WORLD_MEMORY_CREATED">
  | "PATH_COMPLETED"
  | "CERTIFICATE_ISSUED"
  | "PORTFOLIO_MEMORY"

export interface ChildPortfolio {
  id: string
  child_id: string
  cover?: string | null
  theme?: string | null
  created_at: string
  updated_at: string
}

export interface PortfolioEvent {
  id: string
  child_id: string
  event_type: PortfolioEventType
  title: string
  description?: string | null
  image?: string | null
  metadata?: Record<string, unknown>
  created_at: string
}

export interface PortfolioAlbum {
  id: string
  child_id: string
  title: string
  cover?: string | null
  year?: number | null
  created_at: string
}

export interface PortfolioFavorite {
  id: string
  child_id: string
  resource_type: string
  resource_id: string
  created_at: string
}

export interface TimeCapsule {
  id: string
  child_id: string
  message: string
  author?: string | null
  unlock_after_years: 1 | 3 | 5
  locked_until: string
  opened?: boolean
  created_at: string
}

/** Périodes de la Timeline : Aujourd'hui → Cette semaine → Ce mois → Cette année → Depuis le début. */
export type TimelineBucketId = "today" | "week" | "month" | "year" | "older"

export interface TimelineBucket {
  id: TimelineBucketId
  label: string
  events: PortfolioEvent[]
}

export interface PortfolioStats {
  drawings: number
  books: number
  colorings: number
  magicDrawings: number
  stories: number
  quizzes: number
  games: number
  badges: number
  rewards: number
  challenges: number
  certificates: number
  collections: number
  photos: number
  total: number
  xp: number
  stars: number
  timePlayedSeconds: number
  readingSeconds: number
  pathsCompleted: number
  firstActivity: string | null
  lastActivity: string | null
  byCategory: Record<string, number>
  /** Progression annuelle (nombre d'événements par année + par catégorie). */
  yearly: YearlyStat[]
}

export interface YearlyStat {
  year: number
  count: number
  categories: Record<string, number>
}

export interface EvolutionMilestone {
  key: string
  label: string
  icon: string
  event: PortfolioEvent | null
  date: string | null
  achieved: boolean
}

export interface SouvenirOfDay {
  event: PortfolioEvent
  message: string
}

export interface BeforeAfterPair {
  label: string
  icon: string
  first: PortfolioEvent | null
  latest: PortfolioEvent | null
}

export interface AlbumDefinition {
  id: string
  title: string
  icon: string
  matcher: (event: PortfolioEvent) => boolean
}

export type GalleryViewMode = "grid" | "chrono" | "mosaic" | "fullwidth"
export type GallerySort = "newest" | "oldest" | "category"

export interface GalleryFilters {
  category?: PortfolioCategory | "all"
  year?: number | "all"
  query?: string
}

/** Sous-ensemble minimal d'un certificat des parcours (découplage inter-modules). */
export interface LearningCertificateLike {
  token?: string
  path_id: string
  path_title: string
  issued_at?: string | null
}

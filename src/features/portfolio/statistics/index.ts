import { portfolioEngine } from "../engine/portfolio-engine"
import type { PortfolioEvent, PortfolioStats, YearlyStat } from "../types"

export type { PortfolioStats, YearlyStat } from "../types"

export interface PortfolioStatsExtras {
  xp?: number
  stars?: number
  pathsCompleted?: number
  timePlayedSeconds?: number
  readingSeconds?: number
}

/** Calcule toutes les statistiques du portfolio. */
export function computePortfolioStats(events: PortfolioEvent[], extras?: PortfolioStatsExtras): PortfolioStats {
  return portfolioEngine.computeStats(events, extras)
}

/** Formate une durée en "1 h 20 min" / "45 min" / "30 s". */
export function formatDuration(totalSeconds: number): string {
  if (totalSeconds <= 0) return "0 min"
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = Math.floor(totalSeconds % 60)
  if (h > 0) return `${h} h ${m} min`
  if (m > 0) return `${m} min`
  return `${s} s`
}

export interface AnnualProgression {
  year: number
  count: number
  /** Nombre de catégories différentes touchées dans l'année (diversité). */
  diversity: number
  growth: number
}

/** Progression annuelle : évolution d'une année sur l'autre (+% d'activité). */
export function annualProgression(yearly: YearlyStat[]): AnnualProgression[] {
  return yearly.map((stat, i) => {
    const previous = yearly[i - 1]?.count ?? 0
    const growth = previous > 0 ? Math.round(((stat.count - previous) / previous) * 100) : 100
    return {
      year: stat.year,
      count: stat.count,
      diversity: Object.keys(stat.categories).length,
      growth,
    }
  })
}

export const statsCards: { key: keyof PortfolioStats; label: string; icon: string }[] = [
  { key: "drawings", label: "Dessins", icon: "🎨" },
  { key: "books", label: "Livres", icon: "📚" },
  { key: "colorings", label: "Coloriages", icon: "🖍️" },
  { key: "magicDrawings", label: "Dessins magiques", icon: "✨" },
  { key: "stories", label: "Histoires", icon: "📖" },
  { key: "quizzes", label: "Quiz", icon: "❓" },
  { key: "games", label: "Jeux", icon: "🎮" },
  { key: "badges", label: "Badges", icon: "🏅" },
  { key: "rewards", label: "Récompenses", icon: "🎁" },
  { key: "challenges", label: "Défis", icon: "🏆" },
  { key: "certificates", label: "Certificats", icon: "📜" },
  { key: "collections", label: "Collections", icon: "🐾" },
  { key: "photos", label: "Photos souvenirs", icon: "📷" },
]

import { AUTO_ALBUM_DEFINITIONS } from "../constants"
import { portfolioEngine } from "../engine/portfolio-engine"
import type { PortfolioAlbum, PortfolioEvent } from "../types"

export interface AlbumSummary {
  id: string
  title: string
  icon: string
  year: number
  count: number
  cover: string | null
  events: PortfolioEvent[]
}

/** Construit la liste des albums (auto + personnalisés) avec leur contenu. */
export function buildAlbumSummaries(events: PortfolioEvent[], albums: PortfolioAlbum[] = []): AlbumSummary[] {
  const assigned = portfolioEngine.assignEventsToAlbums(events)

  const auto: AlbumSummary[] = AUTO_ALBUM_DEFINITIONS.map((def) => {
    const list = assigned[def.id] ?? []
    return {
      id: def.id,
      title: def.title,
      icon: def.icon,
      year: new Date().getFullYear(),
      count: list.length,
      cover: portfolioEngine.coverForAlbum(list),
      events: list,
    }
  }).filter((a) => a.count > 0)

  const custom: AlbumSummary[] = albums.map((album) => ({
    id: album.id,
    title: album.title,
    icon: "📁",
    year: album.year ?? new Date().getFullYear(),
    count: events.length,
    cover: album.cover ?? null,
    events: [...events].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 8),
  }))

  return [...auto, ...custom]
}

/** Attribue un événement à un album automatique (ou null). */
export function albumForEvent(event: PortfolioEvent): string | null {
  for (const def of AUTO_ALBUM_DEFINITIONS) {
    if (def.matcher(event)) return def.id
  }
  return null
}

/** Couverture de secours : icône de la catégorie de l'événement. */
export function albumFallbackIcon(albumId: string): string {
  return AUTO_ALBUM_DEFINITIONS.find((d) => d.id === albumId)?.icon ?? "📁"
}

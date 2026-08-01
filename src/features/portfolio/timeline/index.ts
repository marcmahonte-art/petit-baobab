import { portfolioEngine } from "../engine/portfolio-engine"
import type { PortfolioEvent, TimelineBucket } from "../types"

export type { TimelineBucket, TimelineBucketId } from "../types"

/** Regroupe les événements en périodes : Aujourd'hui → … → Depuis le début. */
export function buildPortfolioTimeline(events: PortfolioEvent[], now = new Date()): TimelineBucket[] {
  return portfolioEngine.buildTimeline(events, now)
}

export interface TimelineCounts {
  today: number
  week: number
  month: number
  year: number
  older: number
}

/** Comptage rapide par période (pour les puces/segments de la Timeline). */
export function timelineCounts(events: PortfolioEvent[], now = new Date()): TimelineCounts {
  const buckets = buildPortfolioTimeline(events, now)
  const counts: TimelineCounts = { today: 0, week: 0, month: 0, year: 0, older: 0 }
  for (const bucket of buckets) {
    counts[bucket.id] = bucket.events.length
  }
  return counts
}

/** Date lisible en français. */
export function formatDate(iso: string | null, withYear = true): string {
  return portfolioEngine.formatDate(iso, withYear)
}

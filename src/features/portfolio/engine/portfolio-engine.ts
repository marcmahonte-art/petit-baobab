import {
  AUTO_ALBUM_DEFINITIONS,
  EVENT_TYPE_META,
  NOISY_GAME_EVENTS,
  TIMELINE_BUCKET_LABELS,
  getCategoryMeta,
} from "../constants"
import type {
  BeforeAfterPair,
  EvolutionMilestone,
  GalleryFilters,
  GallerySort,
  PortfolioCategory,
  PortfolioEvent,
  PortfolioEventType,
  PortfolioStats,
  SouvenirOfDay,
  TimelineBucket,
  TimelineBucketId,
  YearlyStat,
} from "../types"

/**
 * Portfolio Engine — moteur pur (aucun I/O).
 * Toute la logique du portfolio vit ici : catégorisation, timeline,
 * statistiques, évolution, albums automatiques, souvenirs et recherche.
 */
export class PortfolioEngine {
  isNoisyEvent(type: string): boolean {
    return NOISY_GAME_EVENTS.has(type)
  }

  getEventMeta(type: PortfolioEventType) {
    return EVENT_TYPE_META[type] ?? EVENT_TYPE_META.PORTFOLIO_MEMORY
  }

  categoryOfEvent(event: PortfolioEvent): PortfolioCategory {
    return EVENT_TYPE_META[event.event_type]?.category ?? "Photos souvenirs"
  }

  categoryIcon(category: PortfolioCategory): string {
    return getCategoryMeta(category).icon
  }

  formatDate(iso: string | null, withYear = true): string {
    if (!iso) return "—"
    try {
      return new Date(iso).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        ...(withYear ? { year: "numeric" } : {}),
      })
    } catch {
      return "—"
    }
  }

  // -------------------------------------------------------------------------
  // Timeline : Aujourd'hui → Cette semaine → Ce mois → Cette année → Depuis le début
  // -------------------------------------------------------------------------

  bucketForDate(date: Date, now: Date): TimelineBucketId {
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const start = new Date(startOfToday)
    if (date.getTime() >= start.getTime() && date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()) {
      return "today"
    }
    if (date.getTime() >= start.getTime() - 7 * 24 * 3600 * 1000) return "week"
    if (date.getTime() >= start.getTime() - 30 * 24 * 3600 * 1000) return "month"
    if (date.getFullYear() === now.getFullYear()) return "year"
    return "older"
  }

  buildTimeline(events: PortfolioEvent[], now = new Date()): TimelineBucket[] {
    const buckets: Record<TimelineBucketId, PortfolioEvent[]> = {
      today: [],
      week: [],
      month: [],
      year: [],
      older: [],
    }
    for (const event of events) {
      const date = new Date(event.created_at)
      buckets[this.bucketForDate(date, now)].push(event)
    }
    const order: TimelineBucketId[] = ["today", "week", "month", "year", "older"]
    return order.map((id) => ({
      id,
      label: TIMELINE_BUCKET_LABELS[id],
      events: buckets[id].sort((a, b) => b.created_at.localeCompare(a.created_at)),
    }))
  }

  // -------------------------------------------------------------------------
  // Statistiques
  // -------------------------------------------------------------------------

  computeStats(
    events: PortfolioEvent[],
    extras?: { xp?: number; stars?: number; pathsCompleted?: number; timePlayedSeconds?: number; readingSeconds?: number },
  ): PortfolioStats {
    const counts: Record<string, number> = {}
    for (const event of events) {
      const category = this.categoryOfEvent(event)
      counts[category] = (counts[category] ?? 0) + 1
    }

    const years = this.groupEventsByYear(events)
    const yearly: YearlyStat[] = Object.keys(years)
      .map(Number)
      .sort((a, b) => a - b)
      .map((year) => {
        const list = years[year]
        const categories: Record<string, number> = {}
        for (const event of list) {
          const cat = this.categoryOfEvent(event)
          categories[cat] = (categories[cat] ?? 0) + 1
        }
        return { year, count: list.length, categories }
      })

    const sorted = [...events].sort((a, b) => a.created_at.localeCompare(b.created_at))

    return {
      drawings: counts["Dessins"] ?? 0,
      books: counts["Livres"] ?? 0,
      colorings: counts["Coloriages"] ?? 0,
      magicDrawings: counts["Dessins magiques"] ?? 0,
      stories: counts["Histoires"] ?? 0,
      quizzes: counts["Quiz"] ?? 0,
      games: counts["Jeux"] ?? 0,
      badges: counts["Badges"] ?? 0,
      rewards: counts["Récompenses"] ?? 0,
      challenges: counts["Défis"] ?? 0,
      certificates: counts["Certificats"] ?? 0,
      collections: counts["Collections"] ?? 0,
      photos: counts["Photos souvenirs"] ?? 0,
      total: events.length,
      xp: extras?.xp ?? 0,
      stars: extras?.stars ?? 0,
      pathsCompleted: extras?.pathsCompleted ?? 0,
      timePlayedSeconds: extras?.timePlayedSeconds ?? 0,
      readingSeconds: extras?.readingSeconds ?? 0,
      firstActivity: sorted[0]?.created_at ?? null,
      lastActivity: sorted[sorted.length - 1]?.created_at ?? null,
      byCategory: counts,
      yearly,
    }
  }

  // -------------------------------------------------------------------------
  // Mon évolution (premiers jalons)
  // -------------------------------------------------------------------------

  computeEvolution(events: PortfolioEvent[]): EvolutionMilestone[] {
    const firstOfType = (types: PortfolioEventType[]) => {
      const list = events
        .filter((e) => types.includes(e.event_type))
        .sort((a, b) => a.created_at.localeCompare(b.created_at))
      return list[0] ?? null
    }

    const firstArbreMature = events
      .filter(
        (e) =>
          e.event_type === "WORLD_MEMORY_CREATED" &&
          `${e.title} ${e.description ?? ""} ${JSON.stringify(e.metadata ?? {})}`.match(/arbre mature|tree_mature|tree_level_5|tree_sacred/i),
      )
      .sort((a, b) => a.created_at.localeCompare(b.created_at))[0] ?? null

    const firstAnimal = events
      .filter((e) => e.event_type === "WORLD_OBJECT_UNLOCKED")
      .sort((a, b) => a.created_at.localeCompare(b.created_at))[0] ?? null

    const defs: { key: string; label: string; icon: string; event: PortfolioEvent | null }[] = [
      { key: "first_drawing", label: "Premier dessin", icon: "🎨", event: firstOfType(["DRAWING_CREATED", "DRAWING_COMPLETED"]) },
      { key: "first_book", label: "Premier livre", icon: "📚", event: firstOfType(["BOOK_CREATED"]) },
      { key: "first_badge", label: "Premier badge", icon: "🏅", event: firstOfType(["BADGE_UNLOCKED"]) },
      { key: "first_challenge", label: "Premier défi", icon: "🏆", event: firstOfType(["CHALLENGE_COMPLETED"]) },
      { key: "first_path", label: "Premier parcours", icon: "🎓", event: firstOfType(["PATH_COMPLETED"]) },
      { key: "first_certificate", label: "Premier certificat", icon: "📜", event: firstOfType(["CERTIFICATE_ISSUED"]) },
      { key: "first_tree", label: "Premier arbre mature", icon: "🌳", event: firstArbreMature },
      { key: "first_animal", label: "Premier animal", icon: "🦁", event: firstAnimal },
    ]

    return defs.map((d) => ({
      ...d,
      date: d.event?.created_at ?? null,
      achieved: !!d.event,
    }))
  }

  // -------------------------------------------------------------------------
  // Souvenir du jour
  // -------------------------------------------------------------------------

  getSouvenirDuJour(events: PortfolioEvent[], now = new Date()): SouvenirOfDay | null {
    if (events.length === 0) return null

    const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    const range = 15 * 24 * 3600 * 1000

    const candidates = events.filter((e) => {
      const d = new Date(e.created_at)
      return Math.abs(d.getTime() - yearAgo.getTime()) <= range
    })

    const sorted = [...events].sort((a, b) => a.created_at.localeCompare(b.created_at))
    // Sélection déterministe par jour (déterministe = stable, pure) :
    // on évite Math.random pour garder le moteur reproductible.
    const dayIndex = Math.floor(now.getTime() / 86_400_000)
    const pool = candidates.length > 0 ? candidates : [sorted[0]]
    const chosen = pool[dayIndex % pool.length] ?? sorted[0]
    const yearsAgo = Math.max(1, now.getFullYear() - new Date(chosen.created_at).getFullYear())

    const verb = chosen.event_type === "BADGE_UNLOCKED" ? "débloquais" : "réalisais"
    const message =
      yearsAgo === 1
        ? `Il y a exactement un an, tu ${verb} : ${chosen.title}.`
        : `Il y a ${yearsAgo} ans, tu ${verb} : ${chosen.title}.`

    return { event: chosen, message }
  }

  // -------------------------------------------------------------------------
  // Avant / Après
  // -------------------------------------------------------------------------

  getBeforeAfter(events: PortfolioEvent[]): BeforeAfterPair[] {
    const pairs: { label: string; icon: string; types: PortfolioEventType[] }[] = [
      { label: "Premiers dessins", icon: "🎨", types: ["DRAWING_CREATED", "DRAWING_COMPLETED"] },
      { label: "Coloriages", icon: "🖍️", types: ["COLORING_COMPLETED"] },
      { label: "Livres", icon: "📚", types: ["BOOK_CREATED"] },
    ]

    return pairs.map((pair) => {
      const list = events
        .filter((e) => pair.types.includes(e.event_type))
        .sort((a, b) => a.created_at.localeCompare(b.created_at))
      return {
        label: pair.label,
        icon: pair.icon,
        first: list[0] ?? null,
        latest: list[list.length - 1] ?? null,
      }
    })
  }

  // -------------------------------------------------------------------------
  // Albums automatiques
  // -------------------------------------------------------------------------

  assignEventsToAlbums(events: PortfolioEvent[]): Record<string, PortfolioEvent[]> {
    const result: Record<string, PortfolioEvent[]> = {}
    for (const album of AUTO_ALBUM_DEFINITIONS) {
      result[album.id] = events.filter(album.matcher)
    }
    return result
  }

  coverForAlbum(events: PortfolioEvent[]): string | null {
    const withImage = events.find((e) => e.image)
    return withImage?.image ?? null
  }

  // -------------------------------------------------------------------------
  // Recherche / filtres / tri
  // -------------------------------------------------------------------------

  searchEvents(events: PortfolioEvent[], filters: GalleryFilters, sort: GallerySort = "newest"): PortfolioEvent[] {
    let result = events

    if (filters.category && filters.category !== "all") {
      result = result.filter((e) => this.categoryOfEvent(e) === filters.category)
    }
    if (filters.year && filters.year !== "all") {
      result = result.filter((e) => new Date(e.created_at).getFullYear() === filters.year)
    }
    if (filters.query && filters.query.trim()) {
      const q = filters.query.trim().toLowerCase()
      result = result.filter((e) => {
        const haystack = `${e.title} ${e.description ?? ""} ${this.categoryOfEvent(e)} ${e.event_type}`.toLowerCase()
        return haystack.includes(q)
      })
    }

    const sorted = [...result]
    if (sort === "newest") {
      sorted.sort((a, b) => b.created_at.localeCompare(a.created_at))
    } else if (sort === "oldest") {
      sorted.sort((a, b) => a.created_at.localeCompare(b.created_at))
    } else {
      sorted.sort((a, b) => {
        const cat = this.categoryOfEvent(a).localeCompare(this.categoryOfEvent(b))
        return cat !== 0 ? cat : b.created_at.localeCompare(a.created_at)
      })
    }
    return sorted
  }

  groupEventsByYear(events: PortfolioEvent[]): Record<number, PortfolioEvent[]> {
    const grouped: Record<number, PortfolioEvent[]> = {}
    for (const event of events) {
      const year = new Date(event.created_at).getFullYear()
      if (!grouped[year]) grouped[year] = []
      grouped[year].push(event)
    }
    return grouped
  }
}

export const portfolioEngine = new PortfolioEngine()

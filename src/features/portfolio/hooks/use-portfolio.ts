"use client"

import { useCallback, useEffect, useMemo, useRef } from "react"
import { usePortfolioStore } from "../store/portfolio-store"
import { portfolioService } from "../services/portfolio-service"
import { portfolioEngine } from "../engine/portfolio-engine"
import { buildPortfolioTimeline } from "../timeline"
import { computePortfolioStats } from "../statistics"
import { buildAlbumSummaries } from "../albums"
import { useLearningStore } from "../../learning-paths/store/learning-store"
import type { PortfolioStatsExtras } from "../statistics"
import type { PortfolioEvent, PortfolioEventType } from "../types"

export interface PortfolioOptions extends PortfolioStatsExtras {}

export function usePortfolio(childId?: string, options: PortfolioOptions = {}) {
  const store = usePortfolioStore()
  const initializedRef = useRef(false)

  useEffect(() => {
    if (!childId) return
    initializedRef.current = true
    void portfolioService.init(childId)
    return () => portfolioService.dispose()
  }, [childId])

  const learning = useLearningStore()

  const extras = useMemo<PortfolioStatsExtras>(
    () => ({
      xp: options.xp ?? 0,
      stars: options.stars ?? 0,
      pathsCompleted: options.pathsCompleted ?? learning.certificates.length,
      timePlayedSeconds: options.timePlayedSeconds ?? learning.learningSeconds,
      readingSeconds: options.readingSeconds ?? 0,
    }),
    [options.xp, options.stars, options.pathsCompleted, options.timePlayedSeconds, options.readingSeconds, learning.certificates.length, learning.learningSeconds],
  )

  const events = store.events
  const timeline = useMemo(() => buildPortfolioTimeline(events), [events])
  const stats = useMemo(() => computePortfolioStats(events, extras), [events, extras])
  const evolution = useMemo(() => portfolioEngine.computeEvolution(events), [events])
  const beforeAfter = useMemo(() => portfolioEngine.getBeforeAfter(events), [events])
  const albums = useMemo(() => buildAlbumSummaries(events, store.albums), [events, store.albums])
  const yearly = stats.yearly

  // "Souvenir du jour" : sélection déterministe, stable pour la journée.
  const souvenir = useMemo(() => portfolioEngine.getSouvenirDuJour(events), [events])

  const favoriteIds = useMemo(() => new Set(store.favorites.map((f) => `${f.resource_type}:${f.resource_id}`)), [store.favorites])
  const favoriteEvents = useMemo(() => events.filter((e) => favoriteIds.has(`event:${e.id}`)), [events, favoriteIds])

  const isFavorite = useCallback((resourceType: string, resourceId: string) => favoriteIds.has(`${resourceType}:${resourceId}`), [favoriteIds])

  const toggleFavorite = useCallback(
    (resourceType: string, resourceId: string) => {
      if (childId) void portfolioService.toggleFavorite(resourceType, resourceId)
    },
    [childId],
  )

  const saveTimeCapsule = useCallback(
    (message: string, years: 1 | 3 | 5, author?: string) => {
      if (childId) void portfolioService.saveTimeCapsule(message, years, author)
    },
    [childId],
  )

  const markCapsuleOpened = useCallback((capsuleId: string) => portfolioService.markCapsuleOpened(capsuleId), [])

  const addMemory = useCallback(
    (data: { title: string; description?: string; image?: string }) => {
      if (childId) void portfolioService.addMemory(data)
    },
    [childId],
  )

  const reset = useCallback(() => usePortfolioStore.getState().reset(), [])

  return {
    ...store,
    events,
    timeline,
    stats,
    evolution,
    beforeAfter,
    albums,
    yearly,
    souvenir,
    favoriteEvents,
    isFavorite,
    favoriteIds,
    toggleFavorite,
    saveTimeCapsule,
    markCapsuleOpened,
    addMemory,
    reset,
  }
}

/** Construit un événement portfolio depuis un type + titre (pour exports/partage). */
export function makeEvent(type: PortfolioEventType, title: string, extra?: Partial<PortfolioEvent>): PortfolioEvent {
  return {
    id: crypto.randomUUID(),
    child_id: "",
    event_type: type,
    title,
    created_at: new Date().toISOString(),
    ...extra,
  }
}

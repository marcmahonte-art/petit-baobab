"use client"

import { useCallback, useMemo, useState } from "react"
import { portfolioEngine } from "../engine/portfolio-engine"
import { PORTFOLIO_CATEGORIES } from "../constants"
import type {
  GalleryFilters,
  GallerySort,
  GalleryViewMode,
  PortfolioCategory,
  PortfolioEvent,
} from "../types"

export interface GalleryState {
  view: GalleryViewMode
  query: string
  category: PortfolioCategory | "all"
  year: number | "all"
  sort: GallerySort
  years: number[]
  results: PortfolioEvent[]
  categories: PortfolioCategory[]
  setView: (view: GalleryViewMode) => void
  setQuery: (query: string) => void
  setCategory: (category: PortfolioCategory | "all") => void
  setYear: (year: number | "all") => void
  setSort: (sort: GallerySort) => void
  clear: () => void
}

/**
 * Galerie du portfolio : vue (grille / chrono / mosaïque / pleine largeur),
 * recherche, filtres (catégorie, année) et tri.
 */
export function usePortfolioGallery(events: PortfolioEvent[]): GalleryState {
  const [view, setView] = useState<GalleryViewMode>("grid")
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<PortfolioCategory | "all">("all")
  const [year, setYear] = useState<number | "all">("all")
  const [sort, setSort] = useState<GallerySort>("newest")

  const years = useMemo(() => {
    const set = new Set<number>()
    for (const event of events) set.add(new Date(event.created_at).getFullYear())
    return Array.from(set).sort((a, b) => b - a)
  }, [events])

  const filters = useMemo<GalleryFilters>(
    () => ({ category, year, query }),
    [category, year, query],
  )

  const results = useMemo(() => portfolioEngine.searchEvents(events, filters, sort), [events, filters, sort])

  const clear = useCallback(() => {
    setQuery("")
    setCategory("all")
    setYear("all")
    setSort("newest")
  }, [])

  return {
    view,
    query,
    category,
    year,
    sort,
    years,
    results,
    categories: PORTFOLIO_CATEGORIES.map((c) => c.id),
    setView,
    setQuery,
    setCategory,
    setYear,
    setSort,
    clear,
  }
}

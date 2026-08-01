"use client"

import { motion } from "framer-motion"
import { LayoutGrid, List, Rows3, Search, X } from "lucide-react"
import { CARD_IN, STAGGER } from "../animations"
import { getCategoryMeta } from "../constants"
import { MemoryCard } from "./MemoryCard"
import type { GalleryViewMode, PortfolioEvent } from "../types"
import type { GalleryState } from "../hooks"
import { cn } from "@/lib/utils"

interface GalleryViewProps {
  gallery: GalleryState
  favoriteIds: Set<string>
  onSelectEvent: (event: PortfolioEvent) => void
  onToggleFavorite: (resourceId: string) => void
}

const VIEWS: { id: GalleryViewMode; icon: typeof LayoutGrid; label: string }[] = [
  { id: "grid", icon: LayoutGrid, label: "Grille" },
  { id: "chrono", icon: List, label: "Chronologique" },
  { id: "mosaic", icon: Rows3, label: "Mosaïque" },
  { id: "fullwidth", icon: Search, label: "Pleine largeur" },
]

export function GalleryView({ gallery, favoriteIds, onSelectEvent, onToggleFavorite }: GalleryViewProps) {
  const { results } = gallery

  return (
    <div>
      {/* Barre d'outils : recherche + filtres + tri + vues */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#F1E7DA] bg-white p-3 shadow-sm lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B4A495]" aria-hidden="true" />
          <input
            type="search"
            value={gallery.query}
            onChange={(e) => gallery.setQuery(e.target.value)}
            placeholder="Rechercher : animal, couleur, parcours, jeu, dessin…"
            className="w-full rounded-xl border border-[#F1E7DA] bg-[#FDFAF5] py-2.5 pl-9 pr-9 text-sm font-semibold text-[#3B2416] outline-none transition focus:border-[#FF8A00]"
          />
          {gallery.query && (
            <button
              type="button"
              onClick={() => gallery.setQuery("")}
              aria-label="Effacer la recherche"
              className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#F5F0EB] text-[#7A6A5E] hover:bg-[#EAD9BF]"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={gallery.category}
            onChange={(e) => gallery.setCategory(e.target.value as GalleryState["category"])}
            aria-label="Filtrer par catégorie"
            className="cursor-pointer rounded-xl border border-[#F1E7DA] bg-[#FDFAF5] px-3 py-2.5 text-xs font-bold text-[#3B2416] outline-none transition focus:border-[#FF8A00]"
          >
            <option value="all">Toutes les catégories</option>
            {gallery.categories.map((cat) => (
              <option key={cat} value={cat}>
                {getCategoryMeta(cat).icon} {cat}
              </option>
            ))}
          </select>

          <select
            value={gallery.year}
            onChange={(e) => gallery.setYear(e.target.value === "all" ? "all" : Number(e.target.value))}
            aria-label="Filtrer par année"
            className="cursor-pointer rounded-xl border border-[#F1E7DA] bg-[#FDFAF5] px-3 py-2.5 text-xs font-bold text-[#3B2416] outline-none transition focus:border-[#FF8A00]"
          >
            <option value="all">Toutes les années</option>
            {gallery.years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <select
            value={gallery.sort}
            onChange={(e) => gallery.setSort(e.target.value as GalleryState["sort"])}
            aria-label="Trier"
            className="cursor-pointer rounded-xl border border-[#F1E7DA] bg-[#FDFAF5] px-3 py-2.5 text-xs font-bold text-[#3B2416] outline-none transition focus:border-[#FF8A00]"
          >
            <option value="newest">Plus récent</option>
            <option value="oldest">Plus ancien</option>
            <option value="category">Par catégorie</option>
          </select>

          <div className="flex overflow-hidden rounded-xl border border-[#F1E7DA]">
            {VIEWS.map((view) => {
              const active = gallery.view === view.id
              return (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => gallery.setView(view.id)}
                  aria-label={view.label}
                  title={view.label}
                  className={cn(
                    "flex h-10 w-10 cursor-pointer items-center justify-center transition",
                    active ? "bg-[#3B2416] text-white" : "bg-[#FDFAF5] text-[#7A6A5E] hover:bg-[#F5F0EB]",
                  )}
                >
                  <view.icon className="h-4 w-4" aria-hidden="true" />
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Résultats */}
      <div className="mt-4">
        {results.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#EAD9BF] bg-white p-10 text-center text-sm font-bold text-[#7A6A5E]">
            Aucune création ne correspond à votre recherche.
          </p>
        ) : (
          <p className="mb-3 text-xs font-bold text-[#7A6A5E]">
            {results.length} création{results.length > 1 ? "s" : ""}
          </p>
        )}

        {results.length > 0 && gallery.view === "grid" && (
          <motion.div variants={STAGGER} initial="hidden" animate="visible" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((event) => (
              <MemoryCard
                key={event.id}
                event={event}
                isFavorite={favoriteIds.has(`event:${event.id}`)}
                onOpen={() => onSelectEvent(event)}
                onToggleFavorite={() => onToggleFavorite(event.id)}
              />
            ))}
          </motion.div>
        )}

        {results.length > 0 && gallery.view === "chrono" && (
          <ChronoView events={results} favoriteIds={favoriteIds} onSelectEvent={onSelectEvent} onToggleFavorite={onToggleFavorite} />
        )}

        {results.length > 0 && gallery.view === "mosaic" && (
          <div className="columns-2 gap-3 lg:columns-3">
            {results.map((event) => (
              <div key={event.id} className="mb-3 break-inside-avoid">
                <MemoryCard
                  event={event}
                  isFavorite={favoriteIds.has(`event:${event.id}`)}
                  onOpen={() => onSelectEvent(event)}
                  onToggleFavorite={() => onToggleFavorite(event.id)}
                  compact
                />
              </div>
            ))}
          </div>
        )}

        {results.length > 0 && gallery.view === "fullwidth" && (
          <motion.div variants={STAGGER} initial="hidden" animate="visible" className="space-y-3">
            {results.map((event) => (
              <motion.div key={event.id} variants={CARD_IN}>
                <MemoryCard
                  event={event}
                  isFavorite={favoriteIds.has(`event:${event.id}`)}
                  onOpen={() => onSelectEvent(event)}
                  onToggleFavorite={() => onToggleFavorite(event.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

function ChronoView({
  events,
  favoriteIds,
  onSelectEvent,
  onToggleFavorite,
}: {
  events: PortfolioEvent[]
  favoriteIds: Set<string>
  onSelectEvent: (event: PortfolioEvent) => void
  onToggleFavorite: (resourceId: string) => void
}) {
  const grouped: Record<string, PortfolioEvent[]> = {}
  for (const event of events) {
    const day = new Date(event.created_at).toDateString()
    if (!grouped[day]) grouped[day] = []
    grouped[day].push(event)
  }
  const days = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  return (
    <div className="space-y-4">
      {days.map((day) => (
        <div key={day}>
          <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-[#7A6A5E]">
            {new Date(day).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <div className="space-y-2">
            {grouped[day].map((event) => (
              <MemoryCard
                key={event.id}
                event={event}
                isFavorite={favoriteIds.has(`event:${event.id}`)}
                onOpen={() => onSelectEvent(event)}
                onToggleFavorite={() => onToggleFavorite(event.id)}
                compact
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

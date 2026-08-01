"use client"

import { motion } from "framer-motion"
import { Heart } from "lucide-react"
import { FADE_UP } from "../animations"
import { MemoryCard } from "./MemoryCard"
import type { PortfolioEvent } from "../types"

interface FavoriteCardProps {
  events: PortfolioEvent[]
  favoriteIds: Set<string>
  onSelectEvent: (event: PortfolioEvent) => void
  onToggleFavorite: (resourceId: string) => void
}

export function FavoriteCard({ events, favoriteIds, onSelectEvent, onToggleFavorite }: FavoriteCardProps) {
  if (events.length === 0) {
    return (
      <motion.div
        variants={FADE_UP}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[#EAD9BF] bg-white p-8 text-center"
      >
        <Heart className="h-8 w-8 text-[#EAD9BF]" aria-hidden="true" />
        <p className="text-sm font-bold text-[#7A6A5E]">Aucun favori pour le moment.</p>
        <p className="text-xs font-medium text-[#B4A495]">Touchez le cœur d&apos;une création pour la retrouver ici.</p>
      </motion.div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
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
  )
}

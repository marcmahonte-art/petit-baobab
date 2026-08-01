"use client"

import { motion } from "framer-motion"
import { Heart, Image as ImageIcon } from "lucide-react"
import { CARD_IN } from "../animations"
import { portfolioEngine } from "../engine/portfolio-engine"
import type { PortfolioEvent } from "../types"
import { cn } from "@/lib/utils"

interface MemoryCardProps {
  event: PortfolioEvent
  isFavorite: boolean
  onOpen: () => void
  onToggleFavorite: () => void
  compact?: boolean
}

export function MemoryCard({ event, isFavorite, onOpen, onToggleFavorite, compact }: MemoryCardProps) {
  const meta = portfolioEngine.getEventMeta(event.event_type)
  const category = portfolioEngine.categoryOfEvent(event)
  const date = portfolioEngine.formatDate(event.created_at, !compact)

  return (
    <motion.article variants={CARD_IN} initial="hidden" animate="visible" whileTap={{ scale: 0.98 }}>
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "group relative flex w-full cursor-pointer items-center gap-3 overflow-hidden rounded-2xl border border-[#F1E7DA] bg-white p-3 text-left shadow-sm transition hover:shadow-md",
          compact && "gap-3",
        )}
      >
        <div
          className={cn(
            "flex shrink-0 items-center justify-center overflow-hidden rounded-xl",
            compact ? "h-12 w-12" : "h-20 w-20",
          )}
        >
          {event.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#FFF6E8] to-[#FFE08A] text-2xl">
              <span aria-hidden="true">{meta.icon}</span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-extrabold text-[#3B2416]">{event.title}</p>
          {event.description && !compact && (
            <p className="mt-0.5 line-clamp-2 text-xs font-medium text-[#7A6A5E]">{event.description}</p>
          )}
          <div className="mt-1 flex items-center gap-2">
            <span className="rounded-full bg-[#F5F0EB] px-2 py-0.5 text-[10px] font-bold text-[#7A6A5E]">
              {category}
            </span>
            <span className="text-[10px] font-semibold text-[#B4A495]">{date}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite()
          }}
          aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          className={cn(
            "flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition",
            isFavorite ? "bg-[#FFE1E6] text-[#E63946]" : "bg-[#F5F0EB] text-[#B4A495] hover:text-[#E63946]",
          )}
        >
          <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} aria-hidden="true" />
        </button>

        {event.image ? (
          <ImageIcon className="absolute -bottom-4 -right-4 h-16 w-16 text-[#F5F0EB] opacity-60" aria-hidden="true" />
        ) : null}
      </button>
    </motion.article>
  )
}

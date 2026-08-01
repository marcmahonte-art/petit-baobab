"use client"

import { motion } from "framer-motion"
import { Download, Heart, Share2, X } from "lucide-react"
import { useEffect } from "react"
import { MODAL_OVERLAY, MODAL_PANEL } from "../animations"
import { portfolioEngine } from "../engine/portfolio-engine"
import type { PortfolioEvent } from "../types"
import { cn } from "@/lib/utils"

interface MemoryModalProps {
  event: PortfolioEvent
  isFavorite: boolean
  onClose: () => void
  onToggleFavorite: () => void
  onShare?: () => void
  onDownload?: () => void
}

export function MemoryModal({ event, isFavorite, onClose, onToggleFavorite, onShare, onDownload }: MemoryModalProps) {
  const meta = portfolioEngine.getEventMeta(event.event_type)
  const category = portfolioEngine.categoryOfEvent(event)
  const date = portfolioEngine.formatDate(event.created_at)
  const time = new Date(event.created_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [onClose])

  return (
    <motion.div
      variants={MODAL_OVERLAY}
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#3B2416]/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={event.title}
    >
      <motion.div
        variants={MODAL_PANEL}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="w-full max-w-lg overflow-hidden rounded-[28px] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex h-56 items-center justify-center overflow-hidden bg-gradient-to-br from-[#FFF6E8] to-[#FFE08A]">
          {event.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
          ) : (
            <span className="text-8xl" aria-hidden="true">
              {meta.icon}
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="absolute right-3 top-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/85 text-[#3B2416] shadow hover:bg-white"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#F5F0EB] px-2.5 py-1 text-[11px] font-bold text-[#7A6A5E]">{category}</span>
            <span className="text-[11px] font-semibold text-[#B4A495]">
              {date} · {time}
            </span>
          </div>
          <h2 className="mt-2 text-xl font-extrabold text-[#3B2416]">{event.title}</h2>
          {event.description && <p className="mt-1 text-sm font-medium text-[#7A6A5E]">{event.description}</p>}

          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onToggleFavorite}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition",
                isFavorite ? "bg-[#FFE1E6] text-[#E63946]" : "bg-[#F5F0EB] text-[#7A6A5E] hover:bg-[#EAD9BF]",
              )}
            >
              <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} aria-hidden="true" />
              {isFavorite ? "Favori" : "Favori"}
            </button>
            {onShare && (
              <button
                type="button"
                onClick={onShare}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#F5F0EB] px-4 py-2 text-xs font-bold text-[#7A6A5E] transition hover:bg-[#EAD9BF]"
              >
                <Share2 className="h-4 w-4" aria-hidden="true" />
                Partager
              </button>
            )}
            {onDownload && (
              <button
                type="button"
                onClick={onDownload}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#3B2416] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#5a3a26]"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Télécharger
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

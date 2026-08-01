"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { CARD_IN } from "../animations"
import { portfolioEngine } from "../engine/portfolio-engine"
import type { SouvenirOfDay as Souvenir } from "../types"

interface SouvenirOfDayProps {
  souvenir: Souvenir | null
  onOpen: (event: import("../types").PortfolioEvent) => void
}

export function SouvenirOfDay({ souvenir, onOpen }: SouvenirOfDayProps) {
  if (!souvenir) return null
  const meta = portfolioEngine.getEventMeta(souvenir.event.event_type)

  return (
    <motion.button
      type="button"
      variants={CARD_IN}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -2 }}
      onClick={() => onOpen(souvenir.event)}
      className="relative flex w-full cursor-pointer items-center gap-4 overflow-hidden rounded-2xl border border-[#FF8A00]/25 bg-gradient-to-br from-[#FFF6E8] to-[#FFE08A]/60 p-5 text-left shadow-sm transition hover:shadow-md"
    >
      <div className="pointer-events-none absolute -right-6 -top-6 text-8xl opacity-10" aria-hidden="true">
        ⏳
      </div>
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm" aria-hidden="true">
        {meta.icon}
      </div>
      <div className="relative min-w-0 flex-1">
        <p className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-[#FF8A00]">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Souvenir du jour
        </p>
        <p className="mt-1 text-sm font-bold leading-snug text-[#3B2416]">{souvenir.message}</p>
        <p className="mt-1 text-xs font-semibold text-[#7A6A5E]">
          {portfolioEngine.formatDate(souvenir.event.created_at)}
        </p>
      </div>
    </motion.button>
  )
}

"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { CARD_IN, STAGGER } from "../animations"
import { portfolioEngine } from "../engine/portfolio-engine"
import type { BeforeAfterPair, PortfolioEvent } from "../types"

interface BeforeAfterProps {
  pairs: BeforeAfterPair[]
  onOpen: (event: PortfolioEvent) => void
}

function Thumb({ event, label }: { event: PortfolioEvent | null; label: string }) {
  if (!event) {
    return (
      <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-[#EAD9BF] bg-[#FDFAF5]">
        <p className="px-2 text-center text-[10px] font-bold text-[#B4A495]">Aucune création</p>
      </div>
    )
  }
  const meta = portfolioEngine.getEventMeta(event.event_type)
  return (
    <div className="flex h-24 items-center justify-center overflow-hidden rounded-xl border border-[#F1E7DA] bg-white">
      {event.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
      ) : (
        <span className="text-3xl" aria-hidden="true">
          {meta.icon}
        </span>
      )}
    </div>
  )
}

export function BeforeAfter({ pairs, onOpen }: BeforeAfterProps) {
  return (
    <motion.div variants={STAGGER} initial="hidden" animate="visible" className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {pairs.map((pair) => (
        <motion.div
          key={pair.label}
          variants={CARD_IN}
          className="rounded-2xl border border-[#F1E7DA] bg-white p-4 shadow-sm"
        >
          <p className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-[#7A6A5E]">
            <span aria-hidden="true">{pair.icon}</span>
            {pair.label}
          </p>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <button type="button" onClick={() => pair.first && onOpen(pair.first)} className="cursor-pointer text-left" disabled={!pair.first}>
              <Thumb event={pair.first} label="Début" />
              <p className="mt-1 text-center text-[10px] font-bold text-[#3B2416]">Avant</p>
              <p className="text-center text-[9px] font-semibold text-[#B4A495]">
                {pair.first ? portfolioEngine.formatDate(pair.first.created_at) : "—"}
              </p>
            </button>
            <ArrowRight className="h-4 w-4 text-[#FF8A00]" aria-hidden="true" />
            <button type="button" onClick={() => pair.latest && onOpen(pair.latest)} className="cursor-pointer text-left" disabled={!pair.latest}>
              <Thumb event={pair.latest} label="Maintenant" />
              <p className="mt-1 text-center text-[10px] font-bold text-[#3B2416]">Après</p>
              <p className="text-center text-[9px] font-semibold text-[#B4A495]">
                {pair.latest ? portfolioEngine.formatDate(pair.latest.created_at) : "—"}
              </p>
            </button>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}

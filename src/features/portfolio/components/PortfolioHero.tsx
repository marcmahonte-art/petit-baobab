"use client"

import { motion } from "framer-motion"
import { BookOpen, Printer, Share2 } from "lucide-react"
import { FADE_UP } from "../animations"
import { formatDuration } from "../statistics"
import type { PortfolioStats } from "../types"
import { cn } from "@/lib/utils"

interface PortfolioHeroProps {
  childName?: string
  cover?: string | null
  stats: PortfolioStats
  onExport?: () => void
  onPrint?: () => void
  onShare?: () => void
}

export function PortfolioHero({ childName, cover, stats, onExport, onPrint, onShare }: PortfolioHeroProps) {
  const chips = [
    { icon: "⭐", label: `${stats.xp} XP` },
    { icon: "🌟", label: `${stats.stars} étoiles` },
    { icon: "🏅", label: `${stats.badges} badges` },
    { icon: "⏱️", label: formatDuration(stats.timePlayedSeconds) },
  ]

  return (
    <motion.section
      variants={FADE_UP}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#FFE08A] via-[#FFC96B] to-[#FFB84D] p-6 md:p-10"
    >
      <div className="pointer-events-none absolute -right-10 -top-12 text-[160px] opacity-15 select-none">🏛️</div>
      <div className="pointer-events-none absolute bottom-4 right-28 text-7xl opacity-10 select-none">🎨</div>

      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl">
          <p className="text-xs font-bold uppercase tracking-widest text-[#3B2416]/70">Portfolio · Le musée personnel</p>
          <h1 className="mt-1 text-3xl font-extrabold text-[#3B2416] md:text-4xl">
            {childName ? `La vie de ${childName}` : "Le musée de l'enfant"}
          </h1>
          <p className="mt-2 text-sm font-semibold text-[#3B2416]/75">
            Toute sa vie numérique en un album vivant : dessins, livres, badges, parcours, souvenirs…
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {chips.map((chip) => (
              <span
                key={chip.label}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-[#3B2416] backdrop-blur-sm"
              >
                <span aria-hidden="true">{chip.icon}</span>
                {chip.label}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 md:items-end">
          {cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="Couverture du portfolio" className="h-24 w-24 rounded-2xl object-cover shadow-lg" />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white/60 text-5xl shadow-lg">
              <span aria-hidden="true">🎨</span>
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            {onExport && (
              <button
                type="button"
                onClick={onExport}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-[#3B2416] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#5a3a26]"
              >
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                Livre souvenir
              </button>
            )}
            {onPrint && (
              <button
                type="button"
                onClick={onPrint}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#3B2416] transition hover:bg-white/80",
                )}
              >
                <Printer className="h-4 w-4" aria-hidden="true" />
                Imprimer
              </button>
            )}
            {onShare && (
              <button
                type="button"
                onClick={onShare}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-bold text-[#3B2416] transition hover:bg-white/80"
              >
                <Share2 className="h-4 w-4" aria-hidden="true" />
                Partager
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  )
}

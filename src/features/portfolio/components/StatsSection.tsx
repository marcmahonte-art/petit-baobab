"use client"

import { motion } from "framer-motion"
import { TrendingUp } from "lucide-react"
import { STAGGER } from "../animations"
import { StatsCard } from "./StatsCard"
import { annualProgression, formatDuration, statsCards } from "../statistics"
import type { PortfolioCategory, PortfolioStats } from "../types"
import { getCategoryMeta } from "../constants"

interface StatsSectionProps {
  stats: PortfolioStats
}

const HIGHLIGHTS: { key: keyof PortfolioStats; icon: string; label: string; accent: string }[] = [
  { key: "xp", icon: "⚡", label: "XP gagnés", accent: "#FF8A00" },
  { key: "stars", icon: "⭐", label: "Étoiles gagnées", accent: "#FFD95C" },
  { key: "badges", icon: "🏅", label: "Badges", accent: "#FF5E83" },
  { key: "challenges", icon: "🏆", label: "Défis réalisés", accent: "#8BC34A" },
  { key: "pathsCompleted", icon: "🎓", label: "Parcours terminés", accent: "#7D6AF8" },
  { key: "certificates", icon: "📜", label: "Certificats", accent: "#20C997" },
]

export function StatsSection({ stats }: StatsSectionProps) {
  const yearly = annualProgression(stats.yearly)

  return (
    <div className="space-y-6">
      <motion.div variants={STAGGER} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {HIGHLIGHTS.map((stat) => (
          <StatsCard key={stat.key} icon={stat.icon} label={stat.label} value={String(stats[stat.key] ?? 0)} accent={stat.accent} />
        ))}
      </motion.div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard icon="⏱️" label="Temps de jeu" value={formatDuration(stats.timePlayedSeconds)} accent="#1194FF" />
        <StatsCard icon="📖" label="Temps de lecture" value={formatDuration(stats.readingSeconds)} accent="#1D9E75" />
        <StatsCard icon="🐾" label="Collections" value={stats.collections} accent="#A9702C" />
        <StatsCard icon="📊" label="Activités totales" value={stats.total} accent="#7D6AF8" />
      </div>

      <motion.div variants={STAGGER} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {statsCards.map((card) => (
          <StatsCard
            key={card.key}
            icon={card.icon}
            label={card.label}
            value={String(stats[card.key] ?? 0)}
            accent={getCategoryMeta(card.label as PortfolioCategory).color}
          />
        ))}
      </motion.div>

      {yearly.length > 0 && (
        <div className="rounded-2xl border border-[#F1E7DA] bg-white p-5 shadow-sm">
          <p className="mb-3 flex items-center gap-2 text-sm font-extrabold text-[#3B2416]">
            <TrendingUp className="h-4 w-4 text-[#1D9E75]" aria-hidden="true" />
            Progression annuelle
          </p>
          <div className="space-y-3">
            {yearly.map((year) => (
              <div key={year.year} className="flex items-center gap-3">
                <span className="w-10 shrink-0 text-xs font-extrabold text-[#7A6A5E]">{year.year}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#F5F0EB]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#FF8A00] to-[#FFD95C] transition-all"
                    style={{ width: `${Math.min(100, Math.max(4, (year.count / maxCount(yearly)) * 100))}%` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-xs font-bold text-[#3B2416]">{year.count}</span>
                <span className="w-12 shrink-0 text-right text-[10px] font-bold text-[#1D9E75]">+{year.growth}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function maxCount(yearly: { count: number }[]): number {
  return Math.max(1, ...yearly.map((y) => y.count))
}

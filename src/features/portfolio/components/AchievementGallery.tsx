"use client"

import { motion } from "framer-motion"
import { CARD_IN, STAGGER } from "../animations"
import type { EvolutionMilestone } from "../types"
import { cn } from "@/lib/utils"

interface AchievementGalleryProps {
  milestones: EvolutionMilestone[]
  badgesCount?: number
  collectionsCount?: number
  achievementsLabel?: string
}

export function AchievementGallery({ milestones, badgesCount, collectionsCount, achievementsLabel }: AchievementGalleryProps) {
  return (
    <div>
      {(badgesCount !== undefined || collectionsCount !== undefined) && (
        <div className="mb-4 flex flex-wrap gap-2">
          {badgesCount !== undefined && (
            <span className="rounded-full bg-[#FFF6E8] px-3 py-1.5 text-xs font-bold text-[#3B2416]">
              🏅 {badgesCount} badges
            </span>
          )}
          {collectionsCount !== undefined && (
            <span className="rounded-full bg-[#F2FCF7] px-3 py-1.5 text-xs font-bold text-[#3B2416]">
              🐾 {collectionsCount} collections
            </span>
          )}
        </div>
      )}

      <motion.ul variants={STAGGER} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {milestones.map((milestone) => (
          <motion.li
            key={milestone.key}
            variants={CARD_IN}
            className={cn(
              "flex flex-col items-center gap-1 rounded-2xl border p-4 text-center shadow-sm",
              milestone.achieved
                ? "border-[#FFE08A] bg-gradient-to-br from-[#FFF6E8] to-[#FFE08A]/50"
                : "border-[#F1E7DA] bg-white opacity-60",
            )}
          >
            <span className="text-3xl" aria-hidden="true">
              {milestone.icon}
            </span>
            <p className="text-xs font-extrabold leading-tight text-[#3B2416]">{milestone.label}</p>
            {milestone.achieved ? (
              <p className="text-[10px] font-semibold text-[#7A6A5E]">{portfolioDate(milestone.date)}</p>
            ) : (
              <p className="text-[10px] font-semibold text-[#B4A495]">{achievementsLabel ?? "À découvrir"}</p>
            )}
          </motion.li>
        ))}
      </motion.ul>
    </div>
  )
}

function portfolioDate(iso: string | null): string {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
  } catch {
    return "—"
  }
}

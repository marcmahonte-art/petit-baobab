"use client"

import { motion } from "framer-motion"
import { CARD_IN } from "../animations"
import { getDifficulty, getTheme } from "../constants"
import type { PathProgress } from "../types"
import { cn } from "@/lib/utils"

interface LearningCardProps {
  progress: PathProgress
  onClick?: () => void
  compact?: boolean
}

export function LearningCard({ progress, onClick, compact = false }: LearningCardProps) {
  const { path } = progress
  const theme = getTheme(path.theme)
  const difficulty = getDifficulty(path.difficulty)

  return (
    <motion.button
      type="button"
      variants={CARD_IN}
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative overflow-hidden rounded-[20px] border border-[#F1E7DA] bg-white text-left shadow-[0_10px_30px_rgba(59,36,22,0.06)] transition-shadow hover:shadow-[0_16px_40px_rgba(59,36,22,0.12)]"
    >
      {/* Bandeau couleur du thème */}
      <div className="relative h-28 overflow-hidden" style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}>
        <span className="absolute -right-4 -top-4 text-8xl opacity-25 select-none">{theme.icon}</span>
        <div className="absolute inset-0 flex items-end p-3">
          <span className="text-5xl drop-shadow-sm">{path.icon}</span>
        </div>
        <div className="absolute right-3 top-3 flex gap-1.5">
          <span
            className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-extrabold"
            style={{ color: difficulty.color }}
          >
            {difficulty.icon} {difficulty.label}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-extrabold text-[#3B2416]">{path.title}</h3>
            <p className="mt-0.5 text-[11px] font-semibold text-[#7A6A5E]">
              {path.age_min}–{path.age_max} ans · {path.estimated_duration} min
            </p>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold",
              progress.status === "completed" && "bg-[#20C997]/10 text-[#128A6B]",
              progress.status === "in_progress" && "bg-[#7D6AF8]/10 text-[#5B4AE0]",
              progress.status === "available" && "bg-[#FFF4D6] text-[#D96A00]",
            )}
          >
            {progress.status === "completed" ? "Terminé ✓" : progress.status === "in_progress" ? "En cours" : "Disponible"}
          </span>
        </div>

        {!compact && (
          <p className="mt-2 line-clamp-2 text-xs font-medium text-[#7A6A5E]">{path.description}</p>
        )}

        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px] font-bold text-[#7A6A5E]">
            <span>
              {progress.completedLessons}/{progress.totalLessons} leçons
            </span>
            <span>{progress.progress}%</span>
          </div>
          <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[#F5F0EB]">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${theme.accent}, ${theme.primary})` }}
              initial={{ width: 0 }}
              animate={{ width: `${progress.progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </motion.button>
  )
}

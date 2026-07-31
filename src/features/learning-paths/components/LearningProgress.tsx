"use client"

import { motion } from "framer-motion"
import { STAGGER } from "../animations"
import type { PathProgress } from "../types"

interface LearningProgressProps {
  progress: PathProgress[]
  className?: string
}

/**
 * Bandeau de progression globale : total de leçons réussies et barre
 * générale de progression à travers tous les parcours.
 */
export function LearningProgress({ progress, className }: LearningProgressProps) {
  const totalLessons = progress.reduce((sum, p) => sum + p.totalLessons, 0)
  const completedLessons = progress.reduce((sum, p) => sum + p.completedLessons, 0)
  const overall = totalLessons ? Math.round((completedLessons / totalLessons) * 100) : 0
  const completedPaths = progress.filter((p) => p.completed).length

  return (
    <motion.div
      variants={STAGGER}
      initial="hidden"
      animate="visible"
      className={`rounded-[20px] border border-[#F1E7DA] bg-white p-5 shadow-[0_10px_30px_rgba(59,36,22,0.06)] ${className ?? ""}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-extrabold text-[#3B2416]">Ta progression</h3>
          <p className="text-xs font-semibold text-[#7A6A5E]">
            {completedLessons} leçons réussies · {completedPaths} parcours terminés
          </p>
        </div>
        <span className="rounded-full bg-[#7D6AF8]/10 px-3 py-1 text-xs font-extrabold text-[#5B4AE0]">
          {overall}% accompli
        </span>
      </div>

      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-[#F5F0EB]">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#7D6AF8] via-[#FF6B35] to-[#20C997]"
          initial={{ width: 0 }}
          animate={{ width: `${overall}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  )
}

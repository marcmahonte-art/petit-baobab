"use client"

import { motion } from "framer-motion"
import { TIMELINE_ENTRY } from "../animations"
import type { PathProgress } from "../types"
import { cn } from "@/lib/utils"

interface LearningTimelineProps {
  progress: PathProgress
  onSelectModule?: (moduleId: string) => void
}

/**
 * Timeline animée d'un parcours :
 * Module 1 → Module 2 → Module 3 → Module 4 → Certification 🎓
 */
export function LearningTimeline({ progress, onSelectModule }: LearningTimelineProps) {
  const { modules } = progress

  return (
    <div className="flex flex-col gap-1">
      {modules.map((m, i) => {
        const isDone = m.status === "completed"
        const isCurrent = !isDone && (i === 0 || modules[i - 1]?.status === "completed")
        return (
          <motion.button
            key={m.module.id}
            type="button"
            variants={TIMELINE_ENTRY}
            initial="hidden"
            animate="visible"
            transition={{ delay: i * 0.1 }}
            onClick={() => onSelectModule?.(m.module.id)}
            className={cn(
              "group relative flex items-center gap-3 rounded-2xl border p-3 text-left transition-all",
              isDone && "border-[#20C997]/30 bg-[#20C997]/5",
              isCurrent && "border-[#7D6AF8]/40 bg-[#7D6AF8]/5 shadow-[0_6px_20px_rgba(125,106,248,0.15)]",
              !isDone && !isCurrent && "border-[#F1E7DA] bg-white opacity-60",
            )}
          >
            {/* Node */}
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-extrabold",
                isDone ? "bg-[#20C997] text-white" : isCurrent ? "bg-[#7D6AF8] text-white" : "bg-[#F5F0EB] text-[#7A6A5E]",
              )}
            >
              {isDone ? "✓" : i + 1}
            </div>

            <div className="min-w-0 flex-1">
              <p className={cn("truncate text-sm font-extrabold", isDone || isCurrent ? "text-[#3B2416]" : "text-[#7A6A5E]")}>
                {m.module.title}
              </p>
              <p className="text-[11px] font-semibold text-[#7A6A5E]">
                {m.completedLessons}/{m.totalLessons} leçons · {m.progress}%
              </p>
            </div>

            {/* Récompense du module */}
            <span className="shrink-0 text-right">
              <span className="block text-xs font-extrabold text-[#FF8A00]">+{m.module.reward_xp} XP</span>
              <span className="block text-[10px] font-bold text-[#FFB300]">+{m.module.reward_stars} ⭐</span>
            </span>
          </motion.button>
        )
      })}

      {/* Certification */}
      <motion.div
        variants={TIMELINE_ENTRY}
        initial="hidden"
        animate="visible"
        transition={{ delay: modules.length * 0.1 }}
        className={cn(
          "flex items-center gap-3 rounded-2xl border-2 border-dashed p-3",
          progress.completed ? "border-[#FFB300] bg-[#FFF4D6]" : "border-[#F1E7DA] bg-white/60",
        )}
      >
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg",
            progress.completed ? "bg-[#FFB300] text-white" : "bg-[#F5F0EB] text-[#B9A985]",
          )}
        >
          🎓
        </div>
        <div className="min-w-0 flex-1">
          <p className={cn("text-sm font-extrabold", progress.completed ? "text-[#3B2416]" : "text-[#7A6A5E]")}>
            Certification
          </p>
          <p className="text-[11px] font-semibold text-[#7A6A5E]">
            {progress.completed ? "Certificat débloqué 🎉" : "Termine tous les modules pour l'obtenir"}
          </p>
        </div>
        {progress.completed && <span className="text-2xl">🎉</span>}
      </motion.div>
    </div>
  )
}

"use client"

import { motion } from "framer-motion"
import { LESSON_PULSE, TIMELINE_ENTRY } from "../animations"
import { LESSON_TYPE_ICON, isLessonAutoValidated } from "../constants"
import type { LearningLesson, LessonStatus } from "../types"
import { cn } from "@/lib/utils"

interface LessonCardProps {
  lesson: LearningLesson
  status: LessonStatus
  isCurrent?: boolean
  onStart?: (lesson: LearningLesson) => void
  onComplete?: (lesson: LearningLesson) => void
}

export function LessonCard({ lesson, status, onStart, onComplete }: LessonCardProps) {
  const icon = LESSON_TYPE_ICON[lesson.lesson_type]
  const autoValidated = isLessonAutoValidated(lesson.lesson_type)
  const completed = status === "completed"
  const available = status === "available"
  const inProgress = status === "in_progress"
  const locked = status === "locked"

  return (
    <motion.div
      variants={TIMELINE_ENTRY}
      initial="hidden"
      animate="visible"
      className={cn(
        "flex items-center gap-3 rounded-2xl border p-3",
        completed && "border-[#20C997]/30 bg-[#20C997]/5",
        available && "border-[#7D6AF8]/40 bg-[#7D6AF8]/5",
        inProgress && "border-[#FFB300]/50 bg-[#FFF4D6]",
        locked && "border-[#F1E7DA] bg-white opacity-55",
      )}
    >
      <motion.span
        variants={available || inProgress ? LESSON_PULSE : undefined}
        initial="idle"
        animate={available || inProgress ? "pulse" : "idle"}
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl",
          completed ? "bg-[#20C997]/15" : available || inProgress ? "bg-[#7D6AF8]/10" : "bg-[#F5F0EB]",
        )}
      >
        {completed ? "✅" : icon}
      </motion.span>

      <div className="min-w-0 flex-1">
        <p className={cn("truncate text-sm font-extrabold", locked ? "text-[#7A6A5E]" : "text-[#3B2416]")}>
          {lesson.title}
        </p>
        <p className="text-[11px] font-semibold text-[#7A6A5E]">
          +{lesson.reward_xp} XP · +{lesson.reward_stars} ⭐
          {autoValidated && available && <span className="text-[#20C997]"> · se valide automatiquement</span>}
        </p>
      </div>

      {available && (
        <div className="shrink-0">
          <button
            type="button"
            onClick={() => (autoValidated ? onStart?.(lesson) : onComplete?.(lesson))}
            className={cn(
              "cursor-pointer rounded-full px-3 py-1.5 text-xs font-extrabold transition-transform active:scale-95",
              autoValidated
                ? "bg-[#7D6AF8] text-white hover:bg-[#5B4AE0]"
                : "bg-[#20C997] text-white hover:bg-[#128A6B]",
            )}
          >
            {autoValidated ? "Commencer" : "J'ai terminé"}
          </button>
        </div>
      )}

      {inProgress && !available && (
        <button
          type="button"
          onClick={() => onComplete?.(lesson)}
          className="shrink-0 cursor-pointer rounded-full bg-[#FFB300] px-3 py-1.5 text-xs font-extrabold text-white transition-transform hover:bg-[#D96A00] active:scale-95"
        >
          Terminer
        </button>
      )}
    </motion.div>
  )
}

"use client"

import { motion } from "framer-motion"
import { CARD_IN } from "../animations"
import { LessonCard } from "./LessonCard"
import type { LearningLesson, LessonStatus, ModuleProgress } from "../types"
import { cn } from "@/lib/utils"

interface ModuleCardProps {
  moduleProgress: ModuleProgress
  lessonStatuses: Record<string, LessonStatus>
  nextLesson?: LearningLesson | null
  onStart?: (lesson: LearningLesson) => void
  onComplete?: (lesson: LearningLesson) => void
}

export function ModuleCard({ moduleProgress, lessonStatuses, nextLesson, onStart, onComplete }: ModuleCardProps) {
  const { module } = moduleProgress
  const done = moduleProgress.status === "completed"

  return (
    <motion.section
      variants={CARD_IN}
      initial="hidden"
      animate="visible"
      className={cn("rounded-[20px] border border-[#F1E7DA] bg-white p-5 shadow-[0_10px_30px_rgba(59,36,22,0.06)]")}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#7A6A5E]">
            Module {module.order_index}
          </p>
          <h3 className="text-base font-extrabold text-[#3B2416]">{module.title}</h3>
          <p className="mt-0.5 text-xs font-medium text-[#7A6A5E]">{module.description}</p>
        </div>
        <div className="flex items-center gap-2">
          {done ? (
            <span className="rounded-full bg-[#20C997]/10 px-2.5 py-1 text-[10px] font-extrabold text-[#128A6B]">
              Module terminé ✓
            </span>
          ) : (
            <span className="rounded-full bg-[#7D6AF8]/10 px-2.5 py-1 text-[10px] font-extrabold text-[#5B4AE0]">
              {moduleProgress.completedLessons}/{moduleProgress.totalLessons} leçons
            </span>
          )}
          <span className="rounded-full bg-[#FFF4D6] px-2.5 py-1 text-[10px] font-extrabold text-[#D96A00]">
            +{module.reward_xp} XP
          </span>
        </div>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#F5F0EB]">
        <motion.div
          className={cn("h-full rounded-full", done ? "bg-[#20C997]" : "bg-gradient-to-r from-[#7D6AF8] to-[#20C997]")}
          initial={{ width: 0 }}
          animate={{ width: `${moduleProgress.progress}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {module.lessons.map((lesson) => (
          <LessonCard
            key={lesson.id}
            lesson={lesson}
            status={lessonStatuses[lesson.id] ?? "locked"}
            isCurrent={nextLesson?.id === lesson.id}
            onStart={onStart}
            onComplete={onComplete}
          />
        ))}
      </div>
    </motion.section>
  )
}

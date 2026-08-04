"use client"

import { motion } from "framer-motion"
import type { LearningPrediction } from "../../types/coach"

interface WeeklyGoalCardProps {
  prediction: LearningPrediction | null
}

/** Objectif de la semaine + prédictions IA (Section 10). */
export function WeeklyGoalCard({ prediction }: WeeklyGoalCardProps) {
  if (!prediction) {
    return (
      <div className="rounded-2xl bg-[#FFF9F2] p-4 text-center text-sm font-semibold text-[#7A6A5E]">
        Je calcule ton objectif de la semaine 🔮
      </div>
    )
  }

  const xpWeek = prediction.predicted_week_xp
  const xp4Weeks = prediction.predicted_xp
  const hours = prediction.estimated_hours_to_next_level
  const nextLevel = prediction.next_level
  const confidence = Math.round(prediction.confidence * 100)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-[24px] border border-[#FFB300]/30 bg-gradient-to-br from-[#FFF4D6] to-[#FFE08A] p-5"
    >
      <span className="pointer-events-none absolute -right-4 -top-6 text-8xl opacity-15 select-none">🎯</span>

      <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#D96A00]">
        Objectif de la semaine
      </p>
      <h3 className="mt-1 text-lg font-extrabold text-[#3B2416]">
        +{xpWeek} XP d&apos;aventures
      </h3>

      <div className="mt-3 flex flex-wrap gap-2">
        <div className="rounded-2xl bg-white/70 p-2.5 text-center shadow-sm">
          <p className="text-base font-extrabold text-[#5B4AE0]">Niv. {nextLevel}</p>
          <p className="text-[9px] font-bold uppercase text-[#7A6A5E]">Prochain</p>
        </div>
        <div className="rounded-2xl bg-white/70 p-2.5 text-center shadow-sm">
          <p className="text-base font-extrabold text-[#128A6B]">~{hours}h</p>
          <p className="text-[9px] font-bold uppercase text-[#7A6A5E]">Avant le niveau</p>
        </div>
        <div className="rounded-2xl bg-white/70 p-2.5 text-center shadow-sm">
          <p className="text-base font-extrabold text-[#D96A00]">{xp4Weeks} XP</p>
          <p className="text-[9px] font-bold uppercase text-[#7A6A5E]">Dans 1 mois</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] font-bold text-[#7A6A5E]">Confiance IA</span>
        <span className="text-[11px] font-extrabold text-[#3B2416]">{confidence}%</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-white/60">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#7D6AF8] to-[#20C997]"
          initial={{ width: 0 }}
          whileInView={{ width: `${confidence}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
        />
      </div>
    </motion.div>
  )
}

"use client"

import { motion } from "framer-motion"
import { Sparkles, AlertTriangle } from "lucide-react"
import { COACH_RADAR_AXES } from "../../constants/coach-constants"
import type { LearningStrength, LearningWeakness } from "../../types/coach"

interface ProfileAnalysisCardProps {
  strengths: LearningStrength[]
  weaknesses: LearningWeakness[]
}

const LABEL_BY_KEY = Object.fromEntries(COACH_RADAR_AXES.map((a) => [a.key, a.label])) as Record<string, string>
const ICON_BY_KEY = Object.fromEntries(COACH_RADAR_AXES.map((a) => [a.key, a.icon])) as Record<string, string>

/** Forces et points de vigilance détectés par l'analyse IA. */
export function ProfileAnalysisCard({ strengths, weaknesses }: ProfileAnalysisCardProps) {
  const showStrengths = strengths.slice(0, 3)
  const showWeaknesses = weaknesses.slice(0, 3)
  const isEmpty = showStrengths.length === 0 && showWeaknesses.length === 0

  if (isEmpty) {
    return (
      <div className="rounded-2xl bg-[#FFF9F2] p-4 text-center text-sm font-semibold text-[#7A6A5E]">
        Fais quelques activités pour que je découvre tes forces ✨
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {showStrengths.map((s, i) => (
        <motion.div
          key={`s${i}`}
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ delay: i * 0.07 }}
          className="flex items-start gap-3 rounded-2xl bg-gradient-to-br from-[#E8FBE9] to-[#F0FFF4] p-3.5"
        >
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-base shadow-sm">
            {ICON_BY_KEY[s.skill] ?? "🌟"}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#128A6B]" />
              <span className="text-xs font-extrabold text-[#128A6B]">
                {LABEL_BY_KEY[s.skill] ?? s.skill} · {s.score}%
              </span>
            </div>
            <p className="mt-0.5 text-[11px] font-semibold leading-snug text-[#3B2416]">{s.evidence}</p>
          </div>
        </motion.div>
      ))}

      {showWeaknesses.map((w, i) => (
        <motion.div
          key={`w${i}`}
          initial={{ opacity: 0, x: 12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ delay: i * 0.07 }}
          className="flex items-start gap-3 rounded-2xl bg-gradient-to-br from-[#FFF4F4] to-[#FFF9F2] p-3.5"
        >
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-base shadow-sm">
            {ICON_BY_KEY[w.skill] ?? "💭"}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-[#FF8A5C]" />
              <span className="text-xs font-extrabold text-[#D96A00]">
                {LABEL_BY_KEY[w.skill] ?? w.skill} · {w.score}%
              </span>
            </div>
            <p className="mt-0.5 text-[11px] font-semibold leading-snug text-[#3B2416]">{w.suggestion}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

"use client"

import { motion } from "framer-motion"
import { Clock, Star, Check, X, Zap } from "lucide-react"
import { activityLabel, recommendationStatusLabel } from "../../engine/coach-engine"
import type { LearningRecommendation, RecommendationStatus } from "../../types/coach"

interface RecommendationsListProps {
  recommendations: LearningRecommendation[]
  onStatusChange: (id: string, status: RecommendationStatus) => void
  busyId?: string | null
}

const STATUS_STYLES: Record<RecommendationStatus, { bg: string; text: string }> = {
  pending: { bg: "#F7F4FF", text: "#5B4AE0" },
  accepted: { bg: "#20C997/10", text: "#128A6B" },
  ignored: { bg: "#F1E7DA", text: "#7A6A5E" },
  completed: { bg: "#FFF4D6", text: "#D96A00" },
  succeeded: { bg: "#E8FBE9", text: "#128A6B" },
}

/** Liste des recommandations IA avec actions (accepter / ignorer / terminer). */
export function RecommendationsList({ recommendations, onStatusChange, busyId }: RecommendationsListProps) {
  const visible = recommendations.slice(0, 4)
  const pending = visible.filter((r) => r.status === "pending")

  if (pending.length === 0 && visible.length === 0) {
    return (
      <div className="rounded-2xl bg-[#FFF9F2] p-4 text-center text-sm font-semibold text-[#7A6A5E]">
        Lance une analyse pour recevoir tes premières recommandations 🎯
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {visible.map((rec, i) => {
        const style = STATUS_STYLES[rec.status]
        return (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className={`rounded-2xl border p-3.5 transition-colors ${
              rec.status === "pending" ? "border-[#7D6AF8]/25 bg-[#F7F4FF]" : "border-[#F1E7DA] bg-white"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-extrabold text-[#3B2416]">{rec.title}</h4>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: style.bg, color: style.text }}>
                    {recommendationStatusLabel(rec.status)}
                  </span>
                </div>
                <p className="mt-1 text-xs font-medium leading-snug text-[#7A6A5E]">{rec.description}</p>
                <p className="mt-1 text-[11px] font-semibold italic text-[#5B4AE0]">{rec.reason}</p>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <div className="flex flex-wrap items-center justify-end gap-1.5 text-[11px] font-bold text-[#7A6A5E]">
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-[#FFF4D6] px-2 py-0.5 text-[#D96A00]">
                    <Clock className="w-3 h-3" /> {rec.duration} min
                  </span>
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-[#7D6AF8]/10 px-2 py-0.5 text-[#5B4AE0]">
                    <Zap className="w-3 h-3" /> {rec.reward_xp} XP
                  </span>
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-[#FFB300]/15 px-2 py-0.5 text-[#B8860B]">
                    <Star className="w-3 h-3" /> {rec.reward_stars}
                  </span>
                </div>

                {rec.status === "pending" && (
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => onStatusChange(rec.id, "accepted")}
                      disabled={busyId === rec.id}
                      className="inline-flex items-center gap-1 rounded-full bg-[#20C997] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm transition-colors hover:bg-[#17a07e] disabled:opacity-50 cursor-pointer border-none"
                    >
                      <Check className="w-3 h-3" /> Ok !
                    </button>
                    <button
                      type="button"
                      onClick={() => onStatusChange(rec.id, "ignored")}
                      disabled={busyId === rec.id}
                      className="inline-flex items-center gap-1 rounded-full border border-[#F1E7DA] bg-white px-2.5 py-1 text-[11px] font-bold text-[#7A6A5E] transition-colors hover:text-[#3B2416] disabled:opacity-50 cursor-pointer"
                    >
                      <X className="w-3 h-3" /> Plus tard
                    </button>
                  </div>
                )}

                <span className="text-[10px] font-semibold text-[#7A6A5E]">
                  {activityLabel(rec.type)}
                  {rec.reward_stars > 0 && ` · +${rec.reward_stars}⭐`}
                </span>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

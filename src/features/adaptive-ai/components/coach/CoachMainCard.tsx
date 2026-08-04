"use client"

import { motion } from "framer-motion"
import { CoachRadar } from "./CoachRadar"
import { AnimatedCounter } from "./AnimatedCounter"
import { COACH_RADAR_AXES } from "../../constants/coach-constants"
import type { CoachRadar as CoachRadarType } from "../../types/coach"

interface CoachMainCardProps {
  radar: CoachRadarType
  confidence: number
  averageSession: number
  favoriteTopics: string[]
  preferredActivity: string
}

/** Carte principale : radar pédagogique 8 axes + confiance IA + préférences. */
export function CoachMainCard({
  radar,
  confidence,
  averageSession,
  favoriteTopics,
  preferredActivity,
}: CoachMainCardProps) {
  const topics = favoriteTopics.filter(Boolean).slice(0, 4)

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45 }}
      className="rounded-[24px] border border-[#F1E7DA] bg-white p-5 shadow-[0_10px_30px_rgba(59,36,22,0.06)]"
    >
      <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-start lg:gap-8">
        <div className="shrink-0">
          <h3 className="mb-2 text-center text-sm font-extrabold text-[#3B2416]">Ma roue des compétences</h3>
          <CoachRadar radar={radar} size={300} />
        </div>

        <div className="flex w-full flex-1 flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-[#F7F4FF] p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#5B4AE0]">Confiance IA</p>
              <p className="mt-1 text-lg font-extrabold text-[#5B4AE0]">
                <AnimatedCounter value={Math.round(confidence * 100)} suffix="%" />
              </p>
            </div>
            <div className="rounded-2xl bg-[#20C997]/10 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#128A6B]">Session moyenne</p>
              <p className="mt-1 text-lg font-extrabold text-[#128A6B]">
                <AnimatedCounter value={averageSession} suffix=" min" />
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-[#FFF4D6] p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#D96A00]">Activité préférée</p>
            <p className="mt-1 text-sm font-extrabold text-[#3B2416]">{preferredActivity || "Coloriage"}</p>
          </div>

          {topics.length > 0 && (
            <div className="rounded-2xl bg-[#FFF9F2] p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-[#7A6A5E]">Sujets favoris</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {topics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#5B4AE0] shadow-sm"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Légende des axes */}
          <div className="hidden grid-cols-2 gap-x-3 gap-y-1.5 pt-1 md:grid">
            {COACH_RADAR_AXES.map((axis) => (
              <div key={axis.key} className="flex items-center gap-1.5 text-[11px] font-semibold text-[#7A6A5E]">
                <span>{axis.icon}</span>
                <span className="flex-1 truncate">{axis.label}</span>
                <span className="font-extrabold" style={{ color: axis.color }}>
                  {radar[axis.key]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

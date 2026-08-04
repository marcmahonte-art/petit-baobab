"use client"

import { motion } from "framer-motion"
import { CONFETTI, FADE_UP } from "../../animations"
import type { LearningRegion, LearningMission } from "../../types"

export interface NextObjectiveProps {
  region: LearningRegion | null
  mission: LearningMission | null
  regionJustUnlocked: boolean
  totalXp: number
}

export function NextObjective({ region, mission, regionJustUnlocked, totalXp }: NextObjectiveProps) {
  return (
    <motion.div
      variants={FADE_UP}
      className="relative overflow-hidden rounded-[24px] border border-[#FFF1D0] bg-gradient-to-br from-[#FFF4D6] to-[#FFE7B8] p-6 shadow-[0_10px_30px_rgba(255,178,0,0.18)]"
    >
      {/* Confetti si une région vient d'être débloquée */}
      {regionJustUnlocked && (
        <div className="pointer-events-none absolute inset-0">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.span
              key={i}
              custom={i}
              variants={CONFETTI}
              initial="hidden"
              animate="visible"
              className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full"
              style={{ background: ["#FF8A00", "#20C997", "#7D6AF8", "#FF5E83", "#FFB300"][i % 5] }}
            />
          ))}
        </div>
      )}

      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow">
            {region?.icon ?? "🎯"}
          </span>
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#D96A00]">
              {regionJustUnlocked ? "Nouvelle région débloquée !" : "Prochain objectif"}
            </p>
            <h3 className="mt-0.5 text-lg font-extrabold text-[#3B2416]">
              {region ? `${region.title}` : "Explore la carte"}
            </h3>
            <p className="text-sm font-semibold text-[#8A6B35]">
              {mission ? mission.title : "Toutes les régions sont débloquées — bravo !"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-white/70 px-4 py-2 text-center backdrop-blur">
          <p className="text-[10px] font-bold uppercase text-[#7A6A5E]">XP total</p>
          <p className="text-xl font-extrabold text-[#3B2416]">{totalXp}</p>
        </div>
      </div>

      {mission && (
        <div className="relative mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-extrabold text-[#D96A00]">
            +{mission.xp} XP
          </span>
          <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-extrabold text-[#3B2416]">
            {mission.type}
          </span>
          <span className="rounded-full bg-white/80 px-3 py-1 text-[11px] font-extrabold text-[#3B2416]">
            ⏱ {mission.duration} min
          </span>
        </div>
      )}
    </motion.div>
  )
}

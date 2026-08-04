"use client"

import { motion } from "framer-motion"
import { FADE_UP } from "../../animations"
import type { LearningRegion, LearningMission, ChildMissionProgress } from "../../types"

export interface RegionDetailProps {
  region: LearningRegion
  missions: LearningMission[]
  missionProgress: ChildMissionProgress[]
  totalXp: number
  onStartMission: (missionId: string) => void
  onCompleteMission: (missionId: string) => void
  busyMissionId?: string | null
}

export function RegionDetail({
  region,
  missions,
  missionProgress,
  totalXp,
  onStartMission,
  onCompleteMission,
  busyMissionId,
}: RegionDetailProps) {
  const progressByMission = new Map(missionProgress.map((p) => [p.mission_id, p]))

  const missionStatus = (mission: LearningMission): string => {
    const p = progressByMission.get(mission.id)
    if (p?.status === "completed") return "completed"
    if (p?.status === "in_progress") return "in_progress"
    if (p?.status === "available") return "available"
    if (region.required_xp > totalXp) return "locked"
    return "available"
  }

  const completed = missions.filter((m) => missionStatus(m) === "completed").length
  const progressPct = missions.length > 0 ? Math.round((completed / missions.length) * 100) : 0

  return (
    <motion.div
      variants={FADE_UP}
      className="rounded-[24px] border border-[#F1E7DA] bg-white p-5 shadow-[0_10px_30px_rgba(59,36,22,0.06)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
            style={{ background: `${region.color}22` }}
          >
            {region.icon}
          </span>
          <div>
            <h2 className="text-lg font-extrabold text-[#3B2416]">{region.title}</h2>
            <p className="text-xs font-medium text-[#7A6A5E]">{region.description}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-extrabold text-[#3B2416]">
            {completed}/{missions.length} missions
          </p>
          <div className="mt-1 h-2 w-24 overflow-hidden rounded-full bg-[#F5F0EB]">
            <motion.div
              className="h-full rounded-full"
              style={{ background: region.color }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2.5">
        {missions.map((mission) => {
          const status = missionStatus(mission)
          const p = progressByMission.get(mission.id)
          const isBusy = busyMissionId === mission.id
          return (
            <div
              key={mission.id}
              className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-3 transition-colors ${
                status === "completed"
                  ? "border-[#20C997]/30 bg-[#20C997]/5"
                  : status === "in_progress"
                    ? "border-[#FF8A00]/30 bg-[#FFF4D6]/50"
                    : status === "locked"
                      ? "border-[#F1E7DA] bg-[#F9F5F0] opacity-70"
                      : "border-[#F1E7DA] bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-lg"
                  style={{ background: status === "completed" ? "#20C99722" : `${region.color}18` }}
                >
                  {status === "completed" ? "✅" : status === "locked" ? "🔒" : "🎯"}
                </span>
                <div>
                  <p className="text-sm font-extrabold text-[#3B2416]">{mission.title}</p>
                  <p className="text-[11px] font-medium text-[#7A6A5E]">
                    {mission.type} · +{mission.xp} XP · {mission.duration} min
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {status === "completed" ? (
                  <span className="rounded-full bg-[#20C997]/10 px-3 py-1.5 text-[11px] font-extrabold text-[#128A6B]">
                    Terminée {p?.completed_at ? `· ${new Date(p.completed_at).toLocaleDateString("fr-FR")}` : ""}
                  </span>
                ) : status === "in_progress" ? (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => onCompleteMission(mission.id)}
                    className="cursor-pointer rounded-full bg-[#FF8A00] px-4 py-1.5 text-[11px] font-extrabold text-white shadow transition-transform hover:brightness-105 active:scale-95 disabled:opacity-50"
                  >
                    {isBusy ? "..." : "Terminer"}
                  </button>
                ) : status === "locked" ? (
                  <span className="text-[11px] font-bold text-[#B8ADA2]">
                    {region.required_xp - totalXp} XP requis
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => onStartMission(mission.id)}
                    className="cursor-pointer rounded-full bg-[#20C997] px-4 py-1.5 text-[11px] font-extrabold text-white shadow transition-transform hover:brightness-105 active:scale-95 disabled:opacity-50"
                  >
                    {isBusy ? "..." : "Commencer"}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

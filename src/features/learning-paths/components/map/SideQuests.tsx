"use client"

import { motion } from "framer-motion"
import { FADE_UP } from "../../animations"
import type { MissionProgress } from "../../types"

export interface SideQuestsProps {
  sideQuests: MissionProgress[]
  onStart: (missionId: string) => void
  busyMissionId?: string | null
}

export function SideQuests({ sideQuests, onStart, busyMissionId }: SideQuestsProps) {
  return (
    <motion.div variants={FADE_UP} className="rounded-[24px] border border-[#F1E7DA] bg-white p-5 shadow-[0_10px_30px_rgba(59,36,22,0.06)]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-[#3B2416]">Quêtes secondaires</h3>
        <span className="rounded-full bg-[#7D6AF8]/10 px-2.5 py-1 text-[10px] font-extrabold text-[#5B4AE0]">
          ✨ Bonus
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {sideQuests.length === 0 && (
          <p className="text-xs font-medium text-[#7A6A5E]">
            Aucune quête secondaire disponible — avance dans ta mission principale !
          </p>
        )}
        {sideQuests.map((q) => {
          const isBusy = busyMissionId === q.mission.id
          return (
            <div
              key={q.mission.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-[#EFE8FB] bg-[#F7F4FF] p-3"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
                  {q.mission.type === "STORY" ? "📖" : q.mission.type === "GAME" ? "🎮" : "⭐"}
                </span>
                <div>
                  <p className="text-sm font-extrabold text-[#3B2416]">{q.mission.title}</p>
                  <p className="text-[11px] font-medium text-[#7A6A5E]">
                    {q.mission.type} · +{q.mission.xp} XP
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => onStart(q.mission.id)}
                className="cursor-pointer rounded-full bg-[#7D6AF8] px-3 py-1 text-[10px] font-extrabold text-white shadow transition-transform hover:brightness-105 active:scale-95 disabled:opacity-50"
              >
                {isBusy ? "..." : "Commencer"}
              </button>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

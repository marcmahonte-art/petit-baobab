"use client"

import { motion } from "framer-motion"
import { FADE_UP } from "../../animations"
import type { DailyMissionProgress } from "../../types"

export interface DailyQuestsProps {
  dailies: DailyMissionProgress[]
  onComplete: (type: "daily" | "weekly", questId: string) => void
  busyQuestId?: string | null
}

export function DailyQuests({ dailies, onComplete, busyQuestId }: DailyQuestsProps) {
  return (
    <motion.div variants={FADE_UP} className="rounded-[24px] border border-[#F1E7DA] bg-white p-5 shadow-[0_10px_30px_rgba(59,36,22,0.06)]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-[#3B2416]">Quêtes du jour</h3>
        <span className="rounded-full bg-[#FF8A00]/10 px-2.5 py-1 text-[10px] font-extrabold text-[#D96A00]">
          ⏳ Aujourd&apos;hui
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {dailies.length === 0 && (
          <p className="text-xs font-medium text-[#7A6A5E]">Aucune quête aujourd&apos;hui.</p>
        )}
        {dailies.map((d) => {
          const isBusy = busyQuestId === d.mission.id
          return (
            <div
              key={d.mission.id}
              className={`flex items-center justify-between gap-3 rounded-2xl border p-3 ${
                d.completed ? "border-[#20C997]/30 bg-[#20C997]/5" : "border-[#F1E7DA] bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF4D6] text-lg">
                  {d.completed ? "✅" : d.mission.icon}
                </span>
                <div>
                  <p className="text-sm font-extrabold text-[#3B2416]">{d.mission.title}</p>
                  <p className="text-[11px] font-medium text-[#7A6A5E]">{d.mission.description}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] font-extrabold text-[#D96A00]">+{d.mission.xp} XP</span>
                {!d.completed && d.status === "available" && (
                  <button
                    type="button"
                    disabled={isBusy}
                    onClick={() => onComplete("daily", d.mission.id)}
                    className="cursor-pointer rounded-full bg-[#FF8A00] px-3 py-1 text-[10px] font-extrabold text-white shadow transition-transform hover:brightness-105 active:scale-95 disabled:opacity-50"
                  >
                    {isBusy ? "..." : "Valider"}
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

"use client"

import { motion } from "framer-motion"
import { formatDateLabel } from "../../engine/coach-engine"
import type { CoachProgram } from "../../types/coach"

interface ProgramTimelineProps {
  program: CoachProgram | null
}

/** Programme personnalisé : plan du jour + demain + objectifs de la semaine. */
export function ProgramTimeline({ program }: ProgramTimelineProps) {
  if (!program) {
    return (
      <div className="rounded-2xl bg-[#FFF9F2] p-4 text-center text-sm font-semibold text-[#7A6A5E]">
        Ton programme se prépare…
      </div>
    )
  }

  const todayItems = program.daily.activities
  const tomorrowItems = program.tomorrow.activities
  const weeklyGoals = program.weekly.goals

  return (
    <div className="flex flex-col gap-4">
      {/* Aujourd'hui */}
      <div className="rounded-2xl border border-[#7D6AF8]/20 bg-[#F7F4FF] p-4">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-sm font-extrabold text-[#3B2416]">🗓️ {formatDateLabel(program.daily.date)}</h4>
          <span className="rounded-full bg-[#7D6AF8] px-2.5 py-0.5 text-[10px] font-extrabold text-white">Aujourd&apos;hui</span>
        </div>
        <ul className="flex flex-col gap-1.5">
          {todayItems.map((item, i) => {
            const done = program.daily.completed.includes(item)
            return (
              <motion.li
                key={`t${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold ${
                  done ? "bg-[#20C997]/10 text-[#128A6B] line-through" : "bg-white text-[#3B2416] shadow-sm"
                }`}
              >
                <span className={done ? "" : "text-[#7D6AF8]"}>{done ? "✅" : "🎯"}</span>
                {item}
              </motion.li>
            )
          })}
        </ul>
      </div>

      {/* Demain */}
      <div className="rounded-2xl border border-[#F1E7DA] bg-white p-4">
        <h4 className="mb-2 text-sm font-extrabold text-[#3B2416]">🌤️ {formatDateLabel(program.tomorrow.date)}</h4>
        <ul className="flex flex-col gap-1.5">
          {tomorrowItems.map((item, i) => (
            <li
              key={`tom${i}`}
              className="flex items-center gap-2 rounded-xl bg-[#FFF9F2] px-3 py-2 text-xs font-bold text-[#3B2416]"
            >
              <span className="text-[#20C997]">✨</span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Objectifs de la semaine */}
      {weeklyGoals.length > 0 && (
        <div className="rounded-2xl border border-[#FFB300]/25 bg-[#FFF4D6] p-4">
          <h4 className="mb-2 text-sm font-extrabold text-[#3B2416]">🏆 Objectifs de la semaine</h4>
          <ul className="flex flex-col gap-1.5">
            {weeklyGoals.map((goal, i) => (
              <li
                key={`w${i}`}
                className="flex items-center gap-2 rounded-xl bg-white/70 px-3 py-2 text-xs font-bold text-[#3B2416]"
              >
                <span className="text-[#D96A00]">⭐</span>
                {goal}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

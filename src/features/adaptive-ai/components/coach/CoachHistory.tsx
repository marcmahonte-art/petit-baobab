"use client"

import { motion } from "framer-motion"
import type { CoachHistoryItem } from "../../types/coach"

interface CoachHistoryProps {
  history: CoachHistoryItem[]
}

const ACTION_ICON: Record<string, string> = {
  activity: "🎨",
  analyze: "🔍",
  recommendation: "🎯",
  chat: "💬",
  level_up: "🏅",
  report: "📊",
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "à l'instant"
  if (minutes < 60) return `il y a ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `il y a ${hours} h`
  const days = Math.floor(hours / 24)
  return `il y a ${days} j`
}

/** Historique des actions de l'IA (Section 9). */
export function CoachHistory({ history }: CoachHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="rounded-2xl bg-[#FFF9F2] p-4 text-center text-sm font-semibold text-[#7A6A5E]">
        Ton historique se remplit au fil de tes activités 🕘
      </div>
    )
  }

  return (
    <div className="relative flex flex-col gap-0">
      <span className="absolute left-[19px] top-2 bottom-2 w-0.5 rounded bg-[#F1E7DA]" />
      {history.slice(0, 8).map((item, i) => (
        <motion.div
          key={item.id ?? `h${i}`}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{ delay: i * 0.05 }}
          className="relative flex gap-3 pb-4 pl-0"
        >
          <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#F1E7DA] bg-white text-sm shadow-sm">
            {ACTION_ICON[item.action] ?? "✨"}
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-extrabold text-[#3B2416]">{item.title}</span>
              <span className="shrink-0 text-[10px] font-semibold text-[#7A6A5E]">
                {item.created_at ? timeAgo(item.created_at) : ""}
              </span>
            </div>
            <p className="mt-0.5 text-[11px] font-semibold leading-snug text-[#7A6A5E]">{item.detail}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

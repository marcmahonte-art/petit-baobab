"use client"

import { motion } from "framer-motion"
import { FADE_UP, TIMELINE_ENTRY } from "../../animations"

export interface HistoryItem {
  id: string
  title: string
  description: string
  icon: string
  date: string
  type: "mission" | "quest" | "region" | "level"
}

export interface HistoryTimelineProps {
  items: HistoryItem[]
}

export function HistoryTimeline({ items }: HistoryTimelineProps) {
  const sorted = [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <motion.div variants={FADE_UP} className="rounded-[24px] border border-[#F1E7DA] bg-white p-5 shadow-[0_10px_30px_rgba(59,36,22,0.06)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-[#3B2416]">Mon historique</h3>
        <span className="rounded-full bg-[#F5F0EB] px-2.5 py-1 text-[10px] font-extrabold text-[#7A6A5E]">
          {sorted.length} événement{sorted.length > 1 ? "s" : ""}
        </span>
      </div>

      {sorted.length === 0 ? (
        <p className="text-xs font-medium text-[#7A6A5E]">
          Ton histoire commence ici — accomplis ta première mission pour créer ton premier souvenir !
        </p>
      ) : (
        <div className="flex flex-col gap-0">
          {sorted.slice(0, 8).map((item) => (
            <motion.div key={item.id} variants={TIMELINE_ENTRY} className="relative flex gap-3 pb-4 last:pb-0">
              <div className="flex flex-col items-center">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFF4D6] text-sm">
                  {item.icon}
                </span>
                <span className="mt-1 w-px flex-1 bg-[#F1E7DA]" />
              </div>
              <div className="pb-1">
                <p className="text-sm font-extrabold text-[#3B2416]">{item.title}</p>
                <p className="text-[11px] font-medium text-[#7A6A5E]">{item.description}</p>
                <p className="mt-0.5 text-[10px] font-bold text-[#B8ADA2]">
                  {new Date(item.date).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

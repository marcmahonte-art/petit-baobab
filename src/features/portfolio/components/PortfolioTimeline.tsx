"use client"

import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { STAGGER, TIMELINE_ENTRY } from "../animations"
import { MemoryCard } from "./MemoryCard"
import type { TimelineBucket } from "../types"

interface PortfolioTimelineProps {
  buckets: TimelineBucket[]
  favoriteIds: Set<string>
  onSelectEvent: (event: import("../types").PortfolioEvent) => void
  onToggleFavorite: (resourceId: string) => void
}

export function PortfolioTimeline({ buckets, favoriteIds, onSelectEvent, onToggleFavorite }: PortfolioTimelineProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const toggle = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="relative">
      <div className="absolute bottom-2 left-[11px] top-2 w-0.5 rounded bg-[#EAD9BF]" aria-hidden="true" />
      <motion.ol variants={STAGGER} initial="hidden" animate="visible" className="relative space-y-6">
        {buckets.map((bucket) => {
          const isCollapsed = collapsed.has(bucket.id)
          return (
            <li key={bucket.id} className="relative pl-8">
              <span className="absolute left-0 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[#FF8A00] to-[#FFD95C] text-[10px] shadow-sm" aria-hidden="true">
                {bucket.events.length > 0 ? "⭐" : "○"}
              </span>

              <motion.button
                type="button"
                variants={TIMELINE_ENTRY}
                onClick={() => toggle(bucket.id)}
                className="flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left transition hover:bg-[#FDF6EC]"
              >
                <span className="text-sm font-extrabold text-[#3B2416]">
                  {bucket.label}
                  <span className="ml-2 rounded-full bg-[#FFE08A] px-2 py-0.5 text-xs font-bold text-[#3B2416]">{bucket.events.length}</span>
                </span>
                <ChevronDown className={`h-4 w-4 text-[#7A6A5E] transition-transform ${isCollapsed ? "" : "rotate-180"}`} aria-hidden="true" />
              </motion.button>

              {!isCollapsed && bucket.events.length > 0 && (
                <div className="mt-2 space-y-2">
                  {bucket.events.map((event) => (
                    <MemoryCard
                      key={event.id}
                      event={event}
                      isFavorite={favoriteIds.has(`event:${event.id}`)}
                      onOpen={() => onSelectEvent(event)}
                      onToggleFavorite={() => onToggleFavorite(event.id)}
                      compact
                    />
                  ))}
                </div>
              )}
              {!isCollapsed && bucket.events.length === 0 && (
                <p className="mt-1 px-3 text-xs font-semibold text-[#7A6A5E]">Aucune activité dans cette période.</p>
              )}
            </li>
          )
        })}
      </motion.ol>
    </div>
  )
}

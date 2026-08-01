"use client"

import { motion } from "framer-motion"
import { STAGGER, TIMELINE_ENTRY } from "../animations"
import type { EvolutionMilestone } from "../types"
import { cn } from "@/lib/utils"

interface EvolutionSectionProps {
  milestones: EvolutionMilestone[]
  onOpen?: (event: import("../types").PortfolioEvent) => void
}

export function EvolutionSection({ milestones, onOpen }: EvolutionSectionProps) {
  return (
    <motion.ul variants={STAGGER} initial="hidden" animate="visible" className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {milestones.map((milestone) => (
        <motion.li
          key={milestone.key}
          variants={TIMELINE_ENTRY}
          className={cn(
            "rounded-2xl border p-4 text-center shadow-sm",
            milestone.achieved ? "border-[#FFE08A] bg-white" : "border-[#F1E7DA] bg-white/60",
          )}
        >
          <button
            type="button"
            disabled={!milestone.achieved || !onOpen}
            onClick={() => milestone.event && onOpen?.(milestone.event)}
            className={cn("flex w-full flex-col items-center gap-1", onOpen && milestone.achieved && "cursor-pointer")}
          >
            <span className={cn("text-3xl", !milestone.achieved && "opacity-40 grayscale")} aria-hidden="true">
              {milestone.icon}
            </span>
            <p className="text-xs font-extrabold leading-tight text-[#3B2416]">{milestone.label}</p>
            <p className="text-[10px] font-semibold text-[#7A6A5E]">
              {milestone.achieved ? format(milestone.date) : "À venir"}
            </p>
          </button>
        </motion.li>
      ))}
    </motion.ul>
  )
}

function format(iso: string | null): string {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
  } catch {
    return "—"
  }
}

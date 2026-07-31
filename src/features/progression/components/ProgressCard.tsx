"use client"

import { useProgressionStore } from "../progression-store"
import { levelEngine } from "../level-engine"
import { getTitleForLevel } from "../progression.constants"
import { cn } from "@/lib/utils"

interface ProgressCardProps {
  className?: string
  showNextReward?: boolean
}

export function ProgressCard({ className, showNextReward = true }: ProgressCardProps) {
  const state = useProgressionStore((s) => s.state)

  const { level, xp, xpTotal, currentTitle } = state

  const progress = levelEngine.getProgress(xpTotal)
  const title = currentTitle || getTitleForLevel(progress.level).title
  const icon = getTitleForLevel(progress.level).icon

  return (
    <div className={cn("rounded-[20px] border border-[#F1E7DA] bg-white p-5 shadow-[0_10px_30px_rgba(59,36,22,0.06)]", className)}>
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#FFF9F2] text-4xl">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#7D6AF8]/10 px-3 py-1 text-xs font-bold text-[#7D6AF8]">
              Niveau {level}
            </span>
            <span className="truncate text-sm font-bold text-[#3B2416]">{title}</span>
          </div>

          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-xs font-semibold text-[#7A6A5E]">
              <span>
                {xp} / {progress.xpRequired} XP
              </span>
              <span>{Math.round(progress.progress * 100)}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-[#F5F0EB]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#7D6AF8] to-[#20C997] transition-all duration-500"
                style={{ width: `${Math.min(progress.progress * 100, 100)}%` }}
              />
            </div>
            <p className="mt-1.5 text-[11px] font-medium text-[#7A6A5E]">
              Plus que {progress.xpToNext} XP pour le niveau {progress.level + 1}
            </p>
          </div>
        </div>
      </div>

      {showNextReward && progress.nextReward && (
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-[#FFF9F2] p-3">
          <span className="text-2xl">{progress.nextReward.icon}</span>
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#3B2416]">Prochaine récompense</p>
            <p className="truncate text-xs font-medium text-[#7A6A5E]">{progress.nextReward.label}</p>
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { cn } from "@/lib/utils"
import type { BattlePassState, BattlePassTier } from "../types"

interface MissionProgressProps {
  label?: string
  current: number
  target: number
  xpReward?: number
  starsReward?: number
  className?: string
}

export function MissionProgress({
  label = "Progression",
  current,
  target,
  xpReward,
  starsReward,
  className,
}: MissionProgressProps) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0
  const done = current >= target

  return (
    <div className={cn("rounded-[16px] border border-[#F1E7DA] bg-white p-4 shadow-[0_10px_30px_rgba(59,36,22,0.06)]", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#3B2416]">{label}</span>
        {done && <span className="rounded-full bg-[#20C997]/10 px-2 py-0.5 text-[10px] font-bold text-[#17a97f]">Terminé ✓</span>}
      </div>

      <div className="mt-2">
        <div className="mb-1 flex items-center justify-between text-xs font-semibold text-[#7A6A5E]">
          <span>
            {current} / {target}
          </span>
          <span>{Math.round(pct)}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-[#F5F0EB]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#7D6AF8] to-[#20C997] transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {(xpReward !== undefined || starsReward !== undefined) && (
        <div className="mt-3 flex items-center gap-3 text-xs font-bold text-[#3B2416]">
          {xpReward !== undefined && <span className="text-[#7D6AF8]">+{xpReward} XP</span>}
          {starsReward !== undefined && <span className="text-[#FFB300]">+{starsReward} ⭐</span>}
        </div>
      )}
    </div>
  )
}

interface SeasonProgressProps {
  state: BattlePassState | null
  tier: BattlePassTier
  xpIntoLevel: number
  xpToNext: number
  isPremium?: boolean
  className?: string
}

export function SeasonProgress({ state, tier, xpIntoLevel, xpToNext, isPremium = false, className }: SeasonProgressProps) {
  const level = state?.level ?? 1
  const total = xpIntoLevel + xpToNext
  const pct = total > 0 ? Math.min(xpIntoLevel / total, 1) : 0

  return (
    <div className={cn("rounded-[16px] border border-[#F1E7DA] bg-white p-4 shadow-[0_10px_30px_rgba(59,36,22,0.06)]", className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[#3B2416]">Battle Pass · Niveau {level}</span>
        {isPremium && <span className="rounded-full bg-[#FFB300]/10 px-2 py-0.5 text-[10px] font-bold text-[#FF8A00]">PREMIUM</span>}
      </div>

      <div className="mt-2">
        <div className="mb-1 flex items-center justify-between text-xs font-semibold text-[#7A6A5E]">
          <span>
            {xpIntoLevel} / {total} XP
          </span>
          <span>{Math.round(pct * 100)}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-[#F5F0EB]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#FF8A00] to-[#FFB300] transition-all duration-500"
            style={{ width: `${pct * 100}%` }}
          />
        </div>
        <p className="mt-1.5 text-[11px] font-medium text-[#7A6A5E]">
          Plus que {xpToNext} XP pour le palier {level + 1}
        </p>
      </div>
    </div>
  )
}

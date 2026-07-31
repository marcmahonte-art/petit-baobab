"use client"

import { cn } from "@/lib/utils"
import type { DailyMission, WeeklyMission, MonthlyChallenge } from "../types"

interface MissionCardProps {
  mission: DailyMission | WeeklyMission | MonthlyChallenge
  progress: number
  completed?: boolean
  claimed?: boolean
  periodLabel?: string
  onClaim?: () => void
  className?: string
}

export function MissionCard({
  mission,
  progress,
  completed = false,
  claimed = false,
  periodLabel,
  onClaim,
  className,
}: MissionCardProps) {
  const pct = Math.min((progress / mission.target) * 100, 100)
  const isDone = completed || claimed

  return (
    <div
      className={cn(
        "rounded-[20px] border bg-white p-4 shadow-[0_10px_30px_rgba(59,36,22,0.06)]",
        isDone ? "border-[#20C997]/40" : "border-[#F1E7DA]",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl",
            isDone ? "bg-[#20C997]/10" : "bg-[#FFF9F2]",
          )}
        >
          {mission.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-bold text-[#3B2416]">{mission.title}</span>
            {isDone && <span className="shrink-0 text-[#20C997]">✓</span>}
          </div>
          <p className="mt-0.5 line-clamp-2 text-xs font-medium text-[#7A6A5E]">{mission.description}</p>

          {periodLabel && (
            <span className="mt-1 inline-block rounded-full bg-[#7D6AF8]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#7D6AF8]">
              {periodLabel}
            </span>
          )}
        </div>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex items-center justify-between text-xs font-semibold text-[#7A6A5E]">
          <span>
            {Math.min(progress, mission.target)} / {mission.target}
          </span>
          <span>{Math.round(pct)}%</span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#F5F0EB]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#7D6AF8] to-[#20C997] transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs font-bold text-[#3B2416]">
          <span className="text-[#7D6AF8]">+{mission.reward.xp} XP</span>
          {mission.reward.stars > 0 && <span className="text-[#FFB300]">+{mission.reward.stars} ⭐</span>}
          {mission.reward.item && <span className="text-[#20C997]">🎁</span>}
        </div>

        {isDone ? (
          <button
            onClick={onClaim}
            disabled={claimed}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-bold transition-colors",
              claimed
                ? "cursor-default bg-[#20C997] text-white"
                : "bg-[#20C997] text-white hover:bg-[#17a97f]",
            )}
          >
            {claimed ? "Réclamé ✓" : "Réclamer"}
          </button>
        ) : (
          <span className="rounded-full bg-[#F5F0EB] px-4 py-1.5 text-xs font-bold text-[#7A6A5E]">
            En cours
          </span>
        )}
      </div>
    </div>
  )
}

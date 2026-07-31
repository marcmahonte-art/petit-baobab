"use client"

import { cn } from "@/lib/utils"
import type { SeasonMission, MonthlyChallenge } from "../types"

interface ChallengeCardProps {
  challenge: SeasonMission | MonthlyChallenge
  progress: number
  completed?: boolean
  claimed?: boolean
  label?: string
  onClaim?: () => void
  className?: string
}

export function ChallengeCard({
  challenge,
  progress,
  completed = false,
  claimed = false,
  label,
  onClaim,
  className,
}: ChallengeCardProps) {
  const pct = Math.min((progress / challenge.target) * 100, 100)
  const isDone = completed || claimed

  return (
    <div
      className={cn(
        "rounded-[20px] border bg-white p-5 shadow-[0_10px_30px_rgba(59,36,22,0.06)]",
        isDone ? "border-[#20C997]/40" : "border-[#F1E7DA]",
        className,
      )}
    >
      {label && (
        <span className="mb-3 inline-block rounded-full bg-[#FF6B35]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#FF6B35]">
          {label}
        </span>
      )}

      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl",
            isDone ? "bg-[#20C997]/10" : "bg-[#FFF9F2]",
          )}
        >
          {challenge.icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold text-[#3B2416]">{challenge.title}</h3>
          <p className="mt-0.5 text-sm font-medium text-[#7A6A5E]">{challenge.description}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-xs font-semibold text-[#7A6A5E]">
          <span>
            {Math.min(progress, challenge.target)} / {challenge.target}
          </span>
          <span>{Math.round(pct)}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-[#F5F0EB]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FFB300] transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm font-bold text-[#3B2416]">
          <span className="text-[#7D6AF8]">+{challenge.reward.xp} XP</span>
          {challenge.reward.stars > 0 && <span className="text-[#FFB300]">+{challenge.reward.stars} ⭐</span>}
          {challenge.reward.item && <span className="text-[#20C997]">🎁</span>}
        </div>

        {isDone ? (
          <button
            onClick={onClaim}
            disabled={claimed}
            className={cn(
              "rounded-full px-5 py-2 text-xs font-bold transition-colors",
              claimed
                ? "cursor-default bg-[#20C997] text-white"
                : "bg-[#20C997] text-white hover:bg-[#17a97f]",
            )}
          >
            {claimed ? "Réclamé ✓" : "Réclamer"}
          </button>
        ) : (
          <span className="rounded-full bg-[#F5F0EB] px-5 py-2 text-xs font-bold text-[#7A6A5E]">
            En cours
          </span>
        )}
      </div>
    </div>
  )
}

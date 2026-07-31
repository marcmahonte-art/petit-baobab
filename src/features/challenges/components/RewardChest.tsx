"use client"

import { cn } from "@/lib/utils"
import { getChestForDay } from "../services/calendar-service"
import type { ClaimedReward } from "../rewards/rewards-engine"

interface RewardChestProps {
  day: number
  claimed: boolean
  opened: boolean
  reward?: ClaimedReward | null
  onOpen?: () => void
  className?: string
}

export function RewardChest({ day, claimed, opened, reward, onOpen, className }: RewardChestProps) {
  const chest = getChestForDay(day)

  if (!chest) {
    return (
      <div className={cn("rounded-[20px] border border-[#F1E7DA] bg-white p-5 text-center shadow-[0_10px_30px_rgba(59,36,22,0.06)]", className)}>
        <p className="text-sm font-bold text-[#3B2416]">Jour {day}</p>
        <p className="mt-1 text-xs font-medium text-[#7A6A5E]">Reviens au jour {getChestForDay(day)?.day ?? day} pour ouvrir un coffre</p>
      </div>
    )
  }

  return (
    <div className={cn("rounded-[20px] border bg-white p-6 text-center shadow-[0_10px_30px_rgba(59,36,22,0.06)]", claimed ? "border-[#20C997]/40" : "border-[#F1E7DA]", className)}>
      <span
        className="mx-auto flex h-20 w-20 items-center justify-center rounded-full text-5xl"
        style={{ backgroundColor: `${chest.color}20` }}
      >
        {opened ? "🎉" : chest.icon}
      </span>

      <h3 className="mt-3 text-base font-bold text-[#3B2416]">{chest.name}</h3>
      <p className="text-xs font-medium text-[#7A6A5E]">Jour {chest.day} de connexion</p>

      {opened && reward && (
        <div className="mt-4 rounded-xl bg-[#FFF9F2] p-3 text-left">
          <p className="text-center text-xs font-bold text-[#3B2416]">Contenu du coffre</p>
          <div className="mt-2 flex flex-col gap-1.5 text-xs font-semibold text-[#3B2416]">
            {reward.xp > 0 && <span className="text-[#7D6AF8]">+{reward.xp} XP</span>}
            {reward.stars > 0 && <span className="text-[#FFB300]">+{reward.stars} ⭐</span>}
            {reward.items.map((item) => (
              <span key={`${item.type}_${item.key}`} className="text-[#20C997]">
                🎁 {item.label ?? item.key} ×{item.quantity}
              </span>
            ))}
            {reward.badge && <span className="text-[#FF6B35]">🏅 Badge : {reward.badge}</span>}
          </div>
        </div>
      )}

      {claimed ? (
        <span className="mt-4 inline-block rounded-full bg-[#20C997] px-5 py-2 text-xs font-bold text-white">
          Coffre ouvert ✓
        </span>
      ) : (
        <button
          onClick={onOpen}
          className="mt-4 rounded-full bg-gradient-to-r from-[#FFB300] to-[#FF8A00] px-6 py-2 text-xs font-bold text-white transition-transform hover:scale-105"
        >
          Ouvrir le coffre
        </button>
      )}
    </div>
  )
}

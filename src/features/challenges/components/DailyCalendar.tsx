"use client"

import { cn } from "@/lib/utils"
import { getDayLabel } from "../calendar/calendar-engine"
import { getChestForDay } from "../services/calendar-service"
import type { CalendarDay } from "../types"

interface DailyCalendarProps {
  days: CalendarDay[]
  currentDay: number
  claimedDays: number[]
  onClaim?: (day: number) => void
  className?: string
}

const STATUS_STYLE: Record<CalendarDay["status"], string> = {
  claimed: "border-[#20C997] bg-[#20C997]/10 text-[#17a97f]",
  available: "border-[#7D6AF8] bg-white text-[#7D6AF8] hover:bg-[#7D6AF8]/5 cursor-pointer",
  locked: "border-[#F1E7DA] bg-[#F5F0EB] text-[#C4B8AC]",
  missed: "border-[#F1E7DA] bg-[#F5F0EB] text-[#C4B8AC]",
}

export function DailyCalendar({ days, currentDay, claimedDays, onClaim, className }: DailyCalendarProps) {
  return (
    <div className={cn("rounded-[20px] border border-[#F1E7DA] bg-white p-5 shadow-[0_10px_30px_rgba(59,36,22,0.06)]", className)}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-[#3B2416]">Calendrier des surprises</h3>
          <p className="text-xs font-medium text-[#7A6A5E]">Connecte-toi chaque jour pour récupérer tes récompenses</p>
        </div>
        <span className="rounded-full bg-[#FFB300]/10 px-3 py-1 text-xs font-bold text-[#FF8A00]">
          {claimedDays.length} récompenses
        </span>
      </div>

      <div className="mb-3 grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-[#7A6A5E]">
        {Array.from({ length: 7 }, (_, i) => (
          <span key={i}>{getDayLabel(i)}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const chest = getChestForDay(day.day)
          const isToday = day.day === currentDay
          return (
            <button
              key={day.day}
              onClick={() => day.status === "available" && onClaim?.(day.day)}
              disabled={day.status === "locked" || day.status === "claimed"}
              title={chest ? `${chest.name} — ${chest.day}ᵉ jour` : `Jour ${day.day} : +${day.reward.xp} XP`}
              className={cn(
                "relative flex aspect-square flex-col items-center justify-center rounded-xl border-2 text-xs font-bold transition-all",
                STATUS_STYLE[day.status],
                isToday && day.status === "available" && "ring-2 ring-[#FF6B35] ring-offset-2",
                day.status === "available" && index < days.length - 1 && !isToday && "blink-soft",
              )}
            >
              {day.status === "claimed" ? (
                <span className="text-lg">🎁</span>
              ) : chest ? (
                <span className="text-lg">{chest.icon}</span>
              ) : (
                <span className="text-[10px]">{day.reward.xp} XP</span>
              )}
              <span className="absolute right-0.5 top-0.5 text-[9px] font-bold">{day.day}</span>
              {isToday && day.status === "available" && (
                <span className="absolute -bottom-1 rounded-full bg-[#FF6B35] px-1 text-[8px] font-bold text-white">
                  AUJ.
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

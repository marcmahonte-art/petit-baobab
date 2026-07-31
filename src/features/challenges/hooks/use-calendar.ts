"use client"

import { useCallback, useEffect, useState } from "react"
import { getSupabaseClient } from "@/lib/supabase-client"
import { useChallengesStore } from "../store/challenges-store"
import { claimCalendarDay, getChestForDay } from "../services/calendar-service"
import { buildCalendarMonth } from "../calendar/calendar-engine"
import { claimChestReward } from "../rewards/rewards-engine"
import type { CalendarDay, RewardChest } from "../types"

export function useCalendar(childId?: string) {
  const store = useChallengesStore()
  const [days, setDays] = useState<CalendarDay[]>([])
  const [claiming, setClaiming] = useState(false)

  useEffect(() => {
    if (!childId) return
    const calendar = store.calendar
    const currentDay = calendar?.currentDay ?? 0
    const claimedDays = calendar?.claimedDays ?? []
    setDays(buildCalendarMonth(childId, claimedDays, currentDay))
  }, [childId, store.calendar])

  const claimDay = useCallback(
    async (day: number): Promise<CalendarDay | null> => {
      if (!childId || claiming) return null
      setClaiming(true)
      try {
        const supabase = getSupabaseClient()
        const claimed = await claimCalendarDay(supabase, childId, day)
        if (claimed) {
          store.claimChest(day)
          const chest = getChestForDay(day)
          if (chest) {
            const rewardChest: RewardChest = {
              id: `chest_${childId}_${day}`,
              child_id: childId,
              chest_id: chest.id,
              day,
              claimed: true,
              claimed_at: new Date().toISOString(),
            }
            await claimChestReward(rewardChest, childId)
          }
          setDays(buildCalendarMonth(childId, [...(store.calendar?.claimedDays ?? []), day], store.calendar?.currentDay ?? 0))
        }
        return claimed
      } finally {
        setClaiming(false)
      }
    },
    [childId, claiming, store],
  )

  return {
    days,
    claiming,
    claimDay,
    currentDay: store.calendar?.currentDay ?? 0,
    claimedDays: store.calendar?.claimedDays ?? [],
  }
}

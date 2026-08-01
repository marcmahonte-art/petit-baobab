"use client"

import { useCallback, useEffect, useRef } from "react"
import { useChallengesStore } from "../store/challenges-store"
import { challengesService } from "../services/index"
import { listenToMissionEvents } from "../services/mission-service"

export function useChallenges(childId?: string, plan: string = "free") {
  const store = useChallengesStore()
  const set = useChallengesStore((s) => s.set)
  const setProgress = useChallengesStore((s) => s.setProgress)
  const childIdRef = useRef<string | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  const initialize = useCallback(
    async (id: string, currentPlan: string = plan) => {
      const current = useChallengesStore.getState()
      if (childIdRef.current === id && current.initialized) return
      childIdRef.current = id
      set({ loading: true })

      await challengesService.init(id, currentPlan, {
        set,
        setProgress,
      })

      const latest = useChallengesStore.getState()
      const missionIds = [
        ...latest.daily.map((m) => m.id),
        ...latest.weekly.map((m) => m.id),
        ...(latest.monthly ? [latest.monthly.id] : []),
      ]

      cleanupRef.current?.()
      cleanupRef.current = await listenToMissionEvents(id, missionIds, (missionId, progress, completed) => {
        const s = useChallengesStore.getState()
        const isDaily = s.daily.some((m) => m.id === missionId)
        const isWeekly = s.weekly.some((m) => m.id === missionId)
        if (isDaily) {
          s.setProgress("daily", missionId, progress, completed)
          challengesService.handleMissionEvent("daily", missionId, progress, completed)
        } else if (isWeekly) {
          s.setProgress("weekly", missionId, progress, completed)
          challengesService.handleMissionEvent("weekly", missionId, progress, completed)
        }
      })

      set({ loading: false, initialized: true })
    },
    [plan, set, setProgress],
  )

  useEffect(() => {
    if (childId) {
      void initialize(childId, plan)
    }
    return () => {
      cleanupRef.current?.()
      cleanupRef.current = null
    }
  }, [childId, initialize, plan])

  return {
    ...store,
    initialize,
  }
}

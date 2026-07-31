"use client"

import { useCallback, useEffect, useRef } from "react"
import { useChallengesStore } from "../store/challenges-store"
import { challengesService } from "../services/index"
import { listenToMissionEvents } from "../services/mission-service"

export function useChallenges(childId?: string, plan: string = "free") {
  const store = useChallengesStore()
  const childIdRef = useRef<string | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  const initialize = useCallback(
    async (id: string, currentPlan: string = plan) => {
      if (childIdRef.current === id && store.initialized) return
      childIdRef.current = id
      store.set({ loading: true })

      await challengesService.init(id, currentPlan, {
        set: (partial) => store.set(partial),
        setProgress: (period, missionId, progress, completed) =>
          store.setProgress(period, missionId, progress, completed),
      })

      const missionIds = [
        ...store.daily.map((m) => m.id),
        ...store.weekly.map((m) => m.id),
        ...(store.monthly ? [store.monthly.id] : []),
      ]

      cleanupRef.current?.()
      cleanupRef.current = await listenToMissionEvents(id, missionIds, (missionId, progress, completed) => {
        const isDaily = store.daily.some((m) => m.id === missionId)
        const isWeekly = store.weekly.some((m) => m.id === missionId)
        if (isDaily) {
          store.setProgress("daily", missionId, progress, completed)
          challengesService.handleMissionEvent("daily", missionId, progress, completed)
        } else if (isWeekly) {
          store.setProgress("weekly", missionId, progress, completed)
          challengesService.handleMissionEvent("weekly", missionId, progress, completed)
        }
      })

      store.set({ loading: false, initialized: true })
    },
    [plan, store],
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

"use client"

import { useCallback } from "react"
import { useGamificationStore } from "../store/gamification-store"
import { engine } from "../engine"
import { emit } from "../event-bus"
import type { GameEventType, EventPayload, RewardResult } from "../types"

export function useGamification(childId?: string) {
  const store = useGamificationStore()

  const initialize = useCallback(
    (id: string, data?: { name?: string; mascot?: string; plan?: "free" | "decouverte" | "super-baobab" | "ecole-pro" }) => {
      store.initialize(id, data ?? {})
    },
    [store.initialize],
  )

  const processEvent = useCallback(
    async (event: GameEventType, payload: EventPayload): Promise<RewardResult> => {
      const result = await engine.processEvent(event, payload)
      if (payload.childId) {
        store.refresh(payload.childId)
      }
      return result
    },
    [store.refresh],
  )

  const emitEvent = useCallback(
    async (event: GameEventType, payload: EventPayload): Promise<void> => {
      await emit(event, payload)
    },
    [],
  )

  const refreshProfile = useCallback(
    (id: string) => {
      store.refresh(id)
    },
    [store.refresh],
  )

  return {
    profile: store.profile,
    badges: store.badges,
    notifications: store.notifications,
    dailyRewards: store.dailyRewards,
    initialized: store.initialized,

    initialize,
    processEvent,
    emitEvent,
    refreshProfile,
  }
}

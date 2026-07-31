"use client"

import { useEffect, useCallback } from "react"
import { useProgressionStore } from "../progression-store"
import { progressionService } from "../progression.service"
import { levelEngine } from "../level-engine"
import type { ProgressionResult } from "../progression.types"
import type { GameEventType } from "../../gamification/types"

export function useProgression(childId?: string, plan?: "free" | "decouverte" | "super-baobab" | "ecole-pro") {
  const state = useProgressionStore((s) => s.state)
  const showLevelUp = useProgressionStore((s) => s.showLevelUp)
  const hideLevelUp = useProgressionStore((s) => s.hideLevelUp)

  useEffect(() => {
    if (childId) {
      void progressionService.init(childId, plan)
      return () => progressionService.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId, plan])

  const handleEvent = useCallback(
    async (event: GameEventType, payload: Parameters<typeof progressionService.handleEvent>[1]): Promise<ProgressionResult> => {
      return progressionService.handleEvent(event, payload)
    },
    [],
  )

  const isItemUnlocked = useCallback(
    (itemType: string, itemKey: string) => progressionService.isItemUnlocked(itemType, itemKey),
    [],
  )

  const progress = state.childId
    ? levelEngine.getProgress(state.xpTotal)
    : { level: 1, title: { level: 1, title: "", icon: "" }, xp: 0, xpInLevel: 0, xpRequired: 10, xpToNext: 10, progress: 0, nextReward: null }

  return {
    ...state,
    progress,
    handleEvent,
    isItemUnlocked,
    showLevelUp,
    hideLevelUp,
  }
}

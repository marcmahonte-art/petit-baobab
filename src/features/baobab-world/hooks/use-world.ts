"use client"

import { useCallback, useEffect, useRef } from "react"
import { useWorldStore } from "../store/world-store"
import { worldService } from "../services/world-service"
import { worldEngine } from "../world/engine"
import { getTimeOfDay } from "../constants"

export function useWorld(childId?: string) {
  const store = useWorldStore()
  const setTimeOfDay = useWorldStore((s) => s.setTimeOfDay)
  const initializedRef = useRef(false)

  const initialize = useCallback(
    async (id: string) => {
      if (initializedRef.current) return
      initializedRef.current = true
      await worldService.init(id)
    },
    [],
  )

  useEffect(() => {
    if (childId) {
      void initialize(childId)
    }
    return () => {
      worldService.dispose()
      initializedRef.current = false
    }
  }, [childId, initialize])

  useEffect(() => {
    const updateTime = () => {
      setTimeOfDay(getTimeOfDay().time)
    }
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [setTimeOfDay])

  const createMemory = useCallback(
    async (event: string, metadata: Record<string, unknown>) => {
      await worldService.createMemory(event, metadata)
    },
    [],
  )

  const recordCapture = useCallback(
    async (capture: { image: string; caption: string }) => {
      await worldService.recordCapture(capture)
    },
    [],
  )

  const treeStage = store.world ? worldEngine.getStage(store.world.tree_level) : null
  const nextTarget = store.world ? worldEngine.getNextGrowthTarget(store.world.tree_level) : null

  return {
    ...store,
    treeStage,
    nextTarget,
    createMemory,
    recordCapture,
    initialize,
  }
}

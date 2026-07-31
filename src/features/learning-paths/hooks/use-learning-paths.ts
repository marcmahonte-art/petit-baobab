"use client"

import { useCallback, useEffect, useMemo, useRef } from "react"
import { useLearningStore } from "../store/learning-store"
import { learningService } from "../services/learning-service"
import { pathEngine } from "../engine/path-engine"
import type { GameEventType } from "../../gamification/types"
import type { PathProgress, RecommendationScore } from "../types"

export interface LearningPathsOptions {
  childName?: string
  age?: number
  level?: number
  preferences?: string[]
  activities?: Partial<Record<GameEventType, number>>
}

export function useLearningPaths(childId?: string, options: LearningPathsOptions = {}) {
  const store = useLearningStore()
  const initializedRef = useRef(false)
  const lastTick = useRef(0)

  const initialize = useCallback(async (id: string) => {
    if (initializedRef.current) return
    initializedRef.current = true
    await learningService.init(id)
  }, [])

  useEffect(() => {
    if (childId) {
      void initialize(childId)
    }
    return () => {
      learningService.dispose()
      initializedRef.current = false
    }
  }, [childId, initialize])

  // Temps d'apprentissage (accumulé quand l'onglet est visible)
  useEffect(() => {
    lastTick.current = Date.now()
    const interval = setInterval(() => {
      const now = Date.now()
      if (document.visibilityState === "visible") {
        const elapsed = Math.round((now - lastTick.current) / 1000)
        if (elapsed >= 1) {
          useLearningStore.getState().addLearningTime(elapsed)
        }
      }
      lastTick.current = now
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const progressByPath: PathProgress[] = useMemo(
    () =>
      store.paths.map((p) => pathEngine.computePathProgress(p, store.progress[p.id] ?? [])),
    [store.paths, store.progress],
  )

  const inProgress = useMemo(
    () => progressByPath.filter((p) => p.status === "in_progress").sort((a, b) => b.progress - a.progress),
    [progressByPath],
  )

  const completedPaths = useMemo(
    () => progressByPath.filter((p) => p.status === "completed").sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? "")),
    [progressByPath],
  )

  const availablePaths = useMemo(() => progressByPath.filter((p) => p.status === "available"), [progressByPath])

  const recommendations: RecommendationScore[] = useMemo(
    () =>
      pathEngine.getRecommendations({
        age: options.age,
        level: options.level,
        preferences: options.preferences?.length ? options.preferences : [options.childName?.toLowerCase() ?? ""],
        activities: options.activities,
        learningMinutes: Math.round(store.learningSeconds / 60),
        completedPathIds: completedPaths.map((p) => p.path.id),
      }),
    [options.age, options.level, options.preferences, options.childName, options.activities, store.learningSeconds, completedPaths],
  )

  const completeLesson = useCallback(
    (pathId: string, lessonId: string) => learningService.completeLessonByPath(pathId, lessonId),
    [],
  )

  const startLesson = useCallback((pathId: string, lessonId: string) => learningService.startLesson(pathId, lessonId), [])

  const validateManually = useCallback((pathId: string, lessonId: string) => learningService.completeLessonByPath(pathId, lessonId), [])

  return {
    ...store,
    progressByPath,
    inProgress,
    completedPaths,
    availablePaths,
    recommendations,
    completeLesson,
    startLesson,
    validateManually,
  }
}

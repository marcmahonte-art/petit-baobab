"use client"

import { useCallback, useEffect, useMemo, useRef } from "react"
import { useLearningMapStore } from "../store/learning-map-store"
import { mapService } from "../services/map-service"
import { mapEngine } from "../engine/map-engine"
import {
  getLevelProgress,
  getTodayDayKey,
} from "../constants/map-constants"
import type {
  DailyMissionProgress,
  LearningMission,
  MissionProgress,
  RegionProgress,
  WeeklyMissionProgress,
} from "../types"

/**
 * Hook de la Learning Map (le "GPS" de l'enfant).
 * Charge régions + missions + progression + statistiques, expose les
 * dérivations (progression par région, mission actuelle, quêtes, radar,
 * prochain objectif) et les actions (démarrer / compléter une mission).
 */
export function useLearningMap(childId?: string) {
  const store = useLearningMapStore()
  const initializedRef = useRef(false)

  const initialize = useCallback(async (id: string) => {
    if (initializedRef.current) return
    initializedRef.current = true
    store.set({ childId: id, loading: true })
    try {
      await mapService.init(id)
      const [regions, missions, missionProgress, dailies, weeklies, statistics] =
        await Promise.all([
          mapService.loadRegions(),
          mapService.loadMissions(),
          mapService.loadMissionProgress(),
          mapService.loadDailies(),
          mapService.loadWeeklies(),
          mapService.loadStatistics(),
        ])
      store.set({
        regions,
        missions,
        missionProgress,
        dailies,
        weeklies,
        statistics,
        loading: false,
        initialized: true,
      })
      if (statistics) {
        store.setRadar({
          creativity: statistics.creativity,
          reading: statistics.reading,
          observation: statistics.observation,
          logic: statistics.logic,
          perseverance: statistics.perseverance,
          imagination: statistics.imagination,
        })
      }
    } catch {
      store.set({ loading: false, initialized: true })
    }
  }, [store])

  useEffect(() => {
    if (childId) {
      void initialize(childId)
    }
    return () => {
      mapService.dispose()
    }
  }, [childId, initialize])

  // -------------------------------------------------------------------------
  // Dérivations
  // -------------------------------------------------------------------------

  const missionsByRegion = useMemo(() => {
    const map: Record<string, LearningMission[]> = {}
    for (const mission of store.missions) {
      if (!map[mission.region_id]) map[mission.region_id] = []
      map[mission.region_id].push(mission)
    }
    return map
  }, [store.missions])

  const regionProgress: RegionProgress[] = useMemo(
    () =>
      store.regions.map((region) =>
        mapEngine.computeRegionProgress(
          region,
          missionsByRegion[region.id] ?? [],
          store.missionProgress,
          store.totalXp,
        ),
      ),
    [store.regions, missionsByRegion, store.missionProgress, store.totalXp],
  )

  const currentMission = useMemo(
    () =>
      mapEngine.getCurrentMission(
        store.regions,
        missionsByRegion,
        store.missionProgress,
        store.totalXp,
      ),
    [store.regions, missionsByRegion, store.missionProgress, store.totalXp],
  )

  const currentRegion = useMemo(
    () =>
      currentMission
        ? store.regions.find((r) => r.id === currentMission.region_id) ?? null
        : null,
    [currentMission, store.regions],
  )

  const sideQuests: MissionProgress[] = useMemo(
    () =>
      mapEngine.getSideQuests(
        currentMission,
        store.regions,
        missionsByRegion,
        store.missionProgress,
        store.totalXp,
      ),
    [currentMission, store.regions, missionsByRegion, store.missionProgress, store.totalXp],
  )

  const completedMissionIds = useMemo(
    () => mapEngine.getCompletedMissionIds(store.missionProgress),
    [store.missionProgress],
  )

  const todayKey = getTodayDayKey()
  const dailyProgress: DailyMissionProgress[] = useMemo(
    () => {
      const todayDailies = store.dailies.filter((d) => d.day_key === todayKey)
      return mapEngine.getDailyProgress(todayDailies, completedMissionIds)
    },
    [store.dailies, todayKey, completedMissionIds],
  )

  const weeklyProgress: WeeklyMissionProgress[] = useMemo(
    () => mapEngine.getWeeklyProgress(store.weeklies, completedMissionIds),
    [store.weeklies, completedMissionIds],
  )

  const levelInfo = useMemo(() => getLevelProgress(store.totalXp), [store.totalXp])

  const nextObjective = useMemo(
    () => mapEngine.getNextUnlockableRegion(store.regions, store.totalXp)?.region ?? null,
    [store.regions, store.totalXp],
  )

  const nextObjectiveXpNeeded = useMemo(
    () => mapEngine.getNextUnlockableRegion(store.regions, store.totalXp)?.xpNeeded ?? 0,
    [store.regions, store.totalXp],
  )

  const lockedRegionCount = useMemo(
    () => store.regions.filter((r) => mapEngine.getRegionStatus(r, store.totalXp) === "locked").length,
    [store.regions, store.totalXp],
  )

  // -------------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------------

  const startMission = useCallback(async (missionId: string) => {
    await mapService.startMission(missionId)
    store.setMissionProgress(await mapService.loadMissionProgress())
  }, [store])

  const completeMission = useCallback(
    async (missionId: string) => {
      const result = await mapService.completeMission(missionId)
      if (result) {
        store.setMissionProgress(await mapService.loadMissionProgress())
        store.setRadar(result.radar)
        store.setStatistics(await mapService.loadStatistics())
        store.openReward(
          { xp: result.xp, stars: result.stars, badge: result.badge },
          result.regionUnlocked,
        )
      }
      return result
    },
    [store],
  )

  const completeQuest = useCallback(
    async (type: "daily" | "weekly", questId: string) => {
      const result = await mapService.completeQuest(type, questId)
      if (result) {
        store.setRadar(await mapService.loadStatistics().then((s) => ({
          creativity: s?.creativity ?? 0,
          reading: s?.reading ?? 0,
          observation: s?.observation ?? 0,
          logic: s?.logic ?? 0,
          perseverance: s?.perseverance ?? 0,
          imagination: s?.imagination ?? 0,
        })))
        store.openReward({ xp: result.xp, stars: result.stars, badge: null }, false)
      }
      return result
    },
    [store],
  )

  const addLearningTime = useCallback(async (seconds: number) => {
    await mapService.addLearningTime(seconds)
  }, [])

  return {
    ...store,
    missionsByRegion,
    regionProgress,
    currentMission,
    currentRegion,
    sideQuests,
    completedMissionIds,
    dailyProgress,
    weeklyProgress,
    levelInfo,
    nextObjective,
    nextObjectiveXpNeeded,
    lockedRegionCount,
    startMission,
    completeMission,
    completeQuest,
    addLearningTime,
  }
}

import type {
  ChildMissionProgress,
  DailyMission,
  DailyMissionProgress,
  LearningMission,
  LearningRegion,
  MissionProgress,
  MissionType,
  RegionProgress,
  RegionStatus,
  SkillRadar,
  WeeklyMission,
  WeeklyMissionProgress,
} from "../types"

export interface MapEngineContext {
  totalXp: number
  completedMissionIds: Set<string>
  startedMissionIds: Set<string>
}

/**
 * Moteur pur de la Learning Map (le "GPS" de l'enfant).
 * Aucune I/O : toute la logique de déblocage des régions, des missions,
 * des quêtes et du radar de compétences vit ici et reste testable hors-ligne.
 */
export class MapEngine {
  // -------------------------------------------------------------------------
  // Déblocage des régions (par XP total)
  // -------------------------------------------------------------------------

  getRegionStatus(region: LearningRegion, totalXp: number): RegionStatus {
    if (totalXp >= region.required_xp) return "available"
    return "locked"
  }

  computeRegionProgress(
    region: LearningRegion,
    missions: LearningMission[],
    progress: ChildMissionProgress[],
    totalXp: number,
  ): RegionProgress {
    const completed = this.getCompletedMissionIds(progress)
    const started = this.getStartedMissionIds(progress)
    const missionProgress: MissionProgress[] = missions.map((mission) => ({
      mission,
      status: this.getMissionStatus(mission, region, progress, totalXp),
      progress: progress.find((p) => p.mission_id === mission.id)?.progress ?? 0,
      completedAt: progress.find((p) => p.mission_id === mission.id)?.completed_at ?? null,
    }))

    // La première mission non terminée d'une région débloquée devient disponible.
    const regionOpen = this.getRegionStatus(region, totalXp) !== "locked"
    if (regionOpen) {
      const firstNotCompleted = missionProgress.find(
        (m) => m.status !== "completed" && m.status !== "in_progress",
      )
      if (firstNotCompleted) {
        firstNotCompleted.status = "available"
      }
    }

    const totalMissions = missions.length
    const completedMissions = missions.filter((m) => completed.has(m.id)).length

    const status: RegionStatus = this.getRegionStatus(region, totalXp)
    const anyStarted = started.size > 0 || completedMissions > 0
    const allDone = totalMissions > 0 && completedMissions === totalMissions

    return {
      region,
      status: allDone ? "completed" : status === "available" && anyStarted ? "in_progress" : status,
      missions: missionProgress,
      completedMissions,
      totalMissions,
      progress: totalMissions ? Math.round((completedMissions / totalMissions) * 100) : 0,
      currentMission: missionProgress.find((m) => m.status === "in_progress")?.mission ?? null,
      nextMission: missionProgress.find((m) => m.status === "available")?.mission ?? null,
    }
  }

  // -------------------------------------------------------------------------
  // Missions
  // -------------------------------------------------------------------------

  getCompletedMissionIds(rows: ChildMissionProgress[]): Set<string> {
    return new Set(rows.filter((r) => r.status === "completed").map((r) => r.mission_id))
  }

  getStartedMissionIds(rows: ChildMissionProgress[]): Set<string> {
    return new Set(
      rows.filter((r) => r.status === "in_progress" || r.status === "completed").map((r) => r.mission_id),
    )
  }

  /**
   * Statut d'une mission dans sa région :
   * - locked    : région verrouillée (XP insuffisant)
   * - available : première mission non terminée de la région
   * - in_progress : déjà commencée (mais pas terminée)
   * - completed : terminée
   */
  getMissionStatus(
    mission: LearningMission,
    region: LearningRegion,
    rows: ChildMissionProgress[],
    totalXp: number,
  ): "locked" | "available" | "in_progress" | "completed" {
    const row = rows.find((r) => r.mission_id === mission.id)
    if (row?.status === "completed") return "completed"
    if (row?.status === "in_progress") return "in_progress"

    if (this.getRegionStatus(region, totalXp) === "locked") return "locked"
    return "available"
  }

  /** Prochaine mission disponible dans toute la carte (pour la "mission actuelle"). */
  getCurrentMission(
    regions: LearningRegion[],
    missionsByRegion: Record<string, LearningMission[]>,
    rows: ChildMissionProgress[],
    totalXp: number,
  ): LearningMission | null {
    for (const region of regions) {
      if (this.getRegionStatus(region, totalXp) === "locked") continue
      const progress = this.computeRegionProgress(
        region,
        missionsByRegion[region.id] ?? [],
        rows,
        totalXp,
      )
      if (progress.currentMission) return progress.currentMission
      if (progress.nextMission) return progress.nextMission
    }
    return null
  }

  /** Missions de quête secondaire (toutes sauf l'actuelle). */
  getSideQuests(
    current: LearningMission | null,
    regions: LearningRegion[],
    missionsByRegion: Record<string, LearningMission[]>,
    rows: ChildMissionProgress[],
    totalXp: number,
  ): MissionProgress[] {
    const completed = this.getCompletedMissionIds(rows)
    const all: MissionProgress[] = []
    for (const region of regions) {
      if (this.getRegionStatus(region, totalXp) === "locked") continue
      for (const mission of missionsByRegion[region.id] ?? []) {
        if (current && mission.id === current.id) continue
        if (completed.has(mission.id)) continue
        all.push({
          mission,
          status: this.getMissionStatus(mission, region, rows, totalXp),
          progress: rows.find((r) => r.mission_id === mission.id)?.progress ?? 0,
          completedAt: rows.find((r) => r.mission_id === mission.id)?.completed_at ?? null,
        })
      }
    }
    return all.slice(0, 6)
  }

  // -------------------------------------------------------------------------
  // Prochain objectif
  // -------------------------------------------------------------------------

  getNextUnlockableRegion(
    regions: LearningRegion[],
    totalXp: number,
  ): { region: LearningRegion; xpNeeded: number } | null {
    const next = regions
      .filter((r) => totalXp < r.required_xp)
      .sort((a, b) => a.required_xp - b.required_xp)[0]
    if (!next) return null
    return { region: next, xpNeeded: next.required_xp - totalXp }
  }

  // -------------------------------------------------------------------------
  // Quêtes quotidiennes / hebdomadaires
  // -------------------------------------------------------------------------

  getDailyProgress(
    dailies: DailyMission[],
    completedIds: Set<string>,
  ): DailyMissionProgress[] {
    return dailies.map((mission) => ({
      mission,
      status: completedIds.has(mission.id) ? "completed" : "available",
      completed: completedIds.has(mission.id),
    }))
  }

  getWeeklyProgress(
    weeklies: WeeklyMission[],
    completedIds: Set<string>,
  ): WeeklyMissionProgress[] {
    return weeklies.map((mission) => ({
      mission,
      status: completedIds.has(mission.id) ? "completed" : "available",
      completed: completedIds.has(mission.id),
    }))
  }

  // -------------------------------------------------------------------------
  // Radar de compétences
  // -------------------------------------------------------------------------

  /**
   * Met à jour le radar à partir des activités réelles.
   * Chaque type d'activité renforce 1 à 2 compétences.
   */
  updateRadar(radar: SkillRadar, type: MissionType, delta = 2): SkillRadar {
    const next = { ...radar }
    switch (type) {
      case "COLORING":
        next.creativity = this.clamp(next.creativity + delta)
        next.observation = this.clamp(next.observation + delta)
        break
      case "MAGIC_DRAWING":
        next.creativity = this.clamp(next.creativity + delta)
        next.imagination = this.clamp(next.imagination + delta)
        break
      case "BOOK":
        next.creativity = this.clamp(next.creativity + delta)
        next.reading = this.clamp(next.reading + delta)
        break
      case "GAME":
        next.logic = this.clamp(next.logic + delta)
        next.perseverance = this.clamp(next.perseverance + delta)
        break
      case "QUIZ":
        next.logic = this.clamp(next.logic + delta)
        next.observation = this.clamp(next.observation + delta)
        break
      case "STORY":
        next.reading = this.clamp(next.reading + delta)
        next.imagination = this.clamp(next.imagination + delta)
        break
      case "VIDEO":
        next.observation = this.clamp(next.observation + delta)
        break
      case "CHALLENGE":
        next.perseverance = this.clamp(next.perseverance + delta)
        next.logic = this.clamp(next.logic + delta)
        break
      case "MISSION":
        next.perseverance = this.clamp(next.perseverance + delta)
        break
      case "COLLECTION":
        next.observation = this.clamp(next.observation + delta)
        next.imagination = this.clamp(next.imagination + delta)
        break
    }
    return next
  }

  /** Radar "par défaut" après le premier événement (débloque l'affichage). */
  hasProgress(radar: SkillRadar): boolean {
    return Object.values(radar).some((v) => v > 0)
  }

  private clamp(v: number): number {
    return Math.max(0, Math.min(100, v))
  }
}

export const mapEngine = new MapEngine()

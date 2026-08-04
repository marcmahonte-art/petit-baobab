import { getSupabaseClient } from "@/lib/supabase-client"
import { eventBus } from "@/features/gamification/event-bus"
import type { AnyEventPayload } from "@/features/gamification/event-bus"
import {
  buildMapMissions,
  buildMapRegions,
  DAILY_MISSIONS,
  LEVELS_SEED,
  MAP_REGIONS,
  WEEKLY_MISSIONS,
  getMissionById,
} from "../constants/map-constants"
import { mapEngine } from "../engine/map-engine"
import type {
  ChildMissionProgress,
  DailyMission,
  LearningMission,
  LearningRegion,
  LearningStatistics,
  MissionReward,
  SkillRadar,
  WeeklyMission,
} from "../types"

type Supabase = ReturnType<typeof getSupabaseClient>

export interface MissionCompleteResult {
  mission: LearningMission
  region: LearningRegion
  xp: number
  stars: number
  badge: string | null
  radar: SkillRadar
  regionUnlocked: boolean
}

/**
 * Seed idempotent de la Learning Map (régions, missions, quêtes, niveaux).
 * Utilisé côté client (map-service) et côté serveur (API routes).
 */
export async function seedLearningMap(supabase: Supabase): Promise<void> {
  const { count } = await supabase.from("learning_regions").select("id", { count: "exact", head: true })
  if ((count ?? 0) > 0) return

  const regions = buildMapRegions()
  const missions = buildMapMissions()

  await supabase.from("learning_regions").insert(
    regions.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      description: r.description,
      icon: r.icon,
      color: r.color,
      position_x: r.position_x,
      position_y: r.position_y,
      required_xp: r.required_xp,
      order_index: r.order_index,
      is_active: r.is_active,
    })),
  )

  await supabase.from("learning_missions").insert(
    missions.map((m) => ({
      id: m.id,
      region_id: m.region_id,
      title: m.title,
      description: m.description,
      level: m.level,
      order_index: m.order_index,
      xp: m.xp,
      stars: m.stars,
      badge: m.badge,
      illustration: m.illustration,
      type: m.type,
      duration: m.duration,
      difficulty: m.difficulty,
      prerequisites: m.prerequisites,
    })),
  )

  await supabase.from("mission_rewards").insert(
    missions.map((m) => ({
      mission_id: m.id,
      xp: m.xp,
      stars: m.stars,
      badge: m.badge ?? null,
      item: null,
    })),
  )

  await supabase.from("daily_missions").insert(DAILY_MISSIONS)
  await supabase.from("weekly_missions").insert(WEEKLY_MISSIONS)
  await supabase.from("learning_levels").insert(
    LEVELS_SEED.map((l) => ({
      id: `level_${l.level}`,
      level: l.level,
      title: l.title,
      xp_required: l.xp_required,
      reward_stars: l.reward_stars,
      icon: l.icon,
    })),
  )
}

export class MapService {
  private childId: string | null = null
  private cleanup: (() => void) | null = null
  private initialized = false

  async init(childId: string): Promise<void> {
    this.childId = childId
    const supabase = getSupabaseClient()
    await seedLearningMap(supabase)

    if (!this.initialized) {
      this.cleanup = eventBus.onAny((payload) => {
        if (payload.childId === this.childId) {
          void this.handleActivity(payload)
        }
      })
      this.initialized = true
    }
  }

  dispose(): void {
    this.cleanup?.()
    this.initialized = false
  }

  /**
   * Connexion inter-modules : chaque activité réelle (coloriage, dessin,
   * livre, jeu, quiz...) ajoute du temps d'apprentissage aux statistiques
   * de la Learning Map, sans jamais écrire de mission terminée à la place
   * de l'enfant.
   */
  private async handleActivity(payload: AnyEventPayload): Promise<void> {
    const ACTIVITY_EVENTS: Partial<Record<string, number>> = {
      DRAWING_CREATED: 300,
      DRAWING_COMPLETED: 300,
      MAGIC_DRAWING_CREATED: 360,
      COLORING_COMPLETED: 240,
      BOOK_CREATED: 420,
      BOOK_PRINTED: 60,
      STORY_CREATED: 420,
      GAME_COMPLETED: 300,
      QUIZ_COMPLETED: 240,
    }
    const defaultSeconds = ACTIVITY_EVENTS[payload.type]
    if (!defaultSeconds) return
    const duration = payload.duration ?? defaultSeconds
    await this.addLearningTime(duration)
  }

  async loadRegions(supabase?: Supabase): Promise<LearningRegion[]> {
    const client = supabase ?? getSupabaseClient()
    const { data } = await client.from("learning_regions").select("*").order("order_index")
    return (data?.length ? (data as unknown as LearningRegion[]) : MAP_REGIONS) ?? MAP_REGIONS
  }

  async loadMissions(supabase?: Supabase): Promise<LearningMission[]> {
    const client = supabase ?? getSupabaseClient()
    const { data } = await client.from("learning_missions").select("*").order("order_index")
    return (data?.length ? (data as unknown as LearningMission[]) : buildMapMissions()) ?? buildMapMissions()
  }

  async loadMissionProgress(supabase?: Supabase): Promise<ChildMissionProgress[]> {
    const childId = this.childId
    if (!childId) return []
    const client = supabase ?? getSupabaseClient()
    const { data } = await client
      .from("child_mission_progress")
      .select("*")
      .eq("child_id", childId)
    return (data ?? []) as ChildMissionProgress[]
  }

  async loadDailies(supabase?: Supabase): Promise<DailyMission[]> {
    const client = supabase ?? getSupabaseClient()
    const { data } = await client.from("daily_missions").select("*").eq("is_active", true)
    return (data?.length ? (data as unknown as DailyMission[]) : DAILY_MISSIONS) ?? DAILY_MISSIONS
  }

  async loadWeeklies(supabase?: Supabase): Promise<WeeklyMission[]> {
    const client = supabase ?? getSupabaseClient()
    const { data } = await client.from("weekly_missions").select("*").eq("is_active", true)
    return (data?.length ? (data as unknown as WeeklyMission[]) : WEEKLY_MISSIONS) ?? WEEKLY_MISSIONS
  }

  async loadStatistics(supabase?: Supabase): Promise<LearningStatistics | null> {
    const childId = this.childId
    if (!childId) return null
    const client = supabase ?? getSupabaseClient()
    const { data } = await client
      .from("learning_statistics")
      .select("*")
      .eq("child_id", childId)
      .maybeSingle()
    return (data as LearningStatistics | null) ?? null
  }

  // -------------------------------------------------------------------------
  // Écritures
  // -------------------------------------------------------------------------

  async startMission(missionId: string): Promise<void> {
    const childId = this.childId
    if (!childId) return
    const supabase = getSupabaseClient()
    await supabase.from("child_mission_progress").upsert(
      {
        child_id: childId,
        mission_id: missionId,
        status: "in_progress",
        progress: 10,
        started_at: new Date().toISOString(),
        completed_at: null,
      },
      { onConflict: "child_id,mission_id" },
    )
  }

  /**
   * Complète une mission, met à jour les statistiques (radar) et retourne
   * la récompense accordée.
   */
  async completeMission(missionId: string): Promise<MissionCompleteResult | null> {
    const childId = this.childId
    if (!childId) return null
    const mission = getMissionById(missionId)
    if (!mission) return null

    const supabase = getSupabaseClient()
    const region = MAP_REGIONS.find((r) => r.id === mission.region_id) ?? {
      id: mission.region_id,
      slug: mission.region_id,
      title: "",
      description: "",
      icon: "🏝️",
      color: "#20C997",
      position_x: 0,
      position_y: 0,
      required_xp: 0,
      order_index: 0,
      is_active: true,
    }

    const stats = await this.loadStatistics(supabase)
    const radar = stats
      ? {
          creativity: stats.creativity,
          reading: stats.reading,
          observation: stats.observation,
          logic: stats.logic,
          perseverance: stats.perseverance,
          imagination: stats.imagination,
        }
      : {
          creativity: 0,
          reading: 0,
          observation: 0,
          logic: 0,
          perseverance: 0,
          imagination: 0,
        }

    const nextRadar = mapEngine.updateRadar(radar, mission.type)
    const completedBefore = (await this.loadMissionProgress(supabase)).filter((p) => p.status === "completed")
    const regionsUnlockedBefore = MAP_REGIONS.filter(
      (r) => mapEngine.getRegionStatus(r, stats?.total_xp ?? 0) !== "locked",
    ).length
    const totalXp = (stats?.total_xp ?? 0) + mission.xp
    const missionsCompleted = (stats?.missions_completed ?? 0) + 1
    const regionsUnlockedAfter = MAP_REGIONS.filter(
      (r) => mapEngine.getRegionStatus(r, totalXp) !== "locked",
    ).length

    await supabase.from("child_mission_progress").upsert(
      {
        child_id: childId,
        mission_id: missionId,
        status: "completed",
        progress: 100,
        started_at: completedBefore.length ? undefined : new Date().toISOString(),
        completed_at: new Date().toISOString(),
      },
      { onConflict: "child_id,mission_id" },
    )

    const reward: MissionReward = {
      id: crypto.randomUUID(),
      mission_id: mission.id,
      xp: mission.xp,
      stars: mission.stars,
      badge: mission.badge,
      item: null,
    }
    try {
      await supabase.from("mission_rewards").insert(reward)
    } catch {
      // récompense déjà seedée ou offline : on ignore
    }

    await supabase.from("learning_statistics").upsert(
      {
        child_id: childId,
        creativity: nextRadar.creativity,
        reading: nextRadar.reading,
        observation: nextRadar.observation,
        logic: nextRadar.logic,
        perseverance: nextRadar.perseverance,
        imagination: nextRadar.imagination,
        total_xp: totalXp,
        time_spent_seconds: stats?.time_spent_seconds ?? 0,
        missions_completed: missionsCompleted,
        regions_unlocked: regionsUnlockedAfter,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "child_id" },
    )

    return {
      mission,
      region,
      xp: mission.xp,
      stars: mission.stars,
      badge: mission.badge,
      radar: nextRadar,
      regionUnlocked: regionsUnlockedAfter > regionsUnlockedBefore,
    }
  }

  /** Enregistre une quête quotidienne/hebdomadaire comme terminée (upsert stats). */
  async completeQuest(type: "daily" | "weekly", questId: string): Promise<{ xp: number; stars: number } | null> {
    const childId = this.childId
    if (!childId) return null
    const quest = type === "daily"
      ? DAILY_MISSIONS.find((d) => d.id === questId)
      : WEEKLY_MISSIONS.find((w) => w.id === questId)
    if (!quest) return null

    const supabase = getSupabaseClient()
    const stats = await this.loadStatistics(supabase)
    const radar = stats
      ? {
          creativity: stats.creativity,
          reading: stats.reading,
          observation: stats.observation,
          logic: stats.logic,
          perseverance: stats.perseverance,
          imagination: stats.imagination,
        }
      : { creativity: 0, reading: 0, observation: 0, logic: 0, perseverance: 0, imagination: 0 }

    const nextRadar = mapEngine.updateRadar(radar, quest.type)
    await supabase.from("learning_statistics").upsert(
      {
        child_id: childId,
        creativity: nextRadar.creativity,
        reading: nextRadar.reading,
        observation: nextRadar.observation,
        logic: nextRadar.logic,
        perseverance: nextRadar.perseverance,
        imagination: nextRadar.imagination,
        total_xp: (stats?.total_xp ?? 0) + quest.xp,
        time_spent_seconds: stats?.time_spent_seconds ?? 0,
        missions_completed: stats?.missions_completed ?? 0,
        regions_unlocked: stats?.regions_unlocked ?? 1,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "child_id" },
    )

    return { xp: quest.xp, stars: quest.stars }
  }

  /** Met à jour le temps d'apprentissage cumulé. */
  async addLearningTime(seconds: number): Promise<void> {
    const childId = this.childId
    if (!childId || seconds <= 0) return
    const supabase = getSupabaseClient()
    const stats = await this.loadStatistics(supabase)
    await supabase.from("learning_statistics").upsert(
      {
        child_id: childId,
        creativity: stats?.creativity ?? 0,
        reading: stats?.reading ?? 0,
        observation: stats?.observation ?? 0,
        logic: stats?.logic ?? 0,
        perseverance: stats?.perseverance ?? 0,
        imagination: stats?.imagination ?? 0,
        total_xp: stats?.total_xp ?? 0,
        time_spent_seconds: (stats?.time_spent_seconds ?? 0) + seconds,
        missions_completed: stats?.missions_completed ?? 0,
        regions_unlocked: stats?.regions_unlocked ?? 1,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "child_id" },
    )
  }
}

export const mapService = new MapService()

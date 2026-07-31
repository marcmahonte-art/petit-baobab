import type {
  DailyMission,
  MonthlyChallenge,
  WeeklyMission,
  ChildDailyProgress,
  ChildWeeklyProgress,
  Difficulty,
  MissionGenerationResult,
} from "../types"
import {
  DAILY_MISSION_TEMPLATES,
  WEEKLY_MISSION_TEMPLATES,
  MONTHLY_CHALLENGES,
  MAX_DAILY_MISSIONS,
  MAX_WEEKLY_MISSIONS,
} from "../constants"
import { eventBus, emitGameEvent } from "../../gamification/event-bus"
import { challengeEngine } from "../../gamification/challenge-engine"
import { toEngineChallenge, registerMissionInEngine } from "../rewards/rewards-engine"
import type { GameEventType } from "../../gamification/types"

type Supabase = ReturnType<typeof import("@/lib/supabase-client").getSupabaseClient>

function dayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

function weekKey(date = new Date()): string {
  const d = new Date(date)
  const day = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - day)
  return d.toISOString().slice(0, 10)
}

function monthKey(date = new Date()): string {
  return date.toISOString().slice(0, 7)
}

function stablePick<T>(arr: T[], seed: string, count: number): T[] {
  const seeded = arr.map((item, i) => ({ item, h: hash(`${seed}_${i}`) }))
  seeded.sort((a, b) => a.h - b.h)
  return seeded.slice(0, count).map((s) => s.item)
}

function hash(input: string): number {
  let h = 0
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

export function generateDailyMissions(date = new Date()): DailyMission[] {
  const seed = dayKey(date)
  const picks = stablePick(DAILY_MISSION_TEMPLATES, seed, MAX_DAILY_MISSIONS)
  return picks.map((t, i) => ({
    ...t,
    id: `daily_${seed}_${i}`,
    created_at: date.toISOString(),
  }))
}

export function generateWeeklyMissions(date = new Date()): WeeklyMission[] {
  const seed = weekKey(date)
  const picks = stablePick(WEEKLY_MISSION_TEMPLATES, seed, MAX_WEEKLY_MISSIONS)
  const start = new Date(seed)
  const end = new Date(start)
  end.setDate(end.getDate() + 7)
  return picks.map((t, i) => ({
    ...t,
    id: `weekly_${seed}_${i}`,
    starts_at: start.toISOString(),
    ends_at: end.toISOString(),
  }))
}

export function generateMonthlyChallenge(date = new Date()): MonthlyChallenge | null {
  const seed = monthKey(date)
  const index = hash(seed) % MONTHLY_CHALLENGES.length
  const template = MONTHLY_CHALLENGES[index]
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 1)
  return {
    ...template,
    id: `monthly_${seed}`,
    starts_at: start.toISOString(),
    ends_at: end.toISOString(),
  }
}

export function generateAllMissions(date = new Date()): MissionGenerationResult {
  return {
    daily: generateDailyMissions(date),
    weekly: generateWeeklyMissions(date),
    monthly: generateMonthlyChallenge(date),
    season: null,
  }
}

export async function syncMissionsToSupabase(supabase: Supabase, childId: string): Promise<MissionGenerationResult> {
  const result = generateAllMissions()
  const now = new Date().toISOString()

  const dailyRows = result.daily.map((m) => ({
    child_id: childId,
    mission_id: m.id,
    title: m.title,
    description: m.description,
    icon: m.icon,
    event: m.event,
    target: m.target,
    reward_xp: m.reward.xp,
    reward_stars: m.reward.stars,
    difficulty: m.difficulty,
    period: "daily" as const,
    active_date: dayKey(),
    created_at: now,
  }))

  const weeklyRows = result.weekly.map((m) => ({
    child_id: childId,
    mission_id: m.id,
    title: m.title,
    description: m.description,
    icon: m.icon,
    event: m.event,
    target: m.target,
    reward_xp: m.reward.xp,
    reward_stars: m.reward.stars,
    difficulty: "medium" as Difficulty,
    period: "weekly" as const,
    active_week: weekKey(),
    starts_at: m.starts_at,
    ends_at: m.ends_at,
    created_at: now,
  }))

  const monthlyRow = result.monthly
    ? {
        child_id: childId,
        mission_id: result.monthly.id,
        title: result.monthly.title,
        description: result.monthly.description,
        icon: result.monthly.icon,
        event: result.monthly.event,
        target: result.monthly.target,
        reward_xp: result.monthly.reward.xp,
        reward_stars: result.monthly.reward.stars,
        difficulty: "hard" as Difficulty,
        period: "monthly" as const,
        active_month: monthKey(),
        starts_at: result.monthly.starts_at,
        ends_at: result.monthly.ends_at,
        created_at: now,
      }
    : null

  try {
    await supabase.from("child_missions").upsert([...dailyRows, ...weeklyRows, ...(monthlyRow ? [monthlyRow] : [])])
  } catch {
    // Offline: missions are generated deterministically, safe to ignore.
  }

  return result
}

export async function ensureMissionsForChild(supabase: Supabase, childId: string): Promise<MissionGenerationResult> {
  const { data } = await supabase
    .from("child_missions")
    .select("mission_id")
    .eq("child_id", childId)
    .in("period", ["daily", "weekly", "monthly"])

  const existingIds = new Set((data ?? []).map((r) => r.mission_id))
  const current = generateAllMissions()
  const needsSync = [...current.daily, ...current.weekly, ...(current.monthly ? [current.monthly] : [])].some(
    (m) => !existingIds.has(m.id),
  )

  if (needsSync) {
    return syncMissionsToSupabase(supabase, childId)
  }
  return current
}

export async function loadChildMissions(
  supabase: Supabase,
  childId: string,
): Promise<{ daily: DailyMission[]; weekly: WeeklyMission[]; monthly: MonthlyChallenge | null }> {
  const { data } = await supabase
    .from("child_missions")
    .select("*")
    .eq("child_id", childId)
    .in("period", ["daily", "weekly", "monthly"])
    .order("created_at", { ascending: true })

  const rows = data ?? []

  const daily = rows
    .filter((r) => r.period === "daily")
    .map((r) => ({
      id: r.mission_id,
      title: r.title,
      description: r.description,
      icon: r.icon,
      event: r.event as GameEventType,
      target: r.target,
      reward: { xp: r.reward_xp, stars: r.reward_stars, item: r.reward_item ?? undefined, badge: r.reward_badge ?? undefined },
      difficulty: r.difficulty as Difficulty,
      is_active: true,
      created_at: r.created_at,
    }))

  const weekly = rows
    .filter((r) => r.period === "weekly")
    .map((r) => ({
      id: r.mission_id,
      title: r.title,
      description: r.description,
      icon: r.icon,
      event: r.event as GameEventType,
      target: r.target,
      reward: { xp: r.reward_xp, stars: r.reward_stars, item: r.reward_item ?? undefined, badge: r.reward_badge ?? undefined },
      starts_at: r.starts_at,
      ends_at: r.ends_at,
    }))

  const monthlyRows = rows.filter((r) => r.period === "monthly")
  const monthly: MonthlyChallenge | null = monthlyRows[0]
    ? {
        id: monthlyRows[0].mission_id,
        title: monthlyRows[0].title,
        description: monthlyRows[0].description,
        icon: monthlyRows[0].icon,
        event: monthlyRows[0].event as GameEventType,
        target: monthlyRows[0].target,
        reward: {
          xp: monthlyRows[0].reward_xp,
          stars: monthlyRows[0].reward_stars,
          item: monthlyRows[0].reward_item ?? undefined,
          badge: monthlyRows[0].reward_badge ?? undefined,
        },
        starts_at: monthlyRows[0].starts_at,
        ends_at: monthlyRows[0].ends_at,
      }
    : null

  return { daily, weekly, monthly }
}

export async function loadChildDailyProgress(supabase: Supabase, childId: string): Promise<Record<string, ChildDailyProgress>> {
  const { data } = await supabase
    .from("child_daily_progress")
    .select("*")
    .eq("child_id", childId)
    .eq("progress_date", dayKey())

  const map: Record<string, ChildDailyProgress> = {}
  for (const row of data ?? []) {
    map[row.mission_id] = row as ChildDailyProgress
  }
  return map
}

export async function loadChildWeeklyProgress(supabase: Supabase, childId: string): Promise<Record<string, ChildWeeklyProgress>> {
  const { data } = await supabase
    .from("child_weekly_progress")
    .select("*")
    .eq("child_id", childId)
    .eq("active_week", weekKey())

  const map: Record<string, ChildWeeklyProgress> = {}
  for (const row of data ?? []) {
    map[row.mission_id] = row as ChildWeeklyProgress
  }
  return map
}

export async function registerMissionsInEngine(missionResult: MissionGenerationResult): Promise<void> {
  for (const m of missionResult.daily) {
    registerMissionInEngine(
      toEngineChallenge(m.id, m.title, m.description, m.event, m.target, m.reward, endOfDay().toISOString()),
    )
  }
  for (const m of missionResult.weekly) {
    registerMissionInEngine(toEngineChallenge(m.id, m.title, m.description, m.event, m.target, m.reward, m.ends_at))
  }
  if (missionResult.monthly) {
    const m = missionResult.monthly
    registerMissionInEngine(toEngineChallenge(m.id, m.title, m.description, m.event, m.target, m.reward, m.ends_at))
  }
}

function endOfDay(date = new Date()): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

export async function listenToMissionEvents(
  childId: string,
  missionIds: string[],
  onProgress: (missionId: string, progress: number, completed: boolean) => void,
): Promise<() => void> {
  const completedMap = new Map<string, boolean>()
  return eventBus.onAny((payload) => {
    if (payload.childId !== childId) return
    const event = payload.type as GameEventType
    const count = challengeEngine.getProgress(childId, event)
    for (const missionId of missionIds) {
      const challenge = challengeEngine.getById(missionId)
      if (challenge && challenge.requirement.event === event) {
        const completed = challenge.completed
        const wasCompleted = completedMap.get(missionId) ?? false
        if (completed && !wasCompleted) {
          void emitGameEvent("CHALLENGE_COMPLETED", {
            childId,
            metadata: { missionId, event },
          })
        }
        completedMap.set(missionId, completed)
        onProgress(missionId, count, completed)
      }
    }
  })
}

export { dayKey, weekKey, monthKey }

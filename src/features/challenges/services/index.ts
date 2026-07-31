import { getSupabaseClient } from "@/lib/supabase-client"
import type { MissionGenerationResult, DailyMission, WeeklyMission, MonthlyChallenge, SeasonEvent, XpMultiplier } from "../types"
import { ensureMissionsForChild, loadChildMissions, loadChildDailyProgress, loadChildWeeklyProgress } from "./mission-service"
import { getSeasonForDate, buildSeasonRewards } from "./season-service"
import { getActiveMultipliers } from "./multiplier-service"
import { loadCalendarState } from "./calendar-service"
import { loadBattlePassState, createBattlePassState } from "./battle-pass-service"
import { currentSnapshot } from "./scheduler-service"

export interface ChallengeEngineState {
  childId: string
  missions: MissionGenerationResult
  daily: DailyMission[]
  weekly: WeeklyMission[]
  monthly: MonthlyChallenge | null
  season: SeasonEvent
  multipliers: XpMultiplier[]
  calendar: Awaited<ReturnType<typeof loadCalendarState>>
  battlePass: Awaited<ReturnType<typeof loadBattlePassState>> | null
  dailyProgress: Record<string, number>
  weeklyProgress: Record<string, number>
}

export class ChallengesService {
  private childId: string | null = null
  private plan: string = "free"
  private store: {
    set: (partial: Partial<ChallengeEngineState>) => void
    setProgress: (period: "daily" | "weekly", missionId: string, progress: number, completed: boolean) => void
  } | null = null

  async init(childId: string, plan: string = "free", store: ChallengesService["store"]): Promise<ChallengeEngineState | null> {
    this.childId = childId
    this.plan = plan
    this.store = store

    const supabase = getSupabaseClient()
    await ensureMissionsForChild(supabase, childId)
    const missions = await loadChildMissions(supabase, childId)
    const season = getSeasonForDate()
    const multipliers = getActiveMultipliers()
    const calendar = await loadCalendarState(supabase, childId)
    let battlePass = await loadBattlePassState(supabase, childId, season.id)
    if (!battlePass) {
      battlePass = await createBattlePassState(supabase, childId, season.id)
    }

    const [dailyProgress, weeklyProgress] = await Promise.all([
      loadChildDailyProgress(supabase, childId),
      loadChildWeeklyProgress(supabase, childId),
    ])

    const state: ChallengeEngineState = {
      childId,
      missions: { daily: missions.daily, weekly: missions.weekly, monthly: missions.monthly, season },
      daily: missions.daily,
      weekly: missions.weekly,
      monthly: missions.monthly,
      season,
      multipliers: multipliers.eventMultipliers,
      calendar,
      battlePass,
      dailyProgress: Object.fromEntries(
        Object.entries(dailyProgress).map(([k, v]) => [k, v.progress]),
      ),
      weeklyProgress: Object.fromEntries(
        Object.entries(weeklyProgress).map(([k, v]) => [k, v.progress]),
      ),
    }

    store!.set({
      childId,
      missions: state.missions,
      daily: state.daily,
      weekly: state.weekly,
      monthly: state.monthly,
      season: state.season,
      multipliers: state.multipliers,
      calendar: state.calendar,
      battlePass: state.battlePass,
      dailyProgress: state.dailyProgress,
      weeklyProgress: state.weeklyProgress,
    })

    buildSeasonRewards(season.id)
    return state
  }

  refresh(): void {
    if (!this.childId) return
    const season = getSeasonForDate()
    const multipliers = getActiveMultipliers()
    this.store?.set({
      season,
      multipliers: multipliers.eventMultipliers,
    })
  }

  handleMissionEvent(period: "daily" | "weekly", missionId: string, progress: number, completed: boolean): void {
    this.store?.setProgress(period, missionId, progress, completed)
  }
}

export const challengesService = new ChallengesService()

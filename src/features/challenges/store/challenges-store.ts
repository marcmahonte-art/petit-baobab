import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { DailyMission, WeeklyMission, MonthlyChallenge, SeasonEvent, XpMultiplier } from "../types"

interface CalendarStateShape {
  claimedDays: number[]
  chests: Array<{ id: string; chest_id: string; day: number; claimed: boolean; claimed_at: string | null }>
  currentDay: number
  lastClaimAt: string | null
}

interface BattlePassStateShape {
  id: string
  child_id: string
  season_id: string
  level: number
  xp: number
  premium: boolean
  claimedFree: string[]
  claimedPremium: string[]
}

interface ChallengesState {
  childId: string | null
  daily: DailyMission[]
  weekly: WeeklyMission[]
  monthly: MonthlyChallenge | null
  season: SeasonEvent | null
  multipliers: XpMultiplier[]
  dailyProgress: Record<string, number>
  weeklyProgress: Record<string, number>
  calendar: CalendarStateShape | null
  battlePass: BattlePassStateShape | null
  loading: boolean
  initialized: boolean
}

interface ChallengesActions {
  set: (partial: Partial<ChallengesState>) => void
  setProgress: (period: "daily" | "weekly", missionId: string, progress: number, completed: boolean) => void
  claimChest: (day: number) => void
  setBattlePass: (battlePass: BattlePassStateShape) => void
  reset: () => void
}

const initialState: ChallengesState = {
  childId: null,
  daily: [],
  weekly: [],
  monthly: null,
  season: null,
  multipliers: [],
  dailyProgress: {},
  weeklyProgress: {},
  calendar: null,
  battlePass: null,
  loading: false,
  initialized: false,
}

export const useChallengesStore = create<ChallengesState & ChallengesActions>()(
  persist(
    (set) => ({
      ...initialState,

      set: (partial) => set(partial),

      setProgress: (period, missionId, progress, completed) => {
        const key = period === "daily" ? "dailyProgress" : "weeklyProgress"
        set((state) => ({
          [key]: { ...state[key], [missionId]: progress },
          ...(completed ? { ...(period === "daily" ? { daily: state.daily.map((m) => (m.id === missionId ? { ...m } : m)) } : { weekly: state.weekly.map((m) => (m.id === missionId ? { ...m } : m)) }) } : {}),
        }))
      },

      claimChest: (day) => {
        set((state) => {
          const claimedDays = state.calendar?.claimedDays.includes(day) ? state.calendar.claimedDays : [...(state.calendar?.claimedDays ?? []), day]
          return {
            calendar: state.calendar ? { ...state.calendar, claimedDays } : state.calendar,
          }
        })
      },

      setBattlePass: (battlePass) => set({ battlePass }),

      reset: () => set(initialState),
    }),
    {
      name: "petit-baobab-challenges-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        childId: state.childId,
        daily: state.daily,
        weekly: state.weekly,
        monthly: state.monthly,
        season: state.season,
        multipliers: state.multipliers,
        dailyProgress: state.dailyProgress,
        weeklyProgress: state.weeklyProgress,
        calendar: state.calendar,
        battlePass: state.battlePass,
      }),
    },
  ),
)

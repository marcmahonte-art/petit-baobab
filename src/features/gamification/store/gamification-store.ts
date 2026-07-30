import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { ProfileState, PlanType, Badge, Notification } from "../types"
import { DAILY_REWARDS } from "../constants"
import { engine } from "../engine"
import { badgeEngine } from "../badge-engine"
import { notificationEngine } from "../notification-engine"

interface DailyRewardState {
  day: number
  claimed: boolean
}

interface GamificationStoreState {
  profile: ProfileState | null
  badges: Badge[]
  notifications: Notification[]
  dailyRewards: DailyRewardState[]
  initialized: boolean
}

interface GamificationStoreActions {
  initialize: (childId: string, data: { name?: string; mascot?: string; plan?: PlanType }) => void
  refresh: (childId: string) => void
  getProfile: () => ProfileState | null
}

type GamificationStore = GamificationStoreState & GamificationStoreActions

export const useGamificationStore = create<GamificationStore>()(
  persist(
    (set, get) => ({
      profile: null,
      badges: [],
      notifications: [],
      dailyRewards: Array.from({ length: 7 }, (_, i) => ({
        day: i + 1,
        claimed: false,
      })),
      initialized: false,

      initialize: (childId, data) => {
        const existing = get().profile
        if (existing && existing.childId === childId && get().initialized) return

        const profile: ProfileState = {
          childId,
          xp: existing?.xp ?? 0,
          totalXpEarned: existing?.totalXpEarned ?? 0,
          level: existing?.level ?? 1,
          starsBalance: existing?.starsBalance ?? 0,
          badges: existing?.badges ?? [],
          currentStreak: existing?.currentStreak ?? 0,
          longestStreak: existing?.longestStreak ?? 0,
          lastActivityDate: existing?.lastActivityDate ?? null,
        }

        engine.register({ ...profile, plan: data.plan ?? "free" })

        const badges = profile.badges.map((id) => badgeEngine.getById(id)).filter(Boolean) as Badge[]

        set({ profile, badges, initialized: true })
      },

      refresh: (childId: string) => {
        const ep = engine.getProfile(childId)
        if (!ep) return

        set({
          profile: {
            childId: ep.childId,
            xp: ep.xp,
            totalXpEarned: ep.totalXpEarned,
            level: ep.level,
            starsBalance: ep.starsBalance,
            badges: ep.badges,
            currentStreak: ep.currentStreak,
            longestStreak: ep.longestStreak,
            lastActivityDate: ep.lastActivityDate,
          },
          badges: ep.badges.map((id) => badgeEngine.getById(id)).filter(Boolean) as Badge[],
          notifications: notificationEngine.get(childId),
        })
      },

      getProfile: () => {
        return get().profile
      },
    }),
    {
      name: "petit-baobab-gamification-v2",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        profile: state.profile,
        badges: state.badges,
        dailyRewards: state.dailyRewards,
        notifications: state.notifications,
      }),
    },
  ),
)

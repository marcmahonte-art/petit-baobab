import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type {
  ChildMissionProgress,
  DailyMission,
  LearningMission,
  LearningRegion,
  LearningStatistics,
  SkillRadar,
  WeeklyMission,
} from "../types"

export interface MissionRewardGrant {
  xp: number
  stars: number
  badge: string | null
}

interface LearningMapState {
  childId: string | null
  regions: LearningRegion[]
  missions: LearningMission[]
  missionProgress: ChildMissionProgress[]
  dailies: DailyMission[]
  weeklies: WeeklyMission[]
  statistics: LearningStatistics | null
  radar: SkillRadar
  totalXp: number
  lastReward: MissionRewardGrant | null
  showReward: boolean
  regionJustUnlocked: boolean
  loading: boolean
  initialized: boolean
}

interface LearningMapActions {
  set: (partial: Partial<LearningMapState>) => void
  setChildId: (childId: string) => void
  setRegions: (regions: LearningRegion[]) => void
  setMissions: (missions: LearningMission[]) => void
  setMissionProgress: (rows: ChildMissionProgress[]) => void
  setDailies: (dailies: DailyMission[]) => void
  setWeeklies: (weeklies: WeeklyMission[]) => void
  setStatistics: (stats: LearningStatistics | null) => void
  setRadar: (radar: SkillRadar) => void
  openReward: (grant: MissionRewardGrant, regionUnlocked: boolean) => void
  closeReward: () => void
  reset: () => void
}

const EMPTY_RADAR: SkillRadar = {
  creativity: 0,
  reading: 0,
  observation: 0,
  logic: 0,
  perseverance: 0,
  imagination: 0,
}

const initialState: LearningMapState = {
  childId: null,
  regions: [],
  missions: [],
  missionProgress: [],
  dailies: [],
  weeklies: [],
  statistics: null,
  radar: EMPTY_RADAR,
  totalXp: 0,
  lastReward: null,
  showReward: false,
  regionJustUnlocked: false,
  loading: false,
  initialized: false,
}

export const useLearningMapStore = create<LearningMapState & LearningMapActions>()(
  persist(
    (set) => ({
      ...initialState,

      set: (partial) => set(partial),

      setChildId: (childId) => set({ childId }),

      setRegions: (regions) => set({ regions }),

      setMissions: (missions) => set({ missions }),

      setMissionProgress: (missionProgress) => set({ missionProgress }),

      setDailies: (dailies) => set({ dailies }),

      setWeeklies: (weeklies) => set({ weeklies }),

      setStatistics: (statistics) =>
        set((state) => ({
          statistics,
          radar: statistics
            ? {
                creativity: statistics.creativity,
                reading: statistics.reading,
                observation: statistics.observation,
                logic: statistics.logic,
                perseverance: statistics.perseverance,
                imagination: statistics.imagination,
              }
            : state.radar,
          totalXp: statistics?.total_xp ?? state.totalXp,
        })),

      setRadar: (radar) => set({ radar }),

      openReward: (lastReward, regionJustUnlocked) =>
        set({ lastReward, regionJustUnlocked, showReward: true }),

      closeReward: () => set({ showReward: false, lastReward: null, regionJustUnlocked: false }),

      reset: () => set({ ...initialState }),
    }),
    {
      name: "petit-baobab-learning-map-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        childId: state.childId,
        regions: state.regions,
        missions: state.missions,
        missionProgress: state.missionProgress,
        dailies: state.dailies,
        weeklies: state.weeklies,
        statistics: state.statistics,
        radar: state.radar,
        totalXp: state.totalXp,
      }),
    },
  ),
)

import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type {
  ChildLearningProgress,
  LearningCertificate,
  LearningPath,
} from "../types"

export interface LearningRewardGrant {
  xp: number
  stars: number
  badges: string[]
  stickers: string[]
}

interface LearningState {
  childId: string | null
  paths: LearningPath[]
  progress: Record<string, ChildLearningProgress[]>
  certificates: LearningCertificate[]
  earnedXp: number
  earnedStars: number
  learningSeconds: number
  lastReward: LearningRewardGrant | null
  showReward: boolean
  completedPath: LearningPath | null
  showCompleted: boolean
  loading: boolean
  initialized: boolean
}

interface LearningActions {
  set: (partial: Partial<LearningState>) => void
  setProgress: (pathId: string, rows: ChildLearningProgress[]) => void
  addReward: (grant: LearningRewardGrant) => void
  addLearningTime: (seconds: number) => void
  openReward: (grant: LearningRewardGrant) => void
  closeReward: () => void
  openPathCompleted: (path: LearningPath) => void
  closePathCompleted: () => void
  addCertificate: (certificate: LearningCertificate) => void
  reset: () => void
}

const initialState: LearningState = {
  childId: null,
  paths: [],
  progress: {},
  certificates: [],
  earnedXp: 0,
  earnedStars: 0,
  learningSeconds: 0,
  lastReward: null,
  showReward: false,
  completedPath: null,
  showCompleted: false,
  loading: false,
  initialized: false,
}

export const useLearningStore = create<LearningState & LearningActions>()(
  persist(
    (set) => ({
      ...initialState,

      set: (partial) => set(partial),

      setProgress: (pathId, rows) =>
        set((state) => ({
          progress: { ...state.progress, [pathId]: rows },
        })),

      addReward: (grant) =>
        set((state) => ({
          earnedXp: state.earnedXp + grant.xp,
          earnedStars: state.earnedStars + grant.stars,
        })),

      addLearningTime: (seconds) =>
        set((state) => ({
          learningSeconds: state.learningSeconds + seconds,
        })),

      openReward: (grant) => set({ lastReward: grant, showReward: true }),
      closeReward: () => set({ showReward: false, lastReward: null }),

      openPathCompleted: (path) => set({ completedPath: path, showCompleted: true }),
      closePathCompleted: () => set({ showCompleted: false, completedPath: null }),

      addCertificate: (certificate) =>
        set((state) => ({
          certificates: state.certificates.some((c) => c.path_id === certificate.path_id)
            ? state.certificates.map((c) => (c.path_id === certificate.path_id ? certificate : c))
            : [...state.certificates, certificate],
        })),

      reset: () => set({ ...initialState }),
    }),
    {
      name: "petit-baobab-learning-paths-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        childId: state.childId,
        progress: state.progress,
        certificates: state.certificates,
        earnedXp: state.earnedXp,
        earnedStars: state.earnedStars,
        learningSeconds: state.learningSeconds,
      }),
    },
  ),
)

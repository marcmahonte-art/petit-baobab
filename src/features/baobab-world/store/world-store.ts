import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { ChildWorld, WorldHistoryEntry, WorldObject, TreeStage } from "../types"

interface WorldStoreState {
  childId: string | null
  world: ChildWorld | null
  treeStage: TreeStage
  objects: WorldObject[]
  history: WorldHistoryEntry[]
  timeOfDay: "morning" | "afternoon" | "evening" | "night"
  capture: string | null
  loading: boolean
  initialized: boolean
  stageUpVisible: boolean
  unlockVisible: boolean
  lastStageUp: { previousLevel: number; newLevel: number; stage: TreeStage } | null
  lastUnlocks: WorldObject[]
}

interface WorldStoreActions {
  set: (partial: Partial<WorldStoreState>) => void
  showStageUp: (previousLevel: number, newLevel: number, stage: TreeStage) => void
  hideStageUp: () => void
  showUnlock: (objects: WorldObject[]) => void
  hideUnlock: () => void
  setTimeOfDay: (time: WorldStoreState["timeOfDay"]) => void
  setCapture: (capture: string | null) => void
  reset: () => void
}

export type WorldStore = WorldStoreState & WorldStoreActions

const initialState: WorldStoreState = {
  childId: null,
  world: null,
  treeStage: "seed",
  objects: [],
  history: [],
  timeOfDay: "afternoon",
  capture: null,
  loading: false,
  initialized: false,
  stageUpVisible: false,
  unlockVisible: false,
  lastStageUp: null,
  lastUnlocks: [],
}

export const useWorldStore = create<WorldStore>()(
  persist(
    (set) => ({
      ...initialState,

      set: (partial) => set(partial),

      showStageUp: (previousLevel, newLevel, stage) =>
        set({ stageUpVisible: true, lastStageUp: { previousLevel, newLevel, stage } }),

      hideStageUp: () => set({ stageUpVisible: false }),

      showUnlock: (objects) => set({ unlockVisible: true, lastUnlocks: objects }),

      hideUnlock: () => set({ unlockVisible: false, lastUnlocks: [] }),

      setTimeOfDay: (time) => set({ timeOfDay: time }),

      setCapture: (capture) => set({ capture }),

      reset: () => set(initialState),
    }),
    {
      name: "petit-baobab-world-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        childId: state.childId,
        world: state.world,
        treeStage: state.treeStage,
        objects: state.objects,
        history: state.history,
        capture: state.capture,
      }),
    },
  ),
)

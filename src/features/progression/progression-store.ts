import { create } from "zustand"
import type { ChildInventory, ChildUnlock, ProgressionState, UnlockReward } from "./progression.types"
import { DEFAULT_THEME, DEFAULT_AVATAR_FRAME } from "./progression.constants"

interface ProgressionStoreState {
  state: ProgressionState
  set: (partial: Partial<ProgressionState>) => void
  showLevelUp: (previousLevel: number, newLevel: number, title: string, unlocks: UnlockReward[]) => void
  hideLevelUp: () => void
  setInventory: (inventory: ChildInventory[]) => void
  setUnlocks: (unlocks: ChildUnlock[]) => void
}

const initialState: ProgressionState = {
  childId: null,
  level: 1,
  xp: 0,
  xpTotal: 0,
  currentTitle: "",
  avatarFrame: DEFAULT_AVATAR_FRAME,
  currentTheme: DEFAULT_THEME,
  unlocks: [],
  inventory: [],
  loading: false,
  levelUpVisible: false,
  lastLevelUp: null,
}

export const useProgressionStore = create<ProgressionStoreState>()((set) => ({
  state: initialState,

  set: (partial) =>
    set((s) => ({ state: { ...s.state, ...partial } })),

  showLevelUp: (previousLevel, newLevel, title, unlocks) =>
    set((s) => ({
      state: {
        ...s.state,
        levelUpVisible: true,
        lastLevelUp: { previousLevel, newLevel, title, unlocks },
      },
    })),

  hideLevelUp: () =>
    set((s) => ({ state: { ...s.state, levelUpVisible: false } })),

  setInventory: (inventory) =>
    set((s) => ({ state: { ...s.state, inventory } })),

  setUnlocks: (unlocks) =>
    set((s) => ({ state: { ...s.state, unlocks } })),
}))

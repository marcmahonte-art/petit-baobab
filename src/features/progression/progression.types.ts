import type { GameEventType } from "../gamification/types"

export type UnlockType = "brush" | "mascot" | "background" | "book" | "palette" | "sticker" | "frame" | "animation" | "pack" | "color"

export type ItemType = "mascot" | "frame" | "brush" | "color" | "sticker" | "badge" | "book" | "animation"

export interface ChildProgression {
  id: string
  child_id: string
  level: number
  xp: number
  xp_total: number
  current_title: string
  avatar_frame: string | null
  current_theme: string | null
  created_at: string
  updated_at: string
}

export interface ChildUnlock {
  id: string
  child_id: string
  unlock_type: UnlockType
  unlock_key: string
  source: string
  created_at: string
}

export interface ChildInventory {
  id: string
  child_id: string
  item_type: ItemType
  item_key: string
  quantity: number
  created_at: string
}

export interface LevelTitle {
  level: number
  title: string
  icon: string
}

export interface LevelInfo {
  level: number
  title: string
  icon: string
  xpRequired: number
  cumulativeXp: number
  rewards: UnlockReward[]
}

export interface UnlockReward {
  type: UnlockType
  key: string
  label: string
  icon: string
  description: string
}

export interface XpResult {
  xp: number
  event: GameEventType
  bonuses: { label: string; xp: number }[]
}

export interface ProgressionResult {
  previousLevel: number
  newLevel: number
  levelUp: boolean
  xp: number
  xpAdded: number
  xpToNextLevel: number
  previousTitle: string | null
  newTitle: string | null
  newUnlocks: UnlockReward[]
  notifications: { title: string; description: string }[]
}

export interface ProgressionState {
  childId: string | null
  level: number
  xp: number
  xpTotal: number
  currentTitle: string
  avatarFrame: string | null
  currentTheme: string | null
  unlocks: ChildUnlock[]
  inventory: ChildInventory[]
  loading: boolean
  levelUpVisible: boolean
  lastLevelUp: { previousLevel: number; newLevel: number; title: string; unlocks: UnlockReward[] } | null
}

import type { GameEventType } from "../../gamification/types"

export type ChallengePeriod = "daily" | "weekly" | "monthly" | "season" | "event"
export type Difficulty = "easy" | "medium" | "hard"

export interface MissionReward {
  xp: number
  stars: number
  item?: string
  badge?: string
}

export interface DailyMission {
  id: string
  title: string
  description: string
  icon: string
  target: number
  event: GameEventType
  reward: MissionReward
  difficulty: Difficulty
  is_active: boolean
  created_at: string
}

export interface ChildDailyProgress {
  id: string
  child_id: string
  mission_id: string
  progress: number
  completed: boolean
  claimed: boolean
  completed_at: string | null
}

export interface WeeklyMission {
  id: string
  title: string
  description: string
  icon: string
  event: GameEventType
  target: number
  reward: MissionReward
  difficulty?: Difficulty
  starts_at: string
  ends_at: string
}

export interface ChildWeeklyProgress {
  id: string
  child_id: string
  mission_id: string
  progress: number
  completed: boolean
  claimed: boolean
}

export interface MonthlyChallenge {
  id: string
  title: string
  description: string
  icon: string
  event: GameEventType
  target: number
  reward: MissionReward
  starts_at: string
  ends_at: string
}

export interface SeasonEvent {
  id: string
  name: string
  slug: string
  theme: string
  starts_at: string
  ends_at: string
  banner: string
  primary_color: string
  secondary_color: string
  missions: SeasonMission[]
  badges: string[]
  is_active: boolean
}

export interface SeasonMission {
  id: string
  title: string
  description: string
  icon: string
  event: GameEventType
  target: number
  reward: MissionReward
}

export interface SeasonReward {
  id: string
  season_id: string
  level: number
  reward_type: string
  reward_key: string
  quantity: number
}

export interface CalendarDay {
  day: number
  status: "available" | "claimed" | "locked" | "missed"
  reward: MissionReward
}

export interface ChestDefinition {
  id: "bronze" | "silver" | "gold" | "diamond" | "legendary"
  name: string
  icon: string
  day: number
  color: string
  contents: ChestContent[]
}

export interface ChestContent {
  type: "xp" | "stars" | "item" | "badge" | "mascot" | "background" | "sticker" | "frame" | "animation" | "pack"
  key?: string
  quantity: number
  label?: string
}

export interface RewardChest {
  id: string
  child_id: string
  chest_id: ChestDefinition["id"]
  day: number
  claimed: boolean
  claimed_at: string | null
}

export interface XpMultiplier {
  id: string
  label: string
  multiplier: number
  xpOnly?: boolean
  starsOnly?: boolean
  appliesTo?: GameEventType[]
  starts_at: string
  ends_at: string
}

export interface BattlePassTier {
  level: number
  xpRequired: number
  freeRewards: BattlePassReward[]
  premiumRewards: BattlePassReward[]
}

export interface BattlePassReward {
  type: "item" | "background" | "sticker" | "book" | "avatar" | "mascot" | "frame" | "stars"
  key: string
  label: string
  quantity: number
  icon?: string
}

export interface BattlePassState {
  id: string
  child_id: string
  season_id: string
  level: number
  xp: number
  premium: boolean
  claimedFree: string[]
  claimedPremium: string[]
}

export interface MissionGenerationResult {
  daily: DailyMission[]
  weekly: WeeklyMission[]
  monthly: MonthlyChallenge | null
  season: SeasonEvent | null
}

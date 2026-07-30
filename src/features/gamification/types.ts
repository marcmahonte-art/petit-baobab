export type GameEventType =
  | "DRAWING_CREATED"
  | "DRAWING_COMPLETED"
  | "BOOK_CREATED"
  | "BOOK_PRINTED"
  | "MAGIC_DRAWING_CREATED"
  | "COLORING_COMPLETED"
  | "GAME_COMPLETED"
  | "QUIZ_COMPLETED"
  | "LOGIN"
  | "DAILY_LOGIN"
  | "STREAK_DAY"
  | "PROFILE_COMPLETED"
  | "FIRST_DOWNLOAD"
  | "SHOP_PURCHASE"
  | "SHOP_REVIEW"
  | "INVITE_PARENT"
  | "INVITE_CHILD"
  | "CLASS_CREATED"
  | "STUDENT_JOINED"
  | "STARS_USED"
  | "STARS_EARNED"
  | "LEVEL_UP"
  | "BADGE_UNLOCKED"

export type Difficulty = "easy" | "medium" | "hard"

export type PlanType = "free" | "decouverte" | "super-baobab" | "ecole-pro"

export type BadgeCategory = "art" | "reading" | "learning" | "creativity" | "streak" | "special" | "seasonal" | "social" | "shop"

export type MascotId = "bobo" | "kaya" | "zuri" | "momo" | "kiki" | "baobab"

export type ActivityType =
  | "coloring"
  | "magic_drawing"
  | "book"
  | "story"
  | "game"
  | "lesson"
  | "quiz"
  | "login"
  | "reading"
  | "shop"
  | "social"
  | "school"

export interface EventPayload {
  childId: string
  metadata?: Record<string, unknown>
  difficulty?: Difficulty
  duration?: number
  plan?: PlanType
}

export interface DrawingEventPayload extends EventPayload {
  drawingId?: string
  style?: string
}

export interface BookEventPayload extends EventPayload {
  bookId?: string
  pages?: number
}

export interface GameEventPayload extends EventPayload {
  gameId?: string
  score?: number
}

export interface QuizEventPayload extends EventPayload {
  quizId?: string
  score?: number
  total?: number
}

export interface ShopEventPayload extends EventPayload {
  productId?: string
  amount?: number
}

export interface StarsEventPayload extends EventPayload {
  amount: number
  reason: string
  transactionId?: string
}

export interface RewardResult {
  xp: number
  stars: number
  newBadges: Badge[]
  levelUp: boolean
  newLevel: number
  newChallenges: ChallengeProgress[]
  notifications: Notification[]
}

export interface Badge {
  id: string
  name: string
  description: string
  iconUrl: string
  category: BadgeCategory
  secret?: boolean
}

export interface Level {
  level: number
  xpRequired: number
  cumulativeXp: number
  rewards: LevelReward[]
}

export interface LevelReward {
  type: "stars" | "badge" | "mascot_evolution"
  value: number | string
}

export interface Streak {
  currentStreak: number
  longestStreak: number
  lastActivityDate: string | null
}

export interface Challenge {
  id: string
  title: string
  description: string
  requirement: ChallengeRequirement
  reward: Reward
  progress: number
  target: number
  completed: boolean
  claimed: boolean
  expiresAt: string | null
}

export interface ChallengeRequirement {
  event: GameEventType
  count: number
  difficulty?: Difficulty
}

export interface ChallengeProgress {
  challengeId: string
  completed: boolean
  reward: Reward
}

export interface Reward {
  xp: number
  stars: number
  badges: string[]
}

export interface Notification {
  id: string
  type: "level_up" | "badge_unlocked" | "challenge" | "streak" | "daily_reward"
  title: string
  description: string
  icon?: string
  read: boolean
  createdAt: string
}

export interface ProfileState {
  childId: string
  xp: number
  totalXpEarned: number
  level: number
  starsBalance: number
  badges: string[]
  currentStreak: number
  longestStreak: number
  lastActivityDate: string | null
}

export interface EngineContext {
  profile: ProfileState
  plan: PlanType
}

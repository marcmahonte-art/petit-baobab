import type { GameEventType } from "../../gamification/types"

export type LessonType =
  | "COLORING"
  | "MAGIC_DRAWING"
  | "BOOK"
  | "GAME"
  | "QUIZ"
  | "STORY"
  | "VIDEO"
  | "CHALLENGE"
  | "MISSION"
  | "COLLECTION"

export type PathDifficulty = "beginner" | "intermediate" | "advanced" | "expert"

export type PathStatus = "locked" | "available" | "in_progress" | "completed"

export type LessonStatus = "locked" | "available" | "in_progress" | "completed"

export type PathTheme =
  | "art"
  | "africa"
  | "alphabet"
  | "numbers"
  | "colors"
  | "animals"
  | "nature"
  | "reading"
  | "creativity"
  | "jobs"
  | "music"
  | "science"
  | "planet"
  | "emotions"
  | "health"
  | "safety"

export interface LearningPathRewards {
  xp: number
  stars: number
  badges: string[]
  stickers: string[]
  items: string[]
}

export interface LearningPathCertificate {
  title: string
  accent: string
  footer: string
}

export interface LearningPath {
  id: string
  slug: string
  title: string
  description: string
  age_min: number
  age_max: number
  difficulty: PathDifficulty
  theme: PathTheme
  cover: string
  icon: string
  estimated_duration: number
  order_index: number
  is_active: boolean
  created_at?: string
  tags: string[]
  colors: { primary: string; secondary: string; accent: string }
  mascot: string
  badge: { id: string; name: string; icon: string }
  certificate: LearningPathCertificate
  rewards: LearningPathRewards
  modules: LearningModule[]
}

export interface LearningModule {
  id: string
  path_id: string
  title: string
  description: string
  order_index: number
  reward_xp: number
  reward_stars: number
  reward_badge: string | null
  lessons: LearningLesson[]
}

export interface LearningLesson {
  id: string
  module_id: string
  title: string
  lesson_type: LessonType
  content_id: string | null
  order_index: number
  reward_xp: number
  reward_stars: number
  description?: string
}

export interface ChildLearningProgress {
  id?: string
  child_id: string
  path_id: string
  module_id: string | null
  lesson_id: string | null
  status: LessonStatus
  progress: number
  completed_at: string | null
}

export interface LearningCertificate {
  id: string
  child_id: string
  path_id: string
  path_title: string
  child_name: string
  mascot: string
  issued_at: string
  token: string
  pdf_url: string | null
}

export interface ModuleProgress {
  module: LearningModule
  status: PathStatus
  completedLessons: number
  totalLessons: number
  progress: number
  completedAt: string | null
}

export interface PathProgress {
  path: LearningPath
  status: PathStatus
  totalLessons: number
  completedLessons: number
  progress: number
  currentModule: LearningModule | null
  nextLesson: LearningLesson | null
  completed: boolean
  completedAt: string | null
  modules: ModuleProgress[]
}

export interface RecommendationContext {
  age?: number
  level?: number
  preferences?: string[]
  activities?: Partial<Record<GameEventType, number>>
  learningMinutes?: number
  completedPathIds?: string[]
}

export interface RecommendationScore {
  path: LearningPath
  score: number
  reasons: string[]
}

export interface CertificatePdfData {
  childName: string
  mascot: string
  pathTitle: string
  pathTheme: PathTheme
  issuedAt: string
  token: string
}

export interface DifficultyDefinition {
  key: PathDifficulty
  label: string
  icon: string
  color: string
  recommendedMinLevel: number
}

export interface LessonTypeDefinition {
  type: LessonType
  label: string
  icon: string
  href: string
  description: string
}

export interface ThemeDefinition {
  theme: PathTheme
  label: string
  icon: string
  primary: string
  secondary: string
  accent: string
}

// ---------------------------------------------------------------------------
// PHASE 9 — Learning Map (le "GPS" de l'enfant)
// ---------------------------------------------------------------------------

export interface LearningRegion {
  id: string
  slug: string
  title: string
  description: string
  icon: string
  color: string
  position_x: number
  position_y: number
  required_xp: number
  order_index: number
  is_active: boolean
  created_at?: string
}

export type MissionType =
  | "COLORING"
  | "MAGIC_DRAWING"
  | "BOOK"
  | "GAME"
  | "QUIZ"
  | "STORY"
  | "VIDEO"
  | "CHALLENGE"
  | "MISSION"
  | "COLLECTION"

export interface LearningMission {
  id: string
  region_id: string
  title: string
  description: string
  level: number
  order_index: number
  xp: number
  stars: number
  badge: string | null
  illustration: string | null
  type: MissionType
  duration: number
  difficulty: PathDifficulty
  prerequisites: string[]
  created_at?: string
}

export interface MissionReward {
  id: string
  mission_id: string
  xp: number
  stars: number
  badge: string | null
  item: string | null
}

export interface ChildMissionProgress {
  id?: string
  child_id: string
  mission_id: string
  status: "locked" | "available" | "in_progress" | "completed"
  progress: number
  started_at: string | null
  completed_at: string | null
  created_at?: string
}

export interface DailyMission {
  id: string
  title: string
  description: string
  type: MissionType
  xp: number
  stars: number
  icon: string
  day_key: string
  is_active: boolean
}

export interface WeeklyMission {
  id: string
  title: string
  description: string
  type: MissionType
  xp: number
  stars: number
  badge: string | null
  icon: string
  week_offset: number
  is_active: boolean
}

export interface SkillRadar {
  creativity: number
  reading: number
  observation: number
  logic: number
  perseverance: number
  imagination: number
}

export interface LearningStatistics {
  child_id: string
  creativity: number
  reading: number
  observation: number
  logic: number
  perseverance: number
  imagination: number
  total_xp: number
  time_spent_seconds: number
  missions_completed: number
  regions_unlocked: number
  updated_at?: string
}

export type RegionStatus = "locked" | "available" | "in_progress" | "completed"

export interface RegionProgress {
  region: LearningRegion
  status: RegionStatus
  missions: MissionProgress[]
  completedMissions: number
  totalMissions: number
  progress: number
  currentMission: LearningMission | null
  nextMission: LearningMission | null
}

export interface MissionProgress {
  mission: LearningMission
  status: ChildMissionProgress["status"]
  progress: number
  completedAt: string | null
}

export interface DailyMissionProgress {
  mission: DailyMission
  status: "locked" | "available" | "completed"
  completed: boolean
}

export interface WeeklyMissionProgress {
  mission: WeeklyMission
  status: "locked" | "available" | "completed"
  completed: boolean
}

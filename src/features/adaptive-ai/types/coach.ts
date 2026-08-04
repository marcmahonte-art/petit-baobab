// ============================================================
// Petit Baobab — Coach IA (Phase 10)
// Types du profil d'apprentissage, recommandations, prédictions,
// statistiques, sessions, dialogue, plans et historique.
// Toutes les interfaces reflètent le schéma Supabase réel
// (supabase/migrations/22_learning_coach.sql).
// ============================================================

export type ActivityType =
  | "COLORING"
  | "MAGIC_DRAWING"
  | "DRAWING"
  | "BOOK"
  | "STORY"
  | "GAME"
  | "QUIZ"
  | "VIDEO"
  | "CHALLENGE"
  | "MISSION"
  | "COLLECTION"

export type RecommendationStatus = "pending" | "accepted" | "ignored" | "completed" | "succeeded"

export type PreferenceCategory = "animals" | "colors" | "styles" | "books" | "topics" | "activities"

/** Profil d'apprentissage IA (learning_profiles). */
export interface LearningProfile {
  id: string
  child_id: string
  preferred_topics: string[]
  preferred_activity: ActivityType
  average_session: number
  favorite_animals: string[]
  favorite_colors: string[]
  favorite_styles: string[]
  favorite_books: string[]
  motivation_score: number
  attention_score: number
  creativity_score: number
  logic_score: number
  reading_score: number
  drawing_score: number
  last_analysis: string | null
  confidence_score: number
  updated_at: string
  created_at?: string
}

/** Préférence détaillée par catégorie (learning_preferences). */
export interface LearningPreference {
  id?: string
  child_id: string
  category: PreferenceCategory
  items: string[]
  weight: number
  updated_at?: string
}

/** Recommandation IA (learning_recommendations). */
export interface LearningRecommendation {
  id: string
  child_id: string
  type: ActivityType
  title: string
  description: string
  reason: string
  priority: number
  duration: number
  reward_xp: number
  reward_stars: number
  resource_type: string | null
  resource_id: string | null
  status: RecommendationStatus
  created_at: string
}

/** Prédiction de progression (learning_predictions). */
export interface LearningPrediction {
  id?: string
  child_id: string
  next_level: number
  next_skill: string
  predicted_xp: number
  predicted_week_xp: number
  estimated_hours_to_next_level: number
  confidence: number
  model: string
  created_at?: string
}

/** Statistiques + radar 9 axes (learning_statistics). */
export interface CoachStatistics {
  child_id: string
  creativity: number
  reading: number
  observation: number
  logic: number
  perseverance: number
  imagination: number
  concentration: number
  communication: number
  motor_skills: number
  total_xp: number
  time_spent_seconds: number
  missions_completed: number
  regions_unlocked: number
  updated_at?: string
  created_at?: string
}

/** Radar pédagogique 8 axes affiché dans l'UI. */
export interface CoachRadar {
  reading: number
  creativity: number
  concentration: number
  logic: number
  observation: number
  imagination: number
  communication: number
  motor_skills: number
}

/** Force détectée (learning_strengths). */
export interface LearningStrength {
  id?: string
  child_id: string
  skill: string
  score: number
  evidence: string
  detected_at?: string
}

/** Point de vigilance (learning_weaknesses). */
export interface LearningWeakness {
  id?: string
  child_id: string
  skill: string
  score: number
  suggestion: string
  detected_at?: string
}

/** Session d'apprentissage (learning_sessions). */
export interface LearningSession {
  id?: string
  child_id: string
  activity_type: ActivityType
  duration_seconds: number
  xp_earned: number
  stars_earned: number
  started_at: string
  ended_at?: string | null
}

/** Message du dialogue avec le coach (coach_messages). */
export interface CoachMessage {
  id?: string
  child_id: string
  role: "child" | "coach"
  content: string
  intent: string
  filtered: boolean
  created_at?: string
}

/** Entrée d'historique IA (coach_history). */
export interface CoachHistoryItem {
  id?: string
  child_id: string
  action: string
  title: string
  detail: string
  status: string
  created_at?: string
}

/** Plan journalier (daily_learning_plan). */
export interface DailyLearningPlan {
  id?: string
  child_id: string
  plan_date: string
  activities: string[]
  completed_activities: string[]
  generated_at?: string
}

/** Plan hebdomadaire (weekly_learning_plan). */
export interface WeeklyLearningPlan {
  id?: string
  child_id: string
  week_start: string
  goals: string[]
  activities: string[]
  completed_goals: string[]
  generated_at?: string
}

/** Rapport mensuel (monthly_learning_report). */
export interface MonthlyLearningReport {
  id?: string
  child_id: string
  report_month: string
  summary: string
  progress_delta: Record<string, number>
  strengths: string[]
  recommendations: string[]
  generated_at?: string
}

/** Amélioration calculée depuis les données réelles (Section 6). */
export interface SkillImprovement {
  skill: string
  label: string
  current: number
  previous: number
  delta: number
  icon: string
}

/** Programme personnalisé (Section 5). */
export interface CoachProgram {
  daily: {
    date: string
    activities: string[]
    completed: string[]
  }
  tomorrow: {
    date: string
    activities: string[]
  }
  weekly: {
    week_start: string
    activities: string[]
    goals: string[]
    completed: string[]
  }
}

/** Analyse IA complète renvoyée par /api/coach/analyze. */
export interface CoachAnalysis {
  childId: string
  summary: string
  strengths: LearningStrength[]
  weaknesses: LearningWeakness[]
  recommendations: LearningRecommendation[]
  greeting: string
  advice: string[]
}

/** Snapshot chargé par le store (toutes les données du coach). */
export interface CoachSnapshot {
  profile: LearningProfile | null
  preferences: LearningPreference[]
  statistics: CoachStatistics | null
  radar: CoachRadar
  recommendations: LearningRecommendation[]
  predictions: LearningPrediction | null
  strengths: LearningStrength[]
  weaknesses: LearningWeakness[]
  history: CoachHistoryItem[]
  messages: CoachMessage[]
  program: CoachProgram | null
  report: MonthlyLearningReport | null
}

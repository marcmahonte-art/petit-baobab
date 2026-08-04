// ============================================================
// Petit Baobab — Coach IA (Phase 10)
// Accès données côté serveur pour les routes /api/coach/*.
// Utilise le client admin (service role) APRÈS vérification
// d'accès explicite par child_id (voir coach-auth.ts).
// Toutes les écritures reflètent les vraies tables Supabase.
// ============================================================

import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { generateParentReport } from "@/lib/ai/learning-coach"
import type {
  ActivityType,
  CoachHistoryItem,
  CoachProgram,
  CoachStatistics,
  DailyLearningPlan,
  LearningPrediction,
  LearningPreference,
  LearningProfile,
  LearningRecommendation,
  LearningSession,
  MonthlyLearningReport,
  RecommendationStatus,
  WeeklyLearningPlan,
} from "../types/coach"
import {
  DEFAULT_PREFERRED_ACTIVITY,
  DEFAULT_PROFILE_SCORES,
} from "../constants/coach-constants"
import {
  activityFromEvent,
  activityLabel,
  applyActivityToProfile,
  applyActivityToStatistics,
  buildAdvice,
  buildAnalysis,
  buildDailyActivities,
  buildPrediction,
  buildProgram,
  buildSession,
  buildStrengthsWeaknesses,
  buildWeeklyPlan,
  computeRadar,
  getGreeting,
  toISODate,
  weekStartISO,
  type RecommendationSeed,
} from "../engine/coach-engine"
import type { ActivityRecordInput } from "../services/coach-service"

type Supabase = ReturnType<typeof getSupabaseAdmin>

export function normalizeStatistics(row: Partial<CoachStatistics> | null | undefined): CoachStatistics | null {
  if (!row) return null
  const num = (v: unknown, def = 0) => (typeof v === "number" && Number.isFinite(v) ? v : def)
  return {
    child_id: row.child_id ?? "",
    creativity: num(row.creativity),
    reading: num(row.reading),
    observation: num(row.observation),
    logic: num(row.logic),
    perseverance: num(row.perseverance),
    imagination: num(row.imagination),
    concentration: num(row.concentration),
    communication: num(row.communication),
    motor_skills: num(row.motor_skills),
    total_xp: num(row.total_xp),
    time_spent_seconds: num(row.time_spent_seconds),
    missions_completed: num(row.missions_completed),
    regions_unlocked: num(row.regions_unlocked),
    updated_at: row.updated_at,
  }
}

export function normalizeProfile(row: Partial<LearningProfile> | null | undefined): LearningProfile | null {
  if (!row || !row.child_id) return null
  const num = (v: unknown, def = 50) => (typeof v === "number" && Number.isFinite(v) ? v : def)
  const arr = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [])
  return {
    id: row.id ?? "",
    child_id: row.child_id,
    preferred_topics: arr(row.preferred_topics),
    preferred_activity: (row.preferred_activity as ActivityType) ?? DEFAULT_PREFERRED_ACTIVITY,
    average_session: num(row.average_session, 0),
    favorite_animals: arr(row.favorite_animals),
    favorite_colors: arr(row.favorite_colors),
    favorite_styles: arr(row.favorite_styles),
    favorite_books: arr(row.favorite_books),
    motivation_score: num(row.motivation_score, DEFAULT_PROFILE_SCORES.motivation_score),
    attention_score: num(row.attention_score, DEFAULT_PROFILE_SCORES.attention_score),
    creativity_score: num(row.creativity_score, DEFAULT_PROFILE_SCORES.creativity_score),
    logic_score: num(row.logic_score, DEFAULT_PROFILE_SCORES.logic_score),
    reading_score: num(row.reading_score, DEFAULT_PROFILE_SCORES.reading_score),
    drawing_score: num(row.drawing_score, DEFAULT_PROFILE_SCORES.drawing_score),
    confidence_score: num(row.confidence_score, DEFAULT_PROFILE_SCORES.confidence_score),
    last_analysis: row.last_analysis ?? null,
    updated_at: row.updated_at ?? new Date().toISOString(),
    created_at: row.created_at,
  }
}

/** Crée le profil IA + statistiques par défaut si absents (idempotent). */
export async function seedProfile(supabase: Supabase, childId: string): Promise<LearningProfile> {
  const { data: existing } = await supabase
    .from("learning_profiles")
    .select("*")
    .eq("child_id", childId)
    .maybeSingle()

  if (existing) return normalizeProfile(existing) as LearningProfile

  const now = new Date().toISOString()
  const { data, error } = await supabase
    .from("learning_profiles")
    .insert({
      child_id: childId,
      preferred_topics: [],
      preferred_activity: DEFAULT_PREFERRED_ACTIVITY,
      average_session: 0,
      favorite_animals: [],
      favorite_colors: [],
      favorite_styles: [],
      favorite_books: [],
      motivation_score: DEFAULT_PROFILE_SCORES.motivation_score,
      attention_score: DEFAULT_PROFILE_SCORES.attention_score,
      creativity_score: DEFAULT_PROFILE_SCORES.creativity_score,
      logic_score: DEFAULT_PROFILE_SCORES.logic_score,
      reading_score: DEFAULT_PROFILE_SCORES.reading_score,
      drawing_score: DEFAULT_PROFILE_SCORES.drawing_score,
      confidence_score: DEFAULT_PROFILE_SCORES.confidence_score,
      last_analysis: null,
      updated_at: now,
    })
    .select("*")
    .single()

  if (error || !data) {
    return normalizeProfile(existing) as LearningProfile
  }

  // Statistiques par défaut (radar vide).
  await supabase.from("learning_statistics").upsert(
    {
      child_id: childId,
      creativity: 0,
      reading: 0,
      observation: 0,
      logic: 0,
      perseverance: 0,
      imagination: 0,
      concentration: 0,
      communication: 0,
      motor_skills: 0,
      total_xp: 0,
      time_spent_seconds: 0,
      missions_completed: 0,
      regions_unlocked: 1,
      updated_at: now,
    },
    { onConflict: "child_id" },
  )

  return normalizeProfile(data) as LearningProfile
}

async function loadStatistics(supabase: Supabase, childId: string): Promise<CoachStatistics | null> {
  const { data } = await supabase
    .from("learning_statistics")
    .select("*")
    .eq("child_id", childId)
    .maybeSingle()
  return normalizeStatistics(data as Partial<CoachStatistics> | null)
}

async function loadSessions(supabase: Supabase, childId: string): Promise<LearningSession[]> {
  const { data } = await supabase
    .from("learning_sessions")
    .select("*")
    .eq("child_id", childId)
    .order("started_at", { ascending: false })
    .limit(200)
  return (data ?? []) as LearningSession[]
}

export async function loadProfileBundle(supabase: Supabase, childId: string) {
  const profile = await seedProfile(supabase, childId)
  const statistics = await loadStatistics(supabase, childId)
  const radar = computeRadar(statistics, profile)
  const { strengths, weaknesses } = buildStrengthsWeaknesses(profile, statistics)
  const sessions = await loadSessions(supabase, childId)

  const { data: childRow } = await supabase
    .from("child_profiles")
    .select("name")
    .eq("id", childId)
    .maybeSingle()
  const childName = childRow?.name ?? ""

  const { data: prefs } = await supabase
    .from("learning_preferences")
    .select("*")
    .eq("child_id", childId)
  const preferences = (prefs ?? []) as LearningPreference[]

  const predictions = await loadPredictions(supabase, childId)
  const greeting = getGreeting(childName, profile, statistics)

  return {
    profile,
    preferences,
    statistics,
    radar,
    predictions,
    strengths,
    weaknesses,
    greeting: greeting.message,
    encouragement: greeting.encouragement,
    sessions,
  }
}

export async function loadPredictions(
  supabase: Supabase,
  childId: string,
): Promise<LearningPrediction | null> {
  const { data } = await supabase
    .from("learning_predictions")
    .select("*")
    .eq("child_id", childId)
    .maybeSingle()
  return (data as LearningPrediction | null) ?? null
}

export async function upsertPredictions(
  supabase: Supabase,
  childId: string,
): Promise<LearningPrediction> {
  const profile = await seedProfile(supabase, childId)
  const statistics = await loadStatistics(supabase, childId)
  const sessions = await loadSessions(supabase, childId)

  // Niveau / XP réels depuis la progression RPG.
  const { data: prog } = await supabase
    .from("child_progression")
    .select("level, xp, xp_total")
    .eq("child_id", childId)
    .maybeSingle()
  const level = prog?.level ?? 1
  const totalXp = prog?.xp_total ?? statistics?.total_xp ?? 0
  const nextXp = 150 * Math.max(1, level)

  const values = buildPrediction(profile, statistics, sessions, level, totalXp, nextXp)
  const payload: LearningPrediction = {
    child_id: childId,
    next_level: values.next_level,
    next_skill: values.next_skill,
    predicted_xp: values.predicted_xp,
    predicted_week_xp: values.predicted_week_xp,
    estimated_hours_to_next_level: values.estimated_hours_to_next_level,
    confidence: values.confidence,
    model: "rule-based",
  }

  const { data } = await supabase
    .from("learning_predictions")
    .upsert(payload, { onConflict: "child_id" })
    .select("*")
    .single()
  return (data as LearningPrediction) ?? payload
}

// ---------------------------------------------------------------------------
// Automatisation : mise à jour après une activité réelle
// ---------------------------------------------------------------------------

export interface AutomationResult {
  applied: boolean
  activity: ActivityType | null
  session: LearningSession | null
  updatedProfile: Partial<LearningProfile> | null
}

export async function applyAutomation(
  supabase: Supabase,
  childId: string,
  input: ActivityRecordInput,
): Promise<AutomationResult> {
  const activity = activityFromEvent(input.event)
  if (!activity) return { applied: false, activity: null, session: null, updatedProfile: null }

  const profile = await seedProfile(supabase, childId)
  const statistics = await loadStatistics(supabase, childId)

  const session = buildSession(childId, activity, {
    duration: input.duration,
    xp: input.xp,
    stars: input.stars,
  })
  await supabase.from("learning_sessions").insert({
    child_id: childId,
    activity_type: activity,
    duration_seconds: session.duration_seconds,
    xp_earned: session.xp_earned,
    stars_earned: session.stars_earned,
    started_at: session.started_at,
    ended_at: session.ended_at,
  })

  const profilePatch = applyActivityToProfile(profile, activity, {
    style: input.style,
    colors: input.colors,
    bookTitle: input.bookTitle,
  })

  const nextStats = applyActivityToStatistics(statistics, activity, {
    xp: input.xp,
    seconds: session.duration_seconds,
  })

  // Temps moyen réel.
  const { data: avgRow } = await supabase
    .from("learning_sessions")
    .select("duration_seconds")
    .eq("child_id", childId)
  const rows = (avgRow ?? []) as { duration_seconds: number }[]
  const averageSession = rows.length
    ? Math.round(rows.reduce((s, r) => s + r.duration_seconds, 0) / rows.length / 60)
    : session.duration_seconds / 60

  await supabase
    .from("learning_profiles")
    .update({
      ...profilePatch,
      average_session: averageSession,
      preferred_activity: activity,
      updated_at: new Date().toISOString(),
    })
    .eq("child_id", childId)

  await supabase.from("learning_statistics").upsert(
    {
      ...nextStats,
      child_id: childId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "child_id" },
  )

  await supabase.from("coach_history").insert({
    child_id: childId,
    action: "activity",
    title: `${activityLabel(activity)} terminé`,
    detail: `Ton coach a observé une activité ${activityLabel(activity)} et a adapté ton profil.`,
    status: "done",
  })

  return { applied: true, activity, session, updatedProfile: profilePatch }
}

// ---------------------------------------------------------------------------
// Analyse complète
// ---------------------------------------------------------------------------

export async function runAnalyze(supabase: Supabase, childId: string) {
  const profile = await seedProfile(supabase, childId)
  const statistics = await loadStatistics(supabase, childId)
  const sessions = await loadSessions(supabase, childId)
  const { data: childRow } = await supabase
    .from("child_profiles")
    .select("name")
    .eq("id", childId)
    .maybeSingle()
  const childName = childRow?.name ?? ""

  const { data: recRows } = await supabase
    .from("learning_recommendations")
    .select("*")
    .eq("child_id", childId)
    .eq("status", "pending")
  const existingRecs = (recRows ?? []) as LearningRecommendation[]

  const analysis = buildAnalysis(childId, childName, profile, statistics, sessions, existingRecs)

  // Forces / vigilance : on remplace les anciennes détections.
  await supabase.from("learning_strengths").delete().eq("child_id", childId)
  await supabase.from("learning_weaknesses").delete().eq("child_id", childId)
  if (analysis.strengths.length) {
    await supabase.from("learning_strengths").insert(
      analysis.strengths.map((s) => ({ child_id: childId, skill: s.skill, score: s.score, evidence: s.evidence })),
    )
  }
  if (analysis.weaknesses.length) {
    await supabase.from("learning_weaknesses").insert(
      analysis.weaknesses.map((w) => ({ child_id: childId, skill: w.skill, score: w.score, suggestion: w.suggestion })),
    )
  }

  // Recommandations : on ajoute de nouvelles (les anciennes restent).
  const seeds = analysis.recommendationSeeds as RecommendationSeed[]
  let recommendations: LearningRecommendation[] = existingRecs
  if (seeds.length) {
    const { data } = await supabase
      .from("learning_recommendations")
      .insert(
        seeds.map((s) => ({
          child_id: childId,
          type: s.type,
          title: s.title,
          description: s.description,
          reason: s.reason,
          priority: s.priority,
          duration: s.duration,
          reward_xp: s.reward_xp,
          reward_stars: s.reward_stars,
          resource_type: s.resource_type,
          resource_id: s.resource_id,
          status: "pending" as RecommendationStatus,
        })),
      )
      .select("*")
    recommendations = (data ?? []) as LearningRecommendation[]
  }

  await supabase
    .from("learning_profiles")
    .update({ last_analysis: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("child_id", childId)

  await supabase.from("coach_history").insert({
    child_id: childId,
    action: "analyze",
    title: "Analyse du profil",
    detail: "Ton coach a analysé tes activités et a préparé de nouvelles recommandations.",
    status: "done",
  })

  return {
    childId,
    summary: analysis.summary,
    greeting: analysis.greeting,
    advice: analysis.advice,
    strengths: analysis.strengths,
    weaknesses: analysis.weaknesses,
    recommendations,
  }
}

// ---------------------------------------------------------------------------
// Programme (journalier / hebdomadaire)
// ---------------------------------------------------------------------------

export async function generateOrGetProgram(supabase: Supabase, childId: string) {
  const profile = await seedProfile(supabase, childId)
  const today = toISODate()

  // Plan du jour
  const { data: dailyRow } = await supabase
    .from("daily_learning_plan")
    .select("*")
    .eq("child_id", childId)
    .eq("plan_date", today)
    .maybeSingle()
  let daily = (dailyRow as DailyLearningPlan | null) ?? null
  if (!daily) {
    const { data: recRows } = await supabase
      .from("learning_recommendations")
      .select("*")
      .eq("child_id", childId)
      .eq("status", "pending")
      .order("priority", { ascending: true })
    const recs = (recRows ?? []) as LearningRecommendation[]
    const activities = buildDailyActivities(recs, profile.preferred_activity)
    const { data } = await supabase
      .from("daily_learning_plan")
      .insert({ child_id: childId, plan_date: today, activities, completed_activities: [] })
      .select("*")
      .single()
    daily = (data as DailyLearningPlan | null) ?? null
  }

  // Plan de la semaine
  const weekStart = weekStartISO(today)
  const { data: weeklyRow } = await supabase
    .from("weekly_learning_plan")
    .select("*")
    .eq("child_id", childId)
    .eq("week_start", weekStart)
    .maybeSingle()
  let weekly = (weeklyRow as WeeklyLearningPlan | null) ?? null
  if (!weekly) {
    const { data: recRows } = await supabase
      .from("learning_recommendations")
      .select("*")
      .eq("child_id", childId)
      .eq("status", "pending")
    const recs = (recRows ?? []) as LearningRecommendation[]
    const plan = buildWeeklyPlan(recs, profile)
    const { data } = await supabase
      .from("weekly_learning_plan")
      .insert({
        child_id: childId,
        week_start: weekStart,
        goals: plan.goals,
        activities: plan.activities,
        completed_goals: [],
      })
      .select("*")
      .single()
    weekly = (data as WeeklyLearningPlan | null) ?? null
  }

  const program: CoachProgram = buildProgram(daily, weekly)
  return { program, daily, weekly }
}

// ---------------------------------------------------------------------------
// Rapport mensuel
// ---------------------------------------------------------------------------

export async function generateOrGetReport(supabase: Supabase, childId: string) {
  const profile = await seedProfile(supabase, childId)
  const now = new Date()
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`

  const { data: row } = await supabase
    .from("monthly_learning_report")
    .select("*")
    .eq("child_id", childId)
    .eq("report_month", month)
    .maybeSingle()
  if (row) return row as MonthlyLearningReport

  const statistics = await loadStatistics(supabase, childId)
  const sessions = await loadSessions(supabase, childId)
  const { strengths } = buildStrengthsWeaknesses(profile, statistics)
  const advice = buildAdvice(profile, statistics, sessions)
  const { data: childRow } = await supabase
    .from("child_profiles")
    .select("name")
    .eq("id", childId)
    .maybeSingle()

  const summary = await generateParentReport(childRow?.name ?? "", profile, statistics, sessions)

  const payload = {
    child_id: childId,
    report_month: month,
    summary,
    progress_delta: {
      creativity: statistics?.creativity ?? 0,
      reading: statistics?.reading ?? 0,
      logic: statistics?.logic ?? 0,
      perseverance: statistics?.perseverance ?? 0,
    },
    strengths: strengths.slice(0, 3).map((s) => s.skill),
    recommendations: advice.slice(0, 3),
    generated_at: new Date().toISOString(),
  }

  const { data } = await supabase
    .from("monthly_learning_report")
    .upsert(payload, { onConflict: "child_id,report_month" })
    .select("*")
    .single()
  return (data as MonthlyLearningReport) ?? payload
}

// ---------------------------------------------------------------------------
// Recommandations
// ---------------------------------------------------------------------------

export async function listRecommendations(
  supabase: Supabase,
  childId: string,
): Promise<LearningRecommendation[]> {
  const { data } = await supabase
    .from("learning_recommendations")
    .select("*")
    .eq("child_id", childId)
    .order("created_at", { ascending: false })
    .limit(30)
  return (data ?? []) as LearningRecommendation[]
}

export async function setRecommendationStatus(
  supabase: Supabase,
  childId: string,
  id: string,
  status: RecommendationStatus,
): Promise<LearningRecommendation | null> {
  const { data, error } = await supabase
    .from("learning_recommendations")
    .update({ status })
    .eq("id", id)
    .eq("child_id", childId)
    .select("*")
    .single()

  if (error || !data) return null

  const label: Record<RecommendationStatus, string> = {
    pending: "proposée",
    accepted: "acceptée",
    ignored: "ignorée",
    completed: "terminée",
    succeeded: "réussie",
  }
  await supabase.from("coach_history").insert({
    child_id: childId,
    action: "recommendation",
    title: (data as LearningRecommendation).title,
    detail: `Recommandation ${label[status]}.`,
    status,
  })

  return data as LearningRecommendation
}

// ---------------------------------------------------------------------------
// Historique & messages
// ---------------------------------------------------------------------------

export async function listHistory(supabase: Supabase, childId: string): Promise<CoachHistoryItem[]> {
  const { data } = await supabase
    .from("coach_history")
    .select("*")
    .eq("child_id", childId)
    .order("created_at", { ascending: false })
    .limit(60)
  return (data ?? []) as CoachHistoryItem[]
}

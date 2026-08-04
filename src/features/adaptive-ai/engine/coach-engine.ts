// ============================================================
// Petit Baobab — Coach IA (Phase 10)
// Moteur pédagogique adaptatif (pur, sans I/O).
// Toutes les analyses sont dérivées des vraies données :
// profil IA, statistiques (radar), sessions, préférences.
// Aucune valeur inventée : quand une donnée manque, la valeur
// neutre est utilisée (0 / 50) — jamais de mock.
// ============================================================

import type { GameEventType } from "@/features/gamification/types"
import type {
  ActivityType,
  CoachAnalysis,
  CoachHistoryItem,
  CoachProgram,
  CoachRadar,
  CoachStatistics,
  DailyLearningPlan,
  LearningPrediction,
  LearningPreference,
  LearningProfile,
  LearningRecommendation,
  LearningSession,
  LearningStrength,
  LearningWeakness,
  RecommendationStatus,
  SkillImprovement,
  WeeklyLearningPlan,
} from "../types/coach"
import {
  ACTIVITY_DEFAULT_MINUTES,
  ACTIVITY_PROFILE_DELTAS,
  ACTIVITY_STAT_DELTAS,
  COACH_RADAR_AXES,
  DEFAULT_PROFILE_SCORES,
  EMPTY_COACH_RADAR,
  INTENT_KEYWORDS,
  KNOWN_ANIMALS,
  RECOMMENDATION_REWARDS,
  STRENGTH_THRESHOLD,
  WEAKNESS_THRESHOLD,
} from "../constants/coach-constants"
import type { CoachIntent } from "../constants/coach-constants"

export type { CoachIntent } from "../constants/coach-constants"

const clamp = (v: number): number => Math.max(0, Math.min(100, Math.round(v)))

function isNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v)
}

// ---------------------------------------------------------------------------
// Dates (helpers locaux — aucune dépendance externe)
// ---------------------------------------------------------------------------

export function toISODate(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function addDaysISO(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00`)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

export function weekStartISO(iso: string): string {
  const d = new Date(`${iso}T12:00:00`)
  const day = (d.getDay() + 6) % 7 // lundi = 0
  d.setDate(d.getDate() - day)
  return toISODate(d)
}

export function daysAgoISO(n: number): string {
  return addDaysISO(toISODate(), -n)
}

const DAY_LABELS = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
]

const MONTH_LABELS = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
]

/** "Aujourd'hui" / "Demain" / "Mercredi 6 août". */
export function formatDateLabel(iso: string): string {
  const today = toISODate()
  if (iso === today) return "Aujourd'hui"
  if (iso === addDaysISO(today, 1)) return "Demain"
  const d = new Date(`${iso}T12:00:00`)
  return `${DAY_LABELS[d.getDay()]} ${d.getDate()} ${MONTH_LABELS[d.getMonth()]}`
}

// ---------------------------------------------------------------------------
// Événements de gamification → activité réelle
// ---------------------------------------------------------------------------

const GAME_EVENT_TO_ACTIVITY: Partial<Record<GameEventType, ActivityType>> = {
  DRAWING_CREATED: "DRAWING",
  DRAWING_COMPLETED: "DRAWING",
  MAGIC_DRAWING_CREATED: "MAGIC_DRAWING",
  COLORING_COMPLETED: "COLORING",
  BOOK_CREATED: "BOOK",
  BOOK_PRINTED: "BOOK",
  STORY_CREATED: "STORY",
  GAME_COMPLETED: "GAME",
  QUIZ_COMPLETED: "QUIZ",
}

export function activityFromEvent(event: GameEventType): ActivityType | null {
  return GAME_EVENT_TO_ACTIVITY[event] ?? null
}

// ---------------------------------------------------------------------------
// Radar pédagogique (8 axes)
// ---------------------------------------------------------------------------

/** Valeur radar d'une compétence : statistique réelle ou repli profil. */
function radarValue(
  key: keyof CoachRadar,
  statistics: CoachStatistics | null,
  profile: LearningProfile | null,
): number {
  const stat = statistics?.[key]
  if (isNumber(stat) && stat > 0) return clamp(stat)

  // Repli honnête : valeur dérivée du profil IA (jamais inventée).
  if (profile) {
    switch (key) {
      case "creativity":
        return clamp(profile.creativity_score)
      case "reading":
        return clamp(profile.reading_score)
      case "logic":
        return clamp(profile.logic_score)
      case "concentration":
        return clamp(profile.attention_score)
      case "observation":
        return clamp(profile.drawing_score)
      case "imagination":
        return clamp(profile.creativity_score)
      case "communication":
        return clamp(Math.round((profile.reading_score + profile.motivation_score) / 2))
      case "motor_skills":
        return clamp(profile.drawing_score)
    }
  }
  return 0
}

export function computeRadar(
  statistics: CoachStatistics | null,
  profile: LearningProfile | null,
): CoachRadar {
  return COACH_RADAR_AXES.reduce((acc, axis) => {
    acc[axis.key] = radarValue(axis.key, statistics, profile)
    return acc
  }, { ...EMPTY_COACH_RADAR })
}

// ---------------------------------------------------------------------------
// Mise à jour automatique des statistiques après une activité réelle
// ---------------------------------------------------------------------------

export function applyActivityToStatistics(
  statistics: CoachStatistics | null,
  activity: ActivityType,
  extra?: { xp?: number; seconds?: number },
): CoachStatistics {
  const current: CoachStatistics = statistics
    ? { ...statistics }
    : {
        child_id: "",
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
        regions_unlocked: 0,
      }

  const deltas = ACTIVITY_STAT_DELTAS[activity] ?? []
  for (const d of deltas) {
    if (d.skill === "perseverance") {
      current.perseverance = clamp(current.perseverance + d.amount)
    } else {
      current[d.skill] = clamp(current[d.skill] + d.amount)
    }
  }

  current.total_xp += extra?.xp ?? 0
  current.time_spent_seconds += extra?.seconds ?? 0
  return current
}

/** Met à jour le profil IA à partir d'une activité réelle (automatisation). */
export function applyActivityToProfile(
  profile: LearningProfile,
  activity: ActivityType,
  meta?: { style?: string; colors?: string[]; bookTitle?: string },
): Partial<LearningProfile> {
  const next: Partial<LearningProfile> = {}
  const deltas = ACTIVITY_PROFILE_DELTAS[activity] ?? []

  for (const d of deltas) {
    if (d.score) {
      const current = profile[d.score] ?? DEFAULT_PROFILE_SCORES[d.score] ?? 50
      next[d.score] = clamp(current + (d.amount ?? 0))
    }
  }

  if (meta?.style && meta.style.trim()) {
    next.favorite_styles = dedupe([...profile.favorite_styles, meta.style])
  }
  if (meta?.colors && meta.colors.length > 0) {
    next.favorite_colors = dedupe([...profile.favorite_colors, ...meta.colors].slice(0, 12))
  }
  if (meta?.bookTitle) {
    next.favorite_books = dedupe([...profile.favorite_books, meta.bookTitle].slice(0, 12))
  }

  next.preferred_activity = activity
  return next
}

function dedupe(items: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const item of items) {
    const k = item.trim().toLowerCase()
    if (!seen.has(k) && item.trim()) {
      seen.add(k)
      out.push(item.trim())
    }
  }
  return out
}

// ---------------------------------------------------------------------------
// Durée / XP par session
// ---------------------------------------------------------------------------

export function buildSession(
  childId: string,
  activity: ActivityType,
  payload?: { duration?: number; xp?: number; stars?: number; startedAt?: string },
): LearningSession {
  const duration = payload?.duration ?? ACTIVITY_DEFAULT_MINUTES[activity] ?? 5
  const xp = payload?.xp ?? 5
  const stars = payload?.stars ?? 0
  return {
    child_id: childId,
    activity_type: activity,
    duration_seconds: duration * 60,
    xp_earned: xp,
    stars_earned: stars,
    started_at: payload?.startedAt ?? new Date().toISOString(),
    ended_at: new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// Forces / points de vigilance
// ---------------------------------------------------------------------------

export function buildStrengthsWeaknesses(
  profile: LearningProfile | null,
  statistics: CoachStatistics | null,
): { strengths: LearningStrength[]; weaknesses: LearningWeakness[] } {
  const childId = profile?.child_id ?? ""
  const strengths: LearningStrength[] = []
  const weaknesses: LearningWeakness[] = []

  const radar = computeRadar(statistics, profile)
  const labels: Record<keyof CoachRadar, string> = {
    reading: "Lecture",
    creativity: "Créativité",
    concentration: "Concentration",
    logic: "Logique",
    observation: "Observation",
    imagination: "Imagination",
    communication: "Communication",
    motor_skills: "Motricité",
  }

  for (const axis of COACH_RADAR_AXES) {
    const value = radar[axis.key]
    if (value >= STRENGTH_THRESHOLD) {
      strengths.push({
        child_id: childId,
        skill: axis.key,
        score: value,
        evidence: `Plus de ${value}% sur la compétence ${labels[axis.key].toLowerCase()}.`,
      })
    } else if (value <= WEAKNESS_THRESHOLD && value > 0) {
      weaknesses.push({
        child_id: childId,
        skill: axis.key,
        score: value,
        suggestion: suggestionForSkill(axis.key),
      })
    }
  }

  return { strengths, weaknesses }
}

function suggestionForSkill(skill: string): string {
  switch (skill) {
    case "reading":
      return "Une petite histoire chaque jour aide beaucoup."
    case "logic":
      return "Les puzzles et les jeux d'observation entraînent la logique."
    case "concentration":
      return "Des activités courtes et régulières améliorent la concentration."
    case "creativity":
      return "Le coloriage et le dessin magique font grandir ta créativité."
    case "observation":
      return "Observer les animaux et la nature affine ton œil."
    case "imagination":
      return "Inventer des histoires fait grandir ton imagination."
    case "communication":
      return "Raconter tes dessins aide à mieux communiquer."
    case "motor_skills":
      return "Colorier avec soin entraîne ta motricité."
    default:
      return "Continue à t'entraîner un peu chaque jour."
  }
}

// ---------------------------------------------------------------------------
// Recommandations (basées sur les données réelles)
// ---------------------------------------------------------------------------

export interface RecommendationSeed {
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
}

function animalTopic(profile: LearningProfile | null): string | null {
  const topics = profile?.preferred_topics ?? []
  const found = topics.find((t) => KNOWN_ANIMALS.includes(t.trim().toLowerCase()))
  return found ?? profile?.favorite_animals?.[0] ?? null
}

export function buildRecommendations(
  profile: LearningProfile | null,
  statistics: CoachStatistics | null,
  preferences: LearningPreference[] = [],
): RecommendationSeed[] {
  const radar = computeRadar(statistics, profile)
  const seeds: RecommendationSeed[] = []
  const used = new Set<string>()

  const rewards = (type: ActivityType) =>
    RECOMMENDATION_REWARDS[type] ?? { xp: 15, stars: 2, duration: 10 }

  const add = (seed: Omit<RecommendationSeed, "reward_xp" | "reward_stars" | "duration">) => {
    if (used.has(seed.type)) return
    used.add(seed.type)
    const r = rewards(seed.type)
    seeds.push({ ...seed, duration: r.duration, reward_xp: r.xp, reward_stars: r.stars })
  }

  const animal = animalTopic(profile)
  const prefersAnimals = (profile?.preferred_topics ?? []).some((t) =>
    KNOWN_ANIMALS.includes(t.toLowerCase()),
  )

  // 1. Faiblesse en lecture → histoire
  if (radar.reading <= WEAKNESS_THRESHOLD) {
    add({
      type: "STORY",
      title: "Lire une histoire",
      description: "Une courte histoire pour progresser en lecture, en douceur.",
      reason: "Tu progresses en lecture. Chaque histoire t'aide encore plus.",
      priority: 1,
      resource_type: "story",
      resource_id: null,
    })
  }

  // 2. Faiblesse en logique → puzzle / jeu
  if (radar.logic <= WEAKNESS_THRESHOLD) {
    add({
      type: "GAME",
      title: "Jouer au puzzle",
      description: "Un petit jeu de logique pour muscler ton cerveau.",
      reason: "Cela améliorera ta logique.",
      priority: 2,
      resource_type: "game",
      resource_id: null,
    })
  }

  // 3. Passion pour les animaux (ou forte créativité) → coloriage personnalisé
  if (prefersAnimals || animal || radar.creativity >= STRENGTH_THRESHOLD) {
    const subject = animal ? ` de ${animal.charAt(0).toUpperCase()}${animal.slice(1)}` : ""
    add({
      type: "COLORING",
      title: `Créer un coloriage${subject}`,
      description: `Un coloriage${subject} rien que pour toi.`,
      reason: animal ? `Tu adores les animaux${animal ? `, surtout le ${animal}` : ""}.` : "Tu adores créer et colorier.",
      priority: 1,
      resource_type: "coloring",
      resource_id: null,
    })
  }

  // 4. Lecteur assidu → créer un livre
  if (radar.reading >= STRENGTH_THRESHOLD || (profile?.reading_score ?? 0) >= 60) {
    add({
      type: "BOOK",
      title: "Créer un livre",
      description: "Invente ton propre livre avec tes dessins.",
      reason: "Tu termines toujours tes livres, continue !",
      priority: 2,
      resource_type: "book",
      resource_id: null,
    })
  }

  // 5. Faiblesse en concentration → dessin magique court
  if (radar.concentration <= WEAKNESS_THRESHOLD) {
    add({
      type: "MAGIC_DRAWING",
      title: "Un dessin magique surprise",
      description: "Laisse la magie créer un dessin pour toi.",
      reason: "C'est parfait pour t'entraîner à te concentrer en t'amusant.",
      priority: 3,
      resource_type: "magic-drawing",
      resource_id: null,
    })
  }

  // 6. Observation à renforcer → défi d'observation
  if (radar.observation <= WEAKNESS_THRESHOLD) {
    add({
      type: "CHALLENGE",
      title: "Relever un défi d'observation",
      description: "Trouve les différences et deviens un détective.",
      reason: "Cela améliorera ta logique et ton sens de l'observation.",
      priority: 4,
      resource_type: "challenge",
      resource_id: null,
    })
  }

  // 7. Défi générique si aucune recommandation n'a été émise
  if (seeds.length === 0) {
    const weakest = [...COACH_RADAR_AXES].sort((a, b) => radar[a.key] - radar[b.key])[0]
    const weakestLabel = weakest.label.toLowerCase()
    add({
      type: "CHALLENGE",
      title: "Relever un nouveau défi",
      description: "Un défi adapté à ta progression.",
      reason: `Cela aidera ta ${weakestLabel} à grandir encore.`,
      priority: 2,
      resource_type: "challenge",
      resource_id: null,
    })
  }

  // 8. Toujours une suggestion de temps de lecture détente
  add({
    type: "QUIZ",
    title: "Un petit quiz amusant",
    description: "Des questions simples pour jouer et apprendre.",
    reason: "C'est amusant et tu progresses à chaque réponse.",
    priority: 5,
    resource_type: "quiz",
    resource_id: null,
  })

  void preferences
  return seeds.slice(0, 4)
}

// ---------------------------------------------------------------------------
// Programme personnalisé (Section 5)
// ---------------------------------------------------------------------------

export function buildDailyActivities(
  recommendations: LearningRecommendation[],
  preferred: ActivityType,
): string[] {
  const pool = recommendations.filter((r) => r.status === "pending")
  const items = pool.map((r) => r.title)
  if (items.length >= 2) return items.slice(0, 2)
  return [`${activityLabel(preferred)} du jour`, "Un moment de jeu et de détente"]
}

export function activityLabel(activity: ActivityType): string {
  switch (activity) {
    case "COLORING":
      return "Coloriage"
    case "MAGIC_DRAWING":
      return "Dessin magique"
    case "DRAWING":
      return "Dessin"
    case "BOOK":
      return "Livre"
    case "STORY":
      return "Histoire"
    case "GAME":
      return "Jeu"
    case "QUIZ":
      return "Quiz"
    case "CHALLENGE":
      return "Défi"
    case "MISSION":
      return "Mission"
    case "COLLECTION":
      return "Collection"
    default:
      return "Activité"
  }
}

export function buildWeeklyPlan(
  recommendations: LearningRecommendation[],
  profile: LearningProfile | null,
): { goals: string[]; activities: string[] } {
  const pending = recommendations.filter((r) => r.status === "pending")
  const types = [...new Set(pending.map((r) => r.type))]

  const goals: string[] = []
  if (types.includes("COLORING") || !types.length) goals.push("2 coloriages")
  if (types.includes("STORY") || !types.length) goals.push("1 histoire")
  if (types.includes("BOOK") || (profile?.reading_score ?? 0) >= 60) goals.push("1 livre")
  if (types.includes("GAME") || types.includes("QUIZ") || !types.length) goals.push("1 défi")

  const activities = pending.length
    ? pending.slice(0, 4).map((r) => r.title)
    : [
        `${activityLabel(profile?.preferred_activity ?? "COLORING")} créatif`,
        "Une histoire du soir",
        "Un jeu de logique",
        "Un défi surprise",
      ]

  return { goals: goals.slice(0, 4), activities }
}

export function buildProgram(
  daily: DailyLearningPlan | null,
  weekly: WeeklyLearningPlan | null,
): CoachProgram {
  const today = toISODate()
  const dailyActivities = daily?.activities.length ? daily.activities : ["Une activité amusante"]
  const weeklyActivities = weekly?.activities.length ? weekly.activities : []
  const weeklyGoals = weekly?.goals.length ? weekly.goals : ["3 activités", "1 défi"]

  return {
    daily: {
      date: daily?.plan_date ?? today,
      activities: dailyActivities,
      completed: daily?.completed_activities ?? [],
    },
    tomorrow: {
      date: addDaysISO(today, 1),
      activities: dailyActivities.map((a) => a),
    },
    weekly: {
      week_start: weekly?.week_start ?? weekStartISO(today),
      activities: weeklyActivities,
      goals: weeklyGoals,
      completed: weekly?.completed_goals ?? [],
    },
  }
}

// ---------------------------------------------------------------------------
// Améliorations (Section 6) — calculées depuis les sessions réelles
// ---------------------------------------------------------------------------

const SKILL_BY_ACTIVITY: Record<ActivityType, keyof CoachRadar | "perseverance"> = {
  COLORING: "creativity",
  MAGIC_DRAWING: "creativity",
  DRAWING: "creativity",
  BOOK: "reading",
  STORY: "reading",
  GAME: "logic",
  QUIZ: "logic",
  CHALLENGE: "perseverance",
  MISSION: "perseverance",
  VIDEO: "observation",
  COLLECTION: "observation",
}

export function computeImprovements(
  statistics: CoachStatistics | null,
  sessions: LearningSession[],
): SkillImprovement[] {
  const targetSkills: (keyof CoachRadar | "perseverance")[] = ["reading", "creativity", "perseverance", "logic"]
  const today = new Date()
  const startCurrent = new Date(today)
  startCurrent.setDate(startCurrent.getDate() - 29)
  startCurrent.setHours(0, 0, 0, 0)
  const startPrevious = new Date(startCurrent)
  startPrevious.setDate(startPrevious.getDate() - 30)

  const exposure = (from: Date, to: Date): Record<string, number> => {
    const out: Record<string, number> = {}
    for (const s of sessions) {
      const t = new Date(s.started_at)
      if (t >= from && t < to) {
        const skill = SKILL_BY_ACTIVITY[s.activity_type]
        out[skill] = (out[skill] ?? 0) + 1
      }
    }
    return out
  }

  const currentExp = exposure(startCurrent, today)
  const previousExp = exposure(startPrevious, startCurrent)

  const labelFor: Record<string, { label: string; icon: string }> = {
    reading: { label: "Lecture", icon: "📖" },
    creativity: { label: "Créativité", icon: "🎨" },
    perseverance: { label: "Persévérance", icon: "💪" },
    logic: { label: "Logique", icon: "🧩" },
  }

  return targetSkills.map((skill) => {
    const prev = previousExp[skill] ?? 0
    const curr = currentExp[skill] ?? 0
    let delta = 0
    if (prev > 0) {
      delta = Math.round(((curr - prev) / prev) * 100)
    } else if (curr > 0) {
      delta = 15
    }
    const clamped = Math.max(-20, Math.min(35, delta))
    const info = labelFor[skill]
    return {
      skill,
      label: info.label,
      icon: info.icon,
      current: curr,
      previous: prev,
      delta: clamped,
    }
  })
}

// ---------------------------------------------------------------------------
// Conseils du coach (Section 7) — basés sur les données réelles
// ---------------------------------------------------------------------------

export function buildAdvice(
  profile: LearningProfile | null,
  statistics: CoachStatistics | null,
  sessions: LearningSession[],
): string[] {
  const advice: string[] = []
  const radar = computeRadar(statistics, profile)

  // Activités du matin
  const morning = sessions.filter((s) => {
    const h = new Date(s.started_at).getHours()
    return h >= 6 && h < 12
  })
  if (morning.length >= 3 && morning.length >= sessions.length / 2) {
    advice.push("Tu réussis très bien les activités du matin. Essaie demain un nouveau dessin magique !")
  }

  // Aucun livre depuis une semaine
  const weekAgo = daysAgoISO(7)
  const recentBooks = sessions.filter(
    (s) => (s.activity_type === "BOOK" || s.activity_type === "STORY") && s.started_at.slice(0, 10) >= weekAgo,
  )
  if (recentBooks.length === 0 && sessions.length > 0) {
    advice.push("Tu n'as pas créé de livre depuis une semaine. Pourquoi ne pas en commencer un ?")
  }

  // Progression en lecture
  if (radar.reading >= 55) {
    advice.push("Ta lecture progresse très bien. Continue avec une histoire de plus cette semaine !")
  }

  // Créativité débordante
  if (radar.creativity >= 65) {
    advice.push("Ta créativité est en pleine fleur. Un nouveau coloriage animalier t'attend.")
  }

  // Concentration à renforcer
  if (radar.concentration > 0 && radar.concentration <= 40) {
    advice.push("Les activités courtes et régulières renforcent ta concentration. Essaie 10 minutes par jour.")
  }

  // Motivation
  if ((profile?.motivation_score ?? 50) >= 60) {
    advice.push("Ta motivation est incroyable. Continue comme ça, chaque jour compte !")
  }

  if (advice.length === 0) {
    advice.push("Continue tes activités préférées, tu avances chaque jour un peu plus. Bravo !")
  }

  return advice.slice(0, 3)
}

// ---------------------------------------------------------------------------
// Message d'accueil du coach (Section 1)
// ---------------------------------------------------------------------------

export function getGreeting(
  childName: string,
  profile: LearningProfile | null,
  statistics: CoachStatistics | null,
): { message: string; encouragement: string } {
  const radar = computeRadar(statistics, profile)
  const animal = animalTopic(profile)
  const prefersAnimals = (profile?.preferred_topics ?? []).some((t) =>
    KNOWN_ANIMALS.includes(t.toLowerCase()),
  )

  let message = "Aujourd'hui je pense que tu devrais continuer ton aventure avec les animaux."
  if (prefersAnimals || animal) {
    message = `Aujourd'hui je pense que tu devrais continuer ton aventure avec ${animal ? `le ${animal}` : "les animaux"}.`
  } else if (radar.creativity >= 60) {
    message = "Aujourd'hui je pense que tu devrais laisser parler ta créativité avec un nouveau coloriage."
  } else if (radar.reading >= 55) {
    message = "Aujourd'hui je pense que tu devrais continuer à progresser avec une belle histoire."
  } else if (radar.logic >= 55) {
    message = "Aujourd'hui je pense que tu devrais relever un petit défi de logique."
  }

  const encouragement =
    radar.reading >= 60 || radar.creativity >= 60
      ? "Tu progresses très vite !"
      : "Chaque activité te fait grandir, continue !"

  return { message, encouragement }
}

// ---------------------------------------------------------------------------
// Prédictions (Section 10 / API)
// ---------------------------------------------------------------------------

export function buildPrediction(
  profile: LearningProfile | null,
  statistics: CoachStatistics | null,
  sessions: LearningSession[],
  level = 1,
  totalXp = 0,
  xpToNextLevel = 150,
): Omit<LearningPrediction, "child_id"> {
  const radar = computeRadar(statistics, profile)
  const weakest = [...COACH_RADAR_AXES].sort((a, b) => radar[a.key] - radar[b.key])[0]

  // XP moyen par semaine à partir des vraies sessions.
  const firstDate = sessions.length ? new Date(sessions[0].started_at) : new Date()
  const weeks = Math.max(1, Math.ceil((Date.now() - firstDate.getTime()) / (7 * 24 * 3600 * 1000)))
  const weeklyXp = Math.max(5, Math.round(sessions.reduce((s, x) => s + x.xp_earned, 0) / weeks))

  // Rythme d'apprentissage : sessions récentes → XP par heure estimé.
  const minutes = sessions.reduce((s, x) => s + x.duration_seconds, 0) / 60
  const xpPerHour = minutes > 0 ? Math.max(5, Math.round((sessions.reduce((s, x) => s + x.xp_earned, 0) / minutes) * 60)) : 20
  const estimatedHours = Math.max(1, Math.round((Math.max(0, xpToNextLevel)) / xpPerHour))

  const confidence = Math.min(0.9, 0.5 + sessions.length * 0.02)

  return {
    next_level: level + 1,
    next_skill: weakest.key,
    predicted_xp: totalXp + weeklyXp * 4,
    predicted_week_xp: weeklyXp,
    estimated_hours_to_next_level: estimatedHours,
    confidence: Math.round(confidence * 100) / 100,
    model: "rule-based",
  }
}

// ---------------------------------------------------------------------------
// Dialogue du coach (Section 10) — réponses déterministes + contexte réel
// ---------------------------------------------------------------------------

export function detectIntent(message: string): CoachIntent {
  const m = message.toLowerCase()
  const scores = Object.entries(INTENT_KEYWORDS) as [CoachIntent, string[]][]
  let best: CoachIntent = "general"
  let bestScore = 0
  for (const [intent, keywords] of scores) {
    const score = keywords.reduce((acc, k) => (m.includes(k) ? acc + 1 : acc), 0)
    if (score > bestScore) {
      best = intent
      bestScore = score
    }
  }
  return best
}

export interface ChatContext {
  childName: string
  profile: LearningProfile | null
  statistics: CoachStatistics | null
  predictions: LearningPrediction | null
  recommendations: LearningRecommendation[]
  nextRecommendation: LearningRecommendation | null
  level: number
  totalXp: number
}

export function buildFallbackReply(intent: CoachIntent, ctx: ChatContext): string {
  const name = ctx.childName || "petit champion"
  switch (intent) {
    case "what_to_do": {
      const rec = ctx.nextRecommendation
      return rec
        ? `Pour aujourd'hui, je te conseille : « ${rec.title} » (${rec.duration} min, +${rec.reward_xp} XP). Tu vas adorer !`
        : `Commence par une activité que tu aimes, comme le coloriage ou une petite histoire. Chaque minute compte !`
    }
    case "next_level": {
      const p = ctx.predictions
      if (!p) return `Continue tes activités et ton niveau montera tout seul. Bravo pour tes efforts !`
      return `Tu es en route vers le niveau ${p.next_level}. Encore ~${p.estimated_hours_to_next_level} heures d'aventures et c'est gagné !`
    }
    case "earn_stars": {
      const rec = ctx.recommendations.find((r) => r.status === "pending")
      const starHint = rec ? ` ${rec.title} rapporte ${rec.reward_stars} étoile(s) !` : ""
      return `Pour gagner des étoiles, termine des activités chaque jour.${starHint} Terminer un parcours en rapporte aussi beaucoup !`
    }
    case "why_read":
      return `Lire, c'est comme voyager sans bouger ! Ça fait grandir ton imagination et ta confiance. Plus tu lis, plus c'est facile.`
    case "coloring_idea": {
      const animal = animalTopic(ctx.profile)
      return animal
        ? `Et si tu coloriais un ${animal} aujourd'hui ? Tu adores les animaux, ce sera superbe !`
        : `Laisse-toi guider : choisis tes couleurs préférées et dessine ton animal du moment.`
    }
    case "bored":
      return `Si tu t'ennuies, je te propose une petite mission surprise. Elle te fera découvrir quelque chose de nouveau !`
    case "progress": {
      const radar = computeRadar(ctx.statistics, ctx.profile)
      const top = [...COACH_RADAR_AXES].sort((a, b) => radar[a.key] - radar[b.key]).slice(-1)[0]
      return `Tu progresses super bien ! Ta ${top.label.toLowerCase()} est déjà à ${radar[top.key]}%. Continue sur ta lancée.`
    }
    case "greeting":
      return `Bonjour ${name} ! Je suis ravi de te voir. Tu veux une idée d'activité ou un petit défi ?`
    default:
      return `Belle question, ${name} ! Continue à t'amuser et à apprendre, tu es sur la bonne voie.`
  }
}

// ---------------------------------------------------------------------------
// Historique IA (Section 9)
// ---------------------------------------------------------------------------

export function buildHistoryItems(
  childId: string,
  items: Pick<CoachHistoryItem, "action" | "title" | "detail" | "status" | "created_at">[],
): CoachHistoryItem[] {
  return items.map((item, i) => ({
    id: `h_${i}_${childId}`,
    child_id: childId,
    action: item.action,
    title: item.title,
    detail: item.detail,
    status: item.status,
    created_at: item.created_at ?? new Date().toISOString(),
  }))
}

export function recommendationStatusLabel(status: RecommendationStatus): string {
  switch (status) {
    case "pending":
      return "En attente"
    case "accepted":
      return "Acceptée"
    case "ignored":
      return "Ignorée"
    case "completed":
      return "Terminée"
    case "succeeded":
      return "Réussie"
    default:
      return status
  }
}

// ---------------------------------------------------------------------------
// Analyse complète (utilisée par /api/coach/analyze)
// ---------------------------------------------------------------------------

export function buildAnalysis(
  childId: string,
  childName: string,
  profile: LearningProfile | null,
  statistics: CoachStatistics | null,
  sessions: LearningSession[],
  recommendations: LearningRecommendation[],
): Omit<CoachAnalysis, "recommendations"> & { recommendationSeeds: RecommendationSeed[] } {
  const { strengths, weaknesses } = buildStrengthsWeaknesses(profile, statistics)
  const seeds = buildRecommendations(profile, statistics)
  const greeting = getGreeting(childName, profile, statistics)
  const advice = buildAdvice(profile, statistics, sessions)

  const summary = strengths.length
    ? `${childName || "Tu"} brille en ${strengths.slice(0, 2).map((s) => s.skill).join(" et ")}. Continuons à faire grandir ces forces !`
    : "Ton profil se construit au fil des activités. Plus tu joues, mieux je te comprends !"

  void recommendations
  return { childId, summary, strengths, weaknesses, greeting: greeting.message, advice, recommendationSeeds: seeds }
}

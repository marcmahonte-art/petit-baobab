// ============================================================
// Petit Baobab — Coach IA (Phase 10)
// Constantes : axes du radar, libellés, mapping activité →
// compétences (mise à jour automatique), récompenses par défaut.
// ============================================================

import type {
  ActivityType,
  CoachRadar,
} from "../types/coach"

export const COACH_RADAR_AXES: { key: keyof CoachRadar; label: string; icon: string; color: string }[] = [
  { key: "reading", label: "Lecture", icon: "📖", color: "#7D6AF8" },
  { key: "creativity", label: "Créativité", icon: "🎨", color: "#FF5E83" },
  { key: "concentration", label: "Concentration", icon: "🧘", color: "#20C997" },
  { key: "logic", label: "Logique", icon: "🧩", color: "#1194FF" },
  { key: "observation", label: "Observation", icon: "🔍", color: "#FFB300" },
  { key: "imagination", label: "Imagination", icon: "💡", color: "#7D6AF8" },
  { key: "communication", label: "Communication", icon: "💬", color: "#FF8A5C" },
  { key: "motor_skills", label: "Motricité", icon: "✏️", color: "#20C997" },
]

export const COACH_RADAR_KEYS: (keyof CoachRadar)[] = COACH_RADAR_AXES.map((a) => a.key)

export const EMPTY_COACH_RADAR: CoachRadar = {
  reading: 0,
  creativity: 0,
  concentration: 0,
  logic: 0,
  observation: 0,
  imagination: 0,
  communication: 0,
  motor_skills: 0,
}

/** Mapping d'activité → axes du radar renforcés (delta par activité). */
export interface SkillDelta {
  skill: keyof CoachRadar | "perseverance"
  amount: number
}

/** Deltas de statistiques par type d'activité réelle. */
export const ACTIVITY_STAT_DELTAS: Partial<Record<ActivityType, SkillDelta[]>> = {
  COLORING: [
    { skill: "creativity", amount: 3 },
    { skill: "observation", amount: 2 },
    { skill: "motor_skills", amount: 2 },
    { skill: "perseverance", amount: 1 },
  ],
  MAGIC_DRAWING: [
    { skill: "creativity", amount: 3 },
    { skill: "imagination", amount: 3 },
  ],
  DRAWING: [
    { skill: "creativity", amount: 2 },
    { skill: "imagination", amount: 2 },
    { skill: "motor_skills", amount: 1 },
  ],
  BOOK: [
    { skill: "reading", amount: 3 },
    { skill: "perseverance", amount: 2 },
    { skill: "creativity", amount: 1 },
  ],
  STORY: [
    { skill: "reading", amount: 3 },
    { skill: "imagination", amount: 2 },
    { skill: "communication", amount: 2 },
  ],
  GAME: [
    { skill: "logic", amount: 3 },
    { skill: "concentration", amount: 2 },
    { skill: "perseverance", amount: 1 },
  ],
  QUIZ: [
    { skill: "logic", amount: 3 },
    { skill: "observation", amount: 2 },
    { skill: "reading", amount: 1 },
  ],
  CHALLENGE: [
    { skill: "perseverance", amount: 3 },
    { skill: "logic", amount: 2 },
  ],
  MISSION: [
    { skill: "perseverance", amount: 2 },
    { skill: "concentration", amount: 1 },
  ],
  VIDEO: [{ skill: "observation", amount: 2 }],
  COLLECTION: [
    { skill: "observation", amount: 2 },
    { skill: "imagination", amount: 2 },
  ],
}

/** Deltas du profil IA par type d'activité réelle. */
export interface ProfileDelta {
  score?: keyof Pick<
    LearningProfile,
    "creativity_score" | "logic_score" | "reading_score" | "drawing_score" | "attention_score"
  >
  amount?: number
  style?: boolean
  book?: boolean
}

export const ACTIVITY_PROFILE_DELTAS: Partial<Record<ActivityType, ProfileDelta[]>> = {
  COLORING: [
    { score: "creativity_score", amount: 2 },
    { score: "drawing_score", amount: 2 },
    { score: "attention_score", amount: 1 },
    { style: true },
  ],
  MAGIC_DRAWING: [
    { score: "creativity_score", amount: 3 },
    { score: "drawing_score", amount: 2 },
  ],
  DRAWING: [
    { score: "creativity_score", amount: 2 },
    { score: "drawing_score", amount: 2 },
  ],
  BOOK: [
    { score: "reading_score", amount: 3 },
    { score: "creativity_score", amount: 1 },
    { book: true },
  ],
  STORY: [
    { score: "reading_score", amount: 3 },
    { score: "attention_score", amount: 2 },
  ],
  GAME: [{ score: "logic_score", amount: 3 }],
  QUIZ: [
    { score: "logic_score", amount: 3 },
    { score: "reading_score", amount: 1 },
  ],
  CHALLENGE: [{ score: "attention_score", amount: 2 }],
  MISSION: [{ score: "attention_score", amount: 1 }],
}

import type { LearningProfile } from "../types/coach"

/** Durée moyenne (minutes) attribuée par défaut à une activité sans durée connue. */
export const ACTIVITY_DEFAULT_MINUTES: Partial<Record<ActivityType, number>> = {
  COLORING: 6,
  MAGIC_DRAWING: 5,
  DRAWING: 5,
  BOOK: 8,
  STORY: 7,
  GAME: 6,
  QUIZ: 4,
  VIDEO: 5,
}

/** Type d'activité préférée par défaut. */
export const DEFAULT_PREFERRED_ACTIVITY: ActivityType = "COLORING"

/** Valeurs initiales des scores du profil IA (0-100). */
export const DEFAULT_PROFILE_SCORES = {
  motivation_score: 50,
  attention_score: 50,
  creativity_score: 50,
  logic_score: 50,
  reading_score: 50,
  drawing_score: 50,
  confidence_score: 50,
} as const

/** Seuils pour détecter les forces / points de vigilance. */
export const STRENGTH_THRESHOLD = 62
export const WEAKNESS_THRESHOLD = 42

/** Récompenses par défaut d'une recommandation (XP / étoiles). */
export const RECOMMENDATION_REWARDS: Partial<Record<ActivityType, { xp: number; stars: number; duration: number }>> = {
  COLORING: { xp: 20, stars: 2, duration: 10 },
  MAGIC_DRAWING: { xp: 25, stars: 3, duration: 10 },
  DRAWING: { xp: 20, stars: 2, duration: 10 },
  BOOK: { xp: 35, stars: 4, duration: 20 },
  STORY: { xp: 30, stars: 3, duration: 15 },
  GAME: { xp: 25, stars: 3, duration: 12 },
  QUIZ: { xp: 20, stars: 2, duration: 8 },
  CHALLENGE: { xp: 40, stars: 5, duration: 20 },
}

/** Animaux préférés canoniques (topics populaires de Petit Baobab). */
export const KNOWN_ANIMALS = [
  "girafe",
  "lion",
  "éléphant",
  "singe",
  "perroquet",
  "gazelle",
  "zèbre",
  "hippopotame",
  "tortue",
  "serpent",
  "poisson",
  "oiseau",
  "papillon",
]

/** Catégories de préférences possibles. */
export const PREFERENCE_CATEGORIES = [
  "animals",
  "colors",
  "styles",
  "books",
  "topics",
  "activities",
] as const

/** Intentions simples reconnues par le dialogue du coach. */
export type CoachIntent =
  | "what_to_do"
  | "next_level"
  | "earn_stars"
  | "why_read"
  | "coloring_idea"
  | "bored"
  | "progress"
  | "greeting"
  | "general"

export const INTENT_KEYWORDS: Record<CoachIntent, string[]> = {
  what_to_do: ["que dois-je faire", "quoi faire", "que faire", "par où commencer", "aujourd", "recommande"],
  next_level: ["prochain niveau", "mon niveau", "niveau suivant", "quand est-ce que je passe"],
  earn_stars: ["étoile", "etoile", "gagner", "gagner des", "récompense", "recompense"],
  why_read: ["pourquoi lire", "lire", "lecture", "livre", "histoire"],
  coloring_idea: ["colorier", "coloriage", "dessin", "couleur"],
  bored: ["ennuie", "m'ennuie", "rien à faire", "m'ennuyer"],
  progress: ["progrès", "progres", "avance", "progression", "résultat", "resultat"],
  greeting: ["bonjour", "salut", "hello", "coucou", "bonsoir"],
  general: [],
}

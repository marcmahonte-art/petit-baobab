import type {
  DailyMission,
  LearningMission,
  LearningRegion,
  MissionType,
  WeeklyMission,
} from "../types"

// ---------------------------------------------------------------------------
// PHASE 9 — Learning Map : contenu canonique de la carte du monde
// ---------------------------------------------------------------------------

export interface RegionSeed {
  slug: string
  title: string
  description: string
  icon: string
  color: string
  position_x: number
  position_y: number
  required_xp: number
  missions: readonly [
    title: string,
    description: string,
    type: MissionType,
    xp: number,
    stars: number,
    badge?: string,
    duration?: number,
  ][]
}

export const MAP_REGION_SEEDS: RegionSeed[] = [
  {
    slug: "foret-des-animaux",
    title: "Forêt des Animaux",
    description: "Rencontre les animaux de la savane et de la forêt.",
    icon: "🌿",
    color: "#20C997",
    position_x: 12,
    position_y: 18,
    required_xp: 0,
    missions: [
      ["Colorie un éléphant", "Choisis un coloriage d'éléphant et colorie-le avec soin.", "COLORING", 25, 5, "badge_elephant", 10],
      ["Rencontre le lion", "Découvre le roi de la savane en coloriage.", "COLORING", 25, 5, undefined, 10],
      ["Quiz des animaux", "Réponds aux questions sur les animaux.", "QUIZ", 30, 5, undefined, 10],
    ],
  },
  {
    slug: "village-des-couleurs",
    title: "Village des Couleurs",
    description: "Explore le monde magique des couleurs.",
    icon: "🌈",
    color: "#FFB300",
    position_x: 38,
    position_y: 12,
    required_xp: 120,
    missions: [
      ["Colorie un arc-en-ciel", "Réalise un magnifique arc-en-ciel en coloriage.", "COLORING", 25, 5, undefined, 10],
      ["Dessin magique coloré", "Crée un dessin magique plein de couleurs.", "MAGIC_DRAWING", 35, 5, "badge_couleurs", 15],
      ["Jeu des couleurs", "Joue au jeu des couleurs.", "GAME", 30, 5, undefined, 10],
    ],
  },
  {
    slug: "royaume-des-lions",
    title: "Royaume des Lions",
    description: "Deviens un vrai roi ou une vraie reine de la savane.",
    icon: "🦁",
    color: "#FF8A00",
    position_x: 62,
    position_y: 22,
    required_xp: 300,
    missions: [
      ["Défi du lion", "Relève le défi du roi de la savane.", "CHALLENGE", 50, 8, "badge_lion", 15],
      ["Histoire du lionceau", "Écoute ou crée l'histoire d'un lionceau.", "STORY", 35, 5, undefined, 15],
      ["Coloriage royal", "Colorie une scène royale de la savane.", "COLORING", 25, 5, undefined, 10],
    ],
  },
  {
    slug: "riviere-magique",
    title: "Rivière Magique",
    description: "Suis la rivière et découvre ses secrets.",
    icon: "🌊",
    color: "#1194FF",
    position_x: 78,
    position_y: 40,
    required_xp: 500,
    missions: [
      ["Crée un livre aquatique", "Crée un livre sur la vie sous-marine.", "BOOK", 45, 8, "badge_riviere", 20],
      ["Dessin du fleuve", "Dessine un paysage de rivière magique.", "MAGIC_DRAWING", 35, 5, undefined, 15],
      ["Quiz de la rivière", "Réponds aux questions sur l'eau.", "QUIZ", 30, 5, undefined, 10],
    ],
  },
  {
    slug: "montagne-des-lettres",
    title: "Montagne des Lettres",
    description: "Grimpe la montagne et apprends l'alphabet.",
    icon: "⛰️",
    color: "#7D6AF8",
    position_x: 30,
    position_y: 62,
    required_xp: 700,
    missions: [
      ["Mission alphabet", "Accomplis la mission de l'alphabet.", "MISSION", 40, 6, "badge_alphabet", 10],
      ["Colorie les lettres", "Colorie tes lettres préférées.", "COLORING", 25, 5, undefined, 10],
      ["Jeu des lettres", "Joue au jeu des lettres.", "GAME", 30, 5, undefined, 10],
    ],
  },
  {
    slug: "cite-des-histoires",
    title: "Cité des Histoires",
    description: "Entre dans le monde des récits et de l'imagination.",
    icon: "📖",
    color: "#FF5E83",
    position_x: 55,
    position_y: 70,
    required_xp: 900,
    missions: [
      ["Crée une histoire", "Invente et raconte ta propre histoire.", "STORY", 45, 8, "badge_histoire", 20],
      ["Livre de contes", "Crée un livre de contes africains.", "BOOK", 45, 8, undefined, 20],
      ["Dessin d'histoire", "Illustre ton histoire préférée.", "MAGIC_DRAWING", 35, 5, undefined, 15],
    ],
  },
  {
    slug: "temple-de-la-creativite",
    title: "Temple de la Créativité",
    description: "Le dernier défi : libère toute ta créativité.",
    icon: "⭐",
    color: "#C44AD8",
    position_x: 82,
    position_y: 78,
    required_xp: 1200,
    missions: [
      ["Masterclass créative", "Relève le grand défi de la créativité.", "CHALLENGE", 60, 10, "badge_creativite", 20],
      ["Portfolio créatif", "Réunis toutes tes créations dans un livre.", "BOOK", 50, 10, undefined, 25],
      ["Collection complète", "Débloque une collection dans ton monde.", "COLLECTION", 40, 8, undefined, 15],
    ],
  },
  {
    slug: "ile-des-missions",
    title: "Île des Missions",
    description: "Des missions secrètes t'attendent sur cette île.",
    icon: "🏝️",
    color: "#13C6A2",
    position_x: 20,
    position_y: 82,
    required_xp: 1500,
    missions: [
      ["Mission du jour", "Accomplis la mission spéciale du jour.", "MISSION", 50, 8, "badge_mission", 15],
      ["Défi hebdomadaire", "Termine le défi de la semaine.", "CHALLENGE", 60, 10, undefined, 20],
      ["Galerie finale", "Complète ta galerie de créations.", "COLLECTION", 50, 8, undefined, 20],
    ],
  },
]

export function buildMapRegions(): LearningRegion[] {
  return MAP_REGION_SEEDS.map((seed, index) => ({
    id: `region_${seed.slug}`,
    slug: seed.slug,
    title: seed.title,
    description: seed.description,
    icon: seed.icon,
    color: seed.color,
    position_x: seed.position_x,
    position_y: seed.position_y,
    required_xp: seed.required_xp,
    order_index: index + 1,
    is_active: true,
  }))
}

export function buildMapMissions(): LearningMission[] {
  const missions: LearningMission[] = []
  for (const seed of MAP_REGION_SEEDS) {
    const regionId = `region_${seed.slug}`
    seed.missions.forEach((m, index) => {
      const [title, description, type, xp, stars, badge, duration] = m
      missions.push({
        id: `${regionId}_m${index + 1}`,
        region_id: regionId,
        title,
        description,
        level: index + 1,
        order_index: index + 1,
        xp,
        stars,
        badge: badge ?? null,
        illustration: null,
        type,
        duration: duration ?? 10,
        difficulty: index >= 2 ? "intermediate" : "beginner",
        prerequisites: [],
      })
    })
  }
  return missions
}

export const MAP_REGIONS: LearningRegion[] = buildMapRegions()

export const MAP_MISSIONS: LearningMission[] = buildMapMissions()

export function getRegionById(id: string): LearningRegion | undefined {
  return MAP_REGIONS.find((r) => r.id === id)
}

export function getMissionById(id: string): LearningMission | undefined {
  return MAP_MISSIONS.find((m) => m.id === id)
}

// ---------------------------------------------------------------------------
// Quêtes quotidiennes (tournantes par jour de la semaine)
// ---------------------------------------------------------------------------

export const DAILY_MISSIONS: DailyMission[] = [
  { id: "daily_color", title: "Colorier", description: "Termine un coloriage aujourd'hui.", type: "COLORING", xp: 15, stars: 2, icon: "🎨", day_key: "monday", is_active: true },
  { id: "daily_draw", title: "Dessin magique", description: "Crée un dessin magique aujourd'hui.", type: "MAGIC_DRAWING", xp: 20, stars: 3, icon: "✨", day_key: "tuesday", is_active: true },
  { id: "daily_read", title: "Lire une histoire", description: "Lis ou écoute une histoire aujourd'hui.", type: "STORY", xp: 20, stars: 3, icon: "📖", day_key: "wednesday", is_active: true },
  { id: "daily_book", title: "Créer un livre", description: "Crée ou continue un livre aujourd'hui.", type: "BOOK", xp: 25, stars: 3, icon: "📚", day_key: "thursday", is_active: true },
  { id: "daily_game", title: "Jouer", description: "Joue à un jeu éducatif aujourd'hui.", type: "GAME", xp: 20, stars: 3, icon: "🎮", day_key: "friday", is_active: true },
  { id: "daily_challenge", title: "Relever un défi", description: "Relève un défi aujourd'hui.", type: "CHALLENGE", xp: 30, stars: 4, icon: "🏆", day_key: "saturday", is_active: true },
  { id: "daily_mission", title: "Mission spéciale", description: "Accomplis la mission spéciale du jour.", type: "MISSION", xp: 25, stars: 3, icon: "🎯", day_key: "sunday", is_active: true },
]

// ---------------------------------------------------------------------------
// Missions hebdomadaires
// ---------------------------------------------------------------------------

export const WEEKLY_MISSIONS: WeeklyMission[] = [
  { id: "weekly_colors", title: "5 coloriages", description: "Termine 5 coloriages cette semaine.", type: "COLORING", xp: 50, stars: 8, badge: "badge_semaine", icon: "🎨", week_offset: 0, is_active: true },
  { id: "weekly_stories", title: "3 histoires", description: "Crée ou écoute 3 histoires cette semaine.", type: "STORY", xp: 60, stars: 8, badge: null, icon: "📖", week_offset: 0, is_active: true },
  { id: "weekly_challenges", title: "3 défis", description: "Relève 3 défis cette semaine.", type: "CHALLENGE", xp: 70, stars: 10, badge: null, icon: "🏆", week_offset: 0, is_active: true },
]

export const SKILL_AXES: { key: keyof import("../types").SkillRadar; label: string; icon: string }[] = [
  { key: "creativity", label: "Créativité", icon: "🎨" },
  { key: "reading", label: "Lecture", icon: "📖" },
  { key: "observation", label: "Observation", icon: "🔍" },
  { key: "logic", label: "Logique", icon: "🧩" },
  { key: "perseverance", label: "Persévérance", icon: "💪" },
  { key: "imagination", label: "Imagination", icon: "💡" },
]

export function getDailyMissionForDay(dayKey: string): DailyMission {
  return DAILY_MISSIONS.find((d) => d.day_key === dayKey) ?? DAILY_MISSIONS[0]
}

export function getTodayDayKey(): string {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
  return days[new Date().getDay()]
}

export const LEVELS_SEED: { level: number; title: string; xp_required: number; reward_stars: number; icon: string }[] = [
  { level: 1, title: "Graine", xp_required: 0, reward_stars: 0, icon: "🌱" },
  { level: 2, title: "Pousse", xp_required: 150, reward_stars: 5, icon: "🌿" },
  { level: 3, title: "Jeune Baobab", xp_required: 400, reward_stars: 10, icon: "🌳" },
  { level: 4, title: "Grand Baobab", xp_required: 800, reward_stars: 15, icon: "🌳" },
  { level: 5, title: "Baobab Légendaire", xp_required: 1500, reward_stars: 25, icon: "🌟" },
]

export function getLevelForXp(totalXp: number): { level: number; title: string; xp_required: number; reward_stars: number; icon: string } {
  let current = LEVELS_SEED[0]
  for (const lvl of LEVELS_SEED) {
    if (totalXp >= lvl.xp_required) current = lvl
    else break
  }
  return current
}

export function getLevelProgress(totalXp: number): { level: number; title: string; xp: number; xpForNext: number; progress: number; icon: string } {
  const current = getLevelForXp(totalXp)
  const next = LEVELS_SEED.find((l) => l.level === current.level + 1)
  if (!next) {
    return { ...current, xp: totalXp, xpForNext: current.xp_required, progress: 100, icon: current.icon }
  }
  const span = next.xp_required - current.xp_required
  const done = Math.max(0, totalXp - current.xp_required)
  return {
    level: current.level,
    title: current.title,
    xp: totalXp,
    xpForNext: next.xp_required,
    progress: span > 0 ? Math.min(100, Math.round((done / span) * 100)) : 100,
    icon: current.icon,
  }
}

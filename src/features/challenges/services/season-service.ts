import type { SeasonEvent, SeasonMission, SeasonReward } from "../types"
import { SEASONS, MONTH_INDEX } from "../constants"
import type { GameEventType } from "../../gamification/types"

const SEASON_MISSION_TEMPLATES: Omit<SeasonMission, "id" | "reward">[] = [
  { title: "Créer 10 coloriages", description: "Colorie 10 dessins pendant la saison", icon: "🎨", event: "COLORING_COMPLETED", target: 10 },
  { title: "Créer 3 livres", description: "Crée 3 livres pendant la saison", icon: "📖", event: "BOOK_CREATED", target: 3 },
  { title: "Créer 2 dessins IA", description: "Crée 2 dessins magiques", icon: "✨", event: "MAGIC_DRAWING_CREATED", target: 2 },
  { title: "Jouer à 5 jeux", description: "Joue à 5 jeux pendant la saison", icon: "🎮", event: "GAME_COMPLETED", target: 5 },
  { title: "Réussir 3 quiz", description: "Réussis 3 quiz pendant la saison", icon: "🧠", event: "QUIZ_COMPLETED", target: 3 },
]

const SEASON_BADGES: Record<string, string[]> = {
  rentree: ["season_rentree"],
  "animaux-afrique": ["season_savane"],
  metiers: ["season_metiers"],
  noel: ["season_noel"],
  monde: ["season_monde"],
  emotions: ["season_emotions"],
  plantes: ["season_plantes"],
  oceans: ["season_oceans"],
  transports: ["season_transports"],
  vacances: ["season_vacances"],
}

const SEASON_REWARD_LEVELS = [1, 3, 5, 8, 10, 15, 20, 25, 30]

function slugForMonth(month: number): string {
  const index = MONTH_INDEX.indexOf(month)
  if (index === -1) return "vacances"
  return SEASONS[index].slug
}

export function getSeasonForDate(date = new Date()): SeasonEvent {
  const month = date.getMonth() + 1
  const slug = slugForMonth(month)
  const base = SEASONS.find((s) => s.slug === slug) ?? SEASONS[0]

  const start = new Date(date.getFullYear(), 0, 1)
  const end = new Date(date.getFullYear(), 11, 31, 23, 59, 59)

  const missions: SeasonMission[] = SEASON_MISSION_TEMPLATES.map((t, i) => ({
    ...t,
    id: `season_${slug}_${i}`,
    reward: { xp: (i + 1) * 100, stars: (i + 1) * 25 },
  }))

  return {
    id: `season_${slug}_${date.getFullYear()}`,
    name: base.name,
    slug,
    theme: base.theme,
    starts_at: start.toISOString(),
    ends_at: end.toISOString(),
    banner: base.banner,
    primary_color: base.primary_color,
    secondary_color: base.secondary_color,
    missions,
    badges: SEASON_BADGES[slug] ?? [],
    is_active: true,
  }
}

export function buildSeasonRewards(seasonId: string): SeasonReward[] {
  return SEASON_REWARD_LEVELS.map((level, i) => ({
    id: `season_reward_${seasonId}_${level}`,
    season_id: seasonId,
    level,
    reward_type: i % 3 === 0 ? "background" : i % 3 === 1 ? "sticker" : "stars",
    reward_key: `season_reward_${i}`,
    quantity: i % 3 === 2 ? 100 : 1,
  }))
}

export function getSeasonProgress(
  childId: string,
  season: SeasonEvent,
  xpTotal: number,
): { level: number; xpIntoLevel: number; xpToNext: number; progress: number } {
  const baseXp = 500
  const level = Math.min(Math.floor(xpTotal / baseXp) + 1, 30)
  const xpIntoLevel = xpTotal % baseXp
  return {
    level,
    xpIntoLevel,
    xpToNext: baseXp - xpIntoLevel,
    progress: Math.min(xpIntoLevel / baseXp, 1),
  }
}

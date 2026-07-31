import type {
  TreeStageDefinition,
  WorldObjectDefinition,
  AnimalDefinition,
  DecorationDefinition,
  SeasonDefinition,
  WeatherDefinition,
  TimeOfDayPalette,
} from "../types"
import type { GameEventType } from "../../gamification/types"

export const TREE_STAGES: TreeStageDefinition[] = [
  { stage: "seed", level: 1, name: "Graine", icon: "🌱", height: 0.25, description: "Une petite graine attend d'être arrosée." },
  { stage: "sprout", level: 2, name: "Jeune pousse", icon: "🌿", height: 0.4, description: "Ta pousse commence à grandir !" },
  { stage: "sapling", level: 3, name: "Petit arbre", icon: "🌳", height: 0.55, description: "Ton baobab devient un vrai arbre." },
  { stage: "mature", level: 4, name: "Arbre mature", icon: "🌳", height: 0.7, description: "Un bel arbre mature s'élève." },
  { stage: "grand", level: 5, name: "Grand Baobab", icon: "🌳✨", height: 0.82, description: "Le Grand Baobab majestueux." },
  { stage: "sacred", level: 6, name: "Baobab Sacré", icon: "🌳🏡", height: 0.92, description: "Le village s'est installé sous tes branches." },
  { stage: "legendary", level: 7, name: "Arbre Légendaire", icon: "🌳👑", height: 1, description: "Ton baobab est une légende vivante." },
]

export const STAGE_LEVELS = [1, 3, 6, 10, 15, 20, 30]

export function getTreeStageForTreeLevel(treeLevel: number): TreeStageDefinition {
  let stage = TREE_STAGES[0]
  for (let i = 0; i < STAGE_LEVELS.length; i++) {
    if (treeLevel >= STAGE_LEVELS[i]) {
      stage = TREE_STAGES[i]
    }
  }
  return stage
}

export const WORLD_OBJECTS: WorldObjectDefinition[] = [
  { type: "flowers", name: "Fleurs", icon: "🌸", unlockLevel: 1 },
  { type: "rock", name: "Pierre", icon: "🪨", unlockLevel: 1 },
  { type: "house", name: "Maison", icon: "🏠", unlockLevel: 2 },
  { type: "mushroom", name: "Champignon", icon: "🍄", unlockLevel: 2 },
  { type: "bench", name: "Banc", icon: "🪑", unlockLevel: 3 },
  { type: "bridge", name: "Pont", icon: "🌉", unlockLevel: 3 },
  { type: "river", name: "Rivière", icon: "🏞️", unlockLevel: 4 },
  { type: "lake", name: "Lac", icon: "💧", unlockLevel: 4 },
  { type: "drum", name: "Tambour", icon: "🥁", unlockLevel: 5 },
  { type: "totem", name: "Totem", icon: "🗿", unlockLevel: 5 },
  { type: "campfire", name: "Feu de camp", icon: "🔥", unlockLevel: 6 },
  { type: "playground", name: "Terrain de jeux", icon: "🎠", unlockLevel: 6 },
  { type: "school", name: "École", icon: "🏫", unlockLevel: 7 },
  { type: "library", name: "Bibliothèque", icon: "📚", unlockLevel: 7 },
  { type: "village", name: "Village", icon: "🏘️", unlockLevel: 8 },
]

export const ANIMALS: AnimalDefinition[] = [
  { type: "lion", name: "Lion", icon: "🦁", unlockLevel: 2 },
  { type: "giraffe", name: "Girafe", icon: "🦒", unlockLevel: 2, requiredBadge: "first_drawing" },
  { type: "zebra", name: "Zèbre", icon: "🦓", unlockLevel: 3 },
  { type: "monkey", name: "Singe", icon: "🐒", unlockLevel: 3 },
  { type: "elephant", name: "Éléphant", icon: "🐘", unlockLevel: 4 },
  { type: "gazelle", name: "Gazelle", icon: "🦌", unlockLevel: 4 },
  { type: "parrot", name: "Perroquet", icon: "🦜", unlockLevel: 5, requiredBadge: "bookworm" },
  { type: "hippo", name: "Hippopotame", icon: "🦛", unlockLevel: 6 },
  { type: "ostrich", name: "Autruche", icon: "🪶", unlockLevel: 6 },
  { type: "crocodile", name: "Crocodile", icon: "🐊", unlockLevel: 7 },
]

export const DECORATIONS: DecorationDefinition[] = [
  { type: "clouds", name: "Nuages", icon: "☁️", unlockLevel: 1 },
  { type: "stars", name: "Étoiles", icon: "⭐", unlockLevel: 1, nightOnly: true },
  { type: "butterflies", name: "Papillons", icon: "🦋", unlockLevel: 2 },
  { type: "rainbow", name: "Arc-en-ciel", icon: "🌈", unlockLevel: 3 },
  { type: "fireflies", name: "Lucioles", icon: "✨", unlockLevel: 3, nightOnly: true },
  { type: "rare_flowers", name: "Fleurs rares", icon: "🌺", unlockLevel: 4 },
  { type: "balloons", name: "Ballons", icon: "🎈", unlockLevel: 5 },
  { type: "lanterns", name: "Lanternes", icon: "🏮", unlockLevel: 6 },
  { type: "confetti", name: "Confettis", icon: "🎊", unlockLevel: 8 },
]

export const SEASONS: SeasonDefinition[] = [
  { season: "dry", name: "Saison sèche", icon: "🌞", months: [11, 12, 1, 2], skyTop: "#FFD89B", skyBottom: "#FFE9C7", ground: "#E8C87E", music: "dry", unlocks: ["clouds"] },
  { season: "rainy", name: "Saison des pluies", icon: "🌧️", months: [3, 4], skyTop: "#6B8CAE", skyBottom: "#B7CDD8", ground: "#7C9A5B", music: "rainy", unlocks: ["rainbow"] },
  { season: "spring", name: "Printemps", icon: "🌷", months: [5], skyTop: "#BDE3FF", skyBottom: "#EAF6FF", ground: "#8FBF5B", music: "spring", unlocks: ["butterflies", "rare_flowers"] },
  { season: "autumn", name: "Automne", icon: "🍂", months: [6, 7], skyTop: "#F4C17E", skyBottom: "#FFE3B3", ground: "#C8935B", music: "autumn", unlocks: ["balloons"] },
  { season: "school", name: "Rentrée scolaire", icon: "🎒", months: [8], skyTop: "#FFC97E", skyBottom: "#FFE9C7", ground: "#A9C86B", music: "school", unlocks: ["confetti"] },
  { season: "halloween", name: "Halloween", icon: "🎃", months: [9], skyTop: "#3B2A5B", skyBottom: "#7A5B8C", ground: "#5B4A3B", music: "halloween", unlocks: ["lanterns"] },
  { season: "christmas", name: "Noël", icon: "🎄", months: [10], skyTop: "#4A6B8C", skyBottom: "#B7CDE0", ground: "#E8E8F0", music: "christmas", unlocks: ["confetti"] },
  { season: "holidays", name: "Vacances", icon: "🏖️", months: [0], skyTop: "#7EC8FF", skyBottom: "#D6F0FF", ground: "#F2D18A", music: "holidays", unlocks: ["balloons"] },
]

export function getSeasonForMonth(month: number): SeasonDefinition {
  const found = SEASONS.find((s) => s.months.includes(month))
  return found ?? SEASONS[0]
}

export const WEATHER: WeatherDefinition[] = [
  { weather: "sunny", name: "Soleil", icon: "☀️", probability: 40 },
  { weather: "cloudy", name: "Nuages", icon: "☁️", probability: 25 },
  { weather: "rain", name: "Pluie", icon: "🌧️", probability: 15 },
  { weather: "windy", name: "Vent", icon: "🌬️", probability: 10 },
  { weather: "rainbow", name: "Arc-en-ciel", icon: "🌈", probability: 6 },
  { weather: "starry", name: "Étoiles", icon: "🌙", probability: 4 },
]

export const TIME_OF_DAY: TimeOfDayPalette[] = [
  { time: "morning", name: "Matin", hours: [6, 7, 8, 9, 10, 11], sunIntensity: 1, skyDarken: 0, starOpacity: 0 },
  { time: "afternoon", name: "Après-midi", hours: [12, 13, 14, 15, 16, 17], sunIntensity: 0.85, skyDarken: 0, starOpacity: 0 },
  { time: "evening", name: "Soir", hours: [18, 19, 20], sunIntensity: 0.5, skyDarken: 0.2, starOpacity: 0.4 },
  { time: "night", name: "Nuit", hours: [21, 22, 23, 0, 1, 2, 3, 4, 5], sunIntensity: 0.15, skyDarken: 0.55, starOpacity: 1 },
]

export function getTimeOfDay(date = new Date()): TimeOfDayPalette {
  const hour = date.getHours()
  const found = TIME_OF_DAY.find((t) => t.hours.includes(hour))
  return found ?? TIME_OF_DAY[0]
}

export const GROWTH_PER_EVENT: Partial<Record<GameEventType, number>> = {
  DRAWING_CREATED: 1,
  DRAWING_COMPLETED: 2,
  COLORING_COMPLETED: 2,
  MAGIC_DRAWING_CREATED: 3,
  BOOK_CREATED: 3,
  BOOK_PRINTED: 1,
  STORY_CREATED: 1,
  GAME_COMPLETED: 1.5,
  QUIZ_COMPLETED: 2,
  LOGIN: 0.5,
  DAILY_LOGIN: 1,
  STREAK_DAY: 2,
  CHALLENGE_COMPLETED: 4,
}

export const TREE_LEVEL_MAX = 30
export const TREE_LEVEL_STEP = 100

export const MEMORY_EVENTS: Record<string, { label: string; icon: string }> = {
  world_created: { label: "Mon monde est né", icon: "🌍" },
  first_coloring: { label: "Premier coloriage", icon: "🎨" },
  first_book: { label: "Premier livre", icon: "📖" },
  first_badge: { label: "Premier badge", icon: "🏅" },
  first_animal: { label: "Premier animal", icon: "🦁" },
  tree_level_5: { label: "Grand Baobab", icon: "🌳✨" },
  tree_mature: { label: "Arbre mature", icon: "🌳" },
  tree_sacred: { label: "Baobab Sacré", icon: "🌳🏡" },
  tree_legendary: { label: "Arbre Légendaire", icon: "🌳👑" },
  season_change: { label: "Changement de saison", icon: "🍂" },
}

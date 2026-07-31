export type TreeStage = "seed" | "sprout" | "sapling" | "mature" | "grand" | "sacred" | "legendary"

export type WorldSeason = "dry" | "rainy" | "spring" | "autumn" | "christmas" | "halloween" | "school" | "holidays"

export type WorldWeather = "sunny" | "cloudy" | "rain" | "rainbow" | "windy" | "starry"

export type WorldTimeOfDay = "morning" | "afternoon" | "evening" | "night"

export type WorldObjectType = "house" | "bridge" | "flowers" | "rock" | "lake" | "river" | "mushroom" | "bench" | "totem" | "drum" | "village" | "campfire" | "library" | "school" | "playground"

export type AnimalType = "lion" | "elephant" | "giraffe" | "zebra" | "monkey" | "parrot" | "hippo" | "crocodile" | "gazelle" | "ostrich"

export type DecorationType = "lanterns" | "butterflies" | "clouds" | "rainbow" | "stars" | "fireflies" | "balloons" | "confetti" | "rare_flowers"

export interface TreeStageDefinition {
  stage: TreeStage
  level: number
  name: string
  icon: string
  height: number
  description: string
}

export interface WorldObjectDefinition {
  type: WorldObjectType
  name: string
  icon: string
  unlockLevel: number
  position?: { x: number; y: number }
  scale?: number
}

export interface AnimalDefinition {
  type: AnimalType
  name: string
  icon: string
  unlockLevel: number
  requiredBadge?: string
}

export interface DecorationDefinition {
  type: DecorationType
  name: string
  icon: string
  unlockLevel: number
  nightOnly?: boolean
}

export interface SeasonDefinition {
  season: WorldSeason
  name: string
  icon: string
  months: number[]
  skyTop: string
  skyBottom: string
  ground: string
  music: string
  unlocks: DecorationType[]
}

export interface WeatherDefinition {
  weather: WorldWeather
  name: string
  icon: string
  probability: number
}

export interface TimeOfDayPalette {
  time: WorldTimeOfDay
  name: string
  hours: number[]
  sunIntensity: number
  skyDarken: number
  starOpacity: number
}

export interface WorldObject {
  id: string
  child_id: string
  object_type: WorldObjectType | AnimalType | DecorationType
  object_key: string
  position_x: number
  position_y: number
  rotation: number
  scale: number
  is_unlocked: boolean
  created_at: string
}

export interface ChildWorld {
  id: string
  child_id: string
  tree_level: number
  world_level: number
  background_theme: string
  weather: WorldWeather
  season: WorldSeason
  last_growth_at: string | null
  created_at: string
  updated_at: string
}

export interface WorldHistoryEntry {
  id: string
  child_id: string
  event: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface WorldGrowthResult {
  previousTreeLevel: number
  newTreeLevel: number
  stageUp: boolean
  newStage: TreeStage
  growthAmount: number
  growthToNext: number
  unlocks: WorldObjectDefinition[]
  memories: WorldHistoryEntry[]
}

export interface WorldState {
  childId: string | null
  world: ChildWorld | null
  treeStage: TreeStage
  objects: WorldObject[]
  history: WorldHistoryEntry[]
  timeOfDay: WorldTimeOfDay
  loading: boolean
  initialized: boolean
  capture: string | null
}

export interface CaptureData {
  image: string
  caption: string
  createdAt: string
}

export interface WorldEventPayload {
  childId: string
  metadata?: Record<string, unknown>
}

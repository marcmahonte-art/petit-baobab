import type { GameEventType } from "../../gamification/types"
import type {
  ChildWorld,
  WorldGrowthResult,
  WorldHistoryEntry,
  WorldObject,
  WorldObjectDefinition,
  WorldSeason,
  WorldWeather,
  AnimalType,
  DecorationType,
  WorldObjectType,
} from "../types"
import {
  ANIMALS,
  DECORATIONS,
  GROWTH_PER_EVENT,
  MEMORY_EVENTS,
  STAGE_LEVELS,
  TREE_LEVEL_MAX,
  TREE_LEVEL_STEP,
  TREE_STAGES,
  WORLD_OBJECTS,
  getTreeStageForTreeLevel,
} from "../constants"

type Supabase = ReturnType<typeof import("@/lib/supabase-client").getSupabaseClient>

const ANIMAL_EVENT_MAP: Partial<Record<AnimalType, GameEventType>> = {
  lion: "DRAWING_COMPLETED",
  giraffe: "BOOK_CREATED",
  zebra: "GAME_COMPLETED",
  monkey: "QUIZ_COMPLETED",
  elephant: "COLORING_COMPLETED",
  gazelle: "STORY_CREATED",
  parrot: "MAGIC_DRAWING_CREATED",
  hippo: "DAILY_LOGIN",
  ostrich: "STREAK_DAY",
  crocodile: "CHALLENGE_COMPLETED",
}

const DECORATION_EVENT_MAP: Partial<Record<DecorationType, GameEventType>> = {
  clouds: "LOGIN",
  stars: "LOGIN",
  butterflies: "DRAWING_COMPLETED",
  rainbow: "BOOK_CREATED",
  fireflies: "GAME_COMPLETED",
  rare_flowers: "MAGIC_DRAWING_CREATED",
  balloons: "QUIZ_COMPLETED",
  lanterns: "STORY_CREATED",
  confetti: "CHALLENGE_COMPLETED",
}

export class WorldEngine {
  private historyBuffer: WorldHistoryEntry[] = []

  generateWorld(childId: string): ChildWorld {
    const now = new Date().toISOString()
    return {
      id: `world_${childId}`,
      child_id: childId,
      tree_level: 1,
      world_level: 1,
      background_theme: "savane",
      weather: "sunny",
      season: "dry",
      last_growth_at: null,
      created_at: now,
      updated_at: now,
    }
  }

  calculateGrowth(event: GameEventType): number {
    return GROWTH_PER_EVENT[event] ?? 0
  }

  async growTree(
    childId: string,
    event: GameEventType,
    world: ChildWorld | null,
    objects: WorldObject[],
    growthPool: number = 0,
  ): Promise<WorldGrowthResult> {
    const current = world ?? this.generateWorld(childId)
    const amount = this.calculateGrowth(event)
    const previousLevel = current.tree_level

    const pool = growthPool + amount * 10
    const levelDelta = Math.floor(pool / TREE_LEVEL_STEP)
    const treeLevel = Math.min(previousLevel + Math.max(levelDelta, 0), TREE_LEVEL_MAX)

    const previousStage = getTreeStageForTreeLevel(previousLevel)
    const newStage = getTreeStageForTreeLevel(treeLevel)
    const stageUp = treeLevel > previousLevel && newStage.stage !== previousStage.stage

    const unlocks: WorldObjectDefinition[] = []
    if (treeLevel > previousLevel) {
      for (let lvl = previousLevel + 1; lvl <= treeLevel; lvl++) {
        for (const obj of WORLD_OBJECTS) {
          if (obj.unlockLevel === lvl && !objects.some((o) => o.object_type === obj.type)) {
            unlocks.push(obj)
          }
        }
      }
    }

    const memories: WorldHistoryEntry[] = []
    if (treeLevel === STAGE_LEVELS[3]) {
      memories.push(this.createMemory(childId, "tree_mature", { treeLevel }))
    }
    if (treeLevel === STAGE_LEVELS[4]) {
      memories.push(this.createMemory(childId, "tree_level_5", { treeLevel }))
    }
    if (treeLevel === STAGE_LEVELS[5]) {
      memories.push(this.createMemory(childId, "tree_sacred", { treeLevel }))
    }
    if (treeLevel === STAGE_LEVELS[6]) {
      memories.push(this.createMemory(childId, "tree_legendary", { treeLevel }))
    }

    this.historyBuffer.push(...memories)

    return {
      previousTreeLevel: previousLevel,
      newTreeLevel: treeLevel,
      stageUp,
      newStage: newStage.stage,
      growthAmount: amount,
      growthToNext: TREE_LEVEL_STEP,
      unlocks,
      memories,
    }
  }

  async unlockObject(childId: string, type: WorldObjectType | AnimalType | DecorationType, objects: WorldObject[]): Promise<WorldObject | null> {
    const existing = objects.find((o) => o.object_type === type)
    if (existing?.is_unlocked) return existing

    const obj: WorldObject = {
      id: `obj_${childId}_${type}`,
      child_id: childId,
      object_type: type,
      object_key: `${type}_1`,
      position_x: 20 + Math.random() * 60,
      position_y: 40 + Math.random() * 40,
      rotation: Math.random() * 10 - 5,
      scale: 0.7 + Math.random() * 0.6,
      is_unlocked: true,
      created_at: new Date().toISOString(),
    }
    return obj
  }

  async unlockAnimal(childId: string, type: AnimalType, world: ChildWorld | null): Promise<WorldObject | null> {
    const definition = ANIMALS.find((a) => a.type === type)
    if (!definition) return null
    if ((world?.tree_level ?? 1) < definition.unlockLevel) return null

    return this.unlockObject(childId, type, [])
  }

  async unlockDecoration(childId: string, type: DecorationType, world: ChildWorld | null): Promise<WorldObject | null> {
    const definition = DECORATIONS.find((d) => d.type === type)
    if (!definition) return null
    if ((world?.tree_level ?? 1) < definition.unlockLevel) return null

    return this.unlockObject(childId, type, [])
  }

  async changeSeason(childId: string, season: WorldSeason, world: ChildWorld | null): Promise<ChildWorld> {
    const current = world ?? this.generateWorld(childId)
    const next: ChildWorld = { ...current, season, updated_at: new Date().toISOString() }
    this.historyBuffer.push(this.createMemory(childId, "season_change", { season }))
    return next
  }

  async changeWeather(childId: string, weather: WorldWeather, world: ChildWorld | null): Promise<ChildWorld> {
    const current = world ?? this.generateWorld(childId)
    return { ...current, weather, updated_at: new Date().toISOString() }
  }

  generateWeather(): WorldWeather {
    const weights: Record<WorldWeather, number> = {
      sunny: 40,
      cloudy: 25,
      rain: 15,
      windy: 10,
      rainbow: 6,
      starry: 4,
    }
    const total = Object.values(weights).reduce((a, b) => a + b, 0)
    let roll = Math.random() * total
    for (const [weather, weight] of Object.entries(weights)) {
      roll -= weight
      if (roll <= 0) return weather as WorldWeather
    }
    return "sunny"
  }

  private createMemory(childId: string, event: string, metadata: Record<string, unknown>): WorldHistoryEntry {
    const memory = MEMORY_EVENTS[event]
    return {
      id: `mem_${childId}_${event}_${Date.now()}`,
      child_id: childId,
      event,
      metadata: { ...metadata, label: memory?.label ?? event, icon: memory?.icon ?? "📌" },
      created_at: new Date().toISOString(),
    }
  }

  createMemoryPublic(childId: string, event: string, metadata: Record<string, unknown>): WorldHistoryEntry {
    return this.createMemory(childId, event, metadata)
  }

  getStage(level: number) {
    return getTreeStageForTreeLevel(level)
  }

  getObjectDefinition(type: WorldObjectType | AnimalType | DecorationType): WorldObjectDefinition {
    return WORLD_OBJECTS.find((o) => o.type === type) ?? { type: type as WorldObjectType, name: type, icon: "❔", unlockLevel: 1 }
  }

  getAllObjects(childId: string, objects: WorldObject[]): WorldObject[] {
    const all: WorldObject[] = [...objects]
    for (const def of WORLD_OBJECTS) {
      if (!all.some((o) => o.object_type === def.type)) {
        all.push(this.stubObject(childId, def.type))
      }
    }
    for (const def of ANIMALS) {
      if (!all.some((o) => o.object_type === def.type)) {
        all.push(this.stubObject(childId, def.type))
      }
    }
    for (const def of DECORATIONS) {
      if (!all.some((o) => o.object_type === def.type)) {
        all.push(this.stubObject(childId, def.type))
      }
    }
    return all
  }

  getEligibleAnimal(event: GameEventType): AnimalType | null {
    for (const [type, evt] of Object.entries(ANIMAL_EVENT_MAP)) {
      if (evt === event) return type as AnimalType
    }
    return null
  }

  getEligibleDecoration(event: GameEventType): DecorationType | null {
    for (const [type, evt] of Object.entries(DECORATION_EVENT_MAP)) {
      if (evt === event) return type as DecorationType
    }
    return null
  }

  private stubObject(childId: string, type: WorldObjectType | AnimalType | DecorationType): WorldObject {
    return {
      id: `stub_${childId}_${type}`,
      child_id: childId,
      object_type: type,
      object_key: `${type}_0`,
      position_x: 0,
      position_y: 0,
      rotation: 0,
      scale: 0,
      is_unlocked: false,
      created_at: new Date().toISOString(),
    }
  }

  getNextGrowthTarget(treeLevel: number): { level: number; name: string; icon: string } | null {
    for (let i = 0; i < TREE_STAGES.length; i++) {
      const threshold = STAGE_LEVELS[i]
      if (treeLevel < threshold) {
        return { level: threshold, name: TREE_STAGES[i].name, icon: TREE_STAGES[i].icon }
      }
    }
    return null
  }
}

export const worldEngine = new WorldEngine()

export async function persistWorld(supabase: Supabase, childId: string, world: ChildWorld): Promise<void> {
  await supabase.from("child_world").upsert({
    child_id: childId,
    tree_level: world.tree_level,
    world_level: world.world_level,
    background_theme: world.background_theme,
    weather: world.weather,
    season: world.season,
    last_growth_at: world.last_growth_at,
    updated_at: new Date().toISOString(),
  }, { onConflict: "child_id" })
}

export async function persistObjects(supabase: Supabase, childId: string, objects: WorldObject[]): Promise<void> {
  for (const obj of objects) {
    if (!obj.is_unlocked || obj.id.startsWith("stub_")) continue
    await supabase.from("world_objects").upsert({
      child_id: childId,
      object_type: obj.object_type,
      object_key: obj.object_key,
      position_x: obj.position_x,
      position_y: obj.position_y,
      rotation: obj.rotation,
      scale: obj.scale,
      is_unlocked: true,
    }, { onConflict: "child_id,object_type" })
  }
}

export async function persistHistory(supabase: Supabase, childId: string, entries: WorldHistoryEntry[]): Promise<void> {
  if (entries.length === 0) return
  const rows = entries.map((e) => ({
    child_id: childId,
    event: e.event,
    metadata: e.metadata,
  }))
  await supabase.from("world_history").insert(rows)
}

export async function loadWorld(supabase: Supabase, childId: string): Promise<ChildWorld | null> {
  const { data } = await supabase.from("child_world").select("*").eq("child_id", childId).maybeSingle()
  if (!data) return null
  const row = data as Record<string, unknown>
  return {
    id: String(row.id),
    child_id: String(row.child_id),
    tree_level: Number(row.tree_level),
    world_level: Number(row.world_level),
    background_theme: String(row.background_theme),
    weather: row.weather as WorldWeather,
    season: row.season as WorldSeason,
    last_growth_at: row.last_growth_at ? String(row.last_growth_at) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  }
}

export async function loadObjects(supabase: Supabase, childId: string): Promise<WorldObject[]> {
  const { data } = await supabase.from("world_objects").select("*").eq("child_id", childId)
  return (data ?? []).map((row) => ({
    id: String(row.id),
    child_id: childId,
    object_type: row.object_type as WorldObject["object_type"],
    object_key: String(row.object_key),
    position_x: Number(row.position_x),
    position_y: Number(row.position_y),
    rotation: Number(row.rotation),
    scale: Number(row.scale),
    is_unlocked: Boolean(row.is_unlocked),
    created_at: String(row.created_at),
  }))
}

export async function loadHistory(supabase: Supabase, childId: string, limit = 100): Promise<WorldHistoryEntry[]> {
  const { data } = await supabase.from("world_history").select("*").eq("child_id", childId).order("created_at", { ascending: false }).limit(limit)
  return (data ?? []).map((row) => ({
    id: String(row.id),
    child_id: childId,
    event: String(row.event),
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
    created_at: String(row.created_at),
  }))
}

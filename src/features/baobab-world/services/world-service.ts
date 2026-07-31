import type { GameEventType } from "../../gamification/types"
import { eventBus, emitGameEvent } from "../../gamification/event-bus"
import { worldEngine } from "../world/engine"
import { useWorldStore } from "../store/world-store"
import { getSupabaseClient } from "@/lib/supabase-client"
import type { ChildWorld, WorldHistoryEntry, WorldObject } from "../types"

type Supabase = ReturnType<typeof getSupabaseClient>

export class WorldService {
  private childId: string | null = null
  private cleanup: (() => void) | null = null
  private initialized = false
  private growthPool = 0

  async init(childId: string): Promise<void> {
    this.childId = childId
    const store = useWorldStore.getState()
    store.set({ childId, loading: true })

    try {
      const supabase = getSupabaseClient()
      const [world, objects, history] = await Promise.all([
        this.loadOrCreateWorld(supabase, childId),
        this.loadObjects(supabase, childId),
        this.loadHistory(supabase, childId),
      ])

      store.set({
        world,
        objects,
        history,
        treeStage: worldEngine.getStage(world.tree_level).stage,
        loading: false,
        initialized: true,
      })
    } catch {
      const world = worldEngine.generateWorld(childId)
      store.set({
        world,
        objects: [],
        history: [],
        treeStage: "seed",
        loading: false,
        initialized: true,
      })
    }

    if (!this.initialized) {
      this.cleanup = eventBus.onAny((payload) => {
        if (payload.childId === this.childId) {
          void this.handleEvent(payload.type)
        }
      })
      this.initialized = true
    }
  }

  dispose(): void {
    this.cleanup?.()
    this.initialized = false
  }

  private async loadOrCreateWorld(supabase: Supabase, childId: string): Promise<ChildWorld> {
    const { data } = await supabase.from("child_world").select("*").eq("child_id", childId).maybeSingle()
    if (data) return data as ChildWorld
    const world = worldEngine.generateWorld(childId)
    await supabase.from("child_world").insert({
      child_id: childId,
      tree_level: world.tree_level,
      world_level: world.world_level,
      background_theme: world.background_theme,
      weather: world.weather,
      season: world.season,
    })
    return world
  }

  private async loadObjects(supabase: Supabase, childId: string): Promise<WorldObject[]> {
    const { data } = await supabase.from("world_objects").select("*").eq("child_id", childId)
    return (data ?? []) as WorldObject[]
  }

  private async loadHistory(supabase: Supabase, childId: string): Promise<WorldHistoryEntry[]> {
    const { data } = await supabase
      .from("world_history")
      .select("*")
      .eq("child_id", childId)
      .order("created_at", { ascending: false })
      .limit(200)
    return (data ?? []) as WorldHistoryEntry[]
  }

  async handleEvent(event: GameEventType): Promise<void> {
    const childId = this.childId
    if (!childId) return
    const store = useWorldStore.getState()
    const world = store.world
    const objects = store.objects
    if (!world) return

    const growth = worldEngine.calculateGrowth(event)
    if (growth <= 0) return

    this.growthPool += growth * 10
    const result = await worldEngine.growTree(childId, event, world, objects, this.growthPool)

    const nextWorld: ChildWorld = {
      ...world,
      tree_level: result.newTreeLevel,
      last_growth_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const allObjects = [...objects]
    const newObjects: WorldObject[] = []
    for (const unlock of result.unlocks) {
      const obj = await worldEngine.unlockObject(childId, unlock.type, allObjects)
      if (obj) {
        allObjects.push(obj)
        newObjects.push(obj)
      }
    }

    const eligibleAnimal = worldEngine.getEligibleAnimal(event)
    if (eligibleAnimal) {
      const animal = await worldEngine.unlockAnimal(childId, eligibleAnimal, nextWorld)
      if (animal && !allObjects.some((o) => o.object_type === animal.object_type)) {
        allObjects.push(animal)
        newObjects.push(animal)
      }
    }

    const eligibleDecoration = worldEngine.getEligibleDecoration(event)
    if (eligibleDecoration) {
      const decoration = await worldEngine.unlockDecoration(childId, eligibleDecoration, nextWorld)
      if (decoration && !allObjects.some((o) => o.object_type === decoration.object_type)) {
        allObjects.push(decoration)
        newObjects.push(decoration)
      }
    }

    store.set({
      world: nextWorld,
      objects: allObjects,
      treeStage: result.newStage,
    })

    if (result.stageUp) {
      store.showStageUp(result.previousTreeLevel, result.newTreeLevel, result.newStage)
    }

    if (newObjects.length > 0) {
      store.showUnlock(newObjects)
      await emitGameEvent("WORLD_OBJECT_UNLOCKED", {
        childId,
        metadata: {
          objects: newObjects.map((o) => ({ type: o.object_type, key: o.object_key })),
        },
      })
    }

    if (result.memories.length > 0) {
      const newHistory = [...result.memories, ...store.history]
      store.set({ history: newHistory })
      await emitGameEvent("WORLD_MEMORY_CREATED", {
        childId,
        metadata: { events: result.memories.map((m) => m.event) },
      })
    }

    const supabase = getSupabaseClient()
    try {
      await supabase.from("child_world").upsert({
        child_id: childId,
        tree_level: nextWorld.tree_level,
        world_level: nextWorld.world_level,
        background_theme: nextWorld.background_theme,
        weather: nextWorld.weather,
        season: nextWorld.season,
        last_growth_at: nextWorld.last_growth_at,
        updated_at: nextWorld.updated_at,
      }, { onConflict: "child_id" })

      if (newObjects.length > 0) {
        await supabase.from("world_objects").insert(
          newObjects.map((o) => ({
            child_id: childId,
            object_type: o.object_type,
            object_key: o.object_key,
            position_x: o.position_x,
            position_y: o.position_y,
            rotation: o.rotation,
            scale: o.scale,
            is_unlocked: true,
          })),
        )
      }

      if (result.memories.length > 0) {
        await supabase.from("world_history").insert(
          result.memories.map((m) => ({
            child_id: childId,
            event: m.event,
            metadata: m.metadata,
          })),
        )
      }
    } catch {
      // Offline: Zustand state is the source of truth (optimistic).
    }
  }

  async createMemory(event: string, metadata: Record<string, unknown>): Promise<void> {
    const childId = this.childId
    if (!childId) return
    const store = useWorldStore.getState()
    const entry = await worldEngine.createMemoryPublic(childId, event, metadata)
    store.set({ history: [entry, ...store.history] })
    const supabase = getSupabaseClient()
    try {
      await supabase.from("world_history").insert({
        child_id: childId,
        event: entry.event,
        metadata: entry.metadata,
      })
    } catch {
      // Offline
    }
    await emitGameEvent("WORLD_MEMORY_CREATED", {
      childId,
      metadata: { events: [event] },
    })
  }

  async recordCapture(capture: { image: string; caption: string }): Promise<void> {
    const store = useWorldStore.getState()
    store.set({ capture: capture.image })
  }
}

export const worldService = new WorldService()

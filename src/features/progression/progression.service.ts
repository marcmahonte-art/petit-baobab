import { eventBus } from "../gamification/event-bus"
import { streakEngine } from "../gamification/streak-engine"
import type { GameEventType, EventPayload } from "../gamification/types"
import { xpEngine } from "./xp-engine"
import { levelEngine } from "./level-engine"
import { unlockEngine } from "./unlock-engine"
import { rewardsEngine } from "./rewards-engine"
import { useProgressionStore } from "./progression-store"
import { getSupabaseClient } from "@/lib/supabase-client"
import { DEFAULT_THEME, DEFAULT_AVATAR_FRAME, getTitleForLevel } from "./progression.constants"
import type {
  ChildProgression,
  ChildUnlock,
  ChildInventory,
  ProgressionResult,
  UnlockReward,
} from "./progression.types"

type Supabase = ReturnType<typeof getSupabaseClient>

class ProgressionService {
  private initialized = false
  private childId: string | null = null
  private plan: "free" | "decouverte" | "super-baobab" | "ecole-pro" = "free"
  private cleanup: (() => void) | null = null

  async init(childId: string, plan: "free" | "decouverte" | "super-baobab" | "ecole-pro" = "free"): Promise<void> {
    this.childId = childId
    this.plan = plan
    const store = useProgressionStore.getState()

    store.set({ childId, loading: true })

    try {
      const supabase = getSupabaseClient()
      await this.loadFromSupabase(supabase)
    } catch {
      await this.loadDefaults()
    }

    if (!this.initialized) {
      this.cleanup = eventBus.onAny((payload) => {
        if (payload.childId === this.childId) {
          void this.handleEvent(payload.type, payload)
        }
      })
      this.initialized = true
    }

    store.set({ loading: false })
  }

  dispose(): void {
    this.cleanup?.()
    this.initialized = false
  }

  async resetDailyFirstActivity(): Promise<void> {
    xpEngine.markFirstActivityOfDay("", "")
  }

  private async loadFromSupabase(supabase: Supabase): Promise<void> {
    const childId = this.childId!
    const store = useProgressionStore.getState()

    const [progressionResult, unlocksResult, inventoryResult] = await Promise.all([
      supabase.from("child_progression").select("*").eq("child_id", childId).maybeSingle(),
      supabase.from("child_unlocks").select("*").eq("child_id", childId),
      supabase.from("child_inventory").select("*").eq("child_id", childId),
    ])

    if (progressionResult.error) throw progressionResult.error

    if (progressionResult.data) {
      const prog = progressionResult.data as ChildProgression
      const title = getTitleForLevel(prog.level)
      store.set({
        level: prog.level,
        xp: prog.xp,
        xpTotal: prog.xp_total,
        currentTitle: title.title,
        avatarFrame: prog.avatar_frame ?? DEFAULT_AVATAR_FRAME,
        currentTheme: prog.current_theme ?? DEFAULT_THEME,
      })
    } else {
      await this.createDefaultProgression(supabase)
    }

    store.setUnlocks((unlocksResult.data as ChildUnlock[]) ?? [])
    store.setInventory((inventoryResult.data as ChildInventory[]) ?? [])
  }

  private async createDefaultProgression(supabase: Supabase): Promise<void> {
    const childId = this.childId!
    const store = useProgressionStore.getState()

    const { data, error } = await supabase
      .from("child_progression")
      .insert({
        child_id: childId,
        level: 1,
        xp: 0,
        xp_total: 0,
        current_title: getTitleForLevel(1).title,
        avatar_frame: DEFAULT_AVATAR_FRAME,
        current_theme: DEFAULT_THEME,
      })
      .select()
      .single()

    if (error) throw error

    const defaultUnlocks = unlockEngine.buildUnlockRecords(childId, [
      { type: "brush", key: "brush_classic", label: "Pinceau Classique", icon: "🖌️", description: "" },
      { type: "mascot", key: "mascot_bobo", label: "Bobo le Lion", icon: "🦁", description: "" },
      { type: "frame", key: "frame_classic", label: "Cadre Classique", icon: "🖼️", description: "" },
    ], "initial")

    const defaultInventory = unlockEngine.buildInventory(childId)

    await Promise.all([
      supabase.from("child_unlocks").insert(defaultUnlocks),
      supabase.from("child_inventory").insert(defaultInventory),
    ])

    store.setUnlocks(defaultUnlocks)
    store.setInventory(defaultInventory)

    const prog = data as ChildProgression
    store.set({
      level: prog.level,
      xp: prog.xp,
      xpTotal: prog.xp_total,
      currentTitle: getTitleForLevel(prog.level).title,
      avatarFrame: prog.avatar_frame,
      currentTheme: prog.current_theme,
    })
  }

  private async loadDefaults(): Promise<void> {
    const store = useProgressionStore.getState()
    const childId = this.childId!
    const defaultUnlocks = unlockEngine.buildUnlockRecords(childId, [], "offline")
    const defaultInventory = unlockEngine.buildInventory(childId)
    store.setUnlocks(defaultUnlocks)
    store.setInventory(defaultInventory)
    store.set({ level: 1, xp: 0, xpTotal: 0, currentTitle: getTitleForLevel(1).title })
  }

  async handleEvent(event: GameEventType, payload: EventPayload): Promise<ProgressionResult> {
    const childId = this.childId
    if (!childId) throw new Error("ProgressionService not initialized. Call init() first.")

    const store = useProgressionStore.getState()
    const currentLevel = store.state.level
    const currentXp = store.state.xp

    const streakDays = streakEngine.get(childId).currentStreak

    const xpResult = xpEngine.compute(childId, event, streakDays)
    if (xpResult.xp === 0) {
      return {
        previousLevel: currentLevel,
        newLevel: currentLevel,
        levelUp: false,
        xp: currentXp,
        xpAdded: 0,
        xpToNextLevel: 0,
        previousTitle: store.state.currentTitle,
        newTitle: store.state.currentTitle,
        newUnlocks: [],
        notifications: [],
      }
    }

    const levelResult = levelEngine.addXp(currentLevel, currentXp, xpResult.xp)
    const newXpTotal = store.state.xpTotal + xpResult.xp

    const previousTitle = store.state.currentTitle
    const newTitle = getTitleForLevel(levelResult.newLevel).title

    let newUnlocks: UnlockReward[] = []
    if (levelResult.levelUp) {
      const rewards = rewardsEngine.collectRewards(currentLevel, levelResult.newLevel, store.state.inventory)
      newUnlocks = rewards.unlocks
      store.setInventory(rewards.inventory)
    }

    store.set({
      level: levelResult.newLevel,
      xp: levelResult.newXp,
      xpTotal: newXpTotal,
      currentTitle: newTitle,
    })

    this.persist(store.state.childId ?? childId, {
      level: levelResult.newLevel,
      xp: levelResult.newXp,
      xpTotal: newXpTotal,
      currentTitle: newTitle,
    }, newUnlocks)

    const notifications: { title: string; description: string }[] = [
      ...xpResult.bonuses.map((b) => ({ title: b.label, description: `+${b.xp} XP` })),
      ...newUnlocks.map((u) => ({ title: `Nouveau déblocage : ${u.label}`, description: u.description })),
    ]

    if (levelResult.levelUp) {
      notifications.unshift({
        title: `Niveau ${levelResult.newLevel} atteint !`,
        description: `Tu es maintenant : ${newTitle}`,
      })

      store.showLevelUp(currentLevel, levelResult.newLevel, newTitle, newUnlocks)
    }

    return {
      previousLevel: currentLevel,
      newLevel: levelResult.newLevel,
      levelUp: levelResult.levelUp,
      xp: levelResult.newXp,
      xpAdded: xpResult.xp,
      xpToNextLevel: levelEngine.getProgress(newXpTotal).xpToNext,
      previousTitle,
      newTitle,
      newUnlocks,
      notifications,
    }
  }

  private async persist(
    childId: string,
    data: { level: number; xp: number; xpTotal: number; currentTitle: string },
    newUnlocks: UnlockReward[],
  ): Promise<void> {
    try {
      const supabase = getSupabaseClient()

      await supabase
        .from("child_progression")
        .upsert({
          child_id: childId,
          level: data.level,
          xp: data.xp,
          xp_total: data.xpTotal,
          current_title: data.currentTitle,
          updated_at: new Date().toISOString(),
        })

      if (newUnlocks.length > 0) {
        const unlockRecords = unlockEngine.buildUnlockRecords(childId, newUnlocks, "level_up")
        await supabase.from("child_unlocks").insert(unlockRecords)

        const inventoryItems = unlockEngine.addUnlocksToInventory([], newUnlocks).map((item) => ({
          child_id: childId,
          item_type: item.item_type,
          item_key: item.item_key,
          quantity: item.quantity,
        }))
        await supabase.from("child_inventory").insert(inventoryItems)
      }
    } catch {
      // Offline: progression state is already updated in Zustand (optimistic).
    }
  }

  isItemUnlocked(itemType: string, itemKey: string): boolean {
    const { inventory, unlocks } = useProgressionStore.getState().state
    return unlockEngine.isUnlocked(inventory, unlocks, itemType as never, itemKey)
  }
}

export const progressionService = new ProgressionService()

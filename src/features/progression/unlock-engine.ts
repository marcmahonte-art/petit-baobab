import { getUnlocksForLevel, DEFAULT_UNLOCKS, DEFAULT_INVENTORY } from "./progression.constants"
import type { ChildUnlock, ChildInventory, ItemType, UnlockReward, UnlockType } from "./progression.types"

export class UnlockEngine {
  computeUnlocksForLevelUp(previousLevel: number, newLevel: number): UnlockReward[] {
    const unlocks: UnlockReward[] = []
    for (let l = previousLevel + 1; l <= newLevel; l++) {
      unlocks.push(...getUnlocksForLevel(l))
    }
    return unlocks
  }

  buildUnlockRecords(childId: string, rewards: UnlockReward[], source: string): ChildUnlock[] {
    return rewards.map((r) => ({
      id: crypto.randomUUID(),
      child_id: childId,
      unlock_type: r.type as UnlockType,
      unlock_key: r.key,
      source,
      created_at: new Date().toISOString(),
    }))
  }

  buildInventory(childId: string): ChildInventory[] {
    return DEFAULT_INVENTORY.map((item) => ({
      id: crypto.randomUUID(),
      child_id: childId,
      item_type: item.itemType as ItemType,
      item_key: item.itemKey,
      quantity: item.quantity,
      created_at: new Date().toISOString(),
    }))
  }

  addUnlocksToInventory(
    existing: ChildInventory[],
    unlocks: UnlockReward[],
  ): ChildInventory[] {
    const inventory = [...existing]
    for (const unlock of unlocks) {
      const existingItem = inventory.find((i) => i.item_key === unlock.key)
      if (existingItem) {
        existingItem.quantity += 1
      } else {
        inventory.push({
          id: crypto.randomUUID(),
          child_id: "",
          item_type: unlock.type as ItemType,
          item_key: unlock.key,
          quantity: 1,
          created_at: new Date().toISOString(),
        })
      }
    }
    return inventory
  }

  isUnlocked(inventory: ChildInventory[], unlocks: ChildUnlock[], itemType: ItemType, itemKey: string): boolean {
    return (
      inventory.some((i) => i.item_key === itemKey && i.quantity > 0) ||
      unlocks.some((u) => u.unlock_key === itemKey && u.unlock_type === itemType) ||
      DEFAULT_UNLOCKS.some((d) => d.key === itemKey)
    )
  }

  getOwnedItems(inventory: ChildInventory[]): string[] {
    return inventory.filter((i) => i.quantity > 0).map((i) => i.item_key)
  }

  getUnlockedKeys(unlocks: ChildUnlock[]): string[] {
    return unlocks.map((u) => u.unlock_key)
  }
}

export const unlockEngine = new UnlockEngine()

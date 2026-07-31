import type { UnlockReward, ChildInventory, ChildUnlock } from "./progression.types"
import { unlockEngine } from "./unlock-engine"

export interface LevelUpRewards {
  unlocks: UnlockReward[]
  inventory: ChildInventory[]
}

export class RewardsEngine {
  collectRewards(
    previousLevel: number,
    newLevel: number,
    currentInventory: ChildInventory[],
  ): LevelUpRewards {
    const unlocks = unlockEngine.computeUnlocksForLevelUp(previousLevel, newLevel)
    const inventory = unlockEngine.addUnlocksToInventory(currentInventory, unlocks)
    return { unlocks, inventory }
  }

  getAvailableItems(
    inventory: ChildInventory[],
    unlocks: ChildUnlock[],
    itemType: string,
  ): string[] {
    const owned = unlockEngine.getOwnedItems(inventory)
    const unlocked = unlockEngine.getUnlockedKeys(unlocks)
    const all = new Set([...owned, ...unlocked])
    return Array.from(all)
  }
}

export const rewardsEngine = new RewardsEngine()

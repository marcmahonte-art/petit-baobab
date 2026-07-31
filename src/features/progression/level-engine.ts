import {
  xpRequiredForLevel,
  getCumulativeXp,
  getTitleForLevel,
  getLevelInfo,
  getNextRewardForLevel,
} from "./progression.constants"
import type { LevelInfo, LevelTitle, UnlockReward } from "./progression.types"

export interface LevelProgress {
  level: number
  title: LevelTitle
  xp: number
  xpInLevel: number
  xpRequired: number
  xpToNext: number
  progress: number
  nextReward: UnlockReward | null
}

export class LevelEngine {
  getLevelFromXp(totalXp: number): number {
    let level = 1
    let cumulative = 0
    while (level < 100) {
      const next = xpRequiredForLevel(level)
      if (cumulative + next > totalXp) break
      cumulative += next
      level++
    }
    return level
  }

  addXp(currentLevel: number, currentXp: number, xpAdded: number): { newLevel: number; newXp: number; levelUp: boolean } {
    const cumulativeStart = getCumulativeXp(currentLevel)
    const newTotalXp = cumulativeStart + currentXp + xpAdded
    const newLevel = this.getLevelFromXp(newTotalXp)
    const newCumulative = getCumulativeXp(newLevel)
    const newXp = newTotalXp - newCumulative

    return {
      newLevel,
      newXp,
      levelUp: newLevel > currentLevel,
    }
  }

  getProgress(totalXp: number): LevelProgress {
    const level = this.getLevelFromXp(totalXp)
    const cumulative = getCumulativeXp(level)
    const xpInLevel = totalXp - cumulative
    const xpRequired = xpRequiredForLevel(level)
    const title = getTitleForLevel(level)
    const nextReward = getNextRewardForLevel(level + 1)

    return {
      level,
      title,
      xp: xpInLevel,
      xpInLevel,
      xpRequired,
      xpToNext: Math.max(xpRequired - xpInLevel, 0),
      progress: Math.min(xpInLevel / xpRequired, 1),
      nextReward,
    }
  }

  getLevelInfo(level: number): LevelInfo {
    return getLevelInfo(level)
  }

  getMaxLevel(): number {
    return 100
  }
}

export const levelEngine = new LevelEngine()

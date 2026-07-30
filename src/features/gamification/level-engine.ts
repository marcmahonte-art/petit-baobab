import { LEVELS, MAX_LEVEL } from "./constants"
import type { Level } from "./types"

export class LevelEngine {
  addXp(currentXp: number, amount: number): { xp: number; level: number; levelUp: boolean; newRewards: { type: string; value: number | string }[] } {
    const oldLevel = this.getLevel(currentXp)
    const newXp = currentXp + amount
    const newLevel = this.getLevel(newXp)
    const levelUp = newLevel.level > oldLevel.level

    const newRewards: { type: string; value: number | string }[] = []
    if (levelUp) {
      for (let l = oldLevel.level + 1; l <= newLevel.level; l++) {
        const levelData = LEVELS[l]
        if (levelData?.rewards) {
          newRewards.push(...levelData.rewards)
        }
      }
    }

    return { xp: newXp, level: newLevel.level, levelUp, newRewards }
  }

  getLevel(xp: number): Level {
    for (let i = MAX_LEVEL; i >= 1; i--) {
      if (xp >= LEVELS[i].cumulativeXp) {
        return LEVELS[i]
      }
    }
    return LEVELS[1]
  }

  getProgress(currentXp: number): { level: number; xpInLevel: number; xpForNext: number; progress: number } {
    const current = this.getLevel(currentXp)
    if (current.level >= MAX_LEVEL) {
      return { level: MAX_LEVEL, xpInLevel: 0, xpForNext: 0, progress: 1 }
    }
    const next = LEVELS[current.level + 1]
    const xpInLevel = currentXp - current.cumulativeXp
    return { level: current.level, xpInLevel, xpForNext: next.xpRequired, progress: Math.min(xpInLevel / next.xpRequired, 1) }
  }

  getXpToNextLevel(currentXp: number): number {
    const current = this.getLevel(currentXp)
    if (current.level >= MAX_LEVEL) return 0
    return LEVELS[current.level + 1].xpRequired - (currentXp - current.cumulativeXp)
  }

  getLevelRewards(level: number): { type: string; value: number | string }[] {
    return LEVELS[level]?.rewards ?? []
  }
}

export const levelEngine = new LevelEngine()

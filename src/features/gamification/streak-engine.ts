import type { Streak } from "./types"

export class StreakEngine {
  private streaks = new Map<string, Streak>()

  get(childId: string): Streak {
    return this.streaks.get(childId) ?? { currentStreak: 0, longestStreak: 0, lastActivityDate: null }
  }

  record(childId: string): { streak: Streak; streakBonus: { xp: number; stars: number }; newMilestone: boolean } {
    const today = new Date().toISOString().split("T")[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0]

    const streak = this.get(childId)
    const oldStreak = streak.currentStreak

    if (streak.lastActivityDate === today) {
      return { streak, streakBonus: this.getBonus(streak.currentStreak), newMilestone: false }
    }

    if (streak.lastActivityDate === yesterday) {
      streak.currentStreak += 1
    } else {
      streak.currentStreak = 1
    }

    if (streak.currentStreak > streak.longestStreak) {
      streak.longestStreak = streak.currentStreak
    }

    streak.lastActivityDate = today
    this.streaks.set(childId, streak)

    const { STREAK_BONUSES } = require("./constants")
    const newMilestone = STREAK_BONUSES.some((b: { days: number }) => b.days === streak.currentStreak) && oldStreak < streak.currentStreak

    return { streak, streakBonus: this.getBonus(streak.currentStreak), newMilestone }
  }

  private getBonus(currentStreak: number): { xp: number; stars: number } {
    const { STREAK_BONUSES } = require("./constants")
    let bonus = { xp: 0, stars: 0 }
    for (const b of STREAK_BONUSES) {
      if (currentStreak >= b.days) bonus = { xp: b.xp, stars: b.stars }
    }
    return bonus
  }

  set(childId: string, data: { currentStreak: number; longestStreak: number; lastActivityDate: string | null }): void {
    this.streaks.set(childId, { currentStreak: data.currentStreak, longestStreak: data.longestStreak, lastActivityDate: data.lastActivityDate })
  }
}

export const streakEngine = new StreakEngine()

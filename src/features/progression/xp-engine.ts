import type { GameEventType } from "../gamification/types"
import {
  XP_PER_EVENT,
  FIRST_ACTIVITY_DAY_BONUS,
  SEVEN_DAY_STREAK_BONUS,
  getFirstActivityBonusEligible,
} from "./progression.constants"
import type { XpResult } from "./progression.types"

export class XpEngine {
  private firstActivityOfDay = new Map<string, string>()

  isFirstActivityOfDay(childId: string, today: string): boolean {
    return this.firstActivityOfDay.get(childId) !== today
  }

  markFirstActivityOfDay(childId: string, today: string): void {
    this.firstActivityOfDay.set(childId, today)
  }

  compute(childId: string, event: GameEventType, streakDays: number): XpResult {
    const baseXp = XP_PER_EVENT[event] ?? 0
    const bonuses: { label: string; xp: number }[] = []

    let totalXp = baseXp

    const today = new Date().toISOString().split("T")[0]

    if (getFirstActivityBonusEligible(event) && this.isFirstActivityOfDay(childId, today)) {
      bonuses.push({ label: "Première activité du jour", xp: FIRST_ACTIVITY_DAY_BONUS })
      totalXp += FIRST_ACTIVITY_DAY_BONUS
      this.markFirstActivityOfDay(childId, today)
    }

    if (streakDays >= 7) {
      bonuses.push({ label: "Série de 7 jours", xp: SEVEN_DAY_STREAK_BONUS })
      totalXp += SEVEN_DAY_STREAK_BONUS
    }

    return { xp: totalXp, event, bonuses }
  }
}

export const xpEngine = new XpEngine()
